import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { setJobs, setCandidates, setPipeline, moveApplication } from '../recruitingSlice';
import {
    useGetJobsQuery,
    useGetCandidatesQuery,
    useGetJobPipelineQuery,
    useMoveApplicationStageMutation,
    useCreateJobMutation,
    useUpdateJobMutation,
    useDeleteJobMutation,
    usePublishJobMutation,
    useCloseJobMutation,
} from '../recruitingApi';

export function useJobs(filters?: Record<string, any>) {
    const dispatch = useAppDispatch();
    const { jobs, jobIds, isLoading } = useAppSelector((state) => state.recruiting);

    const { data, isFetching, refetch } = useGetJobsQuery(filters || {});
    const [createJobMutation] = useCreateJobMutation();
    const [updateJobMutation] = useUpdateJobMutation();
    const [deleteJobMutation] = useDeleteJobMutation();
    const [publishJobMutation] = usePublishJobMutation();
    const [closeJobMutation] = useCloseJobMutation();

    useEffect(() => {
        if (data?.data) {
            dispatch(setJobs(data.data));
        }
    }, [data, dispatch]);

    const createJob = useCallback(
        async (jobData: any) => {
            return await createJobMutation(jobData).unwrap();
        },
        [createJobMutation]
    );

    const updateJob = useCallback(
        async (id: number, jobData: any) => {
            return await updateJobMutation({ id, ...jobData }).unwrap();
        },
        [updateJobMutation]
    );

    const deleteJob = useCallback(
        async (id: number) => {
            return await deleteJobMutation(id).unwrap();
        },
        [deleteJobMutation]
    );

    const publishJob = useCallback(
        async (jobId: number) => {
            return await publishJobMutation(jobId).unwrap();
        },
        [publishJobMutation]
    );

    const closeJob = useCallback(
        async (jobId: number) => {
            return await closeJobMutation(jobId).unwrap();
        },
        [closeJobMutation]
    );

    return {
        jobs: jobIds.map((id) => jobs[id]),
        isLoading: isLoading || isFetching,
        createJob,
        updateJob,
        deleteJob,
        publishJob,
        closeJob,
        refetch,
    };
}

export function useCandidates(filters?: Record<string, any>) {
    const dispatch = useAppDispatch();
    const { candidates, candidateIds, isLoading } = useAppSelector((state) => state.recruiting);

    const { data, isFetching, refetch } = useGetCandidatesQuery(filters || {});

    useEffect(() => {
        if (data?.data) {
            dispatch(setCandidates(data.data));
        }
    }, [data, dispatch]);

    return {
        candidates: candidateIds.map((id) => candidates[id]),
        isLoading: isLoading || isFetching,
        refetch,
    };
}

export function usePipeline(jobId: number) {
    const dispatch = useAppDispatch();
    const { pipeline } = useAppSelector((state) => state.recruiting);

    const { data, isFetching, refetch } = useGetJobPipelineQuery(jobId);
    const [moveStageMutation] = useMoveApplicationStageMutation();

    useEffect(() => {
        if (data?.data) {
            dispatch(setPipeline({ jobId, data: data.data }));
        }
    }, [data, jobId, dispatch]);

    const moveApplicationToStage = useCallback(
        async (applicationId: number, fromStageId: number, toStageId: number) => {
            // Optimistic update
            dispatch(moveApplication({ applicationId, fromStageId, toStageId }));

            try {
                await moveStageMutation({ applicationId, stageId: toStageId }).unwrap();
            } catch {
                // Rollback on error
                dispatch(moveApplication({ applicationId, fromStageId: toStageId, toStageId: fromStageId }));
            }
        },
        [dispatch, moveStageMutation]
    );

    return {
        stages: pipeline.stages,
        applications: pipeline.applications,
        isLoading: isFetching,
        moveApplicationToStage,
        refetch,
    };
}
