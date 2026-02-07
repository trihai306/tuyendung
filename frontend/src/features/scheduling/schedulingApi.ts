import apiClient from '../../services/apiClient';

// ===========================================
// TYPES
// ===========================================

export interface ZaloGroup {
    id: number;
    group_id: string;
    name: string;
    member_count: number;
    avatar?: string;
}

export interface ScheduledGroupPost {
    id: number;
    company_id: number;
    job_id?: number;
    zalo_account_id: number;
    target_groups: string[];
    content: string;
    media_urls?: string[];
    template_id?: number;
    scheduled_at: string;
    repeat_type: 'once' | 'daily' | 'weekly' | 'custom';
    repeat_config?: {
        interval?: number;
        unit?: 'hours' | 'days' | 'weeks' | 'months';
        max_occurrences?: number;
    };
    status: 'pending' | 'approved' | 'processing' | 'completed' | 'failed' | 'cancelled';
    status_label?: string;
    success_count: number;
    failed_count: number;
    results?: Record<string, any>;
    created_by: number;
    approved_by?: number;
    approved_at?: string;
    executed_at?: string;
    created_at: string;
    updated_at: string;
    // Relations
    zalo_account?: {
        id: number;
        name: string;
        phone?: string;
    };
    job?: {
        id: number;
        title: string;
    };
    created_by_user?: {
        id: number;
        name: string;
    };
    target_groups_preview?: ZaloGroup[];
}

export interface CreateScheduledPostData {
    zalo_account_id: number;
    target_groups: string[];
    content: string;
    scheduled_at: string;
    job_id?: number;
    template_id?: number;
    media_urls?: string[];
    repeat_type?: 'once' | 'daily' | 'weekly' | 'custom';
    repeat_config?: {
        interval?: number;
        unit?: 'hours' | 'days' | 'weeks' | 'months';
        max_occurrences?: number;
    };
}

// ===========================================
// API FUNCTIONS
// ===========================================

export const schedulingApi = {
    // Get list of scheduled posts
    async getScheduledPosts(params?: {
        status?: string;
        from?: string;
        to?: string;
        per_page?: number;
    }) {
        const response = await apiClient.get('/scheduled-group-posts', { params });
        return response.data;
    },

    // Get single scheduled post
    async getScheduledPost(id: number) {
        const response = await apiClient.get(`/scheduled-group-posts/${id}`);
        return response.data;
    },

    // Create new scheduled post
    async createScheduledPost(data: CreateScheduledPostData) {
        const response = await apiClient.post('/scheduled-group-posts', data);
        return response.data;
    },

    // Update scheduled post
    async updateScheduledPost(id: number, data: Partial<CreateScheduledPostData>) {
        const response = await apiClient.put(`/scheduled-group-posts/${id}`, data);
        return response.data;
    },

    // Delete/cancel scheduled post
    async cancelScheduledPost(id: number) {
        const response = await apiClient.delete(`/scheduled-group-posts/${id}`);
        return response.data;
    },

    // Approve scheduled post
    async approveScheduledPost(id: number) {
        const response = await apiClient.post(`/scheduled-group-posts/${id}/approve`);
        return response.data;
    },

    // Execute post immediately
    async executeNow(id: number) {
        const response = await apiClient.post(`/scheduled-group-posts/${id}/execute-now`);
        return response.data;
    },

    // Get available Zalo groups for scheduling
    async getAvailableGroups(zaloAccountId: number): Promise<{ success: boolean; data: ZaloGroup[] }> {
        const response = await apiClient.get('/scheduled-group-posts/available-groups', {
            params: { zalo_account_id: zaloAccountId }
        });
        return response.data;
    },
};

export default schedulingApi;
