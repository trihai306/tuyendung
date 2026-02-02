<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Channel;
use App\Services\InboxService;
use App\Services\Platform\PlatformAdapterFactory;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function __construct(
        private InboxService $inboxService
    ) {
    }

    /**
     * Handle Zalo webhook verification
     */
    public function zaloVerify(Request $request): Response
    {
        // Zalo sends challenge for verification
        return response($request->input('challenge', 'ok'));
    }

    /**
     * Handle Zalo webhook events
     */
    public function zalo(Request $request): Response
    {
        Log::info('Zalo webhook received', ['payload' => $request->all()]);

        try {
            $payload = $request->all();
            $oaId = $payload['oa_id'] ?? null;

            if (!$oaId) {
                return response('Missing OA ID', 400);
            }

            $channel = Channel::where('channel_id', $oaId)->first();

            if (!$channel) {
                Log::warning('Zalo webhook: Channel not found', ['oa_id' => $oaId]);
                return response('Channel not found', 404);
            }

            $adapter = PlatformAdapterFactory::create($channel->platformAccount);
            $messageData = $adapter->parseWebhookPayload($payload);

            if (!empty($messageData)) {
                $this->inboxService->processIncomingMessage($messageData);
            }

            return response('OK');
        } catch (\Exception $e) {
            Log::error('Zalo webhook error', ['error' => $e->getMessage()]);
            return response('Error', 500);
        }
    }

    /**
     * Handle Facebook webhook verification
     */
    public function facebookVerify(Request $request): Response
    {
        $mode = $request->input('hub_mode');
        $token = $request->input('hub_verify_token');
        $challenge = $request->input('hub_challenge');

        if ($mode === 'subscribe' && $token === config('services.facebook.webhook_verify_token')) {
            return response($challenge);
        }

        return response('Forbidden', 403);
    }

    /**
     * Handle Facebook webhook events
     */
    public function facebook(Request $request): Response
    {
        Log::info('Facebook webhook received', ['payload' => $request->all()]);

        // Verify signature
        $signature = $request->header('X-Hub-Signature-256', '');
        $payload = $request->getContent();

        if (!$this->verifyFacebookSignature($signature, $payload)) {
            Log::warning('Facebook webhook: Invalid signature');
            return response('Invalid signature', 403);
        }

        try {
            $data = $request->all();

            if ($data['object'] !== 'page') {
                return response('Not a page event');
            }

            foreach ($data['entry'] ?? [] as $entry) {
                $pageId = $entry['id'] ?? null;

                if (!$pageId)
                    continue;

                $channel = Channel::where('channel_id', $pageId)->first();

                if (!$channel) {
                    Log::warning('Facebook webhook: Channel not found', ['page_id' => $pageId]);
                    continue;
                }

                $adapter = PlatformAdapterFactory::create($channel->platformAccount);

                foreach ($entry['messaging'] ?? [] as $messaging) {
                    $messageData = $adapter->parseWebhookPayload(['entry' => [$entry]]);

                    if (!empty($messageData)) {
                        $this->inboxService->processIncomingMessage($messageData);
                    }
                }
            }

            return response('OK');
        } catch (\Exception $e) {
            Log::error('Facebook webhook error', ['error' => $e->getMessage()]);
            return response('Error', 500);
        }
    }

    private function verifyFacebookSignature(string $signature, string $payload): bool
    {
        if (empty($signature)) {
            return false;
        }

        $secret = config('services.facebook.app_secret');
        $expected = 'sha256=' . hash_hmac('sha256', $payload, $secret);

        return hash_equals($expected, $signature);
    }
}
