import apiClient from '../../../services/apiClient';

export interface PublicJob {
    id: number;
    title: string;
    slug: string;
    department: string | null;
    location: string | null;
    job_type: 'full_time' | 'part_time' | 'contract' | 'intern';
    salary_min: number | null;
    salary_max: number | null;
    salary_currency: string;
    description: string | null;
    requirements: string | null;
    benefits: string | null;
    published_at: string;
    expires_at?: string | null;
    company_name?: string | null;
    company_logo?: string | null;
    experience_required?: string | null;
    user: {
        id: number;
        name: string;
    };
}

export interface PublicJobsParams {
    search?: string;
    job_type?: string;
    location?: string;
    category?: string;
    experience?: string;
    level?: string;
    min_salary?: number;
    max_salary?: number;
    page?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export const publicJobsApi = {
    /**
     * Get paginated list of public jobs
     */
    async getJobs(params?: PublicJobsParams): Promise<PaginatedResponse<PublicJob>> {
        const response = await apiClient.get('/public/jobs', { params });
        return response.data;
    },

    /**
     * Get single job by slug
     */
    async getJobBySlug(slug: string): Promise<PublicJob> {
        const response = await apiClient.get(`/public/jobs/${slug}`);
        return response.data.data;
    },
};
