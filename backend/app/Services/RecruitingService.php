<?php

namespace App\Services;

use App\Models\RecruitmentJob;
use App\Models\Candidate;
use App\Models\JobApplication;
use App\Models\PipelineStage;
use App\Events\CandidateCreated;
use App\Events\ApplicationStageChanged;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

class RecruitingService
{
    public function createJob(int $userId, array $data): RecruitmentJob
    {
        return RecruitmentJob::create([
            'user_id' => $userId,
            ...$data,
        ]);
    }

    public function getJobs(int $userId, array $filters = []): LengthAwarePaginator
    {
        $query = RecruitmentJob::where('user_id', $userId)
            ->withCount('applications')
            ->orderByDesc('created_at');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $query->where('title', 'like', "%{$filters['search']}%");
        }

        return $query->paginate($filters['per_page'] ?? 20);
    }

    public function createCandidate(int $userId, array $data): Candidate
    {
        // Check for duplicates
        $existing = Candidate::findDuplicate(
            $data['email'] ?? null,
            $data['phone'] ?? null,
            $userId
        );

        if ($existing) {
            // Merge data with existing candidate
            $existing->update(array_filter($data));
            return $existing;
        }

        $candidate = Candidate::create([
            'user_id' => $userId,
            ...$data,
        ]);

        event(new CandidateCreated($candidate));

        return $candidate;
    }

    public function createCandidateFromConversation(
        int $userId,
        int $conversationId,
        array $data
    ): Candidate {
        $data['source'] = 'chat';
        $data['source_conversation_id'] = $conversationId;

        return $this->createCandidate($userId, $data);
    }

    public function getCandidates(int $userId, array $filters = []): LengthAwarePaginator
    {
        $query = Candidate::where('user_id', $userId)
            ->with('applications.job', 'applications.stage')
            ->orderByDesc('created_at');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('full_name', 'like', "%{$filters['search']}%")
                    ->orWhere('email', 'like', "%{$filters['search']}%")
                    ->orWhere('phone', 'like', "%{$filters['search']}%");
            });
        }

        return $query->paginate($filters['per_page'] ?? 20);
    }

    public function applyToJob(Candidate $candidate, RecruitmentJob $job, array $answers = []): JobApplication
    {
        $newStage = PipelineStage::where('user_id', $job->user_id)
            ->where('slug', 'new')
            ->firstOrFail();

        return JobApplication::create([
            'job_id' => $job->id,
            'candidate_id' => $candidate->id,
            'stage_id' => $newStage->id,
            'screening_answers' => $answers,
        ]);
    }

    public function moveApplicationStage(JobApplication $application, int $stageId): JobApplication
    {
        $oldStage = $application->stage;
        $newStage = PipelineStage::findOrFail($stageId);

        $application->moveToStage($newStage);

        event(new ApplicationStageChanged($application, $oldStage, $newStage));

        return $application->fresh();
    }

    public function getPipelineBoard(RecruitmentJob $job): Collection
    {
        $stages = PipelineStage::where('user_id', $job->user_id)
            ->orderBy('sort_order')
            ->get();

        $applications = $job->applications()
            ->with('candidate')
            ->get()
            ->groupBy('stage_id');

        return $stages->map(fn($stage) => [
            'stage' => $stage,
            'applications' => $applications->get($stage->id, collect()),
        ]);
    }

    public function initializeDefaultStages(int $userId): void
    {
        $defaults = PipelineStage::getDefaultStages();

        foreach ($defaults as $index => $stage) {
            PipelineStage::firstOrCreate(
                ['user_id' => $userId, 'slug' => $stage['slug']],
                [...$stage, 'sort_order' => $index]
            );
        }
    }
}
