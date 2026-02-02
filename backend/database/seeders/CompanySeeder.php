<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\User;
use App\Models\RecruitmentJob;
use App\Models\Candidate;
use App\Models\JobApplication;
use App\Models\PipelineStage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class CompanySeeder extends Seeder
{
    public function run(): void
    {
        // Create demo company
        $company = Company::create([
            'name' => 'TechViet Solutions',
            'slug' => 'techviet-solutions-' . Str::random(6),
            'description' => 'TechViet Solutions là công ty công nghệ hàng đầu Việt Nam, chuyên cung cấp giải pháp phần mềm cho doanh nghiệp. Với đội ngũ hơn 100 kỹ sư tài năng, chúng tôi cam kết mang đến những sản phẩm chất lượng cao nhất.',
            'industry' => 'Technology',
            'size' => '51-200',
            'website' => 'https://techviet.example.com',
            'address' => 'Tầng 15, Tòa nhà Landmark 81, Quận Bình Thạnh, TP.HCM',
            'phone' => '028 3823 1234',
            'email' => 'hr@techviet.example.com',
            'status' => 'active',
            'verification_status' => 'verified',
            'verified_at' => now(),
            'balance' => 5000000,
        ]);

        // Create owner
        $owner = User::create([
            'name' => 'Nguyễn Văn An',
            'email' => 'owner@techviet.example.com',
            'password' => Hash::make('password'),
            'company_id' => $company->id,
            'company_role' => 'owner',
        ]);

        $company->update(['owner_id' => $owner->id]);

        // Create admin
        $admin = User::create([
            'name' => 'Trần Thị Bình',
            'email' => 'admin@techviet.example.com',
            'password' => Hash::make('password'),
            'company_id' => $company->id,
            'company_role' => 'admin',
        ]);

        // Create recruiters
        $recruiters = [];
        $recruiterNames = [
            'Lê Văn Cường',
            'Phạm Thị Dung',
            'Hoàng Văn Emer',
        ];

        foreach ($recruiterNames as $name) {
            $recruiters[] = User::create([
                'name' => $name,
                'email' => Str::slug($name) . '@techviet.example.com',
                'password' => Hash::make('password'),
                'company_id' => $company->id,
                'company_role' => 'member',
            ]);
        }

        $allUsers = array_merge([$owner, $admin], $recruiters);

        // Create pipeline stages for owner
        $stages = $this->createPipelineStages($owner->id);

        // Create recruitment jobs
        $jobs = $this->createJobs($allUsers, $company);

        // Create candidates
        $candidates = $this->createCandidates($allUsers);

        // Create job applications with various stages
        $this->createApplications($jobs, $candidates, $stages);

        if ($this->command) {
            $this->command->info('Company seeder completed successfully!');
            $this->command->info("Company: {$company->name}");
            $this->command->info("Owner email: {$owner->email}");
            $this->command->info("Password: password");
        }
    }

    private function createPipelineStages(int $userId): array
    {
        $stagesData = [
            ['name' => 'Mới ứng tuyển', 'slug' => 'new', 'color' => '#6B7280', 'order' => 1],
            ['name' => 'Đang xem xét', 'slug' => 'reviewing', 'color' => '#3B82F6', 'order' => 2],
            ['name' => 'Phỏng vấn', 'slug' => 'interview', 'color' => '#8B5CF6', 'order' => 3],
            ['name' => 'Gửi offer', 'slug' => 'offer', 'color' => '#F59E0B', 'order' => 4],
            ['name' => 'Đã tuyển', 'slug' => 'hired', 'color' => '#10B981', 'order' => 5],
            ['name' => 'Từ chối', 'slug' => 'rejected', 'color' => '#EF4444', 'order' => 6],
        ];

        $stages = [];
        foreach ($stagesData as $data) {
            $stages[$data['slug']] = PipelineStage::firstOrCreate(
                ['user_id' => $userId, 'slug' => $data['slug']],
                $data + ['user_id' => $userId]
            );
        }

        return $stages;
    }

    private function createJobs(array $users, Company $company): array
    {
        $jobsData = [
            [
                'title' => 'Senior Backend Developer (Laravel)',
                'department' => 'Engineering',
                'location' => 'TP.HCM',
                'job_type' => 'full_time',
                'salary_min' => 25000000,
                'salary_max' => 45000000,
                'status' => 'open',
                'description' => 'Tìm kiếm Senior Backend Developer có kinh nghiệm với Laravel framework...',
            ],
            [
                'title' => 'Frontend Developer (React)',
                'department' => 'Engineering',
                'location' => 'TP.HCM',
                'job_type' => 'full_time',
                'salary_min' => 18000000,
                'salary_max' => 35000000,
                'status' => 'open',
                'description' => 'Tuyển Frontend Developer thành thạo React/Next.js...',
            ],
            [
                'title' => 'Product Manager',
                'department' => 'Product',
                'location' => 'TP.HCM',
                'job_type' => 'full_time',
                'salary_min' => 30000000,
                'salary_max' => 50000000,
                'status' => 'open',
                'description' => 'Quản lý sản phẩm và roadmap development...',
            ],
            [
                'title' => 'UX/UI Designer',
                'department' => 'Design',
                'location' => 'TP.HCM / Remote',
                'job_type' => 'full_time',
                'salary_min' => 15000000,
                'salary_max' => 30000000,
                'status' => 'open',
                'description' => 'Thiết kế giao diện người dùng cho các sản phẩm SaaS...',
            ],
            [
                'title' => 'DevOps Engineer',
                'department' => 'Engineering',
                'location' => 'TP.HCM',
                'job_type' => 'full_time',
                'salary_min' => 25000000,
                'salary_max' => 45000000,
                'status' => 'closed',
                'description' => 'Quản lý infrastructure và CI/CD pipeline...',
            ],
            [
                'title' => 'Mobile Developer (React Native)',
                'department' => 'Engineering',
                'location' => 'Remote',
                'job_type' => 'full_time',
                'salary_min' => 20000000,
                'salary_max' => 40000000,
                'status' => 'open',
                'description' => 'Phát triển ứng dụng mobile cross-platform...',
            ],
        ];

        $jobs = [];
        foreach ($jobsData as $index => $data) {
            $user = $users[$index % count($users)];
            $jobs[] = RecruitmentJob::create([
                ...$data,
                'user_id' => $user->id,
                'slug' => Str::slug($data['title']) . '-' . Str::random(6),
                'salary_currency' => 'VND',
                'published_at' => $data['status'] === 'open' ? now()->subDays(rand(1, 30)) : null,
                'target_count' => rand(1, 5),
                'hired_count' => $data['status'] === 'closed' ? rand(1, 3) : 0,
            ]);
        }

        return $jobs;
    }

    private function createCandidates(array $users): array
    {
        $candidatesData = [
            ['full_name' => 'Nguyễn Minh Tuấn', 'email' => 'tuan.nguyen@gmail.com', 'phone' => '0901234567'],
            ['full_name' => 'Trần Thị Hương', 'email' => 'huong.tran@gmail.com', 'phone' => '0912345678'],
            ['full_name' => 'Lê Văn Đức', 'email' => 'duc.le@outlook.com', 'phone' => '0923456789'],
            ['full_name' => 'Phạm Thị Mai', 'email' => 'mai.pham@yahoo.com', 'phone' => '0934567890'],
            ['full_name' => 'Hoàng Văn Phong', 'email' => 'phong.hoang@gmail.com', 'phone' => '0945678901'],
            ['full_name' => 'Nguyễn Thị Lan', 'email' => 'lan.nguyen@gmail.com', 'phone' => '0956789012'],
            ['full_name' => 'Trần Văn Hải', 'email' => 'hai.tran@gmail.com', 'phone' => '0967890123'],
            ['full_name' => 'Lê Thị Hoa', 'email' => 'hoa.le@outlook.com', 'phone' => '0978901234'],
            ['full_name' => 'Phạm Văn Quang', 'email' => 'quang.pham@gmail.com', 'phone' => '0989012345'],
            ['full_name' => 'Hoàng Thị Yến', 'email' => 'yen.hoang@gmail.com', 'phone' => '0990123456'],
            ['full_name' => 'Nguyễn Văn Bình', 'email' => 'binh.nguyen@gmail.com', 'phone' => '0901122334'],
            ['full_name' => 'Trần Thị Cúc', 'email' => 'cuc.tran@gmail.com', 'phone' => '0912233445'],
            ['full_name' => 'Lê Văn Dũng', 'email' => 'dung.le@gmail.com', 'phone' => '0923344556'],
            ['full_name' => 'Phạm Thị Em', 'email' => 'em.pham@gmail.com', 'phone' => '0934455667'],
            ['full_name' => 'Hoàng Văn Phúc', 'email' => 'phuc.hoang@gmail.com', 'phone' => '0945566778'],
            ['full_name' => 'Nguyễn Thị Giang', 'email' => 'giang.nguyen@gmail.com', 'phone' => '0956677889'],
            ['full_name' => 'Trần Văn Hiếu', 'email' => 'hieu.tran@gmail.com', 'phone' => '0967788990'],
            ['full_name' => 'Lê Thị Inh', 'email' => 'inh.le@gmail.com', 'phone' => '0978899001'],
            ['full_name' => 'Phạm Văn Khải', 'email' => 'khai.pham@gmail.com', 'phone' => '0989900112'],
            ['full_name' => 'Hoàng Thị Linh', 'email' => 'linh.hoang@gmail.com', 'phone' => '0990011223'],
        ];

        $sources = ['chat', 'manual', 'import', 'referral'];
        $candidates = [];

        foreach ($candidatesData as $index => $data) {
            $user = $users[$index % count($users)];
            $candidates[] = Candidate::create([
                ...$data,
                'user_id' => $user->id,
                'source' => $sources[array_rand($sources)],
                'status' => 'active',
                'rating' => rand(1, 5),
                'tags' => json_encode(['developer', 'experienced']),
            ]);
        }

        return $candidates;
    }

    private function createApplications(array $jobs, array $candidates, array $stages): void
    {
        $stageKeys = ['new', 'reviewing', 'interview', 'offer', 'hired', 'rejected'];

        foreach ($jobs as $job) {
            // Random number of applications per job
            $numApplications = rand(3, 8);
            $shuffledCandidates = collect($candidates)->shuffle()->take($numApplications);

            foreach ($shuffledCandidates as $candidate) {
                $stageKey = $stageKeys[array_rand($stageKeys)];
                $stage = $stages[$stageKey];

                $createdAt = Carbon::now()->subDays(rand(1, 60));
                $stageEnteredAt = $createdAt->copy()->addHours(rand(1, 48));

                $application = JobApplication::create([
                    'job_id' => $job->id,
                    'candidate_id' => $candidate->id,
                    'stage_id' => $stage->id,
                    'stage_entered_at' => $stageEnteredAt,
                    'created_at' => $createdAt,
                    'updated_at' => $stageEnteredAt,
                ]);

                // Add interview schedule for interview stage
                if ($stageKey === 'interview') {
                    $application->update([
                        'interview_scheduled_at' => Carbon::now()->addDays(rand(1, 7)),
                    ]);
                }

                // Add offer details for offer/hired stages
                if (in_array($stageKey, ['offer', 'hired'])) {
                    $application->update([
                        'offer_amount' => rand(15, 50) * 1000000,
                    ]);
                }

                // Add hired date for hired stage
                if ($stageKey === 'hired') {
                    $application->update([
                        'hired_at' => $stageEnteredAt->copy()->addDays(rand(1, 7)),
                    ]);
                }

                // Add rejection reason for rejected
                if ($stageKey === 'rejected') {
                    $reasons = [
                        'Không phù hợp yêu cầu kỹ thuật',
                        'Kỳ vọng lương quá cao',
                        'Ứng viên rút hồ sơ',
                        'Không đạt phỏng vấn',
                    ];
                    $application->update([
                        'rejection_reason' => $reasons[array_rand($reasons)],
                    ]);
                }
            }
        }
    }
}
