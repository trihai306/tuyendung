<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Application;
use App\Models\CandidateProfile;
use App\Models\EmployerProfile;
use App\Models\JobCategory;
use App\Models\JobPost;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ApplicationSeeder extends Seeder
{
    /**
     * Seed job categories, job posts, candidates, and applications
     * for trihai306@gmail.com's company.
     */
    public function run(): void
    {
        // --- 1. Ensure owner and company exist ---
        $owner = User::where('email', 'trihai306@gmail.com')->first();

        if (!$owner) {
            $owner = User::create([
                'name' => 'Tri Hai',
                'email' => 'trihai306@gmail.com',
                'password' => Hash::make('password'),
                'roles' => ['employer'],
            ]);
        }

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

        // --- 2. Create job categories ---
        $categories = [
            ['name' => 'Cong nghe thong tin', 'slug' => 'cong-nghe-thong-tin', 'icon' => 'monitor'],
            ['name' => 'Marketing', 'slug' => 'marketing', 'icon' => 'megaphone'],
            ['name' => 'Kinh doanh', 'slug' => 'kinh-doanh', 'icon' => 'briefcase'],
            ['name' => 'Nhan su', 'slug' => 'nhan-su', 'icon' => 'users'],
            ['name' => 'Ke toan', 'slug' => 'ke-toan', 'icon' => 'calculator'],
            ['name' => 'Thiet ke', 'slug' => 'thiet-ke', 'icon' => 'palette'],
            ['name' => 'Cham soc khach hang', 'slug' => 'cham-soc-khach-hang', 'icon' => 'headset'],
            ['name' => 'Hanh chinh', 'slug' => 'hanh-chinh', 'icon' => 'clipboard'],
        ];

        $categoryIds = [];
        foreach ($categories as $cat) {
            $category = JobCategory::firstOrCreate(
                ['slug' => $cat['slug']],
                $cat
            );
            $categoryIds[] = $category->id;
        }

        // --- 3. Create job posts ---
        $jobPostsData = [
            [
                'title' => 'Lap trinh vien Frontend React',
                'slug' => 'lap-trinh-vien-frontend-react',
                'description' => 'Tim kiem lap trinh vien Frontend co kinh nghiem voi React, TypeScript va Tailwind CSS.',
                'job_type' => 'office',
                'category_id' => $categoryIds[0],
                'salary_min' => 15000000,
                'salary_max' => 25000000,
                'salary_type' => 'monthly',
                'location' => 'Quan 1',
                'city' => 'Ho Chi Minh',
                'requirements' => "- 2+ nam kinh nghiem React\n- Thanh thao TypeScript\n- Hieu biet ve REST API\n- Ky nang giao tiep tot",
                'benefits' => "- Luong thang 13, 14\n- Bao hiem day du\n- Du lich hang nam\n- Moi truong lam viec chuyen nghiep",
                'slots' => 3,
                'deadline' => now()->addDays(30),
                'status' => 'active',
            ],
            [
                'title' => 'Lap trinh vien Backend Laravel',
                'slug' => 'lap-trinh-vien-backend-laravel',
                'description' => 'Tuyen lap trinh vien Backend co kinh nghiem voi Laravel, MySQL va Redis.',
                'job_type' => 'office',
                'category_id' => $categoryIds[0],
                'salary_min' => 18000000,
                'salary_max' => 30000000,
                'salary_type' => 'monthly',
                'location' => 'Quan 7',
                'city' => 'Ho Chi Minh',
                'requirements' => "- 3+ nam kinh nghiem Laravel\n- MySQL, Redis, Queue\n- RESTful API design\n- Unit testing",
                'benefits' => "- Review tang luong 2 lan/nam\n- Flexible working hours\n- Laptop cong ty",
                'slots' => 2,
                'deadline' => now()->addDays(45),
                'status' => 'active',
            ],
            [
                'title' => 'Nhan vien Marketing Online',
                'slug' => 'nhan-vien-marketing-online',
                'description' => 'Quan ly va toi uu cac kenh marketing online: Facebook Ads, Google Ads, SEO.',
                'job_type' => 'office',
                'category_id' => $categoryIds[1],
                'salary_min' => 10000000,
                'salary_max' => 18000000,
                'salary_type' => 'monthly',
                'location' => 'Quan 3',
                'city' => 'Ho Chi Minh',
                'requirements' => "- 1+ nam kinh nghiem Digital Marketing\n- Biet chay Facebook Ads, Google Ads\n- Hieu biet SEO co ban",
                'benefits' => "- Thuong KPI\n- Dao tao nang cao\n- Moi truong tre trung",
                'slots' => 2,
                'deadline' => now()->addDays(20),
                'status' => 'active',
            ],
            [
                'title' => 'Nhan vien Kinh doanh B2B',
                'slug' => 'nhan-vien-kinh-doanh-b2b',
                'description' => 'Tim kiem va phat trien khach hang doanh nghiep, dam phan hop dong.',
                'job_type' => 'office',
                'category_id' => $categoryIds[2],
                'salary_min' => 12000000,
                'salary_max' => 20000000,
                'salary_type' => 'monthly',
                'location' => 'Quan Binh Thanh',
                'city' => 'Ho Chi Minh',
                'requirements' => "- 2+ nam kinh nghiem Sales B2B\n- Ky nang dam phan, thuyet phuc\n- Co xe ca nhan",
                'benefits' => "- Hoa hong khong gioi han\n- Xe cong ty\n- Dien thoai cong ty",
                'slots' => 5,
                'deadline' => now()->addDays(60),
                'status' => 'active',
            ],
            [
                'title' => 'Nhan vien Nhan su',
                'slug' => 'nhan-vien-nhan-su',
                'description' => 'Quan ly tuyen dung, dao tao va cac chinh sach nhan su.',
                'job_type' => 'office',
                'category_id' => $categoryIds[3],
                'salary_min' => 12000000,
                'salary_max' => 18000000,
                'salary_type' => 'monthly',
                'location' => 'Quan 1',
                'city' => 'Ho Chi Minh',
                'requirements' => "- 2+ nam kinh nghiem HR\n- Hieu biet luat lao dong\n- Ky nang to chuc tot",
                'benefits' => "- Luong thang 13\n- Team building hang quy\n- Nghi phep 15 ngay/nam",
                'slots' => 1,
                'deadline' => now()->addDays(15),
                'status' => 'active',
            ],
            [
                'title' => 'Thiet ke do hoa (Graphic Designer)',
                'slug' => 'thiet-ke-do-hoa',
                'description' => 'Thiet ke banner, poster, noi dung mang xa hoi cho cong ty.',
                'job_type' => 'office',
                'category_id' => $categoryIds[5],
                'salary_min' => 10000000,
                'salary_max' => 16000000,
                'salary_type' => 'monthly',
                'location' => 'Quan Tan Binh',
                'city' => 'Ho Chi Minh',
                'requirements' => "- Thanh thao Photoshop, Illustrator, Figma\n- Co portfolio\n- Sang tao, nhanh nhen",
                'benefits' => "- Moi truong sang tao\n- Trang thiet bi hien dai\n- Thuong du an",
                'slots' => 2,
                'deadline' => now()->addDays(25),
                'status' => 'active',
            ],
            [
                'title' => 'Nhan vien Part-time ban hang',
                'slug' => 'nhan-vien-part-time-ban-hang',
                'description' => 'Tu van va ban hang tai cua hang. Lam viec ca toi hoac cuoi tuan.',
                'job_type' => 'seasonal',
                'category_id' => $categoryIds[6],
                'salary_min' => 4000000,
                'salary_max' => 7000000,
                'salary_type' => 'monthly',
                'location' => 'Quan Go Vap',
                'city' => 'Ho Chi Minh',
                'requirements' => "- Giao tiep tot\n- Uu tien sinh vien\n- Linh hoat gio lam",
                'benefits' => "- Luong theo gio linh hoat\n- Thuong doanh so\n- Dao tao mien phi",
                'slots' => 10,
                'deadline' => now()->addDays(10),
                'status' => 'active',
            ],
            [
                'title' => 'Ke toan truong',
                'slug' => 'ke-toan-truong',
                'description' => 'Quan ly toan bo cong tac ke toan, bao cao tai chinh, thue.',
                'job_type' => 'office',
                'category_id' => $categoryIds[4],
                'salary_min' => 20000000,
                'salary_max' => 35000000,
                'salary_type' => 'monthly',
                'location' => 'Quan 1',
                'city' => 'Ho Chi Minh',
                'requirements' => "- 5+ nam kinh nghiem ke toan\n- Chung chi ke toan truong\n- Thanh thao phan mem ke toan",
                'benefits' => "- Luong canh tranh\n- Bao hiem cao cap\n- Thuong Tet hap dan",
                'slots' => 1,
                'deadline' => now()->addDays(40),
                'status' => 'active',
            ],
        ];

        $jobPosts = [];
        foreach ($jobPostsData as $jpData) {
            $jobPost = JobPost::firstOrCreate(
                ['slug' => $jpData['slug']],
                array_merge($jpData, [
                    'employer_id' => $owner->id,
                    'created_by' => $owner->id,
                    'published_at' => now()->subDays(rand(1, 14)),
                ])
            );
            $jobPosts[] = $jobPost;
        }

        // --- 4. Create candidate users with profiles ---
        $candidatesData = [
            [
                'name' => 'Nguyen Minh Tuan',
                'email' => 'tuan.nguyen@gmail.com',
                'phone' => '0901234567',
                'bio' => 'Lap trinh vien Frontend 3 nam kinh nghiem',
                'skills' => ['React', 'TypeScript', 'Tailwind CSS', 'Vue.js'],
                'experience_years' => 3,
                'education' => 'Dai hoc Bach Khoa TP.HCM',
                'city' => 'Ho Chi Minh',
                'gender' => 'male'
            ],
            [
                'name' => 'Tran Thi Mai',
                'email' => 'mai.tran@gmail.com',
                'phone' => '0912345678',
                'bio' => 'Marketing specialist voi 2 nam kinh nghiem',
                'skills' => ['Facebook Ads', 'Google Ads', 'SEO', 'Content Marketing'],
                'experience_years' => 2,
                'education' => 'Dai hoc Kinh te TP.HCM',
                'city' => 'Ho Chi Minh',
                'gender' => 'female'
            ],
            [
                'name' => 'Le Hoang Nam',
                'email' => 'nam.le@gmail.com',
                'phone' => '0923456789',
                'bio' => 'Backend developer chuyen Laravel',
                'skills' => ['Laravel', 'PHP', 'MySQL', 'Redis', 'Docker'],
                'experience_years' => 4,
                'education' => 'Dai hoc Cong nghe Thong tin',
                'city' => 'Ho Chi Minh',
                'gender' => 'male'
            ],
            [
                'name' => 'Pham Thanh Huong',
                'email' => 'huong.pham@gmail.com',
                'phone' => '0934567890',
                'bio' => 'Nhan vien kinh doanh nang dong',
                'skills' => ['Sales B2B', 'CRM', 'Excel', 'Thuyet trinh'],
                'experience_years' => 3,
                'education' => 'Dai hoc Thuong Mai',
                'city' => 'Ho Chi Minh',
                'gender' => 'female'
            ],
            [
                'name' => 'Vo Quoc Dat',
                'email' => 'dat.vo@gmail.com',
                'phone' => '0945678901',
                'bio' => 'Full-stack developer',
                'skills' => ['React', 'Laravel', 'PostgreSQL', 'AWS'],
                'experience_years' => 5,
                'education' => 'Dai hoc FPT',
                'city' => 'Ho Chi Minh',
                'gender' => 'male'
            ],
            [
                'name' => 'Dang Thi Lan',
                'email' => 'lan.dang@gmail.com',
                'phone' => '0956789012',
                'bio' => 'Ke toan co 6 nam kinh nghiem',
                'skills' => ['Ke toan', 'MISA', 'Excel nang cao', 'Thue'],
                'experience_years' => 6,
                'education' => 'Dai hoc Tai chinh Marketing',
                'city' => 'Ho Chi Minh',
                'gender' => 'female'
            ],
            [
                'name' => 'Bui Van Khanh',
                'email' => 'khanh.bui@gmail.com',
                'phone' => '0967890123',
                'bio' => 'Graphic Designer sang tao',
                'skills' => ['Photoshop', 'Illustrator', 'Figma', 'After Effects'],
                'experience_years' => 2,
                'education' => 'Dai hoc My thuat TP.HCM',
                'city' => 'Ho Chi Minh',
                'gender' => 'male'
            ],
            [
                'name' => 'Nguyen Thi Hong',
                'email' => 'hong.nguyen@gmail.com',
                'phone' => '0978901234',
                'bio' => 'Nhan vien HR chuyen nghiep',
                'skills' => ['Tuyen dung', 'Dao tao', 'C&B', 'Luat lao dong'],
                'experience_years' => 3,
                'education' => 'Dai hoc Luat TP.HCM',
                'city' => 'Ho Chi Minh',
                'gender' => 'female'
            ],
            [
                'name' => 'Tran Van Duc',
                'email' => 'duc.tran@gmail.com',
                'phone' => '0989012345',
                'bio' => 'Junior Frontend developer',
                'skills' => ['HTML', 'CSS', 'JavaScript', 'React'],
                'experience_years' => 1,
                'education' => 'Cao dang FPT Polytechnic',
                'city' => 'Ho Chi Minh',
                'gender' => 'male'
            ],
            [
                'name' => 'Le Thi Ngoc',
                'email' => 'ngoc.le@gmail.com',
                'phone' => '0990123456',
                'bio' => 'Content marketing & Social media',
                'skills' => ['Content Writing', 'Canva', 'TikTok', 'Facebook'],
                'experience_years' => 1,
                'education' => 'Dai hoc Van Lang',
                'city' => 'Ho Chi Minh',
                'gender' => 'female'
            ],
            [
                'name' => 'Hoang Quang Vinh',
                'email' => 'vinh.hoang@gmail.com',
                'phone' => '0911223344',
                'bio' => 'DevOps Engineer',
                'skills' => ['Docker', 'Kubernetes', 'CI/CD', 'Linux', 'AWS'],
                'experience_years' => 4,
                'education' => 'Dai hoc Bach Khoa Ha Noi',
                'city' => 'Ha Noi',
                'gender' => 'male'
            ],
            [
                'name' => 'Ngo Thi Phuong',
                'email' => 'phuong.ngo@gmail.com',
                'phone' => '0922334455',
                'bio' => 'UI/UX Designer',
                'skills' => ['Figma', 'Sketch', 'Adobe XD', 'User Research'],
                'experience_years' => 3,
                'education' => 'Dai hoc RMIT',
                'city' => 'Ho Chi Minh',
                'gender' => 'female'
            ],
            [
                'name' => 'Vu Thanh Long',
                'email' => 'long.vu@gmail.com',
                'phone' => '0933445566',
                'bio' => 'Sales Manager kinh nghiem',
                'skills' => ['Sales Management', 'B2B', 'Negotiation', 'Leadership'],
                'experience_years' => 7,
                'education' => 'MBA Dai hoc Kinh te',
                'city' => 'Ho Chi Minh',
                'gender' => 'male'
            ],
            [
                'name' => 'Dinh Thi Yen',
                'email' => 'yen.dinh@gmail.com',
                'phone' => '0944556677',
                'bio' => 'Ke toan tong hop',
                'skills' => ['Ke toan', 'Fast Accounting', 'Bao cao tai chinh'],
                'experience_years' => 4,
                'education' => 'Dai hoc Ngan hang TP.HCM',
                'city' => 'Ho Chi Minh',
                'gender' => 'female'
            ],
            [
                'name' => 'Cao Van Minh',
                'email' => 'minh.cao@gmail.com',
                'phone' => '0955667788',
                'bio' => 'Mobile developer React Native',
                'skills' => ['React Native', 'TypeScript', 'Firebase', 'GraphQL'],
                'experience_years' => 3,
                'education' => 'Dai hoc Ton Duc Thang',
                'city' => 'Ho Chi Minh',
                'gender' => 'male'
            ],
        ];

        $candidateUsers = [];
        foreach ($candidatesData as $cData) {
            $user = User::firstOrCreate(
                ['email' => $cData['email']],
                [
                    'name' => $cData['name'],
                    'phone' => $cData['phone'],
                    'password' => Hash::make('password'),
                    'roles' => ['candidate'],
                ]
            );

            $user->addRole('candidate');

            CandidateProfile::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'bio' => $cData['bio'],
                    'skills' => $cData['skills'],
                    'experience_years' => $cData['experience_years'],
                    'education' => $cData['education'],
                    'city' => $cData['city'],
                    'gender' => $cData['gender'],
                ]
            );

            $candidateUsers[] = $user;
        }

        // --- 5. Create system applications (from registered candidates) ---
        $statuses = ['pending', 'reviewing', 'shortlisted', 'accepted', 'rejected'];
        $coverLetters = [
            'Toi rat quan tam den vi tri nay va tin rang kinh nghiem cua toi phu hop voi yeu cau cua cong ty.',
            'Voi kinh nghiem lam viec tai nhieu du an, toi tu tin co the dong gop cho doi ngu cua quy cong ty.',
            'Toi da theo doi cong ty tu lau va mong muon duoc tham gia lam viec trong moi truong chuyen nghiep nay.',
            'Day la co hoi tuyet voi de toi phat trien su nghiep. Toi san sang bat dau ngay khi duoc chap nhan.',
            null,
        ];

        // Map candidates to suitable job posts
        $applicationMap = [
            // [candidateIndex, jobPostIndex, status]
            [0, 0, 'reviewing'],    // Tuan -> Frontend React
            [0, 1, 'pending'],      // Tuan -> Backend Laravel
            [1, 2, 'shortlisted'],  // Mai -> Marketing
            [2, 1, 'accepted'],     // Nam -> Backend Laravel
            [3, 3, 'reviewing'],    // Huong -> Kinh doanh B2B
            [4, 0, 'shortlisted'],  // Dat -> Frontend React
            [4, 1, 'reviewing'],    // Dat -> Backend Laravel
            [5, 7, 'reviewing'],    // Lan -> Ke toan truong
            [6, 5, 'accepted'],     // Khanh -> Thiet ke do hoa
            [7, 4, 'shortlisted'],  // Hong -> Nhan su
            [8, 0, 'pending'],      // Duc -> Frontend React
            [9, 2, 'pending'],      // Ngoc -> Marketing
            [10, 1, 'pending'],     // Vinh -> Backend Laravel
            [11, 5, 'reviewing'],   // Phuong -> Thiet ke do hoa
            [12, 3, 'accepted'],    // Long -> Kinh doanh B2B
            [13, 7, 'pending'],     // Yen -> Ke toan truong
            [14, 0, 'reviewing'],   // Minh -> Frontend React
        ];

        foreach ($applicationMap as $idx => $map) {
            [$cIdx, $jIdx, $status] = $map;
            $candidate = $candidateUsers[$cIdx];
            $jobPost = $jobPosts[$jIdx];

            $appliedAt = now()->subDays(rand(1, 20))->subHours(rand(0, 23));
            $reviewedAt = in_array($status, ['reviewing', 'shortlisted', 'accepted', 'rejected'])
                ? $appliedAt->copy()->addDays(rand(1, 5))
                : null;

            Application::firstOrCreate(
                [
                    'job_post_id' => $jobPost->id,
                    'candidate_id' => $candidate->id,
                ],
                [
                    'cover_letter' => $coverLetters[array_rand($coverLetters)],
                    'status' => $status,
                    'source' => 'system',
                    'applied_at' => $appliedAt,
                    'reviewed_at' => $reviewedAt,
                    'employer_notes' => $status === 'accepted' ? 'Ung vien xuat sac, phu hop voi vi tri.' : null,
                ]
            );
        }

        // --- 6. Create external applications (added by employer) ---
        $externalCandidates = [
            [
                'name' => 'Ly Van Tai',
                'email' => 'tai.ly@outlook.com',
                'phone' => '0971112233',
                'source' => 'facebook',
                'source_note' => 'Ung vien lien he qua Facebook cong ty',
                'social_links' => [
                    ['platform' => 'facebook', 'url' => 'https://facebook.com/tai.ly'],
                ],
                'job_index' => 0,
                'status' => 'pending',
            ],
            [
                'name' => 'Do Thi Hanh',
                'email' => 'hanh.do@yahoo.com',
                'phone' => '0982223344',
                'source' => 'zalo',
                'source_note' => 'Ung vien gui CV qua Zalo',
                'social_links' => [
                    ['platform' => 'zalo', 'url' => 'https://zalo.me/0982223344'],
                ],
                'job_index' => 2,
                'status' => 'reviewing',
            ],
            [
                'name' => 'Truong Quoc Bao',
                'email' => 'bao.truong@gmail.com',
                'phone' => '0993334455',
                'source' => 'linkedin',
                'source_note' => 'Tim thay tren LinkedIn',
                'social_links' => [
                    ['platform' => 'linkedin', 'url' => 'https://linkedin.com/in/baotruong'],
                ],
                'job_index' => 1,
                'status' => 'shortlisted',
            ],
            [
                'name' => 'Nguyen Thanh Phong',
                'email' => 'phong.nt@gmail.com',
                'phone' => '0914445566',
                'source' => 'referral',
                'source_note' => 'Gioi thieu boi nhan vien An',
                'social_links' => [
                    ['platform' => 'facebook', 'url' => 'https://facebook.com/phong.nt'],
                    ['platform' => 'zalo', 'url' => 'https://zalo.me/0914445566'],
                ],
                'job_index' => 3,
                'status' => 'pending',
            ],
            [
                'name' => 'Ha Thi Thao',
                'email' => null,
                'phone' => '0925556677',
                'source' => 'other',
                'source_note' => 'Ung vien comment tren TikTok tuyen dung',
                'social_links' => [
                    ['platform' => 'tiktok', 'url' => 'https://tiktok.com/@thao.ha'],
                ],
                'job_index' => 6,
                'status' => 'pending',
            ],
            [
                'name' => 'Lam Van Son',
                'email' => 'son.lam@gmail.com',
                'phone' => '0936667788',
                'source' => 'facebook',
                'source_note' => 'Gui tin nhan qua Fanpage',
                'social_links' => [
                    ['platform' => 'facebook', 'url' => 'https://facebook.com/son.lam'],
                ],
                'job_index' => 4,
                'status' => 'reviewing',
            ],
            [
                'name' => 'Phan Thi Kim',
                'email' => 'kim.phan@gmail.com',
                'phone' => '0947778899',
                'source' => 'other',
                'source_note' => 'Walk-in phong van truc tiep',
                'social_links' => null,
                'job_index' => 6,
                'status' => 'accepted',
            ],
            [
                'name' => 'Vo Minh Hieu',
                'email' => 'hieu.vo@gmail.com',
                'phone' => '0958889900',
                'source' => 'zalo',
                'source_note' => 'Ung vien gui CV qua Zalo OA',
                'social_links' => [
                    ['platform' => 'zalo', 'url' => 'https://zalo.me/0958889900'],
                    ['platform' => 'linkedin', 'url' => 'https://linkedin.com/in/hieu-vo'],
                ],
                'job_index' => 5,
                'status' => 'pending',
            ],
            [
                'name' => 'Duong Thi Thanh',
                'email' => 'thanh.duong@hotmail.com',
                'phone' => '0969990011',
                'source' => 'referral',
                'source_note' => 'Gioi thieu boi khach hang cu',
                'social_links' => [
                    ['platform' => 'facebook', 'url' => 'https://facebook.com/thanh.duong'],
                ],
                'job_index' => 7,
                'status' => 'reviewing',
            ],
            [
                'name' => 'Trinh Van Hoan',
                'email' => 'hoan.trinh@gmail.com',
                'phone' => '0970001122',
                'source' => 'linkedin',
                'source_note' => 'Headhunt tu LinkedIn',
                'social_links' => [
                    ['platform' => 'linkedin', 'url' => 'https://linkedin.com/in/hoan-trinh'],
                    ['platform' => 'facebook', 'url' => 'https://facebook.com/hoan.trinh'],
                ],
                'job_index' => 0,
                'status' => 'shortlisted',
            ],
            [
                'name' => 'Mai Thi Cam Tu',
                'email' => 'tu.mai@gmail.com',
                'phone' => '0981112233',
                'source' => 'facebook',
                'source_note' => 'Apply qua bai dang Facebook',
                'social_links' => [
                    ['platform' => 'facebook', 'url' => 'https://facebook.com/tu.mai'],
                ],
                'job_index' => 2,
                'status' => 'pending',
            ],
            [
                'name' => 'Bach Cong Danh',
                'email' => 'danh.bach@gmail.com',
                'phone' => '0992223344',
                'source' => 'referral',
                'source_note' => 'Nguoi quen gioi thieu',
                'social_links' => null,
                'job_index' => 3,
                'status' => 'reviewing',
            ],
            [
                'name' => 'Chau Ngoc Tram',
                'email' => 'tram.chau@outlook.com',
                'phone' => '0913334455',
                'source' => 'other',
                'source_note' => 'Tim thay qua video TikTok',
                'social_links' => [
                    ['platform' => 'tiktok', 'url' => 'https://tiktok.com/@tram.chau'],
                    ['platform' => 'facebook', 'url' => 'https://facebook.com/tram.chau'],
                ],
                'job_index' => 5,
                'status' => 'pending',
            ],
        ];

        foreach ($externalCandidates as $extData) {
            $appliedAt = now()->subDays(rand(1, 15))->subHours(rand(0, 23));
            $reviewedAt = in_array($extData['status'], ['reviewing', 'shortlisted', 'accepted', 'rejected'])
                ? $appliedAt->copy()->addDays(rand(1, 3))
                : null;

            Application::create([
                'job_post_id' => $jobPosts[$extData['job_index']]->id,
                'candidate_id' => null,
                'candidate_name' => $extData['name'],
                'candidate_email' => $extData['email'],
                'candidate_phone' => $extData['phone'],
                'source' => $extData['source'],
                'source_note' => $extData['source_note'],
                'social_links' => $extData['social_links'],
                'added_by' => $owner->id,
                'status' => $extData['status'],
                'applied_at' => $appliedAt,
                'reviewed_at' => $reviewedAt,
            ]);
        }
    }
}
