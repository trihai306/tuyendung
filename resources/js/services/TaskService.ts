import { router } from '@inertiajs/react';
import type { FormDataConvertible } from '@inertiajs/core';
import axios from 'axios';

interface ApplicationItem {
    id: number;
    candidate_name: string;
    candidate_phone?: string;
    candidate_email?: string;
    source: string;
    status: string;
}

interface PaginatedApplications {
    data: ApplicationItem[];
    current_page: number;
    last_page: number;
    total: number;
}

const TaskService = {
    createTask(data: Record<string, FormDataConvertible>) {
        return router.post(route('employer.tasks.store'), data);
    },

    updateTask(taskId: number, data: Record<string, FormDataConvertible>) {
        return router.put(
            route('employer.tasks.update', taskId),
            data,
            { preserveState: true, preserveScroll: true }
        );
    },

    submitReport(taskId: number, completionReport: string) {
        return router.put(
            route('employer.tasks.update', taskId),
            { completion_report: completionReport },
            { preserveState: true, preserveScroll: true }
        );
    },

    addCandidates(taskId: number, data: { application_ids: number[]; status: string; notes?: string; hired_date?: string }) {
        return router.post(
            route('employer.tasks.candidates.store', taskId),
            data,
            { preserveScroll: true }
        );
    },

    removeCandidate(taskId: number, candidateId: number) {
        return router.delete(
            route('employer.tasks.candidates.destroy', [taskId, candidateId]),
            { preserveScroll: true }
        );
    },

    filterTasks(filters: Record<string, string>) {
        return router.get(route('employer.tasks.index'), filters, {
            preserveState: true,
            preserveScroll: true,
        });
    },

    async searchApplications(taskId: number, params: { search?: string; page?: number; per_page?: number }): Promise<PaginatedApplications> {
        const { data } = await axios.get<PaginatedApplications>(
            route('employer.tasks.applications.search', taskId),
            { params }
        );
        return data;
    },

    deleteTask(taskId: number) {
        return router.delete(
            route('employer.tasks.destroy', taskId),
            { preserveScroll: true }
        );
    },
};

export type { ApplicationItem, PaginatedApplications };
export default TaskService;
