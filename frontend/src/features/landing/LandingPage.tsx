import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// ==================== MAIN LANDING PAGE ====================
export function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
            <LandingHeader />
            <main>
                <HeroSection />
                <LogoCloud />
                <AIWorkflowSection />
                <FeaturesSection />
                <StatsSection />
                <TestimonialsSection />
                <PricingSection />
                <CTASection />
            </main>
            <LandingFooter />
        </div>
    );
}

// ==================== ANIMATED COUNTER ====================
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                let start = 0;
                const step = Math.ceil(target / 60);
                const timer = setInterval(() => {
                    start += step;
                    if (start >= target) { setCount(target); clearInterval(timer); }
                    else setCount(start);
                }, 20);
                observer.disconnect();
            }
        }, { threshold: 0.5 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target]);
    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ==================== HEADER ====================
function LandingHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const token = localStorage.getItem('token');
    const isAuthenticated = !!token;

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/90 backdrop-blur-xl border-b border-white/5' : ''}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    <a href="/" className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <span className="text-white font-bold text-sm">V</span>
                        </div>
                        <span className="font-bold text-white text-xl tracking-tight">Viecly<span className="text-emerald-400">.ai</span></span>
                    </a>
                    <nav className="hidden md:flex items-center gap-8">
                        {[['Giải pháp', '#features'], ['Cách hoạt động', '#workflow'], ['Bảng giá', '#pricing'], ['Khách hàng', '#testimonials']].map(([label, href]) => (
                            <a key={href} href={href} className="text-slate-400 hover:text-white text-sm font-medium transition-colors">{label}</a>
                        ))}
                    </nav>
                    <div className="hidden md:flex items-center gap-3">
                        {isAuthenticated ? (
                            <Link to="/employer/dashboard" className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25">Dashboard</Link>
                        ) : (
                            <>
                                <Link to="/login" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Đăng nhập</Link>
                                <Link to="/register" className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25">Dùng thử miễn phí</Link>
                            </>
                        )}
                    </div>
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-400" aria-label="Menu">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {mobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                        </svg>
                    </button>
                </div>
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-white/5">
                        <nav className="flex flex-col gap-4">
                            {[['Giải pháp', '#features'], ['Cách hoạt động', '#workflow'], ['Bảng giá', '#pricing']].map(([l, h]) => (
                                <a key={h} href={h} className="text-slate-400 text-sm font-medium">{l}</a>
                            ))}
                            <Link to={isAuthenticated ? "/employer/dashboard" : "/register"} className="px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg text-center">{isAuthenticated ? 'Dashboard' : 'Dùng thử miễn phí'}</Link>
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
        <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
                <div className="absolute top-40 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-8 backdrop-blur-sm">
                        <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" /></span>
                        AI Recruitment Automation Platform
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
                        Tự động tìm kiếm &
                        <span className="block bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">tư vấn ứng viên bằng AI</span>
                    </h1>

                    <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Viecly tự động tìm ứng viên phù hợp trên mọi nền tảng, chatbot AI nhắn tin tư vấn 24/7, và quản lý toàn bộ quy trình tuyển dụng — giảm <span className="text-white font-semibold">80% thời gian</span> tuyển dụng.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                        <Link to="/register" className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-2xl transition-all shadow-2xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-2">
                            Bắt đầu miễn phí
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                        </Link>
                        <a href="#workflow" className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-2xl border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Xem cách hoạt động
                        </a>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
                        {['Không cần thẻ tín dụng', 'Setup trong 2 phút', 'Hỗ trợ 24/7'].map(t => (
                            <div key={t} className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                <span>{t}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dashboard Preview */}
                <div className="mt-16 lg:mt-20 relative">
                    <div className="absolute -inset-4 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none" />
                    <div className="bg-slate-900 rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
                        <div className="bg-slate-800/50 px-4 py-3 flex items-center gap-2 border-b border-white/5">
                            <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/80" /><div className="w-3 h-3 rounded-full bg-amber-500/80" /><div className="w-3 h-3 rounded-full bg-emerald-500/80" /></div>
                            <div className="flex-1 flex justify-center"><div className="px-4 py-1 bg-slate-700/50 rounded-lg text-xs text-slate-400">app.viecly.ai</div></div>
                        </div>
                        <div className="p-6 lg:p-8 bg-gradient-to-br from-slate-800/50 to-slate-900 min-h-[300px] lg:min-h-[420px]">
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                {[{ l: 'Ứng viên mới', v: '247', c: 'from-emerald-500/20 to-cyan-500/20', t: 'text-emerald-400', d: '+34 hôm nay' },
                                { l: 'AI đang tư vấn', v: '89', c: 'from-violet-500/20 to-purple-500/20', t: 'text-violet-400', d: '12 đang chat' },
                                { l: 'Tuyển thành công', v: '156', c: 'from-amber-500/20 to-orange-500/20', t: 'text-amber-400', d: 'tháng này' }
                                ].map((s, i) => (
                                    <div key={i} className={`bg-gradient-to-br ${s.c} rounded-xl p-4 border border-white/5`}>
                                        <p className="text-xs text-slate-400 mb-1">{s.l}</p>
                                        <p className={`text-2xl font-bold ${s.t}`}>{s.v}</p>
                                        <p className="text-[10px] text-slate-500 mt-1">{s.d}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center"><svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg></div>
                                        <span className="text-xs font-medium text-slate-300">AI Chat tư vấn</span>
                                    </div>
                                    {[{ n: 'Nguyễn Văn A', m: 'Em quan tâm vị trí Backend...', t: '2p' }, { n: 'Trần Thị B', m: 'Mức lương như thế nào ạ?', t: '5p' }].map((c, i) => (
                                        <div key={i} className="flex items-center gap-3 py-2 border-t border-white/5">
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-[10px] font-bold">{c.n[0]}</div>
                                            <div className="flex-1 min-w-0"><p className="text-xs text-slate-300 truncate">{c.n}</p><p className="text-[10px] text-slate-500 truncate">{c.m}</p></div>
                                            <span className="text-[10px] text-emerald-400">{c.t}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center"><svg className="w-3.5 h-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
                                        <span className="text-xs font-medium text-slate-300">Automation đang chạy</span>
                                    </div>
                                    {['Tìm kiếm trên LinkedIn...', 'Gửi tin nhắn Zalo...', 'Sàng lọc CV tự động...'].map((a, i) => (
                                        <div key={i} className="flex items-center gap-2 py-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-emerald-400 animate-pulse' : i === 1 ? 'bg-amber-400 animate-pulse' : 'bg-cyan-400 animate-pulse'}`} />
                                            <span className="text-[11px] text-slate-400">{a}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ==================== LOGO CLOUD ====================
function LogoCloud() {
    return (
        <section className="py-12 border-y border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-center text-xs uppercase tracking-widest text-slate-600 mb-8">Được tin tưởng bởi 500+ doanh nghiệp Việt Nam</p>
                <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-40">
                    {['FPT Software', 'VNG Corp', 'Viettel', 'MoMo', 'Tiki', 'VinGroup', 'Shopee VN'].map(c => (
                        <span key={c} className="text-white/80 font-semibold text-sm tracking-wide">{c}</span>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ==================== AI WORKFLOW SECTION ====================
function AIWorkflowSection() {
    const steps = [
        { num: '01', title: 'AI Tìm kiếm ứng viên', desc: 'AI tự động crawl từ LinkedIn, Facebook, Zalo Groups, TopCV — tìm ứng viên phù hợp với JD của bạn 24/7.', icon: '🔍', color: 'emerald' },
        { num: '02', title: 'Chatbot AI tư vấn', desc: 'Chatbot thông minh tự động nhắn tin, tư vấn về vị trí, trả lời câu hỏi, thu thập thông tin ứng viên.', icon: '🤖', color: 'cyan' },
        { num: '03', title: 'Sàng lọc & Đánh giá', desc: 'AI phân tích CV, đánh giá mức độ phù hợp, xếp hạng ứng viên theo điểm match với yêu cầu.', icon: '⚡', color: 'violet' },
        { num: '04', title: 'Tuyển dụng thành công', desc: 'Quản lý pipeline, lên lịch phỏng vấn, gửi offer — mọi thứ tự động trong một nền tảng.', icon: '🎯', color: 'amber' },
    ];
    const colors: Record<string, string> = { emerald: 'from-emerald-500 to-cyan-500', cyan: 'from-cyan-500 to-blue-500', violet: 'from-violet-500 to-purple-500', amber: 'from-amber-500 to-orange-500' };

    return (
        <section id="workflow" className="py-24 relative">
            <div className="absolute inset-0 overflow-hidden pointer-events-none"><div className="absolute top-1/2 left-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-[100px]" /></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-emerald-400 font-semibold text-sm uppercase tracking-widest">Cách hoạt động</span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-4">AI làm việc <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">thay bạn</span></h2>
                    <p className="text-slate-400 text-lg">4 bước tự động — từ tìm kiếm đến tuyển dụng thành công, không cần can thiệp thủ công.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {steps.map((s, i) => (
                        <div key={i} className="group relative p-6 bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-1">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[s.color]} flex items-center justify-center text-xl mb-4 shadow-lg`}>{s.icon}</div>
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Bước {s.num}</span>
                            <h3 className="text-lg font-bold text-white mt-2 mb-2">{s.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                            {i < 3 && <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-[2px] bg-gradient-to-r from-white/10 to-transparent" />}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ==================== FEATURES SECTION ====================
function FeaturesSection() {
    const features = [
        {
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
            title: 'Omni-channel Inbox', desc: 'Tích hợp Zalo, Facebook, Telegram. Chatbot AI trả lời ứng viên tự động qua mọi kênh.', g: 'from-blue-500/20 to-cyan-500/20', t: 'text-blue-400'
        },
        {
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
            title: 'AI Crawl ứng viên', desc: 'AI tự động tìm kiếm ứng viên trên LinkedIn, Facebook Groups, TopCV, ITviec phù hợp JD.', g: 'from-emerald-500/20 to-teal-500/20', t: 'text-emerald-400'
        },
        {
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
            title: 'Auto Post đa kênh', desc: 'Đăng tin tuyển dụng lên Zalo Groups, Facebook Groups, website — tự động lên lịch.', g: 'from-amber-500/20 to-orange-500/20', t: 'text-amber-400'
        },
        {
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
            title: 'Analytics thông minh', desc: 'Báo cáo real-time: nguồn ứng viên, tỷ lệ chuyển đổi, hiệu suất kênh, chi phí tuyển dụng.', g: 'from-rose-500/20 to-pink-500/20', t: 'text-rose-400'
        },
        {
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
            title: 'Team Collaboration', desc: 'Phân quyền owner/admin/member, comment ứng viên, phân công task, quản lý team hiệu quả.', g: 'from-indigo-500/20 to-violet-500/20', t: 'text-indigo-400'
        },
        {
            icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
            title: 'Pipeline Kanban', desc: 'Kéo thả ứng viên qua từng giai đoạn: CV → Sàng lọc → Phỏng vấn → Offer → Onboard.', g: 'from-teal-500/20 to-emerald-500/20', t: 'text-teal-400'
        },
    ];

    return (
        <section id="features" className="py-24 bg-slate-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-emerald-400 font-semibold text-sm uppercase tracking-widest">Tính năng</span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-4">Tất cả công cụ bạn cần trong <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">một nền tảng</span></h2>
                    <p className="text-slate-400 text-lg">Từ tìm kiếm ứng viên đến tuyển dụng thành công — mọi thứ được tự động hoá bằng AI.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((f, i) => (
                        <div key={i} className="group p-6 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.g} ${f.t} flex items-center justify-center mb-4`}>{f.icon}</div>
                            <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ==================== STATS ====================
function StatsSection() {
    return (
        <section className="py-20 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-violet-500/5" />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                    {[{ v: 500, s: '+', l: 'Doanh nghiệp' }, { v: 50000, s: '+', l: 'Ứng viên đã tìm' }, { v: 80, s: '%', l: 'Giảm thời gian' }, { v: 98, s: '%', l: 'Hài lòng' }].map((s, i) => (
                        <div key={i}>
                            <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"><AnimatedCounter target={s.v} suffix={s.s} /></p>
                            <p className="text-slate-500 text-sm mt-1">{s.l}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ==================== TESTIMONIALS ====================
function TestimonialsSection() {
    const items = [
        { q: 'AI tự động tìm được 200+ ứng viên phù hợp trong tuần đầu tiên. Chatbot tư vấn 24/7 giúp không bỏ lỡ bất kỳ ứng viên tiềm năng nào.', n: 'Nguyễn Minh Tuấn', r: 'HR Director', c: 'FPT Software' },
        { q: 'Từ khi dùng Viecly, team HR 3 người làm được công việc của 10 người. Tự động hoá mọi thứ từ tìm kiếm đến sàng lọc.', n: 'Trần Thị Hương', r: 'CEO & Founder', c: 'TechViet' },
        { q: 'Tính năng auto-post lên Zalo + Facebook groups giúp tin tuyển dụng tiếp cận hàng nghìn ứng viên mà không cần làm thủ công.', n: 'Lê Hoàng Nam', r: 'Trưởng phòng HR', c: 'VNG Corp' },
    ];

    return (
        <section id="testimonials" className="py-24 bg-slate-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-emerald-400 font-semibold text-sm uppercase tracking-widest">Khách hàng</span>
                    <h2 className="text-3xl sm:text-4xl font-bold mt-4">Doanh nghiệp nói gì về <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Viecly</span></h2>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {items.map((t, i) => (
                        <div key={i} className="p-6 bg-white/[0.03] rounded-2xl border border-white/5">
                            <div className="flex gap-1 mb-4">{[1, 2, 3, 4, 5].map(s => <svg key={s} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}</div>
                            <p className="text-slate-300 text-sm leading-relaxed mb-6">"{t.q}"</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">{t.n[0]}</div>
                                <div><p className="text-white font-semibold text-sm">{t.n}</p><p className="text-slate-500 text-xs">{t.r}, {t.c}</p></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ==================== PRICING ====================
function PricingSection() {
    const [yearly, setYearly] = useState(false);

    const plans = [
        {
            name: 'Starter',
            monthlyPrice: '1.990.000',
            yearlyPrice: '1.590.000',
            desc: 'Doanh nghiệp nhỏ, đội HR 1-3 người',
            badge: '',
            features: [
                { text: '5 tin tuyển dụng hoạt động', included: true },
                { text: '200 ứng viên/tháng', included: true },
                { text: 'AI Chat tư vấn cơ bản', included: true },
                { text: 'Auto-post 3 kênh', included: true },
                { text: 'Pipeline Kanban', included: true },
                { text: 'Báo cáo cơ bản', included: true },
                { text: '2 tài khoản team', included: true },
                { text: 'Email support', included: true },
                { text: 'AI tìm kiếm ứng viên', included: false },
                { text: 'Omni-channel Inbox', included: false },
            ],
            popular: false,
            cta: 'Dùng thử 14 ngày',
        },
        {
            name: 'Growth',
            monthlyPrice: '4.990.000',
            yearlyPrice: '3.990.000',
            desc: 'Doanh nghiệp SME, đội HR 3-10 người',
            badge: 'Phổ biến nhất',
            features: [
                { text: '20 tin tuyển dụng hoạt động', included: true },
                { text: '1.000 ứng viên/tháng', included: true },
                { text: 'AI Chat tư vấn nâng cao', included: true },
                { text: 'AI tự động tìm kiếm ứng viên', included: true },
                { text: 'Auto-post không giới hạn kênh', included: true },
                { text: 'Omni-channel Inbox (Zalo, FB, Tele)', included: true },
                { text: 'Pipeline + Lịch phỏng vấn', included: true },
                { text: 'Analytics & Báo cáo chi tiết', included: true },
                { text: '10 tài khoản team', included: true },
                { text: 'Priority support 24/7', included: true },
            ],
            popular: true,
            cta: 'Dùng thử 14 ngày',
        },
        {
            name: 'Business',
            monthlyPrice: '9.990.000',
            yearlyPrice: '7.990.000',
            desc: 'Doanh nghiệp lớn, đội HR 10+ người',
            badge: 'Tiết kiệm nhất',
            features: [
                { text: 'Không giới hạn tin tuyển dụng', included: true },
                { text: 'Không giới hạn ứng viên', included: true },
                { text: 'AI Chat + AI tìm kiếm nâng cao', included: true },
                { text: 'Custom AI chatbot theo thương hiệu', included: true },
                { text: 'Auto-post + Lên lịch thông minh', included: true },
                { text: 'Omni-channel + CRM tích hợp', included: true },
                { text: 'Advanced Analytics + Export', included: true },
                { text: 'Không giới hạn tài khoản team', included: true },
                { text: 'API Integration', included: true },
                { text: 'Account Manager riêng', included: true },
                { text: 'SLA 99.9% uptime', included: true },
            ],
            popular: false,
            cta: 'Liên hệ tư vấn',
        },
    ];

    const formatPrice = (p: string) => p + 'đ';

    return (
        <section id="pricing" className="py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <span className="text-emerald-400 font-semibold text-sm uppercase tracking-widest">Bảng giá</span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-4">Đầu tư thông minh cho <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">tuyển dụng</span></h2>
                    <p className="text-slate-400 text-lg">Tiết kiệm hàng trăm triệu chi phí tuyển dụng mỗi năm. ROI trung bình <span className="text-white font-semibold">850%</span>.</p>
                </div>

                {/* Toggle */}
                <div className="flex items-center justify-center gap-4 mb-12">
                    <span className={`text-sm font-medium ${!yearly ? 'text-white' : 'text-slate-500'}`}>Thanh toán tháng</span>
                    <button onClick={() => setYearly(!yearly)} className={`relative w-14 h-7 rounded-full transition-colors ${yearly ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                        <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${yearly ? 'translate-x-7.5 left-0.5' : 'left-0.5'}`} style={{ transform: yearly ? 'translateX(28px)' : 'translateX(0)' }} />
                    </button>
                    <span className={`text-sm font-medium ${yearly ? 'text-white' : 'text-slate-500'}`}>Thanh toán năm</span>
                    {yearly && <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">-20%</span>}
                </div>

                <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {plans.map((p, i) => (
                        <div key={i} className={`relative rounded-2xl p-8 transition-all hover:-translate-y-1 duration-300 ${p.popular ? 'bg-gradient-to-b from-emerald-500/10 to-cyan-500/5 border-2 border-emerald-500/30 shadow-2xl shadow-emerald-500/10 scale-[1.02]' : 'bg-white/[0.03] border border-white/5 hover:border-white/10'}`}>
                            {p.badge && <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 text-white text-xs font-bold rounded-full whitespace-nowrap ${p.popular ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : 'bg-gradient-to-r from-violet-500 to-purple-500'}`}>{p.badge}</div>}
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-bold text-white mb-1">{p.name}</h3>
                                <p className="text-slate-500 text-sm mb-5">{p.desc}</p>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-4xl lg:text-5xl font-bold text-white">{formatPrice(yearly ? p.yearlyPrice : p.monthlyPrice)}</span>
                                </div>
                                <p className="text-slate-500 text-xs mt-1">/tháng {yearly && '• thanh toán theo năm'}</p>
                                {yearly && <p className="text-emerald-400 text-xs mt-1 font-medium">Tiết kiệm {((parseInt(p.monthlyPrice.replace(/\./g, '')) - parseInt(p.yearlyPrice.replace(/\./g, ''))) * 12).toLocaleString()}đ/năm</p>}
                            </div>
                            <ul className="space-y-3 mb-8">
                                {p.features.map((f, fi) => (
                                    <li key={fi} className={`flex items-center gap-3 text-sm ${f.included ? 'text-slate-300' : 'text-slate-600'}`}>
                                        {f.included ? (
                                            <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                        ) : (
                                            <svg className="w-4 h-4 text-slate-700 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        )}
                                        {f.text}
                                    </li>
                                ))}
                            </ul>
                            <Link to="/register" className={`block w-full py-3.5 rounded-xl font-semibold text-center text-sm transition-all ${p.popular ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}>
                                {p.cta}
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Enterprise CTA */}
                <div className="mt-12 max-w-4xl mx-auto">
                    <div className="relative rounded-2xl p-8 lg:p-10 bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-fuchsia-500/5 border border-violet-500/10 overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-[80px]" />
                        <div className="relative flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
                            <div className="flex-1 text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-xs font-bold mb-3">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                    Enterprise
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Giải pháp cho doanh nghiệp lớn</h3>
                                <p className="text-slate-400 text-sm">Tuỳ chỉnh AI model, triển khai on-premise, tích hợp API, dedicated support team. Liên hệ để nhận báo giá riêng.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <a href="mailto:enterprise@viecly.vn" className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all whitespace-nowrap">
                                    Liên hệ Sales
                                </a>
                                <a href="tel:19001234" className="px-6 py-3 bg-white/5 text-white font-semibold rounded-xl text-sm border border-white/10 hover:bg-white/10 transition-all whitespace-nowrap">
                                    Gọi 1900.1234
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trust badges */}
                <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600">
                    {['🔒 Bảo mật SSL 256-bit', '💳 Thanh toán an toàn qua VNPay', '🔄 Hoàn tiền trong 30 ngày', '📞 Hỗ trợ setup miễn phí'].map(t => (
                        <span key={t}>{t}</span>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ==================== CTA ====================
function CTASection() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 via-cyan-600/20 to-teal-600/20" />
            <div className="absolute inset-0 overflow-hidden pointer-events-none"><div className="absolute top-0 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" /></div>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
                <h2 className="text-3xl sm:text-5xl font-bold mb-4">Sẵn sàng để <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">AI tuyển dụng</span> cho bạn?</h2>
                <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">Tham gia 500+ doanh nghiệp đang dùng Viecly để tự động hoá tuyển dụng. Bắt đầu miễn phí ngay.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-2xl shadow-2xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all">Dùng thử miễn phí</Link>
                    <a href="mailto:contact@viecly.vn" className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-2xl border border-white/10 transition-all">Liên hệ tư vấn</a>
                </div>
                <p className="text-slate-600 text-sm mt-6">Không cần thẻ tín dụng • Hủy bất cứ lúc nào</p>
            </div>
        </section>
    );
}

// ==================== FOOTER ====================
function LandingFooter() {
    return (
        <footer className="bg-slate-950 border-t border-white/5 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    <div>
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center"><span className="text-white font-bold text-sm">V</span></div>
                            <span className="font-bold text-white text-xl">Viecly<span className="text-emerald-400">.ai</span></span>
                        </div>
                        <p className="text-slate-500 text-sm mb-4">Nền tảng tuyển dụng AI tự động — tìm kiếm, tư vấn, và tuyển dụng nhân tài thông minh.</p>
                    </div>
                    {[
                        { t: 'Sản phẩm', links: [['Tính năng', '#features'], ['Bảng giá', '#pricing'], ['API', '#'], ['Tích hợp', '#']] },
                        { t: 'Công ty', links: [['Về chúng tôi', '#'], ['Blog', '#'], ['Tuyển dụng', '#'], ['Liên hệ', '#']] },
                        { t: 'Liên hệ', links: [['📧 support@viecly.vn', '#'], ['📞 1900 xxxx xx', '#'], ['📍 Quận 1, TP.HCM', '#']] },
                    ].map((col, i) => (
                        <div key={i}>
                            <h4 className="font-semibold text-white mb-4 text-sm">{col.t}</h4>
                            <ul className="space-y-3 text-sm">{col.links.map(([label, href], li) => (
                                <li key={li}><a href={href} className="text-slate-500 hover:text-white transition-colors">{label}</a></li>
                            ))}</ul>
                        </div>
                    ))}
                </div>
                <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-slate-600 text-sm">© 2026 Viecly.ai — AI Recruitment Platform</p>
                    <div className="flex gap-6 text-sm">
                        {['Điều khoản', 'Bảo mật', 'Cookie'].map(l => <a key={l} href="#" className="text-slate-600 hover:text-white transition-colors">{l}</a>)}
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default LandingPage;
