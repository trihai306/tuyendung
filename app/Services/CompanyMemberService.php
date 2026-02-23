<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\CompanyMember;
use App\Models\EmployerProfile;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CompanyMemberService
{
    /**
     * Invite a member to the company by email.
     * Creates a new user if not found.
     */
    public function inviteMember(EmployerProfile $company, array $data, User $invitedBy): CompanyMember
    {
        return DB::transaction(function () use ($company, $data, $invitedBy) {
            $email = $data['email'];
            $role = $data['role'] ?? 'member';

            // Find existing user or create a new one
            $user = User::where('email', $email)->first();

            if (!$user) {
                $user = User::create([
                    'name' => $data['name'] ?? explode('@', $email)[0],
                    'email' => $email,
                    'password' => Hash::make(Str::random(16)),
                    'roles' => ['employer'],
                ]);
            } else {
                // Add employer role if not present
                $user->addRole('employer');
            }

            // Check if already a member
            $existing = CompanyMember::where('employer_profile_id', $company->id)
                ->where('user_id', $user->id)
                ->first();

            if ($existing) {
                // Reactivate if inactive
                if ($existing->status === 'inactive') {
                    $existing->update([
                        'status' => 'pending',
                        'role' => $role,
                        'invited_by' => $invitedBy->id,
                        'invited_at' => now(),
                    ]);
                }
                return $existing;
            }

            return CompanyMember::create([
                'employer_profile_id' => $company->id,
                'user_id' => $user->id,
                'role' => $role,
                'status' => 'active', // Auto-activate for now
                'invited_by' => $invitedBy->id,
                'invited_at' => now(),
                'joined_at' => now(),
            ]);
        });
    }

    /**
     * Remove a member from the company.
     */
    public function removeMember(CompanyMember $member): void
    {
        $member->update(['status' => 'inactive']);
    }

    /**
     * Update member role.
     */
    public function updateRole(CompanyMember $member, string $role): void
    {
        $member->update(['role' => $role]);
    }

    /**
     * Ensure the owner record exists for a company.
     */
    public function ensureOwner(EmployerProfile $company): CompanyMember
    {
        return CompanyMember::firstOrCreate(
            [
                'employer_profile_id' => $company->id,
                'user_id' => $company->user_id,
            ],
            [
                'role' => 'owner',
                'status' => 'active',
                'invited_at' => now(),
                'joined_at' => now(),
            ]
        );
    }
}
