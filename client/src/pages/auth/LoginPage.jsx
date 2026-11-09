import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const { loginStudent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/catalogue';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please provide both email and password.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await loginStudent(formData);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 sm:p-8 bg-slate-800/60 border border-slate-700/80 rounded-2xl shadow-xl">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3">
          <LogIn className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-white">Student Login</h2>
        <p className="text-xs text-slate-400 mt-1">
          Access your enrolled biology papers, quizzes, and learning materials.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="student@example.com"
            className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:outline-none text-white transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Your password"
            className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:outline-none text-white transition"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 mt-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition shadow-md shadow-emerald-950 disabled:opacity-50 cursor-pointer"
        >
          {submitting ? 'Logging in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-2 text-xs text-slate-400 border-t border-slate-700/60 pt-4">
        <div>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-emerald-400 hover:underline font-medium">
            Register here
          </Link>
        </div>
        <div>
          <Link to="/admin/login" className="text-slate-500 hover:text-slate-300 text-[11px]">
            Administrator Portal Sign In &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};
