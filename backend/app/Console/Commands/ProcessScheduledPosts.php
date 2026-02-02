<?php

namespace App\Console\Commands;

use App\Jobs\PublishScheduledPostJob;
use App\Models\ScheduledPost;
use Illuminate\Console\Command;

class ProcessScheduledPosts extends Command
{
    protected $signature = 'posts:process';

    protected $description = 'Process scheduled posts that are due for publishing';

    public function handle(): int
    {
        $posts = ScheduledPost::query()
            ->where('status', 'approved')
            ->where('scheduled_at', '<=', now())
            ->get();

        $count = $posts->count();

        if ($count === 0) {
            $this->info('No posts to process.');
            return 0;
        }

        $this->info("Processing {$count} scheduled posts...");

        foreach ($posts as $post) {
            PublishScheduledPostJob::dispatch($post);
            $this->line("Dispatched job for post #{$post->id}");
        }

        $this->info("All posts dispatched to queue.");

        return 0;
    }
}
