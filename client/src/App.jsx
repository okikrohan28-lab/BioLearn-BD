import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public & Student Pages
import { HomePage } from './pages/HomePage';
import { CataloguePage } from './pages/student/CataloguePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { AdminLoginPage } from './pages/auth/AdminLoginPage';
import { ProfilePage } from './pages/student/ProfilePage';
import { TopicPage } from './pages/student/TopicPage';
import { ChapterPage } from './pages/student/ChapterPage';
import { QuizAttemptPage } from './pages/student/QuizAttemptPage';
import { QuizResultPage } from './pages/student/QuizResultPage';
import { PremiumPage } from './pages/student/PremiumPage';
import { PaymentPage } from './pages/student/PaymentPage';
import { PaymentSuccessPage } from './pages/student/PaymentSuccessPage';
import { WeeklyChallengePage } from './pages/student/WeeklyChallengePage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManagePapersPage } from './pages/admin/ManagePapersPage';
import { ManageChaptersPage } from './pages/admin/ManageChaptersPage';
import { ManageTopicsPage } from './pages/admin/ManageTopicsPage';
import { ManageResourcesPage } from './pages/admin/ManageResourcesPage';
import { ManageQuizzesPage } from './pages/admin/ManageQuizzesPage';
import { ManageChallengesPage } from './pages/admin/ManageChallengesPage';
import { ManageSubscriptionsPage } from './pages/admin/ManageSubscriptionsPage';

const currentYear = new Date().getFullYear();

function NotFoundPage() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <h2 className="text-4xl font-extrabold text-[#0F766E]">404</h2>
      <p className="text-sm text-[#475569]">The page you are looking for does not exist.</p>
      <Link
        to="/"
        className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0F766E] hover:bg-[#134E4A] text-white transition shadow-sm cursor-pointer"
      >
        Return to Home
      </Link>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-[#EAF3ED] text-[#1E293B] flex flex-col justify-between selection:bg-[#14B8A6] selection:text-white">
          <Navbar />

          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/catalogue" element={<CataloguePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/topic/:topicId" element={<TopicPage />} />
              <Route path="/chapter/:chapterId" element={<ChapterPage />} />
              <Route path="/challenges" element={<WeeklyChallengePage />} />
              <Route path="/premium" element={<PremiumPage />} />

              {/* Protected Student Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz/:quizId/attempt"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <QuizAttemptPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz/:quizId/result/:attemptId"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <QuizResultPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <PaymentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment/success"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <PaymentSuccessPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Administrator Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/papers"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManagePapersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/chapters"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageChaptersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/topics"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageTopicsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/resources"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageResourcesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/quizzes"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageQuizzesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/challenges"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageChallengesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/premium"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageSubscriptionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/subscriptions"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageSubscriptionsPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          <footer className="border-t border-[#B8D8CF] bg-white/70 py-6 mt-12 text-center text-xs text-[#475569]">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="font-medium text-[#0F766E]">
                BioLearn BD &copy; {currentYear} &bull; MERN Biology Learning Platform
              </div>
              <div className="flex items-center gap-4 text-[11px] text-[#475569]">
                <Link to="/catalogue" className="hover:text-[#0F766E] transition">Catalogue</Link>
                <Link to="/challenges" className="hover:text-[#0F766E] transition">Weekly Challenges</Link>
                <Link to="/premium" className="hover:text-[#0F766E] transition">Premium Plan</Link>
                <Link to="/login" className="hover:text-[#0F766E] transition">Student Portal</Link>
                <Link to="/admin/login" className="hover:text-[#0F766E] transition">Admin Portal</Link>
              </div>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
