import Store from 'electron-store';
import { BrowserWindow } from 'electron';

interface AuthUser {
    id: number;
    name: string;
    email: string;
    avatar_url: string | null;
    company_id: number | null;
}

interface AuthState {
    token: string | null;
    user: AuthUser | null;
}

export class AuthService {
    private store: Store<{ auth: AuthState }>;
    private baseUrl: string;

    constructor() {
        this.store = new Store<{ auth: AuthState }>({
            name: 'autoapp-auth',
            defaults: {
                auth: { token: null as string | null, user: null as AuthUser | null },
            },
        });

        // Default: local Laravel dev server via Herd
        this.baseUrl = process.env.AUTOAPP_API_URL || 'https://tuyendung.test';
    }

    /**
     * Login using email + password against the Laravel Sanctum API.
     * Returns user + token on success, throws on failure.
     */
    async login(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
        const response = await fetch(`${this.baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
                device_name: 'AutoApp-Electron',
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const message = errorData?.message || errorData?.errors?.email?.[0] || 'Dang nhap that bai';
            throw new Error(message);
        }

        const json = await response.json();
        const { user, token } = json.data;

        this.store.set('auth', { token, user });
        this.notifyRenderer();

        return { user, token };
    }

    /**
     * Verify the stored token by calling /api/auth/me.
     * If token is invalid, clears auth state.
     */
    async verifyToken(): Promise<AuthUser | null> {
        const token = this.getToken();
        if (!token) return null;

        try {
            const response = await fetch(`${this.baseUrl}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                this.clearAuth();
                return null;
            }

            const json = await response.json();
            const user = json.data as AuthUser;
            this.store.set('auth.user', user);
            return user;
        } catch {
            // Network error - don't clear auth, might be temporary
            return this.getUser();
        }
    }

    /**
     * Logout: revoke token on server, clear local state.
     */
    async logout(): Promise<void> {
        const token = this.getToken();
        if (token) {
            try {
                await fetch(`${this.baseUrl}/api/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    },
                });
            } catch {
                // Ignore network errors during logout
            }
        }

        this.clearAuth();
        this.notifyRenderer();
    }

    getToken(): string | null {
        return this.store.get('auth.token', null);
    }

    getUser(): AuthUser | null {
        return this.store.get('auth.user', null);
    }

    isAuthenticated(): boolean {
        return this.getToken() !== null;
    }

    getBaseUrl(): string {
        return this.baseUrl;
    }

    private clearAuth(): void {
        this.store.set('auth', { token: null, user: null });
    }

    private notifyRenderer(): void {
        const windows = BrowserWindow.getAllWindows();
        for (const win of windows) {
            win.webContents.send('auth:changed', {
                user: this.getUser(),
                isAuthenticated: this.isAuthenticated(),
            });
        }
    }
}
