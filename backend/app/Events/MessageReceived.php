<?php

namespace App\Events;

use App\Models\Message;
use App\Models\Conversation;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageReceived implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Message $message,
        public Conversation $conversation
    ) {
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("inbox.{$this->conversation->channel_id}"),
            new PrivateChannel("conversation.{$this->conversation->id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.received';
    }

    public function broadcastWith(): array
    {
        return [
            'message' => [
                'id' => $this->message->id,
                'conversation_id' => $this->message->conversation_id,
                'direction' => $this->message->direction,
                'sender_type' => $this->message->sender_type,
                'sender_name' => $this->message->sender_name,
                'content_type' => $this->message->content_type,
                'content' => $this->message->content,
                'attachments' => $this->message->attachments,
                'created_at' => $this->message->created_at->toISOString(),
            ],
            'conversation' => [
                'id' => $this->conversation->id,
                'unread_count' => $this->conversation->unread_count,
                'last_message_at' => $this->conversation->last_message_at->toISOString(),
            ],
        ];
    }
}
