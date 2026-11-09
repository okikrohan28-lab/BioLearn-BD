import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export const AdminLoginPage = () => {
  const { loginAdministrator } = useAuth();
  const navigate = useNavigate();

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
      setError('Please provide administrative credentials.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await loginAdministrator(formData);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Admin authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 sm:p-8 bg-slate-800/80 border border-emerald-900/40 rounded-2xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500"></div>

      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-white">Administrator Portal</h2>
        <p className="text-xs text-slate-400 mt-1">
          Authorized personnel only: Content management & curriculum operations.
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
            Admin Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="admin@biolearnbd.com"
            className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:outline-none text-white transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Admin Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••••••"
            className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:outline-none text-white transition"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 mt-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition shadow-md shadow-emerald-950 disabled:opacity-50 cursor-pointer"
        >
          {submitting ? 'Verifying Credentials...' : 'Authenticate as Admin'}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-800 pt-4">
        Default dev seed: <code className="text-slate-400">admin@biolearnbd.com</code> / <code className="text-slate-400">Admin@123456</code>
      </div>
    </div>
  );
};
