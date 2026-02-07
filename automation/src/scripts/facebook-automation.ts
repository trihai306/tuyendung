/**
 * Facebook Automation Scripts using Playwright
 * Các hàm tự động hóa đăng nhập và đăng bài trên Facebook
 */

import { Page, BrowserContext } from 'playwright';

export interface FacebookCredentials {
    email: string;
    password: string;
}

export interface FacebookPost {
    content: string;
    images?: string[];  // Đường dẫn file ảnh
    privacy?: 'public' | 'friends' | 'only_me';
}

/**
 * Đăng nhập Facebook
 */
export async function facebookLogin(page: Page, credentials: FacebookCredentials): Promise<boolean> {
    try {
        // Truy cập trang login
        await page.goto('https://www.facebook.com/login', { waitUntil: 'domcontentloaded' });

        // Đợi form login xuất hiện
        await page.waitForSelector('#email', { timeout: 10000 });

        // Nhập email
        await page.fill('#email', credentials.email);
        await randomDelay(500, 1000);

        // Nhập password
        await page.fill('#pass', credentials.password);
        await randomDelay(500, 1000);

        // Click nút đăng nhập
        await page.click('button[name="login"]');

        // Đợi chuyển trang hoặc lỗi
        await Promise.race([
            page.waitForURL('**/facebook.com/**', { timeout: 30000 }),
            page.waitForSelector('[data-testid="login_error_message"]', { timeout: 30000 }).then(() => {
                throw new Error('Login failed - invalid credentials');
            }),
        ]);

        // Kiểm tra đã login thành công
        const isLoggedIn = await checkLoginStatus(page);
        return isLoggedIn;

    } catch (error) {
        console.error('Facebook login failed:', error);
        return false;
    }
}

/**
 * Kiểm tra trạng thái đăng nhập
 */
export async function checkLoginStatus(page: Page): Promise<boolean> {
    try {
        // Kiểm tra có profile menu không
        const profileMenu = await page.$('[aria-label="Account"], [aria-label="Tài khoản"]');
        return profileMenu !== null;
    } catch {
        return false;
    }
}

/**
 * Đăng bài lên tường cá nhân
 */
export async function postToTimeline(page: Page, post: FacebookPost): Promise<boolean> {
    try {
        // Truy cập trang chủ
        await page.goto('https://www.facebook.com', { waitUntil: 'domcontentloaded' });
        await randomDelay(2000, 3000);

        // Click vào ô "Bạn đang nghĩ gì?"
        const createPostButton = await page.waitForSelector(
            '[aria-label="Tạo bài viết"], [aria-label="Create a post"], [role="button"]:has-text("Bạn đang nghĩ gì")',
            { timeout: 10000 }
        );
        await createPostButton?.click();
        await randomDelay(1500, 2500);

        // Đợi modal đăng bài xuất hiện
        await page.waitForSelector('[role="dialog"]', { timeout: 10000 });

        // Tìm và nhập nội dung
        const textBox = await page.waitForSelector(
            '[role="dialog"] [contenteditable="true"], [role="textbox"][aria-label*="nghĩ gì"], [data-contents="true"]',
            { timeout: 10000 }
        );

        if (textBox) {
            await textBox.click();
            await randomDelay(500, 1000);

            // Nhập nội dung với delay giữa các ký tự
            await typeHumanLike(page, post.content);
        }

        // Upload ảnh nếu có
        if (post.images && post.images.length > 0) {
            await uploadImages(page, post.images);
        }

        await randomDelay(1000, 2000);

        // Click nút Đăng
        const postButton = await page.waitForSelector(
            '[aria-label="Đăng"], [aria-label="Post"], button:has-text("Đăng"), button:has-text("Post")',
            { timeout: 5000 }
        );

        if (postButton) {
            await postButton.click();
            await randomDelay(3000, 5000);

            // Đợi modal đóng
            await page.waitForSelector('[role="dialog"]', { state: 'detached', timeout: 30000 });
            return true;
        }

        return false;

    } catch (error) {
        console.error('Post to timeline failed:', error);
        return false;
    }
}

/**
 * Đăng bài vào Group
 */
export async function postToGroup(page: Page, groupId: string, post: FacebookPost): Promise<boolean> {
    try {
        // Truy cập group
        await page.goto(`https://www.facebook.com/groups/${groupId}`, { waitUntil: 'domcontentloaded' });
        await randomDelay(2000, 3000);

        // Click vào ô viết bài
        const writePostBox = await page.waitForSelector(
            '[aria-label*="Viết gì đó"], [aria-label*="Write something"], [role="button"]:has-text("Viết gì đó")',
            { timeout: 10000 }
        );
        await writePostBox?.click();
        await randomDelay(1500, 2500);

        // Đợi modal đăng bài
        await page.waitForSelector('[role="dialog"]', { timeout: 10000 });

        // Tìm và nhập nội dung
        const textBox = await page.waitForSelector(
            '[role="dialog"] [contenteditable="true"]',
            { timeout: 10000 }
        );

        if (textBox) {
            await textBox.click();
            await randomDelay(500, 1000);
            await typeHumanLike(page, post.content);
        }

        // Upload ảnh nếu có
        if (post.images && post.images.length > 0) {
            await uploadImages(page, post.images);
        }

        await randomDelay(1000, 2000);

        // Click nút Đăng
        const postButton = await page.waitForSelector(
            '[aria-label="Đăng"], [aria-label="Post"]',
            { timeout: 5000 }
        );

        if (postButton) {
            await postButton.click();
            await randomDelay(3000, 5000);
            return true;
        }

        return false;

    } catch (error) {
        console.error('Post to group failed:', error);
        return false;
    }
}

/**
 * Upload ảnh
 */
async function uploadImages(page: Page, imagePaths: string[]): Promise<void> {
    try {
        // Click nút thêm ảnh/video
        const photoButton = await page.waitForSelector(
            '[aria-label*="Ảnh/video"], [aria-label*="Photo/video"]',
            { timeout: 5000 }
        );
        await photoButton?.click();
        await randomDelay(1000, 2000);

        // Tìm input file
        const fileInput = await page.waitForSelector('input[type="file"][accept*="image"]', { timeout: 5000 });
        if (fileInput) {
            await fileInput.setInputFiles(imagePaths);
            await randomDelay(2000, 4000);
        }
    } catch (error) {
        console.error('Upload images failed:', error);
    }
}

/**
 * Nhập văn bản giống người thật
 */
async function typeHumanLike(page: Page, text: string): Promise<void> {
    for (const char of text) {
        await page.keyboard.type(char, { delay: Math.random() * 100 + 50 });

        // Đôi khi dừng lại như đang suy nghĩ
        if (Math.random() < 0.1) {
            await randomDelay(200, 800);
        }
    }
}

/**
 * Delay ngẫu nhiên
 */
function randomDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Lấy danh sách groups đã tham gia
 */
export async function getJoinedGroups(page: Page): Promise<Array<{ id: string; name: string }>> {
    try {
        await page.goto('https://www.facebook.com/groups/joins', { waitUntil: 'domcontentloaded' });
        await randomDelay(2000, 3000);

        // Cuộn để load thêm groups
        for (let i = 0; i < 3; i++) {
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await randomDelay(1000, 2000);
        }

        // Lấy danh sách groups
        const groups = await page.evaluate(() => {
            const groupElements = document.querySelectorAll('a[href*="/groups/"][role="link"]');
            const result: Array<{ id: string; name: string }> = [];

            groupElements.forEach(el => {
                const href = el.getAttribute('href') || '';
                const match = href.match(/\/groups\/(\d+)/);
                if (match) {
                    const name = el.textContent || '';
                    result.push({
                        id: match[1],
                        name: name.trim(),
                    });
                }
            });

            return result;
        });

        return groups;

    } catch (error) {
        console.error('Get joined groups failed:', error);
        return [];
    }
}

/**
 * Đăng bài lên nhiều groups
 */
export async function postToMultipleGroups(
    page: Page,
    groupIds: string[],
    post: FacebookPost,
    delayBetweenPosts: number = 30000 // 30 giây giữa mỗi bài
): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    for (const groupId of groupIds) {
        console.log(`Posting to group ${groupId}...`);

        const success = await postToGroup(page, groupId, post);
        results.set(groupId, success);

        if (success) {
            console.log(`✓ Posted to group ${groupId}`);
        } else {
            console.log(`✗ Failed to post to group ${groupId}`);
        }

        // Delay giữa các bài để tránh bị khóa
        await randomDelay(delayBetweenPosts, delayBetweenPosts + 10000);
    }

    return results;
}
