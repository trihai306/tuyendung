<?php

namespace App\Http\Controllers\Api;

use App\Models\JobApplication;
use App\Models\RecruitmentJob;
use App\Models\ScheduledPost;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class CalendarController extends Controller
{
    /**
     * Get all calendar events for the authenticated user's company.
     */
    public function events(Request $request): JsonResponse
    {
        $user = $request->user();
        $company = $user->companies()->first();

        if (!$company) {
            return response()->json([
                'success' => true,
                'data' => [
                    'interviews' => [],
                    'tasks' => [],
                    'job_expirations' => [],
                    'scheduled_posts' => [],
                ],
            ]);
        }

        $startDate = $request->input('start', now()->startOfMonth()->subDays(7)->toDateString());
        $endDate = $request->input('end', now()->endOfMonth()->addDays(7)->toDateString());

        // 1. Interviews (from JobApplication)
        $interviews = JobApplication::whereHas('job', fn($q) => $q->where('company_id', $company->id))
            ->whereNotNull('interview_scheduled_at')
            ->whereBetween('interview_scheduled_at', [$startDate, $endDate])
            ->with(['candidate:id,full_name,email', 'job:id,title'])
            ->get()
            ->map(fn($app) => [
                'id' => $app->id,
                'type' => 'interview',
                'title' => 'Phỏng vấn: ' . ($app->candidate?->full_name ?? 'N/A'),
                'subtitle' => $app->job?->title,
                'date' => $app->interview_scheduled_at->toISOString(),
                'color' => '#8B5CF6', // Purple
                'meta' => [
                    'candidate_id' => $app->candidate_id,
                    'job_id' => $app->job_id,
                    'notes' => $app->interview_notes,
                ],
            ]);

        // 2. Tasks with due_date
        $tasks = Task::forCompany($company->id)
            ->whereNotNull('due_date')
            ->whereBetween('due_date', [$startDate, $endDate])
            ->with(['assignedToUser:id,name'])
            ->get()
            ->map(fn($task) => [
                'id' => $task->id,
                'type' => 'task',
                'title' => $task->title,
                'subtitle' => $task->assignedToUser?->name,
                'date' => $task->due_date->toISOString(),
                'color' => $this->getTaskColor($task->priority, $task->status),
                'meta' => [
                    'priority' => $task->priority,
                    'status' => $task->status,
                    'progress' => $task->progress,
                ],
            ]);

        // 3. Job Expirations
        $jobExpirations = RecruitmentJob::where('company_id', $company->id)
            ->whereNotNull('expires_at')
            ->whereBetween('expires_at', [$startDate, $endDate])
            ->get()
            ->map(fn($job) => [
                'id' => $job->id,
                'type' => 'job_expiration',
                'title' => 'Hết hạn: ' . $job->title,
                'subtitle' => $job->status === 'open' ? 'Đang mở' : 'Đã đóng',
                'date' => $job->expires_at->toISOString(),
                'color' => $job->status === 'open' ? '#F59E0B' : '#6B7280', // Amber / Gray
                'meta' => [
                    'status' => $job->status,
                    'department' => $job->department,
                ],
            ]);

        // 4. Scheduled Posts
        $scheduledPosts = ScheduledPost::whereHas('job', fn($q) => $q->where('company_id', $company->id))
            ->whereBetween('scheduled_at', [$startDate, $endDate])
            ->with(['job:id,title', 'channel:id,name'])
            ->get()
            ->map(fn($post) => [
                'id' => $post->id,
                'type' => 'scheduled_post',
                'title' => 'Đăng bài: ' . ($post->job?->title ?? 'N/A'),
                'subtitle' => $post->channel?->name,
                'date' => $post->scheduled_at->toISOString(),
                'color' => '#3B82F6', // Blue
                'meta' => [
                    'job_id' => $post->job_id,
                    'channel_id' => $post->channel_id,
                    'status' => $post->status,
                ],
            ]);

        return response()->json([
            'success' => true,
            'data' => [
                'interviews' => $interviews,
                'tasks' => $tasks,
                'job_expirations' => $jobExpirations,
                'scheduled_posts' => $scheduledPosts,
            ],
        ]);
    }

    private function getTaskColor(string $priority, string $status): string
    {
        if ($status === 'completed')
            return '#10B981'; // Green
        if ($status === 'overdue')
            return '#EF4444'; // Red

        return match ($priority) {
            'high' => '#EF4444',
            'medium' => '#F59E0B',
            default => '#6B7280',
        };
    }
}
