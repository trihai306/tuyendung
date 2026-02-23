<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\CompanyMember;
use App\Models\EmployerProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TeamSeeder extends Seeder
{
    /**
     * Seed team members for trihai306@gmail.com.
     */
    public function run(): void
    {
        // Find or create the owner user
        $owner = User::firstOrCreate(
            ['email' => 'trihai306@gmail.com'],
            [
                'name' => 'Tri Hai',
                'password' => Hash::make('password'),
                'roles' => ['employer'],
            ]
        );

        // Ensure employer role
        $owner->addRole('employer');

        // Find or create the employer profile
        $company = EmployerProfile::firstOrCreate(
            ['user_id' => $owner->id],
            [
                'company_name' => 'Tri Hai Company',
                'industry' => 'Tuyen dung',
                'company_size' => '10-50',
                'city' => 'Ho Chi Minh',
                'description' => 'Cong ty tuyen dung chuyen nghiep',
            ]
        );

        // Ensure owner record in company_members
        CompanyMember::firstOrCreate(
            [
                'employer_profile_id' => $company->id,
                'user_id' => $owner->id,
            ],
            [
                'role' => 'owner',
                'status' => 'active',
                'invited_at' => now(),
                'joined_at' => now(),
            ]
        );

        // Create team members
        $members = [
            [
                'name' => 'Nguyen Van An',
                'email' => 'an.nguyen@example.com',
                'role' => 'manager',
            ],
            [
                'name' => 'Tran Thi Binh',
                'email' => 'binh.tran@example.com',
                'role' => 'manager',
            ],
            [
                'name' => 'Le Van Cuong',
                'email' => 'cuong.le@example.com',
                'role' => 'member',
            ],
            [
                'name' => 'Pham Thi Dao',
                'email' => 'dao.pham@example.com',
                'role' => 'member',
            ],
            [
                'name' => 'Hoang Van Em',
                'email' => 'em.hoang@example.com',
                'role' => 'member',
            ],
        ];

        foreach ($members as $memberData) {
            $user = User::firstOrCreate(
                ['email' => $memberData['email']],
                [
                    'name' => $memberData['name'],
                    'password' => Hash::make('password'),
                    'roles' => ['employer'],
                ]
            );

            $user->addRole('employer');

            CompanyMember::firstOrCreate(
                [
                    'employer_profile_id' => $company->id,
                    'user_id' => $user->id,
                ],
                [
                    'role' => $memberData['role'],
                    'status' => 'active',
                    'invited_by' => $owner->id,
                    'invited_at' => now(),
                    'joined_at' => now(),
                ]
            );
        }
    }
}
