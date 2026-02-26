export interface BrowserProfile {
    id: string;
    name: string;
    color: string;
    proxy?: { server: string; username?: string; password?: string };
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
    // Anti-detection fingerprint
    fingerprintSeed?: string;
    webglVendor?: string;
    webglRenderer?: string;
    hardwareConcurrency?: number;
    deviceMemory?: number;
    screenResolution?: { width: number; height: number };
}

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

export interface AutoAppAPI {
    minimize: () => void;
    maximize: () => void;
    close: () => void;

    // Auth
    login: (email: string, password: string) => Promise<{ success: boolean; user?: AuthUser; error?: string }>;
    logout: () => Promise<{ success: boolean }>;
    getUser: () => Promise<AuthUser | null>;
    getAuthStatus: () => Promise<{ isAuthenticated: boolean; user: AuthUser | null }>;
    verifyAuth: () => Promise<AuthUser | null>;

    // Agent
    getAgentStatus: () => Promise<{ status: string }>;
    reconnectAgent: () => Promise<{ success: boolean; error?: string }>;

    // Profiles
    getProfiles: () => Promise<BrowserProfile[]>;
    getProfile: (id: string) => Promise<BrowserProfile | undefined>;
    createProfile: (data: Partial<BrowserProfile>) => Promise<BrowserProfile>;
    updateProfile: (id: string, data: Partial<BrowserProfile>) => Promise<BrowserProfile | null>;
    deleteProfile: (id: string) => Promise<boolean>;
    launchBrowser: (profileId: string) => Promise<{ success: boolean; error?: string }>;
    closeBrowser: (profileId: string) => Promise<boolean>;
    getActiveBrowsers: () => Promise<Array<{ profileId: string; launchedAt: string; pagesCount: number }>>;
    getBrowserStatus: (profileId: string) => Promise<boolean>;
    getAutomations: () => Promise<AutomationTask[]>;
    createAutomation: (data: Partial<AutomationTask>) => Promise<AutomationTask>;
    updateAutomation: (id: string, data: Partial<AutomationTask>) => Promise<AutomationTask | null>;
    deleteAutomation: (id: string) => Promise<boolean>;
    runAutomation: (id: string, profileId: string) => Promise<AutomationLog>;
    stopAutomation: (id: string) => Promise<boolean>;
    getLogs: (limit?: number) => Promise<AutomationLog[]>;
    clearLogs: () => Promise<boolean>;

    // Events
    onBrowserEvent: (callback: (event: { type: string; profileId: string }) => void) => () => void;
    onLogEvent: (callback: (log: AutomationLog) => void) => () => void;
    onAuthChanged: (callback: (data: { user: AuthUser | null; isAuthenticated: boolean }) => void) => () => void;
    onAgentStatus: (callback: (data: { status: string }) => void) => () => void;
    onAgentEvent: (callback: (event: string, data: Record<string, unknown>) => void) => () => void;
}

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    avatar_url: string | null;
    company_id: number | null;
}

declare global {
    interface Window {
        autoApp: AutoAppAPI;
    }
}
