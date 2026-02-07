import React from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import './styles.css';

// Router component that handles auth state
function AppRouter() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[var(--bg-void)] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="spinner"></div>
                    <p className="text-[var(--text-muted)] text-sm">Đang tải...</p>
                </div>
            </div>
        );
    }

    return isAuthenticated ? <DashboardPage /> : <LoginPage />;
}

// Main App with AuthProvider
function App() {
    return (
        <AuthProvider>
            <AppRouter />
        </AuthProvider>
    );
}

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}
