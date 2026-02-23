<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Interview;
use App\Models\RentPayment;
use App\Models\TenantContract;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $data = [];

        if ($user->isCandidate()) {
            $data['candidate'] = $this->candidateData($user);
        }

        if ($user->isEmployer()) {
            $data['employer'] = $this->employerData($user);
        }

        if ($user->isLandlord()) {
            $data['landlord'] = $this->landlordData($user);
        }

        return Inertia::render('Dashboard', $data);
    }

    private function candidateData($user): array
    {
        $applications = $user->applications();
        $totalApplications = $applications->count();

        $profile = $user->candidateProfile;
        $profileFields = ['bio', 'skills', 'experience_years', 'education', 'resume_url', 'desired_salary', 'current_address', 'city'];
        $filledFields = 0;
        if ($profile) {
            foreach ($profileFields as $field) {
                if (!empty($profile->$field)) {
                    $filledFields++;
                }
            }
        }
        $profileCompletion = count($profileFields) > 0
            ? (int) round(($filledFields / count($profileFields)) * 100)
            : 0;

        $applicationIds = $user->applications()->pluck('id');

        return [
            'totalApplications' => $totalApplications,
            'savedJobsCount' => $user->savedJobs()->count(),
            'interviewCount' => Interview::whereIn('application_id', $applicationIds)
                ->where('status', 'scheduled')
                ->count(),
            'profileCompletion' => $profileCompletion,
            'applicationStats' => [
                'pending' => $user->applications()->where('status', 'pending')->count(),
                'reviewing' => $user->applications()->where('status', 'reviewing')->count(),
                'shortlisted' => $user->applications()->where('status', 'shortlisted')->count(),
                'accepted' => $user->applications()->where('status', 'accepted')->count(),
                'rejected' => $user->applications()->where('status', 'rejected')->count(),
            ],
            'recentApplications' => $user->applications()
                ->with(['jobPost.employer.employerProfile'])
                ->latest('applied_at')
                ->take(5)
                ->get(),
            'recentSavedJobs' => $user->savedJobs()
                ->with(['jobPost.employer.employerProfile', 'jobPost.category'])
                ->latest()
                ->take(3)
                ->get(),
        ];
    }

    private function employerData($user): array
    {
        $jobPostIds = $user->jobPosts()->pluck('id');
        $totalApplications = Application::whereIn('job_post_id', $jobPostIds)->count();

        return [
            'totalJobPosts' => $user->jobPosts()->count(),
            'activeJobs' => $user->jobPosts()->where('status', 'active')->count(),
            'totalApplications' => $totalApplications,
            'interviewsThisWeek' => Interview::whereHas('application', function ($q) use ($jobPostIds) {
                $q->whereIn('job_post_id', $jobPostIds);
            })
                ->where('status', 'scheduled')
                ->whereBetween('scheduled_at', [now()->startOfWeek(), now()->endOfWeek()])
                ->count(),
            'applicationStats' => [
                'pending' => Application::whereIn('job_post_id', $jobPostIds)->where('status', 'pending')->count(),
                'reviewing' => Application::whereIn('job_post_id', $jobPostIds)->where('status', 'reviewing')->count(),
                'shortlisted' => Application::whereIn('job_post_id', $jobPostIds)->where('status', 'shortlisted')->count(),
                'accepted' => Application::whereIn('job_post_id', $jobPostIds)->where('status', 'accepted')->count(),
                'rejected' => Application::whereIn('job_post_id', $jobPostIds)->where('status', 'rejected')->count(),
            ],
            'recentApplications' => Application::whereIn('job_post_id', $jobPostIds)
                ->with(['jobPost', 'candidate.candidateProfile'])
                ->latest('applied_at')
                ->take(5)
                ->get(),
            'recentJobPosts' => $user->jobPosts()
                ->withCount('applications')
                ->latest()
                ->take(5)
                ->get(),
            'companyName' => $user->employerProfile?->company_name ?? $user->name,
        ];
    }

    private function landlordData($user): array
    {
        $roomIds = $user->rooms()->pluck('id');
        $contractIds = TenantContract::whereIn('room_id', $roomIds)->pluck('id');

        return [
            'totalRooms' => $user->rooms()->count(),
            'activeContracts' => TenantContract::whereIn('room_id', $roomIds)
                ->where('status', 'active')
                ->count(),
            'recentContracts' => TenantContract::whereIn('room_id', $roomIds)
                ->with(['room', 'tenant'])
                ->latest()
                ->take(5)
                ->get(),
            'totalRevenue' => RentPayment::whereIn('contract_id', $contractIds)
                ->where('status', 'paid')
                ->sum('amount'),
        ];
    }
}
