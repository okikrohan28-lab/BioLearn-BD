import { useState, useEffect } from 'react';
import { getPapers, createPaper, updatePaper, deletePaper } from '../../services/contentService';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Layers,
} from 'lucide-react';

export const ManagePapersPage = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPaper, setEditingPaper] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Biology',
    access_level: 'free',
    status: 'published',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPapers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPapers();
      setPapers(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch papers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const openCreateModal = () => {
    setEditingPaper(null);
    setFormData({
      title: '',
      subject: 'Biology',
      access_level: 'free',
      status: 'published',
      description: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (paper) => {
    setEditingPaper(paper);
    setFormData({
      title: paper.title,
      subject: paper.subject || 'Biology',
      access_level: paper.access_level || 'free',
      status: paper.status || 'published',
      description: paper.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setNotification('');

    try {
      if (editingPaper) {
        await updatePaper(editingPaper._id, formData);
        setNotification(`Paper "${formData.title}" updated successfully.`);
      } else {
        await createPaper(formData);
        setNotification(`Paper "${formData.title}" created successfully.`);
      }
      setIsModalOpen(false);
      fetchPapers();
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (paper) => {
    if (!window.confirm(`Are you sure you want to delete "${paper.title}"?`)) return;

    setError('');
    setNotification('');
    try {
      await deletePaper(paper._id);
      setNotification(`Paper "${paper.title}" deleted successfully.`);
      fetchPapers();
    } catch (err) {
      setError(err.message || 'Failed to delete paper');
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
            <Layers className="w-3.5 h-3.5" />
            <span>Curriculum Hierarchy (Level 1)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
            Manage Biology Papers
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: '#475569' }}>
            Create and maintain Botany (Paper 1) and Zoology (Paper 2) syllabi and access tiers.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white transition shadow-sm cursor-pointer hover:opacity-95"
          style={{ backgroundColor: '#0F766E' }}
        >
          <Plus className="w-4 h-4" />
          <span>Add New Paper</span>
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

      {/* Table */}
      {loading ? (
        <div className="py-16 text-center text-xs" style={{ color: '#475569' }}>Loading papers...</div>
      ) : papers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border text-xs space-y-2" style={{ background: '#F5F8F4', borderColor: '#B8D8CF', color: '#475569' }}>
          No papers found. Click &quot;Add New Paper&quot; above to create one.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border shadow-sm" style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}>
          <table className="w-full text-left text-xs" style={{ color: '#1E293B' }}>
            <thead className="border-b text-[11px] uppercase tracking-wider font-bold" style={{ backgroundColor: '#DCEAE3', borderColor: '#B8D8CF', color: '#134E4A' }}>
              <tr>
                <th className="px-5 py-3.5">Title</th>
                <th className="px-5 py-3.5">Subject</th>
                <th className="px-5 py-3.5">Access</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#B8D8CF' }}>
              {papers.map((p) => (
                <tr key={p._id} className="hover:bg-white/60 transition">
                  <td className="px-5 py-3.5 font-bold" style={{ color: '#134E4A' }}>
                    <div>{p.title}</div>
                    {p.description && <div className="text-[11px] font-normal text-slate-500 mt-0.5">{p.description}</div>}
                  </td>
                  <td className="px-5 py-3.5">{p.subject}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                        p.access_level === 'premium'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {p.access_level}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] capitalize font-medium ${
                        p.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-1.5">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1.5 rounded-lg border text-slate-600 hover:text-[#0F766E] hover:bg-white transition cursor-pointer"
                      style={{ borderColor: '#B8D8CF' }}
                      title="Edit Paper"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="p-1.5 rounded-lg border text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      style={{ borderColor: '#FECACA' }}
                      title="Delete Paper"
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
                {editingPaper ? 'Edit Biology Paper' : 'Create Biology Paper'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                  Paper Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Biology 1st Paper (Botany)"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                  style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-none"
                  style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                    Access Level
                  </label>
                  <select
                    value={formData.access_level}
                    onChange={(e) => setFormData({ ...formData, access_level: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none"
                    style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                  >
                    <option value="free">Free Access</option>
                    <option value="premium">Premium Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none"
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
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Overview of paper syllabus coverage..."
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
                  {submitting ? 'Saving...' : editingPaper ? 'Update Paper' : 'Create Paper'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
