/**
 * Facebook Automation API Endpoints
 * Thêm vào server/index.ts để expose API cho frontend
 */

import { Router } from 'express';
import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as fb from '../scripts/facebook-automation';

const router = Router();

// Store active browser sessions
const facebookSessions = new Map<string, {
    browser: Browser;
    context: BrowserContext;
    page: Page;
    credentials: fb.FacebookCredentials;
    isLoggedIn: boolean;
}>();

/**
 * POST /api/facebook/login
 * Đăng nhập Facebook
 */
router.post('/login', async (req, res) => {
    const { sessionId, email, password } = req.body;

    if (!sessionId || !email || !password) {
        return res.json({ success: false, error: 'Missing required fields' });
    }

    try {
        // Đóng session cũ nếu có
        if (facebookSessions.has(sessionId)) {
            const old = facebookSessions.get(sessionId)!;
            await old.browser.close();
            facebookSessions.delete(sessionId);
        }

        // Tạo browser mới
        const browser = await chromium.launch({
            headless: false,
            args: ['--disable-blink-features=AutomationControlled'],
        });

        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            viewport: { width: 1280, height: 720 },
            locale: 'vi-VN',
        });

        const page = await context.newPage();

        const credentials = { email, password };
        const success = await fb.facebookLogin(page, credentials);

        if (success) {
            facebookSessions.set(sessionId, {
                browser,
                context,
                page,
                credentials,
                isLoggedIn: true,
            });

            res.json({ success: true, message: 'Login successful' });
        } else {
            await browser.close();
            res.json({ success: false, error: 'Login failed - check credentials' });
        }

    } catch (error) {
        res.json({ success: false, error: (error as Error).message });
    }
});

/**
 * POST /api/facebook/post-timeline
 * Đăng bài lên timeline
 */
router.post('/post-timeline', async (req, res) => {
    const { sessionId, content, images } = req.body;

    const session = facebookSessions.get(sessionId);
    if (!session?.isLoggedIn) {
        return res.json({ success: false, error: 'Not logged in' });
    }

    try {
        const post: fb.FacebookPost = { content, images };
        const success = await fb.postToTimeline(session.page, post);

        res.json({ success, message: success ? 'Posted successfully' : 'Post failed' });

    } catch (error) {
        res.json({ success: false, error: (error as Error).message });
    }
});

/**
 * POST /api/facebook/post-group
 * Đăng bài vào group
 */
router.post('/post-group', async (req, res) => {
    const { sessionId, groupId, content, images } = req.body;

    const session = facebookSessions.get(sessionId);
    if (!session?.isLoggedIn) {
        return res.json({ success: false, error: 'Not logged in' });
    }

    try {
        const post: fb.FacebookPost = { content, images };
        const success = await fb.postToGroup(session.page, groupId, post);

        res.json({ success, message: success ? 'Posted to group' : 'Post failed' });

    } catch (error) {
        res.json({ success: false, error: (error as Error).message });
    }
});

/**
 * POST /api/facebook/post-multiple-groups
 * Đăng bài lên nhiều groups
 */
router.post('/post-multiple-groups', async (req, res) => {
    const { sessionId, groupIds, content, images, delayMs } = req.body;

    const session = facebookSessions.get(sessionId);
    if (!session?.isLoggedIn) {
        return res.json({ success: false, error: 'Not logged in' });
    }

    try {
        const post: fb.FacebookPost = { content, images };
        const results = await fb.postToMultipleGroups(
            session.page,
            groupIds,
            post,
            delayMs || 30000
        );

        const resultsObj: Record<string, boolean> = {};
        results.forEach((v, k) => resultsObj[k] = v);

        res.json({
            success: true,
            results: resultsObj,
            summary: {
                total: groupIds.length,
                success: [...results.values()].filter(v => v).length,
                failed: [...results.values()].filter(v => !v).length,
            },
        });

    } catch (error) {
        res.json({ success: false, error: (error as Error).message });
    }
});

/**
 * GET /api/facebook/groups
 * Lấy danh sách groups đã tham gia
 */
router.get('/groups/:sessionId', async (req, res) => {
    const { sessionId } = req.params;

    const session = facebookSessions.get(sessionId);
    if (!session?.isLoggedIn) {
        return res.json({ success: false, error: 'Not logged in' });
    }

    try {
        const groups = await fb.getJoinedGroups(session.page);
        res.json({ success: true, data: groups });

    } catch (error) {
        res.json({ success: false, error: (error as Error).message });
    }
});

/**
 * POST /api/facebook/logout
 * Đăng xuất và đóng session
 */
router.post('/logout', async (req, res) => {
    const { sessionId } = req.body;

    const session = facebookSessions.get(sessionId);
    if (session) {
        try {
            await session.browser.close();
        } catch { }
        facebookSessions.delete(sessionId);
    }

    res.json({ success: true, message: 'Logged out' });
});

/**
 * GET /api/facebook/sessions
 * Lấy danh sách sessions đang active
 */
router.get('/sessions', (req, res) => {
    const sessions = [...facebookSessions.entries()].map(([id, s]) => ({
        sessionId: id,
        isLoggedIn: s.isLoggedIn,
        email: s.credentials.email,
    }));

    res.json({ success: true, data: sessions });
});

export default router;
