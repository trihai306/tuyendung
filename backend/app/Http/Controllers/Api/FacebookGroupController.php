<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FacebookGroup;
use App\Models\PlatformAccount;
use App\Services\SocialMedia\FacebookGroupService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FacebookGroupController extends Controller
{
    public function __construct(
        private FacebookGroupService $facebookService
    ) {
    }

    /**
     * GET /api/facebook-groups
     * List synced Facebook groups
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

        $query = FacebookGroup::forCompany($company->id)
            ->with('platformAccount')
            ->orderBy('name');

        // Filter by role (admin groups only)
        if ($request->boolean('admin_only')) {
            $query->adminRole();
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $groups = $query->get();

        // Add stats
        $stats = [
            'total_groups' => $groups->count(),
            'admin_groups' => $groups->where('role', 'admin')->count() + $groups->where('role', 'moderator')->count(),
            'total_members' => $groups->sum('member_count'),
        ];

        return response()->json([
            'success' => true,
            'data' => $groups,
            'stats' => $stats,
        ]);
    }

    /**
     * POST /api/facebook-groups/sync
     * Sync groups from Facebook account
     */
    public function sync(Request $request): JsonResponse
    {
        $request->validate([
            'platform_account_id' => 'required|exists:platform_accounts,id',
        ]);

        $user = Auth::user();
        $company = $user->company;

        // Verify platform account belongs to company and is Facebook
        $account = PlatformAccount::where('id', $request->platform_account_id)
            ->where('company_id', $company->id)
            ->where('platform', 'facebook')
            ->firstOrFail();

        $result = $this->facebookService->syncGroups($account);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'error' => ['message' => $result['error']],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'synced_count' => $result['synced_count'],
                'groups' => $result['groups'],
            ],
            'message' => "Đã đồng bộ {$result['synced_count']} nhóm",
        ]);
    }

    /**
     * GET /api/facebook-groups/{id}
     * Get group details
     */
    public function show(FacebookGroup $facebookGroup): JsonResponse
    {
        $this->authorizeGroup($facebookGroup);

        $facebookGroup->load('platformAccount');

        return response()->json([
            'success' => true,
            'data' => $facebookGroup,
        ]);
    }

    /**
     * POST /api/facebook-groups/{id}/post
     * Post content to a Facebook group
     */
    public function post(Request $request, FacebookGroup $facebookGroup): JsonResponse
    {
        $this->authorizeGroup($facebookGroup);

        $request->validate([
            'content' => 'required|string|max:10000',
            'media_urls' => 'nullable|array',
            'media_urls.*' => 'url',
        ]);

        $account = $facebookGroup->platformAccount;

        $result = $this->facebookService->postToGroup(
            $account,
            $facebookGroup,
            $request->content,
            $request->media_urls ?? []
        );

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'error' => ['message' => $result['error']],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'post_id' => $result['post_id'],
                'group_id' => $facebookGroup->id,
            ],
            'message' => 'Đã đăng bài thành công',
        ]);
    }

    /**
     * GET /api/facebook-groups/{id}/members
     * Get group members (admin only)
     */
    public function members(Request $request, FacebookGroup $facebookGroup): JsonResponse
    {
        $this->authorizeGroup($facebookGroup);

        if (!$facebookGroup->isAdmin()) {
            return response()->json([
                'success' => false,
                'error' => ['message' => 'Bạn cần là Admin để xem thành viên'],
            ], 403);
        }

        $account = $facebookGroup->platformAccount;
        $limit = $request->get('limit', 50);

        $result = $this->facebookService->getGroupMembers($account, $facebookGroup, $limit);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'error' => ['message' => $result['error']],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => $result['members'],
            'pending_count' => $result['pending_count'],
        ]);
    }

    /**
     * GET /api/facebook-groups/{id}/pending-members
     * Get pending member requests (admin only)
     */
    public function pendingMembers(FacebookGroup $facebookGroup): JsonResponse
    {
        $this->authorizeGroup($facebookGroup);

        if (!$facebookGroup->isAdmin()) {
            return response()->json([
                'success' => false,
                'error' => ['message' => 'Bạn cần là Admin để xem yêu cầu'],
            ], 403);
        }

        $account = $facebookGroup->platformAccount;

        $result = $this->facebookService->getPendingMembers($account, $facebookGroup);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'error' => ['message' => $result['error']],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => $result['pending'],
        ]);
    }

    /**
     * POST /api/facebook-groups/{id}/approve-member
     * Approve a pending member request
     */
    public function approveMember(Request $request, FacebookGroup $facebookGroup): JsonResponse
    {
        $this->authorizeGroup($facebookGroup);

        $request->validate([
            'user_id' => 'required|string',
        ]);

        if (!$facebookGroup->isAdmin()) {
            return response()->json([
                'success' => false,
                'error' => ['message' => 'Bạn cần là Admin để duyệt thành viên'],
            ], 403);
        }

        $account = $facebookGroup->platformAccount;

        $result = $this->facebookService->acceptMemberRequest(
            $account,
            $facebookGroup,
            $request->user_id
        );

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'error' => ['message' => $result['error']],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã duyệt thành viên',
        ]);
    }

    /**
     * PUT /api/facebook-groups/{id}
     * Update group settings
     */
    public function update(Request $request, FacebookGroup $facebookGroup): JsonResponse
    {
        $this->authorizeGroup($facebookGroup);

        $request->validate([
            'is_active' => 'sometimes|boolean',
            'auto_post_enabled' => 'sometimes|boolean',
        ]);

        $facebookGroup->update($request->only([
            'is_active',
            'auto_post_enabled',
        ]));

        return response()->json([
            'success' => true,
            'data' => $facebookGroup,
            'message' => 'Đã cập nhật cài đặt nhóm',
        ]);
    }

    // ===========================================
    // HELPER METHODS
    // ===========================================

    private function authorizeGroup(FacebookGroup $group): void
    {
        $user = Auth::user();
        $company = $user->company;

        if ($group->company_id !== $company->id) {
            abort(403, 'Bạn không có quyền truy cập nhóm này');
        }
    }
}
