import { Page, ElementHandle } from 'playwright';

/**
 * Human Behavior Simulation Class
 * Mimics realistic human interactions to avoid bot detection
 */
export class HumanBehavior {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Random delay between actions (simulates human thinking time)
     */
    async randomDelay(min = 500, max = 2000): Promise<void> {
        const delay = Math.floor(Math.random() * (max - min) + min);
        await this.page.waitForTimeout(delay);
    }

    /**
     * Short delay for quick actions
     */
    async shortDelay(): Promise<void> {
        await this.randomDelay(100, 400);
    }

    /**
     * Medium delay for normal actions
     */
    async mediumDelay(): Promise<void> {
        await this.randomDelay(500, 1500);
    }

    /**
     * Long delay for thinking/reading actions
     */
    async longDelay(): Promise<void> {
        await this.randomDelay(2000, 5000);
    }

    /**
     * Human-like typing with variable speed and occasional typos
     */
    async humanType(selector: string, text: string, options?: {
        makeTypos?: boolean;
        minDelay?: number;
        maxDelay?: number;
    }): Promise<void> {
        const { makeTypos = false, minDelay = 50, maxDelay = 200 } = options || {};

        // Click on the input field first
        await this.humanClick(selector);
        await this.shortDelay();

        // Clear existing content
        await this.page.keyboard.press('Control+A');
        await this.page.keyboard.press('Backspace');
        await this.shortDelay();

        for (let i = 0; i < text.length; i++) {
            const char = text[i];

            // Occasionally make typos and correct them
            if (makeTypos && Math.random() < 0.03) {
                const typoChar = String.fromCharCode(char.charCodeAt(0) + (Math.random() > 0.5 ? 1 : -1));
                await this.page.keyboard.type(typoChar, {
                    delay: Math.floor(Math.random() * (maxDelay - minDelay) + minDelay),
                });
                await this.randomDelay(100, 300);
                await this.page.keyboard.press('Backspace');
                await this.randomDelay(50, 150);
            }

            // Type the character with random delay
            await this.page.keyboard.type(char, {
                delay: Math.floor(Math.random() * (maxDelay - minDelay) + minDelay),
            });

            // Occasional pause between words
            if (char === ' ' && Math.random() < 0.3) {
                await this.randomDelay(200, 600);
            }
        }
    }

    /**
     * Natural mouse movement with bezier curves
     */
    async humanMove(targetX: number, targetY: number): Promise<void> {
        const currentPosition = await this.page.evaluate(() => ({
            x: (window as any).__mouseX || 0,
            y: (window as any).__mouseY || 0,
        }));

        // Calculate intermediate points for natural curve
        const steps = Math.floor(Math.random() * 15 + 10); // 10-25 steps
        const controlPoint1X = currentPosition.x + (targetX - currentPosition.x) * 0.3 + (Math.random() - 0.5) * 100;
        const controlPoint1Y = currentPosition.y + (targetY - currentPosition.y) * 0.3 + (Math.random() - 0.5) * 100;

        for (let i = 1; i <= steps; i++) {
            const t = i / steps;

            // Bezier curve calculation
            const x = Math.pow(1 - t, 2) * currentPosition.x +
                2 * (1 - t) * t * controlPoint1X +
                Math.pow(t, 2) * targetX;
            const y = Math.pow(1 - t, 2) * currentPosition.y +
                2 * (1 - t) * t * controlPoint1Y +
                Math.pow(t, 2) * targetY;

            await this.page.mouse.move(x, y);
            await this.page.waitForTimeout(Math.floor(Math.random() * 20 + 5)); // 5-25ms between moves
        }

        // Store final position
        await this.page.evaluate(({ x, y }) => {
            (window as any).__mouseX = x;
            (window as any).__mouseY = y;
        }, { x: targetX, y: targetY });
    }

    /**
     * Random scroll behavior mimicking reading
     */
    async humanScroll(direction: 'up' | 'down' = 'down'): Promise<void> {
        const scrollAmount = Math.floor(Math.random() * 400 + 100); // 100-500 pixels
        const actualScroll = direction === 'down' ? scrollAmount : -scrollAmount;

        // Scroll in multiple small steps
        const steps = Math.floor(Math.random() * 5 + 3); // 3-8 steps
        const stepAmount = actualScroll / steps;

        for (let i = 0; i < steps; i++) {
            await this.page.mouse.wheel(0, stepAmount);
            await this.page.waitForTimeout(Math.floor(Math.random() * 50 + 20)); // 20-70ms between scrolls
        }

        await this.randomDelay(300, 1000);
    }

    /**
     * Scroll to a specific element naturally
     */
    async scrollToElement(selector: string): Promise<void> {
        const element = await this.page.$(selector);
        if (!element) return;

        const box = await element.boundingBox();
        if (!box) return;

        const viewportHeight = await this.page.evaluate(() => window.innerHeight);
        const currentScroll = await this.page.evaluate(() => window.scrollY);
        const targetScroll = box.y - viewportHeight / 2;

        const distance = targetScroll - currentScroll;
        const steps = Math.abs(Math.floor(distance / 100));

        for (let i = 0; i < steps; i++) {
            await this.page.mouse.wheel(0, distance / steps);
            await this.page.waitForTimeout(Math.floor(Math.random() * 30 + 10));
        }

        await this.mediumDelay();
    }

    /**
     * Click with natural mouse movement
     */
    async humanClick(selector: string): Promise<void> {
        const element = await this.page.$(selector);
        if (!element) {
            throw new Error(`Element not found: ${selector}`);
        }

        const box = await element.boundingBox();
        if (!box) {
            throw new Error(`Cannot get bounding box for: ${selector}`);
        }

        // Calculate random position within element (not exactly center)
        const x = box.x + box.width * (0.3 + Math.random() * 0.4); // 30-70% of width
        const y = box.y + box.height * (0.3 + Math.random() * 0.4); // 30-70% of height

        // Move mouse naturally to target
        await this.humanMove(x, y);

        // Small delay before clicking
        await this.shortDelay();

        // Click
        await this.page.mouse.click(x, y);
    }

    /**
     * Double click with human timing
     */
    async humanDoubleClick(selector: string): Promise<void> {
        const element = await this.page.$(selector);
        if (!element) return;

        const box = await element.boundingBox();
        if (!box) return;

        const x = box.x + box.width * (0.3 + Math.random() * 0.4);
        const y = box.y + box.height * (0.3 + Math.random() * 0.4);

        await this.humanMove(x, y);
        await this.shortDelay();
        await this.page.mouse.dblclick(x, y);
    }

    /**
     * Hover over an element naturally
     */
    async humanHover(selector: string): Promise<void> {
        const element = await this.page.$(selector);
        if (!element) return;

        const box = await element.boundingBox();
        if (!box) return;

        const x = box.x + box.width / 2 + (Math.random() - 0.5) * 10;
        const y = box.y + box.height / 2 + (Math.random() - 0.5) * 10;

        await this.humanMove(x, y);
        await this.randomDelay(500, 1500); // Hover for a bit
    }

    /**
     * Simulate reading a page (scrolling and pausing)
     */
    async simulateReading(duration = 10000): Promise<void> {
        const startTime = Date.now();

        while (Date.now() - startTime < duration) {
            // Random scroll down
            if (Math.random() < 0.7) {
                await this.humanScroll('down');
            } else {
                await this.humanScroll('up');
            }

            // Pause to "read"
            await this.randomDelay(1000, 3000);

            // Occasionally move mouse randomly
            if (Math.random() < 0.3) {
                const viewportWidth = await this.page.evaluate(() => window.innerWidth);
                const viewportHeight = await this.page.evaluate(() => window.innerHeight);
                await this.humanMove(
                    Math.random() * viewportWidth,
                    Math.random() * viewportHeight
                );
            }
        }
    }

    /**
     * Wait for element and interact humanly
     */
    async waitAndClick(selector: string, timeout = 10000): Promise<void> {
        await this.page.waitForSelector(selector, { timeout });
        await this.mediumDelay();
        await this.humanClick(selector);
    }

    /**
     * Fill form field with human behavior
     */
    async fillField(selector: string, value: string): Promise<void> {
        await this.scrollToElement(selector);
        await this.shortDelay();
        await this.humanType(selector, value, { makeTypos: true });
    }
}
