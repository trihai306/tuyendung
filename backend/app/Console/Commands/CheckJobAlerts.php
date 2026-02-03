<?php

namespace App\Console\Commands;

use App\Models\Notification;
use App\Models\RecruitmentJob;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class CheckJobAlerts extends Command
{
    protected $signature = 'jobs:check-alerts';
    protected $description = 'Check jobs for insufficient applicants and expiring soon, create notifications';

    public function handle(): int
    {
        $this->info('Checking job alerts...');

        $alertsCreated = 0;

        // Get all open jobs with target_count set
        $jobs = RecruitmentJob::where('status', 'open')
            ->whereNotNull('target_count')
            ->where('target_count', '>', 0)
            ->with(['user', 'applications'])
            ->get();

        foreach ($jobs as $job) {
            $applicantCount = $job->applications()->count();
            $hiredCount = $job->hired_count ?? 0;
            $targetCount = $job->target_count;
            $expiresAt = $job->expires_at;

            // Calculate progress
            $progress = $targetCount > 0 ? ($hiredCount / $targetCount) * 100 : 0;

            // Check if job is expiring soon (within 3 days)
            $isExpiringSoon = $expiresAt && Carbon::parse($expiresAt)->diffInDays(now()) <= 3;

            // Check if insufficient applicants (hired < 50% of target)
            $isInsufficient = $progress < 50;

            // Create notification for expiring jobs with insufficient progress
            if ($isExpiringSoon && $isInsufficient) {
                $this->createNotification(
                    $job,
                    'warning',
                    'Tin sắp hết hạn - Chưa đủ ứng viên',
                    "Tin \"{$job->title}\" sắp hết hạn trong " . Carbon::parse($expiresAt)->diffForHumans() . " nhưng mới tuyển được {$hiredCount}/{$targetCount} người ({$applicantCount} ứng viên).",
                    'expiring_insufficient'
                );
                $alertsCreated++;
            }
            // Create notification for insufficient applicants (check weekly or when progress < 30%)
            elseif ($progress < 30 && $applicantCount < $targetCount) {
                // Check if notification was already sent today
                $existingNotification = Notification::where('user_id', $job->user_id)
                    ->where('category', 'recruiting')
                    ->where('data->job_id', $job->id)
                    ->where('data->alert_type', 'insufficient')
                    ->whereDate('created_at', today())
                    ->exists();

                if (!$existingNotification) {
                    $this->createNotification(
                        $job,
                        'info',
                        'Ứng viên chưa đủ target',
                        "Tin \"{$job->title}\" mới có {$applicantCount} ứng viên, đã tuyển {$hiredCount}/{$targetCount}. Cần thêm " . ($targetCount - $hiredCount) . " người nữa.",
                        'insufficient'
                    );
                    $alertsCreated++;
                }
            }
        }

        $this->info("Created {$alertsCreated} alert notifications.");

        return Command::SUCCESS;
    }

    private function createNotification(RecruitmentJob $job, string $type, string $title, string $message, string $alertType): void
    {
        Notification::create([
            'user_id' => $job->user_id,
            'company_id' => null,
            'type' => $type,
            'category' => 'recruiting',
            'title' => $title,
            'message' => $message,
            'link' => "/recruiting/{$job->id}",
            'data' => [
                'job_id' => $job->id,
                'job_title' => $job->title,
                'alert_type' => $alertType,
                'target_count' => $job->target_count,
                'hired_count' => $job->hired_count,
                'applicant_count' => $job->applications()->count(),
            ],
        ]);

        $this->line("  → Notification for job #{$job->id}: {$title}");
    }
}
