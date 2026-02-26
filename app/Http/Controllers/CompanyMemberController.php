<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\InviteMemberRequest;
use App\Models\CompanyMember;
use App\Models\EmployerProfile;
use App\Services\CompanyMemberService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CompanyMemberController extends Controller
{
    public function __construct(
        private readonly CompanyMemberService $memberService
    ) {
    }

    /**
     * List all team members of the company.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $company = $user->getCompany();
        abort_unless($company, 403, 'Ban chua co thong tin cong ty.');

        $this->memberService->ensureOwner($company);

        $members = $company->members()
            ->with(['user', 'invitedByUser', 'manager'])
            ->orderByRaw("FIELD(role, 'owner', 'manager', 'member')")
            ->paginate(15)
            ->withQueryString();

        // Get managers for assignment dropdown
        $managers = $company->members()
            ->active()
            ->whereIn('role', ['owner', 'manager'])
            ->with('user')
            ->get()
            ->map(fn(CompanyMember $m) => [
                'id' => $m->user_id,
                'name' => $m->user?->name,
                'email' => $m->user?->email,
                'avatar' => $m->user?->avatar,
                'role' => $m->role,
            ]);

        // Pass stats separately since they need full-set counts
        $totalActive = $company->members()->where('status', 'active')->count();
        $managersCount = $company->members()
            ->where('status', 'active')
            ->whereIn('role', ['owner', 'manager'])
            ->count();
        $pendingCount = $company->members()->where('status', 'pending')->count();

        return Inertia::render('Employer/Team/Index', [
            'members' => $members,
            'company' => $company,
            'currentUserRole' => $company->members()->where('user_id', $user->id)->first()?->role,
            'inviteCode' => $company->invite_code,
            'managers' => $managers,
            'stats' => [
                'total' => $totalActive,
                'managers' => $managersCount,
                'pending' => $pendingCount,
            ],
        ]);
    }

    /**
     * Employee joins a company using invite code.
     */
    public function joinByCode(Request $request): RedirectResponse
    {
        $request->validate([
            'invite_code' => ['required', 'string', 'size:6'],
        ]);

        $user = $request->user();
        $code = strtoupper($request->input('invite_code'));

        $company = EmployerProfile::where('invite_code', $code)->first();
        if (!$company) {
            return redirect()->back()->withErrors(['invite_code' => 'Ma tham gia khong hop le.']);
        }

        // Check if already a member
        $existing = CompanyMember::where('employer_profile_id', $company->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            return redirect()->back()->withErrors(['invite_code' => 'Ban da la thanh vien cua cong ty nay.']);
        }

        // Add user as employer role if not already
        if (!$user->isEmployer()) {
            $user->addRole('employer');
            $user->save();
        }

        // Create employer profile for user if they don't have one
        if (!$user->employerProfile) {
            EmployerProfile::create([
                'user_id' => $user->id,
                'company_name' => $company->company_name,
            ]);
        }

        // Create member record
        CompanyMember::create([
            'employer_profile_id' => $company->id,
            'user_id' => $user->id,
            'role' => 'member',
            'status' => 'active',
            'joined_at' => now(),
        ]);

        return redirect()->route('employer.team.index')
            ->with('success', 'Ban da tham gia ' . $company->company_name . ' thanh cong!');
    }

    /**
     * Regenerate the invite code.
     */
    public function regenerateCode(Request $request): RedirectResponse
    {
        $user = $request->user();
        $company = $user->getCompany();
        abort_unless($company, 403);

        $membership = CompanyMember::where('employer_profile_id', $company->id)
            ->where('user_id', $user->id)
            ->first();
        abort_unless($membership?->isOwner(), 403, 'Chi chu cong ty moi co the tao ma moi.');

        $company->regenerateInviteCode();

        return redirect()->back()
            ->with('success', 'Da tao ma tham gia moi thanh cong.');
    }

    /**
     * Invite a new member to the company.
     */
    public function store(InviteMemberRequest $request): RedirectResponse
    {
        $user = $request->user();
        $company = $user->getCompany();
        abort_unless($company, 403, 'Ban chua co thong tin cong ty.');

        // Only owner and manager can invite
        $membership = CompanyMember::where('employer_profile_id', $company->id)
            ->where('user_id', $user->id)
            ->first();
        abort_unless($membership?->canAssignTasks(), 403, 'Ban khong co quyen moi thanh vien.');

        $this->memberService->inviteMember($company, $request->validated(), $user);

        return redirect()->back()
            ->with('success', 'Da moi thanh vien thanh cong.');
    }

    /**
     * Update a member's role.
     */
    public function update(Request $request, CompanyMember $member): RedirectResponse
    {
        $user = $request->user();
        $company = $user->getCompany();
        abort_unless($company, 403);
        abort_if($member->employer_profile_id !== $company->id, 403);

        // Only owner can change roles
        $ownership = CompanyMember::where('employer_profile_id', $company->id)
            ->where('user_id', $user->id)
            ->first();
        abort_unless($ownership?->isOwner(), 403, 'Chi chu cong ty moi co the doi vai tro.');

        // Cannot change own role
        abort_if($member->user_id === $user->id, 422, 'Khong the doi vai tro cua chinh minh.');

        $request->validate([
            'role' => ['required', 'in:manager,member'],
        ]);

        $this->memberService->updateRole($member, $request->input('role'));

        return redirect()->back()
            ->with('success', 'Da cap nhat vai tro thanh cong.');
    }

    /**
     * Remove a member from the company.
     */
    public function destroy(Request $request, CompanyMember $member): RedirectResponse
    {
        $user = $request->user();
        $company = $user->getCompany();
        abort_unless($company, 403);
        abort_if($member->employer_profile_id !== $company->id, 403);

        // Only owner can remove members
        $ownership = CompanyMember::where('employer_profile_id', $company->id)
            ->where('user_id', $user->id)
            ->first();
        abort_unless($ownership?->canAssignTasks(), 403, 'Ban khong co quyen xoa thanh vien.');

        // Cannot remove owner
        abort_if($member->isOwner(), 422, 'Khong the xoa chu cong ty.');

        $this->memberService->removeMember($member);

        return redirect()->back()
            ->with('success', 'Da xoa thanh vien thanh cong.');
    }

    /**
     * Assign a manager to supervise a member.
     */
    public function assignManager(Request $request, CompanyMember $member): RedirectResponse
    {
        $user = $request->user();
        $company = $user->getCompany();
        abort_unless($company, 403);
        abort_if($member->employer_profile_id !== $company->id, 403);

        // Only owner/manager can assign
        $ownership = CompanyMember::where('employer_profile_id', $company->id)
            ->where('user_id', $user->id)
            ->first();
        abort_unless($ownership?->canAssignTasks(), 403, 'Ban khong co quyen gan phu trach.');

        // Only assign to members (not owner/manager)
        abort_unless($member->role === 'member', 422, 'Chi co the gan phu trach cho nhan vien.');

        $request->validate([
            'managed_by' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $managerId = $request->input('managed_by');

        // Verify the manager belongs to this company and is owner/manager
        if ($managerId) {
            $managerMember = CompanyMember::where('employer_profile_id', $company->id)
                ->where('user_id', $managerId)
                ->active()
                ->first();
            abort_unless($managerMember && $managerMember->canAssignTasks(), 422, 'Nguoi nay khong phai quan ly.');
        }

        $member->update(['managed_by' => $managerId]);

        return redirect()->back()
            ->with('success', 'Da cap nhat phu trach thanh cong.');
    }
}
