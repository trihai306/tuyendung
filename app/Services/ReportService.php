<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Application;
use App\Models\CompanyMember;
use App\Models\JobPost;
use App\Models\RecruitmentTask;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ReportService
{
    /**
     * Get report data grouped by job post.
     *
     * @return array<string, mixed>
     */
    public function getJobPostReport(int $ownerId): array
    {
        $jobPosts = JobPost::where('employer_id', $ownerId)
            ->withCount([
                'applications',
                'applications as pending_count' => fn($q) => $q->where('status', 'pending'),
                'applications as reviewing_count' => fn($q) => $q->where('status', 'reviewing'),
                'applications as shortlisted_count' => fn($q) => $q->where('status', 'shortlisted'),
                'applications as accepted_count' => fn($q) => $q->where('status', 'accepted'),
                'applications as rejected_count' => fn($q) => $q->where('status', 'rejected'),
                'applications as system_count' => fn($q) => $q->where('source', 'system'),
                'applications as facebook_count' => fn($q) => $q->where('source', 'facebook'),
                'applications as zalo_count' => fn($q) => $q->where('source', 'zalo'),
                'applications as other_source_count' => fn($q) => $q->whereNotIn('source', ['system', 'facebook', 'zalo']),
            ])
            ->with(['creator:id,name', 'category:id,name'])
            ->latest()
            ->get();

        return $jobPosts->toArray();
    }

    /**
     * Get performance metrics per team member.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getMemberPerformance(int $companyId, int $ownerId): array
    {
        $members = CompanyMember::where('employer_profile_id', $companyId)
            ->where('status', 'active')
            ->with('user:id,name,email,avatar')
            ->get();

        $jobPostIds = JobPost::where('employer_id', $ownerId)->pluck('id');

        $result = [];
        foreach ($members as $member) {
            $userId = $member->user_id;

            // Jobs created by this member
            $jobsCreated = JobPost::where('employer_id', $ownerId)
                ->where('created_by', $userId)
                ->count();

            // Applications added by this member (external candidates)
            $candidatesAdded = Application::whereIn('job_post_id', $jobPostIds)
                ->where('added_by', $userId)
                ->count();

            // Tasks assigned to this member
            $tasksAssigned = RecruitmentTask::where('employer_profile_id', $companyId)
                ->where('assigned_to', $userId)
                ->count();

            $tasksCompleted = RecruitmentTask::where('employer_profile_id', $companyId)
                ->where('assigned_to', $userId)
                ->where('status', 'completed')
                ->count();

            $result[] = [
                'member' => $member,
                'jobs_created' => $jobsCreated,
                'candidates_added' => $candidatesAdded,
                'tasks_assigned' => $tasksAssigned,
                'tasks_completed' => $tasksCompleted,
            ];
        }

        return $result;
    }

    /**
     * Get analytics broken down by channel/source.
     *
     * @return array<string, mixed>
     */
    public function getChannelAnalytics(int $ownerId): array
    {
        $jobPostIds = JobPost::where('employer_id', $ownerId)->pluck('id');

        $bySource = Application::whereIn('job_post_id', $jobPostIds)
            ->select('source', DB::raw('COUNT(*) as total'))
            ->groupBy('source')
            ->pluck('total', 'source')
            ->toArray();

        $byStatus = Application::whereIn('job_post_id', $jobPostIds)
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        // Published channels distribution
        $channelCounts = ['system' => 0, 'zalo' => 0, 'facebook' => 0];
        $jobsWithChannels = JobPost::where('employer_id', $ownerId)
            ->whereNotNull('publish_channels')
            ->pluck('publish_channels');

        foreach ($jobsWithChannels as $channels) {
            if (is_array($channels)) {
                foreach ($channels as $ch) {
                    if (isset($channelCounts[$ch])) {
                        $channelCounts[$ch]++;
                    }
                }
            }
        }

        return [
            'by_source' => $bySource,
            'by_status' => $byStatus,
            'publish_channels' => $channelCounts,
            'total_applications' => array_sum($bySource),
        ];
    }
}
