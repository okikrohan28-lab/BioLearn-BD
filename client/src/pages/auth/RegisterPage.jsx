import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
    <div className="max-w-md mx-auto my-8 p-6 sm:p-8 bg-slate-800/60 border border-slate-700/80 rounded-2xl shadow-xl">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3">
          <UserPlus className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-white">Student Registration</h2>
        <p className="text-xs text-slate-400 mt-1">
          Create your BioLearn BD account to begin HSC Biology learning.
        </p>
      </div>

      {generalError && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Full Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Asif Rahman"
            className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:outline-none text-white transition"
          />
          {errors.name && <p className="text-[11px] text-rose-400 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Email Address <span className="text-rose-400">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="student@example.com"
            className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:outline-none text-white transition"
          />
          {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Phone Number <span className="text-slate-500">(Optional)</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="017xxxxxxxx"
            className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:outline-none text-white transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Password <span className="text-rose-400">*</span>
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
            className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:outline-none text-white transition"
          />
          {errors.password && <p className="text-[11px] text-rose-400 mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Confirm Password <span className="text-rose-400">*</span>
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat your password"
            className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:outline-none text-white transition"
          />
          {errors.confirmPassword && (
            <p className="text-[11px] text-rose-400 mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 mt-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition shadow-md shadow-emerald-950 disabled:opacity-50 cursor-pointer"
        >
          {submitting ? 'Creating Account...' : 'Register as Student'}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-700/60 pt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-emerald-400 hover:underline font-medium">
          Log in here
        </Link>
      </div>
    </div>
  );
};
