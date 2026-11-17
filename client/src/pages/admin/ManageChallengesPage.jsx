import { useState, useEffect } from 'react';
import {
  getChallenges,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  getQuizzes,
} from '../../services/contentService';
import {
  Trophy,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Calendar,
  Clock,
  Crown,
} from 'lucide-react';

export const ManageChallengesPage = () => {
  const [challenges, setChallenges] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [formData, setFormData] = useState({
    quiz_id: '',
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    is_premium_only: true,
    status: 'published',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [chRes, qRes] = await Promise.all([
        getChallenges(),
        getQuizzes({}),
      ]);
      setChallenges(chRes.data || []);
      setQuizzes(qRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load weekly challenges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingChallenge(null);
    const now = new Date();
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    setFormData({
      quiz_id: quizzes[0]?._id || '',
      title: '',
      description: '',
      start_date: now.toISOString().slice(0, 16),
      end_date: nextWeek.toISOString().slice(0, 16),
      is_premium_only: true,
      status: 'published',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (ch) => {
    setEditingChallenge(ch);
    setFormData({
      quiz_id: ch.quiz_id?._id || ch.quiz_id || '',
      title: ch.title || '',
      description: ch.description || '',
      start_date: ch.start_date ? new Date(ch.start_date).toISOString().slice(0, 16) : '',
      end_date: ch.end_date ? new Date(ch.end_date).toISOString().slice(0, 16) : '',
      is_premium_only: ch.is_premium_only !== undefined ? ch.is_premium_only : true,
      status: ch.status || 'published',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.quiz_id) {
      setError('Please select an assessment quiz to attach.');
      return;
    }
    if (!formData.title.trim()) {
      setError('Challenge title is required.');
      return;
    }
    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      setError('Challenge End Date must be after the Start Date.');
      return;
    }

    setSubmitting(true);
    setError('');
    setNotification('');

    try {
      const payload = {
        quiz_id: formData.quiz_id,
        title: formData.title,
        description: formData.description,
        start_date: new Date(formData.start_date),
        end_date: new Date(formData.end_date),
        is_premium_only: formData.is_premium_only,
        status: formData.status,
      };

      if (editingChallenge) {
        await updateChallenge(editingChallenge._id, payload);
        setNotification(`Challenge "${formData.title}" updated successfully.`);
      } else {
        await createChallenge(payload);
        setNotification(`Challenge "${formData.title}" created successfully.`);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save challenge.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (ch) => {
    if (!window.confirm(`Delete weekly challenge "${ch.title}"?`)) return;

    setError('');
    setNotification('');
    try {
      await deleteChallenge(ch._id);
      setNotification(`Challenge "${ch.title}" deleted.`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete challenge.');
    }
  };

  const now = new Date();

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto px-4" style={{ color: '#1E293B' }}>
      {/* Header */}
      <div className="border-b pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" style={{ borderColor: '#B8D8CF' }}>
        <div>
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2"
            style={{ backgroundColor: '#DCEAE3', color: '#0F766E' }}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Weekly Competitive Challenges</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
            Manage Weekly Challenges
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: '#475569' }}>
            Schedule and configure timed competitive challenges for Premium HSC and Admission students.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white transition shadow-sm cursor-pointer hover:opacity-95"
          style={{ backgroundColor: '#0F766E' }}
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Challenge</span>
        </button>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl text-xs flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl text-xs flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Challenges Table */}
      <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}>
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#B8D8CF' }}>
          <h2 className="text-sm font-bold" style={{ color: '#134E4A' }}>
            Scheduled Challenges ({challenges.length})
          </h2>
          <span className="text-[11px]" style={{ color: '#475569' }}>
            Challenge dates are validated securely on the backend
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: '#0F766E', borderTopColor: 'transparent' }} />
            <p className="text-xs" style={{ color: '#475569' }}>Loading challenges...</p>
          </div>
        ) : challenges.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Trophy className="w-10 h-10 mx-auto" style={{ color: '#8BBDB0' }} />
            <h3 className="text-sm font-bold" style={{ color: '#134E4A' }}>No Challenges Scheduled</h3>
            <p className="text-xs" style={{ color: '#475569' }}>
              Create a weekly challenge to engage students with timed competitive tests.
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#B8D8CF' }}>
            {challenges.map((ch) => {
              const startDate = new Date(ch.start_date);
              const endDate = new Date(ch.end_date);
              const isLive = now >= startDate && now <= endDate;
              const isEnded = now > endDate;
              const isUpcoming = now < startDate;

              return (
                <div key={ch._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-white/60 transition">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                      <Trophy className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold" style={{ color: '#134E4A' }}>
                          {ch.title}
                        </h4>
                        {isLive && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Live Active
                          </span>
                        )}
                        {isUpcoming && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            Upcoming
                          </span>
                        )}
                        {isEnded && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                            Ended
                          </span>
                        )}
                        {ch.is_premium_only && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                            <Crown className="w-3 h-3" /> Premium
                          </span>
                        )}
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {ch.status}
                        </span>
                      </div>

                      {ch.description && (
                        <p className="text-xs line-clamp-1 max-w-xl" style={{ color: '#475569' }}>
                          {ch.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-[11px] pt-1" style={{ color: '#475569' }}>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#0F766E]" />
                          {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                        </span>
                        {ch.quiz_id && (
                          <span className="font-medium text-[#0F766E]">
                            Attached Quiz: {ch.quiz_id.title || 'Selected'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => openEditModal(ch)}
                      className="p-2 rounded-lg border text-slate-600 hover:text-[#0F766E] hover:bg-white transition cursor-pointer"
                      style={{ borderColor: '#B8D8CF' }}
                      title="Edit Challenge"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ch)}
                      className="p-2 rounded-lg border text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      style={{ borderColor: '#FECACA' }}
                      title="Delete Challenge"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div
            className="w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-5 border shadow-xl max-h-[90vh] overflow-y-auto"
            style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}
          >
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: '#B8D8CF' }}>
              <h3 className="text-lg font-bold" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
                {editingChallenge ? 'Edit Weekly Challenge' : 'Schedule Weekly Challenge'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                  Challenge Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. HSC National Admission Challenge — Botany Paper 1"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                  style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                  Select Assessment Quiz *
                </label>
                <select
                  required
                  value={formData.quiz_id}
                  onChange={(e) => setFormData({ ...formData, quiz_id: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                  style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                >
                  <option value="">-- Choose Quiz --</option>
                  {quizzes.map((q) => (
                    <option key={q._id} value={q._id}>
                      {q.title} ({q.quiz_type} &bull; {q.total_marks} Marks)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                  Instructions / Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Information regarding eligibility, syllabus scope, and rules..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-none"
                  style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none"
                    style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none"
                    style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                    Access Restriction
                  </label>
                  <select
                    value={formData.is_premium_only ? 'premium' : 'all'}
                    onChange={(e) => setFormData({ ...formData, is_premium_only: e.target.value === 'premium' })}
                    className="w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none"
                    style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                  >
                    <option value="premium">Premium Students Only</option>
                    <option value="all">Free & Open to All</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                    Publication Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none"
                    style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: '#B8D8CF' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border transition hover:bg-slate-100"
                  style={{ borderColor: '#B8D8CF', color: '#475569' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white transition shadow-sm cursor-pointer disabled:opacity-50"
                  style={{ backgroundColor: '#0F766E' }}
                >
                  {submitting ? 'Saving...' : editingChallenge ? 'Update Challenge' : 'Schedule Challenge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

