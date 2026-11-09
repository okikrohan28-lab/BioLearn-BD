import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // If route requires admin, redirect to admin login, otherwise student login
    const isTargetAdmin = allowedRoles && allowedRoles.includes('admin');
    const redirectPath = isTargetAdmin ? '/admin/login' : '/login';
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (allowedRoles) {
    const roleHierarchy = {
      superadmin: ['superadmin', 'admin', 'content_manager'],
      admin: ['admin', 'content_manager'],
      content_manager: ['content_manager'],
      student: ['student'],
    };

    const userRoles = roleHierarchy[role] || [role];
    const hasPermission = allowedRoles.some((r) => userRoles.includes(r));

    if (!hasPermission) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4 text-2xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 max-w-md mb-6">
            You do not have administrative permissions to view this resource.
          </p>
          <Navigate to="/" replace />
        </div>
      );
    }
  }

  return children;
};
