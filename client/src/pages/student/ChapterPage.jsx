import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getQuizzes, getTopics } from '../../services/contentService';
import {
  BookOpen, ClipboardList, AlertCircle, ArrowLeft,
  Play, Clock, Bookmark,
} from 'lucide-react';

export const ChapterPage = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [quizRes, topicRes] = await Promise.all([
          getQuizzes({ chapterId }),
          getTopics(chapterId),
        ]);
        setQuizzes((quizRes.data || []).filter((q) => q.status === 'published'));
        setTopics(topicRes.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load chapter content.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [chapterId]);

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
              Chapter Overview
            </div>
            <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Poppins, sans-serif', color: '#134E4A' }}>
              Chapter Content
            </h1>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: '#0F766E', borderTopColor: 'transparent' }} />
            <p className="text-sm" style={{ color: '#475569' }}>Loading chapter data...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl border text-center" style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#DC2626' }}>
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Topics in this chapter */}
            <div>
              <h2 className="text-lg font-bold mb-3" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
                Topics
              </h2>
              {topics.length === 0 ? (
                <div className="p-8 rounded-xl border text-center" style={{ background: '#F5F8F4', borderColor: '#DCEAE3' }}>
                  <Bookmark className="w-8 h-8 mx-auto mb-2" style={{ color: '#8BBDB0' }} />
                  <p className="text-sm" style={{ color: '#475569' }}>No topics found for this chapter.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {topics.map((topic) => (
                    <Link
                      key={topic._id}
                      to={`/topic/${topic._id}`}
                      className="flex items-center gap-3 p-4 rounded-xl border transition hover:shadow-md"
                      style={{ background: '#F5F8F4', borderColor: '#8BBDB0', color: '#1E293B' }}
                    >
                      <Bookmark className="w-4 h-4 shrink-0" style={{ color: '#14B8A6' }} />
                      <div>
                        <div className="text-sm font-semibold" style={{ color: '#134E4A' }}>
                          Topic {topic.topic_no}: {topic.title}
                        </div>
                        {topic.description && (
                          <p className="text-xs mt-0.5 line-clamp-1" style={{ color: '#475569' }}>{topic.description}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Chapter Quizzes */}
            <div>
              <h2 className="text-lg font-bold mb-3" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
                Chapter Quizzes
              </h2>
              {quizzes.length === 0 ? (
                <div className="p-8 rounded-xl border text-center" style={{ background: '#F5F8F4', borderColor: '#DCEAE3' }}>
                  <ClipboardList className="w-8 h-8 mx-auto mb-2" style={{ color: '#8BBDB0' }} />
                  <p className="text-sm" style={{ color: '#475569' }}>No chapter-level quizzes available yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {quizzes.map((quiz) => (
                    <div key={quiz._id} className="p-4 rounded-xl border" style={{ background: '#F5F8F4', borderColor: '#8BBDB0' }}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-sm" style={{ color: '#134E4A' }}>{quiz.title}</h3>
                          {quiz.description && (
                            <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{quiz.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            {quiz.time_limit_minutes && (
                              <span className="flex items-center gap-1 text-xs" style={{ color: '#475569' }}>
                                <Clock className="w-3 h-3" />
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
                            className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                            style={{ background: '#0F766E' }}
                          >
                            <Play className="w-3.5 h-3.5" />
                            Start
                          </Link>
                        ) : (
                          <Link
                            to="/login"
                            className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                            style={{ background: '#14B8A6' }}
                          >
                            Login
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
