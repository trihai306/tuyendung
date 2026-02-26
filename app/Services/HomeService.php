<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\JobCategory;
use App\Models\JobPost;
use App\Models\Room;
use App\Models\User;

class HomeService
{
    /**
     * Get home page data: featured jobs, rooms, categories, stats.
     */
    public function getHomePageData(): array
    {
        $featuredJobs = JobPost::active()
            ->with(['employer.employerProfile', 'category'])
            ->latest()
            ->take(6)
            ->get();

        $featuredRooms = Room::available()
            ->with('landlord')
            ->latest()
            ->take(6)
            ->get();

        $jobCategories = JobCategory::withCount([
            'jobPosts' => function ($query): void {
                $query->where('status', 'active');
            }
        ])->get();

        return [
            'featuredJobs' => $featuredJobs,
            'featuredRooms' => $featuredRooms,
            'categories' => $jobCategories,
            'stats' => [
                'jobs' => JobPost::active()->count(),
                'rooms' => Room::available()->count(),
                'users' => User::count(),
            ],
        ];
    }
}
