import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DoodleBackgroundLight } from '../../components/DoodleBackground';
import { UserPlus, AlertCircle } from 'lucide-react';

export const RegisterPage = () => {
  const { registerStudent } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    return errs;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await registerStudent({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      navigate('/catalogue');
    } catch (err) {
      if (err.errors) {
        const fieldErrs = {};
        err.errors.forEach((e) => {
          fieldErrs[e.field] = e.message;
        });
        setErrors(fieldErrs);
      } else {
        setGeneralError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] py-10" style={{ backgroundColor: '#EAF3ED' }}>
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
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
            Student Registration
          </h2>
          <p className="text-xs mt-1" style={{ color: '#475569' }}>
            Create your BioLearn BD account to begin HSC Biology learning.
          </p>
        </div>

        {generalError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
              Full Name <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Asif Rahman"
              className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
              style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
            />
            {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
              Email Address <span className="text-rose-600">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="student@example.com"
              className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
              style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
            />
            {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
              Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="017xxxxxxxx"
              className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
              style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
              Password <span className="text-rose-600">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
              style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
            />
            {errors.password && <p className="text-[11px] text-rose-600 mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
              Confirm Password <span className="text-rose-600">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
              style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
            />
            {errors.confirmPassword && (
              <p className="text-[11px] text-rose-600 mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 mt-2 rounded-xl text-white font-bold text-xs transition shadow-xs disabled:opacity-50 cursor-pointer hover:opacity-95"
            style={{ backgroundColor: '#0F766E' }}
          >
            {submitting ? 'Creating Account...' : 'Register as Student'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs border-t pt-4" style={{ borderColor: '#B8D8CF', color: '#475569' }}>
          Already have an account?{' '}
          <Link to="/login" className="text-[#0F766E] font-bold hover:underline">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
};
