<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\Channel;
use App\Models\Message;
use App\Events\MessageReceived;
use App\Events\ConversationUpdated;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class InboxService
{
    public function getConversations(
        int $userId,
        array $filters = [],
        int $perPage = 20
    ): LengthAwarePaginator {
        $query = Conversation::query()
            ->whereHas('channel.platformAccount', fn($q) => $q->where('user_id', $userId))
            ->with(['channel.platformAccount', 'assignedUser', 'latestMessage'])
            ->orderByDesc('last_message_at');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['channel_id'])) {
            $query->where('channel_id', $filters['channel_id']);
        }

        if (!empty($filters['assigned_to'])) {
            $query->where('assigned_to', $filters['assigned_to']);
        }

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('participant_name', 'like', "%{$filters['search']}%")
                    ->orWhere('last_message_preview', 'like', "%{$filters['search']}%");
            });
        }

        if (!empty($filters['tags'])) {
            $query->whereJsonContains('tags', $filters['tags']);
        }

        return $query->paginate($perPage);
    }

    public function getMessages(int $conversationId, int $perPage = 50): LengthAwarePaginator
    {
        return Message::where('conversation_id', $conversationId)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function sendMessage(Conversation $conversation, array $data, int $senderId): Message
    {
        return DB::transaction(function () use ($conversation, $data, $senderId) {
            $message = Message::create([
                'conversation_id' => $conversation->id,
                'direction' => 'outbound',
                'sender_type' => 'agent',
                'sender_id' => (string) $senderId,
                'content_type' => $data['content_type'] ?? 'text',
                'content' => $data['content'],
                'attachments' => $data['attachments'] ?? null,
                'status' => 'pending',
                'idempotency_key' => $data['idempotency_key'] ?? uniqid('msg_', true),
            ]);

            $conversation->update([
                'last_message_at' => now(),
                'last_message_preview' => substr($data['content'], 0, 200),
            ]);

            // Dispatch job to send via platform API
            // SendMessageJob::dispatch($message);

            return $message;
        });
    }

    public function assignConversation(Conversation $conversation, int $userId): Conversation
    {
        $conversation->update([
            'assigned_to' => $userId,
            'assigned_at' => now(),
        ]);

        event(new ConversationUpdated($conversation));

        return $conversation->fresh();
    }

    public function updateTags(Conversation $conversation, array $tags): Conversation
    {
        $conversation->update(['tags' => $tags]);
        event(new ConversationUpdated($conversation));

        return $conversation->fresh();
    }

    public function processIncomingMessage(array $webhookData): Message
    {
        return DB::transaction(function () use ($webhookData) {
            $channel = Channel::where('channel_id', $webhookData['channel_id'])->firstOrFail();

            $conversation = Conversation::firstOrCreate(
                [
                    'channel_id' => $channel->id,
                    'participant_id' => $webhookData['sender_id'],
                ],
                [
                    'participant_name' => $webhookData['sender_name'] ?? null,
                    'participant_avatar' => $webhookData['sender_avatar'] ?? null,
                    'status' => 'open',
                ]
            );

            $message = Message::create([
                'conversation_id' => $conversation->id,
                'external_message_id' => $webhookData['message_id'] ?? null,
                'direction' => 'inbound',
                'sender_type' => 'customer',
                'sender_id' => $webhookData['sender_id'],
                'sender_name' => $webhookData['sender_name'] ?? null,
                'content_type' => $webhookData['content_type'] ?? 'text',
                'content' => $webhookData['content'],
                'attachments' => $webhookData['attachments'] ?? null,
                'platform_timestamp' => $webhookData['timestamp'] ?? now(),
                'idempotency_key' => $webhookData['message_id'] ?? uniqid('in_', true),
            ]);

            $conversation->update([
                'last_message_at' => now(),
                'last_message_preview' => substr($webhookData['content'], 0, 200),
                'unread_count' => DB::raw('unread_count + 1'),
            ]);

            event(new MessageReceived($message, $conversation));

            return $message;
        });
    }
}
