import type { CanvasElement } from '../types';

// ===== Industry Detection =====
type Industry = 'technology' | 'finance' | 'healthcare' | 'creative' | 'education' | 'retail' | 'construction' | 'restaurant' | 'general';

interface IndustryConfig {
    bgImage: string;
    primary: string;
    secondary: string;
    accent: string;
    overlayDark: string;   // Dark overlay for text areas
    overlayLight: string;  // Lighter overlay
    cardBg: string;        // Card background
    cardText: string;      // Card text color
}

const industryConfigs: Record<Industry, IndustryConfig> = {
    technology: {
        bgImage: '/poster-bg/office.png',
        primary: '#6366f1', secondary: '#818cf8', accent: '#c7d2fe',
        overlayDark: 'rgba(15,23,42,0.82)', overlayLight: 'rgba(15,23,42,0.45)',
        cardBg: 'rgba(99,102,241,0.15)', cardText: '#e0e7ff',
    },
    finance: {
        bgImage: '/poster-bg/office.png',
        primary: '#0d9488', secondary: '#2dd4bf', accent: '#99f6e4',
        overlayDark: 'rgba(2,32,30,0.85)', overlayLight: 'rgba(2,32,30,0.4)',
        cardBg: 'rgba(13,148,136,0.15)', cardText: '#ccfbf1',
    },
    healthcare: {
        bgImage: '/poster-bg/office.png',
        primary: '#0284c7', secondary: '#38bdf8', accent: '#bae6fd',
        overlayDark: 'rgba(7,57,89,0.85)', overlayLight: 'rgba(7,57,89,0.4)',
        cardBg: 'rgba(2,132,199,0.15)', cardText: '#e0f2fe',
    },
    creative: {
        bgImage: '/poster-bg/office.png',
        primary: '#a855f7', secondary: '#c084fc', accent: '#e9d5ff',
        overlayDark: 'rgba(59,7,100,0.82)', overlayLight: 'rgba(59,7,100,0.4)',
        cardBg: 'rgba(168,85,247,0.15)', cardText: '#f3e8ff',
    },
    education: {
        bgImage: '/poster-bg/office.png',
        primary: '#ea580c', secondary: '#fb923c', accent: '#fed7aa',
        overlayDark: 'rgba(67,20,7,0.85)', overlayLight: 'rgba(67,20,7,0.4)',
        cardBg: 'rgba(234,88,12,0.15)', cardText: '#ffedd5',
    },
    retail: {
        bgImage: '/poster-bg/retail.png',
        primary: '#e11d48', secondary: '#fb7185', accent: '#fecdd3',
        overlayDark: 'rgba(76,5,25,0.82)', overlayLight: 'rgba(76,5,25,0.4)',
        cardBg: 'rgba(225,29,72,0.15)', cardText: '#ffe4e6',
    },
    construction: {
        bgImage: '/poster-bg/construction.png',
        primary: '#d97706', secondary: '#fbbf24', accent: '#fef3c7',
        overlayDark: 'rgba(69,26,3,0.82)', overlayLight: 'rgba(69,26,3,0.4)',
        cardBg: 'rgba(217,119,6,0.15)', cardText: '#fef9c3',
    },
    restaurant: {
        bgImage: '/poster-bg/restaurant.png',
        primary: '#dc2626', secondary: '#f87171', accent: '#fecaca',
        overlayDark: 'rgba(69,10,10,0.82)', overlayLight: 'rgba(69,10,10,0.4)',
        cardBg: 'rgba(220,38,38,0.15)', cardText: '#fee2e2',
    },
    general: {
        bgImage: '/poster-bg/office.png',
        primary: '#3b82f6', secondary: '#60a5fa', accent: '#bfdbfe',
        overlayDark: 'rgba(15,23,42,0.82)', overlayLight: 'rgba(15,23,42,0.4)',
        cardBg: 'rgba(59,130,246,0.15)', cardText: '#dbeafe',
    },
};

function detectIndustry(job: JobData): Industry {
    const text = `${job.title} ${job.department || ''} ${job.description || ''} ${job.industry || ''}`.toLowerCase();
    const keywords: Record<string, string[]> = {
        technology: ['developer', 'engineer', 'software', 'frontend', 'backend', 'fullstack', 'devops', 'data', 'ai', 'cloud', 'it', 'tech', 'react', 'python', 'java', 'mobile', 'lập trình', 'phần mềm', 'công nghệ'],
        finance: ['finance', 'accounting', 'bank', 'tài chính', 'kế toán', 'ngân hàng', 'audit', 'investment', 'đầu tư'],
        healthcare: ['doctor', 'nurse', 'medical', 'health', 'y tế', 'bác sĩ', 'dược', 'pharmacy', 'bệnh viện'],
        creative: ['design', 'creative', 'marketing', 'content', 'media', 'graphic', 'ui/ux', 'thiết kế', 'truyền thông'],
        education: ['teacher', 'education', 'training', 'giáo viên', 'đào tạo', 'giáo dục', 'school'],
        retail: ['sales', 'retail', 'shop', 'bán hàng', 'kinh doanh', 'cửa hàng', 'customer'],
        construction: ['construction', 'architect', 'xây dựng', 'kiến trúc', 'civil', 'kho', 'vận', 'warehouse', 'logistics'],
        restaurant: ['restaurant', 'nhà hàng', 'bếp', 'chef', 'phục vụ', 'cafe', 'food', 'ẩm thực', 'khách sạn'],
    };
    let maxScore = 0;
    let detected: Industry = 'general';
    for (const [industry, words] of Object.entries(keywords)) {
        const score = words.reduce((acc, w) => acc + (text.includes(w) ? 1 : 0), 0);
        if (score > maxScore) { maxScore = score; detected = industry as Industry; }
    }
    return detected;
}

// ===== Types =====
type LayoutVariant = 'classic' | 'split' | 'banner' | 'modern';

interface JobData {
    id: number;
    title: string;
    department?: string;
    location?: string;
    employment_type?: string;
    salary_min?: number | null;
    salary_max?: number | null;
    description?: string;
    requirements?: string;
    benefits?: string;
    industry?: string;
    company_name?: string;
}

function formatSalary(min?: number | null, max?: number | null): string {
    if (!min && !max) return 'Thỏa thuận';
    const fMin = min ? `${Math.round(min / 1000000)}` : '';
    const fMax = max ? `${Math.round(max / 1000000)}` : '';
    if (fMin && fMax) return `${fMin} - ${fMax} Triệu`;
    if (fMin) return `Từ ${fMin} Triệu`;
    return `Đến ${fMax} Triệu`;
}

function parseList(text?: string, fallback?: string): string[] {
    if (!text) return fallback ? [fallback] : [];
    return text.split(/[\n•\-\*]+/).map(s => s.trim()).filter(s => s.length > 5).slice(0, 4);
}

function employmentLabel(type?: string): string {
    const map: Record<string, string> = { 'full-time': 'Toàn thời gian', 'part-time': 'Bán thời gian', 'contract': 'Hợp đồng', 'internship': 'Thực tập', 'freelance': 'Freelance' };
    return map[type || ''] || 'Toàn thời gian';
}

// ===== Element Helpers =====
let _counter = 1;
const nextId = () => `ai-${_counter++}`;

const SHADOW = '0 2px 8px rgba(0,0,0,0.6)';
const SHADOW_STRONG = '0 0 12px rgba(0,0,0,0.9), 0 2px 6px rgba(0,0,0,0.5)';
const SHADOW_GLOW = '0 0 20px rgba(255,255,255,0.15)';

type TxtOpts = Partial<{
    fontSize: number; fontWeight: number; color: string; align: 'left' | 'center' | 'right';
    letterSpacing: number; opacity: number; bgColor: string; borderRadius: number; padding: number;
    zIndex: number; fontFamily: string; textShadow: string; textTransform: string; lineHeight: number;
}>;

function txt(x: number, y: number, w: number, h: number, text: string, opts: TxtOpts = {}): CanvasElement {
    return {
        id: nextId(), type: 'text' as const, x, y, width: w, height: h,
        opacity: opts.opacity ?? 1, zIndex: opts.zIndex ?? _counter, rotation: 0, locked: false,
        text, fontSize: opts.fontSize ?? 14, fontWeight: opts.fontWeight ?? 400,
        color: opts.color ?? '#ffffff', align: opts.align ?? 'left',
        lineHeight: opts.lineHeight ?? 1.35, letterSpacing: opts.letterSpacing ?? 0,
        padding: opts.padding ?? 0, bgColor: opts.bgColor ?? 'transparent',
        borderRadius: opts.borderRadius ?? 0, fontFamily: opts.fontFamily ?? 'Inter, sans-serif',
        textShadow: opts.textShadow, textTransform: opts.textTransform,
    } as CanvasElement;
}

type RectOpts = Partial<{ opacity: number; borderRadius: number; zIndex: number; strokeWidth: number; stroke: string }>;

function rect(x: number, y: number, w: number, h: number, fill: string, opts: RectOpts = {}): CanvasElement {
    return {
        id: nextId(), type: 'shape' as const, x, y, width: w, height: h,
        opacity: opts.opacity ?? 1, zIndex: opts.zIndex ?? _counter, rotation: 0, locked: false,
        shape: 'rect' as const, fill, stroke: opts.stroke ?? 'transparent',
        strokeWidth: opts.strokeWidth ?? 0, borderRadius: opts.borderRadius ?? 0,
    } as CanvasElement;
}

// ===== GENERATE =====
export function generatePosterFromJob(job: JobData, variant: LayoutVariant = 'classic'): {
    elements: CanvasElement[];
    bgGradient: string;
    bgColor: string;
    bgImage: string;
} {
    _counter = 1;
    const industry = detectIndustry(job);
    const cfg = industryConfigs[industry];
    const salary = formatSalary(job.salary_min, job.salary_max);
    const reqs = parseList(job.requirements, 'Liên hệ để biết chi tiết');
    const bens = parseList(job.benefits, 'Chế độ hấp dẫn');
    const empType = employmentLabel(job.employment_type);
    const company = job.company_name || 'Tên Công Ty';
    const location = job.location || 'Liên hệ';

    let elements: CanvasElement[] = [];

    if (variant === 'classic') {
        // ===== CLASSIC: Full overlay poster, clean sections =====
        elements = [
            // Full dark overlay
            rect(0, 0, 440, 620, cfg.overlayDark, { zIndex: 1 }),
            // Top accent line
            rect(0, 0, 440, 5, cfg.primary, { zIndex: 2 }),
            // Company
            txt(30, 24, 380, 20, company.toUpperCase(), { fontSize: 10, fontWeight: 700, color: cfg.accent, zIndex: 3, letterSpacing: 3, textShadow: SHADOW }),
            // "TUYỂN DỤNG" large header
            txt(30, 55, 380, 55, 'TUYỂN DỤNG', { fontSize: 40, fontWeight: 900, color: '#ffffff', zIndex: 3, letterSpacing: 5, textShadow: SHADOW_STRONG, textTransform: 'uppercase' }),
            // Job title
            txt(30, 118, 380, 50, job.title.toUpperCase(), { fontSize: 18, fontWeight: 800, color: cfg.secondary, zIndex: 3, letterSpacing: 1, textShadow: SHADOW }),
            // Divider
            rect(30, 178, 60, 3, cfg.primary, { borderRadius: 2, zIndex: 3 }),
            // Info pills row
            rect(30, 198, 120, 30, cfg.cardBg, { borderRadius: 8, zIndex: 3, stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }),
            txt(30, 198, 120, 30, `💰  ${salary}`, { fontSize: 10, fontWeight: 700, color: '#ffffff', align: 'center', zIndex: 4, padding: 6, textShadow: SHADOW }),
            rect(160, 198, 120, 30, cfg.cardBg, { borderRadius: 8, zIndex: 3, stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }),
            txt(160, 198, 120, 30, `📍  ${location}`, { fontSize: 10, fontWeight: 700, color: '#ffffff', align: 'center', zIndex: 4, padding: 6, textShadow: SHADOW }),
            rect(290, 198, 120, 30, cfg.cardBg, { borderRadius: 8, zIndex: 3, stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }),
            txt(290, 198, 120, 30, `🏢  ${empType}`, { fontSize: 10, fontWeight: 700, color: '#ffffff', align: 'center', zIndex: 4, padding: 6, textShadow: SHADOW }),
            // YÊU CẦU section
            rect(30, 248, 185, 26 + reqs.length * 28, 'rgba(255,255,255,0.06)', { borderRadius: 12, zIndex: 3, stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }),
            txt(44, 254, 160, 18, 'YÊU CẦU', { fontSize: 10, fontWeight: 800, color: cfg.secondary, zIndex: 4, letterSpacing: 2.5 }),
            ...reqs.map((r, i) => txt(44, 276 + i * 28, 160, 24, `✓  ${r}`, { fontSize: 10, fontWeight: 500, color: '#e2e8f0', zIndex: 4, textShadow: '0 1px 3px rgba(0,0,0,0.3)' })),
            // QUYỀN LỢI section
            rect(225, 248, 185, 26 + bens.length * 28, 'rgba(255,255,255,0.06)', { borderRadius: 12, zIndex: 3, stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }),
            txt(239, 254, 160, 18, 'QUYỀN LỢI', { fontSize: 10, fontWeight: 800, color: cfg.secondary, zIndex: 4, letterSpacing: 2.5 }),
            ...bens.map((b, i) => txt(239, 276 + i * 28, 160, 24, `★  ${b}`, { fontSize: 10, fontWeight: 500, color: '#e2e8f0', zIndex: 4, textShadow: '0 1px 3px rgba(0,0,0,0.3)' })),
            // Bottom bar
            rect(0, 530, 440, 90, cfg.primary, { zIndex: 5 }),
            rect(0, 530, 440, 1, 'rgba(255,255,255,0.2)', { zIndex: 6 }),
            txt(30, 544, 220, 18, 'LIÊN HỆ ỨNG TUYỂN', { fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.7)', zIndex: 6, letterSpacing: 2.5 }),
            txt(30, 564, 220, 18, '📞  0901 234 567', { fontSize: 11, fontWeight: 600, color: '#ffffff', zIndex: 6 }),
            txt(30, 586, 220, 18, '✉️  hr@company.vn', { fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.8)', zIndex: 6 }),
            // CTA button
            rect(290, 554, 120, 40, '#ffffff', { borderRadius: 20, zIndex: 6 }),
            txt(290, 554, 120, 40, 'ỨNG TUYỂN', { fontSize: 12, fontWeight: 800, color: cfg.primary, align: 'center', zIndex: 7, padding: 10 }),
        ];
    } else if (variant === 'split') {
        // ===== SPLIT: Left dark panel + Right image peek =====
        elements = [
            // Left dark panel
            rect(0, 0, 235, 620, cfg.overlayDark, { opacity: 0.92, zIndex: 1 }),
            // Right lighter (more image visible)
            rect(235, 0, 205, 620, cfg.overlayLight, { opacity: 0.3, zIndex: 1 }),
            // Vertical accent
            rect(233, 0, 4, 620, cfg.primary, { zIndex: 2 }),
            // Left panel content
            txt(22, 26, 200, 16, company.toUpperCase(), { fontSize: 9, fontWeight: 700, color: cfg.accent, zIndex: 3, letterSpacing: 2.5 }),
            // TUYỂN DỤNG vertical-style
            txt(22, 54, 200, 70, 'TUYỂN\nDỤNG', { fontSize: 30, fontWeight: 900, color: '#ffffff', zIndex: 3, letterSpacing: 4, textShadow: SHADOW_STRONG, lineHeight: 1.1 }),
            // Line
            rect(22, 130, 50, 3, cfg.primary, { borderRadius: 2, zIndex: 3 }),
            // Job title
            txt(22, 144, 200, 60, job.title.toUpperCase(), { fontSize: 15, fontWeight: 800, color: cfg.secondary, zIndex: 3, letterSpacing: 0.5, textShadow: SHADOW }),
            // Salary pill
            rect(22, 218, 195, 34, cfg.cardBg, { borderRadius: 10, zIndex: 3, stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }),
            txt(22, 218, 195, 34, `💰  ${salary}`, { fontSize: 12, fontWeight: 700, color: '#ffffff', align: 'center', zIndex: 4, padding: 8, textShadow: SHADOW }),
            // Details
            txt(22, 268, 195, 16, `📍 ${location}`, { fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.7)', zIndex: 3 }),
            txt(22, 288, 195, 16, `🏢 ${empType}`, { fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.7)', zIndex: 3 }),
            // YÊU CẦU
            txt(22, 320, 195, 16, 'YÊU CẦU', { fontSize: 9, fontWeight: 800, color: cfg.secondary, zIndex: 3, letterSpacing: 2.5 }),
            ...reqs.map((r, i) => txt(22, 342 + i * 26, 195, 22, `✓  ${r}`, { fontSize: 9, fontWeight: 500, color: '#e2e8f0', zIndex: 3, textShadow: '0 1px 2px rgba(0,0,0,0.3)' })),
            // QUYỀN LỢI
            txt(22, 342 + reqs.length * 26 + 16, 195, 16, 'QUYỀN LỢI', { fontSize: 9, fontWeight: 800, color: cfg.secondary, zIndex: 3, letterSpacing: 2.5 }),
            ...bens.map((b, i) => txt(22, 342 + reqs.length * 26 + 38 + i * 26, 195, 22, `★  ${b}`, { fontSize: 9, fontWeight: 500, color: '#e2e8f0', zIndex: 3, textShadow: '0 1px 2px rgba(0,0,0,0.3)' })),
            // Bottom
            rect(0, 570, 235, 50, cfg.primary, { zIndex: 5 }),
            txt(22, 578, 200, 14, '📞  0901 234 567', { fontSize: 9, fontWeight: 600, color: '#ffffff', zIndex: 6 }),
            txt(22, 594, 200, 14, '✉️  hr@company.vn', { fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.7)', zIndex: 6 }),
            // Right side: floating CTA
            rect(255, 35, 170, 44, 'rgba(255,255,255,0.95)', { borderRadius: 14, zIndex: 3 }),
            txt(255, 35, 170, 44, '🔥 ỨNG TUYỂN NGAY', { fontSize: 12, fontWeight: 800, color: cfg.primary, align: 'center', zIndex: 4, padding: 12 }),
        ];
    } else if (variant === 'banner') {
        // ===== BANNER: Big image top + clean white info bottom =====
        elements = [
            // Top image area - light overlay
            rect(0, 0, 440, 270, cfg.overlayLight, { opacity: 0.35, zIndex: 1 }),
            // Bottom white panel
            rect(0, 270, 440, 350, '#ffffff', { zIndex: 2 }),
            // Floating badge
            rect(24, 24, 140, 34, cfg.primary, { borderRadius: 17, zIndex: 3 }),
            txt(24, 24, 140, 34, '🔥  TUYỂN DỤNG', { fontSize: 11, fontWeight: 800, color: '#ffffff', align: 'center', zIndex: 4, padding: 8, letterSpacing: 1 }),
            // Company on image
            txt(24, 74, 400, 20, company.toUpperCase(), { fontSize: 11, fontWeight: 700, color: '#ffffff', zIndex: 3, letterSpacing: 2, textShadow: SHADOW_STRONG }),
            // Job title on image
            txt(24, 100, 400, 80, job.title.toUpperCase(), { fontSize: 26, fontWeight: 900, color: '#ffffff', zIndex: 3, letterSpacing: 1, textShadow: SHADOW_STRONG }),
            // Salary + location on image
            rect(24, 200, 155, 36, 'rgba(0,0,0,0.45)', { borderRadius: 10, zIndex: 3 }),
            txt(24, 200, 155, 36, `💰  ${salary}`, { fontSize: 12, fontWeight: 700, color: '#ffffff', align: 'center', zIndex: 4, padding: 8 }),
            rect(188, 200, 155, 36, 'rgba(0,0,0,0.45)', { borderRadius: 10, zIndex: 3 }),
            txt(188, 200, 155, 36, `📍  ${location}`, { fontSize: 12, fontWeight: 700, color: '#ffffff', align: 'center', zIndex: 4, padding: 8 }),
            // Bottom panel — two columns
            txt(28, 288, 195, 22, 'YÊU CẦU CÔNG VIỆC', { fontSize: 11, fontWeight: 800, color: cfg.primary, zIndex: 5, letterSpacing: 1.5 }),
            rect(28, 312, 50, 2, cfg.primary, { borderRadius: 1, zIndex: 5 }),
            ...reqs.map((r, i) => txt(28, 322 + i * 28, 195, 24, `✓  ${r}`, { fontSize: 10, fontWeight: 600, color: '#334155', zIndex: 5 })),
            txt(240, 288, 185, 22, 'QUYỀN LỢI', { fontSize: 11, fontWeight: 800, color: cfg.primary, zIndex: 5, letterSpacing: 1.5 }),
            rect(240, 312, 50, 2, cfg.primary, { borderRadius: 1, zIndex: 5 }),
            ...bens.map((b, i) => txt(240, 322 + i * 28, 185, 24, `★  ${b}`, { fontSize: 10, fontWeight: 600, color: '#334155', zIndex: 5 })),
            // Bottom CTA bar
            rect(0, 538, 440, 82, cfg.primary, { zIndex: 6 }),
            txt(28, 548, 220, 16, 'LIÊN HỆ ỨNG TUYỂN', { fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.65)', zIndex: 7, letterSpacing: 2.5 }),
            txt(28, 568, 140, 18, '📞  0901 234 567', { fontSize: 11, fontWeight: 600, color: '#ffffff', zIndex: 7 }),
            txt(28, 590, 180, 16, '✉️  hr@company.vn', { fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.7)', zIndex: 7 }),
            rect(300, 560, 115, 40, '#ffffff', { borderRadius: 20, zIndex: 7 }),
            txt(300, 560, 115, 40, 'ỨNG TUYỂN', { fontSize: 11, fontWeight: 800, color: cfg.primary, align: 'center', zIndex: 8, padding: 10 }),
        ];
    } else { // modern
        // ===== MODERN: Full-bleed glassmorphism =====
        elements = [
            // Full dark overlay
            rect(0, 0, 440, 620, cfg.overlayDark, { opacity: 0.7, zIndex: 1 }),
            // Top gradient accent
            rect(0, 0, 440, 4, cfg.primary, { zIndex: 2 }),
            // Company name
            txt(28, 22, 300, 16, company.toUpperCase(), { fontSize: 9, fontWeight: 700, color: cfg.accent, zIndex: 3, letterSpacing: 4, opacity: 0.8 }),
            // Accent bar + ĐANG TUYỂN
            rect(28, 50, 3, 28, cfg.primary, { zIndex: 3 }),
            txt(40, 50, 300, 28, 'ĐANG TUYỂN', { fontSize: 11, fontWeight: 800, color: cfg.secondary, zIndex: 3, letterSpacing: 3 }),
            // Big job title
            txt(28, 92, 385, 75, job.title, { fontSize: 28, fontWeight: 900, color: '#ffffff', zIndex: 3, textShadow: SHADOW_STRONG + ', ' + SHADOW_GLOW, lineHeight: 1.2 }),
            // Glass card — job info
            rect(28, 182, 384, 90, 'rgba(255,255,255,0.08)', { borderRadius: 16, zIndex: 3, stroke: 'rgba(255,255,255,0.12)', strokeWidth: 1 }),
            // Salary
            txt(42, 192, 115, 12, '💰 MỨC LƯƠNG', { fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.5)', zIndex: 4, letterSpacing: 1.5 }),
            txt(42, 208, 115, 24, salary, { fontSize: 15, fontWeight: 800, color: '#ffffff', zIndex: 4, textShadow: SHADOW }),
            // Divider
            rect(162, 192, 1, 38, 'rgba(255,255,255,0.15)', { zIndex: 4 }),
            // Location
            txt(176, 192, 105, 12, '📍 ĐỊA ĐIỂM', { fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.5)', zIndex: 4, letterSpacing: 1.5 }),
            txt(176, 208, 105, 24, location, { fontSize: 13, fontWeight: 800, color: '#ffffff', zIndex: 4, textShadow: SHADOW }),
            // Divider
            rect(286, 192, 1, 38, 'rgba(255,255,255,0.15)', { zIndex: 4 }),
            // Type
            txt(300, 192, 100, 12, '🏢 HÌNH THỨC', { fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.5)', zIndex: 4, letterSpacing: 1.5 }),
            txt(300, 208, 100, 24, empType, { fontSize: 12, fontWeight: 800, color: '#ffffff', zIndex: 4, textShadow: SHADOW }),
            // Tags
            txt(42, 245, 370, 16, reqs.slice(0, 3).map(r => `#${r.split(' ').slice(0, 2).join('')}`).join('   '), { fontSize: 9, fontWeight: 600, color: cfg.secondary, zIndex: 4, opacity: 0.7, letterSpacing: 0.3 }),
            // Requirements glass card
            rect(28, 290, 384, 30 + reqs.length * 26, 'rgba(255,255,255,0.05)', { borderRadius: 14, zIndex: 3, stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }),
            txt(42, 298, 360, 16, '✦  YÊU CẦU CÔNG VIỆC', { fontSize: 9, fontWeight: 800, color: cfg.secondary, zIndex: 4, letterSpacing: 2 }),
            ...reqs.map((r, i) => txt(42, 320 + i * 26, 360, 22, `•  ${r}`, { fontSize: 10, fontWeight: 500, color: '#e2e8f0', zIndex: 4, textShadow: '0 1px 2px rgba(0,0,0,0.3)' })),
            // Benefits glass card
            rect(28, 332 + reqs.length * 26, 384, 30 + bens.length * 26, 'rgba(255,255,255,0.05)', { borderRadius: 14, zIndex: 3, stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }),
            txt(42, 340 + reqs.length * 26, 360, 16, '★  QUYỀN LỢI', { fontSize: 9, fontWeight: 800, color: cfg.secondary, zIndex: 4, letterSpacing: 2 }),
            ...bens.map((b, i) => txt(42, 362 + reqs.length * 26 + i * 26, 360, 22, `•  ${b}`, { fontSize: 10, fontWeight: 500, color: '#e2e8f0', zIndex: 4, textShadow: '0 1px 2px rgba(0,0,0,0.3)' })),
            // Bottom bar
            rect(0, 562, 440, 58, 'rgba(0,0,0,0.5)', { zIndex: 5 }),
            txt(28, 572, 250, 14, '📞 0901 234 567  •  ✉️ hr@company.vn', { fontSize: 9, fontWeight: 500, color: 'rgba(255,255,255,0.6)', zIndex: 6 }),
            txt(28, 590, 200, 14, 'Ứng tuyển ngay hôm nay →', { fontSize: 10, fontWeight: 700, color: '#ffffff', zIndex: 6 }),
            // CTA pill
            rect(320, 570, 95, 34, cfg.primary, { borderRadius: 17, zIndex: 6 }),
            txt(320, 570, 95, 34, 'ỨNG TUYỂN', { fontSize: 10, fontWeight: 800, color: '#ffffff', align: 'center', zIndex: 7, padding: 8, textShadow: SHADOW }),
        ];
    }

    return {
        elements,
        bgGradient: '',
        bgColor: '#0f172a',
        bgImage: cfg.bgImage,
    };
}

export const layoutVariants: { id: LayoutVariant; name: string; desc: string; icon: string }[] = [
    { id: 'classic', name: 'Cổ điển', desc: 'Poster tuyển dụng truyền thống', icon: '📋' },
    { id: 'split', name: 'Chia đôi', desc: 'Thông tin trái, ảnh phải', icon: '📐' },
    { id: 'banner', name: 'Banner', desc: 'Ảnh trên, nội dung dưới', icon: '🖼️' },
    { id: 'modern', name: 'Hiện đại', desc: 'Glass effect, premium', icon: '✨' },
];

export type { JobData, LayoutVariant, Industry };
