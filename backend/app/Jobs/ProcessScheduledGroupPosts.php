<?php

namespace App\Jobs;

use App\Services\Agents\GroupPostingAgentService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

/**
 * ProcessScheduledGroupPosts
 * 
 * Queue job that runs every 5 minutes to process due scheduled group posts.
 * Called by Laravel scheduler.
 */
class ProcessScheduledGroupPosts implements ShouldQueue
{
    use Queueable;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 600; // 10 minutes

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(GroupPostingAgentService $agent): void
    {
        Log::info('ProcessScheduledGroupPosts: Starting job');

        try {
            $processed = $agent->processScheduledPosts();
            Log::info("ProcessScheduledGroupPosts: Completed, processed {$processed} posts");
        } catch (\Exception $e) {
            Log::error('ProcessScheduledGroupPosts: Job failed', [
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('ProcessScheduledGroupPosts: Job failed permanently', [
            'error' => $exception->getMessage(),
        ]);
    }
}
