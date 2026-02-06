<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RecruitingService;
use App\Models\RecruitmentJob;
use App\Models\JobApplication;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class JobController extends Controller
{
    public function __construct(
        private RecruitingService $recruitingService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $jobs = $this->recruitingService->getJobs(
            $request->user()->id,
            $request->only(['status', 'search', 'per_page'])
        );

        return response()->json($jobs);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'department' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:255',
            'job_type' => 'sometimes|in:full_time,part_time,contract,intern',
            'salary_min' => 'nullable|numeric|min:0',
            'salary_max' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'requirements' => 'nullable|string',
            'benefits' => 'nullable|string',
            'screening_questions' => 'nullable|array',
            'target_count' => 'nullable|integer|min:1',
        ]);

        $job = $this->recruitingService->createJob($request->user()->id, $validated);

        return response()->json(['data' => $job], 201);
    }

    public function show(RecruitmentJob $job): JsonResponse
    {
        $job->load('applications.candidate', 'applications.stage');

        return response()->json(['data' => $job]);
    }

    public function update(Request $request, RecruitmentJob $job): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'department' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:255',
            'job_type' => 'sometimes|in:full_time,part_time,contract,intern',
            'salary_min' => 'nullable|numeric|min:0',
            'salary_max' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'requirements' => 'nullable|string',
            'benefits' => 'nullable|string',
            'screening_questions' => 'nullable|array',
        ]);

        $job->update($validated);

        return response()->json(['data' => $job->fresh()]);
    }

    public function destroy(RecruitmentJob $job): JsonResponse
    {
        $job->delete();

        return response()->json(null, 204);
    }

    public function publish(RecruitmentJob $job): JsonResponse
    {
        $job->publish();

        return response()->json(['data' => $job->fresh()]);
    }

    public function close(RecruitmentJob $job): JsonResponse
    {
        $job->close();

        return response()->json(['data' => $job->fresh()]);
    }

    public function pipeline(RecruitmentJob $job): JsonResponse
    {
        $pipeline = $this->recruitingService->getPipelineBoard($job);

        return response()->json(['data' => $pipeline]);
    }

    public function moveStage(Request $request, JobApplication $application): JsonResponse
    {
        $validated = $request->validate([
            'stage_id' => 'required|exists:pipeline_stages,id',
        ]);

        $application = $this->recruitingService->moveApplicationStage(
            $application,
            $validated['stage_id']
        );

        return response()->json(['data' => $application]);
    }

    /**
     * Public API: Get all open jobs (no auth required)
     */
    public function publicIndex(Request $request): JsonResponse
    {
        $query = RecruitmentJob::where('status', 'open')
            ->whereNotNull('published_at')
            ->with(['user:id,name', 'user.company:id,user_id,name,logo'])
            ->orderByDesc('published_at');

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhere('department', 'like', "%{$search}%");
            });
        }

        // Filter by job_type
        if ($jobType = $request->input('job_type')) {
            $query->where('job_type', $jobType);
        }

        // Filter by location
        if ($location = $request->input('location')) {
            $query->where('location', 'like', "%{$location}%");
        }

        // Filter by salary range
        if ($minSalary = $request->input('min_salary')) {
            $query->where('salary_min', '>=', $minSalary);
        }
        if ($maxSalary = $request->input('max_salary')) {
            $query->where('salary_max', '<=', $maxSalary);
        }

        // Filter by category (department)
        if ($category = $request->input('category')) {
            $query->where('department', 'like', "%{$category}%");
        }

        $jobs = $query->paginate(12);

        // Transform response to include company_name
        $jobs->getCollection()->transform(function ($job) {
            return [
                'id' => $job->id,
                'title' => $job->title,
                'slug' => $job->slug,
                'department' => $job->department,
                'location' => $job->location,
                'job_type' => $job->job_type,
                'salary_min' => $job->salary_min,
                'salary_max' => $job->salary_max,
                'salary_currency' => $job->salary_currency,
                'description' => $job->description,
                'requirements' => $job->requirements,
                'benefits' => $job->benefits,
                'published_at' => $job->published_at,
                'company_name' => $job->user?->company?->name ?? null,
                'company_logo' => $job->user?->company?->logo ?? null,
                'user' => [
                    'id' => $job->user?->id,
                    'name' => $job->user?->name,
                ],
            ];
        });

        return response()->json($jobs);
    }

    /**
     * Public API: Get job detail by slug (no auth required)
     */
    public function publicShow(string $slug): JsonResponse
    {
        $job = RecruitmentJob::where('slug', $slug)
            ->where('status', 'open')
            ->whereNotNull('published_at')
            ->with('user:id,name')
            ->select([
                'id',
                'title',
                'slug',
                'department',
                'location',
                'job_type',
                'salary_min',
                'salary_max',
                'salary_currency',
                'description',
                'requirements',
                'benefits',
                'published_at',
                'expires_at',
                'user_id'
            ])
            ->firstOrFail();

        return response()->json(['data' => $job]);
    }
}
