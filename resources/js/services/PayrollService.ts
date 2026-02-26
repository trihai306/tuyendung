import { router } from '@inertiajs/react';

const PayrollService = {
    create(data: Record<string, unknown>): void {
        router.post(route('employer.payroll.store'), data, {
            preserveScroll: true,
        });
    },

    update(id: number, data: Record<string, unknown>): void {
        router.put(route('employer.payroll.update', id), data, {
            preserveScroll: true,
        });
    },

    remove(id: number): void {
        router.delete(route('employer.payroll.destroy', id), {
            preserveScroll: true,
        });
    },

    markAsPaid(id: number): void {
        router.post(route('employer.payroll.mark-paid', id), {}, {
            preserveScroll: true,
        });
    },
};

export default PayrollService;
