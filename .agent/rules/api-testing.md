---
trigger: always_on
description: API Testing Standards - Seeders, Factories, và test data patterns cho dự án tuyển dụng
---

# Rules: API Testing Standards

## 1. Test Account Credentials

### Development/Testing Accounts
```php
// Employer Account (Owner)
Email: admin@example.com
Password: password123

// Candidate Account
Email: admin@example.com
Password: password123

// Admin Account (Member)
Email: admin@example.com
Password: password123
```

## 2. Seeder Standards

### Master DatabaseSeeder
```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Base seeders (required for app to function)
        $this->call([
            PackageSeeder::class,      // Subscription packages
            SeatPackageSeeder::class,  // Seat-based pricing
        ]);

        // 2. Demo data (for testing)
        $this->call([
            UserSeeder::class,         // Test users
            CompanySeeder::class,      // Companies
            JobSeeder::class,          // Job listings
            CandidateSeeder::class,    // Candidates
        ]);
    }
}
```

### UserSeeder Template
```php
<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Employer (Owner) - có full quyền
        User::factory()->create([
            'name' => 'Nhà Tuyển Dụng Demo',
            'email' => 'employer@example.com',
            'password' => Hash::make('password'),
        ]);

        // Candidate - ứng viên
        User::factory()->create([
            'name' => 'Ứng Viên Demo',
            'email' => 'candidate@example.com',
            'password' => Hash::make('password'),
            'user_type' => 'candidate',
        ]);

        // Admin Member - nhân viên
        User::factory()->create([
            'name' => 'Admin Demo',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);
    }
}
```

### CompanySeeder Template
```php
<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Seeder;

class CompanySeeder extends Seeder
{
    public function run(): void
    {
        $employer = User::where('email', 'employer@example.com')->first();

        $company = Company::create([
            'name' => 'Công Ty Demo',
            'slug' => 'cong-ty-demo',
            'description' => 'Công ty demo để test các tính năng',
            'industry' => 'technology',
            'size' => '50-200',
            'address' => 'TP.HCM',
            'website' => 'https://demo.com',
            'logo_url' => null,
        ]);

        // Attach owner
        $company->users()->attach($employer->id, ['role' => 'owner']);

        // Attach admin member
        $admin = User::where('email', 'admin@example.com')->first();
        if ($admin) {
            $company->users()->attach($admin->id, ['role' => 'member']);
        }
    }
}
```

### JobSeeder Template
```php
<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\RecruitmentJob;
use Illuminate\Database\Seeder;

class JobSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('slug', 'cong-ty-demo')->first();
        if (!$company) return;

        $jobs = [
            [
                'title' => 'Senior Backend Developer (Laravel)',
                'department' => 'Engineering',
                'location' => 'TP.HCM',
                'employment_type' => 'full-time',
                'salary_min' => 25000000,
                'salary_max' => 40000000,
                'description' => 'Chúng tôi đang tìm kiếm Backend Developer có kinh nghiệm với Laravel...',
                'requirements' => '3+ năm kinh nghiệm với PHP/Laravel...',
                'benefits' => 'Bảo hiểm sức khỏe, 13 tháng lương...',
                'status' => 'open',
            ],
            [
                'title' => 'Mobile Developer (React Native)',
                'department' => 'Engineering',
                'location' => 'Remote',
                'employment_type' => 'full-time',
                'salary_min' => 20000000,
                'salary_max' => 35000000,
                'description' => 'Phát triển ứng dụng mobile với React Native...',
                'status' => 'open',
            ],
            [
                'title' => 'UI/UX Designer',
                'department' => 'Design',
                'location' => 'TP.HCM',
                'employment_type' => 'full-time',
                'status' => 'draft',
            ],
            [
                'title' => 'HR Manager',
                'department' => 'Human Resources',
                'location' => 'Hà Nội',
                'status' => 'closed',
            ],
        ];

        foreach ($jobs as $jobData) {
            RecruitmentJob::create([
                'company_id' => $company->id,
                'created_by_user_id' => $company->users()->first()->id,
                ...$jobData,
            ]);
        }
    }
}
```

### CandidateSeeder Template
```php
<?php

namespace Database\Seeders;

use App\Models\Candidate;
use App\Models\Company;
use Illuminate\Database\Seeder;

class CandidateSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::where('slug', 'cong-ty-demo')->first();
        if (!$company) return;

        $candidates = [
            ['full_name' => 'Nguyễn Văn Bình', 'email' => 'binh.nguyen@gmail.com', 'phone' => '0901122334', 'source' => 'referral', 'tags' => ['developer', 'experienced'], 'rating' => 4],
            ['full_name' => 'Hoàng Thị Linh', 'email' => 'linh.hoang@gmail.com', 'phone' => '0990011223', 'source' => 'chat', 'tags' => ['developer', 'experienced'], 'rating' => 2],
            ['full_name' => 'Phạm Văn Khải', 'email' => 'khai.pham@gmail.com', 'phone' => '0989900112', 'source' => 'import', 'tags' => ['developer', 'experienced'], 'rating' => 2],
            // Thêm nhiều candidates...
        ];

        $user = $company->users()->first();

        foreach ($candidates as $data) {
            Candidate::create([
                'company_id' => $company->id,
                'created_by_user_id' => $user->id,
                'status' => 'active',
                ...$data,
            ]);
        }
    }
}
```

## 3. Factory Patterns

### User Factory
```php
<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    // State: Candidate
    public function candidate(): static
    {
        return $this->state(fn (array $attributes) => [
            'user_type' => 'candidate',
        ]);
    }

    // State: Employer 
    public function employer(): static
    {
        return $this->state(fn (array $attributes) => [
            'user_type' => 'employer',
        ]);
    }
}
```

## 4. Artisan Commands

### Seed Commands
```bash
# Fresh migrate + seed all
php artisan migrate:fresh --seed

# Run specific seeder
php artisan db:seed --class=UserSeeder
php artisan db:seed --class=CompanySeeder
php artisan db:seed --class=JobSeeder
php artisan db:seed --class=CandidateSeeder

# Reset and re-seed
php artisan migrate:refresh --seed
```

### Create Seeder Commands
```bash
# Create new seeder
php artisan make:seeder CandidateSeeder

# Create factory
php artisan make:factory CandidateFactory --model=Candidate
```

## 5. API Testing với cURL

### Login to get token
```bash
# Login as employer
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"employer@example.com","password":"password"}'
```

### Test Authenticated Endpoints
```bash
# Get jobs list
curl -X GET http://localhost:8000/api/recruiting/jobs \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"

# Get candidates
curl -X GET http://localhost:8000/api/candidates \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"

# Create job
curl -X POST http://localhost:8000/api/recruiting/jobs \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "title": "New Job",
    "department": "Engineering",
    "location": "Remote",
    "employment_type": "full-time",
    "status": "draft"
  }'
```

## 6. Browser Testing Checklist

### Test Pages
```
- http://localhost:3000/                  # Landing page
- http://localhost:3000/login             # Login
- http://localhost:3000/register          # Register choice
- http://localhost:3000/employer/dashboard # Employer dashboard
- http://localhost:3000/employer/jobs     # Jobs management
- http://localhost:3000/employer/candidates # Candidates
- http://localhost:3000/jobs              # Public jobs
```

### Test Scenarios
```
[ ] Login as employer@example.com
[ ] View dashboard stats
[ ] Create/Edit/Delete job
[ ] View candidates list
[ ] Filter candidates by status/source
[ ] Rate candidate
[ ] Add new candidate manually
[ ] Logout and login as candidate@example.com
[ ] View public jobs
[ ] Apply to job
```

## 7. Docker Commands

```bash
# Run seeders in Docker
docker compose exec app php artisan migrate:fresh --seed

# Run specific seeder
docker compose exec app php artisan db:seed --class=JobSeeder

# Check database
docker compose exec app php artisan tinker
# > User::count()
# > Company::with('users')->first()
# > RecruitmentJob::where('status', 'open')->count()
```

## 8. Checklist

```
[ ] UserSeeder tạo test accounts (employer, candidate, admin)
[ ] CompanySeeder tạo demo company và attach users
[ ] JobSeeder tạo jobs với các status khác nhau (open, draft, paused, closed)
[ ] CandidateSeeder tạo candidates với tags, ratings
[ ] DatabaseSeeder gọi đúng thứ tự (base → demo)
[ ] Factory có states cho các user types
[ ] Có thể migrate:fresh --seed không lỗi
[ ] API endpoints trả về data đúng format
```