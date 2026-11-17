import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { startQuiz, submitQuiz } from '../../services/contentService';
import { Clock, ChevronLeft, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';

export const QuizAttemptPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        const res = await startQuiz(quizId);
        const data = res.data;
        setQuiz(data.quiz || data);
        const qs = data.questions || [];
        setQuestions(qs);
        if (data.quiz?.time_limit_minutes) {
          setTimeLeft(data.quiz.time_limit_minutes * 60);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load quiz. You may have already attempted this quiz.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  const handleSubmit = useCallback(async (auto = false) => {
    if (submitted || submitting) return;
    setSubmitting(true);
    setShowConfirm(false);
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const answersArray = questions.map((q) => ({
        question_id: q._id,
        selected_option: answers[q._id] || null,
      }));
      const res = await submitQuiz(quizId, answersArray);
      const attemptId = res.data?.attempt?._id || res.data?._id;
      setSubmitted(true);
      navigate(`/quiz/${quizId}/result/${attemptId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quiz. Please try again.');
      setSubmitting(false);
    }
  }, [submitted, submitting, questions, answers, quizId, navigate]);

  // Timer
  useEffect(() => {
    if (timeLeft === null || submitted) return;
    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft, submitted, handleSubmit]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const selectAnswer = (questionId, optionLabel) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionLabel }));
  };

  const unansweredCount = questions.filter((q) => !answers[q._id]).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EAF3ED' }}>
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: '#0F766E', borderTopColor: 'transparent' }} />
          <p style={{ color: '#475569' }}>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#EAF3ED' }}>
        <div className="max-w-md w-full p-6 rounded-2xl border text-center space-y-3" style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
          <AlertCircle className="w-10 h-10 mx-auto" style={{ color: '#DC2626' }} />
          <h3 className="font-bold" style={{ color: '#1E293B' }}>Cannot Load Quiz</h3>
          <p className="text-sm" style={{ color: '#475569' }}>{error}</p>
          <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: '#0F766E' }}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EAF3ED' }}>
      {/* Quiz Header */}
      <div className="sticky top-0 z-30 border-b shadow-sm" style={{ background: '#134E4A', borderColor: '#0F766E' }}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-white font-bold text-sm truncate max-w-xs">
            {quiz?.title || 'Quiz'}
          </h1>
          {timeLeft !== null && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono font-bold"
              style={{ background: timeLeft < 60 ? '#DC2626' : '#0F766E', color: '#fff' }}
            >
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Question Navigator */}
        <div className="md:col-span-1">
          <div className="p-4 rounded-xl border sticky top-20" style={{ background: '#F5F8F4', borderColor: '#8BBDB0' }}>
            <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: '#475569' }}>
              Questions
            </h3>
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((q, idx) => (
                <button
                  key={q._id}
                  onClick={() => setCurrentIndex(idx)}
                  className="w-full aspect-square rounded-lg text-xs font-bold flex items-center justify-center transition border"
                  style={
                    idx === currentIndex
                      ? { background: '#14B8A6', color: '#fff', borderColor: '#14B8A6' }
                      : answers[q._id]
                      ? { background: '#0F766E', color: '#fff', borderColor: '#0F766E' }
                      : { background: '#fff', color: '#475569', borderColor: '#8BBDB0' }
                  }
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded" style={{ background: '#0F766E' }} />
                <span style={{ color: '#475569' }}>Answered ({questions.length - unansweredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded border" style={{ background: '#fff', borderColor: '#8BBDB0' }} />
                <span style={{ color: '#475569' }}>Unanswered ({unansweredCount})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Question */}
        <div className="md:col-span-3 space-y-4">
          {currentQuestion ? (
            <>
              <div className="p-6 rounded-2xl border" style={{ background: '#F5F8F4', borderColor: '#8BBDB0' }}>
                <div className="flex items-start gap-3 mb-5">
                  <span
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: '#0F766E' }}
                  >
                    {currentIndex + 1}
                  </span>
                  <p className="text-base font-semibold leading-snug" style={{ color: '#1E293B' }}>
                    {currentQuestion.question_text}
                  </p>
                </div>

                <div className="space-y-2.5">
                  {(currentQuestion.options || []).map((opt) => {
                    const isSelected = answers[currentQuestion._id] === opt.option_label;
                    return (
                      <button
                        key={opt.option_label}
                        onClick={() => selectAnswer(currentQuestion._id, opt.option_label)}
                        className="w-full text-left p-4 rounded-xl border transition font-medium text-sm flex items-center gap-3"
                        style={
                          isSelected
                            ? { background: '#0F766E22', borderColor: '#0F766E', color: '#134E4A' }
                            : { background: '#fff', borderColor: '#DCEAE3', color: '#1E293B' }
                        }
                      >
                        <span
                          className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border"
                          style={
                            isSelected
                              ? { background: '#0F766E', borderColor: '#0F766E', color: '#fff' }
                              : { background: '#EAF3ED', borderColor: '#8BBDB0', color: '#475569' }
                          }
                        >
                          {opt.option_label}
                        </span>
                        {opt.option_text}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-40"
                  style={{ background: '#DCEAE3', color: '#134E4A' }}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                    style={{ background: '#0F766E' }}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConfirm(true)}
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
                    style={{ background: '#134E4A' }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Submit Quiz
                  </button>
                )}
              </div>

              {currentIndex === questions.length - 1 && (
                <div className="text-center">
                  <button
                    onClick={() => setShowConfirm(true)}
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                    style={{ background: '#134E4A' }}
                  >
                    {submitting ? 'Submitting...' : 'Submit Quiz'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="p-10 text-center rounded-2xl border" style={{ background: '#F5F8F4', borderColor: '#DCEAE3' }}>
              <p style={{ color: '#475569' }}>No questions found in this quiz.</p>
            </div>
          )}

          {/* Floating Submit */}
          {currentIndex < questions.length - 1 && (
            <div className="text-right">
              <button
                onClick={() => setShowConfirm(true)}
                disabled={submitting}
                className="px-5 py-2 rounded-lg text-xs font-semibold border disabled:opacity-50"
                style={{ borderColor: '#0F766E', color: '#0F766E', background: 'transparent' }}
              >
                Submit Quiz
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-4" style={{ background: '#F5F8F4' }}>
            <h3 className="text-lg font-bold" style={{ color: '#134E4A' }}>Submit Quiz?</h3>
            {unansweredCount > 0 ? (
              <p className="text-sm" style={{ color: '#475569' }}>
                You have <strong>{unansweredCount}</strong> unanswered question{unansweredCount !== 1 ? 's' : ''}. Are you sure you want to submit?
              </p>
            ) : (
              <p className="text-sm" style={{ color: '#475569' }}>
                All questions answered. Ready to submit your quiz?
              </p>
            )}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
                style={{ borderColor: '#8BBDB0', color: '#475569' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                style={{ background: '#0F766E' }}
              >
                {submitting ? 'Submitting...' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
