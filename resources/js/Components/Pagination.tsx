import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationMeta } from '@/types';

interface PaginationProps {
    meta: PaginationMeta;
}

export default function Pagination({ meta }: PaginationProps) {
    if (!meta || meta.last_page <= 1) return null;

    return (
        <div className="flex items-center justify-between px-2 py-4">
            <p className="text-sm text-muted-foreground">
                Hiển thị {meta.from} - {meta.to} / {meta.total} kết quả
            </p>
            <div className="flex items-center gap-1">
                {meta.links.map((link, index) => {
                    if (index === 0) {
                        return (
                            <Button
                                key="prev"
                                variant="outline"
                                size="sm"
                                disabled={!link.url}
                                asChild={!!link.url}
                            >
                                {link.url ? (
                                    <Link href={link.url} preserveState preserveScroll>
                                        <ChevronLeft className="h-4 w-4" />
                                    </Link>
                                ) : (
                                    <span><ChevronLeft className="h-4 w-4" /></span>
                                )}
                            </Button>
                        );
                    }
                    if (index === meta.links.length - 1) {
                        return (
                            <Button
                                key="next"
                                variant="outline"
                                size="sm"
                                disabled={!link.url}
                                asChild={!!link.url}
                            >
                                {link.url ? (
                                    <Link href={link.url} preserveState preserveScroll>
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                ) : (
                                    <span><ChevronRight className="h-4 w-4" /></span>
                                )}
                            </Button>
                        );
                    }
                    return (
                        <Button
                            key={index}
                            variant={link.active ? 'default' : 'outline'}
                            size="sm"
                            asChild={!!link.url}
                            disabled={!link.url}
                        >
                            {link.url ? (
                                <Link
                                    href={link.url}
                                    preserveState
                                    preserveScroll
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                            )}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
