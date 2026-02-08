import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { useAppSelector } from './app/hooks';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { RegisterChoicePage } from './features/auth/RegisterChoicePage';
import { CandidateRegisterPage } from './features/auth/CandidateRegisterPage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { ZaloChatPage } from './features/zalo/ZaloChatPage';
import { RecruitingPage } from './features/recruiting/RecruitingPage';
import { JobDetailPage } from './features/recruiting/JobDetailPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { CompanyPage } from './features/company/CompanyPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { ZaloPage } from './features/zalo/ZaloPage';
import { ZaloGroupsPage } from './features/zalo/ZaloGroupsPage';
import { LandingPage } from './features/landing/LandingPage';
import { PermissionsPage } from './features/permissions/PermissionsPage';
import PricingPage from './features/pricing/PricingPage';
import { NotificationsPage } from './features/notifications';
import CalendarPage from './features/calendar/CalendarPage';
import { CandidatesPage } from './features/candidates';
import { PublicJobsPage } from './features/jobs/PublicJobsPage';
import { PublicJobDetailPage } from './features/jobs/PublicJobDetailPage';
import { ScheduledPostsPage } from './features/scheduling';
import { FacebookGroupsPage } from './features/facebook-groups';
import { FacebookPage } from './features/facebook';
import { PosterCreatorPage } from './features/poster-creator';
import { CandidateDashboard, MyApplicationsPage, SavedJobsPage, CandidateProfilePage } from './features/candidate';
import { WebSocketTest as WebSocketTestPage } from './components/debug/WebSocketTest';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { CandidateLayout } from './components/layout/CandidateLayout';
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
    return <Navigate to="/candidate/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* ============================================== */}
      {/* PUBLIC ROUTES - No authentication required */}
      {/* ============================================== */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/pricing" element={<PricingPage />} />

      {/* Public Jobs Routes - With CandidateLayout */}
      <Route path="/jobs" element={<CandidateLayout><PublicJobsPage /></CandidateLayout>} />
      <Route path="/jobs/:slug" element={<CandidateLayout><PublicJobDetailPage /></CandidateLayout>} />

      {/* Guest Routes - Redirect authenticated users */}
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterChoicePage /></GuestRoute>} />
      <Route path="/register/employer" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/register/candidate" element={<GuestRoute><CandidateRegisterPage /></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />

      {/* ============================================== */}
      {/* CANDIDATE PORTAL - For job seekers */}
      {/* ============================================== */}
      <Route
        path="/candidate/dashboard"
        element={
          <ProtectedRoute>
            <CandidateLayout>
              <CandidateDashboard />
            </CandidateLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/applications"
        element={
          <ProtectedRoute>
            <CandidateLayout>
              <MyApplicationsPage />
            </CandidateLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/saved-jobs"
        element={
          <ProtectedRoute>
            <CandidateLayout>
              <SavedJobsPage />
            </CandidateLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/profile"
        element={
          <ProtectedRoute>
            <CandidateLayout>
              <CandidateProfilePage />
            </CandidateLayout>
          </ProtectedRoute>
        }
      />

      {/* ============================================== */}
      {/* EMPLOYER PORTAL - For recruiters/managers */}
      {/* ============================================== */}
      <Route
        path="/employer/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/inbox"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ZaloChatPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/jobs"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <RecruitingPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/jobs/:jobId"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <JobDetailPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/calendar"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CalendarPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/candidates"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CandidatesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/company"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CompanyPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/permissions"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PermissionsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/zalo"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ZaloPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/zalo-groups"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ZaloGroupsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/scheduled-posts"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ScheduledPostsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/facebook"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <FacebookPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/facebook-groups"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <FacebookGroupsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/poster"
        element={
          <ProtectedRoute>
            <PosterCreatorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/settings"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <SettingsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employer/notifications"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <NotificationsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Legacy route redirects */}
      <Route path="/dashboard" element={<Navigate to="/employer/dashboard" replace />} />
      <Route path="/inbox" element={<Navigate to="/employer/inbox" replace />} />
      <Route path="/recruiting" element={<Navigate to="/employer/jobs" replace />} />
      <Route path="/recruiting/:jobId" element={<Navigate to="/employer/jobs/:jobId" replace />} />
      <Route path="/calendar" element={<Navigate to="/employer/calendar" replace />} />
      <Route path="/candidates" element={<Navigate to="/employer/candidates" replace />} />
      <Route path="/company" element={<Navigate to="/employer/company" replace />} />
      <Route path="/permissions" element={<Navigate to="/employer/permissions" replace />} />
      <Route path="/zalo" element={<Navigate to="/employer/zalo" replace />} />
      <Route path="/zalo-chat" element={<Navigate to="/employer/inbox" replace />} />
      <Route path="/settings" element={<Navigate to="/employer/settings" replace />} />
      <Route path="/notifications" element={<Navigate to="/employer/notifications" replace />} />

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

