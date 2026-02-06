import { Link } from 'react-router-dom';
import type { PublicJob } from '../services/publicJobsApi';

interface PublicJobCardProps {
    job: PublicJob;
}

export function PublicJobCard({ job }: PublicJobCardProps) {
    const formatSalary = () => {
        if (!job.salary_min && !job.salary_max) return 'Thỏa thuận';

        const format = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

        if (job.salary_min && job.salary_max) {
            return `${format(job.salary_min)} - ${format(job.salary_max)} ${job.salary_currency}`;
        }

        return job.salary_min
            ? `Từ ${format(job.salary_min)} ${job.salary_currency}`
            : `Đến ${format(job.salary_max!)} ${job.salary_currency}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return 'Hôm nay';
        if (diffInDays === 1) return 'Hôm qua';
        if (diffInDays < 7) return `${diffInDays} ngày trước`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`;

        return date.toLocaleDateString('vi-VN');
    };

    const getJobTypeBadge = () => {
        const types = {
            full_time: { label: 'Toàn thời gian', color: 'bg-emerald-100 text-emerald-700' },
            part_time: { label: 'Bán thời gian', color: 'bg-blue-100 text-blue-700' },
            contract: { label: 'Hợp đồng', color: 'bg-amber-100 text-amber-700' },
            intern: { label: 'Thực tập', color: 'bg-purple-100 text-purple-700' },
        };

        return types[job.job_type] || types.full_time;
    };

    const jobType = getJobTypeBadge();

    return (
        <Link to={`/jobs/${job.slug}`}>
            <div className="
        group
        bg-white
        rounded-xl
        border border-slate-200
        p-6
        transition-all duration-300
        hover:shadow-xl hover:shadow-slate-200/50
        hover:-translate-y-1
        hover:border-emerald-300
        cursor-pointer
      ">
                {/* Job Title */}
                <h3 className="
          text-lg font-semibold text-slate-900 mb-2
          group-hover:text-emerald-600 transition-colors
        ">
                    {job.title}
                </h3>

                {/* Company/Department */}
                {job.department && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span>{job.department}</span>
                    </div>
                )}

                {/* Location */}
                {job.location && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{job.location}</span>
                    </div>
                )}

                {/* Badges: Job Type & Salary */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${jobType.color}`}>
                        {jobType.label}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        💰 {formatSalary()}
                    </span>
                </div>

                {/* Description Preview */}
                {job.description && (
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                        {job.description.replace(/<[^>]*>/g, '')}
                    </p>
                )}

                {/* Footer: Published Date */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-xs text-slate-500">
                        Đăng {formatDate(job.published_at)}
                    </span>
                    <div className="
            flex items-center gap-1 text-sm font-medium text-emerald-600
            group-hover:gap-2 transition-all
          ">
                        Xem chi tiết
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );
}
