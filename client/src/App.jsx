import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { HomePage } from './pages/HomePage';
import { CataloguePage } from './pages/student/CataloguePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { AdminLoginPage } from './pages/auth/AdminLoginPage';
import { ProfilePage } from './pages/student/ProfilePage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManagePapersPage } from './pages/admin/ManagePapersPage';
import { ManageChaptersPage } from './pages/admin/ManageChaptersPage';
import { ManageTopicsPage } from './pages/admin/ManageTopicsPage';

const currentYear = new Date().getFullYear();

function NotFoundPage() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <h2 className="text-4xl font-extrabold text-white">404</h2>
      <p className="text-sm text-slate-400">The page you are looking for does not exist.</p>
      <Link
        to="/"
        className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
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
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
          <Navbar />

          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/catalogue" element={<CataloguePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Protected Student Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <ProfilePage />
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

              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          <footer className="border-t border-slate-800 bg-slate-900/50 py-6 mt-12 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>BioLearn BD &copy; {currentYear} &bull; MERN Biology Learning Platform</div>
              <div className="flex items-center gap-4 text-[11px] text-slate-400">
                <Link to="/catalogue" className="hover:text-emerald-400">Catalogue</Link>
                <Link to="/login" className="hover:text-emerald-400">Student Portal</Link>
                <Link to="/admin/login" className="hover:text-emerald-400">Admin Portal</Link>
              </div>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
