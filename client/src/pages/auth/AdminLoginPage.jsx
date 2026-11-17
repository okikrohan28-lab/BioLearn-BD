import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DoodleBackgroundLight } from '../../components/DoodleBackground';
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
    <div className="relative min-h-[80vh] py-12" style={{ backgroundColor: '#EAF3ED' }}>
      <DoodleBackgroundLight />

      <div
        className="relative z-10 max-w-md mx-auto p-6 sm:p-8 rounded-3xl border shadow-sm"
        style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}
      >
        <div className="text-center mb-6">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 text-white shadow-xs"
            style={{ backgroundColor: '#0F766E' }}
          >
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
            Administrator Portal
          </h2>
          <p className="text-xs mt-1" style={{ color: '#475569' }}>
            Authorized personnel only: Curriculum management & assessment operations.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
              Administrator Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="admin@biolearnbd.com"
              className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
              style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Your secure password"
              className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
              style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 mt-2 rounded-xl text-white font-bold text-xs transition shadow-xs disabled:opacity-50 cursor-pointer hover:opacity-95"
            style={{ backgroundColor: '#0F766E' }}
          >
            {submitting ? 'Authenticating...' : 'Sign In as Administrator'}
          </button>
        </form>
      </div>
    </div>
  );
};
