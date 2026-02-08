<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use App\Services\CompanyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CompanyController extends Controller
{
    public function __construct(
        private CompanyService $companyService
    ) {
    }
    /**
     * Get current user's company.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $company = $user->company;

        if (!$company) {
            return response()->json([
                'message' => 'Chưa có doanh nghiệp',
                'data' => null,
            ]);
        }

        return response()->json([
            'data' => [
                'company' => $company,
                'role' => $user->company_role,
                'is_owner' => $user->isCompanyOwner(),
                'is_admin' => $user->isCompanyAdmin(),
            ],
        ]);
    }

    /**
     * Get company statistics.
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();
        $company = $user->company;

        if (!$company) {
            return response()->json(['message' => 'Không tìm thấy doanh nghiệp'], 404);
        }

        $stats = $this->companyService->getStats($company);
        $metrics = $this->companyService->getQuickMetrics($company);

        return response()->json([
            'data' => [
                'stats' => $stats,
                'metrics' => $metrics,
            ],
        ]);
    }

    /**
     * Get recent company activities.
     */
    public function activities(Request $request): JsonResponse
    {
        $user = $request->user();
        $company = $user->company;

        if (!$company) {
            return response()->json(['message' => 'Không tìm thấy doanh nghiệp'], 404);
        }

        $limit = $request->input('limit', 10);
        $activities = $this->companyService->getActivities($company, $limit);

        return response()->json([
            'data' => $activities,
        ]);
    }

    /**
     * Create a new company.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->company_id) {
            return response()->json([
                'message' => 'Bạn đã thuộc một doanh nghiệp khác',
            ], 422);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'industry' => 'nullable|string|max:100',
            'size' => 'nullable|in:1-10,11-50,51-200,201-500,500+',
            'website' => 'nullable|url|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:50',
        ]);

        $company = Company::create([
            ...$validated,
            'owner_id' => $user->id,
        ]);

        // Update user as owner
        $user->update([
            'company_id' => $company->id,
            'company_role' => 'owner',
        ]);

        return response()->json([
            'message' => 'Tạo doanh nghiệp thành công',
            'data' => $company,
        ], 201);
    }

    /**
     * Update company.
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        $company = $user->company;

        if (!$company) {
            return response()->json(['message' => 'Không tìm thấy doanh nghiệp'], 404);
        }

        if (!$user->isCompanyAdmin()) {
            return response()->json(['message' => 'Không có quyền chỉnh sửa'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'industry' => 'nullable|string|max:100',
            'size' => 'nullable|in:1-10,11-50,51-200,201-500,500+',
            'website' => 'nullable|url|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:50',
            'logo' => 'nullable|string|max:500',
        ]);

        $company->update($validated);

        return response()->json([
            'message' => 'Cập nhật thành công',
            'data' => $company->fresh(),
        ]);
    }

    /**
     * Get company members.
     */
    public function members(Request $request): JsonResponse
    {
        $user = $request->user();
        $company = $user->company;

        if (!$company) {
            return response()->json(['message' => 'Không tìm thấy doanh nghiệp'], 404);
        }

        $members = $company->members()
            ->select('id', 'name', 'email', 'company_role', 'commission_rate', 'created_at')
            ->orderByRaw("FIELD(company_role, 'owner', 'admin', 'recruiter')")
            ->get();

        // Get per-member stats
        $memberStats = $this->companyService->getMemberStats($company);

        // Attach stats to each member
        $membersWithStats = $members->map(function ($member) use ($memberStats) {
            return [
                'id' => $member->id,
                'name' => $member->name,
                'email' => $member->email,
                'company_role' => $member->company_role,
                'commission_rate' => (float) ($member->commission_rate ?? 0),
                'created_at' => $member->created_at,
                'stats' => $memberStats[$member->id] ?? [
                    'hired_count' => 0,
                    'interviews_count' => 0,
                    'candidates_count' => 0,
                ],
            ];
        });

        return response()->json([
            'data' => $membersWithStats,
        ]);
    }

    /**
     * Invite a new member.
     */
    public function inviteMember(Request $request): JsonResponse
    {
        $user = $request->user();
        $company = $user->company;

        if (!$company) {
            return response()->json(['message' => 'Không tìm thấy doanh nghiệp'], 404);
        }

        if (!$user->canManageCompanyMembers()) {
            return response()->json(['message' => 'Không có quyền mời thành viên'], 403);
        }

        $validated = $request->validate([
            'email' => 'required|email',
            'name' => 'required|string|max:255',
            'password' => 'required|string|min:8',
            'role' => ['required', Rule::in(['admin', 'member', 'recruiter'])],
        ]);

        // Check if email exists
        $existingUser = User::where('email', $validated['email'])->first();

        if ($existingUser) {
            if ($existingUser->company_id) {
                return response()->json([
                    'message' => 'Email này đã thuộc doanh nghiệp khác',
                ], 422);
            }

            // Add existing user to company
            $existingUser->update([
                'company_id' => $company->id,
                'company_role' => $validated['role'],
            ]);

            return response()->json([
                'message' => 'Đã thêm thành viên vào doanh nghiệp',
                'data' => $existingUser->only(['id', 'name', 'email', 'company_role']),
            ]);
        }

        // Create new user with provided password
        $newUser = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'company_id' => $company->id,
            'company_role' => $validated['role'],
        ]);

        return response()->json([
            'message' => 'Đã tạo tài khoản thành viên thành công',
            'data' => $newUser->only(['id', 'name', 'email', 'company_role']),
        ], 201);
    }

    /**
     * Update member role.
     */
    public function updateMember(Request $request, int $memberId): JsonResponse
    {
        $user = $request->user();
        $company = $user->company;

        if (!$company) {
            return response()->json(['message' => 'Không tìm thấy doanh nghiệp'], 404);
        }

        if (!$user->canManageCompanyMembers()) {
            return response()->json(['message' => 'Không có quyền chỉnh sửa'], 403);
        }

        $member = User::where('id', $memberId)
            ->where('company_id', $company->id)
            ->first();

        if (!$member) {
            return response()->json(['message' => 'Không tìm thấy thành viên'], 404);
        }

        // Cannot change owner's role
        if ($member->isCompanyOwner()) {
            return response()->json(['message' => 'Không thể thay đổi quyền của chủ doanh nghiệp'], 422);
        }

        $validated = $request->validate([
            'role' => ['sometimes', 'required', Rule::in(['admin', 'recruiter'])],
            'commission_rate' => ['sometimes', 'numeric', 'min:0', 'max:100'],
        ]);

        $updateData = [];
        if (isset($validated['role'])) {
            $updateData['company_role'] = $validated['role'];
        }
        if (isset($validated['commission_rate'])) {
            $updateData['commission_rate'] = $validated['commission_rate'];
        }

        if (!empty($updateData)) {
            $member->update($updateData);
        }

        return response()->json([
            'message' => 'Cập nhật quyền thành công',
            'data' => $member->only(['id', 'name', 'email', 'company_role', 'commission_rate']),
        ]);
    }

    /**
     * Remove member from company.
     */
    public function removeMember(Request $request, int $memberId): JsonResponse
    {
        $user = $request->user();
        $company = $user->company;

        if (!$company) {
            return response()->json(['message' => 'Không tìm thấy doanh nghiệp'], 404);
        }

        if (!$user->canManageCompanyMembers()) {
            return response()->json(['message' => 'Không có quyền xóa thành viên'], 403);
        }

        $member = User::where('id', $memberId)
            ->where('company_id', $company->id)
            ->first();

        if (!$member) {
            return response()->json(['message' => 'Không tìm thấy thành viên'], 404);
        }

        // Cannot remove owner
        if ($member->isCompanyOwner()) {
            return response()->json(['message' => 'Không thể xóa chủ doanh nghiệp'], 422);
        }

        // Cannot remove self
        if ($member->id === $user->id) {
            return response()->json(['message' => 'Không thể tự xóa chính mình'], 422);
        }

        $member->update([
            'company_id' => null,
            'company_role' => 'recruiter',
        ]);

        return response()->json([
            'message' => 'Đã xóa thành viên khỏi doanh nghiệp',
        ]);
    }
}
