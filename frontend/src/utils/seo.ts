/**
 * SEO Configuration & Utilities for Viecly
 * Custom SEO solution compatible with React 19
 */

// ==================== SITE CONFIG ====================
export const SITE_CONFIG = {
    name: 'Viecly',
    tagline: 'Nền tảng tuyển dụng thông minh',
    url: 'https://viecly.vn',
    logo: 'https://viecly.vn/logo.png',
    description: 'Viecly - Nền tảng tuyển dụng thông minh. Quản lý ứng viên bằng Kanban, inbox đa kênh Zalo/Facebook, tự động hóa quy trình tuyển dụng.',
    keywords: 'viecly, tuyển dụng, nhân sự, phần mềm tuyển dụng, quản lý ứng viên, ATS, HR tech, việc làm',
    locale: 'vi_VN',
    twitter: '@viecly',
    facebook: 'https://facebook.com/viecly',
};

// ==================== SEO TYPES ====================
export interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'job';
    noindex?: boolean;
}

export interface JobSEOProps {
    title: string;
    description: string;
    company: string;
    location: string;
    salary?: { min?: number; max?: number; currency?: string };
    jobType?: string;
    datePosted?: string;
    validThrough?: string;
    slug: string;
}

// ==================== SEO HELPERS ====================

/**
 * Update document title and meta tags
 */
export function updateSEO({
    title,
    description,
    keywords,
    image,
    url,
    type = 'website',
    noindex = false,
}: SEOProps): void {
    // Title
    const fullTitle = title
        ? `${title} | ${SITE_CONFIG.name}`
        : `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`;
    document.title = fullTitle;

    // Helper to update meta tag
    const setMeta = (name: string, content: string, isProperty = false) => {
        const attr = isProperty ? 'property' : 'name';
        let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute(attr, name);
            document.head.appendChild(meta);
        }
        meta.content = content;
    };

    // Basic meta tags
    setMeta('description', description || SITE_CONFIG.description);
    setMeta('keywords', keywords || SITE_CONFIG.keywords);
    setMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description || SITE_CONFIG.description, true);
    setMeta('og:image', image || SITE_CONFIG.logo, true);
    setMeta('og:url', url || window.location.href, true);
    setMeta('og:type', type, true);
    setMeta('og:site_name', SITE_CONFIG.name, true);
    setMeta('og:locale', SITE_CONFIG.locale, true);

    // Twitter
    setMeta('twitter:card', 'summary_large_image', true);
    setMeta('twitter:title', fullTitle, true);
    setMeta('twitter:description', description || SITE_CONFIG.description, true);
    setMeta('twitter:image', image || SITE_CONFIG.logo, true);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
    }
    canonical.href = url || window.location.href;
}

/**
 * Add JSON-LD structured data to the page
 */
export function addStructuredData(data: object, id: string): void {
    // Remove existing script with same id
    const existing = document.getElementById(id);
    if (existing) {
        existing.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
}

/**
 * Remove structured data by id
 */
export function removeStructuredData(id: string): void {
    const script = document.getElementById(id);
    if (script) {
        script.remove();
    }
}

/**
 * Generate JobPosting schema for a job listing
 */
export function generateJobPostingSchema(job: JobSEOProps): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: job.title,
        description: job.description,
        datePosted: job.datePosted || new Date().toISOString().split('T')[0],
        validThrough: job.validThrough || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        hiringOrganization: {
            '@type': 'Organization',
            name: job.company,
            sameAs: `${SITE_CONFIG.url}/company/${encodeURIComponent(job.company)}`,
        },
        jobLocation: {
            '@type': 'Place',
            address: {
                '@type': 'PostalAddress',
                addressLocality: job.location,
                addressCountry: 'VN',
            },
        },
        ...(job.salary?.min && {
            baseSalary: {
                '@type': 'MonetaryAmount',
                currency: job.salary.currency || 'VND',
                value: {
                    '@type': 'QuantitativeValue',
                    minValue: job.salary.min,
                    maxValue: job.salary.max || job.salary.min,
                    unitText: 'MONTH',
                },
            },
        }),
        employmentType: mapJobType(job.jobType),
        url: `${SITE_CONFIG.url}/jobs/${job.slug}`,
    };
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

/**
 * Generate WebSite schema with search action
 */
export function generateWebsiteSchema(): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SITE_CONFIG.url}/jobs?search={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };
}

// ==================== HELPERS ====================

function mapJobType(type?: string): string {
    const typeMap: Record<string, string> = {
        'full_time': 'FULL_TIME',
        'part_time': 'PART_TIME',
        'contract': 'CONTRACTOR',
        'intern': 'INTERN',
        'temporary': 'TEMPORARY',
    };
    return typeMap[type || ''] || 'FULL_TIME';
}
