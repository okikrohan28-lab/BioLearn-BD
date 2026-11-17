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
  Trophy,
  Crown,
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
        ? 'bg-[#0F766E]/10 text-[#0F766E] font-semibold'
        : 'text-[#475569] hover:text-[#0F766E] hover:bg-[#0F766E]/5'
    }`;

  return (
    <nav className="border-b border-[#B8D8CF] bg-white/95 backdrop-blur sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] flex items-center justify-center text-white shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#0F766E] to-[#14B8A6] bg-clip-text text-transparent">
                BioLearn BD
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#EAF3ED] text-[#0F766E] border border-[#B8D8CF]">
                {isAdmin ? 'Admin Console' : 'HSC & Admission'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {isAdmin ? (
            /* ADMIN HEADER: Exactly 5 options: Home, Dashboard, Syllabus, Premium, Logout */
            <div className="hidden md:flex items-center gap-2">
              <NavLink to="/" end className={navLinkClass}>
                Home
              </NavLink>
              <NavLink to="/admin" end className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/admin/papers" className={navLinkClass}>
                Syllabus
              </NavLink>
              <NavLink to="/admin/premium" className={navLinkClass}>
                Premium
              </NavLink>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#475569] hover:text-rose-600 bg-[#F5F8F4] hover:bg-rose-50 rounded-lg border border-[#B8D8CF] hover:border-rose-200 transition cursor-pointer ml-1"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            /* STUDENT / PUBLIC HEADER */
            <>
              <div className="hidden md:flex items-center gap-1.5">
                <NavLink to="/" end className={navLinkClass}>
                  Home
                </NavLink>
                <NavLink to="/catalogue" className={navLinkClass}>
                  Syllabus
                </NavLink>
                <NavLink to="/challenges" className={navLinkClass}>
                  <span className="flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-[#0F766E]" />
                    Challenges
                  </span>
                </NavLink>
                <NavLink to="/premium" className={navLinkClass}>
                  <span className="flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-amber-600" />
                    Premium
                  </span>
                </NavLink>

                {isAuthenticated && (
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
                      <div className="text-xs font-semibold text-[#1E293B]">
                        {user?.name || 'User'}
                      </div>
                      <div className="text-[10px] text-[#0F766E] capitalize font-medium">
                        Student
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#475569] hover:text-rose-600 bg-[#F5F8F4] hover:bg-rose-50 rounded-lg border border-[#B8D8CF] hover:border-rose-200 transition cursor-pointer"
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
                      className="px-3.5 py-1.5 text-xs font-medium text-[#0F766E] bg-[#EAF3ED] hover:bg-[#DCEAE3] rounded-lg border border-[#B8D8CF] transition"
                    >
                      Student Login
                    </Link>
                    <Link
                      to="/register"
                      className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#0F766E] hover:bg-[#134E4A] rounded-lg shadow-xs transition"
                    >
                      Register
                    </Link>
                    <Link
                      to="/admin/login"
                      className="text-[#475569] hover:text-[#0F766E] p-1.5 rounded-lg transition"
                      title="Admin Portal"
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#475569] hover:text-[#0F766E] hover:bg-[#EAF3ED]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#B8D8CF] bg-white px-4 pt-3 pb-6 space-y-2">
          {isAdmin ? (
            /* ADMIN MOBILE DRAWER: Exactly 5 options: Home, Dashboard, Syllabus, Premium, Logout */
            <div className="space-y-1">
              <div className="text-[10px] font-semibold text-[#0F766E] uppercase tracking-wider px-3 pb-1">
                Admin Console
              </div>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-[#475569] hover:bg-[#EAF3ED] hover:text-[#0F766E]"
              >
                1. Home
              </Link>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-[#475569] hover:bg-[#EAF3ED] hover:text-[#0F766E]"
              >
                2. Dashboard
              </Link>
              <Link
                to="/admin/papers"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-[#475569] hover:bg-[#EAF3ED] hover:text-[#0F766E]"
              >
                3. Syllabus
              </Link>
              <Link
                to="/admin/premium"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-[#475569] hover:bg-[#EAF3ED] hover:text-[#0F766E]"
              >
                4. Premium
              </Link>
              <div className="pt-2 border-t border-[#B8D8CF]">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>5. Logout ({user?.name || 'Admin'})</span>
                </button>
              </div>
            </div>
          ) : (
            /* STUDENT / PUBLIC MOBILE DRAWER */
            <>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-[#475569] hover:bg-[#EAF3ED] hover:text-[#0F766E]"
              >
                Home
              </Link>
              <Link
                to="/catalogue"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-[#475569] hover:bg-[#EAF3ED] hover:text-[#0F766E]"
              >
                Syllabus Catalogue
              </Link>
              <Link
                to="/challenges"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-[#475569] hover:bg-[#EAF3ED] hover:text-[#0F766E]"
              >
                Weekly Challenges
              </Link>
              <Link
                to="/premium"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-[#475569] hover:bg-[#EAF3ED] hover:text-[#0F766E]"
              >
                Premium Plan
              </Link>

              {isAuthenticated && (
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-[#475569] hover:bg-[#EAF3ED]"
                >
                  My Profile
                </Link>
              )}

              <div className="pt-4 border-t border-[#B8D8CF] flex flex-col gap-2">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-center py-2 text-sm font-medium text-rose-600 bg-rose-50 rounded-lg border border-rose-200"
                  >
                    Logout ({user?.name})
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-2 text-sm font-medium text-[#0F766E] bg-[#EAF3ED] rounded-lg border border-[#B8D8CF]"
                    >
                      Student Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-2 text-sm font-medium text-white bg-[#0F766E] rounded-lg"
                    >
                      Student Registration
                    </Link>
                    <Link
                      to="/admin/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-1.5 text-xs text-[#475569] hover:text-[#0F766E]"
                    >
                      Admin Portal Login
                    </Link>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
