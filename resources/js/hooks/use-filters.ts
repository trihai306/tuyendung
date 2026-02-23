import { router } from '@inertiajs/react';
import { useCallback, useState } from 'react';

interface UseFiltersOptions {
    routeName: string;
    initialFilters?: Record<string, string>;
}

export function useFilters({ routeName, initialFilters = {} }: UseFiltersOptions) {
    const [filters, setFilters] = useState<Record<string, string>>(initialFilters);

    const updateFilter = useCallback(
        (key: string, value: string) => {
            const newFilters = { ...filters, [key]: value };
            if (!value) {
                delete newFilters[key];
            }
            setFilters(newFilters);
        },
        [filters]
    );

    const applyFilters = useCallback(() => {
        router.get(route(routeName), filters, {
            preserveState: true,
            preserveScroll: true,
        });
    }, [filters, routeName]);

    const resetFilters = useCallback(() => {
        setFilters({});
        router.get(route(routeName), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    }, [routeName]);

    return { filters, updateFilter, applyFilters, resetFilters, setFilters };
}
