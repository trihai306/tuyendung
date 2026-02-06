import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';

interface CandidateLayoutProps {
    children: React.ReactNode;
}

export function CandidateLayout({ children }: CandidateLayoutProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const navItems = [
        { path: '/jobs', label: 'Tìm việc làm', icon: 'search' },
        { path: '/candidate/applications', label: 'Đơn ứng tuyển', icon: 'document', requireAuth: true },
        { path: '/candidate/saved-jobs', label: 'Việc đã lưu', icon: 'heart', requireAuth: true },
    ];

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    const isActive = (path: string) => {
        if (path === '/jobs') {
            return location.pathname === '/jobs' || location.pathname.startsWith('/jobs/');
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2.5">
                            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <span className="text-white font-bold text-sm">VL</span>
                            </div>
                            <span className="font-bold text-slate-800 text-lg hidden sm:block">Viecly</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => {
                                if (item.requireAuth && !isAuthenticated) return null;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive(item.path)
                                                ? 'bg-emerald-50 text-emerald-600'
                                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Right Side */}
                        <div className="flex items-center gap-3">
                            {/* Switch to Employer */}
                            <Link
                                to="/employer/dashboard"
                                className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-emerald-600 border border-slate-200 rounded-lg hover:border-emerald-300 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Nhà tuyển dụng
                            </Link>

                            {isAuthenticated ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                                            <span className="text-white text-xs font-semibold">
                                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                        <span className="hidden sm:block text-sm font-medium text-slate-700">
                                            {user?.name || 'User'}
                                        </span>
                                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {showUserMenu && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-slate-200 py-2 z-20">
                                                <div className="px-4 py-3 border-b border-slate-100">
                                                    <p className="text-sm font-medium text-slate-800">{user?.name}</p>
                                                    <p className="text-xs text-slate-500">{user?.email}</p>
                                                </div>
                                                <Link
                                                    to="/candidate/profile"
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    Hồ sơ của tôi
                                                </Link>
                                                <Link
                                                    to="/candidate/applications"
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    Đơn ứng tuyển
                                                </Link>
                                                <div className="border-t border-slate-100 mt-2 pt-2">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 w-full text-left"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                        </svg>
                                                        Đăng xuất
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link
                                        to="/login"
                                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                                    >
                                        Đăng nhập
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md shadow-emerald-500/25"
                                    >
                                        Đăng ký
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {showMobileMenu ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {showMobileMenu && (
                    <div className="md:hidden border-t border-slate-100 bg-white">
                        <div className="px-4 py-3 space-y-1">
                            {navItems.map((item) => {
                                if (item.requireAuth && !isAuthenticated) return null;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive(item.path)
                                                ? 'bg-emerald-50 text-emerald-600'
                                                : 'text-slate-600 hover:bg-slate-100'
                                            }`}
                                        onClick={() => setShowMobileMenu(false)}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                            <Link
                                to="/employer/dashboard"
                                className="block px-4 py-3 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 border-t border-slate-100 mt-2 pt-4"
                                onClick={() => setShowMobileMenu(false)}
                            >
                                Chuyển sang Nhà tuyển dụng
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main>{children}</main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 py-8 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xs">VL</span>
                            </div>
                            <span className="text-slate-500 text-sm">© 2026 Viecly. All rights reserved.</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-slate-500">
                            <Link to="/about" className="hover:text-emerald-600 transition-colors">Về chúng tôi</Link>
                            <Link to="/contact" className="hover:text-emerald-600 transition-colors">Liên hệ</Link>
                            <Link to="/terms" className="hover:text-emerald-600 transition-colors">Điều khoản</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
