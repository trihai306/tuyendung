import { router } from '@inertiajs/react';

const TeamService = {
    inviteMember(data: { email: string; name?: string; role: string }) {
        return router.post(route('employer.team.store'), data, {
            preserveState: true,
            preserveScroll: true,
        });
    },

    updateRole(memberId: number, role: string) {
        return router.patch(
            route('employer.team.update', memberId),
            { role },
            { preserveState: true, preserveScroll: true }
        );
    },

    removeMember(memberId: number) {
        return router.delete(route('employer.team.destroy', memberId), {
            preserveState: true,
            preserveScroll: true,
        });
    },
};

export default TeamService;
