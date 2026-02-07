import apiClient from '../../services/apiClient';

// ===========================================
// TYPES
// ===========================================

export interface FacebookGroup {
    id: number;
    platform_account_id: number;
    group_id: string;
    name: string;
    group_url: string;
    member_count?: number;
    description?: string;
    privacy?: string;
    is_admin: boolean;
    last_synced_at?: string;
    last_post_at?: string;
    created_at: string;
    updated_at: string;
    platform_account?: {
        id: number;
        name: string;
    };
}

// ===========================================
// API FUNCTIONS
// ===========================================

export const facebookGroupsApi = {
    // Get list of facebook groups
    async getGroups(platformAccountId?: number) {
        const response = await apiClient.get('/facebook-groups', {
            params: { platform_account_id: platformAccountId }
        });
        return response.data;
    },

    // Sync groups from a facebook account
    async syncGroups(platformAccountId: number) {
        const response = await apiClient.post('/facebook-groups/sync', {
            platform_account_id: platformAccountId
        });
        return response.data;
    },

    // Get single group details
    async getGroup(id: number) {
        const response = await apiClient.get(`/facebook-groups/${id}`);
        return response.data;
    },

    // Update group settings
    async updateGroup(id: number, data: Partial<{ description: string }>) {
        const response = await apiClient.put(`/facebook-groups/${id}`, data);
        return response.data;
    },

    // Post to group
    async postToGroup(id: number, content: string, mediaUrls?: string[]) {
        const response = await apiClient.post(`/facebook-groups/${id}/post`, {
            content,
            media_urls: mediaUrls
        });
        return response.data;
    },

    // Get group members
    async getMembers(id: number) {
        const response = await apiClient.get(`/facebook-groups/${id}/members`);
        return response.data;
    },

    // Get pending members
    async getPendingMembers(id: number) {
        const response = await apiClient.get(`/facebook-groups/${id}/pending-members`);
        return response.data;
    },

    // Approve member
    async approveMember(groupId: number, memberId: string) {
        const response = await apiClient.post(`/facebook-groups/${groupId}/approve-member`, {
            member_id: memberId
        });
        return response.data;
    },
};

export default facebookGroupsApi;
