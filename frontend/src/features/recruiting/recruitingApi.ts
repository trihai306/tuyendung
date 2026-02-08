import { api } from '../../services/api';

export const recruitingApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getJobs: builder.query({
            query: (params) => ({
                url: '/jobs',
                params,
            }),
            providesTags: ['Job'],
        }),
        getJob: builder.query({
            query: (id: number) => `/jobs/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Job', id }],
        }),
        createJob: builder.mutation({
            query: (body) => ({
                url: '/jobs',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Job'],
        }),
        updateJob: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/jobs/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Job', id }],
        }),
        deleteJob: builder.mutation({
            query: (id: number) => ({
                url: `/jobs/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Job'],
        }),
        publishJob: builder.mutation({
            query: (id: number) => ({
                url: `/jobs/${id}/publish`,
                method: 'POST',
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Job', id }],
        }),
        closeJob: builder.mutation({
            query: (id: number) => ({
                url: `/jobs/${id}/close`,
                method: 'POST',
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Job', id }],
        }),
        getJobPipeline: builder.query({
            query: (jobId: number) => `/jobs/${jobId}/pipeline`,
            providesTags: (_result, _error, jobId) => [{ type: 'Application', id: jobId }],
        }),
        moveApplicationStage: builder.mutation({
            query: ({ applicationId, stageId }) => ({
                url: `/applications/${applicationId}/move-stage`,
                method: 'PATCH',
                body: { stage_id: stageId },
            }),
            invalidatesTags: ['Application'],
        }),
        getCandidates: builder.query({
            query: (params) => ({
                url: '/candidates',
                params,
            }),
            providesTags: ['Candidate'],
        }),
        getCandidate: builder.query({
            query: (id: number) => `/candidates/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Candidate', id }],
        }),
        createCandidate: builder.mutation({
            query: (body) => ({
                url: '/candidates',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Candidate'],
        }),
        updateCandidate: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/candidates/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Candidate', id }],
        }),
        applyToJob: builder.mutation({
            query: ({ candidateId, ...body }) => ({
                url: `/candidates/${candidateId}/apply`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Application', 'Candidate'],
        }),

        // Job Assignments
        getJobAssignments: builder.query({
            query: (jobId: number) => `/jobs/${jobId}/assignments`,
            providesTags: (_result, _error, jobId) => [{ type: 'Assignment', id: jobId }],
        }),
        assignJob: builder.mutation({
            query: ({ jobId, ...body }) => ({
                url: `/jobs/${jobId}/assignments`,
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, { jobId }) => [{ type: 'Assignment', id: jobId }, 'Job'],
        }),
        updateAssignmentProgress: builder.mutation({
            query: ({ assignmentId, ...body }) => ({
                url: `/assignments/${assignmentId}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Assignment', 'Job'],
        }),
        getMyAssignments: builder.query({
            query: () => '/my-assignments',
            providesTags: ['Assignment'],
        }),
        removeAssignment: builder.mutation({
            query: (assignmentId: number) => ({
                url: `/assignments/${assignmentId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Assignment', 'Job'],
        }),

        // Trashed & Expired Jobs
        getTrashedJobs: builder.query({
            query: () => '/jobs/trashed',
            providesTags: ['Job'],
        }),
        getExpiredJobs: builder.query({
            query: () => '/jobs/expired',
            providesTags: ['Job'],
        }),
        restoreJob: builder.mutation({
            query: (id: number) => ({
                url: `/jobs/${id}/restore`,
                method: 'POST',
            }),
            invalidatesTags: ['Job'],
        }),
        forceDeleteJob: builder.mutation({
            query: (id: number) => ({
                url: `/jobs/${id}/force`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Job'],
        }),
        renewJob: builder.mutation({
            query: (id: number) => ({
                url: `/jobs/${id}/renew`,
                method: 'POST',
            }),
            invalidatesTags: ['Job'],
        }),
    }),
});

export const {
    useGetJobsQuery,
    useGetJobQuery,
    useCreateJobMutation,
    useUpdateJobMutation,
    useDeleteJobMutation,
    usePublishJobMutation,
    useCloseJobMutation,
    useGetJobPipelineQuery,
    useMoveApplicationStageMutation,
    useGetCandidatesQuery,
    useGetCandidateQuery,
    useCreateCandidateMutation,
    useUpdateCandidateMutation,
    useApplyToJobMutation,
    // Job Assignments
    useGetJobAssignmentsQuery,
    useAssignJobMutation,
    useUpdateAssignmentProgressMutation,
    useGetMyAssignmentsQuery,
    useRemoveAssignmentMutation,
    // Trashed & Expired
    useGetTrashedJobsQuery,
    useGetExpiredJobsQuery,
    useRestoreJobMutation,
    useForceDeleteJobMutation,
    useRenewJobMutation,
} = recruitingApi;

