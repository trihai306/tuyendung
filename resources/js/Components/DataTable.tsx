import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import EmptyState from '@/Components/EmptyState';

export interface Column<T> {
    key: string;
    label: string;
    render?: (item: T) => React.ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    emptyMessage?: string;
    emptyDescription?: string;
}

export default function DataTable<T extends { id: number }>({
    columns,
    data,
    emptyMessage = 'Không có dữ liệu',
    emptyDescription,
}: DataTableProps<T>) {
    if (data.length === 0) {
        return <EmptyState title={emptyMessage} description={emptyDescription} />;
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((col) => (
                            <TableHead key={col.key} className={col.className}>
                                {col.label}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item) => (
                        <TableRow key={item.id}>
                            {columns.map((col) => (
                                <TableCell key={col.key} className={col.className}>
                                    {col.render
                                        ? col.render(item)
                                        : (item as Record<string, unknown>)[col.key] as React.ReactNode}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
