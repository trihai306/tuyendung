<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\RecruitmentJob;
use App\Models\User;
use Illuminate\Database\Seeder;

class JobSeeder extends Seeder
{
    public function run(): void
    {
        // Get first company
        $company = Company::first();
        if (!$company) {
            $this->command->warn('No company found. Run CompanySeeder first.');
            return;
        }

        // Get owner user
        $user = $company->owner;
        if (!$user) {
            $this->command->warn('No owner found for company.');
            return;
        }

        $jobs = [
            [
                'title' => 'Nhân viên phục vụ',
                'department' => 'F&B (Nhà hàng, Quán cafe)',
                'location' => 'Quận 1, TP.HCM',
                'job_type' => 'part_time',
                'salary_min' => 25000,
                'salary_max' => 35000,
                'salary_currency' => 'VND',
                'description' => 'Phục vụ khách hàng tại nhà hàng, mang đồ ăn, dọn bàn, hỗ trợ bếp khi cần.',
                'requirements' => 'Ngoại hình khá, giao tiếp tốt, chịu được áp lực công việc.',
                'benefits' => 'Tip thêm từ khách, ăn ca, đồng phục miễn phí.',
                'status' => 'open',
                'published_at' => now(),
                'expires_at' => now()->addDays(30),
                'target_count' => 5,
            ],
            [
                'title' => 'PG/PB activation',
                'department' => 'Marketing, Sự kiện',
                'location' => 'Quận 7, TP.HCM',
                'job_type' => 'part_time',
                'salary_min' => 200000,
                'salary_max' => 350000,
                'salary_currency' => 'VND',
                'description' => 'Activation tại siêu thị và trung tâm thương mại, giới thiệu sản phẩm đến khách hàng.',
                'requirements' => 'Nữ, cao từ 1m58, ngoại hình ưa nhìn, năng động.',
                'benefits' => 'Thưởng theo doanh số, linh hoạt thời gian.',
                'status' => 'open',
                'published_at' => now(),
                'expires_at' => now()->addDays(14),
                'target_count' => 10,
            ],
            [
                'title' => 'Nhân viên kho Shopee',
                'department' => 'Logistics, Kho bãi',
                'location' => 'Khu công nghệ cao, Q.9, TP.HCM',
                'job_type' => 'full_time',
                'salary_min' => 5000000,
                'salary_max' => 7000000,
                'salary_currency' => 'VND',
                'description' => 'Nhận, kiểm tra hàng hóa, sắp xếp kho, đóng gói đơn hàng.',
                'requirements' => 'Nam/nữ 18-35 tuổi, sức khỏe tốt, chịu khó.',
                'benefits' => 'BHXH đầy đủ, thưởng tháng 13, xe đưa đón.',
                'status' => 'open',
                'published_at' => now()->subDays(5),
                'expires_at' => now()->addDays(25),
                'target_count' => 20,
            ],
            [
                'title' => 'Gia sư Toán lớp 12',
                'department' => 'Giáo dục',
                'location' => 'Quận Bình Thạnh, TP.HCM',
                'job_type' => 'part_time',
                'salary_min' => 150000,
                'salary_max' => 250000,
                'salary_currency' => 'VND',
                'description' => 'Dạy kèm Toán cho học sinh lớp 12 chuẩn bị thi đại học.',
                'requirements' => 'Sinh viên năm 3+ hoặc tốt nghiệp ngành Toán, Kinh tế. Có kinh nghiệm gia sư.',
                'benefits' => 'Được booking thêm nhiều buổi, thưởng khi học sinh đỗ.',
                'status' => 'open',
                'published_at' => now(),
                'expires_at' => now()->addDays(60),
                'target_count' => 1,
            ],
            [
                'title' => 'Lễ tân khách sạn',
                'department' => 'Khách sạn, Nhà hàng',
                'location' => 'Quận 3, TP.HCM',
                'job_type' => 'full_time',
                'salary_min' => 6000000,
                'salary_max' => 9000000,
                'salary_currency' => 'VND',
                'description' => 'Tiếp đón khách check-in/check-out, giải đáp thắc mắc, hỗ trợ đặt phòng.',
                'requirements' => 'Tiếng Anh giao tiếp tốt, ngoại hình chuyên nghiệp, làm việc ca.',
                'benefits' => 'Bảo hiểm, ăn ca, thưởng lễ tết.',
                'status' => 'draft',
                'target_count' => 2,
            ],
        ];

        foreach ($jobs as $jobData) {
            RecruitmentJob::create([
                'user_id' => $user->id,
                ...$jobData,
            ]);
        }

        $this->command->info('✅ Created ' . count($jobs) . ' sample recruitment jobs');
    }
}
