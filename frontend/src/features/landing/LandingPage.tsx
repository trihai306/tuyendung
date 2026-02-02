import { useState } from 'react';

// ==================== MAIN LANDING PAGE ====================
export function LandingPage() {
    return (
        <div className="min-h-screen bg-white">
            <LandingHeader />
            <main>
                <HeroSection />
                <FeaturesSection />
                <HowItWorksSection />
                <TestimonialsSection />
                <PricingSection />
                <CTASection />
            </main>
            <LandingFooter />
        </div>
    );
}

// ==================== HEADER ====================
function LandingHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <a href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">TD</span>
                        </div>
                        <span className="font-bold text-slate-800 text-lg hidden sm:block">Tuyển dụng thông minh</span>
                    </a>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-slate-600 hover:text-emerald-600 text-sm font-medium transition-colors">Tính năng</a>
                        <a href="#pricing" className="text-slate-600 hover:text-emerald-600 text-sm font-medium transition-colors">Bảng giá</a>
                        <a href="#testimonials" className="text-slate-600 hover:text-emerald-600 text-sm font-medium transition-colors">Khách hàng</a>
                    </nav>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        <a href="/login" className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">Đăng nhập</a>
                        <a href="/register" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-emerald-500/20">
                            Dùng thử miễn phí
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-slate-600 hover:text-slate-900"
                        aria-label="Toggle menu"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {mobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-slate-100">
                        <nav className="flex flex-col gap-4">
                            <a href="#features" className="text-slate-600 hover:text-emerald-600 text-sm font-medium">Tính năng</a>
                            <a href="#pricing" className="text-slate-600 hover:text-emerald-600 text-sm font-medium">Bảng giá</a>
                            <a href="#testimonials" className="text-slate-600 hover:text-emerald-600 text-sm font-medium">Khách hàng</a>
                            <hr className="border-slate-100" />
                            <a href="/login" className="text-slate-600 text-sm font-medium">Đăng nhập</a>
                            <a href="/register" className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg text-center">
                                Dùng thử miễn phí
                            </a>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}

// ==================== HERO SECTION ====================
function HeroSection() {
    return (
        <section className="pt-24 pb-16 sm:pt-32 sm:pb-24 bg-gradient-to-b from-slate-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-4xl mx-auto">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-sm font-medium mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Nền tảng #1 Việt Nam
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                        Tuyển dụng thông minh
                        <span className="block text-emerald-600">Tìm nhân tài, nhanh hơn 10x</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                        Nền tảng quản lý tuyển dụng toàn diện với AI. Từ đăng tin đến tuyển dụng - tất cả trong một nơi duy nhất.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                        <a
                            href="/register"
                            className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5"
                        >
                            Dùng thử miễn phí
                        </a>
                        <a
                            href="#demo"
                            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <PlayIcon className="w-5 h-5" />
                            Xem Demo
                        </a>
                    </div>

                    {/* Trust Badges */}
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <CheckIcon className="w-5 h-5 text-emerald-500" />
                            <span>Không cần thẻ tín dụng</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckIcon className="w-5 h-5 text-emerald-500" />
                            <span>Setup trong 2 phút</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckIcon className="w-5 h-5 text-emerald-500" />
                            <span>Hủy bất cứ lúc nào</span>
                        </div>
                    </div>
                </div>

                {/* Hero Image/Dashboard Preview */}
                <div className="mt-16 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none"></div>
                    <div className="bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-800">
                        <div className="bg-slate-800 px-4 py-3 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 min-h-[300px] sm:min-h-[400px] flex items-center justify-center">
                            <div className="text-center text-slate-400">
                                <DashboardIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p className="font-medium">Dashboard Preview</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Proof */}
                <div className="mt-16 text-center">
                    <p className="text-sm text-slate-500 mb-6">Được tin tưởng bởi 500+ doanh nghiệp</p>
                    <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 grayscale">
                        {['TechCorp', 'StartupX', 'MegaCo', 'VinaTech', 'FPT'].map((company) => (
                            <div key={company} className="px-6 py-2 bg-slate-100 rounded-lg text-slate-600 font-semibold">
                                {company}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

// ==================== FEATURES SECTION ====================
function FeaturesSection() {
    const features = [
        {
            icon: <BoardIcon className="w-6 h-6" />,
            title: 'Pipeline Kanban',
            description: 'Quản lý ứng viên trực quan với bảng Kanban kéo thả. Theo dõi từng bước trong quy trình tuyển dụng.',
            color: 'emerald',
        },
        {
            icon: <InboxIcon className="w-6 h-6" />,
            title: 'Omni-channel Inbox',
            description: 'Tích hợp Zalo, Facebook Messenger. Nhắn tin với ứng viên từ một giao diện duy nhất.',
            color: 'blue',
        },
        {
            icon: <SparklesIcon className="w-6 h-6" />,
            title: 'AI Automation',
            description: 'AI tự động sàng lọc CV, phân loại ứng viên và đề xuất những người phù hợp nhất.',
            color: 'amber',
        },
        {
            icon: <ShareIcon className="w-6 h-6" />,
            title: 'Smart Job Posting',
            description: 'Đăng tin lên nhiều nền tảng (LinkedIn, Facebook, JobsGO) chỉ với 1 click.',
            color: 'teal',
        },
        {
            icon: <UsersIcon className="w-6 h-6" />,
            title: 'Team Collaboration',
            description: 'Phân quyền chi tiết, comment, đánh giá ứng viên. Phối hợp team tuyển dụng hiệu quả.',
            color: 'indigo',
        },
        {
            icon: <ChartIcon className="w-6 h-6" />,
            title: 'Analytics Dashboard',
            description: 'Báo cáo chi tiết về nguồn ứng viên, tỷ lệ chuyển đổi, thời gian tuyển dụng.',
            color: 'rose',
        },
    ];

    const colorVariants: Record<string, { bg: string; icon: string; border: string }> = {
        emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100' },
        blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100' },
        amber: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-100' },
        teal: { bg: 'bg-teal-50', icon: 'text-teal-600', border: 'border-teal-100' },
        indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', border: 'border-indigo-100' },
        rose: { bg: 'bg-rose-50', icon: 'text-rose-600', border: 'border-rose-100' },
    };

    return (
        <section id="features" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wide">Tính năng</span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-4">
                        Mọi thứ bạn cần để tuyển dụng hiệu quả
                    </h2>
                    <p className="text-lg text-slate-600">
                        Từ quản lý ứng viên đến phân tích dữ liệu - tất cả trong một nền tảng duy nhất.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => {
                        const colors = colorVariants[feature.color];
                        return (
                            <div
                                key={index}
                                className={`p-6 rounded-2xl border ${colors.border} ${colors.bg} hover:shadow-lg transition-shadow`}
                            >
                                <div className={`w-12 h-12 rounded-xl ${colors.bg} ${colors.icon} flex items-center justify-center mb-4 border ${colors.border}`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

// ==================== HOW IT WORKS ====================
function HowItWorksSection() {
    const steps = [
        {
            step: '01',
            title: 'Đăng tin tuyển dụng',
            description: 'Tạo tin tuyển dụng chuyên nghiệp trong 2 phút. Đăng lên nhiều nền tảng cùng lúc.',
        },
        {
            step: '02',
            title: 'Quản lý ứng viên',
            description: 'Ứng viên tự động vào Pipeline. Kéo thả để di chuyển qua các giai đoạn.',
        },
        {
            step: '03',
            title: 'Tuyển dụng thành công',
            description: 'Đánh giá, phỏng vấn và đưa ra quyết định. Theo dõi mọi thứ trong một nơi.',
        },
    ];

    return (
        <section className="py-20 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wide">Quy trình</span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-4">
                        Bắt đầu chỉ trong 3 bước
                    </h2>
                    <p className="text-lg text-slate-600">
                        Quy trình đơn giản, hiệu quả - bắt đầu tuyển dụng ngay hôm nay.
                    </p>
                </div>

                {/* Steps */}
                <div className="grid md:grid-cols-3 gap-8 relative">
                    {/* Connection Line */}
                    <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-emerald-200 via-teal-200 to-emerald-200"></div>

                    {steps.map((item, index) => (
                        <div key={index} className="relative text-center">
                            <div className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-lg flex items-center justify-center text-emerald-600 font-bold text-xl mb-6 border border-emerald-100 relative z-10">
                                {item.step}
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
                            <p className="text-slate-600">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ==================== TESTIMONIALS ====================
function TestimonialsSection() {
    const testimonials = [
        {
            quote: 'Tiết kiệm 70% thời gian xử lý CV. Trước đây mất cả ngày để sàng lọc, giờ chỉ cần 1 giờ.',
            author: 'Nguyễn Văn An',
            role: 'HR Manager',
            company: 'TechCorp Vietnam',
            avatar: 'NV',
        },
        {
            quote: 'Tuyển được 50 nhân sự trong 1 tháng đầu tiên. Pipeline trực quan giúp team làm việc hiệu quả hơn.',
            author: 'Trần Thị Bình',
            role: 'CEO & Founder',
            company: 'StartupX',
            avatar: 'TT',
        },
        {
            quote: 'Giao diện trực quan, team HR không cần đào tạo. Inbox đa kênh là tính năng tuyệt vời nhất.',
            author: 'Lê Văn Cường',
            role: 'Trưởng phòng HR',
            company: 'MegaCo',
            avatar: 'LV',
        },
    ];

    return (
        <section id="testimonials" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wide">Khách hàng nói gì</span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-4">
                        Được tin tưởng bởi hàng trăm doanh nghiệp
                    </h2>
                </div>

                {/* Testimonials Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((item, index) => (
                        <div key={index} className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                            {/* Stars */}
                            <div className="flex gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <StarIcon key={star} className="w-5 h-5 text-amber-400" />
                                ))}
                            </div>

                            {/* Quote */}
                            <p className="text-slate-700 mb-6 leading-relaxed">"{item.quote}"</p>

                            {/* Author */}
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
                                    {item.avatar}
                                </div>
                                <div>
                                    <div className="font-semibold text-slate-900">{item.author}</div>
                                    <div className="text-sm text-slate-500">{item.role}, {item.company}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ==================== PRICING SECTION ====================
function PricingSection() {
    const plans = [
        {
            name: 'Starter',
            price: 'Miễn phí',
            period: '',
            description: 'Dành cho cá nhân và team nhỏ',
            features: [
                '1 tin tuyển dụng',
                '50 ứng viên/tháng',
                'Pipeline Kanban cơ bản',
                'Email support',
            ],
            cta: 'Bắt đầu miễn phí',
            popular: false,
        },
        {
            name: 'Professional',
            price: '499.000đ',
            period: '/tháng',
            description: 'Dành cho doanh nghiệp vừa và nhỏ',
            features: [
                'Không giới hạn tin tuyển dụng',
                '500 ứng viên/tháng',
                'Omni-channel Inbox (Zalo, FB)',
                'AI sàng lọc CV',
                'Team collaboration',
                'Analytics cơ bản',
                'Priority support',
            ],
            cta: 'Dùng thử 14 ngày',
            popular: true,
        },
        {
            name: 'Enterprise',
            price: 'Liên hệ',
            period: '',
            description: 'Dành cho doanh nghiệp lớn',
            features: [
                'Tất cả tính năng Professional',
                'Không giới hạn ứng viên',
                'API integration',
                'Custom workflows',
                'SLA 99.9%',
                'Dedicated account manager',
                'On-premise deployment',
            ],
            cta: 'Liên hệ sales',
            popular: false,
        },
    ];

    return (
        <section id="pricing" className="py-20 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wide">Bảng giá</span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-4">
                        Chọn gói phù hợp với doanh nghiệp
                    </h2>
                    <p className="text-lg text-slate-600">
                        Bắt đầu miễn phí, nâng cấp khi cần. Không có chi phí ẩn.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative rounded-2xl p-8 ${plan.popular
                                    ? 'bg-white border-2 border-emerald-500 shadow-xl shadow-emerald-500/10'
                                    : 'bg-white border border-slate-200'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-600 text-white text-sm font-medium rounded-full">
                                    Phổ biến nhất
                                </div>
                            )}

                            <div className="text-center mb-6">
                                <h3 className="text-xl font-semibold text-slate-900 mb-2">{plan.name}</h3>
                                <p className="text-slate-500 text-sm mb-4">{plan.description}</p>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                                    {plan.period && <span className="text-slate-500">{plan.period}</span>}
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, fIndex) => (
                                    <li key={fIndex} className="flex items-start gap-3 text-slate-600">
                                        <CheckIcon className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={`w-full py-3 rounded-xl font-semibold transition-colors ${plan.popular
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                    }`}
                            >
                                {plan.cta}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ==================== CTA SECTION ====================
function CTASection() {
    return (
        <section className="py-20 bg-gradient-to-br from-emerald-600 to-teal-600">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                    Sẵn sàng nâng cấp quy trình tuyển dụng?
                </h2>
                <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
                    Tham gia cùng hàng trăm doanh nghiệp đang sử dụng Tuyển dụng thông minh. Bắt đầu miễn phí ngay hôm nay.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                    <a
                        href="/register"
                        className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-emerald-600 font-semibold rounded-xl transition-colors shadow-lg"
                    >
                        Bắt đầu dùng thử miễn phí
                    </a>
                    <a
                        href="/contact"
                        className="w-full sm:w-auto px-8 py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl transition-colors border border-emerald-500"
                    >
                        Liên hệ tư vấn
                    </a>
                </div>

                <p className="text-emerald-200 text-sm">
                    Không cần thẻ tín dụng • Hủy bất cứ lúc nào
                </p>
            </div>
        </section>
    );
}

// ==================== FOOTER ====================
function LandingFooter() {
    return (
        <footer className="bg-slate-900 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">TD</span>
                            </div>
                            <span className="font-bold text-white text-lg">Tuyển dụng thông minh</span>
                        </div>
                        <p className="text-slate-400 text-sm mb-4">
                            Nền tảng quản lý tuyển dụng toàn diện với AI. Giúp doanh nghiệp tìm nhân tài nhanh hơn.
                        </p>
                        <div className="flex gap-3">
                            <a href="#" className="w-9 h-9 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                                <FacebookIcon className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-9 h-9 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                                <LinkedInIcon className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Sản phẩm</h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#features" className="text-slate-400 hover:text-white transition-colors">Tính năng</a></li>
                            <li><a href="#pricing" className="text-slate-400 hover:text-white transition-colors">Bảng giá</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Tích hợp</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">API</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Công ty</h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Về chúng tôi</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Blog</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Tuyển dụng</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Liên hệ</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Liên hệ</h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li className="flex items-center gap-2">
                                <MailIcon className="w-4 h-4" />
                                support@tuyendung.ai
                            </li>
                            <li className="flex items-center gap-2">
                                <PhoneIcon className="w-4 h-4" />
                                1900 xxxx xx
                            </li>
                            <li className="flex items-start gap-2">
                                <LocationIcon className="w-4 h-4 mt-0.5" />
                                Tầng 10, Toà nhà ABC, Quận 1, TP.HCM
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-slate-500 text-sm">
                        © 2026 Tuyển dụng thông minh. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm">
                        <a href="#" className="text-slate-500 hover:text-white transition-colors">Điều khoản</a>
                        <a href="#" className="text-slate-500 hover:text-white transition-colors">Bảo mật</a>
                        <a href="#" className="text-slate-500 hover:text-white transition-colors">Cookie</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// ==================== ICONS ====================
const PlayIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
);

const DashboardIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
);

const BoardIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
);

const InboxIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
);

const SparklesIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
);

const ShareIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
);

const ChartIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
);

const StarIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
);

const MailIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
);

const PhoneIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
);

const LocationIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);

export default LandingPage;
