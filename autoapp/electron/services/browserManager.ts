import { chromium, Browser, BrowserContext, Page } from 'playwright-core';
import { ProfileManager, BrowserProfile } from './profileManager';
import { BrowserWindow } from 'electron';
import { applyStealthToContext, generateFingerprint, getStealthLaunchArgs, FingerprintConfig } from './stealthPlugin';
import { generateUA } from './userAgentGenerator';

interface ActiveBrowser {
    profileId: string;
    browser: Browser;
    context: BrowserContext;
    pages: Page[];
    launchedAt: string;
}

export class BrowserManager {
    private activeBrowsers: Map<string, ActiveBrowser> = new Map();
    private profileManager: ProfileManager;

    constructor(profileManager: ProfileManager) {
        this.profileManager = profileManager;
    }

    async launch(profileId: string): Promise<{ success: boolean; error?: string }> {
        if (this.activeBrowsers.has(profileId)) {
            return { success: false, error: 'Browser da dang chay voi profile nay' };
        }

        const profile = this.profileManager.get(profileId);
        if (!profile) {
            return { success: false, error: 'Profile khong ton tai' };
        }

        try {
            this.profileManager.setStatus(profileId, 'running');

            // Generate or load fingerprint for this profile
            const fingerprint = this.getOrCreateFingerprint(profile);

            // Generate consistent UA from fingerprint seed
            const uaProfile = generateUA(fingerprint.seed);

            // Find chromium executable
            const executablePath = this.findChromium();

            // Use per-profile user data dir for full isolation
            const userDataDir = this.getUserDataDir(profileId);
            const fs = require('fs');
            if (!fs.existsSync(userDataDir)) {
                fs.mkdirSync(userDataDir, { recursive: true });
            }

            const browser = await chromium.launch({
                headless: false,
                executablePath,
                args: [
                    ...getStealthLaunchArgs(),
                    `--user-data-dir=${userDataDir}`,
                    `--window-size=${fingerprint.screenWidth},${fingerprint.screenHeight}`,
                ],
            });

            const contextOptions: Record<string, unknown> = {
                viewport: profile.viewport || { width: 1280, height: 720 },
                locale: profile.locale || 'vi-VN',
                timezoneId: profile.timezone || 'Asia/Ho_Chi_Minh',
                ignoreHTTPSErrors: true,
                // Use the generated UA instead of default Playwright UA
                userAgent: profile.userAgent || uaProfile.userAgent,
                // Color scheme and device scale for more realistic appearance
                colorScheme: 'light' as const,
                deviceScaleFactor: 1,
                hasTouch: false,
                isMobile: false,
                // Geolocation permissions
                permissions: ['geolocation'],
                // Emulate reduced motion preference (most real users have this)
                reducedMotion: 'no-preference' as const,
            };

            if (profile.proxy) {
                contextOptions.proxy = {
                    server: profile.proxy.server,
                    username: profile.proxy.username,
                    password: profile.proxy.password,
                };
            }

            // Try loading existing storage state
            const storageStatePath = this.getStorageStatePath(profileId);
            try {
                if (fs.existsSync(storageStatePath)) {
                    contextOptions.storageState = storageStatePath;
                }
            } catch {
                // No stored state, start fresh
            }

            const context = await browser.newContext(contextOptions);

            // Apply comprehensive stealth patches
            await applyStealthToContext(context, fingerprint);

            const page = await context.newPage();
            await page.goto('about:blank');

            // Save storage state on context close
            context.on('close', async () => {
                try {
                    await context.storageState({ path: storageStatePath });
                } catch { }
            });

            this.activeBrowsers.set(profileId, {
                profileId,
                browser,
                context,
                pages: [page],
                launchedAt: new Date().toISOString(),
            });

            this.profileManager.markUsed(profileId);
            this.emitEvent('launched', profileId);

            // Listen for browser close
            browser.on('disconnected', () => {
                this.activeBrowsers.delete(profileId);
                this.profileManager.setStatus(profileId, 'idle');
                this.emitEvent('closed', profileId);
            });

            return { success: true };
        } catch (error: unknown) {
            this.profileManager.setStatus(profileId, 'error');
            const message = error instanceof Error ? error.message : String(error);
            return { success: false, error: message };
        }
    }

    async close(profileId: string): Promise<boolean> {
        const active = this.activeBrowsers.get(profileId);
        if (!active) return false;

        try {
            // Save storage state before closing
            await active.context.storageState({
                path: this.getStorageStatePath(profileId),
            });
            await active.browser.close();
            this.activeBrowsers.delete(profileId);
            this.profileManager.setStatus(profileId, 'idle');
            return true;
        } catch {
            this.activeBrowsers.delete(profileId);
            this.profileManager.setStatus(profileId, 'idle');
            return false;
        }
    }

    async closeAll(): Promise<void> {
        for (const [profileId] of this.activeBrowsers) {
            await this.close(profileId);
        }
    }

    getActive(): Array<{ profileId: string; launchedAt: string; pagesCount: number }> {
        const result: Array<{ profileId: string; launchedAt: string; pagesCount: number }> = [];
        for (const [, active] of this.activeBrowsers) {
            result.push({
                profileId: active.profileId,
                launchedAt: active.launchedAt,
                pagesCount: active.pages.length,
            });
        }
        return result;
    }

    getContext(profileId: string): BrowserContext | null {
        return this.activeBrowsers.get(profileId)?.context ?? null;
    }

    isRunning(profileId: string): boolean {
        return this.activeBrowsers.has(profileId);
    }

    /**
     * Get or create a fingerprint config for a given profile.
     * If profile already has a fingerprint seed, reuse it. Otherwise generate new one.
     */
    private getOrCreateFingerprint(profile: BrowserProfile): FingerprintConfig {
        if (profile.fingerprintSeed) {
            // Generate from existing seed for consistency
            const base = generateFingerprint(profile.fingerprintSeed);
            return {
                ...base,
                // Allow profile-level overrides
                webglVendor: profile.webglVendor || base.webglVendor,
                webglRenderer: profile.webglRenderer || base.webglRenderer,
                hardwareConcurrency: profile.hardwareConcurrency || base.hardwareConcurrency,
                deviceMemory: profile.deviceMemory || base.deviceMemory,
            };
        }

        // Generate new fingerprint and save it to the profile
        const seed = `${profile.id}-${Date.now()}`;
        const fingerprint = generateFingerprint(seed);
        this.profileManager.update(profile.id, { fingerprintSeed: seed });
        return fingerprint;
    }

    private getStorageStatePath(profileId: string): string {
        const profileDir = this.profileManager.getProfileDir(profileId);
        return require('path').join(profileDir, 'storage-state.json');
    }

    private getUserDataDir(profileId: string): string {
        const profileDir = this.profileManager.getProfileDir(profileId);
        return require('path').join(profileDir, 'chrome-data');
    }

    private findChromium(): string {
        const possiblePaths = [
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            '/Applications/Chromium.app/Contents/MacOS/Chromium',
            '/usr/bin/google-chrome',
            '/usr/bin/chromium-browser',
        ];

        const fs = require('fs');
        for (const p of possiblePaths) {
            if (fs.existsSync(p)) return p;
        }

        // Fallback: let Playwright find it
        return '';
    }

    private emitEvent(type: string, profileId: string): void {
        const windows = BrowserWindow.getAllWindows();
        for (const win of windows) {
            win.webContents.send('browser:event', { type, profileId, timestamp: Date.now() });
        }
    }
}
