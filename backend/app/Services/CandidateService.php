<?php

namespace App\Services;

use App\Models\Candidate;
use App\Models\Company;
use App\Models\User;
use App\Models\RecruitmentJob;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class CandidateService
{
    /**
     * Get candidates with role-based filtering.
     * - Owner/Admin: all company candidates
     * - Member: only assigned or self-created candidates
     */
    public function getCandidates(User $user, Company $company, array $filters = []): array
    {
        $role = $user->company_role;
        $isManager = in_array($role, ['owner', 'admin']);

        // Base query - always filter by company
        $query = Candidate::forCompany($company->id)
            ->with(['createdBy:id,name', 'assignedUser:id,name']);

        // Member: only sees their assigned/created candidates
        if (!$isManager) {
            $query->forMember($user->id);
        }

        // Apply filters
        if (!empty($filters['status'])) {
            $query->status($filters['status']);
        }

        if (!empty($filters['source'])) {
            $query->source($filters['source']);
        }

        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        // Get stats
        $stats = $this->getStats($company, $isManager ? null : $user->id, $isManager);

        // Pagination
        $perPage = $filters['per_page'] ?? 15;
        $candidates = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return [
            'data' => $candidates->items(),
            'stats' => $stats,
            'meta' => [
                'current_page' => $candidates->currentPage(),
                'last_page' => $candidates->lastPage(),
                'per_page' => $candidates->perPage(),
                'total' => $candidates->total(),
            ],
            'role' => $role,
        ];
    }

    /**
     * Get stats for candidates.
     */
    public function getStats(Company $company, ?int $userId = null, bool $isManager = true): array
    {
        $query = Candidate::forCompany($company->id);

        if (!$isManager && $userId) {
            $query->forMember($userId);
        }

        return [
            'total' => (clone $query)->count(),
            'active' => (clone $query)->status('active')->count(),
            'this_month' => (clone $query)->whereMonth('created_at', now()->month)->count(),
            'blacklisted' => (clone $query)->status('blacklisted')->count(),
        ];
    }

    /**
     * Create a new candidate with duplicate check.
     */
    public function createCandidate(User $user, Company $company, array $data): Candidate
    {
        // Check for duplicate within company
        if (!empty($data['email']) || !empty($data['phone'])) {
            $duplicate = Candidate::findDuplicate(
                $company->id,
                $data['email'] ?? null,
                $data['phone'] ?? null
            );

            if ($duplicate) {
                throw new \InvalidArgumentException(
                    json_encode([
                        'message' => 'Ứng viên đã tồn tại với email hoặc số điện thoại này',
                        'duplicate_id' => $duplicate->id,
                        'duplicate_name' => $duplicate->full_name,
                    ])
                );
            }
        }

        $candidate = Candidate::create([
            'company_id' => $company->id,
            'created_by_user_id' => $user->id,
            'assigned_user_id' => $data['assigned_user_id'] ?? $user->id,
            'full_name' => $data['full_name'],
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'source' => $data['source'] ?? 'manual',
            'resume_url' => $data['resume_url'] ?? null,
            'profile_data' => $data['profile_data'] ?? null,
            'tags' => $data['tags'] ?? [],
            'notes' => $data['notes'] ?? null,
            'status' => 'active',
        ]);

        $candidate->load(['createdBy:id,name', 'assignedUser:id,name']);

        return $candidate;
    }

    /**
     * Update candidate with authorization check.
     */
    public function updateCandidate(
        Candidate $candidate,
        User $user,
        Company $company,
        array $data,
        bool $isManager
    ): Candidate {
        // Member can only update their own candidates
        if (!$isManager) {
            if ($candidate->assigned_user_id !== $user->id && $candidate->created_by_user_id !== $user->id) {
                throw new \RuntimeException('Bạn chỉ có thể cập nhật ứng viên được phân công cho mình');
            }
            // Remove assigned_user_id if member tries to reassign
            unset($data['assigned_user_id']);
        }

        $candidate->update($data);
        $candidate->load(['createdBy:id,name', 'assignedUser:id,name']);

        return $candidate->fresh();
    }

    /**
     * Delete candidate (managers only).
     */
    public function deleteCandidate(Candidate $candidate): bool
    {
        return $candidate->delete();
    }

    /**
     * Apply candidate to a job.
     */
    public function applyToJob(Candidate $candidate, int $jobId, ?array $answers = null)
    {
        $job = RecruitmentJob::findOrFail($jobId);

        // Verify job belongs to same company
        if ($job->company_id !== $candidate->company_id) {
            throw new \InvalidArgumentException('Tin tuyển dụng không thuộc cùng doanh nghiệp');
        }

        // Check if already applied
        $existingApplication = $candidate->applications()
            ->where('recruitment_job_id', $job->id)
            ->first();

        if ($existingApplication) {
            throw new \InvalidArgumentException(json_encode([
                'message' => 'Ứng viên đã ứng tuyển vào tin này',
                'application_id' => $existingApplication->id,
            ]));
        }

        // Get first stage of job's pipeline
        $firstStage = $job->stages()->orderBy('order')->first();

        return DB::transaction(function () use ($candidate, $job, $answers, $firstStage) {
            $application = $candidate->applications()->create([
                'recruitment_job_id' => $job->id,
                'pipeline_stage_id' => $firstStage?->id,
                'screening_answers' => $answers,
                'status' => 'applied',
                'applied_at' => now(),
            ]);

            $job->increment('applications_count');

            $application->load(['job:id,title', 'stage:id,name,color']);

            return $application;
        });
    }

    /**
     * Assign candidate to user.
     */
    public function assignToUser(Candidate $candidate, Company $company, int $userId): Candidate
    {
        // Verify target user is in same company
        $targetUser = User::find($userId);
        if (!$targetUser || $targetUser->company_id !== $company->id) {
            throw new \InvalidArgumentException('Người dùng không thuộc doanh nghiệp này');
        }

        $candidate->update(['assigned_user_id' => $userId]);
        $candidate->load(['assignedUser:id,name,email']);

        return $candidate;
    }

    /**
     * Bulk assign candidates.
     */
    public function bulkAssign(Company $company, array $candidateIds, int $userId): int
    {
        // Verify target user is in same company
        $targetUser = User::find($userId);
        if (!$targetUser || $targetUser->company_id !== $company->id) {
            throw new \InvalidArgumentException('Người dùng không thuộc doanh nghiệp này');
        }

        return Candidate::whereIn('id', $candidateIds)
            ->where('company_id', $company->id)
            ->update(['assigned_user_id' => $userId]);
    }

    /**
     * Check if user can access candidate.
     */
    public function canAccess(Candidate $candidate, User $user): bool
    {
        return $candidate->isAccessibleBy($user);
    }

    /**
     * Check if user is manager in company.
     */
    public function isManager(User $user): bool
    {
        return in_array($user->company_role, ['owner', 'admin']);
    }
}
