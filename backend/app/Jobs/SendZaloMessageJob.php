<?php

namespace App\Jobs;

use App\Services\ZaloService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * SendZaloMessageJob - Async Zalo message sending via CLI
 * 
 * Usage:
 *   SendZaloMessageJob::dispatch($accountId, $threadId, $message, $type);
 */
class SendZaloMessageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 5;
    public int $timeout = 60;

    public function __construct(
        public string $ownId,
        public string $threadId,
        public string $message,
        public string $type = 'user'
    ) {
        $this->onQueue('zalo');
    }

    public function handle(ZaloService $zaloService): void
    {
        Log::info('SendZaloMessageJob: Sending message', [
            'ownId' => $this->ownId,
            'threadId' => $this->threadId,
            'type' => $this->type,
        ]);

        $result = $zaloService->sendMessage(
            $this->ownId,
            $this->threadId,
            $this->message,
            $this->type
        );

        if (!$result['success']) {
            Log::error('SendZaloMessageJob: Failed', [
                'error' => $result['error'] ?? 'Unknown error',
                'ownId' => $this->ownId,
                'threadId' => $this->threadId,
            ]);

            // Release back to queue for retry
            if ($this->attempts() < $this->tries) {
                $this->release($this->backoff);
                return;
            }

            $this->fail(new \Exception($result['error'] ?? 'Failed to send Zalo message'));
            return;
        }

        Log::info('SendZaloMessageJob: Success', [
            'ownId' => $this->ownId,
            'threadId' => $this->threadId,
            'messageId' => $result['data']['messageId'] ?? null,
        ]);
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('SendZaloMessageJob: Job failed permanently', [
            'ownId' => $this->ownId,
            'threadId' => $this->threadId,
            'error' => $exception->getMessage(),
        ]);
    }
}
