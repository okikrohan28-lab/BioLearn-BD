import { useState, useEffect } from 'react';
import {
  getPapers,
  getChapters,
  getTopics,
  getResources,
  createResource,
  updateResource,
  deleteResource,
  resolveFileUrl,
} from '../../services/contentService';
import {
  FileText,
  Image,
  Video,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  ExternalLink,
  UploadCloud,
  File,
  Paperclip,
} from 'lucide-react';

export const ManageResourcesPage = () => {
  const [papers, setPapers] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);
  const [resources, setResources] = useState([]);

  // Selection state
  const [selectedPaperId, setSelectedPaperId] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');

  const [loading, setLoading] = useState(true);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({
    resource_type: 'note',
    title: '',
    content: '',
    image_url: '',
    youtube_url: '',
    order: 0,
    status: 'published',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileError, setFileError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Initial load: papers
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      try {
        const res = await getPapers();
        const pList = res.data || [];
        setPapers(pList);
        if (pList.length > 0) {
          setSelectedPaperId(pList[0]._id);
        }
      } catch (err) {
        setError(err.message || 'Failed to load papers');
      } finally {
        setLoading(false);
      }
    };
    loadInitial();
  }, []);

  // When selected paper changes, load chapters
  useEffect(() => {
    if (!selectedPaperId) return;
    const loadChapters = async () => {
      try {
        const res = await getChapters(selectedPaperId);
        const cList = res.data || [];
        setChapters(cList);
        if (cList.length > 0) {
          setSelectedChapterId(cList[0]._id);
        } else {
          setSelectedChapterId('');
          setTopics([]);
          setSelectedTopicId('');
          setResources([]);
        }
      } catch (err) {
        setError(err.message || 'Failed to load chapters');
      }
    };
    loadChapters();
  }, [selectedPaperId]);

  // When selected chapter changes, load topics
  useEffect(() => {
    if (!selectedChapterId) return;
    const loadTopics = async () => {
      try {
        const res = await getTopics(selectedChapterId);
        const tList = res.data || [];
        setTopics(tList);
        if (tList.length > 0) {
          setSelectedTopicId(tList[0]._id);
        } else {
          setSelectedTopicId('');
          setResources([]);
        }
      } catch (err) {
        setError(err.message || 'Failed to load topics');
      }
    };
    loadTopics();
  }, [selectedChapterId]);

  // When selected topic changes, load resources
  useEffect(() => {
    if (!selectedTopicId) return;
    fetchResources(selectedTopicId);
  }, [selectedTopicId]);

  const fetchResources = async (tId) => {
    setResourcesLoading(true);
    try {
      const res = await getResources(tId);
      setResources(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load resources');
    } finally {
      setResourcesLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError('');
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    const validExts = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    if (!validExts.includes(ext)) {
      setFileError('Invalid file format. Allowed formats: PDF (.pdf), Word (.doc, .docx), JPEG (.jpg, .jpeg), PNG (.png).');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setFileError('File size exceeds the 25 MB limit.');
      return;
    }

    setSelectedFile(file);

    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      const reader = new FileReader();
      reader.onload = (event) => setFilePreview(event.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileError('');
  };

  const openCreateModal = () => {
    if (!selectedTopicId) {
      setError('Please select a topic first.');
      return;
    }
    setEditingResource(null);
    setSelectedFile(null);
    setFilePreview(null);
    setFileError('');
    setFormData({
      resource_type: 'note',
      title: '',
      content: '',
      image_url: '',
      youtube_url: '',
      order: resources.length + 1,
      status: 'published',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (res) => {
    setEditingResource(res);
    setSelectedFile(null);
    setFilePreview(null);
    setFileError('');
    setFormData({
      resource_type: res.resource_type === 'youtube' ? 'youtube' : res.resource_type || 'note',
      title: res.title || '',
      content: res.content || '',
      image_url: res.image_url || '',
      youtube_url: res.youtube_url || '',
      order: res.order || 0,
      status: res.status || 'published',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required.');
      return;
    }

    setSubmitting(true);
    setError('');
    setNotification('');

    try {
      let payload;
      if (selectedFile) {
        payload = new FormData();
        payload.append('topic_id', selectedTopicId);
        payload.append('resource_type', formData.resource_type);
        payload.append('title', formData.title.trim());
        payload.append('content', formData.content || '');
        payload.append('image_url', formData.image_url || '');
        payload.append('youtube_url', formData.youtube_url || '');
        payload.append('order', formData.order || 0);
        payload.append('status', formData.status || 'published');
        payload.append('file', selectedFile);
      } else {
        payload = {
          ...formData,
          topic_id: selectedTopicId,
        };
      }

      if (editingResource) {
        await updateResource(editingResource._id, payload);
        setNotification(`Resource "${formData.title}" updated successfully.`);
      } else {
        await createResource(payload);
        setNotification(`Resource "${formData.title}" created successfully.`);
      }

      setIsModalOpen(false);
      fetchResources(selectedTopicId);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save resource.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (res) => {
    if (!window.confirm(`Are you sure you want to delete "${res.title}"?`)) return;

    setError('');
    setNotification('');
    try {
      await deleteResource(res._id);
      setNotification(`Resource "${res.title}" deleted successfully.`);
      fetchResources(selectedTopicId);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete resource.');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto px-4" style={{ color: '#1E293B' }}>
      {/* Page Header */}
      <div className="border-b pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" style={{ borderColor: '#B8D8CF' }}>
        <div>
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2"
            style={{ backgroundColor: '#DCEAE3', color: '#0F766E' }}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Resource & Document Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
            Manage Learning Resources
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: '#475569' }}>
            Upload lesson PDFs, Word documents, anatomical diagrams (JPEG/PNG), and YouTube video lessons under specific topics.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          disabled={!selectedTopicId}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl text-white transition shadow-sm cursor-pointer disabled:opacity-50 self-start sm:self-auto hover:opacity-95"
          style={{ backgroundColor: '#0F766E' }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Resource to Topic</span>
        </button>
      </div>

      {notification && (
        <div className="p-4 rounded-xl text-xs flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl text-xs flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* 3-Tier Hierarchy Selection Card */}
      <div
        className="p-5 sm:p-6 rounded-3xl border shadow-xs space-y-4"
        style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}
      >
        <div className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">
          Target Topic Navigator
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Select Paper */}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
              1. Biology Paper
            </label>
            <select
              value={selectedPaperId}
              onChange={(e) => setSelectedPaperId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
              style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
            >
              {papers.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Select Chapter */}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
              2. Chapter
            </label>
            <select
              value={selectedChapterId}
              onChange={(e) => setSelectedChapterId(e.target.value)}
              disabled={chapters.length === 0}
              className="w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
              style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
            >
              {chapters.length === 0 ? (
                <option value="">No chapters in paper</option>
              ) : (
                chapters.map((c) => (
                  <option key={c._id} value={c._id}>
                    Ch {c.chapter_no}: {c.title}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Select Topic */}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
              3. Topic
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              disabled={topics.length === 0}
              className="w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
              style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
            >
              {topics.length === 0 ? (
                <option value="">No topics in chapter</option>
              ) : (
                topics.map((t) => (
                  <option key={t._id} value={t._id}>
                    Topic {t.topic_no}: {t.title}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Resources List */}
      <div
        className="rounded-3xl border overflow-hidden shadow-xs"
        style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}
      >
        <div className="p-4 sm:p-5 border-b flex items-center justify-between" style={{ borderColor: '#B8D8CF', backgroundColor: '#EAF3ED' }}>
          <div className="text-xs font-bold uppercase tracking-wider text-[#134E4A]">
            Published & Draft Resources ({resources.length})
          </div>
        </div>

        {resourcesLoading ? (
          <div className="py-16 text-center text-xs text-slate-500">Loading resources...</div>
        ) : resources.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <UploadCloud className="w-10 h-10 mx-auto" style={{ color: '#8BBDB0' }} />
            <h4 className="text-sm font-bold" style={{ color: '#134E4A' }}>No Resources For This Topic</h4>
            <p className="text-xs max-w-sm mx-auto" style={{ color: '#475569' }}>
              Click "Add Resource to Topic" above to upload study PDFs, Word notes, anatomical diagrams, or video lessons.
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#DCEAE3' }}>
            {resources.map((res) => {
              const isNote = res.resource_type === 'note';
              const isDiagram = res.resource_type === 'diagram';
              const isVideo = res.resource_type === 'youtube' || res.resource_type === 'video';

              return (
                <div key={res._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-white/60 transition">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isNote
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : isDiagram
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {isNote && <FileText className="w-5 h-5" />}
                      {isDiagram && <Image className="w-5 h-5" />}
                      {isVideo && <Video className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold" style={{ color: '#134E4A' }}>
                          {res.title}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            res.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {res.status}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                          Seq: {res.order}
                        </span>
                      </div>

                      {/* Attached File Display */}
                      {res.file_url && (
                        <div className="flex items-center gap-2 text-xs text-[#0F766E] font-medium pt-0.5">
                          <Paperclip className="w-3.5 h-3.5 shrink-0" />
                          <span>File: <strong>{res.file_name || 'Uploaded Document'}</strong></span>
                          {res.file_size ? <span className="text-[11px] text-slate-500">({formatFileSize(res.file_size)})</span> : null}
                          <a
                            href={resolveFileUrl(res.file_url)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#0F766E] hover:underline flex items-center gap-1 font-semibold ml-1"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {isNote && res.content && (
                        <p className="text-xs line-clamp-2 max-w-xl" style={{ color: '#475569' }}>
                          {res.content}
                        </p>
                      )}

                      {isDiagram && res.image_url && !res.file_url && (
                        <a
                          href={res.image_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-[#0F766E] hover:underline flex items-center gap-1"
                        >
                          <span>External Image URL</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      {isVideo && res.youtube_url && (
                        <a
                          href={res.youtube_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-rose-700 hover:underline flex items-center gap-1"
                        >
                          <span>YouTube: {res.youtube_url}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => openEditModal(res)}
                      className="p-2 rounded-lg border text-slate-600 hover:text-[#0F766E] hover:bg-white transition cursor-pointer"
                      style={{ borderColor: '#B8D8CF' }}
                      title="Edit Resource"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(res)}
                      className="p-2 rounded-lg border text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      style={{ borderColor: '#FECACA' }}
                      title="Delete Resource"
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

      {/* Resource Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div
            className="w-full max-w-xl rounded-3xl p-6 sm:p-8 space-y-5 border shadow-xl max-h-[90vh] overflow-y-auto"
            style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}
          >
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: '#B8D8CF' }}>
              <h3 className="text-lg font-bold" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
                {editingResource ? 'Edit Learning Resource' : 'Add New Learning Resource'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {fileError && (
              <div className="p-3.5 rounded-xl text-xs flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{fileError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Resource Type Category */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                  Resource Category *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'note', label: 'Notes (PDF / Doc / Text)', icon: FileText },
                    { id: 'diagram', label: 'Diagrams (JPEG / PNG)', icon: Image },
                    { id: 'youtube', label: 'Videos (YouTube Lesson)', icon: Video },
                  ].map((t) => {
                    const isSelected = formData.resource_type === t.id;
                    const Icon = t.icon;
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => {
                          setFormData({ ...formData, resource_type: t.id });
                          handleClearFile();
                        }}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-semibold transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#0F766E] text-white border-[#0F766E]'
                            : 'bg-white text-slate-700 border-[#B8D8CF] hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-center">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                  Resource Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Structure of DNA Double Helix"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                  style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                />
              </div>

              {/* Conditional Inputs based on Resource Category */}
              {formData.resource_type === 'note' && (
                <div className="space-y-3">
                  {/* File Upload for Notes */}
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                      Upload Document File (PDF, Word .doc / .docx)
                    </label>
                    <div className="p-4 border-2 border-dashed rounded-2xl bg-white text-center space-y-2" style={{ borderColor: '#8BBDB0' }}>
                      <UploadCloud className="w-7 h-7 mx-auto text-[#0F766E]" />
                      <div className="text-xs text-slate-600">
                        {selectedFile ? (
                          <div className="flex items-center justify-center gap-2 font-semibold text-[#0F766E]">
                            <Paperclip className="w-4 h-4" />
                            <span>{selectedFile.name} ({formatFileSize(selectedFile.size)})</span>
                            <button
                              type="button"
                              onClick={handleClearFile}
                              className="text-rose-500 hover:text-rose-700 ml-1 p-0.5"
                              title="Remove file"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : editingResource?.file_url ? (
                          <div className="text-xs text-[#0F766E] space-y-1">
                            <p>Current Attached File: <strong>{editingResource.file_name || 'Document'}</strong></p>
                            <label className="text-[11px] text-slate-500 underline cursor-pointer">
                              Click to replace file
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                                className="hidden"
                              />
                            </label>
                          </div>
                        ) : (
                          <label className="cursor-pointer">
                            <span className="font-semibold text-[#0F766E] hover:underline">Choose a file</span> or drag & drop here
                            <p className="text-[11px] text-slate-400 mt-0.5">Supported: PDF (.pdf), Word (.doc, .docx) up to 25 MB</p>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Optional Text Notes */}
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                      Or Enter Text / Markdown Notes
                    </label>
                    <textarea
                      rows={4}
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Enter biological explanations, formulas, scientific laws..."
                      className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                      style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                    />
                  </div>
                </div>
              )}

              {formData.resource_type === 'diagram' && (
                <div className="space-y-3">
                  {/* File Upload for Diagrams */}
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                      Upload Diagram Image (JPEG, PNG) *
                    </label>
                    <div className="p-4 border-2 border-dashed rounded-2xl bg-white text-center space-y-2" style={{ borderColor: '#8BBDB0' }}>
                      {filePreview ? (
                        <div className="space-y-2">
                          <img
                            src={filePreview}
                            alt="Selected Diagram Preview"
                            className="max-h-40 mx-auto object-contain rounded-lg border border-[#B8D8CF]"
                          />
                          <div className="flex items-center justify-center gap-2 text-xs text-[#0F766E] font-semibold">
                            <span>{selectedFile?.name} ({formatFileSize(selectedFile?.size)})</span>
                            <button
                              type="button"
                              onClick={handleClearFile}
                              className="text-rose-500 hover:text-rose-700 p-0.5"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : editingResource?.image_url && !selectedFile ? (
                        <div className="space-y-2">
                          <img
                            src={editingResource.image_url}
                            alt="Current Diagram"
                            className="max-h-36 mx-auto object-contain rounded-lg border border-[#B8D8CF]"
                          />
                          <label className="text-xs text-[#0F766E] font-semibold underline cursor-pointer block">
                            Replace Image File
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                      ) : (
                        <label className="cursor-pointer block">
                          <UploadCloud className="w-7 h-7 mx-auto text-[#0F766E] mb-1" />
                          <span className="font-semibold text-[#0F766E] hover:underline">Choose Image File</span> or drag & drop here
                          <p className="text-[11px] text-slate-400 mt-0.5">Supported: JPEG (.jpg, .jpeg), PNG (.png) up to 25 MB</p>
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Alternative Image URL */}
                  <div>
                    <label className="block text-[11px] font-semibold mb-1 text-slate-500">
                      Or Provide External Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://example.com/images/cell-diagram.jpg"
                      className="w-full px-3.5 py-1.5 text-xs rounded-xl border bg-white focus:outline-none"
                      style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                    />
                  </div>
                </div>
              )}

              {formData.resource_type === 'youtube' && (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                    YouTube Lesson URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.youtube_url}
                    onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=VIDEO_ID or youtu.be/VIDEO_ID"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                    style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                  />
                  <p className="text-[11px] mt-1 text-slate-500">
                    Video ID will be safely extracted and embedded in students' viewing experience.
                  </p>
                </div>
              )}

              {/* Order & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                    Display Order Sequence
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                    style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>
                    Publication Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                    style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: '#B8D8CF' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border transition hover:bg-slate-100 cursor-pointer"
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
                  {submitting ? 'Saving Resource...' : editingResource ? 'Update Resource' : 'Save Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
