import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ROUTES } from '../constants/routes.js';
import ProtectedRoute from './ProtectedRoute.jsx';
import PublicRoute from './PublicRoute.jsx';
import AppShell from '../components/layout/AppShell.jsx';
import Spinner from '../components/common/Spinner.jsx';

// Public pages
import LandingPage from '../pages/public/LandingPage.jsx';
import FeaturesPage from '../pages/public/FeaturesPage.jsx';
import HowItWorksPage from '../pages/public/HowItWorksPage.jsx';
import AboutPage from '../pages/public/AboutPage.jsx';

// Auth pages
import LoginPage from '../pages/auth/LoginPage.jsx';
import RegisterPage from '../pages/auth/RegisterPage.jsx';
import VerifyEmailPage from '../pages/auth/VerifyEmailPage.jsx';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage.jsx';

// Onboarding
import ConnectCodeforcesPage from '../pages/onboarding/ConnectCodeforcesPage.jsx';
import VerifyCodeforcesPage from '../pages/onboarding/VerifyCodeforcesPage.jsx';

// App pages (lazy)
const DashboardPage = lazy(() => import('../pages/app/DashboardPage.jsx'));
const AnalyticsPage = lazy(() => import('../pages/app/AnalyticsPage.jsx'));
const RatingPage = lazy(() => import('../pages/app/RatingPage.jsx'));
const DifficultyPage = lazy(() => import('../pages/app/DifficultyPage.jsx'));
const TopicsPage = lazy(() => import('../pages/app/TopicsPage.jsx'));
const SubmissionsPage = lazy(() => import('../pages/app/SubmissionsPage.jsx'));
const ContestAnalyticsPage = lazy(() => import('../pages/app/ContestAnalyticsPage.jsx'));
const ProblemsPage = lazy(() => import('../pages/app/ProblemsPage.jsx'));
const RecommendedProblemsPage = lazy(() => import('../pages/app/RecommendedProblemsPage.jsx'));
const ProblemHistoryPage = lazy(() => import('../pages/app/ProblemHistoryPage.jsx'));
const DailyPracticePage = lazy(() => import('../pages/app/DailyPracticePage.jsx'));
const AICoachPage = lazy(() => import('../pages/app/AICoachPage.jsx'));
const RoadmapPage = lazy(() => import('../pages/app/RoadmapPage.jsx'));
const ProgressPage = lazy(() => import('../pages/app/ProgressPage.jsx'));
const ContestsPage = lazy(() => import('../pages/app/ContestsPage.jsx'));
const ProfilePage = lazy(() => import('../pages/app/ProfilePage.jsx'));
const SettingsPage = lazy(() => import('../pages/app/SettingsPage.jsx'));

function AppLoader() {
  return (
    <div className="flex h-full items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path={ROUTES.HOME} element={<LandingPage />} />
      <Route path={ROUTES.FEATURES} element={<FeaturesPage />} />
      <Route path={ROUTES.HOW_IT_WORKS} element={<HowItWorksPage />} />
      <Route path={ROUTES.ABOUT} element={<AboutPage />} />

      {/* Auth */}
      <Route path={ROUTES.LOGIN} element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path={ROUTES.REGISTER} element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />

      {/* Onboarding */}
      <Route path={ROUTES.CONNECT_CODEFORCES} element={<ConnectCodeforcesPage />} />
      <Route path={ROUTES.VERIFY_CODEFORCES} element={<VerifyCodeforcesPage />} />

      {/* App */}
      <Route path="/app" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route path="dashboard" element={<Suspense fallback={<AppLoader />}><DashboardPage /></Suspense>} />
        <Route path="analytics" element={<Suspense fallback={<AppLoader />}><AnalyticsPage /></Suspense>} />
        <Route path="analytics/rating" element={<Suspense fallback={<AppLoader />}><RatingPage /></Suspense>} />
        <Route path="analytics/difficulty" element={<Suspense fallback={<AppLoader />}><DifficultyPage /></Suspense>} />
        <Route path="analytics/topics" element={<Suspense fallback={<AppLoader />}><TopicsPage /></Suspense>} />
        <Route path="analytics/submissions" element={<Suspense fallback={<AppLoader />}><SubmissionsPage /></Suspense>} />
        <Route path="analytics/contests" element={<Suspense fallback={<AppLoader />}><ContestAnalyticsPage /></Suspense>} />
        <Route path="problems" element={<Suspense fallback={<AppLoader />}><ProblemsPage /></Suspense>} />
        <Route path="problems/recommended" element={<Suspense fallback={<AppLoader />}><RecommendedProblemsPage /></Suspense>} />
        <Route path="problems/history" element={<Suspense fallback={<AppLoader />}><ProblemHistoryPage /></Suspense>} />
        <Route path="daily-practice" element={<Suspense fallback={<AppLoader />}><DailyPracticePage /></Suspense>} />
        <Route path="ai-coach" element={<Suspense fallback={<AppLoader />}><AICoachPage /></Suspense>} />
        <Route path="roadmap" element={<Suspense fallback={<AppLoader />}><RoadmapPage /></Suspense>} />
        <Route path="progress" element={<Suspense fallback={<AppLoader />}><ProgressPage /></Suspense>} />
        <Route path="contests" element={<Suspense fallback={<AppLoader />}><ContestsPage /></Suspense>} />
        <Route path="profile" element={<Suspense fallback={<AppLoader />}><ProfilePage /></Suspense>} />
        <Route path="settings" element={<Suspense fallback={<AppLoader />}><SettingsPage /></Suspense>} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <h1 className="text-6xl font-bold text-[#6366f1]">404</h1>
      <p className="text-[#9ca3c4]">Page not found</p>
      <a href="/" className="text-[#6366f1] hover:underline text-sm">Go home</a>
    </div>
  );
}
