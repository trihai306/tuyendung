import apiClient from './apiClient';

export interface SeatPricing {
    price_per_seat: number;
    formatted_price: string;
    duration_days: number;
    features: string[];
}

export interface CompanySeats {
    has_seats: boolean;
    total_seats: number;
    used_seats: number;
    available_seats: number;
    price_per_seat: number;
    expires_at: string | null;
    status: string;
    assigned_users: {
        id: number;
        name: string;
        email: string;
        assigned_at: string;
    }[];
    company_users: {
        id: number;
        name: string;
        email: string;
    }[];
}

export interface PurchaseResult {
    seats_purchased: number;
    price_per_seat: number;
    total_amount: number;
    formatted_total: string;
    status: string;
    expires_at: string;
    requires_payment: boolean;
    message: string;
}

export const seatApi = {
    getPricing: async (): Promise<SeatPricing> => {
        const response = await apiClient.get('/seats/pricing');
        return response.data.data;
    },

    getCompanySeats: async (): Promise<CompanySeats> => {
        const response = await apiClient.get('/seats');
        return response.data.data;
    },

    purchaseSeats: async (quantity: number): Promise<PurchaseResult> => {
        const response = await apiClient.post('/seats/purchase', { quantity });
        return response.data.data;
    },

    assignSeat: async (userId: number) => {
        const response = await apiClient.post('/seats/assign', { user_id: userId });
        return response.data;
    },

    unassignSeat: async (userId: number) => {
        const response = await apiClient.post('/seats/unassign', { user_id: userId });
        return response.data;
    },
};
