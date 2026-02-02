<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RecruitingService;
use App\Models\Candidate;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CandidateController extends Controller
{
    public function __construct(
        private RecruitingService $recruitingService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $candidates = $this->recruitingService->getCandidates(
            $request->user()->id,
            $request->only(['status', 'search', 'per_page'])
        );

        return response()->json($candidates);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:20',
            'source' => 'sometimes|in:chat,manual,import,referral',
            'resume_url' => 'nullable|url',
            'profile_data' => 'nullable|array',
            'tags' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);

        $candidate = $this->recruitingService->createCandidate(
            $request->user()->id,
            $validated
        );

        return response()->json(['data' => $candidate], 201);
    }

    public function show(Candidate $candidate): JsonResponse
    {
        $candidate->load([
            'applications.job',
            'applications.stage',
            'conversations.channel',
        ]);

        return response()->json(['data' => $candidate]);
    }

    public function update(Request $request, Candidate $candidate): JsonResponse
    {
        $validated = $request->validate([
            'full_name' => 'sometimes|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:20',
            'resume_url' => 'nullable|url',
            'profile_data' => 'nullable|array',
            'tags' => 'nullable|array',
            'notes' => 'nullable|string',
            'rating' => 'nullable|integer|min:1|max:5',
            'status' => 'sometimes|in:active,blacklisted,archived',
        ]);

        $candidate->update($validated);

        return response()->json(['data' => $candidate->fresh()]);
    }

    public function applyToJob(Request $request, Candidate $candidate): JsonResponse
    {
        $validated = $request->validate([
            'job_id' => 'required|exists:recruitment_jobs,id',
            'screening_answers' => 'nullable|array',
        ]);

        $job = \App\Models\RecruitmentJob::findOrFail($validated['job_id']);
        $application = $this->recruitingService->applyToJob(
            $candidate,
            $job,
            $validated['screening_answers'] ?? []
        );

        return response()->json(['data' => $application], 201);
    }
}
