import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getChallenges, getMySubscription } from '../../services/contentService';
import { DoodleBackground } from '../../components/DoodleBackground';
import {
  Trophy,
  Calendar,
  Clock,
  Lock,
  CheckCircle,
  Play,
  ArrowRight,
  Crown,
  ShieldAlert,
} from 'lucide-react';

export const WeeklyChallengePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [chRes, subRes] = await Promise.all([
          getChallenges(),
          isAuthenticated ? getMySubscription() : Promise.resolve({ data: null }),
        ]);
        setChallenges(chRes.data || []);
        setSubscription(subRes.data || null);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load weekly challenges.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const isPremiumActive =
    subscription &&
    subscription.status === 'active' &&
    new Date(subscription.end_date) > new Date();

  const now = new Date();

  return (
    <div className="relative min-h-screen py-10" style={{ backgroundColor: '#EAF3ED' }}>
      <DoodleBackground />

      <div className="relative z-10 max-w-5xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: '#DCEAE3', color: '#0F766E' }}
          >
            <Trophy className="w-4 h-4 text-[#0F766E]" />
            <span>Weekly Competitive Arena</span>
          </div>

          <h1
            className="text-3xl sm:text-4xl font-extrabold tracking-tight"
            style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}
          >
            Biology Weekly Challenges
          </h1>

          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: '#475569' }}>
            Timed competitive model tests curated by educators. Test your Botany and Zoology mastery against official benchmarks.
          </p>
        </div>

        {/* Subscription Status Callout Banner */}
        {!isPremiumActive ? (
          <div
            className="p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
            style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold" style={{ color: '#134E4A' }}>
                  Premium Challenge Access
                </h4>
                <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
                  Weekly challenges are gated for verified BioLearn BD Premium subscribers.
                </p>
              </div>
            </div>

            <Link
              to="/premium"
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white transition flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0 hover:opacity-95"
              style={{ backgroundColor: '#0F766E' }}
            >
              <span>Unlock Premium (99 BDT)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div
            className="p-4 rounded-2xl border text-xs flex items-center justify-between gap-3"
            style={{ backgroundColor: '#ECFDF5', borderColor: '#A7F3D0', color: '#065F46' }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Premium Active:</strong> You are fully authorized to attempt all active weekly challenges.
              </span>
            </div>
            <span className="font-semibold text-emerald-700 hidden sm:inline">30-Day Pass Active</span>
          </div>
        )}

        {error && (
          <div
            className="p-4 rounded-xl border text-xs flex items-center gap-2"
            style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA', color: '#DC2626' }}
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Challenge Cards Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div
              className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto"
              style={{ borderColor: '#0F766E', borderTopColor: 'transparent' }}
            />
            <p className="text-xs" style={{ color: '#475569' }}>Retrieving published challenges...</p>
          </div>
        ) : challenges.length === 0 ? (
          <div
            className="p-12 text-center rounded-3xl border space-y-3 max-w-md mx-auto"
            style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}
          >
            <Trophy className="w-12 h-12 mx-auto" style={{ color: '#8BBDB0' }} />
            <h3 className="text-base font-bold" style={{ color: '#134E4A' }}>No Active Challenges</h3>
            <p className="text-xs" style={{ color: '#475569' }}>
              The administrator has not published any weekly challenges for the current cycle. Please check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {challenges.map((ch) => {
              const startDate = new Date(ch.start_date);
              const endDate = new Date(ch.end_date);
              const isUpcoming = now < startDate;
              const hasEnded = now > endDate;
              const isLive = !isUpcoming && !hasEnded;
              const quiz = ch.quiz_id || {};

              return (
                <div
                  key={ch._id}
                  className="rounded-3xl border p-6 flex flex-col justify-between space-y-6 shadow-sm transition hover:shadow-md"
                  style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}
                >
                  <div className="space-y-4">
                    {/* Status Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isLive && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                            Live Now
                          </span>
                        )}
                        {isUpcoming && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                            <Clock className="w-3.5 h-3.5" />
                            Upcoming
                          </span>
                        )}
                        {hasEnded && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
                            Ended
                          </span>
                        )}

                        {ch.is_premium_only && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold"
                            style={{ backgroundColor: '#DCEAE3', color: '#0F766E' }}
                          >
                            <Crown className="w-3 h-3" /> Premium
                          </span>
                        )}
                      </div>

                      {quiz.total_marks ? (
                        <span className="text-xs font-semibold text-[#0F766E]">
                          {quiz.total_marks} Marks
                        </span>
                      ) : null}
                    </div>

                    {/* Challenge Title & Info */}
                    <div>
                      <h3
                        className="text-lg font-bold"
                        style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}
                      >
                        {ch.title}
                      </h3>
                      {ch.description && (
                        <p className="text-xs mt-1.5 leading-relaxed line-clamp-3" style={{ color: '#475569' }}>
                          {ch.description}
                        </p>
                      )}
                    </div>

                    {/* Window Timeline */}
                    <div
                      className="p-3.5 rounded-2xl border text-xs space-y-1.5"
                      style={{ backgroundColor: '#FFFFFF', borderColor: '#B8D8CF' }}
                    >
                      <div className="flex items-center gap-2" style={{ color: '#475569' }}>
                        <Calendar className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
                        <span>
                          <strong>Starts:</strong>{' '}
                          {startDate.toLocaleString('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2" style={{ color: '#475569' }}>
                        <Clock className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
                        <span>
                          <strong>Ends:</strong>{' '}
                          {endDate.toLocaleString('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      {quiz.time_limit_minutes && (
                        <div className="flex items-center gap-2 pt-1 text-[#0F766E] font-medium border-t" style={{ borderColor: '#F1F5F9' }}>
                          <span>Time Limit: {quiz.time_limit_minutes} Minutes</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2">
                    {hasEnded ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl text-xs font-semibold border text-slate-400 bg-slate-100 cursor-not-allowed"
                      >
                        Challenge Closed
                      </button>
                    ) : isUpcoming ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl text-xs font-semibold border text-blue-700 bg-blue-50 border-blue-200 cursor-not-allowed"
                      >
                        Opens Soon
                      </button>
                    ) : ch.is_premium_only && !isPremiumActive ? (
                      <Link
                        to="/premium"
                        className="w-full py-2.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Unlock with Premium</span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          if (!isAuthenticated) {
                            navigate('/login', { state: { from: { pathname: '/challenges' } } });
                            return;
                          }
                          const targetQuizId = quiz._id || ch.quiz_id;
                          navigate(`/quiz/${targetQuizId}/attempt`);
                        }}
                        className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-2 shadow-sm cursor-pointer hover:opacity-95"
                        style={{ backgroundColor: '#0F766E' }}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start Challenge Quiz</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
