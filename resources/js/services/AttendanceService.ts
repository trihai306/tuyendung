import { router } from '@inertiajs/react';

interface AttendanceBulkRecord {
    task_candidate_id: number;
    status: 'present' | 'absent' | 'half_day' | 'late';
    shifts_worked?: number;
    overtime_hours?: number;
    notes?: string;
}

const AttendanceService = {
    bulkStore(taskId: number, workDate: string, records: AttendanceBulkRecord[]) {
        return router.post(route('employer.attendance.bulk-store', taskId), {
            work_date: workDate,
            records,
        } as unknown as Record<string, unknown>, {
            preserveScroll: true,
        });
    },

    destroy(attendanceId: number) {
        return router.delete(route('employer.attendance.destroy', attendanceId), {
            preserveScroll: true,
        });
    },
};

export default AttendanceService;
