import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
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
    <div className="max-w-2xl mx-auto my-8 p-6 sm:p-8 bg-slate-800/60 border border-slate-700/80 rounded-2xl shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-700/80 pb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-emerald-950">
          {user?.name ? user.name[0].toUpperCase() : 'S'}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
              Verified Student
            </span>
            <span className="text-xs text-slate-400">{user?.email}</span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Full Name (Editable)
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:outline-none text-white transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Phone Number (Editable)
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. 017xxxxxxxx"
              className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:outline-none text-white transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Email Address (Read Only)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-600 absolute left-3 top-3" />
              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg bg-slate-950/80 border border-slate-800 text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Account Status (Read Only)
            </label>
            <div className="relative">
              <Shield className="w-4 h-4 text-slate-600 absolute left-3 top-3" />
              <input
                type="text"
                disabled
                value={user?.status || 'active'}
                className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg bg-slate-950/80 border border-slate-800 text-slate-400 capitalize cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition shadow-md shadow-emerald-950 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
