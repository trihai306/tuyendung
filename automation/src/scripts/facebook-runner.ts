/**
 * Facebook Automation Runner
 * Script ví dụ để chạy các hàm tự động hóa Facebook
 */

import { chromium, Browser, Page } from 'playwright';
import * as fb from './facebook-automation';

// ======================================
// CẤU HÌNH TÀI KHOẢN
// ======================================
const credentials: fb.FacebookCredentials = {
    email: 'your-email@example.com',    // Thay bằng email của bạn
    password: 'your-password',           // Thay bằng mật khẩu của bạn
};

// ======================================
// NỘI DUNG BÀI ĐĂNG
// ======================================
const samplePost: fb.FacebookPost = {
    content: `🔥 TUYỂN DỤNG NHÂN SỰ 🔥

Công ty ABC đang tìm kiếm ứng viên cho vị trí:
- Lập trình viên Full Stack
- Designer UI/UX
- Marketing Executive

💰 Lương: 15-30 triệu/tháng
📍 Địa điểm: TP.HCM
🕐 Thời gian: Full-time

Liên hệ: 0123.456.789
Email: tuyendung@abc.com

#tuyendung #job #developer #designer #marketing`,
    images: [], // Thêm đường dẫn ảnh nếu cần
    privacy: 'public',
};

// ======================================
// DANH SÁCH GROUPS ĐỂ ĐĂNG
// ======================================
const targetGroups = [
    // Thêm ID các groups bạn muốn đăng
    // '123456789',
    // '987654321',
];

// ======================================
// MAIN EXECUTION
// ======================================
async function main() {
    let browser: Browser | null = null;

    try {
        console.log('🚀 Khởi động Facebook Automation...');

        // Khởi động browser với stealth mode
        browser = await chromium.launch({
            headless: false, // Hiển thị browser để debug
            args: [
                '--disable-blink-features=AutomationControlled',
                '--disable-features=IsolateOrigins,site-per-process',
            ],
        });

        // Tạo context với fingerprint
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport: { width: 1280, height: 720 },
            locale: 'vi-VN',
            timezoneId: 'Asia/Ho_Chi_Minh',
        });

        const page = await context.newPage();

        // ======================================
        // BƯỚC 1: ĐĂNG NHẬP
        // ======================================
        console.log('📱 Đang đăng nhập Facebook...');
        const loginSuccess = await fb.facebookLogin(page, credentials);

        if (!loginSuccess) {
            console.error('❌ Đăng nhập thất bại!');
            return;
        }

        console.log('✅ Đăng nhập thành công!');
        await delay(3000);

        // ======================================
        // BƯỚC 2: ĐĂNG BÀI LÊN TIMELINE
        // ======================================
        console.log('📝 Đang đăng bài lên timeline...');
        const timelineSuccess = await fb.postToTimeline(page, samplePost);

        if (timelineSuccess) {
            console.log('✅ Đăng bài timeline thành công!');
        } else {
            console.log('❌ Đăng bài timeline thất bại!');
        }

        await delay(5000);

        // ======================================
        // BƯỚC 3: ĐĂNG BÀI LÊN CÁC GROUPS
        // ======================================
        if (targetGroups.length > 0) {
            console.log(`📤 Đang đăng bài lên ${targetGroups.length} groups...`);

            const groupResults = await fb.postToMultipleGroups(
                page,
                targetGroups,
                samplePost,
                60000 // Delay 60 giây giữa mỗi group
            );

            // Thống kê kết quả
            let successCount = 0;
            let failCount = 0;

            groupResults.forEach((success, groupId) => {
                if (success) {
                    successCount++;
                } else {
                    failCount++;
                }
            });

            console.log(`\n📊 Kết quả: ${successCount}/${targetGroups.length} thành công`);
        }

        // ======================================
        // BƯỚC 4: LẤY DANH SÁCH GROUPS
        // ======================================
        console.log('\n📋 Đang lấy danh sách groups đã tham gia...');
        const groups = await fb.getJoinedGroups(page);
        console.log(`Tìm thấy ${groups.length} groups:`);
        groups.slice(0, 10).forEach((g, i) => {
            console.log(`  ${i + 1}. [${g.id}] ${g.name}`);
        });

        console.log('\n✨ Automation hoàn tất!');

    } catch (error) {
        console.error('❌ Lỗi:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Chạy script
main().catch(console.error);
