import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getResources, getQuizzes, resolveFileUrl } from '../../services/contentService';
import {
  BookOpen, FileText, Image, Video, ClipboardList,
  AlertCircle, ArrowLeft, Play, Clock, CheckCircle,
  Eye, Download, ExternalLink, Paperclip,
} from 'lucide-react';

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const getDocKind = (fileType, fileName, fileUrl) => {
  const target = (fileName || fileUrl || '').toLowerCase();
  if (fileType === 'pdf' || target.endsWith('.pdf')) return 'pdf';
  if (fileType === 'word' || target.endsWith('.doc') || target.endsWith('.docx')) return 'word';
  return 'other';
};

const TABS = [
  { key: 'notes', label: 'Notes', icon: FileText },
  { key: 'diagrams', label: 'Diagrams', icon: Image },
  { key: 'videos', label: 'Videos', icon: Video },
  { key: 'quizzes', label: 'Quizzes', icon: ClipboardList },
];

function extractYoutubeId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export const TopicPage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('notes');
  const [resources, setResources] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [resRes, quizRes] = await Promise.all([
          getResources(topicId),
          getQuizzes({ topicId }),
        ]);
        setResources(resRes.data || []);
        setQuizzes((quizRes.data || []).filter((q) => q.status === 'published'));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load topic content.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [topicId]);

  const notes = resources.filter((r) => r.resource_type === 'note');
  const diagrams = resources.filter((r) => r.resource_type === 'diagram');
  const videos = resources.filter((r) => r.resource_type === 'youtube' || r.resource_type === 'video');

  const tabCounts = { notes: notes.length, diagrams: diagrams.length, videos: videos.length, quizzes: quizzes.length };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EAF3ED' }}>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-white/60 transition"
            style={{ color: '#0F766E' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium mb-1"
              style={{ background: '#DCEAE3', color: '#0F766E' }}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Topic Content
            </div>
            <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Poppins, sans-serif', color: '#134E4A' }}>
              Topic Resources
            </h1>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: '#0F766E', borderTopColor: 'transparent' }} />
            <p className="text-sm" style={{ color: '#475569' }}>Loading topic content...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl border text-center space-y-3" style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#DC2626' }}>
            <AlertCircle className="w-8 h-8 mx-auto" />
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <>
            {/* Tab Nav */}
            <div
              className="flex gap-1 p-1 rounded-xl"
              style={{ backgroundColor: '#DCEAE3' }}
            >
              {TABS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition"
                  style={
                    activeTab === key
                      ? { backgroundColor: '#0F766E', color: '#fff' }
                      : { color: '#475569', background: 'transparent' }
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                  {tabCounts[key] > 0 && (
                    <span
                      className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                      style={
                        activeTab === key
                          ? { background: 'rgba(255,255,255,0.25)', color: '#fff' }
                          : { background: '#0F766E22', color: '#0F766E' }
                      }
                    >
                      {tabCounts[key]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                {notes.length === 0 ? (
                  <EmptyState icon={FileText} message="No notes published for this topic yet." />
                ) : (
                  notes.map((note) => {
                    const docKind = getDocKind(note.file_type, note.file_name, note.file_url);
                    const resolvedUrl = resolveFileUrl(note.file_url);

                    return (
                      <div
                        key={note._id}
                        className="p-5 sm:p-6 rounded-2xl border space-y-4 shadow-xs"
                        style={{ background: '#F5F8F4', borderColor: '#8BBDB0' }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3" style={{ borderColor: '#DCEAE3' }}>
                          <div>
                            <h3 className="font-bold text-base sm:text-lg" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
                              {note.title}
                            </h3>
                            {note.file_url && (
                              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                                <span
                                  className={`px-2 py-0.5 rounded font-semibold text-[10px] tracking-wide uppercase ${
                                    docKind === 'pdf'
                                      ? 'bg-rose-100 text-rose-700'
                                      : docKind === 'word'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-emerald-100 text-emerald-700'
                                  }`}
                                >
                                  {docKind === 'pdf' ? 'PDF Document' : docKind === 'word' ? 'Word Document' : 'Document File'}
                                </span>
                                {note.file_name && <span className="font-medium text-slate-700">{note.file_name}</span>}
                                {note.file_size ? <span>• {formatFileSize(note.file_size)}</span> : null}
                              </div>
                            )}
                          </div>

                          {/* File Actions */}
                          {note.file_url && (
                            <div className="flex items-center gap-2 shrink-0">
                              {docKind === 'pdf' && (
                                <a
                                  href={resolvedUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#0F766E] text-[#0F766E] hover:bg-[#EAF3ED] transition shadow-xs"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Open / View PDF</span>
                                </a>
                              )}
                              <a
                                href={resolvedUrl}
                                download={note.file_name || 'document'}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition shadow-xs hover:opacity-95"
                                style={{ background: '#0F766E' }}
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download {docKind === 'pdf' ? 'PDF' : docKind === 'word' ? 'Word Doc' : 'File'}</span>
                              </a>
                            </div>
                          )}
                        </div>

                        {note.content && (
                          <div
                            className="text-sm leading-relaxed whitespace-pre-wrap p-4 rounded-xl bg-white border"
                            style={{ borderColor: '#DCEAE3', color: '#1E293B' }}
                          >
                            {note.content}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Diagrams Tab */}
            {activeTab === 'diagrams' && (
              <div className="space-y-4">
                {diagrams.length === 0 ? (
                  <EmptyState icon={Image} message="No diagrams published for this topic yet." />
                ) : (
                  diagrams.map((diagram) => {
                    const imageUrl = resolveFileUrl(diagram.file_url) || diagram.image_url;

                    return (
                      <div
                        key={diagram._id}
                        className="p-5 sm:p-6 rounded-2xl border space-y-4 shadow-xs"
                        style={{ background: '#F5F8F4', borderColor: '#8BBDB0' }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3" style={{ borderColor: '#DCEAE3' }}>
                          <div>
                            <h3 className="font-bold text-base sm:text-lg" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
                              {diagram.title}
                            </h3>
                            {diagram.file_name && (
                              <p className="text-xs text-slate-500 mt-0.5">
                                {diagram.file_name} {diagram.file_size ? `(${formatFileSize(diagram.file_size)})` : ''}
                              </p>
                            )}
                          </div>
                          {imageUrl && (
                            <div className="flex items-center gap-2 shrink-0">
                              <a
                                href={imageUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#0F766E] text-[#0F766E] hover:bg-[#EAF3ED] transition shadow-xs"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Full View</span>
                              </a>
                              <a
                                href={imageUrl}
                                download={diagram.file_name || `${diagram.title}.png`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition shadow-xs hover:opacity-95"
                                style={{ background: '#0F766E' }}
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download</span>
                              </a>
                            </div>
                          )}
                        </div>

                        {imageUrl ? (
                          <div
                            className="rounded-xl overflow-hidden border bg-white p-3 flex justify-center"
                            style={{ borderColor: '#DCEAE3' }}
                          >
                            <img
                              src={imageUrl}
                              alt={diagram.title}
                              className="max-h-[520px] w-auto object-contain rounded-lg shadow-xs hover:scale-[1.01] transition-transform duration-200"
                              onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                            />
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">No image file or URL provided.</p>
                        )}

                        {diagram.content && (
                          <p className="text-sm leading-relaxed p-3.5 rounded-xl bg-white border border-[#DCEAE3]" style={{ color: '#1E293B' }}>
                            {diagram.content}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Videos Tab */}
            {activeTab === 'videos' && (
              <div className="space-y-4">
                {videos.length === 0 ? (
                  <EmptyState icon={Video} message="No video resources published for this topic yet." />
                ) : (
                  videos.map((video) => {
                    const videoId = extractYoutubeId(video.youtube_url);
                    const fileUrl = video.file_url ? resolveFileUrl(video.file_url) : null;
                    return (
                      <div key={video._id} className="p-5 rounded-xl border" style={{ background: '#F5F8F4', borderColor: '#8BBDB0' }}>
                        <h3 className="font-bold text-base mb-3" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
                          {video.title}
                        </h3>
                        {videoId ? (
                          <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                            <iframe
                              className="absolute inset-0 w-full h-full rounded-lg"
                              src={`https://www.youtube.com/embed/${videoId}`}
                              title={video.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : fileUrl ? (
                          <video
                            controls
                            className="w-full rounded-lg max-h-[480px] bg-black"
                            src={fileUrl}
                          />
                        ) : (
                          <p className="text-sm" style={{ color: '#DC2626' }}>Invalid or missing video URL.</p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Quizzes Tab */}
            {activeTab === 'quizzes' && (
              <div className="space-y-3">
                {quizzes.length === 0 ? (
                  <EmptyState icon={ClipboardList} message="No quizzes published for this topic yet." />
                ) : (
                  quizzes.map((quiz) => (
                    <div key={quiz._id} className="p-5 rounded-xl border flex items-center justify-between gap-4" style={{ background: '#F5F8F4', borderColor: '#8BBDB0' }}>
                      <div>
                        <h3 className="font-bold text-sm" style={{ color: '#134E4A' }}>{quiz.title}</h3>
                        {quiz.description && (
                          <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{quiz.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          {quiz.time_limit_minutes && (
                            <span className="flex items-center gap-1 text-xs" style={{ color: '#475569' }}>
                              <Clock className="w-3.5 h-3.5" />
                              {quiz.time_limit_minutes} min
                            </span>
                          )}
                          <span className="text-xs" style={{ color: '#475569' }}>
                            {quiz.total_marks} marks
                          </span>
                        </div>
                      </div>
                      {isAuthenticated ? (
                        <Link
                          to={`/quiz/${quiz._id}/attempt`}
                          className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition"
                          style={{ background: '#0F766E' }}
                        >
                          <Play className="w-4 h-4" />
                          Start Quiz
                        </Link>
                      ) : (
                        <Link
                          to="/login"
                          className="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold text-white transition"
                          style={{ background: '#14B8A6' }}
                        >
                          Login to Start
                        </Link>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

function EmptyState({ icon: Icon, message }) {
  return (
    <div className="py-16 text-center rounded-xl border space-y-3" style={{ background: '#F5F8F4', borderColor: '#DCEAE3' }}>
      <Icon className="w-10 h-10 mx-auto" style={{ color: '#8BBDB0' }} />
      <p className="text-sm" style={{ color: '#475569' }}>{message}</p>
    </div>
  );
}
