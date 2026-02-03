import { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAssignJobMutation } from '../recruitingApi';

interface AssignJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    job: { id: number; title: string; target_count?: number };
    members: Array<{ id: number; name: string; email: string }>;
}

export function AssignJobModal({ isOpen, onClose, job, members }: AssignJobModalProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const [assignJob, { isLoading }] = useAssignJobMutation();

    const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
    const [targetAssigned, setTargetAssigned] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!selectedUserId) {
            setError('Vui lòng chọn nhân viên');
            return;
        }

        try {
            await assignJob({
                jobId: job.id,
                user_id: selectedUserId,
                target_assigned: targetAssigned ? parseInt(targetAssigned) : undefined,
            }).unwrap();

            onClose();
            setSelectedUserId('');
            setTargetAssigned('');
        } catch (err: any) {
            setError(err.data?.error || 'Có lỗi xảy ra');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className={`w-full max-w-md rounded-xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-xl`}>
                <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Giao việc: {job.title}
                </h3>

                {job.target_count && (
                    <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Chỉ tiêu tổng: {job.target_count} người
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Chọn nhân viên *
                        </label>
                        <select
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : '')}
                            className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                        >
                            <option value="">-- Chọn nhân viên --</option>
                            {members.map(member => (
                                <option key={member.id} value={member.id}>
                                    {member.name} ({member.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Số lượng được giao (tuỳ chọn)
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={targetAssigned}
                            onChange={(e) => setTargetAssigned(e.target.value)}
                            placeholder="VD: 20"
                            className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`flex-1 px-4 py-2 rounded-lg ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                            Huỷ
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
                        >
                            {isLoading ? 'Đang giao...' : 'Giao việc'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
