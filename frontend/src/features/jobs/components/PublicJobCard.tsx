import { Link } from 'react-router-dom';
import type { PublicJob } from '../services/publicJobsApi';

interface PublicJobCardProps {
    job: PublicJob;
}

export function PublicJobCard({ job }: PublicJobCardProps) {
    const formatSalary = () => {
        if (!job.salary_min && !job.salary_max) return 'Thỏa thuận';

        const format = (val: number) => {
            if (val >= 1000000) {
                return (val / 1000000).toFixed(0) + ' triệu';
            }
            return new Intl.NumberFormat('vi-VN').format(val);
        };

        if (job.salary_min && job.salary_max) {
            return `${format(job.salary_min)} - ${format(job.salary_max)}`;
        }

        return job.salary_min
            ? `Từ ${format(job.salary_min)}`
            : `Đến ${format(job.salary_max!)}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return 'Hôm nay';
        if (diffInDays === 1) return '1 ngày trước';
        if (diffInDays < 7) return `${diffInDays} ngày trước`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`;

        return date.toLocaleDateString('vi-VN');
    };

    const getJobTypeBadge = () => {
        const types: Record<string, { label: string; bgColor: string; textColor: string }> = {
            full_time: { label: 'Toàn thời gian', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
            part_time: { label: 'Bán thời gian', bgColor: 'bg-orange-50', textColor: 'text-orange-600' },
            contract: { label: 'Hợp đồng', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
            intern: { label: 'Thực tập', bgColor: 'bg-pink-50', textColor: 'text-pink-600' },
        };

        return types[job.job_type] || types.full_time;
    };

    // Generate company initials from company name or department
    const getCompanyInitials = () => {
        const name = job.company_name || job.department || job.title;
        const words = name.split(' ').filter(Boolean);
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    // Generate a consistent color based on company name
    const getLogoColor = () => {
        const colors = [
            'from-blue-500 to-blue-600',
            'from-emerald-500 to-teal-600',
            'from-purple-500 to-purple-600',
            'from-orange-500 to-orange-600',
            'from-pink-500 to-pink-600',
            'from-indigo-500 to-indigo-600',
            'from-cyan-500 to-cyan-600',
            'from-rose-500 to-rose-600',
        ];
        const name = job.company_name || job.title || '';
        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    const jobType = getJobTypeBadge();

    return (
        <Link to={`/jobs/${job.slug}`} className="block">
            <div className="
                group
                bg-white
                rounded-xl
                border border-slate-200
                p-5
                transition-all duration-200
                hover:shadow-lg hover:shadow-slate-200/60
                hover:border-emerald-400
            ">
                <div className="flex gap-4">
                    {/* Company Logo */}
                    <div className="shrink-0">
                        {job.company_logo ? (
                            <div className="w-[72px] h-[72px] rounded-lg border border-slate-100 bg-white p-1.5 flex items-center justify-center">
                                <img
                                    src={job.company_logo}
                                    alt={job.company_name || 'Company'}
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                        ) : (
                            <div className={`w-[72px] h-[72px] rounded-lg bg-gradient-to-br ${getLogoColor()} flex items-center justify-center shadow-md`}>
                                <span className="text-white font-bold text-lg tracking-tight">{getCompanyInitials()}</span>
                            </div>
                        )}
                    </div>

                    {/* Job Content */}
                    <div className="flex-1 min-w-0">
                        {/* Title & Salary Row */}
                        <div className="flex items-start justify-between gap-4 mb-1.5">
                            <h3 className="
                                text-[15px] font-semibold text-slate-800 
                                group-hover:text-emerald-600 
                                transition-colors
                                line-clamp-1 leading-snug
                            ">
                                {job.title}
                            </h3>
                            <span className="shrink-0 text-sm font-bold text-emerald-600 whitespace-nowrap">
                                {formatSalary()}
                            </span>
                        </div>

                        {/* Company Name */}
                        <p className="text-[13px] text-slate-500 mb-2.5 truncate uppercase tracking-wide">
                            {job.company_name || 'CÔNG TY TUYỂN DỤNG'}
                        </p>

                        {/* Tags Row: Location & Job Type */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            {job.location && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                                    <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {job.location}
                                </span>
                            )}
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${jobType.bgColor} ${jobType.textColor}`}>
                                {jobType.label}
                            </span>
                            {job.experience_required && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                                    {job.experience_required}
                                </span>
                            )}
                        </div>

                        {/* Footer: Posted Date & Save Button */}
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400">
                                Đăng {formatDate(job.published_at)}
                            </span>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    // TODO: Implement save job
                                }}
                                className="p-1.5 rounded-full hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-colors"
                                title="Lưu việc làm"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
