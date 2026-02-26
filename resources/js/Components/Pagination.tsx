import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationData {
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    per_page: number;
    links: PaginationLink[];
    first_page_url?: string;
    last_page_url?: string;
    next_page_url?: string | null;
    prev_page_url?: string | null;
}

interface PaginationProps {
    /** Accepts either flat Laravel pagination or nested meta */
    data: PaginationData;
}

export default function Pagination({ data }: PaginationProps) {
    if (!data || data.total === 0) return null;

    const isSinglePage = data.last_page <= 1;

    const currentPage = data.current_page;
    const lastPage = data.last_page;

    // Build smart page range: show first, last, and nearby pages with ellipsis
    const getPageNumbers = (): (number | 'ellipsis')[] => {
        const pages: (number | 'ellipsis')[] = [];
        const delta = 1;

        if (lastPage <= 7) {
            for (let i = 1; i <= lastPage; i++) pages.push(i);
            return pages;
        }

        pages.push(1);

        const rangeStart = Math.max(2, currentPage - delta);
        const rangeEnd = Math.min(lastPage - 1, currentPage + delta);

        if (rangeStart > 2) pages.push('ellipsis');

        for (let i = rangeStart; i <= rangeEnd; i++) {
            pages.push(i);
        }

        if (rangeEnd < lastPage - 1) pages.push('ellipsis');

        pages.push(lastPage);

        return pages;
    };

    const findLinkUrl = (page: number): string | null => {
        const link = data.links.find(l => l.label === String(page));
        return link?.url ?? null;
    };

    const prevUrl = data.links[0]?.url ?? null;
    const nextUrl = data.links[data.links.length - 1]?.url ?? null;
    const firstUrl = data.first_page_url ?? findLinkUrl(1);
    const lastUrl = data.last_page_url ?? findLinkUrl(lastPage);
    const pageNumbers = getPageNumbers();

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-4">
            {/* Results info */}
            <p className="text-xs text-muted-foreground order-2 sm:order-1">
                Hien thi <span className="font-semibold text-foreground">{data.from}</span>
                {' - '}
                <span className="font-semibold text-foreground">{data.to}</span>
                {' / '}
                <span className="font-semibold text-foreground">{data.total}</span> ket qua
            </p>

            {/* Page controls - only show when multiple pages */}
            {!isSinglePage && (
                <div className="flex items-center gap-1 order-1 sm:order-2">
                    {/* First page */}
                    <PaginationButton url={firstUrl ?? null} disabled={currentPage === 1} ariaLabel="Trang dau">
                        <ChevronsLeft className="h-3.5 w-3.5" />
                    </PaginationButton>

                    {/* Previous */}
                    <PaginationButton url={prevUrl} disabled={currentPage === 1} ariaLabel="Trang truoc">
                        <ChevronLeft className="h-3.5 w-3.5" />
                    </PaginationButton>

                    {/* Page numbers */}
                    <div className="flex items-center gap-0.5 mx-1">
                        {pageNumbers.map((page, i) => {
                            if (page === 'ellipsis') {
                                return (
                                    <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground">
                                        ...
                                    </span>
                                );
                            }

                            const url = findLinkUrl(page);
                            const isActive = page === currentPage;

                            return (
                                <Button
                                    key={page}
                                    variant={isActive ? 'default' : 'ghost'}
                                    size="sm"
                                    className={`h-8 w-8 p-0 text-xs font-medium ${isActive
                                        ? 'bg-primary text-primary-foreground shadow-sm pointer-events-none'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                        }`}
                                    asChild={!isActive && !!url}
                                    disabled={!url && !isActive}
                                >
                                    {!isActive && url ? (
                                        <Link href={url} preserveState preserveScroll>
                                            {page}
                                        </Link>
                                    ) : (
                                        <span>{page}</span>
                                    )}
                                </Button>
                            );
                        })}
                    </div>

                    {/* Next */}
                    <PaginationButton url={nextUrl} disabled={currentPage === lastPage} ariaLabel="Trang sau">
                        <ChevronRight className="h-3.5 w-3.5" />
                    </PaginationButton>

                    {/* Last page */}
                    <PaginationButton url={lastUrl ?? null} disabled={currentPage === lastPage} ariaLabel="Trang cuoi">
                        <ChevronsRight className="h-3.5 w-3.5" />
                    </PaginationButton>
                </div>
            )}
        </div>
    );
}

function PaginationButton({
    url,
    disabled,
    ariaLabel,
    children,
}: {
    url: string | null;
    disabled: boolean;
    ariaLabel: string;
    children: React.ReactNode;
}) {
    return (
        <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 border-border/60"
            disabled={disabled || !url}
            asChild={!disabled && !!url}
            aria-label={ariaLabel}
        >
            {!disabled && url ? (
                <Link href={url} preserveState preserveScroll>
                    {children}
                </Link>
            ) : (
                <span>{children}</span>
            )}
        </Button>
    );
}
