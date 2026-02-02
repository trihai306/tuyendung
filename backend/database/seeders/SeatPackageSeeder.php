<?php

namespace Database\Seeders;

use App\Models\SeatPackage;
use Illuminate\Database\Seeder;

class SeatPackageSeeder extends Seeder
{
    public function run(): void
    {
        SeatPackage::updateOrCreate(
            ['slug' => 'employee-seat'],
            [
                'name' => 'Gói Nhân viên',
                'slug' => 'employee-seat',
                'description' => 'Giải pháp tuyển dụng thông minh cho doanh nghiệp',
                'price_per_seat' => 500000,
                'duration_days' => 30,
                'features' => [
                    'Tin nhắn không giới hạn',
                    'Đăng bài tự động Facebook/Zalo',
                    'Lên lịch đăng bài',
                    'AI tự động trả lời',
                    'Thống kê bằng AI',
                    'Hỗ trợ kỹ thuật ưu tiên',
                ],
                'is_active' => true,
                'sort_order' => 1,
            ]
        );
    }
}
