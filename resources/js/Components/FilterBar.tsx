import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Search, X } from 'lucide-react';

interface FilterOption {
    value: string;
    label: string;
}

interface FilterConfig {
    key: string;
    label: string;
    type: 'text' | 'select';
    placeholder?: string;
    options?: FilterOption[];
}

interface FilterBarProps {
    filters: Record<string, string>;
    onFilterChange: (key: string, value: string) => void;
    onApply: () => void;
    onReset: () => void;
    config: FilterConfig[];
}

export default function FilterBar({ filters, onFilterChange, onApply, onReset, config }: FilterBarProps) {
    return (
        <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4">
            {config.map((filter) => (
                <div key={filter.key} className="flex-1 min-w-[180px]">
                    <label className="mb-1.5 block text-sm font-medium">{filter.label}</label>
                    {filter.type === 'text' ? (
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={filter.placeholder}
                                value={filters[filter.key] || ''}
                                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && onApply()}
                                className="pl-9"
                            />
                        </div>
                    ) : (
                        <Select
                            value={filters[filter.key] || ''}
                            onValueChange={(value) => onFilterChange(filter.key, value === '_all' ? '' : value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={filter.placeholder || 'Tất cả'} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="_all">Tất cả</SelectItem>
                                {filter.options?.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            ))}
            <div className="flex gap-2">
                <Button onClick={onApply} size="sm">
                    <Search className="mr-1 h-4 w-4" />
                    Tìm kiếm
                </Button>
                <Button variant="outline" size="sm" onClick={onReset}>
                    <X className="mr-1 h-4 w-4" />
                    Xóa lọc
                </Button>
            </div>
        </div>
    );
}
