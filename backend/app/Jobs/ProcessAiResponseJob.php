<?php

namespace App\Jobs;

use App\Models\Message;
use App\Models\Conversation;
use App\Services\AI\AiAgentService;
use App\Services\InboxService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessAiResponseJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(
        public Conversation $conversation,
        public Message $message
    ) {
    }

    public function handle(AiAgentService $aiService, InboxService $inboxService): void
    {
        try {
            $result = $aiService->processMessage($this->conversation, $this->message);

            if (!$result) {
                Log::warning('AI response generation failed', [
                    'conversation_id' => $this->conversation->id,
                ]);
                return;
            }

            if ($result['auto_send'] && !$result['needs_review']) {
                // Auto-send response
                $inboxService->sendMessage(
                    $this->conversation,
                    [
                        'content' => $result['content'],
                        'content_type' => 'text',
                    ],
                    0 // System sender
                );

                Log::info('AI auto-sent response', [
                    'conversation_id' => $this->conversation->id,
                    'confidence' => $result['confidence'],
                ]);
            } else {
                // Queue for human review
                $this->queueForReview($result);

                Log::info('AI response queued for review', [
                    'conversation_id' => $this->conversation->id,
                    'confidence' => $result['confidence'],
                ]);
            }
        } catch (\Exception $e) {
            Log::error('ProcessAiResponseJob failed', [
                'conversation_id' => $this->conversation->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    private function queueForReview(array $result): void
    {
        // Store pending AI response for recruiter review
        Message::create([
            'conversation_id' => $this->conversation->id,
            'direction' => 'outbound',
            'sender_type' => 'bot',
            'content_type' => 'text',
            'content' => $result['content'],
            'status' => 'pending_review',
            'ai_generated' => true,
            'ai_session_id' => $result['session_id'],
            'metadata' => [
                'confidence' => $result['confidence'],
                'needs_review' => true,
            ],
        ]);
    }
}
