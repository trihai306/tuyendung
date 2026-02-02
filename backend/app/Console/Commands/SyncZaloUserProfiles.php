<?php

namespace App\Console\Commands;

use App\Jobs\FetchZaloUserProfileJob;
use App\Models\ZaloAccount;
use App\Models\ZaloMessage;
use App\Models\ZaloUser;
use Illuminate\Console\Command;

/**
 * Sync missing Zalo user profiles
 * 
 * Finds all sender_ids in zalo_messages that don't have profiles in zalo_users
 * and dispatches jobs to fetch them.
 */
class SyncZaloUserProfiles extends Command
{
    protected $signature = 'zalo:sync-profiles 
        {--limit=100 : Maximum number of profiles to sync}
        {--queue=zalo-sync : Queue to dispatch jobs to}';

    protected $description = 'Sync missing Zalo user profiles from messages';

    public function handle(): int
    {
        $limit = (int) $this->option('limit');
        $queue = $this->option('queue');

        // Get all unique sender_ids from messages
        $allSenderIds = ZaloMessage::select('sender_id', 'thread_id', 'thread_type', 'external_account_id')
            ->whereNotNull('sender_id')
            ->where('sender_id', '!=', '')
            ->groupBy('sender_id', 'thread_id', 'thread_type', 'external_account_id')
            ->pluck('sender_id', 'sender_id')
            ->keys()
            ->take($limit);

        $this->info("Found {$allSenderIds->count()} unique senders in messages");

        // Get already cached user IDs
        $cachedUserIds = ZaloUser::pluck('zalo_user_id')->toArray();

        // Filter to only uncached ones
        $missingIds = $allSenderIds->diff($cachedUserIds);

        if ($missingIds->isEmpty()) {
            $this->info('All profiles are already cached!');
            return 0;
        }

        $this->info("Found {$missingIds->count()} profiles to sync");

        // Get message data for each missing ID
        $bar = $this->output->createProgressBar($missingIds->count());
        $bar->start();

        $dispatched = 0;
        foreach ($missingIds as $senderId) {
            // Get first message from this sender to know the account
            $message = ZaloMessage::where('sender_id', $senderId)
                ->whereNotNull('external_account_id')
                ->first();

            if (!$message) {
                $bar->advance();
                continue;
            }

            FetchZaloUserProfileJob::dispatch(
                $message->external_account_id,
                $senderId,
                $message->thread_id,
                $message->thread_type
            )->onQueue($queue);

            $dispatched++;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Dispatched {$dispatched} jobs to queue '{$queue}'");

        return 0;
    }
}
