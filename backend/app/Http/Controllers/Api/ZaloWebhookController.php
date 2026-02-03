<?php

namespace App\Http\Controllers\Api;

use App\Events\ZaloAccountStatusChanged;
use App\Events\ZaloMessageReceived;
use App\Http\Controllers\Controller;
use App\Jobs\FetchZaloUserProfileJob;
use App\Models\ZaloAccount;
use App\Models\ZaloMessage;
use App\Models\ZaloUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * ZaloWebhookController
 * 
 * Receives webhook events from zalo-service.
 * Events include: message:received, group:event, message:reaction, account:login
 */
class ZaloWebhookController extends Controller
{
    /**
     * Main webhook handler for all events from zalo-service
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();
        $event = $payload['event'] ?? 'unknown';
        $data = $payload['data'] ?? [];

        Log::info('Zalo webhook received', [
            'event' => $event,
            'data' => $data,
        ]);

        return match ($event) {
            'message:received' => $this->handleMessageReceived($data),
            'message:sent' => $this->handleMessageSent($data),
            'group:event' => $this->handleGroupEvent($data),
            'message:reaction' => $this->handleReaction($data),
            'account:login' => $this->handleAccountLogin($data),
            'account:connected' => $this->handleAccountConnected($data),
            'account:disconnected' => $this->handleAccountDisconnected($data),
            default => response()->json(['success' => true, 'message' => 'Event ignored']),
        };
    }

    /**
     * Handle incoming message
     */
    protected function handleMessageReceived(array $data): JsonResponse
    {
        // Accept both 'accountId' (from main service) and 'ownId' (from daemon)
        $accountId = $data['accountId'] ?? $data['ownId'] ?? null;

        if (!$accountId) {
            return response()->json(['error' => 'Missing account ID'], 400);
        }

        // Find or create account
        $zaloAccount = ZaloAccount::where('own_id', $accountId)->first();

        if ($zaloAccount) {
            $zaloAccount->update(['last_active_at' => now()]);
        }

        $senderId = $data['senderId'] ?? '';
        $threadId = $data['threadId'] ?? '';
        $threadType = $data['threadType'] ?? 'user';
        $senderName = $data['senderName'] ?? 'Unknown';

        // Auto-sync: Check if sender is already cached
        $cachedUser = null;
        if ($senderId) {
            $cachedUser = ZaloUser::where('zalo_user_id', $senderId)->first();

            // If not cached or stale, dispatch job to fetch profile
            if (!$cachedUser || $cachedUser->isStale()) {
                FetchZaloUserProfileJob::dispatch(
                    $accountId,
                    $senderId,
                    $threadId,
                    $threadType
                )->onQueue('zalo-sync');
            } else {
                // Use cached name if available
                $senderName = $cachedUser->display_name ?: $cachedUser->zalo_name ?: $senderName;
            }
        }

        // Store message in database
        ZaloMessage::create([
            'zalo_account_id' => $zaloAccount?->id,
            'external_account_id' => $accountId,
            'thread_id' => $threadId,
            'thread_type' => $threadType,
            'sender_id' => $senderId,
            'sender_name' => $senderName,
            'content' => $data['content'] ?? '',
            'direction' => $data['direction'] ?? 'inbound',
            'raw_data' => $data['raw'] ?? null,
            'received_at' => $data['timestamp'] ?? now(),
        ]);

        // Broadcast to frontend via Soketi
        broadcast(new ZaloMessageReceived($data))->toOthers();

        Log::info('Zalo message stored and broadcasted', [
            'account' => $accountId,
            'thread' => $threadId,
            'from' => $senderName,
            'profile_cached' => $cachedUser !== null,
        ]);

        return response()->json(['success' => true, 'message' => 'Message received']);
    }

    /**
     * Handle outbound message (sent by user)
     */
    protected function handleMessageSent(array $data): JsonResponse
    {
        $accountId = $data['accountId'] ?? $data['ownId'] ?? null;

        if (!$accountId) {
            return response()->json(['error' => 'Missing account ID'], 400);
        }

        // Find account
        $zaloAccount = ZaloAccount::where('own_id', $accountId)->first();

        if ($zaloAccount) {
            $zaloAccount->update(['last_active_at' => now()]);
        }

        // Store outbound message in database
        ZaloMessage::create([
            'zalo_account_id' => $zaloAccount?->id,
            'external_account_id' => $accountId,
            'thread_id' => $data['threadId'] ?? '',
            'thread_type' => $data['threadType'] ?? 'user',
            'sender_id' => $accountId, // Sender is self
            'sender_name' => $zaloAccount?->display_name ?? 'Me',
            'content' => $data['content'] ?? '',
            'direction' => 'outbound',
            'raw_data' => null,
            'received_at' => $data['timestamp'] ?? now(),
        ]);

        // Broadcast to frontend via Soketi
        broadcast(new ZaloMessageReceived($data))->toOthers();

        Log::info('Zalo outbound message stored', [
            'account' => $accountId,
            'thread' => $data['threadId'] ?? 'unknown',
        ]);

        return response()->json(['success' => true, 'message' => 'Outbound message stored']);
    }

    /**
     * Handle group event
     */
    protected function handleGroupEvent(array $data): JsonResponse
    {
        $accountId = $data['accountId'] ?? null;
        $event = $data['event'] ?? [];

        Log::info('Zalo group event', [
            'account' => $accountId,
            'event' => $event,
        ]);

        // Could sync group info here if needed

        return response()->json(['success' => true, 'message' => 'Group event received']);
    }

    /**
     * Handle reaction
     */
    protected function handleReaction(array $data): JsonResponse
    {
        Log::info('Zalo reaction', $data);

        return response()->json(['success' => true, 'message' => 'Reaction received']);
    }

    /**
     * Handle account login - save to database and broadcast
     * Auto-assigns account to the user who scanned QR code
     */
    protected function handleAccountLogin(array $data): JsonResponse
    {
        $accountId = $data['ownId'] ?? null;
        $sessionId = $data['sessionId'] ?? null;

        if (!$accountId) {
            return response()->json(['error' => 'Missing account ID'], 400);
        }

        // Try to get user_id from cached session (set during QR generation)
        $sessionData = null;
        if ($sessionId) {
            $sessionData = \Illuminate\Support\Facades\Cache::pull("zalo_session:{$sessionId}");
        }

        // Find existing account - don't create new ones from daemon webhook
        // New accounts are only created via QR login flow (ZaloLoginJob)
        $zaloAccount = ZaloAccount::where('own_id', $accountId)->first();

        if (!$zaloAccount) {
            // Account doesn't exist in DB (was deleted or never created via QR)
            // Skip - don't recreate from daemon restart
            Log::info('Zalo webhook: Account not in DB, skipping', ['own_id' => $accountId]);
            return response()->json([
                'success' => false,
                'message' => 'Account not found in database',
            ], 404);
        }

        // Update existing account
        $zaloAccount->update([
            'display_name' => $data['displayName'] ?? $zaloAccount->display_name,
            'phone' => $data['phone'] ?? $zaloAccount->phone,
            'avatar' => $data['avatar'] ?? $zaloAccount->avatar,
            'status' => 'connected',
            'last_active_at' => now(),
            // Only update user/company if session data exists (from QR login)
            'user_id' => $sessionData['user_id'] ?? $zaloAccount->user_id,
            'company_id' => $sessionData['company_id'] ?? $zaloAccount->company_id,
        ]);

        // Broadcast account login event
        broadcast(new ZaloAccountStatusChanged($accountId, 'login', [
            'displayName' => $data['displayName'] ?? null,
            'phone' => $data['phone'] ?? null,
            'avatar' => $data['avatar'] ?? null,
            'user_id' => $zaloAccount->user_id,
        ]))->toOthers();

        Log::info('Zalo account logged in and saved', [
            'account' => $accountId,
            'name' => $data['displayName'] ?? 'unknown',
            'db_id' => $zaloAccount->id,
            'auto_assigned_to_user' => $zaloAccount->user_id,
            'company_id' => $zaloAccount->company_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Account saved and broadcasted',
            'account_id' => $zaloAccount->id,
            'assigned_to_user_id' => $zaloAccount->user_id,
        ]);
    }

    /**
     * Handle account connected
     */
    protected function handleAccountConnected(array $data): JsonResponse
    {
        $accountId = $data['ownId'] ?? null;

        if (!$accountId) {
            return response()->json(['error' => 'Missing account ID'], 400);
        }

        $zaloAccount = ZaloAccount::where('own_id', $accountId)->first();
        $zaloAccount?->markAsConnected();

        broadcast(new ZaloAccountStatusChanged($accountId, 'connected'))->toOthers();

        return response()->json(['success' => true, 'message' => 'Account connected']);
    }

    /**
     * Handle account disconnected
     */
    protected function handleAccountDisconnected(array $data): JsonResponse
    {
        $accountId = $data['ownId'] ?? null;

        if (!$accountId) {
            return response()->json(['error' => 'Missing account ID'], 400);
        }

        $zaloAccount = ZaloAccount::where('own_id', $accountId)->first();
        $zaloAccount?->markAsDisconnected();

        broadcast(new ZaloAccountStatusChanged($accountId, 'disconnected'))->toOthers();

        return response()->json(['success' => true, 'message' => 'Account disconnected']);
    }

    // =====================
    // Legacy endpoints (kept for compatibility)
    // =====================

    /**
     * Handle incoming message webhook (legacy)
     */
    public function handleMessage(Request $request): JsonResponse
    {
        return $this->handleMessageReceived($request->all());
    }

    /**
     * Handle connection status updates (legacy)
     */
    public function handleStatus(Request $request): JsonResponse
    {
        $data = $request->all();
        $status = $data['status'] ?? null;

        return match ($status) {
            'connected' => $this->handleAccountConnected($data),
            'disconnected' => $this->handleAccountDisconnected($data),
            default => response()->json(['success' => true]),
        };
    }
}
