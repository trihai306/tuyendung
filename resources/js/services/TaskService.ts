import { router } from '@inertiajs/react';
import type { FormDataConvertible } from '@inertiajs/core';

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

    addCandidate(taskId: number, data: Record<string, FormDataConvertible>) {
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
};

export default TaskService;
