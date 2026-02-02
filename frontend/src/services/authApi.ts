import apiClient, { type ApiResponse } from './apiClient';

// Types
export interface User {
    id: number;
    name: string;
    email: string;
    avatar_url?: string;
    created_at: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface LoginPayload {
    email: string;
    password: string;
    device_name?: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    company_name: string;
    company_industry?: string;
    company_phone?: string;
}

export interface ForgotPasswordPayload {
    email: string;
}

export interface ResetPasswordPayload {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export interface UpdateProfilePayload {
    name?: string;
    email?: string;
    avatar_url?: string;
}

export interface UpdatePasswordPayload {
    current_password: string;
    password: string;
    password_confirmation: string;
}

// Auth API service
const authApi = {
    // Login
    login: async (payload: LoginPayload): Promise<AuthResponse> => {
        const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', payload);
        return response.data.data;
    },

    // Register
    register: async (payload: RegisterPayload): Promise<AuthResponse> => {
        const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', payload);
        return response.data.data;
    },

    // Forgot password
    forgotPassword: async (payload: ForgotPasswordPayload): Promise<{ message: string }> => {
        const response = await apiClient.post<{ message: string }>('/auth/forgot-password', payload);
        return response.data;
    },

    // Reset password
    resetPassword: async (payload: ResetPasswordPayload): Promise<{ message: string }> => {
        const response = await apiClient.post<{ message: string }>('/auth/reset-password', payload);
        return response.data;
    },

    // Get current user
    me: async (): Promise<User> => {
        const response = await apiClient.get<ApiResponse<User>>('/auth/me');
        return response.data.data;
    },

    // Logout
    logout: async (): Promise<void> => {
        await apiClient.post('/auth/logout');
    },

    // Logout all devices
    logoutAll: async (): Promise<void> => {
        await apiClient.post('/auth/logout-all');
    },

    // Update profile
    updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
        const response = await apiClient.patch<ApiResponse<User>>('/auth/profile', payload);
        return response.data.data;
    },

    // Update password
    updatePassword: async (payload: UpdatePasswordPayload): Promise<{ message: string }> => {
        const response = await apiClient.patch<{ message: string }>('/auth/password', payload);
        return response.data;
    },
};

export default authApi;
