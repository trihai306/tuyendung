import { useEffect } from 'react';
import {
    updateSEO,
    addStructuredData,
    removeStructuredData,
    generateBreadcrumbSchema,
    type SEOProps
} from '../utils/seo';

interface SEOHeadProps extends SEOProps {
    breadcrumbs?: { name: string; url: string }[];
}

/**
 * SEO Component - Updates document head with SEO meta tags
 * 
 * Usage:
 * <SEOHead 
 *   title="Tìm việc làm" 
 *   description="Tìm kiếm việc làm phù hợp với bạn"
 *   breadcrumbs={[
 *     { name: 'Trang chủ', url: '/' },
 *     { name: 'Việc làm', url: '/jobs' }
 *   ]}
 * />
 */
export function SEOHead({
    title,
    description,
    keywords,
    image,
    url,
    type = 'website',
    noindex = false,
    breadcrumbs,
}: SEOHeadProps) {
    useEffect(() => {
        // Update meta tags
        updateSEO({ title, description, keywords, image, url, type, noindex });

        // Add breadcrumb schema if provided
        if (breadcrumbs && breadcrumbs.length > 0) {
            addStructuredData(generateBreadcrumbSchema(breadcrumbs), 'breadcrumb-schema');
        }

        // Cleanup on unmount
        return () => {
            removeStructuredData('breadcrumb-schema');
        };
    }, [title, description, keywords, image, url, type, noindex, breadcrumbs]);

    return null; // This component doesn't render anything
}

export default SEOHead;
