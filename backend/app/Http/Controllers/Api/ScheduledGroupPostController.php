<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ScheduledGroupPost;
use App\Models\ZaloAccount;
use App\Models\ZaloGroup;
use App\Services\Agents\GroupPostingAgentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ScheduledGroupPostController extends Controller
{
    public function __construct(
        private GroupPostingAgentService $agentService
    ) {
    }

    /**
     * GET /api/scheduled-group-posts
     * List scheduled posts for the company
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $company = $user->company;

        if (!$company) {
            return response()->json([
                'success' => false,
                'error' => ['message' => 'Bạn chưa có công ty'],
            ], 403);
        }

        $query = ScheduledGroupPost::forCompany($company->id)
            ->with(['zaloAccount', 'job', 'createdBy'])
            ->orderBy('scheduled_at', 'desc');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('from')) {
            $query->where('scheduled_at', '>=', $request->from);
        }
        if ($request->has('to')) {
            $query->where('scheduled_at', '<=', $request->to);
        }

        $posts = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $posts->items(),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
                'last_page' => $posts->lastPage(),
            ],
        ]);
    }

    /**
     * POST /api/scheduled-group-posts
     * Create a new scheduled post
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'zalo_account_id' => 'required|exists:zalo_accounts,id',
            'target_groups' => 'required|array',
            'content' => 'required|string|max:5000',
            'scheduled_at' => 'required|date|after:now',
            'job_id' => 'nullable|exists:recruitment_jobs,id',
            'template_id' => 'nullable|exists:post_templates,id',
            'media_urls' => 'nullable|array',
            'repeat_type' => 'nullable|in:once,daily,weekly,custom',
            'repeat_config' => 'nullable|array',
        ]);

        $user = Auth::user();
        $company = $user->company;

        // Verify Zalo account belongs to company
        $zaloAccount = ZaloAccount::where('id', $request->zalo_account_id)
            ->where('company_id', $company->id)
            ->firstOrFail();

        // Validate target groups
        $validGroups = $this->validateTargetGroups($request->target_groups, $zaloAccount);

        $post = ScheduledGroupPost::create([
            'company_id' => $company->id,
            'zalo_account_id' => $zaloAccount->id,
            'job_id' => $request->job_id,
            'target_groups' => $validGroups,
            'content' => $request->content,
            'media_urls' => $request->media_urls,
            'template_id' => $request->template_id,
            'scheduled_at' => $request->scheduled_at,
            'repeat_type' => $request->repeat_type ?? 'once',
            'repeat_config' => $request->repeat_config,
            'status' => 'pending',
            'created_by' => $user->id,
        ]);

        $post->load(['zaloAccount', 'job', 'createdBy']);

        return response()->json([
            'success' => true,
            'data' => $post,
            'message' => 'Đã tạo bài đăng lịch thành công',
        ], 201);
    }

    /**
     * GET /api/scheduled-group-posts/{id}
     * Get scheduled post details
     */
    public function show(ScheduledGroupPost $scheduledGroupPost): JsonResponse
    {
        $this->authorizePost($scheduledGroupPost);

        $scheduledGroupPost->load([
            'zaloAccount',
            'job',
            'template',
            'createdBy',
            'approvedBy',
        ]);

        // Add preview of target groups
        $scheduledGroupPost->target_groups_preview = $this->agentService->previewTargetGroups($scheduledGroupPost);

        return response()->json([
            'success' => true,
            'data' => $scheduledGroupPost,
        ]);
    }

    /**
     * PUT /api/scheduled-group-posts/{id}
     * Update a pending scheduled post
     */
    public function update(Request $request, ScheduledGroupPost $scheduledGroupPost): JsonResponse
    {
        $this->authorizePost($scheduledGroupPost);

        if (!$scheduledGroupPost->isPending()) {
            return response()->json([
                'success' => false,
                'error' => ['message' => 'Chỉ có thể sửa bài đăng đang chờ duyệt'],
            ], 422);
        }

        $request->validate([
            'target_groups' => 'sometimes|array',
            'content' => 'sometimes|string|max:5000',
            'scheduled_at' => 'sometimes|date|after:now',
            'media_urls' => 'nullable|array',
            'repeat_type' => 'nullable|in:once,daily,weekly,custom',
            'repeat_config' => 'nullable|array',
        ]);

        $updateData = $request->only([
            'content',
            'scheduled_at',
            'media_urls',
            'repeat_type',
            'repeat_config',
        ]);

        // Validate target groups if provided
        if ($request->has('target_groups')) {
            $updateData['target_groups'] = $this->validateTargetGroups(
                $request->target_groups,
                $scheduledGroupPost->zaloAccount
            );
        }

        $scheduledGroupPost->update($updateData);
        $scheduledGroupPost->load(['zaloAccount', 'job']);

        return response()->json([
            'success' => true,
            'data' => $scheduledGroupPost,
            'message' => 'Đã cập nhật bài đăng',
        ]);
    }

    /**
     * DELETE /api/scheduled-group-posts/{id}
     * Cancel/delete a scheduled post
     */
    public function destroy(ScheduledGroupPost $scheduledGroupPost): JsonResponse
    {
        $this->authorizePost($scheduledGroupPost);

        if ($scheduledGroupPost->isProcessing()) {
            return response()->json([
                'success' => false,
                'error' => ['message' => 'Không thể hủy bài đang được xử lý'],
            ], 422);
        }

        if ($scheduledGroupPost->isCompleted()) {
            // For completed posts, just delete the record
            $scheduledGroupPost->delete();
        } else {
            // For pending/approved posts, cancel instead
            $scheduledGroupPost->cancel();
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã hủy bài đăng lịch',
        ]);
    }

    /**
     * POST /api/scheduled-group-posts/{id}/approve
     * Approve a pending post for execution
     */
    public function approve(ScheduledGroupPost $scheduledGroupPost): JsonResponse
    {
        $this->authorizePost($scheduledGroupPost);

        if (!$scheduledGroupPost->isPending()) {
            return response()->json([
                'success' => false,
                'error' => ['message' => 'Bài đăng này không ở trạng thái chờ duyệt'],
            ], 422);
        }

        $scheduledGroupPost->approve(Auth::id());

        return response()->json([
            'success' => true,
            'data' => $scheduledGroupPost,
            'message' => 'Đã duyệt bài đăng',
        ]);
    }

    /**
     * POST /api/scheduled-group-posts/{id}/execute-now
     * Execute a post immediately (bypass schedule)
     */
    public function executeNow(ScheduledGroupPost $scheduledGroupPost): JsonResponse
    {
        $this->authorizePost($scheduledGroupPost);

        if (!$scheduledGroupPost->isApproved()) {
            return response()->json([
                'success' => false,
                'error' => ['message' => 'Bài đăng cần được duyệt trước khi thực thi'],
            ], 422);
        }

        try {
            $results = $this->agentService->executeNow($scheduledGroupPost);

            return response()->json([
                'success' => true,
                'data' => $scheduledGroupPost->fresh(),
                'results' => $results,
                'message' => 'Đã thực thi bài đăng',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => ['message' => $e->getMessage()],
            ], 500);
        }
    }

    /**
     * GET /api/scheduled-group-posts/available-groups
     * Get available Zalo groups for scheduling
     */
    public function availableGroups(Request $request): JsonResponse
    {
        $request->validate([
            'zalo_account_id' => 'required|exists:zalo_accounts,id',
        ]);

        $user = Auth::user();
        $company = $user->company;

        $zaloAccount = ZaloAccount::where('id', $request->zalo_account_id)
            ->where('company_id', $company->id)
            ->firstOrFail();

        $groups = $zaloAccount->groups()->get(['id', 'group_id', 'name', 'member_count', 'avatar']);

        return response()->json([
            'success' => true,
            'data' => $groups,
        ]);
    }

    // ===========================================
    // HELPER METHODS
    // ===========================================

    private function authorizePost(ScheduledGroupPost $post): void
    {
        $user = Auth::user();
        $company = $user->company;

        if ($post->company_id !== $company->id) {
            abort(403, 'Bạn không có quyền truy cập bài đăng này');
        }
    }

    private function validateTargetGroups(array $targetGroups, ZaloAccount $zaloAccount): array
    {
        // Special case: 'all' means all groups
        if ($targetGroups === ['all']) {
            return ['all'];
        }

        // Validate each group exists
        $validGroupIds = ZaloGroup::where('zalo_account_id', $zaloAccount->id)
            ->whereIn('group_id', $targetGroups)
            ->pluck('group_id')
            ->toArray();

        if (empty($validGroupIds)) {
            abort(422, 'Không có nhóm hợp lệ được chọn');
        }

        return $validGroupIds;
    }
}
