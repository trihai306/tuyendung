import PublicLayout from '@/Layouts/PublicLayout';
import { Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import Pagination from '@/Components/Pagination';
import { formatCurrency } from '@/lib/utils';
import {
    Search,
    MapPin,
    DollarSign,
    Maximize2,
    Home,
    Star,
    Eye,
    SlidersHorizontal,
    X,
    ChevronRight,
    ArrowRight,
    Shield,
    Zap,
    TrendingUp,
    Wifi,
} from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Room, PaginationMeta } from '@/types';

interface LaravelPagination<T> extends PaginationMeta {
    data: T[];
}

interface RoomsIndexProps {
    rooms: LaravelPagination<Room>;
    filters: Record<string, string> | unknown[];
}

const roomTypeLabels: Record<string, string> = {
    single: 'Phong don',
    shared: 'Phong ghep',
    apartment: 'Can ho',
    mini_apartment: 'Chung cu mini',
};

const roomTypeColors: Record<string, string> = {
    single: 'bg-blue-500/80 text-white',
    shared: 'bg-violet-500/80 text-white',
    apartment: 'bg-emerald-500/80 text-white',
    mini_apartment: 'bg-amber-500/80 text-white',
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
};

const staggerItem = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
};

export default function RoomsIndex({ rooms, filters: initialFilters }: RoomsIndexProps) {
    const safeInitialFilters = (initialFilters && typeof initialFilters === 'object' && !Array.isArray(initialFilters))
        ? initialFilters
        : {};
    const [filters, setFilters] = useState<Record<string, string>>(safeInitialFilters);
    const [showFilters, setShowFilters] = useState(false);

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleApply = () => {
        const params: Record<string, string> = {};
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params[key] = value;
        });
        router.get('/phong-tro', params, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setFilters({});
        router.get('/phong-tro', {}, { preserveState: true, preserveScroll: true });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleApply();
    };

    const activeFilterCount = Object.values(filters).filter(Boolean).length;

    return (
        <PublicLayout title="Phòng trọ">
            {/* Hero Banner */}
            <section className="relative overflow-hidden bg-stone-950 pt-24 pb-12 md:pt-28 md:pb-16">
                {/* Ambient */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-emerald-500/[0.06] rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] bg-teal-500/[0.04] rounded-full blur-[100px]" />
                </div>

                <div className="container relative z-10">
                    {/* Breadcrumb */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="flex items-center gap-1.5 text-xs text-stone-500 mb-6"
                    >
                        <Link href="/" className="hover:text-stone-300 transition-colors">Trang chủ</Link>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-stone-300">Phòng trọ</span>
                    </motion.div>

                    <div className="max-w-2xl">
                        <motion.h1
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.05 }}
                            className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4 leading-[1.1]"
                        >
                            Tim{' '}
                            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                                phòng trọ
                            </span>{' '}
                            phù hợp
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-stone-400 text-base md:text-lg leading-relaxed mb-8"
                        >
                            Phòng trọ chất lượng, giá tốt từ các chủ nhà uy tín trên toàn quốc.
                        </motion.p>

                        {/* Search Bar */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                            className="flex gap-2"
                        >
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-stone-500" />
                                <Input
                                    placeholder="Tim theo khu vuc, loai phong, gia..."
                                    value={filters.search || ''}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="h-12 pl-11 bg-white/[0.06] border-white/[0.08] text-white placeholder:text-stone-500 rounded-xl focus:bg-white/[0.1] focus:border-emerald-500/30 transition-all"
                                />
                            </div>
                            <Button
                                onClick={handleApply}
                                className="h-12 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/20"
                            >
                                <Search className="h-4 w-4 mr-2" />
                                Tìm kiếm
                            </Button>
                        </motion.div>

                        {/* Quick stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="flex items-center gap-5 mt-6 text-xs text-stone-500"
                        >
                            <div className="flex items-center gap-1.5">
                                <Home className="h-3.5 w-3.5 text-emerald-400" />
                                <span>{rooms.total} phòng trọ</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Shield className="h-3.5 w-3.5 text-blue-400" />
                                <span>Xac thuc chu nha</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Zap className="h-3.5 w-3.5 text-amber-400" />
                                <span>Liên hệ trực tiếp</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="bg-stone-50 dark:bg-stone-950 min-h-[60vh]">
                <div className="container py-8">
                    {/* Filter Toggle + Active Filters */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                                className="rounded-lg gap-2"
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                Bo loc
                                {activeFilterCount > 0 && (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </Button>

                            {activeFilterCount > 0 && (
                                <button
                                    onClick={handleReset}
                                    className="text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 flex items-center gap-1 transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                    Xoa loc
                                </button>
                            )}
                        </div>

                        <p className="text-sm text-stone-500 hidden sm:block">
                            Hiển thị <span className="font-semibold text-stone-700 dark:text-stone-300">{rooms.data.length}</span> / {rooms.total} kết quả
                        </p>
                    </div>

                    {/* Expandable Filters */}
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-sm"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5">Thành phố</label>
                                    <Input
                                        placeholder="VD: Ha Noi, HCM..."
                                        value={filters.city || ''}
                                        onChange={(e) => handleFilterChange('city', e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="h-10 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5">Loai phong</label>
                                    <Select
                                        value={filters.room_type || ''}
                                        onValueChange={(v) => handleFilterChange('room_type', v === '_all' ? '' : v)}
                                    >
                                        <SelectTrigger className="h-10 rounded-lg">
                                            <SelectValue placeholder="Tất cả" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="_all">Tất cả</SelectItem>
                                            <SelectItem value="single">Phong don</SelectItem>
                                            <SelectItem value="shared">Phong ghep</SelectItem>
                                            <SelectItem value="apartment">Can ho</SelectItem>
                                            <SelectItem value="mini_apartment">Chung cu mini</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5">Gia tu</label>
                                    <Input
                                        type="number"
                                        placeholder="VD: 1,000,000"
                                        value={filters.price_min || ''}
                                        onChange={(e) => handleFilterChange('price_min', e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="h-10 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5">Gia den</label>
                                    <Input
                                        type="number"
                                        placeholder="VD: 5,000,000"
                                        value={filters.price_max || ''}
                                        onChange={(e) => handleFilterChange('price_max', e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="h-10 rounded-lg"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <div className="flex gap-2 w-full">
                                        <Button variant="ghost" size="sm" onClick={handleReset} className="flex-1">
                                            <X className="h-3.5 w-3.5 mr-1" />Xoá</Button>
                                        <Button size="sm" onClick={handleApply} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white">
                                            <Search className="h-3.5 w-3.5 mr-1" />Lọc</Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Room Cards Grid */}
                    {rooms.data.length > 0 ? (
                        <>
                            <motion.div
                                variants={staggerContainer}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
                            >
                                {rooms.data.map((room) => (
                                    <motion.div key={room.id} variants={staggerItem}>
                                        <Link href={`/phong-tro/${room.slug}`} className="block group">
                                            <div className="relative h-full rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-stone-200/50 dark:hover:shadow-stone-900/50 hover:border-emerald-500/20 hover:-translate-y-0.5">
                                                {/* Image */}
                                                <div className="relative aspect-[16/10] overflow-hidden">
                                                    {room.images && room.images.length > 0 ? (
                                                        <img
                                                            src={room.images[0]}
                                                            alt={room.title}
                                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full bg-gradient-to-br from-emerald-50 to-stone-100 dark:from-stone-800 dark:to-stone-900 flex items-center justify-center">
                                                            <Home className="h-14 w-14 text-stone-300 dark:text-stone-600" />
                                                        </div>
                                                    )}
                                                    {/* Overlay gradient */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                                    {/* Price badge */}
                                                    <div className="absolute top-3 right-3 bg-emerald-500/90 backdrop-blur-sm text-white rounded-xl px-3 py-1.5 text-sm font-bold shadow-lg shadow-emerald-500/20">
                                                        {formatCurrency(room.price)}/tháng
                                                    </div>

                                                    {/* Room type badge */}
                                                    <div className="absolute bottom-3 left-3">
                                                        <Badge className={`text-[10px] font-semibold px-2 py-0.5 border-0 backdrop-blur-sm ${roomTypeColors[room.room_type] || 'bg-stone-500/80 text-white'}`}>
                                                            {roomTypeLabels[room.room_type] || room.room_type}
                                                        </Badge>
                                                    </div>

                                                    {/* Image count */}
                                                    {room.images && room.images.length > 1 && (
                                                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white rounded-lg px-2 py-1 text-[10px] font-medium">
                                                            {room.images.length} anh
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="p-5">
                                                    <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 line-clamp-2 mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                                                        {room.title}
                                                    </h3>

                                                    <div className="space-y-2 mb-4">
                                                        {room.city && (
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10">
                                                                    <MapPin className="h-3.5 w-3.5 text-blue-500" />
                                                                </div>
                                                                <span className="text-sm text-stone-600 dark:text-stone-400">
                                                                    {room.district ? `${room.district}, ${room.city}` : room.city}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {room.area_sqm && (
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-500/10">
                                                                    <Maximize2 className="h-3.5 w-3.5 text-violet-500" />
                                                                </div>
                                                                <span className="text-sm text-stone-600 dark:text-stone-400">
                                                                    {room.area_sqm} m2
                                                                </span>
                                                            </div>
                                                        )}
                                                        {room.amenities && room.amenities.length > 0 && (
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10">
                                                                    <Wifi className="h-3.5 w-3.5 text-amber-500" />
                                                                </div>
                                                                <span className="text-sm text-stone-600 dark:text-stone-400">
                                                                    {room.amenities.length} tien ich
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Bottom row */}
                                                    <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800">
                                                        <div className="flex items-center gap-3 text-[11px] text-stone-400">
                                                            {room.average_rating && (
                                                                <div className="flex items-center gap-1">
                                                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                                                    <span className="font-medium text-stone-600 dark:text-stone-300">{room.average_rating}</span>
                                                                    {room.reviews_count && (
                                                                        <span>({room.reviews_count})</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-1">
                                                                <Eye className="h-3 w-3" />
                                                                <span>{room.views_count}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <span>Xem chi tiết</span>
                                                            <ArrowRight className="h-3 w-3" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* Pagination */}
                            <div className="mt-8">
                                <Pagination data={rooms} />
                            </div>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-20 text-center"
                        >
                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-stone-100 dark:bg-stone-800 mb-5">
                                <Home className="h-10 w-10 text-stone-300 dark:text-stone-600" />
                            </div>
                            <h3 className="text-lg font-bold text-stone-700 dark:text-stone-300 mb-2">
                                Không tìm thấy phòng trọ
                            </h3>
                            <p className="text-sm text-stone-500 mb-6 max-w-sm">
                                Thử thay đổi bộ lọc để tìm kiếm kết quả phù hợp hon.
                            </p>
                            <Button variant="outline" onClick={handleReset} className="rounded-lg">
                                <X className="h-4 w-4 mr-1.5" />
                                Xoa bộ lọc
                            </Button>
                        </motion.div>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}
