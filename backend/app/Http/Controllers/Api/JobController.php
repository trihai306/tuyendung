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
}
