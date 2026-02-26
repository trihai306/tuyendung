<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Application;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ApplicationSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing applications and their images
        $existing = Application::all();
        foreach ($existing as $app) {
            foreach (['candidate_photo', 'candidate_id_card_front', 'candidate_id_card_back'] as $field) {
                if ($app->{$field}) {
                    Storage::disk('public')->delete($app->{$field});
                }
            }
        }
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Application::truncate();
        DB::table('interviews')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $seedDir = storage_path('app/public/candidates/seed');
        $avatars = [
            'male' => ['avatar_male_1.jpg', 'avatar_male_2.jpg', 'avatar_male_3.jpg'],
            'female' => ['avatar_female_1.jpg', 'avatar_female_2.jpg', 'avatar_female_3.jpg'],
        ];
        $idFronts = ['id_front_1.jpg', 'id_front_2.jpg'];
        $idBacks = ['id_back_1.jpg', 'id_back_2.jpg'];

        $candidates = [
            [
                'candidate_name' => 'Nguyen Van Minh',
                'candidate_email' => 'minh.nguyen@gmail.com',
                'candidate_phone' => '0901234567',
                'source' => 'facebook',
                'source_note' => 'Tim thay qua bai dang tuyen dung tren Facebook',
                'job_post_id' => 1,
                'status' => 'pending',
                'gender' => 'male',
                'cover_letter' => 'Toi co 3 nam kinh nghiem voi React va TypeScript. Hien tai dang lam viec tai mot cong ty startup va muon tim co hoi moi thach thuc hon.',
                'social_links' => [['platform' => 'facebook', 'url' => 'https://facebook.com/minh.dev']],
            ],
            [
                'candidate_name' => 'Tran Thi Lan Anh',
                'candidate_email' => 'lananh.tran@outlook.com',
                'candidate_phone' => '0912345678',
                'source' => 'zalo',
                'source_note' => 'Ung vien gui tin nhan qua Zalo Official Account',
                'job_post_id' => 2,
                'status' => 'reviewing',
                'gender' => 'female',
                'cover_letter' => 'Toi tot nghiep Dai hoc Bach Khoa Tp.HCM chuyen nganh CNTT. Hien co 2 nam kinh nghiem PHP/Laravel tai cong ty outsource.',
                'social_links' => [['platform' => 'linkedin', 'url' => 'https://linkedin.com/in/lananh-tran']],
            ],
            [
                'candidate_name' => 'Le Hoang Phuc',
                'candidate_email' => 'phuc.le.dev@gmail.com',
                'candidate_phone' => '0987654321',
                'source' => 'linkedin',
                'source_note' => 'Tim thay tren LinkedIn, profile an tuong',
                'job_post_id' => 1,
                'status' => 'shortlisted',
                'gender' => 'male',
                'cover_letter' => 'Senior Frontend Developer voi 5 nam kinh nghiem. Da tung lam viec tai FPT Software va Tiki. Thanh thao React, Vue.js, Next.js.',
                'social_links' => [
                    ['platform' => 'linkedin', 'url' => 'https://linkedin.com/in/hoangphuc-le'],
                    ['platform' => 'facebook', 'url' => 'https://facebook.com/phuc.le.dev'],
                ],
            ],
            [
                'candidate_name' => 'Pham Thi Mai',
                'candidate_email' => 'mai.pham92@gmail.com',
                'candidate_phone' => '0976543210',
                'source' => 'referral',
                'source_note' => 'Duoc gioi thieu boi nhan vien Nguyen Thi Hoa',
                'job_post_id' => 3,
                'status' => 'accepted',
                'gender' => 'female',
                'cover_letter' => 'Chuyen gia Marketing Digital voi kinh nghiem 4 nam tai cac agency lon. Da quan ly budget quang cao len toi 500 trieu/thang.',
                'social_links' => [['platform' => 'facebook', 'url' => 'https://facebook.com/mai.marketing']],
            ],
            [
                'candidate_name' => 'Vo Duc Tai',
                'candidate_email' => 'tai.voduc@gmail.com',
                'candidate_phone' => '0965432109',
                'source' => 'other',
                'source_note' => 'Tim thay qua video tuyen dung tren TikTok',
                'job_post_id' => 4,
                'status' => 'pending',
                'gender' => 'male',
                'cover_letter' => 'Nhan vien kinh doanh B2B voi 3 nam kinh nghiem. Da quan ly portfolio khach hang doanh nghiep vua va nho.',
                'social_links' => [['platform' => 'tiktok', 'url' => 'https://tiktok.com/@tai.sales']],
            ],
            [
                'candidate_name' => 'Nguyen Thi Huong',
                'candidate_email' => 'huong.nt@yahoo.com',
                'candidate_phone' => '0954321098',
                'source' => 'facebook',
                'source_note' => 'Apply qua bai viet Facebook group HR Vietnam',
                'job_post_id' => 5,
                'status' => 'reviewing',
                'gender' => 'female',
                'cover_letter' => 'Chuyen vien Nhan su voi bang Thac si Quan tri Nhan luc. Kinh nghiem 3 nam tai cong ty san xuat quy mo 500+ nhan vien.',
                'social_links' => [['platform' => 'facebook', 'url' => 'https://facebook.com/huong.hr']],
            ],
            [
                'candidate_name' => 'Dang Quoc Bao',
                'candidate_email' => 'bao.dangquoc@gmail.com',
                'candidate_phone' => '0943210987',
                'source' => 'other',
                'source_note' => 'Gui CV truc tiep qua email cong ty',
                'job_post_id' => 6,
                'status' => 'shortlisted',
                'gender' => 'male',
                'cover_letter' => 'Graphic Designer voi portfolio an tuong. Thanh thao Adobe Suite, Figma. Da lam freelance cho nhieu thuong hieu lon.',
                'social_links' => [['platform' => 'other', 'url' => 'https://behance.net/baodang']],
            ],
            [
                'candidate_name' => 'Bui Ngoc Tram',
                'candidate_email' => 'tram.buingoc@gmail.com',
                'candidate_phone' => '0932109876',
                'source' => 'zalo',
                'source_note' => 'Lien he qua Zalo sau khi xem tin tuyen dung',
                'job_post_id' => 7,
                'status' => 'pending',
                'gender' => 'female',
                'cover_letter' => 'Sinh vien nam 3 Dai hoc Thuong Mai, muon tim viec part-time de tich luy kinh nghiem. Co ky nang giao tiep tot.',
                'social_links' => [['platform' => 'zalo', 'url' => '0932109876']],
            ],
            [
                'candidate_name' => 'Truong Thanh Long',
                'candidate_email' => 'long.truong.cpa@gmail.com',
                'candidate_phone' => '0921098765',
                'source' => 'linkedin',
                'source_note' => 'Ung vien tim thay tren LinkedIn, co chung chi CPA',
                'job_post_id' => 8,
                'status' => 'reviewing',
                'gender' => 'male',
                'cover_letter' => 'Ke toan truong voi 8 nam kinh nghiem va chung chi CPA Vietnam. Da quan ly phong ke toan 10 nguoi tai cong ty thuoc top 500 doanh nghiep lon nhat.',
                'social_links' => [['platform' => 'linkedin', 'url' => 'https://linkedin.com/in/longcpa']],
            ],
            [
                'candidate_name' => 'Hoang Yen Nhi',
                'candidate_email' => 'nhi.hoangyen@gmail.com',
                'candidate_phone' => '0910987654',
                'source' => 'referral',
                'source_note' => 'Duoc gioi thieu boi Giam doc Marketing',
                'job_post_id' => 3,
                'status' => 'rejected',
                'gender' => 'female',
                'cover_letter' => 'Marketing Executive voi 2 nam kinh nghiem tai cong ty FMCG. Co kinh nghiem chay Facebook Ads va Google Ads.',
                'social_links' => [
                    ['platform' => 'facebook', 'url' => 'https://facebook.com/yennhi.mkt'],
                    ['platform' => 'tiktok', 'url' => 'https://tiktok.com/@yennhi.mkt'],
                ],
            ],
        ];

        $maleIdx = 0;
        $femaleIdx = 0;
        $idIdx = 0;

        foreach ($candidates as $i => $data) {
            $gender = $data['gender'];
            unset($data['gender']);

            // Copy avatar
            if ($gender === 'male') {
                $avatarSrc = $avatars['male'][$maleIdx % count($avatars['male'])];
                $maleIdx++;
            } else {
                $avatarSrc = $avatars['female'][$femaleIdx % count($avatars['female'])];
                $femaleIdx++;
            }

            $photoPath = "candidates/app_{$i}_photo.jpg";
            $frontPath = "candidates/app_{$i}_id_front.jpg";
            $backPath = "candidates/app_{$i}_id_back.jpg";

            // Copy files
            copy("{$seedDir}/{$avatarSrc}", storage_path("app/public/{$photoPath}"));
            copy("{$seedDir}/{$idFronts[$idIdx % count($idFronts)]}", storage_path("app/public/{$frontPath}"));
            copy("{$seedDir}/{$idBacks[$idIdx % count($idBacks)]}", storage_path("app/public/{$backPath}"));
            $idIdx++;

            Application::create([
                ...$data,
                'candidate_photo' => $photoPath,
                'candidate_id_card_front' => $frontPath,
                'candidate_id_card_back' => $backPath,
                'added_by' => 4,
                'assigned_to' => 4,
                'applied_at' => now()->subDays(rand(1, 30)),
                'reviewed_at' => in_array($data['status'], ['reviewing', 'shortlisted', 'accepted', 'rejected']) ? now()->subDays(rand(0, 5)) : null,
            ]);
        }

        $this->command->info('Seeded ' . count($candidates) . ' applications with photos and ID cards.');
    }
}
