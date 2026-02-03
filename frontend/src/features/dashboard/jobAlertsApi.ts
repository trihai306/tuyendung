import { api } from '../../services/api';

export interface JobAlert {
    id: number;
    title: string;
    slug: string;
    status: string;
    target_count: number;
    hired_count: number;
    applicant_count: number;
    progress_percent: number;
    expires_at: string | null;
    is_expiring_soon: boolean;
    is_insufficient: boolean;
    needs_attention: boolean;
    days_until_expiry: number | null;
}

export interface JobAlertSummary {
    expiring_count: number;
    insufficient_count: number;
    total_alerts: number;
    critical_jobs: Array<{
        id: number;
        title: string;
        type: 'expiring' | 'insufficient';
        message: string;
    }>;
}

export const jobAlertsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getJobAlerts: builder.query<{ success: boolean; data: JobAlert[] }, void>({
            query: () => '/jobs/alerts',
            providesTags: ['Job'],
        }),
        getJobAlertsSummary: builder.query<{ success: boolean; data: JobAlertSummary }, void>({
            query: () => '/jobs/alerts/summary',
            providesTags: ['Job'],
        }),
    }),
});

export const {
    useGetJobAlertsQuery,
    useGetJobAlertsSummaryQuery,
} = jobAlertsApi;
