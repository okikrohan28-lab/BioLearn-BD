import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAttemptDetail } from '../../services/contentService';
import { DoodleBackgroundLight } from '../../components/DoodleBackground';
import {
  Award,
  CheckCircle,
  XCircle,
  HelpCircle,
  Calendar,
  ArrowLeft,
  BookOpen,
  ChevronRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const QuizResultPage = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getAttemptDetail(attemptId);
        const data = res.data || res;
        setAttempt(data.attempt || data);
        setQuestions(data.questions || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load quiz results.');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-4" style={{ backgroundColor: '#EAF3ED' }}>
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#0F766E', borderTopColor: 'transparent' }} />
        <p className="text-sm font-medium" style={{ color: '#475569' }}>Calculating and compiling your result...</p>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center" style={{ backgroundColor: '#EAF3ED' }}>
        <div className="p-8 rounded-2xl border max-w-md w-full space-y-4 shadow-sm" style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}>
          <AlertCircle className="w-12 h-12 mx-auto text-rose-500" />
          <h2 className="text-xl font-bold" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
            Result Unavailable
          </h2>
          <p className="text-xs" style={{ color: '#475569' }}>
            {error || 'Could not find the requested attempt record.'}
          </p>
          <button
            onClick={() => navigate('/catalogue')}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition shadow-sm cursor-pointer"
            style={{ backgroundColor: '#0F766E' }}
          >
            Return to Catalogue
          </button>
        </div>
      </div>
    );
  }

  const quiz = attempt.quiz_id || {};
  const scorePercent = attempt.score !== undefined ? attempt.score : Math.round(((attempt.obtained_marks || 0) / (attempt.total_marks || 1)) * 100);
  const isPassed = quiz.pass_marks != null ? (attempt.obtained_marks >= quiz.pass_marks) : scorePercent >= 50;

  // Build answer lookup map
  const studentAnswersMap = {};
  if (Array.isArray(attempt.answers)) {
    attempt.answers.forEach((ans) => {
      const qId = ans.question_id?._id || ans.question_id;
      studentAnswersMap[qId ? qId.toString() : ''] = ans.selected_option;
    });
  }

  const formattedDate = attempt.submitted_at
    ? new Date(attempt.submitted_at).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Just now';

  return (
    <div className="relative min-h-screen py-8" style={{ backgroundColor: '#EAF3ED' }}>
      <DoodleBackgroundLight />

      <div className="relative z-10 max-w-4xl mx-auto px-4 space-y-8">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/catalogue')}
            className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition hover:bg-white/80 cursor-pointer"
            style={{ borderColor: '#B8D8CF', color: '#0F766E', backgroundColor: '#F5F8F4' }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Syllabus</span>
          </button>

          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: '#DCEAE3', color: '#0F766E' }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Official Score Report
          </span>
        </div>

        {/* Hero Score Card */}
        <div
          className="rounded-3xl p-6 sm:p-8 border shadow-sm space-y-6"
          style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6" style={{ borderColor: '#B8D8CF' }}>
            <div>
              <div className="text-xs uppercase font-semibold tracking-wider" style={{ color: '#0F766E' }}>
                {quiz.quiz_type ? `${quiz.quiz_type.toUpperCase()} QUIZ ASSESSMENT` : 'QUIZ RESULT'}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold mt-1" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
                {quiz.title || 'Biology Assessment'}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: '#475569' }}>
                <Calendar className="w-3.5 h-3.5" />
                <span>Submitted on {formattedDate}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`px-4 py-2 rounded-2xl text-center font-bold text-sm border ${
                  isPassed
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-rose-50 text-rose-700 border-rose-300'
                }`}
              >
                <div className="text-xs font-normal opacity-80 uppercase tracking-wide">Status</div>
                <div>{isPassed ? 'Passed' : 'Needs Review'}</div>
              </div>
            </div>
          </div>

          {/* Metric Bento Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border text-center space-y-1" style={{ backgroundColor: '#FFFFFF', borderColor: '#B8D8CF' }}>
              <div className="text-xs font-medium" style={{ color: '#475569' }}>Total Score</div>
              <div className="text-2xl sm:text-3xl font-extrabold" style={{ color: '#0F766E', fontFamily: 'Poppins, sans-serif' }}>
                {scorePercent}%
              </div>
              <div className="text-[11px]" style={{ color: '#475569' }}>
                {attempt.obtained_marks || 0} / {attempt.total_marks || quiz.total_marks || 0} Marks
              </div>
            </div>

            <div className="p-4 rounded-2xl border text-center space-y-1" style={{ backgroundColor: '#FFFFFF', borderColor: '#B8D8CF' }}>
              <div className="text-xs font-medium text-emerald-700 flex items-center justify-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Correct</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {attempt.correct_count || 0}
              </div>
              <div className="text-[11px]" style={{ color: '#475569' }}>Answered Right</div>
            </div>

            <div className="p-4 rounded-2xl border text-center space-y-1" style={{ backgroundColor: '#FFFFFF', borderColor: '#B8D8CF' }}>
              <div className="text-xs font-medium text-rose-700 flex items-center justify-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                <span>Incorrect</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {attempt.incorrect_count || 0}
              </div>
              <div className="text-[11px]" style={{ color: '#475569' }}>Wrong Choices</div>
            </div>

            <div className="p-4 rounded-2xl border text-center space-y-1" style={{ backgroundColor: '#FFFFFF', borderColor: '#B8D8CF' }}>
              <div className="text-xs font-medium text-amber-700 flex items-center justify-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Unanswered</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {attempt.unanswered_count || 0}
              </div>
              <div className="text-[11px]" style={{ color: '#475569' }}>Skipped Items</div>
            </div>
          </div>
        </div>

        {/* Detailed Question Review Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
              <Award className="w-5 h-5 text-[#0F766E]" />
              <span>Question-by-Question Review</span>
            </h2>
            <span className="text-xs font-medium" style={{ color: '#475569' }}>
              {questions.length} questions assessed
            </span>
          </div>

          {questions.length === 0 ? (
            <div className="p-6 rounded-2xl border text-center" style={{ background: '#F5F8F4', borderColor: '#B8D8CF', color: '#475569' }}>
              Question details are not available for this attempt.
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, index) => {
                const studentAnswer = studentAnswersMap[q._id.toString()];
                const isCorrect = studentAnswer && studentAnswer === q.correct_answer;
                const isUnanswered = !studentAnswer;

                return (
                  <div
                    key={q._id}
                    className="p-5 sm:p-6 rounded-2xl border transition shadow-sm space-y-4"
                    style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}
                  >
                    {/* Question Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span
                          className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                          style={{ backgroundColor: '#DCEAE3', color: '#0F766E' }}
                        >
                          {index + 1}
                        </span>
                        <h3 className="text-sm sm:text-base font-semibold leading-relaxed" style={{ color: '#1E293B' }}>
                          {q.question_text}
                        </h3>
                      </div>

                      <div className="shrink-0">
                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle className="w-3.5 h-3.5" />
                            +{q.positive_marks} Marks
                          </span>
                        ) : isUnanswered ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                            <HelpCircle className="w-3.5 h-3.5" />
                            Unanswered (0)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
                            <XCircle className="w-3.5 h-3.5" />
                            Incorrect (0)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                      {(q.options || []).map((opt) => {
                        const isStudentChoice = studentAnswer === opt.option_label;
                        const isCorrectAnswer = q.correct_answer === opt.option_label;

                        let cardStyle = {
                          backgroundColor: '#FFFFFF',
                          borderColor: '#B8D8CF',
                          color: '#1E293B',
                        };

                        if (isCorrectAnswer) {
                          cardStyle = {
                            backgroundColor: '#ECFDF5',
                            borderColor: '#10B981',
                            color: '#065F46',
                          };
                        } else if (isStudentChoice && !isCorrectAnswer) {
                          cardStyle = {
                            backgroundColor: '#FFF1F2',
                            borderColor: '#F43F5E',
                            color: '#9F1239',
                          };
                        }

                        return (
                          <div
                            key={opt.option_label}
                            className="p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs sm:text-sm font-medium transition"
                            style={cardStyle}
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                                  isCorrectAnswer
                                    ? 'bg-emerald-600 text-white'
                                    : isStudentChoice
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {opt.option_label}
                              </span>
                              <span>{opt.option_text}</span>
                            </div>

                            <div className="shrink-0 flex items-center gap-1 text-[11px] font-semibold">
                              {isCorrectAnswer && (
                                <span className="inline-flex items-center gap-1 text-emerald-700">
                                  <CheckCircle className="w-3.5 h-3.5" /> Correct
                                </span>
                              )}
                              {isStudentChoice && !isCorrectAnswer && (
                                <span className="inline-flex items-center gap-1 text-rose-700">
                                  <XCircle className="w-3.5 h-3.5" /> Your Choice
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div
                        className="p-3.5 rounded-xl text-xs space-y-1 border"
                        style={{ backgroundColor: '#DCEAE3', borderColor: '#B8D8CF', color: '#134E4A' }}
                      >
                        <div className="font-bold flex items-center gap-1.5 text-[#0F766E]">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Scientific Explanation</span>
                        </div>
                        <p className="leading-relaxed opacity-90">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition shadow-md cursor-pointer"
            style={{ backgroundColor: '#0F766E' }}
          >
            <BookOpen className="w-4 h-4" />
            <span>Explore More Topics</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
