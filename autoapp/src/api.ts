import type { AutoAppAPI, AuthUser } from './types';

// API base URL for dev mode (browser, not Electron)
const DEV_API_URL = 'https://tuyendung.test';

// Dev mode token storage
let devToken: string | null = null;
let devUser: AuthUser | null = null;

async function devApiCall<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if (devToken) {
        headers['Authorization'] = `Bearer ${devToken}`;
    }

    const response = await fetch(`${DEV_API_URL}${path}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || data?.errors?.email?.[0] || `API error ${response.status}`);
    }

    return response.json() as Promise<T>;
}

// Real API calls for browser dev mode (calls Laravel directly)
const mockApi: AutoAppAPI = {
    minimize: () => { },
    maximize: () => { },
    close: () => { },

    // Auth - real API calls in dev mode
    login: async (email, password) => {
        try {
            const result = await devApiCall<{ data: { user: AuthUser; token: string } }>('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password, device_name: 'AutoApp-DevBrowser' }),
            });
            devToken = result.data.token;
            devUser = result.data.user;
            return { success: true, user: result.data.user };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            return { success: false, error: message };
        }
    },
    logout: async () => {
        if (devToken) {
            try {
                await devApiCall('/api/auth/logout', { method: 'POST' });
            } catch {
                // Ignore errors during logout
            }
        }
        devToken = null;
        devUser = null;
        return { success: true };
    },
    getUser: async () => devUser,
    getAuthStatus: async () => ({
        isAuthenticated: devToken !== null,
        user: devUser,
    }),
    verifyAuth: async () => {
        if (!devToken) return null;
        try {
            const result = await devApiCall<{ data: AuthUser }>('/api/auth/me');
            devUser = result.data;
            return result.data;
        } catch {
            devToken = null;
            devUser = null;
            return null;
        }
    },

    // Agent (not available in browser dev mode)
    getAgentStatus: async () => ({ status: 'disconnected' }),
    reconnectAgent: async () => ({ success: false, error: 'Khong kha dung trong browser dev mode' }),

    // Profiles
    getProfiles: async () => [],
    getProfile: async () => undefined,
    createProfile: async (data) => ({
        id: crypto.randomUUID(),
        name: data.name || 'Mock Profile',
        color: data.color || '#6366f1',
        tags: data.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'idle' as const,
        ...data,
    }),
    updateProfile: async () => null,
    deleteProfile: async () => true,
    launchBrowser: async () => ({ success: false, error: 'Khong kha dung ngoai Electron' }),
    closeBrowser: async () => false,
    getActiveBrowsers: async () => [],
    getBrowserStatus: async () => false,
    getAutomations: async () => [],
    createAutomation: async (data) => ({
        id: crypto.randomUUID(),
        name: data.name || 'Mock Automation',
        type: data.type || 'sequence',
        steps: data.steps || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }),
    updateAutomation: async () => null,
    deleteAutomation: async () => true,
    runAutomation: async () => ({
        id: crypto.randomUUID(),
        automationId: '',
        automationName: '',
        profileId: '',
        profileName: '',
        status: 'failed' as const,
        startedAt: new Date().toISOString(),
        stepsCompleted: 0,
        totalSteps: 0,
        error: 'Khong kha dung ngoai Electron',
    }),
    stopAutomation: async () => true,
    getLogs: async () => [],
    clearLogs: async () => true,
    onBrowserEvent: () => () => { },
    onLogEvent: () => () => { },
    onAuthChanged: () => () => { },
    onAgentStatus: () => () => { },
    onAgentEvent: () => () => { },
};

export function getApi(): AutoAppAPI {
    if (typeof window !== 'undefined' && window.autoApp) {
        return window.autoApp;
    }
    return mockApi;
}
