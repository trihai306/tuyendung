<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Candidate;
use App\Services\CandidateService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CandidateController extends Controller
{
    use ApiResponse;

    public function __construct(
        private CandidateService $candidateService
    ) {
    }

    /**
     * Get candidates with role-based filtering
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $company = $user->companies()->first();

        if (!$company) {
            return $this->error('Bạn chưa thuộc doanh nghiệp nào', 403);
        }

        $result = $this->candidateService->getCandidates($user, $company, $request->all());

        return response()->json([
            'success' => true,
            ...$result,
        ]);
    }

    /**
     * Store new candidate
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $company = $user->companies()->first();

        if (!$company) {
            return $this->error('Bạn chưa thuộc doanh nghiệp nào', 403);
        }

        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:20',
            'source' => 'sometimes|in:chat,manual,import,referral',
            'resume_url' => 'nullable|url',
            'profile_data' => 'nullable|array',
            'tags' => 'nullable|array',
            'notes' => 'nullable|string',
            'assigned_user_id' => 'nullable|exists:users,id',
        ]);

        try {
            $candidate = $this->candidateService->createCandidate($user, $company, $validated);
            return $this->success($candidate, 'Thêm ứng viên thành công', 201);
        } catch (\InvalidArgumentException $e) {
            $data = json_decode($e->getMessage(), true);
            return $this->error($data['message'] ?? $e->getMessage(), 422, $data);
        }
    }

    /**
     * Show single candidate with authorization check
     */
    public function show(Request $request, Candidate $candidate): JsonResponse
    {
        $user = $request->user();

        if (!$this->candidateService->canAccess($candidate, $user)) {
            return $this->error('Bạn không có quyền xem ứng viên này', 403);
        }

        $candidate->load([
            'company:id,name',
            'createdBy:id,name,email',
            'assignedUser:id,name,email',
            'applications.job:id,title,status',
            'applications.stage:id,name,color',
            'conversations.channel:id,name,platform',
        ]);

        return $this->success($candidate);
    }

    /**
     * Update candidate
     */
    public function update(Request $request, Candidate $candidate): JsonResponse
    {
        $user = $request->user();
        $company = $user->companies()->first();

        if (!$company || $candidate->company_id !== $company->id) {
            return $this->error('Không có quyền cập nhật ứng viên này', 403);
        }

        $isManager = $this->candidateService->isManager($company);

        $rules = [
            'full_name' => 'sometimes|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:20',
            'resume_url' => 'nullable|url',
            'profile_data' => 'nullable|array',
            'tags' => 'nullable|array',
            'notes' => 'nullable|string',
            'rating' => 'nullable|integer|min:1|max:5',
            'status' => 'sometimes|in:active,blacklisted,archived',
        ];

        if ($isManager) {
            $rules['assigned_user_id'] = 'nullable|exists:users,id';
        }

        $validated = $request->validate($rules);

        try {
            $candidate = $this->candidateService->updateCandidate(
                $candidate,
                $user,
                $company,
                $validated,
                $isManager
            );
            return $this->success($candidate, 'Cập nhật ứng viên thành công');
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage(), 403);
        }
    }

    /**
     * Delete candidate - only managers
     */
    public function destroy(Request $request, Candidate $candidate): JsonResponse
    {
        $user = $request->user();
        $company = $user->companies()->first();

        if (!$company || $candidate->company_id !== $company->id) {
            return $this->error('Không có quyền xóa ứng viên này', 403);
        }

        if (!$this->candidateService->isManager($company)) {
            return $this->error('Chỉ quản lý mới có thể xóa ứng viên', 403);
        }

        $this->candidateService->deleteCandidate($candidate);

        return $this->success(null, 'Đã xóa ứng viên');
    }

    /**
     * Apply candidate to job
     */
    public function applyToJob(Request $request, Candidate $candidate): JsonResponse
    {
        $user = $request->user();

        if (!$this->candidateService->canAccess($candidate, $user)) {
            return $this->error('Không có quyền thao tác với ứng viên này', 403);
        }

        $validated = $request->validate([
            'job_id' => 'required|exists:recruitment_jobs,id',
            'screening_answers' => 'nullable|array',
        ]);

        try {
            $application = $this->candidateService->applyToJob(
                $candidate,
                $validated['job_id'],
                $validated['screening_answers'] ?? null
            );
            return $this->success($application, 'Đã thêm ứng viên vào tin tuyển dụng', 201);
        } catch (\InvalidArgumentException $e) {
            $data = json_decode($e->getMessage(), true);
            return $this->error($data['message'] ?? $e->getMessage(), 422, $data);
        }
    }

    /**
     * Assign candidate to user (managers only)
     */
    public function assign(Request $request, Candidate $candidate): JsonResponse
    {
        $user = $request->user();
        $company = $user->companies()->first();

        if (!$company || $candidate->company_id !== $company->id) {
            return $this->error('Không có quyền phân công ứng viên này', 403);
        }

        if (!$this->candidateService->isManager($company)) {
            return $this->error('Chỉ quản lý mới có thể phân công ứng viên', 403);
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        try {
            $candidate = $this->candidateService->assignToUser(
                $candidate,
                $company,
                $validated['user_id']
            );
            return $this->success($candidate, 'Đã phân công ứng viên');
        } catch (\InvalidArgumentException $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    /**
     * Bulk assign candidates
     */
    public function bulkAssign(Request $request): JsonResponse
    {
        $user = $request->user();
        $company = $user->companies()->first();

        if (!$company) {
            return $this->error('Bạn chưa thuộc doanh nghiệp nào', 403);
        }

        if (!$this->candidateService->isManager($company)) {
            return $this->error('Chỉ quản lý mới có thể phân công hàng loạt', 403);
        }

        $validated = $request->validate([
            'candidate_ids' => 'required|array|min:1',
            'candidate_ids.*' => 'exists:candidates,id',
            'user_id' => 'required|exists:users,id',
        ]);

        try {
            $updatedCount = $this->candidateService->bulkAssign(
                $company,
                $validated['candidate_ids'],
                $validated['user_id']
            );
            return $this->success([
                'updated_count' => $updatedCount,
            ], "Đã phân công {$updatedCount} ứng viên");
        } catch (\InvalidArgumentException $e) {
            return $this->error($e->getMessage(), 422);
        }
    }
}
