import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { useAppSelector } from './app/hooks';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { ZaloChatPage } from './features/zalo/ZaloChatPage';
import { RecruitingPage } from './features/recruiting/RecruitingPage';
import { JobDetailPage } from './features/recruiting/JobDetailPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { CompanyPage } from './features/company/CompanyPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { ZaloPage } from './features/zalo/ZaloPage';
import { LandingPage } from './features/landing/LandingPage';
import PricingPage from './features/pricing/PricingPage';
import { WebSocketTest as WebSocketTestPage } from './components/debug/WebSocketTest';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ToastProvider } from './components/ui';
import { ThemeProvider } from './contexts/ThemeContext';
import { initEcho } from './services/echo';
import { useEffect } from 'react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      initEcho(token);
    }
  }, [token]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// GuestRoute - Prevents authenticated users from accessing login/register pages
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/inbox" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/pricing" element={<PricingPage />} />

      {/* Guest Routes - Redirect authenticated users to /inbox */}
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />

      {/* Protected Routes with Dashboard Layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inbox"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ZaloChatPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiting"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <RecruitingPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiting/:jobId"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <JobDetailPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidates"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <div className="text-slate-600">Trang Ứng viên đang phát triển...</div>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <div className="text-slate-600">Trang Báo cáo đang phát triển...</div>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <SettingsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/company"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CompanyPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/zalo"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ZaloPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/zalo-chat"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ZaloChatPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/help"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <div className="text-slate-600">Trung tâm Trợ giúp đang phát triển...</div>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Debug Routes */}
      <Route path="/debug/websocket" element={<WebSocketTestPage />} />

      {/* Redirects - 404 goes to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
