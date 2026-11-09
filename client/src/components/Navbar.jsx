import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Menu,
  X,
  User,
  LogOut,
  ShieldAlert,
  Layers,
  FileText,
  Bookmark,
} from 'lucide-react';

export const Navbar = () => {
  const { isAuthenticated, user, role, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition px-3 py-1.5 rounded-lg ${
      isActive
        ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
    }`;

  return (
    <nav className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-950">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                BioLearn BD
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                HSC & Admission
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/catalogue" className={navLinkClass}>
              Syllabus Catalogue
            </NavLink>

            {isAdmin && (
              <>
                <div className="h-4 w-px bg-slate-800 mx-1"></div>
                <NavLink to="/admin" className={navLinkClass}>
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-emerald-400" />
                    Dashboard
                  </span>
                </NavLink>
                <NavLink to="/admin/papers" className={navLinkClass}>
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    Papers
                  </span>
                </NavLink>
                <NavLink to="/admin/chapters" className={navLinkClass}>
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Chapters
                  </span>
                </NavLink>
                <NavLink to="/admin/topics" className={navLinkClass}>
                  <span className="flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5" />
                    Topics
                  </span>
                </NavLink>
              </>
            )}

            {isAuthenticated && !isAdmin && (
              <NavLink to="/profile" className={navLinkClass}>
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  My Profile
                </span>
              </NavLink>
            )}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-semibold text-white">
                    {user?.name || 'User'}
                  </div>
                  <div className="text-[10px] text-emerald-400 capitalize">
                    {role || 'Student'}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-rose-400 bg-slate-800/80 hover:bg-rose-950/40 rounded-lg border border-slate-700/80 hover:border-rose-800/60 transition cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
                >
                  Student Login
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm shadow-emerald-950 transition"
                >
                  Register
                </Link>
                <Link
                  to="/admin/login"
                  className="text-slate-400 hover:text-emerald-400 p-1.5 rounded-lg transition"
                  title="Admin Portal"
                >
                  <ShieldAlert className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
          >
            Home
          </Link>
          <Link
            to="/catalogue"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
          >
            Syllabus Catalogue
          </Link>

          {isAdmin && (
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3">
                Admin Management
              </span>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-emerald-400 hover:bg-slate-800"
              >
                Dashboard Overview
              </Link>
              <Link
                to="/admin/papers"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                Manage Papers
              </Link>
              <Link
                to="/admin/chapters"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                Manage Chapters
              </Link>
              <Link
                to="/admin/topics"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                Manage Topics
              </Link>
            </div>
          )}

          {isAuthenticated && !isAdmin && (
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
            >
              My Profile
            </Link>
          )}

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-center py-2 text-sm font-medium text-rose-400 bg-rose-950/40 rounded-lg border border-rose-900/60"
              >
                Logout ({user?.name})
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-slate-200 bg-slate-800 rounded-lg border border-slate-700"
                >
                  Student Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg"
                >
                  Student Registration
                </Link>
                <Link
                  to="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-1.5 text-xs text-slate-400 hover:text-emerald-400"
                >
                  Admin Portal Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
