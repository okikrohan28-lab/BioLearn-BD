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
  Filter,
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
    setSubmitting(true);
    setError('');
    setNotification('');

    try {
      if (editingTopic) {
        await updateTopic(editingTopic._id, formData);
        setNotification(`Topic ${formData.topic_no} updated successfully.`);
      } else {
        await createTopic(formData);
        setNotification(`Topic ${formData.topic_no} created successfully.`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to save topic');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (topic) => {
    if (!window.confirm(`Delete Topic ${topic.topic_no}: "${topic.title}"?`)) {
      return;
    }

    try {
      await deleteTopic(topic._id);
      setNotification(`Topic ${topic.topic_no} deleted.`);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete topic.');
    }
  };

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              Deliverable 2.3
            </span>
            <h1 className="text-2xl font-bold text-white">Manage Topics</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Organize individual syllabus topics under chapters with strictly enforced topic numbers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Chapter filter */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedChapterFilter}
              onChange={(e) => setSelectedChapterFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none max-w-xs truncate"
            >
              <option value="">All Chapters</option>
              {chapters.map((ch) => (
                <option key={ch._id} value={ch._id}>
                  Ch {ch.chapter_no}: {ch.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Topic
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification('')} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Topics Table */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading topics...</div>
      ) : topics.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-slate-800/40 border border-slate-800 text-slate-400 text-xs">
          No topics found for this selection. Click &quot;Add Topic&quot; above to create one.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-850/60 shadow">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">#</th>
                <th className="px-5 py-3.5">Topic Title</th>
                <th className="px-5 py-3.5">Associated Chapter</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {topics.map((t) => (
                <tr key={t._id} className="hover:bg-slate-800/40 transition">
                  <td className="px-5 py-3.5 font-bold text-cyan-400">
                    {t.topic_no}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-white">
                    <div>{t.title}</div>
                    {t.description && (
                      <div className="text-[11px] text-slate-400">{t.description}</div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-slate-300">
                    {t.chapter_id?.title
                      ? `Ch ${t.chapter_id.chapter_no}: ${t.chapter_id.title}`
                      : 'Unknown Chapter'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] capitalize ${
                        t.status === 'published'
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                          : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(t)}
                      className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                      title="Edit Topic"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(t)}
                      className="p-1.5 rounded hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition cursor-pointer"
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

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="max-w-lg w-full bg-slate-850 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingTopic ? 'Edit Topic' : 'Add New Topic'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Associated Chapter <span className="text-rose-400">*</span>
                </label>
                <select
                  required
                  value={formData.chapter_id}
                  onChange={(e) => setFormData({ ...formData, chapter_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Select Chapter...</option>
                  {chapters.map((ch) => (
                    <option key={ch._id} value={ch._id}>
                      Ch {ch.chapter_no}: {ch.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Topic # <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.topic_no}
                    onChange={(e) => setFormData({ ...formData, topic_no: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Topic Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Structure of DNA & RNA"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary of this topic..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-700/80">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50"
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
