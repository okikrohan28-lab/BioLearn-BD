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
  FileText,
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
    if (!formData.paper_id) {
      setError('Please select an associated paper.');
      return;
    }

    setSubmitting(true);
    setError('');
    setNotification('');

    try {
      if (editingChapter) {
        await updateChapter(editingChapter._id, formData);
        setNotification(`Chapter ${formData.chapter_no}: "${formData.title}" updated successfully.`);
      } else {
        await createChapter(formData);
        setNotification(`Chapter ${formData.chapter_no}: "${formData.title}" created successfully.`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save chapter.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (chapter) => {
    if (!window.confirm(`Are you sure you want to delete Chapter ${chapter.chapter_no}: "${chapter.title}"?`)) return;

    setError('');
    setNotification('');
    try {
      await deleteChapter(chapter._id);
      setNotification(`Chapter ${chapter.chapter_no} deleted successfully.`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete chapter.');
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
            <FileText className="w-3.5 h-3.5" />
            <span>Curriculum Hierarchy (Level 2)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
            Manage Biology Chapters
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: '#475569' }}>
            Enforce sequential chapter numbering within Paper 1 & Paper 2.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white transition shadow-sm cursor-pointer hover:opacity-95"
          style={{ backgroundColor: '#0F766E' }}
        >
          <Plus className="w-4 h-4" />
          <span>Add New Chapter</span>
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

      {/* Filter by Paper */}
      <div className="p-4 rounded-2xl border shadow-sm flex items-center gap-3" style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}>
        <span className="text-xs font-bold text-[#134E4A] shrink-0">Filter by Paper:</span>
        <select
          value={selectedPaperFilter}
          onChange={(e) => setSelectedPaperFilter(e.target.value)}
          className="px-3.5 py-1.5 text-xs rounded-xl border bg-white focus:outline-none"
          style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
        >
          <option value="">All Papers ({papers.length})</option>
          {papers.map((p) => (
            <option key={p._id} value={p._id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-16 text-center text-xs" style={{ color: '#475569' }}>Loading chapters...</div>
      ) : chapters.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border text-xs space-y-2" style={{ background: '#F5F8F4', borderColor: '#B8D8CF', color: '#475569' }}>
          No chapters found for this selection. Click &quot;Add New Chapter&quot; above.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border shadow-sm" style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}>
          <table className="w-full text-left text-xs" style={{ color: '#1E293B' }}>
            <thead className="border-b text-[11px] uppercase tracking-wider font-bold" style={{ backgroundColor: '#DCEAE3', borderColor: '#B8D8CF', color: '#134E4A' }}>
              <tr>
                <th className="px-5 py-3.5">No.</th>
                <th className="px-5 py-3.5">Chapter Title</th>
                <th className="px-5 py-3.5">Associated Paper</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#B8D8CF' }}>
              {chapters.map((c) => (
                <tr key={c._id} className="hover:bg-white/60 transition">
                  <td className="px-5 py-3.5 font-bold text-[#0F766E]">{c.chapter_no}</td>
                  <td className="px-5 py-3.5 font-bold" style={{ color: '#134E4A' }}>
                    <div>{c.title}</div>
                    {c.description && <div className="text-[11px] font-normal text-slate-500 mt-0.5">{c.description}</div>}
                  </td>
                  <td className="px-5 py-3.5 text-slate-700">
                    {c.paper_id?.title || 'Unknown Paper'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] capitalize font-medium ${
                        c.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-1.5">
                    <button
                      onClick={() => openEditModal(c)}
                      className="p-1.5 rounded-lg border text-slate-600 hover:text-[#0F766E] hover:bg-white transition cursor-pointer"
                      style={{ borderColor: '#B8D8CF' }}
                      title="Edit Chapter"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      className="p-1.5 rounded-lg border text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      style={{ borderColor: '#FECACA' }}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div
            className="w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-5 border shadow-xl"
            style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}
          >
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: '#B8D8CF' }}>
              <h3 className="text-lg font-bold" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
                {editingChapter ? 'Edit Chapter Details' : 'Add New Chapter'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                  Parent Biology Paper *
                </label>
                <select
                  required
                  value={formData.paper_id}
                  onChange={(e) => setFormData({ ...formData, paper_id: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                  style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                >
                  <option value="">-- Choose Paper --</option>
                  {papers.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title} ({p.subject})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                    Chapter Number *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.chapter_no}
                    onChange={(e) => setFormData({ ...formData, chapter_no: parseInt(e.target.value, 10) || 1 })}
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
                  Chapter Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Cell & Its Structure"
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
                  placeholder="Brief synopsis of chapter curriculum..."
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
