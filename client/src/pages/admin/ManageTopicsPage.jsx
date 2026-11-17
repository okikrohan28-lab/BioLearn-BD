import { useState, useEffect } from 'react';
import {
  getTopics,
  getChapters,
  createTopic,
  updateTopic,
  deleteTopic,
} from '../../services/contentService';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Bookmark,
} from 'lucide-react';

export const ManageTopicsPage = () => {
  const [topics, setTopics] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedChapterFilter, setSelectedChapterFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [formData, setFormData] = useState({
    chapter_id: '',
    topic_no: 1,
    title: '',
    description: '',
    status: 'published',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [chaptersRes, topicsRes] = await Promise.all([
        getChapters(),
        getTopics(selectedChapterFilter),
      ]);
      setChapters(chaptersRes.data || []);
      setTopics(topicsRes.data || []);
      if (!formData.chapter_id && chaptersRes.data?.length > 0) {
        setFormData((prev) => ({ ...prev, chapter_id: chaptersRes.data[0]._id }));
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch topics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedChapterFilter]);

  const openCreateModal = () => {
    setEditingTopic(null);
    setFormData({
      chapter_id: selectedChapterFilter || (chapters[0]?._id || ''),
      topic_no: topics.length + 1,
      title: '',
      description: '',
      status: 'published',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (topic) => {
    setEditingTopic(topic);
    setFormData({
      chapter_id: topic.chapter_id?._id || topic.chapter_id,
      topic_no: topic.topic_no,
      title: topic.title,
      description: topic.description || '',
      status: topic.status || 'published',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.chapter_id) {
      setError('Please select an associated chapter.');
      return;
    }

    setSubmitting(true);
    setError('');
    setNotification('');

    try {
      if (editingTopic) {
        await updateTopic(editingTopic._id, formData);
        setNotification(`Topic ${formData.topic_no}: "${formData.title}" updated successfully.`);
      } else {
        await createTopic(formData);
        setNotification(`Topic ${formData.topic_no}: "${formData.title}" created successfully.`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save topic.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (topic) => {
    if (!window.confirm(`Are you sure you want to delete Topic ${topic.topic_no}: "${topic.title}"?`)) return;

    setError('');
    setNotification('');
    try {
      await deleteTopic(topic._id);
      setNotification(`Topic ${topic.topic_no} deleted successfully.`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete topic.');
    }
  };

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto px-4" style={{ color: '#1E293B' }}>
      {/* Header */}
      <div className="border-b pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" style={{ borderColor: '#B8D8CF' }}>
        <div>
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2"
            style={{ backgroundColor: '#DCEAE3', color: '#0F766E' }}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Curriculum Hierarchy (Level 3)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
            Manage Biology Topics
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: '#475569' }}>
            Attach granular sub-lessons to chapters with unique topic sequences.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white transition shadow-sm cursor-pointer hover:opacity-95"
          style={{ backgroundColor: '#0F766E' }}
        >
          <Plus className="w-4 h-4" />
          <span>Add New Topic</span>
        </button>
      </div>

      {/* Notifications */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-700 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter by Chapter */}
      <div className="p-4 rounded-2xl border shadow-sm flex items-center gap-3" style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}>
        <span className="text-xs font-bold text-[#134E4A] shrink-0">Filter by Chapter:</span>
        <select
          value={selectedChapterFilter}
          onChange={(e) => setSelectedChapterFilter(e.target.value)}
          className="px-3.5 py-1.5 text-xs rounded-xl border bg-white focus:outline-none"
          style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
        >
          <option value="">All Chapters ({chapters.length})</option>
          {chapters.map((c) => (
            <option key={c._id} value={c._id}>
              Ch. {c.chapter_no}: {c.title}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-16 text-center text-xs" style={{ color: '#475569' }}>Loading topics...</div>
      ) : topics.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border text-xs space-y-2" style={{ background: '#F5F8F4', borderColor: '#B8D8CF', color: '#475569' }}>
          No topics found for this selection. Click &quot;Add New Topic&quot; above.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border shadow-sm" style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}>
          <table className="w-full text-left text-xs" style={{ color: '#1E293B' }}>
            <thead className="border-b text-[11px] uppercase tracking-wider font-bold" style={{ backgroundColor: '#DCEAE3', borderColor: '#B8D8CF', color: '#134E4A' }}>
              <tr>
                <th className="px-5 py-3.5">Topic No.</th>
                <th className="px-5 py-3.5">Topic Title</th>
                <th className="px-5 py-3.5">Associated Chapter</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#B8D8CF' }}>
              {topics.map((t) => (
                <tr key={t._id} className="hover:bg-white/60 transition">
                  <td className="px-5 py-3.5 font-bold text-[#0F766E]">{t.topic_no}</td>
                  <td className="px-5 py-3.5 font-bold" style={{ color: '#134E4A' }}>
                    <div>{t.title}</div>
                    {t.description && <div className="text-[11px] font-normal text-slate-500 mt-0.5">{t.description}</div>}
                  </td>
                  <td className="px-5 py-3.5 text-slate-700">
                    {t.chapter_id?.title ? `Ch. ${t.chapter_id.chapter_no}: ${t.chapter_id.title}` : 'Unknown Chapter'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] capitalize font-medium ${
                        t.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-1.5">
                    <button
                      onClick={() => openEditModal(t)}
                      className="p-1.5 rounded-lg border text-slate-600 hover:text-[#0F766E] hover:bg-white transition cursor-pointer"
                      style={{ borderColor: '#B8D8CF' }}
                      title="Edit Topic"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(t)}
                      className="p-1.5 rounded-lg border text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      style={{ borderColor: '#FECACA' }}
                      title="Delete Topic"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div
            className="w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-5 border shadow-xl"
            style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}
          >
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: '#B8D8CF' }}>
              <h3 className="text-lg font-bold" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
                {editingTopic ? 'Edit Topic Details' : 'Add New Topic'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                  Parent Chapter *
                </label>
                <select
                  required
                  value={formData.chapter_id}
                  onChange={(e) => setFormData({ ...formData, chapter_id: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                  style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                >
                  <option value="">-- Choose Chapter --</option>
                  {chapters.map((c) => (
                    <option key={c._id} value={c._id}>
                      Ch. {c.chapter_no}: {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                    Topic Number *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.topic_no}
                    onChange={(e) => setFormData({ ...formData, topic_no: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-none"
                    style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-none"
                    style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                  Topic Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Mitochondria & Cellular Respiration"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                  style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of topic content..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-none"
                  style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                />
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
                  {submitting ? 'Saving...' : editingTopic ? 'Update Topic' : 'Create Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
