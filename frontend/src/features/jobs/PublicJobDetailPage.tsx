import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { publicJobsApi } from './services/publicJobsApi';
import type { PublicJob } from './services/publicJobsApi';
import { useToast } from '../../components/ui';
import {
    updateSEO,
    addStructuredData,
    removeStructuredData,
    generateJobPostingSchema,
    generateBreadcrumbSchema,
    SITE_CONFIG
} from '../../utils/seo';

export function PublicJobDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [job, setJob] = useState<PublicJob | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (slug) {
            fetchJob(slug);
        }
    }, [slug]);

    const fetchJob = async (slug: string) => {
        try {
            setLoading(true);
            setError(false);
            const data = await publicJobsApi.getJobBySlug(slug);
            setJob(data);
        } catch (err) {
            console.error('Failed to fetch job:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    // Update SEO when job data is loaded
    useEffect(() => {
        if (job) {
            // Update meta tags
            updateSEO({
                title: job.title,
                description: job.description?.replace(/<[^>]*>/g, '').slice(0, 160) || `Tuyển dụng ${job.title} tại ${job.location || 'Việt Nam'}`,
                keywords: `${job.title}, việc làm, tuyển dụng, ${job.location || ''}, ${job.department || ''}`,
                url: `${SITE_CONFIG.url}/jobs/${slug}`,
                type: 'job',
            });

            // Add JobPosting schema
            const jobSchema = generateJobPostingSchema({
                title: job.title,
                description: job.description || '',
                company: job.company_name || 'Công ty tuyển dụng',
                location: job.location || 'Việt Nam',
                salary: job.salary_min ? { min: job.salary_min, max: job.salary_max ?? undefined, currency: job.salary_currency || 'VND' } : undefined,
                jobType: job.job_type,
                datePosted: undefined, // API doesn't provide created_at
                slug: slug || '',
            });
            addStructuredData(jobSchema, 'job-posting-schema');

            // Add breadcrumb schema
            const breadcrumbSchema = generateBreadcrumbSchema([
                { name: 'Trang chủ', url: SITE_CONFIG.url },
                { name: 'Việc làm', url: `${SITE_CONFIG.url}/jobs` },
                { name: job.title, url: `${SITE_CONFIG.url}/jobs/${slug}` },
            ]);
            addStructuredData(breadcrumbSchema, 'breadcrumb-schema');
        }

        return () => {
            removeStructuredData('job-posting-schema');
            removeStructuredData('breadcrumb-schema');
        };
    }, [job, slug]);

    const formatSalary = () => {
        if (!job) return '';
        if (!job.salary_min && !job.salary_max) return 'Thỏa thuận';

        const format = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

        if (job.salary_min && job.salary_max) {
            return `${format(job.salary_min)} - ${format(job.salary_max)} ${job.salary_currency}`;
        }

        return job.salary_min
            ? `Từ ${format(job.salary_min)} ${job.salary_currency}`
            : `Đến ${format(job.salary_max!)} ${job.salary_currency}`;
    };

    const getJobTypeLabel = () => {
        if (!job) return '';
        const types = {
            full_time: 'Toàn thời gian',
            part_time: 'Bán thời gian',
            contract: 'Hợp đồng',
            intern: 'Thực tập',
        };
        return types[job.job_type] || types.full_time;
    };

    const handleApply = () => {
        navigate('/register');
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: job?.title,
                text: `Xem việc làm: ${job?.title}`,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Đã copy link vào clipboard!');
        }
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-b from-slate-50 to-white py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-slate-200 rounded w-3/4 mb-4"></div>
                        <div className="h-6 bg-slate-200 rounded w-1/2 mb-8"></div>
                        <div className="bg-white rounded-xl border border-slate-200 p-8">
                            <div className="h-4 bg-slate-200 rounded w-full mb-3"></div>
                            <div className="h-4 bg-slate-200 rounded w-5/6 mb-3"></div>
                            <div className="h-4 bg-slate-200 rounded w-4/6"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="bg-gradient-to-b from-slate-50 to-white py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Không tìm thấy việc làm</h2>
                        <p className="text-slate-600 mb-6">Việc làm này có thể đã bị xóa hoặc không còn tồn tại.</p>
                        <Link
                            to="/jobs"
                            className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
                        >
                            Quay lại danh sách việc làm
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-b from-slate-50 to-white py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Link
                    to="/jobs"
                    className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Quay lại danh sách
                </Link>

                {/* Job Header */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                        {job.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        {job.department && (
                            <div className="flex items-center gap-2 text-slate-600">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span className="font-medium">{job.department}</span>
                            </div>
                        )}

                        {job.location && (
                            <div className="flex items-center gap-2 text-slate-600">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>{job.location}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                        <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                            {getJobTypeLabel()}
                        </span>
                        <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            💰 {formatSalary()}
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleApply}
                            className="flex-1 sm:flex-none px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40"
                        >
                            Ứng tuyển ngay
                        </button>
                        <button
                            onClick={handleShare}
                            className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            Chia sẻ
                        </button>
                    </div>
                </div>

                {/* Job Description */}
                {job.description && (
                    <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 mb-6">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Mô tả công việc</h2>
                        <div
                            className="prose prose-slate max-w-none"
                            dangerouslySetInnerHTML={{ __html: job.description }}
                        />
                    </div>
                )}

                {/* Requirements */}
                {job.requirements && (
                    <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 mb-6">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Yêu cầu công việc</h2>
                        <div
                            className="prose prose-slate max-w-none"
                            dangerouslySetInnerHTML={{ __html: job.requirements }}
                        />
                    </div>
                )}

                {/* Benefits */}
                {job.benefits && (
                    <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 mb-6">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Quyền lợi</h2>
                        <div
                            className="prose prose-slate max-w-none"
                            dangerouslySetInnerHTML={{ __html: job.benefits }}
                        />
                    </div>
                )}

                {/* Apply CTA */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-8 text-center">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                        Bạn quan tâm đến vị trí này?
                    </h3>
                    <p className="text-slate-600 mb-6">
                        Đăng ký tài khoản để ứng tuyển và quản lý hồ sơ của bạn
                    </p>
                    <button
                        onClick={handleApply}
                        className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40"
                    >
                        Ứng tuyển ngay
                    </button>
                </div>
            </div>
        </div>
    );
}
