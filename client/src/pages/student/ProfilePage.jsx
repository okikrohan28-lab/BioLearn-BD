import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DoodleBackgroundLight } from '../../components/DoodleBackground';
import { User, Mail, Phone, Shield, Save, CheckCircle, AlertCircle } from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateStudentProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (successMsg) setSuccessMsg('');
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Name cannot be empty.');
      return;
    }

    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await updateStudentProfile(formData);
      setSuccessMsg('Your profile has been updated successfully!');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] py-10" style={{ backgroundColor: '#EAF3ED' }}>
      <DoodleBackgroundLight />

      <div
        className="relative z-10 max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6"
        style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 border-b pb-6" style={{ borderColor: '#B8D8CF' }}>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md"
            style={{ backgroundColor: '#0F766E' }}
          >
            {user?.name ? user.name[0].toUpperCase() : 'S'}
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
              {user?.name || 'Student Profile'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: '#DCEAE3', color: '#0F766E' }}
              >
                Verified Student
              </span>
              <span className="text-xs" style={{ color: '#475569' }}>
                {user?.email}
              </span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
              Full Name (Editable)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
              Phone Number (Editable)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 017xxxxxxxx"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                Email Address (Read Only)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border bg-slate-100 text-slate-500 cursor-not-allowed"
                  style={{ borderColor: '#B8D8CF' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                Account Status (Read Only)
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  disabled
                  value={user?.status || 'active'}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border bg-slate-100 text-slate-500 capitalize cursor-not-allowed"
                  style={{ borderColor: '#B8D8CF' }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-xs transition shadow-sm disabled:opacity-50 cursor-pointer hover:opacity-95"
              style={{ backgroundColor: '#0F766E' }}
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
