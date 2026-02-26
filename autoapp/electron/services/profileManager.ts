import Store from 'electron-store';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';

export interface BrowserProfile {
    id: string;
    name: string;
    color: string;
    proxy?: {
        server: string;
        username?: string;
        password?: string;
    };
    userAgent?: string;
    viewport?: { width: number; height: number };
    locale?: string;
    timezone?: string;
    notes?: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    lastUsedAt?: string;
    status: 'idle' | 'running' | 'error';
    // Anti-detection fingerprint fields
    fingerprintSeed?: string;
    webglVendor?: string;
    webglRenderer?: string;
    hardwareConcurrency?: number;
    deviceMemory?: number;
    screenResolution?: { width: number; height: number };
}

const COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#ef4444',
    '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4',
    '#3b82f6', '#a855f7',
];

export class ProfileManager {
    private store: Store<{ profiles: BrowserProfile[] }>;
    private profilesDir: string;

    constructor() {
        this.store = new Store({
            name: 'autoapp-profiles',
            defaults: { profiles: [] as BrowserProfile[] },
        });

        this.profilesDir = path.join(app.getPath('userData'), 'browser-profiles');
        if (!fs.existsSync(this.profilesDir)) {
            fs.mkdirSync(this.profilesDir, { recursive: true });
        }
    }

    getAll(): BrowserProfile[] {
        return this.store.get('profiles');
    }

    get(id: string): BrowserProfile | undefined {
        return this.getAll().find(p => p.id === id);
    }

    create(data: Partial<BrowserProfile>): BrowserProfile {
        const profile: BrowserProfile = {
            id: uuidv4(),
            name: data.name || `Profile ${this.getAll().length + 1}`,
            color: data.color || COLORS[Math.floor(Math.random() * COLORS.length)],
            proxy: data.proxy,
            userAgent: data.userAgent,
            viewport: data.viewport || { width: 1280, height: 720 },
            locale: data.locale || 'vi-VN',
            timezone: data.timezone || 'Asia/Ho_Chi_Minh',
            notes: data.notes,
            tags: data.tags || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'idle',
        };

        // Create profile data directory
        const profileDir = this.getProfileDir(profile.id);
        if (!fs.existsSync(profileDir)) {
            fs.mkdirSync(profileDir, { recursive: true });
        }

        const profiles = this.getAll();
        profiles.push(profile);
        this.store.set('profiles', profiles);

        return profile;
    }

    update(id: string, data: Partial<BrowserProfile>): BrowserProfile | null {
        const profiles = this.getAll();
        const idx = profiles.findIndex(p => p.id === id);
        if (idx === -1) return null;

        profiles[idx] = {
            ...profiles[idx],
            ...data,
            id, // prevent id change
            updatedAt: new Date().toISOString(),
        };

        this.store.set('profiles', profiles);
        return profiles[idx];
    }

    delete(id: string): boolean {
        const profiles = this.getAll();
        const filtered = profiles.filter(p => p.id !== id);
        if (filtered.length === profiles.length) return false;

        this.store.set('profiles', filtered);

        // Remove profile data directory
        const profileDir = this.getProfileDir(id);
        if (fs.existsSync(profileDir)) {
            fs.rmSync(profileDir, { recursive: true, force: true });
        }

        return true;
    }

    setStatus(id: string, status: BrowserProfile['status']): void {
        this.update(id, { status });
    }

    markUsed(id: string): void {
        this.update(id, { lastUsedAt: new Date().toISOString() });
    }

    getProfileDir(id: string): string {
        return path.join(this.profilesDir, id);
    }
}
