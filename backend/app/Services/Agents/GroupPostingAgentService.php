<?php

namespace App\Services\Agents;

use App\Events\AgentTaskDispatched;
use App\Models\AgentTask;
use App\Models\ScheduledGroupPost;
use App\Models\ZaloGroup;
use App\Services\ZaloService;
use Illuminate\Support\Facades\Log;

/**
 * GroupPostingAgentService
 * 
 * Automation agent for posting to Zalo groups with scheduling support.
 * Supports two modes:
 * - Direct: Uses ZaloService directly (legacy/fallback)
 * - Agent: Dispatches to automation app via Soketi (preferred)
 */
class GroupPostingAgentService
{
    public function __construct(
        private ZaloService $zaloService
    ) {
    }

    /**
     * Dispatch a scheduled post to the automation agent via Soketi.
     * The agent will handle browser-based posting with stealth capabilities.
     */
    public function dispatchToAgent(ScheduledGroupPost $post, ?int $userId = null): AgentTask
    {
        $targetGroups = $this->resolveTargetGroups($post);

        $task = AgentTask::create([
            'company_id' => $post->company_id,
            'type' => 'post_to_groups',
            'payload' => [
                'platform' => 'zalo',
                'post_id' => $post->id,
                'content' => $post->content,
                'media_urls' => $post->media_urls ?? [],
                'groups' => array_map(fn($group) => [
                    'id' => $group->group_id,
                    'name' => $group->name,
                ], $targetGroups),
            ],
            'status' => 'pending',
            'callback_url' => url('/api/agent/task-result'),
            'created_by' => $userId ?? $post->created_by,
        ]);

        try {
            event(new AgentTaskDispatched($task));
            $task->markAsDispatched();
            $post->markAsProcessing();

            Log::info('GroupPostingAgent: Dispatched to agent', [
                'task_id' => $task->id,
                'post_id' => $post->id,
                'groups_count' => count($targetGroups),
            ]);
        } catch (\Exception $e) {
            $task->markAsFailed(['error' => 'Dispatch failed: ' . $e->getMessage()]);
            Log::error('GroupPostingAgent: Agent dispatch failed', [
                'post_id' => $post->id,
                'error' => $e->getMessage(),
            ]);
        }

        return $task;
    }

    /**
     * Process all due scheduled posts
     */
    public function processScheduledPosts(): int
    {
        $duePosts = ScheduledGroupPost::due()->get();
        $processed = 0;

        foreach ($duePosts as $post) {
            try {
                $this->executePost($post);
                $processed++;
            } catch (\Exception $e) {
                Log::error('GroupPostingAgent: Failed to execute post', [
                    'post_id' => $post->id,
                    'error' => $e->getMessage(),
                ]);
                $post->markAsFailed($e->getMessage());
            }
        }

        Log::info("GroupPostingAgent: Processed {$processed} scheduled posts");
        return $processed;
    }

    /**
     * Execute a scheduled post to multiple groups
     */
    public function executePost(ScheduledGroupPost $post): array
    {
        $post->markAsProcessing();

        $targetGroups = $this->resolveTargetGroups($post);
        $results = [];
        $successCount = 0;
        $failCount = 0;

        Log::info('GroupPostingAgent: Starting post execution', [
            'post_id' => $post->id,
            'target_count' => count($targetGroups),
        ]);

        foreach ($targetGroups as $index => $group) {
            // Add delay between posts (except first one) to avoid spam detection
            if ($index > 0) {
                $delay = $this->getRandomDelay();
                Log::debug("GroupPostingAgent: Waiting {$delay}s before next post");
                sleep($delay);
            }

            $result = $this->postToGroup($post, $group);
            $results[$group->group_id] = $result;

            if ($result['success']) {
                $successCount++;
            } else {
                $failCount++;
            }
        }

        // Update post with results
        $post->update([
            'success_count' => $successCount,
            'failed_count' => $failCount,
        ]);
        $post->markAsCompleted($results);

        // Handle repeat scheduling if needed
        $this->handleRepeat($post);

        Log::info('GroupPostingAgent: Post execution completed', [
            'post_id' => $post->id,
            'success' => $successCount,
            'failed' => $failCount,
        ]);

        return $results;
    }

    /**
     * Execute a single post immediately (bypass schedule)
     */
    public function executeNow(ScheduledGroupPost $post): array
    {
        if (!$post->isApproved()) {
            throw new \Exception('Post must be approved before execution');
        }

        return $this->executePost($post);
    }

    /**
     * Resolve target groups from post configuration
     */
    protected function resolveTargetGroups(ScheduledGroupPost $post): array
    {
        $zaloAccount = $post->zaloAccount;

        if (!$zaloAccount) {
            throw new \Exception('Zalo account not found for this post');
        }

        $targetConfig = $post->target_groups;

        // If 'all', get all groups for this account
        if ($targetConfig === ['all'] || $targetConfig === 'all') {
            return $zaloAccount->groups()->get()->all();
        }

        // Get specific groups by ID
        return ZaloGroup::where('zalo_account_id', $zaloAccount->id)
            ->whereIn('group_id', $targetConfig)
            ->get()
            ->all();
    }

    /**
     * Post content to a single Zalo group
     */
    protected function postToGroup(ScheduledGroupPost $post, ZaloGroup $group): array
    {
        try {
            $result = $this->zaloService->sendMessage(
                $post->zaloAccount->own_id,
                $group->group_id,
                $post->content,
                'group'
            );

            return [
                'success' => $result['success'] ?? false,
                'message_id' => $result['data']['messageId'] ?? null,
                'error' => $result['error'] ?? null,
                'sent_at' => now()->toISOString(),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'sent_at' => now()->toISOString(),
            ];
        }
    }

    /**
     * Get random delay between posts (30-120 seconds)
     * This helps avoid spam detection
     */
    protected function getRandomDelay(): int
    {
        return rand(30, 120);
    }

    /**
     * Handle repeat scheduling for recurring posts
     */
    protected function handleRepeat(ScheduledGroupPost $post): void
    {
        if ($post->repeat_type === 'once') {
            return;
        }

        $nextSchedule = $this->calculateNextSchedule($post);

        if (!$nextSchedule) {
            return;
        }

        // Create a new scheduled post for next occurrence
        ScheduledGroupPost::create([
            'company_id' => $post->company_id,
            'job_id' => $post->job_id,
            'zalo_account_id' => $post->zalo_account_id,
            'target_groups' => $post->target_groups,
            'content' => $post->content,
            'media_urls' => $post->media_urls,
            'template_id' => $post->template_id,
            'scheduled_at' => $nextSchedule,
            'repeat_type' => $post->repeat_type,
            'repeat_config' => $post->repeat_config,
            'status' => 'approved', // Auto-approve recurring posts
            'created_by' => $post->created_by,
            'approved_by' => $post->approved_by,
            'approved_at' => now(),
        ]);

        Log::info('GroupPostingAgent: Created next recurring post', [
            'original_post_id' => $post->id,
            'next_schedule' => $nextSchedule,
        ]);
    }

    /**
     * Calculate next schedule time based on repeat type
     */
    protected function calculateNextSchedule(ScheduledGroupPost $post): ?\DateTime
    {
        $baseTime = $post->scheduled_at;

        return match ($post->repeat_type) {
            'daily' => $baseTime->copy()->addDay(),
            'weekly' => $baseTime->copy()->addWeek(),
            'custom' => $this->calculateCustomSchedule($post),
            default => null,
        };
    }

    /**
     * Calculate custom repeat schedule from config
     */
    protected function calculateCustomSchedule(ScheduledGroupPost $post): ?\DateTime
    {
        $config = $post->repeat_config;

        if (!$config) {
            return null;
        }

        // Support various custom configurations
        $interval = $config['interval'] ?? null;
        $unit = $config['unit'] ?? 'days';
        $maxOccurrences = $config['max_occurrences'] ?? null;

        // Check if max occurrences reached
        if ($maxOccurrences) {
            $currentCount = ScheduledGroupPost::where('company_id', $post->company_id)
                ->where('template_id', $post->template_id)
                ->where('repeat_type', 'custom')
                ->count();

            if ($currentCount >= $maxOccurrences) {
                return null;
            }
        }

        if (!$interval) {
            return null;
        }

        $nextTime = $post->scheduled_at->copy();

        return match ($unit) {
            'hours' => $nextTime->addHours($interval),
            'days' => $nextTime->addDays($interval),
            'weeks' => $nextTime->addWeeks($interval),
            'months' => $nextTime->addMonths($interval),
            default => null,
        };
    }

    /**
     * Preview which groups will receive the post
     */
    public function previewTargetGroups(ScheduledGroupPost $post): array
    {
        $groups = $this->resolveTargetGroups($post);

        return array_map(fn($group) => [
            'id' => $group->id,
            'group_id' => $group->group_id,
            'name' => $group->name,
            'member_count' => $group->member_count,
        ], $groups);
    }
}
