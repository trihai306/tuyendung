<?php

namespace App\Services\AI;

use App\Models\AiSession;
use App\Models\AiAuditLog;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\RecruitmentJob;
use App\Models\KnowledgeDocument;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiAgentService
{
    private const CONFIDENCE_THRESHOLD = 0.9;

    private array $tools = [
        'get_job_info' => 'Lấy thông tin chi tiết về công việc đang tuyển',
        'check_job_requirements' => 'Kiểm tra yêu cầu của công việc',
        'schedule_interview' => 'Lên lịch phỏng vấn cho ứng viên',
        'create_candidate' => 'Tạo hồ sơ ứng viên mới từ thông tin chat',
        'suggest_response' => 'Gợi ý câu trả lời cho recruiter',
        'search_knowledge' => 'Tìm kiếm trong knowledge base',
    ];

    public function __construct(
        private string $apiKey = '',
        private string $model = 'gpt-4o-mini'
    ) {
        $this->apiKey = config('services.openai.api_key', '');
    }

    /**
     * Process incoming message and generate AI response
     */
    public function processMessage(Conversation $conversation, Message $message): ?array
    {
        $session = $this->getOrCreateSession($conversation);
        $startTime = microtime(true);

        try {
            // Build context
            $context = $this->buildContext($session, $conversation, $message);

            // Get AI response
            $response = $this->callLLM($context);

            // Parse tool calls if any
            $toolCalls = $this->parseToolCalls($response);
            $toolOutputs = [];

            foreach ($toolCalls as $toolCall) {
                $output = $this->executeTool($toolCall['name'], $toolCall['arguments'], $session);
                $toolOutputs[$toolCall['name']] = $output;
            }

            // Generate final response
            $finalResponse = $this->generateFinalResponse($context, $response, $toolOutputs);
            $confidenceScore = $this->calculateConfidence($finalResponse, $conversation);

            // Log audit
            $this->logAudit($session, $message, [
                'action_type' => 'generate_response',
                'input_prompt' => $context['messages'],
                'tool_calls' => $toolCalls,
                'tool_outputs' => $toolOutputs,
                'generated_response' => $finalResponse['content'],
                'confidence_score' => $confidenceScore,
                'processing_time_ms' => (microtime(true) - $startTime) * 1000,
                'token_usage' => $response['usage'] ?? [],
            ]);

            // Update session context
            $session->updateContext([
                'last_message_id' => $message->id,
                'last_response' => substr($finalResponse['content'], 0, 500),
            ]);

            return [
                'content' => $finalResponse['content'],
                'confidence' => $confidenceScore,
                'auto_send' => $confidenceScore >= self::CONFIDENCE_THRESHOLD,
                'needs_review' => $confidenceScore < self::CONFIDENCE_THRESHOLD,
                'session_id' => $session->id,
            ];
        } catch (\Exception $e) {
            Log::error('AI Agent error', [
                'conversation_id' => $conversation->id,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Get or create AI session for conversation
     */
    private function getOrCreateSession(Conversation $conversation): AiSession
    {
        $session = $conversation->aiSession;

        if (!$session) {
            $session = AiSession::create([
                'conversation_id' => $conversation->id,
                'job_id' => $this->detectRelatedJob($conversation),
                'mode' => 'auto_reply',
                'status' => 'active',
                'context' => [
                    'started_at' => now()->toISOString(),
                    'message_count' => 0,
                ],
            ]);
        }

        return $session;
    }

    /**
     * Build context for LLM
     */
    private function buildContext(AiSession $session, Conversation $conversation, Message $message): array
    {
        $recentMessages = $conversation->messages()
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->reverse();

        $jobContext = '';
        if ($session->job) {
            $jobContext = $this->buildJobContext($session->job);
        }

        $knowledgeContext = $this->searchKnowledge($message->content, $session->job_id);

        $systemPrompt = <<<PROMPT
Bạn là AI trợ lý tuyển dụng chuyên nghiệp. Nhiệm vụ của bạn là:
1. Trả lời câu hỏi của ứng viên về công việc
2. Thu thập thông tin ứng viên (tên, email, số điện thoại, kinh nghiệm)
3. Hướng dẫn ứng viên quy trình ứng tuyển
4. Lên lịch phỏng vấn khi phù hợp

Nguyên tắc:
- Luôn lịch sự, chuyên nghiệp
- Trả lời ngắn gọn, đúng trọng tâm
- Không hứa hẹn những điều ngoài thẩm quyền
- Khi không chắc chắn, đề nghị kết nối với recruiter

{$jobContext}

{$knowledgeContext}
PROMPT;

        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
        ];

        foreach ($recentMessages as $msg) {
            $role = $msg->direction === 'inbound' ? 'user' : 'assistant';
            $messages[] = ['role' => $role, 'content' => $msg->content];
        }

        return [
            'model' => $this->model,
            'messages' => $messages,
            'temperature' => 0.7,
            'max_tokens' => 500,
        ];
    }

    /**
     * Build job context string
     */
    private function buildJobContext(RecruitmentJob $job): string
    {
        return <<<JOB
### Thông tin công việc đang tuyển:
- Vị trí: {$job->title}
- Bộ phận: {$job->department}
- Địa điểm: {$job->location}
- Loại hình: {$job->job_type}
- Mức lương: {$job->salary_range}

Mô tả công việc:
{$job->description}

Yêu cầu:
{$job->requirements}

Quyền lợi:
{$job->benefits}
JOB;
    }

    /**
     * Search knowledge base
     */
    private function searchKnowledge(string $query, ?int $jobId): string
    {
        $documents = KnowledgeDocument::query()
            ->where('status', 'active')
            ->where(function ($q) use ($jobId) {
                $q->whereNull('job_id')
                    ->orWhere('job_id', $jobId);
            })
            ->limit(3)
            ->get();

        if ($documents->isEmpty()) {
            return '';
        }

        $context = "### Thông tin tham khảo:\n";
        foreach ($documents as $doc) {
            $context .= "- {$doc->title}: " . substr($doc->content, 0, 300) . "...\n";
        }

        return $context;
    }

    /**
     * Call LLM API
     */
    private function callLLM(array $context): array
    {
        if (empty($this->apiKey)) {
            return [
                'choices' => [
                    [
                        'message' => [
                            'content' => 'Cảm ơn bạn đã quan tâm. Tôi sẽ chuyển thông tin đến bộ phận tuyển dụng để hỗ trợ bạn.',
                        ],
                    ]
                ],
                'usage' => ['total_tokens' => 0],
            ];
        }

        $response = Http::withToken($this->apiKey)
            ->timeout(30)
            ->post('https://api.openai.com/v1/chat/completions', $context);

        if (!$response->successful()) {
            throw new \Exception('LLM API call failed: ' . $response->body());
        }

        return $response->json();
    }

    /**
     * Parse tool calls from LLM response
     */
    private function parseToolCalls(array $response): array
    {
        $message = $response['choices'][0]['message'] ?? [];
        return $message['tool_calls'] ?? [];
    }

    /**
     * Execute AI tool
     */
    private function executeTool(string $toolName, array $arguments, AiSession $session): mixed
    {
        return match ($toolName) {
            'get_job_info' => $this->toolGetJobInfo($session),
            'check_job_requirements' => $this->toolCheckRequirements($session, $arguments),
            'schedule_interview' => $this->toolScheduleInterview($session, $arguments),
            'create_candidate' => $this->toolCreateCandidate($session, $arguments),
            default => null,
        };
    }

    private function toolGetJobInfo(AiSession $session): ?array
    {
        if (!$session->job)
            return null;

        return [
            'title' => $session->job->title,
            'department' => $session->job->department,
            'location' => $session->job->location,
            'salary_range' => $session->job->salary_range,
        ];
    }

    private function toolCheckRequirements(AiSession $session, array $args): array
    {
        return ['requirements' => $session->job?->requirements ?? 'Không có yêu cầu cụ thể'];
    }

    private function toolScheduleInterview(AiSession $session, array $args): array
    {
        return ['status' => 'pending_confirmation', 'suggested_time' => $args['time'] ?? null];
    }

    private function toolCreateCandidate(AiSession $session, array $args): array
    {
        return ['status' => 'candidate_info_collected', 'data' => $args];
    }

    /**
     * Generate final response
     */
    private function generateFinalResponse(array $context, array $llmResponse, array $toolOutputs): array
    {
        $content = $llmResponse['choices'][0]['message']['content'] ?? '';

        return [
            'content' => $content,
            'tool_outputs' => $toolOutputs,
        ];
    }

    /**
     * Calculate confidence score
     */
    private function calculateConfidence(array $response, Conversation $conversation): float
    {
        $score = 0.5;

        // Higher confidence if we have job context
        if ($conversation->candidate_id) {
            $score += 0.2;
        }

        // Check response quality indicators
        $content = $response['content'];
        if (strlen($content) > 50 && strlen($content) < 500) {
            $score += 0.1;
        }

        // Lower confidence for questions or uncertainty
        if (str_contains($content, '?') || str_contains($content, 'không chắc')) {
            $score -= 0.2;
        }

        return max(0, min(1, $score));
    }

    /**
     * Detect related job from conversation
     */
    private function detectRelatedJob(Conversation $conversation): ?int
    {
        // Try to find from conversation tags or recent context
        return null;
    }

    /**
     * Log AI audit
     */
    private function logAudit(AiSession $session, Message $message, array $data): void
    {
        AiAuditLog::create([
            'ai_session_id' => $session->id,
            'message_id' => $message->id,
            'action_type' => $data['action_type'],
            'input_prompt' => json_encode($data['input_prompt']),
            'tool_name' => !empty($data['tool_calls']) ? $data['tool_calls'][0]['name'] ?? null : null,
            'tool_input' => $data['tool_calls'],
            'tool_output' => $data['tool_outputs'],
            'generated_response' => $data['generated_response'],
            'confidence_score' => $data['confidence_score'],
            'processing_time_ms' => $data['processing_time_ms'],
            'token_usage' => $data['token_usage'],
        ]);
    }
}
