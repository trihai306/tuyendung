import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { seatApi, type SeatPricing } from '../../services/seatApi';
import { useAppSelector } from '../../app/hooks';

const SEAT_OPTIONS = [1, 2, 3, 5, 10, 20];

const PricingPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const [pricing, setPricing] = useState<SeatPricing | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSeats, setSelectedSeats] = useState(1);
    const [customSeats, setCustomSeats] = useState('');
    const [isCustom, setIsCustom] = useState(false);
    const [purchaseLoading, setPurchaseLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchPricing = async () => {
            try {
                const data = await seatApi.getPricing();
                setPricing(data);
            } catch (err) {
                console.error('Failed to fetch pricing', err);
                // Fallback pricing
                setPricing({
                    price_per_seat: 500000,
                    formatted_price: '500.000 ₫',
                    duration_days: 30,
                    features: [
                        'Tin nhắn không giới hạn',
                        'Đăng bài tự động Facebook/Zalo',
                        'Lên lịch đăng bài',
                        'AI tự động trả lời',
                        'Thống kê bằng AI',
                    ],
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchPricing();
    }, []);

    const getActiveSeats = () => {
        if (isCustom && customSeats) {
            return parseInt(customSeats) || 1;
        }
        return selectedSeats;
    };

    const getTotalPrice = () => {
        if (!pricing) return 0;
        return pricing.price_per_seat * getActiveSeats();
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
    };

    const handleSeatSelect = (seats: number) => {
        setSelectedSeats(seats);
        setIsCustom(false);
        setCustomSeats('');
    };

    const handleCustomClick = () => {
        setIsCustom(true);
    };

    const handlePurchase = async () => {
        if (!isAuthenticated) {
            navigate('/register?seats=' + getActiveSeats());
            return;
        }

        setPurchaseLoading(true);
        setMessage(null);

        try {
            const result = await seatApi.purchaseSeats(getActiveSeats());
            setMessage({
                type: 'success',
                text: result.message,
            });

            if (!result.requires_payment) {
                setTimeout(() => navigate('/settings'), 2000);
            }
        } catch (err: unknown) {
            const errorMsg = err instanceof Error && 'response' in err
                ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                : 'Có lỗi xảy ra. Vui lòng thử lại.';
            setMessage({
                type: 'error',
                text: errorMsg || 'Có lỗi xảy ra. Vui lòng thử lại.',
            });
        } finally {
            setPurchaseLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
            {/* Header */}
            <header className="px-8 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">R</span>
                        </div>
                        <span className="font-semibold text-gray-900">TDTV</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <Link
                                to="/inbox"
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                            >
                                Vào Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-600 hover:text-gray-900">
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                >
                                    Dùng thử miễn phí
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="py-16 px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Giải pháp tuyển dụng thông minh
                    </h1>
                    <p className="text-xl text-gray-600 mb-4">
                        Định giá theo nhân viên - Linh hoạt & Tiết kiệm
                    </p>
                    <p className="text-gray-500">
                        Mua số lượng phù hợp với quy mô doanh nghiệp của bạn
                    </p>
                </div>
            </section>

            {/* Pricing Card */}
            <section className="pb-16 px-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        {/* Price Header */}
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-8 text-center text-white">
                            <div className="text-sm font-medium mb-2 opacity-90">Giá mỗi nhân viên</div>
                            <div className="text-5xl font-bold mb-2">
                                {pricing?.formatted_price || '500.000 ₫'}
                            </div>
                            <div className="opacity-80">/nhân viên/tháng</div>
                        </div>

                        {/* Features */}
                        <div className="p-8">
                            <h3 className="font-semibold text-gray-900 mb-4">Mỗi nhân viên được:</h3>
                            <ul className="space-y-3 mb-8">
                                {pricing?.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-3">
                                        <span className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                                            ✓
                                        </span>
                                        <span className="text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Seat Selector */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Chọn số nhân viên:
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {SEAT_OPTIONS.map((seats) => (
                                        <button
                                            key={seats}
                                            onClick={() => handleSeatSelect(seats)}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${!isCustom && selectedSeats === seats
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {seats}
                                        </button>
                                    ))}
                                    <button
                                        onClick={handleCustomClick}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${isCustom
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        Tùy chọn
                                    </button>
                                </div>

                                {isCustom && (
                                    <div className="mt-3">
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={customSeats}
                                            onChange={(e) => setCustomSeats(e.target.value)}
                                            placeholder="Nhập số nhân viên"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Total */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-gray-600">
                                            {getActiveSeats()} nhân viên × {pricing?.formatted_price}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Thời hạn: {pricing?.duration_days || 30} ngày
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-emerald-600">
                                            {formatPrice(getTotalPrice())}
                                        </div>
                                        <div className="text-sm text-gray-500">/tháng</div>
                                    </div>
                                </div>
                            </div>

                            {/* Message */}
                            {message && (
                                <div className={`p-4 rounded-xl mb-6 ${message.type === 'success'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                    {message.text}
                                </div>
                            )}

                            {/* CTA */}
                            <button
                                onClick={handlePurchase}
                                disabled={purchaseLoading}
                                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-colors disabled:opacity-50"
                            >
                                {purchaseLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Đang xử lý...
                                    </span>
                                ) : isAuthenticated ? (
                                    `Mua ${getActiveSeats()} seats - ${formatPrice(getTotalPrice())}`
                                ) : (
                                    'Dùng thử 7 ngày miễn phí'
                                )}
                            </button>

                            <p className="text-center text-sm text-gray-500 mt-4">
                                Không cần thẻ tín dụng cho bản dùng thử
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-16 px-8 bg-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Tại sao chọn TDTV?
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">💬</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Tin nhắn không giới hạn</h3>
                            <p className="text-gray-600">
                                Quản lý mọi cuộc trò chuyện từ Zalo OA và Facebook trong một inbox duy nhất
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">📝</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Đăng bài tự động</h3>
                            <p className="text-gray-600">
                                Tự động đăng tin tuyển dụng lên nhóm Facebook và Zalo theo lịch
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">🤖</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">AI thông minh</h3>
                            <p className="text-gray-600">
                                AI tự động trả lời ứng viên, sàng lọc CV và thống kê hiệu quả
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-16 px-8">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Câu hỏi thường gặp
                    </h2>
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h3 className="font-semibold text-gray-900 mb-2">Seat là gì?</h3>
                            <p className="text-gray-600">
                                Mỗi seat cho phép một nhân viên sử dụng hệ thống với đầy đủ tính năng.
                                Bạn có thể gán seat cho bất kỳ nhân viên nào trong công ty.
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h3 className="font-semibold text-gray-900 mb-2">Tôi có thể mua thêm seat sau không?</h3>
                            <p className="text-gray-600">
                                Có, bạn có thể mua thêm seat bất cứ lúc nào trong phần Cài đặt → Gói dịch vụ.
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h3 className="font-semibold text-gray-900 mb-2">Thanh toán như thế nào?</h3>
                            <p className="text-gray-600">
                                Chúng tôi hỗ trợ thanh toán qua chuyển khoản ngân hàng, VNPAY và Momo.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 px-8">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">R</span>
                        </div>
                        <span className="font-semibold">TDTV</span>
                    </div>
                    <p className="text-gray-400">
                        © 2026 TDTV. Giải pháp tuyển dụng thông minh cho doanh nghiệp Việt Nam.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default PricingPage;
