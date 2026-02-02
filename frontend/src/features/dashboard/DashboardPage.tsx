import { useCompanyRole } from './useCompanyRole';
import { AdminDashboard } from './AdminDashboard';
import { MemberDashboard } from './MemberDashboard';
import { useTheme } from '../../contexts/ThemeContext';

export function DashboardPage() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const { isOwner, isAdmin, isLoading, hasCompany } = useCompanyRole();
    const isManager = isOwner || isAdmin;

    if (isLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-950' : 'bg-slate-50/50'}`}>
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" />
            </div>
        );
    }

    if (!hasCompany) {
        return (
            <div className={`min-h-screen flex items-center justify-center p-6 ${isDark ? 'bg-slate-950' : 'bg-slate-50/50'}`}>
                <div className={`text-center max-w-md p-8 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
                        <span className="text-3xl">🏢</span>
                    </div>
                    <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        Chưa có doanh nghiệp
                    </h2>
                    <p className={`mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Bạn cần tạo hoặc tham gia một doanh nghiệp để sử dụng Dashboard.
                    </p>
                    <a
                        href="/company"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                    >
                        Tạo doanh nghiệp
                    </a>
                </div>
            </div>
        );
    }

    // Auto-route based on role
    return isManager ? <AdminDashboard /> : <MemberDashboard />;
}
