<?php

namespace Database\Seeders;

use App\Models\Package;
use Illuminate\Database\Seeder;

class PackageSeeder extends Seeder
{
    public function run(): void
    {
        $packages = [
            [
                'name' => 'Starter',
                'slug' => 'starter',
                'description' => 'Gói miễn phí dành cho doanh nghiệp nhỏ mới bắt đầu tuyển dụng',
                'price' => 0,
                'duration_days' => 365,
                'max_jobs' => 3,
                'max_candidates' => 50,
                'max_users' => 2,
                'max_social_accounts' => 1,
                'features' => [
                    'Hộp thư đến cơ bản',
                    'Quản lý pipeline tuyển dụng',
                    '3 tin tuyển dụng hoạt động',
                    '50 hồ sơ ứng viên',
                    '2 thành viên',
                    '1 tài khoản mạng xã hội',
                    'Báo cáo cơ bản',
                    'Hỗ trợ qua email',
                ],
                'is_active' => true,
                'is_popular' => false,
                'sort_order' => 1,
            ],
            [
                'name' => 'Professional',
                'slug' => 'professional',
                'description' => 'Gói chuyên nghiệp với đầy đủ tính năng AI cho doanh nghiệp vừa',
                'price' => 499000,
                'duration_days' => 30,
                'max_jobs' => 20,
                'max_candidates' => 500,
                'max_users' => 5,
                'max_social_accounts' => 5,
                'features' => [
                    'Tất cả tính năng Starter',
                    'AI sàng lọc CV tự động',
                    'Auto-response chatbot',
                    '5 tài khoản Zalo/Facebook',
                    '20 tin tuyển dụng',
                    '500 hồ sơ ứng viên',
                    '5 thành viên',
                    'Báo cáo nâng cao',
                    'Export dữ liệu CSV/Excel',
                    'Hỗ trợ ưu tiên',
                ],
                'is_active' => true,
                'is_popular' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Enterprise',
                'slug' => 'enterprise',
                'description' => 'Gói doanh nghiệp lớn với tính năng không giới hạn và hỗ trợ cao cấp',
                'price' => 1499000,
                'duration_days' => 30,
                'max_jobs' => -1,
                'max_candidates' => -1,
                'max_users' => 20,
                'max_social_accounts' => -1,
                'features' => [
                    'Tất cả tính năng Professional',
                    'Không giới hạn tin tuyển dụng',
                    'Không giới hạn ứng viên',
                    'Không giới hạn tài khoản mạng xã hội',
                    '20 thành viên (có thể mở rộng)',
                    'AI phỏng vấn tự động',
                    'Advanced Analytics Dashboard',
                    'API Access',
                    'Priority Support 24/7',
                    'Custom Domain',
                    'Account Manager riêng',
                ],
                'is_active' => true,
                'is_popular' => false,
                'sort_order' => 3,
            ],
        ];

        foreach ($packages as $package) {
            Package::updateOrCreate(
                ['slug' => $package['slug']],
                $package
            );
        }
    }
}
