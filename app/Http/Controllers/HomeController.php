<?php

namespace App\Http\Controllers;

use App\Models\JobCategory;
use App\Models\JobPost;
use App\Models\Room;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
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

        $jobCategories = JobCategory::withCount(['jobPosts' => function ($query) {
            $query->where('status', 'active');
        }])->get();

        $stats = [
            'total_jobs' => JobPost::active()->count(),
            'total_rooms' => Room::available()->count(),
            'total_users' => User::count(),
        ];

        return Inertia::render('Welcome', [
            'featuredJobs' => $featuredJobs,
            'featuredRooms' => $featuredRooms,
            'categories' => $jobCategories,
            'stats' => [
                'jobs' => $stats['total_jobs'],
                'rooms' => $stats['total_rooms'],
                'users' => $stats['total_users'],
            ],
        ]);
    }
}
