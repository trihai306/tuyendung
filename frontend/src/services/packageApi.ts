import apiClient from './apiClient';

export interface Package {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    formatted_price: string;
    duration_days: number;
    max_jobs: number;
    max_jobs_display: string | number;
    max_candidates: number;
    max_candidates_display: string | number;
    max_users: number;
    features: string[];
    is_popular: boolean;
}

export interface Subscription {
    has_subscription: boolean;
    current_plan: string;
    package: {
        name: string;
        slug?: string;
        price?: number;
        formatted_price?: string;
        max_jobs: number;
        max_candidates: number;
        max_users: number;
        features: string[];
    };
    starts_at?: string;
    expires_at?: string;
    days_remaining?: number;
    status?: string;
    amount_paid?: number;
    message?: string;
}

export const packageApi = {
    getPackages: async (): Promise<Package[]> => {
        const response = await apiClient.get('/packages');
        return response.data.data;
    },

    getPackage: async (slug: string): Promise<Package> => {
        const response = await apiClient.get(`/packages/${slug}`);
        return response.data.data;
    },
};

export const subscriptionApi = {
    getCurrentSubscription: async (): Promise<Subscription> => {
        const response = await apiClient.get('/subscription');
        return response.data.data;
    },

    subscribe: async (packageSlug: string) => {
        const response = await apiClient.post('/subscription', { package_slug: packageSlug });
        return response.data;
    },

    cancel: async () => {
        const response = await apiClient.post('/subscription/cancel');
        return response.data;
    },
};
