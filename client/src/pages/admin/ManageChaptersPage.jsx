import { useState, useEffect } from 'react';
import {
  getChapters,
  getPapers,
  createChapter,
  updateChapter,
  deleteChapter,
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

export const ManageChaptersPage = () => {
  const [chapters, setChapters] = useState([]);
  const [papers, setPapers] = useState([]);
  const [selectedPaperFilter, setSelectedPaperFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [formData, setFormData] = useState({
    paper_id: '',
    chapter_no: 1,
    title: '',
    description: '',
    status: 'published',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [papersRes, chaptersRes] = await Promise.all([
        getPapers(),
        getChapters(selectedPaperFilter),
      ]);
      setPapers(papersRes.data || []);
      setChapters(chaptersRes.data || []);
      if (!formData.paper_id && papersRes.data?.length > 0) {
        setFormData((prev) => ({ ...prev, paper_id: papersRes.data[0]._id }));
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch chapters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPaperFilter]);

  const openCreateModal = () => {
    setEditingChapter(null);
    setFormData({
      paper_id: selectedPaperFilter || (papers[0]?._id || ''),
      chapter_no: chapters.length + 1,
      title: '',
      description: '',
      status: 'published',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (chapter) => {
    setEditingChapter(chapter);
    setFormData({
      paper_id: chapter.paper_id?._id || chapter.paper_id,
      chapter_no: chapter.chapter_no,
      title: chapter.title,
      description: chapter.description || '',
      status: chapter.status || 'published',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setNotification('');

    try {
      if (editingChapter) {
        await updateChapter(editingChapter._id, formData);
        setNotification(`Chapter ${formData.chapter_no} updated successfully.`);
      } else {
        await createChapter(formData);
        setNotification(`Chapter ${formData.chapter_no} created successfully.`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to save chapter');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (chapter) => {
    if (!window.confirm(`Delete Chapter ${chapter.chapter_no}: "${chapter.title}"?`)) {
      return;
    }

    try {
      await deleteChapter(chapter._id);
      setNotification(`Chapter ${chapter.chapter_no} deleted.`);
      fetchData();
    } catch (err) {
      setError(err.message || 'Cannot delete chapter with associated topics.');
    }
  };

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Chapters</h1>
          <p className="text-xs text-slate-400 mt-1">
            Maintain chapters under each Biology paper with enforced unique chapter numbers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Paper filter */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedPaperFilter}
              onChange={(e) => setSelectedPaperFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none"
            >
              <option value="">All Papers</option>
              {papers.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Chapter
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

      {/* Chapters Table */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading chapters...</div>
      ) : chapters.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-slate-800/40 border border-slate-800 text-slate-400 text-xs">
          No chapters found for this selection. Click &quot;Add Chapter&quot; above to create one.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-850/60 shadow">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">#</th>
                <th className="px-5 py-3.5">Chapter Title</th>
                <th className="px-5 py-3.5">Associated Paper</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {chapters.map((ch) => (
                <tr key={ch._id} className="hover:bg-slate-800/40 transition">
                  <td className="px-5 py-3.5 font-bold text-emerald-400">
                    {ch.chapter_no}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-white">
                    <div>{ch.title}</div>
                    {ch.description && (
                      <div className="text-[11px] text-slate-400">{ch.description}</div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-slate-300">
                    {ch.paper_id?.title || 'Unknown Paper'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] capitalize ${
                        ch.status === 'published'
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                          : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                      }`}
                    >
                      {ch.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(ch)}
                      className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                      title="Edit Chapter"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(ch)}
                      className="p-1.5 rounded hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                      title="Delete Chapter"
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
                {editingChapter ? 'Edit Chapter' : 'Add New Chapter'}
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
                  Associated Biology Paper <span className="text-rose-400">*</span>
                </label>
                <select
                  required
                  value={formData.paper_id}
                  onChange={(e) => setFormData({ ...formData, paper_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Select Paper...</option>
                  {papers.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Chapter # <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.chapter_no}
                    onChange={(e) => setFormData({ ...formData, chapter_no: parseInt(e.target.value, 10) || 1 })}
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
                  Chapter Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Cell and its structure"
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
                  placeholder="Summary of this chapter..."
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
                  {submitting ? 'Saving...' : editingChapter ? 'Update Chapter' : 'Create Chapter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
