// Template data for poster creator
export interface PosterTemplate {
    id: string;
    name: string;
    description: string;
    category: 'modern' | 'minimal' | 'corporate' | 'startup' | 'creative';
    thumbnail: string;
    colors: {
        primary: string;
        secondary: string;
        background: string;
        text: string;
    };
}

export const posterTemplates: PosterTemplate[] = [
    {
        id: 'modern-blue',
        name: 'Modern Blue',
        description: 'Phong cách hiện đại với tone xanh dương',
        category: 'modern',
        thumbnail: '/templates/modern-blue.png',
        colors: {
            primary: '#3B82F6',
            secondary: '#1D4ED8',
            background: '#EFF6FF',
            text: '#1E3A8A',
        },
    },
    {
        id: 'minimal-dark',
        name: 'Minimal Dark',
        description: 'Tối giản với nền tối sang trọng',
        category: 'minimal',
        thumbnail: '/templates/minimal-dark.png',
        colors: {
            primary: '#10B981',
            secondary: '#059669',
            background: '#111827',
            text: '#F9FAFB',
        },
    },
    {
        id: 'corporate-green',
        name: 'Corporate Green',
        description: 'Chuyên nghiệp dành cho doanh nghiệp',
        category: 'corporate',
        thumbnail: '/templates/corporate-green.png',
        colors: {
            primary: '#059669',
            secondary: '#047857',
            background: '#ECFDF5',
            text: '#064E3B',
        },
    },
    {
        id: 'startup-gradient',
        name: 'Startup Gradient',
        description: 'Năng động với gradient sáng tạo',
        category: 'startup',
        thumbnail: '/templates/startup-gradient.png',
        colors: {
            primary: '#8B5CF6',
            secondary: '#6366F1',
            background: '#F5F3FF',
            text: '#4C1D95',
        },
    },
    {
        id: 'creative-orange',
        name: 'Creative Orange',
        description: 'Sáng tạo với màu cam nổi bật',
        category: 'creative',
        thumbnail: '/templates/creative-orange.png',
        colors: {
            primary: '#F97316',
            secondary: '#EA580C',
            background: '#FFF7ED',
            text: '#9A3412',
        },
    },
];

// Poster content interface
export interface PosterContent {
    title: string;
    subtitle: string;
    companyName: string;
    salary: string;
    location: string;
    requirements: string[];
    benefits: string[];
    contactInfo: string;
    logoUrl?: string;
    deadline?: string;
}

// Default poster content
export const defaultPosterContent: PosterContent = {
    title: 'TUYỂN DỤNG',
    subtitle: 'Vị trí công việc',
    companyName: 'Tên công ty',
    salary: 'Thỏa thuận',
    location: 'TP. Hồ Chí Minh',
    requirements: ['Yêu cầu 1', 'Yêu cầu 2', 'Yêu cầu 3'],
    benefits: ['Quyền lợi 1', 'Quyền lợi 2'],
    contactInfo: 'Liên hệ: example@company.com',
};
