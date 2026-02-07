import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface BrowserProfile {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;

    // Browser settings
    userAgent?: string;
    viewport?: { width: number; height: number };
    locale?: string;
    timezone?: string;

    // Proxy settings
    proxy?: {
        server: string;
        username?: string;
        password?: string;
    };

    // Fingerprint settings
    colorScheme?: 'light' | 'dark' | 'no-preference';
    deviceScaleFactor?: number;

    // Custom headers
    extraHeaders?: Record<string, string>;

    // Session path (for cookies, localStorage, etc.)
    userDataDir?: string;

    // Notes
    notes?: string;
}

export interface ProfileCreateInput {
    name: string;
    userAgent?: string;
    viewport?: { width: number; height: number };
    locale?: string;
    timezone?: string;
    proxy?: {
        server: string;
        username?: string;
        password?: string;
    };
    colorScheme?: 'light' | 'dark' | 'no-preference';
    notes?: string;
}

export class ProfileManager {
    private profilesDir: string;
    private profilesFile: string;
    private profiles: Map<string, BrowserProfile> = new Map();
    private initialized: boolean = false;

    constructor(baseDir?: string) {
        const dataDir = baseDir || path.join(__dirname, '../../data');
        this.profilesDir = path.join(dataDir, 'profiles');
        this.profilesFile = path.join(dataDir, 'profiles.json');
    }

    /**
     * Initialize the profile manager
     */
    async init(): Promise<void> {
        if (this.initialized) return;

        // Mark as initialized FIRST to prevent re-entry
        this.initialized = true;

        // Create directories if they don't exist
        await fs.mkdir(this.profilesDir, { recursive: true });

        // Load existing profiles
        try {
            const data = await fs.readFile(this.profilesFile, 'utf-8');
            const profiles: BrowserProfile[] = JSON.parse(data);
            profiles.forEach(p => this.profiles.set(p.id, p));
            console.log(`Loaded ${profiles.length} profiles`);
        } catch (error) {
            // File doesn't exist yet, seed with default profiles
            console.log('No existing profiles found, creating default stealth profiles...');
            await this.seedDefaultProfiles();
        }
    }

    /**
     * Seed default stealth profiles
     */
    private async seedDefaultProfiles(): Promise<void> {
        const defaultProfiles: ProfileCreateInput[] = [
            {
                name: 'MacBook Pro 2023 - TP.HCM',
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                viewport: { width: 1512, height: 982 },
                locale: 'vi-VN',
                timezone: 'Asia/Ho_Chi_Minh',
                colorScheme: 'light',
                notes: 'Profile MacBook Pro 14" M2 Pro tại TP.HCM',
            },
            {
                name: 'Windows Gaming PC - Hà Nội',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                viewport: { width: 2560, height: 1440 },
                locale: 'vi-VN',
                timezone: 'Asia/Ho_Chi_Minh',
                colorScheme: 'dark',
                notes: 'Profile PC Gaming RTX 4070 tại Hà Nội',
            },
            {
                name: 'Windows Office Laptop - Đà Nẵng',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                viewport: { width: 1920, height: 1080 },
                locale: 'vi-VN',
                timezone: 'Asia/Ho_Chi_Minh',
                colorScheme: 'light',
                notes: 'Profile Laptop văn phòng Intel UHD tại Đà Nẵng',
            },
            {
                name: 'MacBook Air M2 - Cần Thơ',
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
                viewport: { width: 1470, height: 956 },
                locale: 'vi-VN',
                timezone: 'Asia/Ho_Chi_Minh',
                colorScheme: 'light',
                notes: 'Profile MacBook Air M2 Safari tại Cần Thơ',
            },
            {
                name: 'HP Laptop - Hải Phòng',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
                viewport: { width: 1366, height: 768 },
                locale: 'vi-VN',
                timezone: 'Asia/Ho_Chi_Minh',
                colorScheme: 'light',
                notes: 'Profile HP Laptop Edge browser tại Hải Phòng',
            },
            {
                name: 'iMac 27" Designer - TP.HCM',
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                viewport: { width: 2560, height: 1440 },
                locale: 'vi-VN',
                timezone: 'Asia/Ho_Chi_Minh',
                colorScheme: 'light',
                notes: 'Profile iMac 27" AMD Radeon cho designer tại TP.HCM',
            },
        ];

        for (const profile of defaultProfiles) {
            await this.create(profile);
        }

        console.log(`Created ${defaultProfiles.length} default stealth profiles`);
    }

    /**
     * Save profiles to disk
     */
    private async save(): Promise<void> {
        const profiles = Array.from(this.profiles.values());
        await fs.writeFile(this.profilesFile, JSON.stringify(profiles, null, 2), 'utf-8');
    }

    /**
     * Get all profiles
     */
    async getAll(): Promise<BrowserProfile[]> {
        await this.init();
        return Array.from(this.profiles.values()).sort((a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }

    /**
     * Get profile by ID
     */
    async getById(id: string): Promise<BrowserProfile | null> {
        await this.init();
        return this.profiles.get(id) || null;
    }

    /**
     * Create a new profile
     */
    async create(input: ProfileCreateInput): Promise<BrowserProfile> {
        await this.init();

        const id = randomUUID();
        const now = new Date().toISOString();

        // Create user data directory for this profile
        const userDataDir = path.join(this.profilesDir, id);
        await fs.mkdir(userDataDir, { recursive: true });

        const profile: BrowserProfile = {
            id,
            name: input.name,
            createdAt: now,
            updatedAt: now,
            userAgent: input.userAgent,
            viewport: input.viewport || { width: 1920, height: 1080 },
            locale: input.locale || 'vi-VN',
            timezone: input.timezone || 'Asia/Ho_Chi_Minh',
            proxy: input.proxy,
            colorScheme: input.colorScheme || 'light',
            deviceScaleFactor: 1,
            userDataDir,
            notes: input.notes,
        };

        this.profiles.set(id, profile);
        await this.save();

        console.log(`Created profile: ${profile.name} (${id})`);
        return profile;
    }

    /**
     * Update a profile
     */
    async update(id: string, input: Partial<ProfileCreateInput>): Promise<BrowserProfile | null> {
        await this.init();

        const profile = this.profiles.get(id);
        if (!profile) return null;

        const updated: BrowserProfile = {
            ...profile,
            ...input,
            updatedAt: new Date().toISOString(),
        };

        this.profiles.set(id, updated);
        await this.save();

        console.log(`Updated profile: ${updated.name} (${id})`);
        return updated;
    }

    /**
     * Delete a profile
     */
    async delete(id: string): Promise<boolean> {
        await this.init();

        const profile = this.profiles.get(id);
        if (!profile) return false;

        // Delete user data directory
        if (profile.userDataDir) {
            try {
                await fs.rm(profile.userDataDir, { recursive: true, force: true });
            } catch (error) {
                console.error(`Failed to delete user data dir: ${error}`);
            }
        }

        this.profiles.delete(id);
        await this.save();

        console.log(`Deleted profile: ${profile.name} (${id})`);
        return true;
    }

    /**
     * Duplicate a profile
     */
    async duplicate(id: string, newName?: string): Promise<BrowserProfile | null> {
        await this.init();

        const source = this.profiles.get(id);
        if (!source) return null;

        const { id: _oldId, createdAt: _createdAt, updatedAt: _updatedAt, userDataDir: _oldDir, ...rest } = source;

        return this.create({
            ...rest,
            name: newName || `${source.name} (copy)`,
        });
    }

    /**
     * Get profile count
     */
    get count(): number {
        return this.profiles.size;
    }

    /**
     * Export profile for Playwright context
     */
    getPlaywrightOptions(profile: BrowserProfile) {
        return {
            viewport: profile.viewport,
            locale: profile.locale,
            timezoneId: profile.timezone,
            colorScheme: profile.colorScheme,
            deviceScaleFactor: profile.deviceScaleFactor || 1,
            userAgent: profile.userAgent,
            proxy: profile.proxy ? {
                server: profile.proxy.server,
                username: profile.proxy.username,
                password: profile.proxy.password,
            } : undefined,
            extraHTTPHeaders: profile.extraHeaders,
        };
    }
}

// Singleton instance
export const profileManager = new ProfileManager();
