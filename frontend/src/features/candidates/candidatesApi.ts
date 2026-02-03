import { api } from '../../services/api';

// Types
export interface Candidate {
    id: number;
    company_id: number;
    created_by_user_id: number;
    assigned_user_id: number | null;
    full_name: string;
    email: string | null;
    phone: string | null;
    avatar_url: string | null;
    source: 'chat' | 'manual' | 'import' | 'referral';
    resume_url: string | null;
    profile_data: Record<string, unknown> | null;
    tags: string[];
    notes: string | null;
    rating: number | null;
    status: 'active' | 'archived' | 'blacklisted';
    created_at: string;
    updated_at: string;
    // Relations
    created_by?: { id: number; name: string };
    assigned_user?: { id: number; name: string };
    applications?: CandidateApplication[];
}

export interface CandidateApplication {
    id: number;
    recruitment_job_id: number;
    pipeline_stage_id: number | null;
    status: string;
    applied_at: string;
    job?: { id: number; title: string; status: string };
    stage?: { id: number; name: string; color: string };
}

export interface CandidateStats {
    total: number;
    active: number;
    this_month: number;
    blacklisted: number;
}

export interface CandidateFilters {
    search?: string;
    status?: 'active' | 'archived' | 'blacklisted';
    source?: 'chat' | 'manual' | 'import' | 'referral';
    per_page?: number;
    page?: number;
}

export interface CandidatesResponse {
    success: boolean;
    data: Candidate[];
    stats: CandidateStats;
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    role: 'owner' | 'admin' | 'member';
}

export interface CreateCandidateData {
    full_name: string;
    email?: string;
    phone?: string;
    source?: 'chat' | 'manual' | 'import' | 'referral';
    resume_url?: string;
    profile_data?: Record<string, unknown>;
    tags?: string[];
    notes?: string;
    assigned_user_id?: number;
}

export interface UpdateCandidateData {
    full_name?: string;
    email?: string;
    phone?: string;
    resume_url?: string;
    profile_data?: Record<string, unknown>;
    tags?: string[];
    notes?: string;
    rating?: number;
    status?: 'active' | 'archived' | 'blacklisted';
    assigned_user_id?: number;
}

// API
export const candidatesApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Get candidates with filters and stats
        getCandidates: builder.query<CandidatesResponse, CandidateFilters | void>({
            query: (filters = {}) => ({
                url: '/candidates',
                params: filters,
            }),
            providesTags: ['Candidate'],
        }),

        // Get single candidate with details
        getCandidate: builder.query<{ success: boolean; data: Candidate }, number>({
            query: (id) => `/candidates/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Candidate', id }],
        }),

        // Create candidate
        createCandidate: builder.mutation<{ success: boolean; data: Candidate; message: string }, CreateCandidateData>({
            query: (data) => ({
                url: '/candidates',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Candidate'],
        }),

        // Update candidate
        updateCandidate: builder.mutation<{ success: boolean; data: Candidate; message: string }, { id: number; data: UpdateCandidateData }>({
            query: ({ id, data }) => ({
                url: `/candidates/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Candidate', id }, 'Candidate'],
        }),

        // Delete candidate
        deleteCandidate: builder.mutation<{ success: boolean; message: string }, number>({
            query: (id) => ({
                url: `/candidates/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Candidate'],
        }),

        // Apply candidate to job
        applyCandidateToJob: builder.mutation<{ success: boolean; data: CandidateApplication; message: string }, { candidateId: number; jobId: number; screeningAnswers?: Record<string, unknown> }>({
            query: ({ candidateId, jobId, screeningAnswers }) => ({
                url: `/candidates/${candidateId}/apply`,
                method: 'POST',
                body: { job_id: jobId, screening_answers: screeningAnswers },
            }),
            invalidatesTags: (_result, _error, { candidateId }) => [{ type: 'Candidate', id: candidateId }, 'Job'],
        }),

        // Assign candidate to user (managers only)
        assignCandidate: builder.mutation<{ success: boolean; data: Candidate; message: string }, { candidateId: number; userId: number }>({
            query: ({ candidateId, userId }) => ({
                url: `/candidates/${candidateId}/assign`,
                method: 'POST',
                body: { user_id: userId },
            }),
            invalidatesTags: (_result, _error, { candidateId }) => [{ type: 'Candidate', id: candidateId }, 'Candidate'],
        }),

        // Bulk assign candidates (managers only)
        bulkAssignCandidates: builder.mutation<{ success: boolean; data: { updated_count: number }; message: string }, { candidateIds: number[]; userId: number }>({
            query: ({ candidateIds, userId }) => ({
                url: '/candidates/bulk-assign',
                method: 'POST',
                body: { candidate_ids: candidateIds, user_id: userId },
            }),
            invalidatesTags: ['Candidate'],
        }),
    }),
});

// Hooks
export const {
    useGetCandidatesQuery,
    useGetCandidateQuery,
    useCreateCandidateMutation,
    useUpdateCandidateMutation,
    useDeleteCandidateMutation,
    useApplyCandidateToJobMutation,
    useAssignCandidateMutation,
    useBulkAssignCandidatesMutation,
} = candidatesApi;
