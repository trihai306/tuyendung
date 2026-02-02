import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { store } from '../app/store';
import { logout } from '../features/auth/authSlice';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = store.getState().auth.token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
        // Handle 401 Unauthorized - logout user
        if (error.response?.status === 401) {
            store.dispatch(logout());
            window.location.href = '/login';
        }

        // Extract error message
        const message =
            error.response?.data?.message ||
            error.response?.data?.errors?.[Object.keys(error.response?.data?.errors || {})[0]]?.[0] ||
            error.message ||
            'Có lỗi xảy ra';

        return Promise.reject(new Error(message));
    }
);

export default apiClient;

// Type for API response
export interface ApiResponse<T> {
    data: T;
    message?: string;
}

// Type for paginated response
export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}
