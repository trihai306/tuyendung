<?php

namespace App\Jobs;

use App\Events\ZaloLoginProgress;
use App\Models\ZaloAccount;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;

/**
 * ZaloLoginJob - Handles QR login via CLI with Soketi broadcast
 * 
 * Usage:
 *   $sessionId = Str::uuid();
 *   ZaloLoginJob::dispatch($sessionId, $companyId);
 *   return ['session_id' => $sessionId]; // Frontend listens to this channel
 */
class ZaloLoginJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 120; // 2 minutes max
    public int $tries = 1;

    public function __construct(
        public string $sessionId,
        public int $companyId
    ) {
        $this->onQueue('zalo');
    }

    public function handle(): void
    {
        $cliPath = env('ZALO_CLI_PATH', base_path('../zalo-service/cli/index.js'));

        Log::info('ZaloLoginJob: Starting QR login', [
            'sessionId' => $this->sessionId,
            'companyId' => $this->companyId,
        ]);

        // Broadcast that we're starting
        broadcast(new ZaloLoginProgress(
            sessionId: $this->sessionId,
            stage: 'starting',
            message: 'Đang khởi tạo đăng nhập...'
        ));

        try {
            $output = '';

            // Run CLI login command with real-time output processing
            $result = Process::timeout($this->timeout)
                ->path(dirname($cliPath))
                ->run("node {$cliPath} login --timeout=60", function (string $type, string $buffer) use (&$output) {
                    $output .= $buffer;

                    // Process each JSON line
                    $lines = explode("\n", $buffer);
                    foreach ($lines as $line) {
                        $line = trim($line);
                        if (empty($line))
                            continue;

                        $data = json_decode($line, true);
                        if (!$data)
                            continue;

                        $this->processStage($data);
                    }
                });

            if (!$result->successful()) {
                Log::error('ZaloLoginJob: CLI failed', [
                    'exitCode' => $result->exitCode(),
                    'output' => $output,
                ]);

                broadcast(new ZaloLoginProgress(
                    sessionId: $this->sessionId,
                    stage: 'login_failed',
                    error: 'Đăng nhập thất bại. Vui lòng thử lại.'
                ));
            }

        } catch (\Exception $e) {
            Log::error('ZaloLoginJob: Exception', [
                'error' => $e->getMessage(),
            ]);

            broadcast(new ZaloLoginProgress(
                sessionId: $this->sessionId,
                stage: 'login_failed',
                error: $e->getMessage()
            ));
        }
    }

    private function processStage(array $data): void
    {
        $stage = $data['stage'] ?? null;

        switch ($stage) {
            case 'qr_generated':
                broadcast(new ZaloLoginProgress(
                    sessionId: $this->sessionId,
                    stage: 'qr_generated',
                    qrCode: $data['qrCode'] ?? null,
                    message: $data['message'] ?? 'Quét mã QR bằng ứng dụng Zalo'
                ));
                break;

            case 'login_success':
                $accountData = $data['data'] ?? [];

                // Save to database
                $account = ZaloAccount::updateOrCreate(
                    ['own_id' => $accountData['ownId'] ?? ''],
                    [
                        'company_id' => $this->companyId,
                        'display_name' => $accountData['displayName'] ?? 'Unknown',
                        'phone' => $accountData['phone'] ?? null,
                        'avatar' => $accountData['avatar'] ?? null,
                        'is_connected' => true,
                    ]
                );

                broadcast(new ZaloLoginProgress(
                    sessionId: $this->sessionId,
                    stage: 'login_success',
                    data: [
                        'id' => $account->id,
                        'own_id' => $account->own_id,
                        'display_name' => $account->display_name,
                        'phone' => $account->phone,
                        'avatar' => $account->avatar,
                    ],
                    message: 'Đăng nhập thành công!'
                ));

                Log::info('ZaloLoginJob: Login success', [
                    'ownId' => $accountData['ownId'] ?? null,
                    'displayName' => $accountData['displayName'] ?? null,
                ]);
                break;

            default:
                // Forward any other stages
                if ($stage) {
                    broadcast(new ZaloLoginProgress(
                        sessionId: $this->sessionId,
                        stage: $stage,
                        message: $data['message'] ?? null,
                        error: $data['error'] ?? null
                    ));
                }
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('ZaloLoginJob: Job failed', [
            'sessionId' => $this->sessionId,
            'error' => $exception->getMessage(),
        ]);

        broadcast(new ZaloLoginProgress(
            sessionId: $this->sessionId,
            stage: 'login_failed',
            error: 'Đăng nhập thất bại: ' . $exception->getMessage()
        ));
    }
}
