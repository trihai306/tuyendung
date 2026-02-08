import { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAssignJobMutation } from '../recruitingApi';
import { Input, Select, Button } from '../../../components/ui';

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
                        <Select
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : '')}
                            options={[
                                { value: '', label: '-- Chọn nhân viên --' },
                                ...members.map(member => ({ value: String(member.id), label: `${member.name} (${member.email})` }))
                            ]}
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Số lượng được giao (tuỳ chọn)
                        </label>
                        <Input
                            type="number"
                            min="1"
                            value={targetAssigned}
                            onChange={(e) => setTargetAssigned(e.target.value)}
                            placeholder="VD: 20"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            fullWidth
                        >
                            Huỷ
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            loading={isLoading}
                            fullWidth
                        >
                            {isLoading ? 'Đang giao...' : 'Giao việc'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
