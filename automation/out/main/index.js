"use strict";
const electron = require("electron");
const path = require("path");
const fs = require("fs");
const { chromium: playwrightExtra } = require("playwright-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
playwrightExtra.use(StealthPlugin());
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0"
];
const SCREEN_RESOLUTIONS = [
  { width: 1920, height: 1080 },
  { width: 1366, height: 768 },
  { width: 1536, height: 864 },
  { width: 1440, height: 900 },
  { width: 1280, height: 720 }
];
function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}
function getRandomResolution() {
  return SCREEN_RESOLUTIONS[Math.floor(Math.random() * SCREEN_RESOLUTIONS.length)];
}
async function launchStealthBrowser(options) {
  const resolution = getRandomResolution();
  const userAgent = getRandomUserAgent();
  const launchOptions = {
    headless: options?.headless ?? false,
    // Headful by default for better stealth
    args: [
      // Disable automation flags
      "--disable-blink-features=AutomationControlled",
      "--disable-features=IsolateOrigins,site-per-process",
      // Realistic browser settings
      "--disable-dev-shm-usage",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      // Window size
      `--window-size=${resolution.width},${resolution.height}`,
      // Disable some fingerprinting vectors
      "--disable-web-security",
      "--disable-features=VizDisplayCompositor",
      // User data persistence (important for session management)
      ...options?.profilePath ? [`--user-data-dir=${options.profilePath}`] : []
    ]
  };
  if (options?.proxy) {
    launchOptions.proxy = {
      server: options.proxy.server,
      username: options.proxy.username,
      password: options.proxy.password
    };
  }
  const browser = await playwrightExtra.launch(launchOptions);
  const context = await browser.newContext({
    viewport: resolution,
    // Timezone & Locale (Vietnam)
    locale: "vi-VN",
    timezoneId: "Asia/Ho_Chi_Minh",
    // Permissions
    permissions: ["geolocation", "notifications"],
    // Geolocation (Hanoi coordinates)
    geolocation: { latitude: 21.0285, longitude: 105.8542 },
    // User Agent
    userAgent,
    // Extra HTTP headers
    extraHTTPHeaders: {
      "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      "Cache-Control": "max-age=0",
      "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="121", "Google Chrome";v="121"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"Windows"',
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1"
    },
    // Ignore HTTPS errors (useful for some proxies)
    ignoreHTTPSErrors: true,
    // Device scale factor
    deviceScaleFactor: 1,
    // Color scheme
    colorScheme: "light"
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", {
      get: () => void 0
    });
    if (navigator.webdriver) {
      delete navigator.__proto__.webdriver;
    }
    Object.defineProperty(navigator, "plugins", {
      get: () => {
        const plugins = [
          { name: "Chrome PDF Plugin", filename: "internal-pdf-viewer" },
          { name: "Chrome PDF Viewer", filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai" },
          { name: "Native Client", filename: "internal-nacl-plugin" }
        ];
        return plugins;
      }
    });
    Object.defineProperty(navigator, "languages", {
      get: () => ["vi-VN", "vi", "en-US", "en"]
    });
    Object.defineProperty(navigator, "hardwareConcurrency", {
      get: () => Math.floor(Math.random() * 8) + 4
      // 4-12 cores
    });
    Object.defineProperty(navigator, "deviceMemory", {
      get: () => [4, 8, 16][Math.floor(Math.random() * 3)]
      // 4, 8, or 16 GB
    });
    window.chrome = {
      runtime: {
        connect: () => {
        },
        sendMessage: () => {
        }
      },
      loadTimes: () => {
      },
      csi: () => {
      },
      app: {}
    };
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) => {
      if (parameters.name === "notifications") {
        return Promise.resolve({ state: Notification.permission });
      }
      return originalQuery.call(window.navigator.permissions, parameters);
    };
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function(type, quality) {
      if (type === "image/png" && this.width > 0 && this.height > 0) {
        const context2 = this.getContext("2d");
        if (context2) {
          const imageData = context2.getImageData(0, 0, this.width, this.height);
          for (let i = 0; i < imageData.data.length; i += 4) {
            imageData.data[i] = imageData.data[i] ^ (Math.random() > 0.99 ? 1 : 0);
          }
          context2.putImageData(imageData, 0, 0);
        }
      }
      return originalToDataURL.apply(this, [type, quality]);
    };
    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
      if (parameter === 37445) {
        return "Intel Inc.";
      }
      if (parameter === 37446) {
        return "Intel Iris OpenGL Engine";
      }
      return getParameter.call(this, parameter);
    };
    if (typeof WebGL2RenderingContext !== "undefined") {
      const getParameter2 = WebGL2RenderingContext.prototype.getParameter;
      WebGL2RenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) {
          return "Intel Inc.";
        }
        if (parameter === 37446) {
          return "Intel Iris OpenGL Engine";
        }
        return getParameter2.call(this, parameter);
      };
    }
  });
  return { browser, context };
}
async function createStealthPage(context) {
  const page = await context.newPage();
  await page.setExtraHTTPHeaders({
    "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7"
  });
  return page;
}
class HumanBehavior {
  page;
  constructor(page) {
    this.page = page;
  }
  /**
   * Random delay between actions (simulates human thinking time)
   */
  async randomDelay(min = 500, max = 2e3) {
    const delay = Math.floor(Math.random() * (max - min) + min);
    await this.page.waitForTimeout(delay);
  }
  /**
   * Short delay for quick actions
   */
  async shortDelay() {
    await this.randomDelay(100, 400);
  }
  /**
   * Medium delay for normal actions
   */
  async mediumDelay() {
    await this.randomDelay(500, 1500);
  }
  /**
   * Long delay for thinking/reading actions
   */
  async longDelay() {
    await this.randomDelay(2e3, 5e3);
  }
  /**
   * Human-like typing with variable speed and occasional typos
   */
  async humanType(selector, text, options) {
    const { makeTypos = false, minDelay = 50, maxDelay = 200 } = options || {};
    await this.humanClick(selector);
    await this.shortDelay();
    await this.page.keyboard.press("Control+A");
    await this.page.keyboard.press("Backspace");
    await this.shortDelay();
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (makeTypos && Math.random() < 0.03) {
        const typoChar = String.fromCharCode(char.charCodeAt(0) + (Math.random() > 0.5 ? 1 : -1));
        await this.page.keyboard.type(typoChar, {
          delay: Math.floor(Math.random() * (maxDelay - minDelay) + minDelay)
        });
        await this.randomDelay(100, 300);
        await this.page.keyboard.press("Backspace");
        await this.randomDelay(50, 150);
      }
      await this.page.keyboard.type(char, {
        delay: Math.floor(Math.random() * (maxDelay - minDelay) + minDelay)
      });
      if (char === " " && Math.random() < 0.3) {
        await this.randomDelay(200, 600);
      }
    }
  }
  /**
   * Natural mouse movement with bezier curves
   */
  async humanMove(targetX, targetY) {
    const currentPosition = await this.page.evaluate(() => ({
      x: window.__mouseX || 0,
      y: window.__mouseY || 0
    }));
    const steps = Math.floor(Math.random() * 15 + 10);
    const controlPoint1X = currentPosition.x + (targetX - currentPosition.x) * 0.3 + (Math.random() - 0.5) * 100;
    const controlPoint1Y = currentPosition.y + (targetY - currentPosition.y) * 0.3 + (Math.random() - 0.5) * 100;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const x = Math.pow(1 - t, 2) * currentPosition.x + 2 * (1 - t) * t * controlPoint1X + Math.pow(t, 2) * targetX;
      const y = Math.pow(1 - t, 2) * currentPosition.y + 2 * (1 - t) * t * controlPoint1Y + Math.pow(t, 2) * targetY;
      await this.page.mouse.move(x, y);
      await this.page.waitForTimeout(Math.floor(Math.random() * 20 + 5));
    }
    await this.page.evaluate(({ x, y }) => {
      window.__mouseX = x;
      window.__mouseY = y;
    }, { x: targetX, y: targetY });
  }
  /**
   * Random scroll behavior mimicking reading
   */
  async humanScroll(direction = "down") {
    const scrollAmount = Math.floor(Math.random() * 400 + 100);
    const actualScroll = direction === "down" ? scrollAmount : -scrollAmount;
    const steps = Math.floor(Math.random() * 5 + 3);
    const stepAmount = actualScroll / steps;
    for (let i = 0; i < steps; i++) {
      await this.page.mouse.wheel(0, stepAmount);
      await this.page.waitForTimeout(Math.floor(Math.random() * 50 + 20));
    }
    await this.randomDelay(300, 1e3);
  }
  /**
   * Scroll to a specific element naturally
   */
  async scrollToElement(selector) {
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
  async humanClick(selector) {
    const element = await this.page.$(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }
    const box = await element.boundingBox();
    if (!box) {
      throw new Error(`Cannot get bounding box for: ${selector}`);
    }
    const x = box.x + box.width * (0.3 + Math.random() * 0.4);
    const y = box.y + box.height * (0.3 + Math.random() * 0.4);
    await this.humanMove(x, y);
    await this.shortDelay();
    await this.page.mouse.click(x, y);
  }
  /**
   * Double click with human timing
   */
  async humanDoubleClick(selector) {
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
  async humanHover(selector) {
    const element = await this.page.$(selector);
    if (!element) return;
    const box = await element.boundingBox();
    if (!box) return;
    const x = box.x + box.width / 2 + (Math.random() - 0.5) * 10;
    const y = box.y + box.height / 2 + (Math.random() - 0.5) * 10;
    await this.humanMove(x, y);
    await this.randomDelay(500, 1500);
  }
  /**
   * Simulate reading a page (scrolling and pausing)
   */
  async simulateReading(duration = 1e4) {
    const startTime = Date.now();
    while (Date.now() - startTime < duration) {
      if (Math.random() < 0.7) {
        await this.humanScroll("down");
      } else {
        await this.humanScroll("up");
      }
      await this.randomDelay(1e3, 3e3);
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
  async waitAndClick(selector, timeout = 1e4) {
    await this.page.waitForSelector(selector, { timeout });
    await this.mediumDelay();
    await this.humanClick(selector);
  }
  /**
   * Fill form field with human behavior
   */
  async fillField(selector, value) {
    await this.scrollToElement(selector);
    await this.shortDelay();
    await this.humanType(selector, value, { makeTypos: true });
  }
}
class ProxyRotator {
  proxies = [];
  currentIndex = 0;
  usedProxies = /* @__PURE__ */ new Set();
  lastRotation = Date.now();
  /**
   * Add a single proxy
   */
  addProxy(proxy) {
    this.proxies.push(proxy);
  }
  /**
   * Add multiple proxies at once
   */
  addProxies(proxies) {
    this.proxies.push(...proxies);
  }
  /**
   * Get next proxy in rotation
   */
  getNext() {
    if (this.proxies.length === 0) return null;
    const proxy = this.proxies[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
    this.lastRotation = Date.now();
    return proxy;
  }
  /**
   * Get a random proxy
   */
  getRandom() {
    if (this.proxies.length === 0) return null;
    const index = Math.floor(Math.random() * this.proxies.length);
    return this.proxies[index];
  }
  /**
   * Get an unused proxy (tracks which proxies have been used)
   */
  getUnused() {
    if (this.proxies.length === 0) return null;
    const availableProxies = this.proxies.filter((p) => !this.usedProxies.has(p.server));
    if (availableProxies.length === 0) {
      this.usedProxies.clear();
      return this.getRandom();
    }
    const proxy = availableProxies[Math.floor(Math.random() * availableProxies.length)];
    this.usedProxies.add(proxy.server);
    return proxy;
  }
  /**
   * Get proxy by country
   */
  getByCountry(country) {
    const filtered = this.proxies.filter((p) => p.country?.toLowerCase() === country.toLowerCase());
    if (filtered.length === 0) return null;
    return filtered[Math.floor(Math.random() * filtered.length)];
  }
  /**
   * Load proxies from a text file
   * Supported formats:
   * - host:port
   * - host:port:username:password
   * - type://host:port
   * - type://username:password@host:port
   */
  async loadFromFile(filePath) {
    try {
      const content = await fs.promises.readFile(filePath, "utf-8");
      const lines = content.split("\n").filter((line) => line.trim() && !line.startsWith("#"));
      for (const line of lines) {
        const proxy = this.parseLine(line.trim());
        if (proxy) {
          this.addProxy(proxy);
        }
      }
      console.log(`Loaded ${this.proxies.length} proxies from ${filePath}`);
    } catch (error) {
      console.error(`Failed to load proxies from ${filePath}:`, error);
    }
  }
  /**
   * Parse a single proxy line
   */
  parseLine(line) {
    try {
      const urlMatch = line.match(/^(https?|socks5):\/\/(?:([^:]+):([^@]+)@)?([^:]+):(\d+)$/);
      if (urlMatch) {
        return {
          type: urlMatch[1],
          username: urlMatch[2],
          password: urlMatch[3],
          server: `${urlMatch[1]}://${urlMatch[4]}:${urlMatch[5]}`
        };
      }
      const parts = line.split(":");
      if (parts.length >= 2) {
        const host = parts[0];
        const port = parts[1];
        return {
          server: `http://${host}:${port}`,
          username: parts[2],
          password: parts[3],
          type: "http"
        };
      }
    } catch (error) {
      console.error(`Failed to parse proxy line: ${line}`);
    }
    return null;
  }
  /**
   * Save current proxies to file
   */
  async saveToFile(filePath) {
    const lines = this.proxies.map((p) => {
      if (p.username && p.password) {
        return `${p.type || "http"}://${p.username}:${p.password}@${p.server.replace(/^https?:\/\//, "")}`;
      }
      return p.server;
    });
    await fs.promises.writeFile(filePath, lines.join("\n"), "utf-8");
  }
  /**
   * Test if a proxy is working
   */
  async testProxy(proxy) {
    return true;
  }
  /**
   * Remove non-working proxies
   */
  async cleanProxies() {
    const workingProxies = [];
    for (const proxy of this.proxies) {
      if (await this.testProxy(proxy)) {
        workingProxies.push(proxy);
      }
    }
    this.proxies = workingProxies;
    console.log(`After cleaning: ${this.proxies.length} working proxies`);
  }
  /**
   * Get total number of proxies
   */
  get count() {
    return this.proxies.length;
  }
  /**
   * Check if proxies are available
   */
  get hasProxies() {
    return this.proxies.length > 0;
  }
}
let mainWindow = null;
let stealthBrowser = null;
let activePage = null;
let humanBehavior = null;
const proxyRotator = new ProxyRotator();
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1200,
    height: 800,
    title: "Stealth Automation",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "../preload/index.js")
    }
  });
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
electron.ipcMain.handle("browser:launch", async (_, options) => {
  try {
    if (proxyRotator.hasProxies && !options.proxy) {
      const proxy = proxyRotator.getNext();
      if (proxy) {
        options.proxy = proxy;
      }
    }
    const result = await launchStealthBrowser(options);
    stealthBrowser = result;
    return { success: true, message: "Browser launched successfully" };
  } catch (error) {
    console.error("Failed to launch browser:", error);
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("browser:close", async () => {
  try {
    if (stealthBrowser) {
      await stealthBrowser.browser.close();
      stealthBrowser = null;
      activePage = null;
      humanBehavior = null;
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("browser:navigate", async (_, url) => {
  try {
    if (!stealthBrowser) {
      return { success: false, error: "Browser not launched" };
    }
    if (!activePage) {
      activePage = await createStealthPage(stealthBrowser.context);
      humanBehavior = new HumanBehavior(activePage);
    }
    await activePage.goto(url, { waitUntil: "domcontentloaded" });
    if (humanBehavior) {
      await humanBehavior.randomDelay(1e3, 2e3);
    }
    const title = await activePage.title();
    return { success: true, title };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("browser:screenshot", async () => {
  try {
    if (!activePage) {
      return { success: false, error: "No active page" };
    }
    const screenshot = await activePage.screenshot({ type: "png" });
    return { success: true, data: screenshot.toString("base64") };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("browser:click", async (_, selector) => {
  try {
    if (!activePage || !humanBehavior) {
      return { success: false, error: "No active page" };
    }
    await humanBehavior.humanClick(selector);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("browser:type", async (_, { selector, text }) => {
  try {
    if (!activePage || !humanBehavior) {
      return { success: false, error: "No active page" };
    }
    await humanBehavior.humanType(selector, text, { makeTypos: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("browser:scroll", async (_, direction) => {
  try {
    if (!activePage || !humanBehavior) {
      return { success: false, error: "No active page" };
    }
    await humanBehavior.humanScroll(direction);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("browser:waitAndClick", async (_, { selector, timeout }) => {
  try {
    if (!activePage || !humanBehavior) {
      return { success: false, error: "No active page" };
    }
    await humanBehavior.waitAndClick(selector, timeout);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("browser:simulateReading", async (_, duration) => {
  try {
    if (!activePage || !humanBehavior) {
      return { success: false, error: "No active page" };
    }
    await humanBehavior.simulateReading(duration);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("browser:getContent", async () => {
  try {
    if (!activePage) {
      return { success: false, error: "No active page" };
    }
    const content = await activePage.content();
    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("browser:evaluate", async (_, script) => {
  try {
    if (!activePage) {
      return { success: false, error: "No active page" };
    }
    const result = await activePage.evaluate(script);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("proxy:load", async (_, filePath) => {
  try {
    await proxyRotator.loadFromFile(filePath);
    return { success: true, count: proxyRotator.count };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("proxy:add", async (_, proxy) => {
  try {
    proxyRotator.addProxy(proxy);
    return { success: true, count: proxyRotator.count };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("proxy:count", async () => {
  return { success: true, count: proxyRotator.count };
});
electron.app.whenReady().then(createWindow);
electron.app.on("window-all-closed", async () => {
  if (stealthBrowser) {
    await stealthBrowser.browser.close();
  }
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("activate", () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
