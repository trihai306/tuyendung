import { router } from '@inertiajs/react';

const ApplicationService = {
    updateStatus(applicationId: number, status: string): void {
        router.patch(
            route('employer.applications.update', applicationId),
            { status },
            { preserveState: true, preserveScroll: true }
        );
    },

    updateNotes(applicationId: number, employerNotes: string): void {
        router.patch(
            route('employer.applications.update', applicationId),
            { employer_notes: employerNotes },
            { preserveState: true, preserveScroll: true }
        );
    },
};

export default ApplicationService;
