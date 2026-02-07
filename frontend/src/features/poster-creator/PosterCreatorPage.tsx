import { useState, useEffect, useRef } from 'react';
import type { PosterTemplate, PosterContent } from './templates/templateData';
import { posterTemplates, defaultPosterContent } from './templates/templateData';
import { PosterCanvas } from './components/PosterCanvas';
import { TemplateGallery } from './components/TemplateGallery';
import { PropertyPanel } from './components/PropertyPanel';
import apiClient from '../../services/apiClient';

interface Job {
    id: number;
    title: string;
    salary_min: number | null;
    salary_max: number | null;
    location: string;
    requirements?: string;
    benefits?: string;
    description?: string;
}

// Icons
const Icons = {
    image: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
    ),
    download: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
    ),
    share: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
        </svg>
    ),
    sparkles: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
    ),
};

export function PosterCreatorPage() {
    const [selectedTemplate, setSelectedTemplate] = useState<PosterTemplate>(posterTemplates[0]);
    const [content, setContent] = useState<PosterContent>(defaultPosterContent);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
    const [exporting, setExporting] = useState(false);
    const [showExportSuccess, setShowExportSuccess] = useState(false);
    const canvasRef = useRef<HTMLDivElement>(null);

    // Fetch jobs for job selector
    useEffect(() => {
        apiClient.get('/recruiting/jobs')
            .then(res => {
                const jobsData = res.data.data || res.data;
                if (Array.isArray(jobsData)) {
                    setJobs(jobsData);
                }
            })
            .catch(console.error);

        // Try to get company info for default content
        apiClient.get('/company')
            .then(res => {
                const company = res.data.data || res.data;
                if (company?.name) {
                    setContent(prev => ({
                        ...prev,
                        companyName: company.name,
                        logoUrl: company.logo_url || undefined,
                        contactInfo: `Liên hệ: ${company.email || company.phone || 'HR@company.com'}`,
                    }));
                }
            })
            .catch(() => { });
    }, []);

    // Fill content from selected job
    const handleJobSelect = (jobId: number | null) => {
        setSelectedJobId(jobId);
        if (!jobId) return;

        const job = jobs.find(j => j.id === jobId);
        if (!job) return;

        // Format salary
        let salaryText = 'Thỏa thuận';
        if (job.salary_min && job.salary_max) {
            salaryText = `${(job.salary_min / 1000000).toFixed(0)} - ${(job.salary_max / 1000000).toFixed(0)} triệu`;
        } else if (job.salary_min) {
            salaryText = `Từ ${(job.salary_min / 1000000).toFixed(0)} triệu`;
        }

        // Parse requirements from text
        const reqLines = job.requirements?.split('\n').filter(l => l.trim()) || ['Có kinh nghiệm liên quan'];
        const benefitLines = job.benefits?.split('\n').filter(l => l.trim()) || ['Môi trường làm việc chuyên nghiệp'];

        setContent(prev => ({
            ...prev,
            subtitle: job.title,
            salary: salaryText,
            location: job.location || prev.location,
            requirements: reqLines.slice(0, 4),
            benefits: benefitLines.slice(0, 3),
        }));
    };

    // Logo upload handler
    const handleLogoUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setContent(prev => ({
                ...prev,
                logoUrl: e.target?.result as string,
            }));
        };
        reader.readAsDataURL(file);
    };

    // Export poster as image
    const handleExport = async () => {
        const canvas = document.getElementById('poster-canvas');
        if (!canvas) return;

        setExporting(true);
        try {
            // Dynamic import html2canvas
            const html2canvas = (await import('html2canvas')).default;
            const canvasImage = await html2canvas(canvas, {
                scale: 2,
                useCORS: true,
                backgroundColor: selectedTemplate.colors.background,
            });

            // Download
            const link = document.createElement('a');
            link.download = `poster-${content.subtitle.replace(/\s+/g, '-').toLowerCase()}.png`;
            link.href = canvasImage.toDataURL('image/png');
            link.click();

            setShowExportSuccess(true);
            setTimeout(() => setShowExportSuccess(false), 3000);
        } catch (err) {
            console.error('Export failed:', err);
            alert('Không thể xuất poster. Vui lòng thử lại.');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                                {Icons.sparkles}
                            </span>
                            Tạo Poster Tuyển Dụng
                        </h1>
                        <p className="text-slate-500 mt-2">Thiết kế poster đẹp mắt để đăng lên các nhóm Zalo, Facebook</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExport}
                            disabled={exporting}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                        >
                            {exporting ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                Icons.download
                            )}
                            {exporting ? 'Đang xuất...' : 'Xuất PNG'}
                        </button>
                    </div>
                </div>

                {/* Job Selector */}
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-blue-900">Chọn tin tuyển dụng:</span>
                        <select
                            value={selectedJobId || ''}
                            onChange={(e) => handleJobSelect(e.target.value ? Number(e.target.value) : null)}
                            className="flex-1 max-w-md px-3 py-2 rounded-lg border border-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                        >
                            <option value="">-- Tự nhập nội dung --</option>
                            {jobs.map(job => (
                                <option key={job.id} value={job.id}>
                                    {job.title} - {job.location}
                                </option>
                            ))}
                        </select>
                        <span className="text-xs text-blue-600">💡 Chọn job để tự động điền thông tin</span>
                    </div>
                </div>
            </div>

            {/* Main Editor Layout */}
            <div className="flex gap-6">
                {/* Left: Template Gallery */}
                <div className="w-64 flex-shrink-0">
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 sticky top-4">
                        <TemplateGallery
                            selectedId={selectedTemplate.id}
                            onSelect={setSelectedTemplate}
                        />
                    </div>
                </div>

                {/* Center: Canvas Preview */}
                <div className="flex-1 flex items-start justify-center">
                    <div className="bg-slate-100 rounded-2xl p-8 border border-slate-200" ref={canvasRef}>
                        <PosterCanvas template={selectedTemplate} content={content} />
                    </div>
                </div>

                {/* Right: Property Panel */}
                <div className="w-80 flex-shrink-0">
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 sticky top-4 max-h-[calc(100vh-120px)] overflow-y-auto">
                        <PropertyPanel
                            content={content}
                            onChange={setContent}
                            onLogoUpload={handleLogoUpload}
                        />
                    </div>
                </div>
            </div>

            {/* Export Success Toast */}
            {showExportSuccess && (
                <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-4">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Đã xuất poster thành công!
                </div>
            )}
        </div>
    );
}

export default PosterCreatorPage;
