import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const VIECLY_API = 'http://localhost:3005/api';
const TOKEN_KEY = 'stealth_auth_token';
const USER_KEY = 'stealth_auth_user';

export interface User {
    id: number;
    name: string;
    email: string;
    avatar_url?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check auth on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const savedToken = localStorage.getItem(TOKEN_KEY);
            const savedUser = localStorage.getItem(USER_KEY);

            if (savedToken && savedUser) {
                // Verify token with backend
                const res = await fetch(`${VIECLY_API}/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${savedToken}`,
                        'Accept': 'application/json',
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser(data.data);
                    setToken(savedToken);
                } else {
                    // Token invalid, clear storage
                    localStorage.removeItem(TOKEN_KEY);
                    localStorage.removeItem(USER_KEY);
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const res = await fetch(`${VIECLY_API}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
                device_name: 'Stealth Automation',
            }),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Đăng nhập thất bại');
        }

        const data = await res.json();
        const { user: userData, token: authToken } = data.data;

        // Save to state and localStorage
        setUser(userData);
        setToken(authToken);
        localStorage.setItem(TOKEN_KEY, authToken);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
    };

    const logout = async () => {
        try {
            if (token) {
                await fetch(`${VIECLY_API}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    },
                });
            }
        } catch (error) {
            console.error('Logout API failed:', error);
        } finally {
            // Clear state and storage regardless
            setUser(null);
            setToken(null);
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!user && !!token,
                login,
                logout,
                checkAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
