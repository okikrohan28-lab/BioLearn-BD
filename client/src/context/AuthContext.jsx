import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  login as apiLogin,
  adminLogin as apiAdminLogin,
  register as apiRegister,
  getProfile as apiGetProfile,
  updateProfile as apiUpdateProfile,
} from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('biolearn_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('biolearn_token'));
  const [role, setRole] = useState(() => localStorage.getItem('biolearn_role'));
  const [loading, setLoading] = useState(true);

  const saveAuth = (userData, authToken, userRole) => {
    setUser(userData);
    setToken(authToken);
    setRole(userRole);
    localStorage.setItem('biolearn_token', authToken);
    localStorage.setItem('biolearn_user', JSON.stringify(userData));
    localStorage.setItem('biolearn_role', userRole);
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setRole(null);
    localStorage.removeItem('biolearn_token');
    localStorage.removeItem('biolearn_user');
    localStorage.removeItem('biolearn_role');
  }, []);

  // Validate session on app initialization
  useEffect(() => {
    let ignore = false;
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('biolearn_token');
      const storedRole = localStorage.getItem('biolearn_role');

      if (!storedToken) {
        setLoading(false);
        return;
      }

      if (storedRole === 'student') {
        try {
          const res = await apiGetProfile();
          if (!ignore && res.data) {
            setUser(res.data);
          }
        } catch {
          if (!ignore) {
            logout();
          }
        }
      }
      if (!ignore) {
        setLoading(false);
      }
    };

    restoreSession();
    return () => {
      ignore = true;
    };
  }, [logout]);

  const loginStudent = async (credentials) => {
    const res = await apiLogin(credentials);
    const { student, token: authToken } = res.data;
    saveAuth(student, authToken, 'student');
    return student;
  };

  const loginAdministrator = async (credentials) => {
    const res = await apiAdminLogin(credentials);
    const { admin, token: authToken } = res.data;
    saveAuth(admin, authToken, admin.role || 'admin');
    return admin;
  };

  const registerStudent = async (studentData) => {
    const res = await apiRegister(studentData);
    const { student, token: authToken } = res.data;
    saveAuth(student, authToken, 'student');
    return student;
  };

  const updateStudentProfile = async (profileData) => {
    const res = await apiUpdateProfile(profileData);
    if (res.data) {
      setUser((prev) => ({ ...prev, ...res.data }));
      localStorage.setItem('biolearn_user', JSON.stringify({ ...user, ...res.data }));
    }
    return res.data;
  };

  const isAdmin = ['admin', 'superadmin', 'content_manager'].includes(role);
  const isStudent = role === 'student';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        loading,
        isAuthenticated: Boolean(token),
        isAdmin,
        isStudent,
        loginStudent,
        loginAdministrator,
        registerStudent,
        logout,
        updateStudentProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
