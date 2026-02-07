import { useState, useEffect, useCallback } from 'react';
import { schedulingApi } from './schedulingApi';
import type { ScheduledGroupPost, CreateScheduledPostData, ZaloGroup } from './schedulingApi';

export function useScheduling() {
    const [posts, setPosts] = useState<ScheduledGroupPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch all scheduled posts
    const fetchPosts = useCallback(async (params?: { status?: string; from?: string; to?: string }) => {
        setLoading(true);
        setError(null);
        try {
            const response = await schedulingApi.getScheduledPosts(params);
            if (response.success) {
                setPosts(response.data);
            } else {
                setError('Failed to fetch scheduled posts');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch scheduled posts');
        } finally {
            setLoading(false);
        }
    }, []);

    // Create new post
    const createPost = useCallback(async (data: CreateScheduledPostData) => {
        try {
            const response = await schedulingApi.createScheduledPost(data);
            if (response.success) {
                setPosts(prev => [response.data, ...prev]);
                return { success: true, data: response.data };
            }
            return { success: false, error: response.error?.message || 'Failed to create' };
        } catch (err: any) {
            return { success: false, error: err.message || 'Failed to create post' };
        }
    }, []);

    // Approve post
    const approvePost = useCallback(async (id: number) => {
        try {
            const response = await schedulingApi.approveScheduledPost(id);
            if (response.success) {
                setPosts(prev => prev.map(p => p.id === id ? response.data : p));
                return { success: true };
            }
            return { success: false, error: response.error?.message };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    }, []);

    // Execute now
    const executeNow = useCallback(async (id: number) => {
        try {
            const response = await schedulingApi.executeNow(id);
            if (response.success) {
                setPosts(prev => prev.map(p => p.id === id ? response.data : p));
                return { success: true, results: response.results };
            }
            return { success: false, error: response.error?.message };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    }, []);

    // Cancel post
    const cancelPost = useCallback(async (id: number) => {
        try {
            const response = await schedulingApi.cancelScheduledPost(id);
            if (response.success) {
                setPosts(prev => prev.filter(p => p.id !== id));
                return { success: true };
            }
            return { success: false, error: response.error?.message };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    return {
        posts,
        loading,
        error,
        fetchPosts,
        createPost,
        approvePost,
        executeNow,
        cancelPost,
    };
}

export function useZaloGroups(zaloAccountId: number | null) {
    const [groups, setGroups] = useState<ZaloGroup[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!zaloAccountId) {
            setGroups([]);
            return;
        }

        setLoading(true);
        schedulingApi.getAvailableGroups(zaloAccountId)
            .then(response => {
                if (response.success) {
                    setGroups(response.data);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [zaloAccountId]);

    return { groups, loading };
}
