import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Job {
    id: number;
    title: string;
    slug: string;
    department: string | null;
    location: string | null;
    job_type: 'full_time' | 'part_time' | 'contract' | 'intern';
    status: 'draft' | 'open' | 'paused' | 'closed';
    description: string | null;
    requirements: string | null;
    benefits: string | null;
    salary_range: string | null;
    applications_count?: number;
    target_count?: number;
    hired_count?: number;
    expires_at?: string;
    cv_required?: boolean;
    created_at: string;
}

interface Candidate {
    id: number;
    full_name: string;
    email: string | null;
    phone: string | null;
    avatar_url: string | null;
    source: string;
    status: 'active' | 'blacklisted' | 'archived';
    rating: number | null;
    created_at: string;
}

interface PipelineStage {
    id: number;
    name: string;
    slug: string;
    color: string;
    sort_order: number;
}

interface Application {
    id: number;
    job_id: number;
    candidate_id: number;
    stage_id: number;
    candidate?: Candidate;
    stage?: PipelineStage;
}

interface RecruitingState {
    jobs: Record<number, Job>;
    jobIds: number[];
    candidates: Record<number, Candidate>;
    candidateIds: number[];
    pipeline: {
        jobId: number | null;
        stages: PipelineStage[];
        applications: Record<number, Application[]>;
    };
    isLoading: boolean;
}

const initialState: RecruitingState = {
    jobs: {},
    jobIds: [],
    candidates: {},
    candidateIds: [],
    pipeline: {
        jobId: null,
        stages: [],
        applications: {},
    },
    isLoading: false,
};

const recruitingSlice = createSlice({
    name: 'recruiting',
    initialState,
    reducers: {
        setJobs: (state, action: PayloadAction<Job[]>) => {
            state.jobIds = action.payload.map((j) => j.id);
            action.payload.forEach((job) => {
                state.jobs[job.id] = job;
            });
        },
        addJob: (state, action: PayloadAction<Job>) => {
            state.jobs[action.payload.id] = action.payload;
            if (!state.jobIds.includes(action.payload.id)) {
                state.jobIds.unshift(action.payload.id);
            }
        },
        updateJob: (state, action: PayloadAction<Partial<Job> & { id: number }>) => {
            const { id, ...updates } = action.payload;
            if (state.jobs[id]) {
                state.jobs[id] = { ...state.jobs[id], ...updates };
            }
        },
        setCandidates: (state, action: PayloadAction<Candidate[]>) => {
            state.candidateIds = action.payload.map((c) => c.id);
            action.payload.forEach((candidate) => {
                state.candidates[candidate.id] = candidate;
            });
        },
        addCandidate: (state, action: PayloadAction<Candidate>) => {
            state.candidates[action.payload.id] = action.payload;
            if (!state.candidateIds.includes(action.payload.id)) {
                state.candidateIds.unshift(action.payload.id);
            }
        },
        setPipeline: (state, action: PayloadAction<{ jobId: number; data: { stage: PipelineStage; applications: Application[] }[] }>) => {
            state.pipeline.jobId = action.payload.jobId;
            state.pipeline.stages = action.payload.data.map((s) => s.stage);
            state.pipeline.applications = {};
            action.payload.data.forEach((item) => {
                state.pipeline.applications[item.stage.id] = item.applications;
            });
        },
        moveApplication: (state, action: PayloadAction<{ applicationId: number; fromStageId: number; toStageId: number }>) => {
            const { applicationId, fromStageId, toStageId } = action.payload;
            const fromApps = state.pipeline.applications[fromStageId] || [];
            const appIndex = fromApps.findIndex((a) => a.id === applicationId);

            if (appIndex !== -1) {
                const [app] = fromApps.splice(appIndex, 1);
                app.stage_id = toStageId;

                if (!state.pipeline.applications[toStageId]) {
                    state.pipeline.applications[toStageId] = [];
                }
                state.pipeline.applications[toStageId].push(app);
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
    },
});

export const {
    setJobs,
    addJob,
    updateJob,
    setCandidates,
    addCandidate,
    setPipeline,
    moveApplication,
    setLoading,
} = recruitingSlice.actions;

export default recruitingSlice.reducer;
