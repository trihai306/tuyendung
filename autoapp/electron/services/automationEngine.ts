import Store from 'electron-store';
import { v4 as uuidv4 } from 'uuid';
import { BrowserManager } from './browserManager';
import { ProfileManager } from './profileManager';
import { BrowserWindow } from 'electron';
import { Page } from 'playwright-core';

export interface AutomationTask {
    id: string;
    name: string;
    description?: string;
    type: 'navigate' | 'script' | 'sequence';
    steps: AutomationStep[];
    createdAt: string;
    updatedAt: string;
}

export interface AutomationStep {
    id: string;
    action: 'goto' | 'click' | 'type' | 'wait' | 'screenshot' | 'scroll' | 'evaluate';
    selector?: string;
    value?: string;
    delay?: number;
}

export interface AutomationLog {
    id: string;
    automationId: string;
    automationName: string;
    profileId: string;
    profileName: string;
    status: 'running' | 'success' | 'failed';
    startedAt: string;
    completedAt?: string;
    error?: string;
    stepsCompleted: number;
    totalSteps: number;
}

// --- Human-like behavior helpers ---

/**
 * Random delay between min and max ms.
 */
function randomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Sleep for a random duration.
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Type text character by character with random delays to mimic human typing.
 */
async function humanType(page: Page, selector: string, text: string): Promise<void> {
    // Focus the element first
    await page.click(selector, { timeout: 10000 });
    await sleep(randomDelay(100, 300));

    // Clear existing text
    await page.fill(selector, '');
    await sleep(randomDelay(50, 150));

    // Type each character with random delay
    for (let i = 0; i < text.length; i++) {
        await page.type(selector, text[i], { delay: 0 });
        // Variable typing speed: most characters fast, occasional pauses
        const isPause = Math.random() < 0.08; // 8% chance of a thinking pause
        if (isPause) {
            await sleep(randomDelay(200, 600));
        } else {
            await sleep(randomDelay(30, 120));
        }
    }
}

/**
 * Move mouse to element in a natural way before clicking.
 * Uses multiple small movements to look human.
 */
async function humanClick(page: Page, selector: string): Promise<void> {
    const element = await page.waitForSelector(selector, { timeout: 10000 });
    if (!element) throw new Error(`Element not found: ${selector}`);

    const box = await element.boundingBox();
    if (!box) throw new Error(`Could not get bounding box for: ${selector}`);

    // Target a random point within the element (not always center)
    const targetX = box.x + box.width * (0.2 + Math.random() * 0.6);
    const targetY = box.y + box.height * (0.2 + Math.random() * 0.6);

    // Move mouse to target with natural curve
    await page.mouse.move(targetX, targetY, { steps: randomDelay(8, 20) });

    // Small random delay before clicking (human reaction time)
    await sleep(randomDelay(50, 200));

    await page.mouse.click(targetX, targetY);
}

/**
 * Scroll smoothly like a human (multiple small scrolls instead of one big jump).
 */
async function humanScroll(page: Page, distance: number = 500): Promise<void> {
    const steps = randomDelay(5, 10);
    const stepDistance = distance / steps;

    for (let i = 0; i < steps; i++) {
        // Variable scroll speed
        const actualStep = stepDistance * (0.8 + Math.random() * 0.4);
        await page.evaluate((d: number) => window.scrollBy(0, d), actualStep);
        await sleep(randomDelay(30, 100));
    }
}


export class AutomationEngine {
    private store: Store<{ automations: AutomationTask[]; logs: AutomationLog[] }>;
    private browserManager: BrowserManager;
    private profileManager: ProfileManager;
    private runningTasks: Map<string, boolean> = new Map();

    constructor(browserManager: BrowserManager, profileManager: ProfileManager) {
        this.browserManager = browserManager;
        this.profileManager = profileManager;
        this.store = new Store({
            name: 'autoapp-automations',
            defaults: { automations: [] as AutomationTask[], logs: [] as AutomationLog[] },
        });
    }

    // --- CRUD ---

    getAll(): AutomationTask[] {
        return this.store.get('automations');
    }

    get(id: string): AutomationTask | undefined {
        return this.getAll().find(a => a.id === id);
    }

    create(data: Partial<AutomationTask>): AutomationTask {
        const task: AutomationTask = {
            id: uuidv4(),
            name: data.name || 'Automation moi',
            description: data.description,
            type: data.type || 'sequence',
            steps: data.steps || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const tasks = this.getAll();
        tasks.push(task);
        this.store.set('automations', tasks);
        return task;
    }

    update(id: string, data: Partial<AutomationTask>): AutomationTask | null {
        const tasks = this.getAll();
        const idx = tasks.findIndex(t => t.id === id);
        if (idx === -1) return null;

        tasks[idx] = { ...tasks[idx], ...data, id, updatedAt: new Date().toISOString() };
        this.store.set('automations', tasks);
        return tasks[idx];
    }

    delete(id: string): boolean {
        const tasks = this.getAll();
        const filtered = tasks.filter(t => t.id !== id);
        if (filtered.length === tasks.length) return false;
        this.store.set('automations', filtered);
        return true;
    }

    // --- Execution ---

    async run(automationId: string, profileId: string): Promise<AutomationLog> {
        const automation = this.get(automationId);
        const profile = this.profileManager.get(profileId);

        if (!automation) throw new Error('Automation khong ton tai');
        if (!profile) throw new Error('Profile khong ton tai');

        // Launch browser if not running
        if (!this.browserManager.isRunning(profileId)) {
            const result = await this.browserManager.launch(profileId);
            if (!result.success) throw new Error(result.error);
        }

        const context = this.browserManager.getContext(profileId);
        if (!context) throw new Error('Khong the lay browser context');

        const log: AutomationLog = {
            id: uuidv4(),
            automationId,
            automationName: automation.name,
            profileId,
            profileName: profile.name,
            status: 'running',
            startedAt: new Date().toISOString(),
            stepsCompleted: 0,
            totalSteps: automation.steps.length,
        };

        this.addLog(log);
        this.runningTasks.set(automationId, true);

        try {
            const pages = context.pages();
            const page = pages.length > 0 ? pages[0] : await context.newPage();

            for (let i = 0; i < automation.steps.length; i++) {
                if (!this.runningTasks.get(automationId)) {
                    throw new Error('Task bi dung boi nguoi dung');
                }

                const step = automation.steps[i];
                await this.executeStep(page, step);

                log.stepsCompleted = i + 1;
                this.updateLog(log);
                this.emitLog(log);

                // Add random inter-step delay to appear human
                if (i < automation.steps.length - 1) {
                    await sleep(randomDelay(300, 1500));
                }
            }

            log.status = 'success';
            log.completedAt = new Date().toISOString();
        } catch (error: unknown) {
            log.status = 'failed';
            log.error = error instanceof Error ? error.message : String(error);
            log.completedAt = new Date().toISOString();
        }

        this.runningTasks.delete(automationId);
        this.updateLog(log);
        this.emitLog(log);

        return log;
    }

    stop(automationId: string): void {
        this.runningTasks.set(automationId, false);
    }

    private async executeStep(page: Page, step: AutomationStep): Promise<void> {
        switch (step.action) {
            case 'goto':
                if (step.value) {
                    await page.goto(step.value, { waitUntil: 'domcontentloaded', timeout: 30000 });
                    // Wait a moment after navigation like a human would
                    await sleep(randomDelay(500, 1500));
                }
                break;
            case 'click':
                if (step.selector) {
                    await humanClick(page, step.selector);
                }
                break;
            case 'type':
                if (step.selector && step.value) {
                    await humanType(page, step.selector, step.value);
                }
                break;
            case 'wait':
                await sleep(step.delay || 1000);
                break;
            case 'screenshot':
                await page.screenshot({ path: step.value || 'screenshot.png' });
                break;
            case 'scroll':
                await humanScroll(page, 500);
                break;
            case 'evaluate':
                if (step.value) await page.evaluate(step.value);
                break;
        }

        // Additional delay after step (configurable per step)
        if (step.delay && step.action !== 'wait') {
            await sleep(step.delay);
        }
    }

    // --- Logs ---

    getLogs(limit?: number): AutomationLog[] {
        const logs = this.store.get('logs');
        const sorted = logs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
        return limit ? sorted.slice(0, limit) : sorted;
    }

    clearLogs(): void {
        this.store.set('logs', []);
    }

    private addLog(log: AutomationLog): void {
        const logs = this.store.get('logs');
        logs.push(log);
        // Keep last 500 logs
        if (logs.length > 500) logs.splice(0, logs.length - 500);
        this.store.set('logs', logs);
    }

    private updateLog(log: AutomationLog): void {
        const logs = this.store.get('logs');
        const idx = logs.findIndex(l => l.id === log.id);
        if (idx !== -1) {
            logs[idx] = log;
            this.store.set('logs', logs);
        }
    }

    private emitLog(log: AutomationLog): void {
        const windows = BrowserWindow.getAllWindows();
        for (const win of windows) {
            win.webContents.send('log:new', log);
        }
    }
}
