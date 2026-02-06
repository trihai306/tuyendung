import { promises as fs } from 'fs';
import path from 'path';

export interface ProxyConfig {
    server: string;
    username?: string;
    password?: string;
    country?: string;
    type?: 'http' | 'https' | 'socks5';
}

/**
 * Proxy Rotator Class
 * Manages proxy rotation to avoid IP-based detection
 */
export class ProxyRotator {
    private proxies: ProxyConfig[] = [];
    private currentIndex = 0;
    private usedProxies: Set<string> = new Set();
    private lastRotation: number = Date.now();

    /**
     * Add a single proxy
     */
    addProxy(proxy: ProxyConfig): void {
        this.proxies.push(proxy);
    }

    /**
     * Add multiple proxies at once
     */
    addProxies(proxies: ProxyConfig[]): void {
        this.proxies.push(...proxies);
    }

    /**
     * Get next proxy in rotation
     */
    getNext(): ProxyConfig | null {
        if (this.proxies.length === 0) return null;

        const proxy = this.proxies[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
        this.lastRotation = Date.now();

        return proxy;
    }

    /**
     * Get a random proxy
     */
    getRandom(): ProxyConfig | null {
        if (this.proxies.length === 0) return null;
        const index = Math.floor(Math.random() * this.proxies.length);
        return this.proxies[index];
    }

    /**
     * Get an unused proxy (tracks which proxies have been used)
     */
    getUnused(): ProxyConfig | null {
        if (this.proxies.length === 0) return null;

        const availableProxies = this.proxies.filter(p => !this.usedProxies.has(p.server));

        if (availableProxies.length === 0) {
            // Reset if all proxies have been used
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
    getByCountry(country: string): ProxyConfig | null {
        const filtered = this.proxies.filter(p => p.country?.toLowerCase() === country.toLowerCase());
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
    async loadFromFile(filePath: string): Promise<void> {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));

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
    private parseLine(line: string): ProxyConfig | null {
        try {
            // Format: type://username:password@host:port
            const urlMatch = line.match(/^(https?|socks5):\/\/(?:([^:]+):([^@]+)@)?([^:]+):(\d+)$/);
            if (urlMatch) {
                return {
                    type: urlMatch[1] as 'http' | 'https' | 'socks5',
                    username: urlMatch[2],
                    password: urlMatch[3],
                    server: `${urlMatch[1]}://${urlMatch[4]}:${urlMatch[5]}`,
                };
            }

            // Format: host:port:username:password or host:port
            const parts = line.split(':');
            if (parts.length >= 2) {
                const host = parts[0];
                const port = parts[1];

                return {
                    server: `http://${host}:${port}`,
                    username: parts[2],
                    password: parts[3],
                    type: 'http',
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
    async saveToFile(filePath: string): Promise<void> {
        const lines = this.proxies.map(p => {
            if (p.username && p.password) {
                return `${p.type || 'http'}://${p.username}:${p.password}@${p.server.replace(/^https?:\/\//, '')}`;
            }
            return p.server;
        });

        await fs.writeFile(filePath, lines.join('\n'), 'utf-8');
    }

    /**
     * Test if a proxy is working
     */
    async testProxy(proxy: ProxyConfig): Promise<boolean> {
        // This is a placeholder - actual implementation would make a request through the proxy
        // and check if it's working
        return true;
    }

    /**
     * Remove non-working proxies
     */
    async cleanProxies(): Promise<void> {
        const workingProxies: ProxyConfig[] = [];

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
    get count(): number {
        return this.proxies.length;
    }

    /**
     * Check if proxies are available
     */
    get hasProxies(): boolean {
        return this.proxies.length > 0;
    }
}

/**
 * Get Playwright proxy configuration from ProxyConfig
 */
export function getPlaywrightProxyConfig(proxy: ProxyConfig) {
    return {
        server: proxy.server,
        username: proxy.username,
        password: proxy.password,
    };
}

/**
 * Create a default proxy rotator instance
 */
export function createProxyRotator(): ProxyRotator {
    return new ProxyRotator();
}
