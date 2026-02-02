import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PipelineKanban } from './components/PipelineKanban';
import { useJobs } from './hooks/useRecruiting';

export function JobDetailPage() {
    const { jobId } = useParams<{ jobId: string }>();
    const navigate = useNavigate();
    const { jobs } = useJobs();
    const [activeTab, setActiveTab] = useState<'pipeline' | 'details' | 'analytics'>('pipeline');

    const job = jobs.find((j) => j.id === Number(jobId));

    if (!job) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900">Không tìm thấy tin tuyển dụng</h2>
                    <button
                        onClick={() => navigate('/recruiting')}
                        className="mt-4 text-blue-600 hover:underline"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-full mx-auto px-4 py-4">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <a href="/recruiting" className="hover:text-blue-600">Tuyển dụng</a>
                        <span>/</span>
                        <span className="text-gray-900">{job.title}</span>
                    </div>

                    {/* Title & Actions */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                {job.department && <span>{job.department}</span>}
                                {job.location && <span>• {job.location}</span>}
                                {job.job_type && (
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                        {job.job_type === 'full_time' ? 'Full-time' : job.job_type}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                Chỉnh sửa
                            </button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                Đăng tin
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-1 mt-4 -mb-px">
                        {[
                            { key: 'pipeline', label: 'Pipeline' },
                            { key: 'details', label: 'Chi tiết' },
                            { key: 'analytics', label: 'Thống kê' },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                                className={`px-4 py-2 border-b-2 font-medium transition-colors ${activeTab === tab.key
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="h-[calc(100vh-180px)]">
                {activeTab === 'pipeline' && <PipelineKanban jobId={Number(jobId)} />}

                {activeTab === 'details' && (
                    <div className="max-w-4xl mx-auto p-6">
                        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                            <section>
                                <h3 className="font-semibold text-gray-900 mb-2">Mô tả công việc</h3>
                                <p className="text-gray-600 whitespace-pre-line">{job.description || 'Chưa có mô tả'}</p>
                            </section>

                            <section>
                                <h3 className="font-semibold text-gray-900 mb-2">Yêu cầu</h3>
                                <p className="text-gray-600 whitespace-pre-line">{job.requirements || 'Chưa có yêu cầu'}</p>
                            </section>

                            <section>
                                <h3 className="font-semibold text-gray-900 mb-2">Quyền lợi</h3>
                                <p className="text-gray-600 whitespace-pre-line">{job.benefits || 'Chưa có quyền lợi'}</p>
                            </section>

                            {job.salary_range && (
                                <section>
                                    <h3 className="font-semibold text-gray-900 mb-2">Mức lương</h3>
                                    <p className="text-gray-600">{job.salary_range}</p>
                                </section>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="max-w-4xl mx-auto p-6">
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <div className="text-3xl font-bold text-blue-600">{job.applications_count || 0}</div>
                                <div className="text-gray-500 text-sm">Tổng ứng viên</div>
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <div className="text-3xl font-bold text-green-600">0</div>
                                <div className="text-gray-500 text-sm">Đã phỏng vấn</div>
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <div className="text-3xl font-bold text-purple-600">0</div>
                                <div className="text-gray-500 text-sm">Đã tuyển</div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm text-center text-gray-500">
                            <p>Thống kê chi tiết sẽ được cập nhật sau khi có dữ liệu.</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
