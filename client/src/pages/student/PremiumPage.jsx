import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMySubscription, createSubscription } from '../../services/contentService';
import { DoodleBackground } from '../../components/DoodleBackground';
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Clock,
  ArrowRight,
  AlertCircle,
  Award,
  Crown,
} from 'lucide-react';

export const PremiumPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSub = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getMySubscription();
        setSubscription(res.data || null);
      } catch (err) {
        // Unauthenticated or network issue
        setError(err.message || 'Failed to load subscription status.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchSub();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/premium' } } });
      return;
    }

    setSubscribing(true);
    setError(null);
    try {
      // 1. Create pending subscription with plan_name, duration_days (30), fee (99 BDT)
      const res = await createSubscription({
        plan_name: 'Premium',
        duration_days: 30,
        fee: 99,
      });
      const subData = res.data?.subscription || res.data;
      // 2. Navigate to payment page with subscription reference
      navigate('/payment', { state: { subscription: subData } });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to initiate subscription.');
      setSubscribing(false);
    }
  };

  const isActive = subscription && subscription.status === 'active' && new Date(subscription.end_date) > new Date();
  const isPending = subscription && subscription.status === 'pending';

  return (
    <div className="relative min-h-screen py-10" style={{ backgroundColor: '#EAF3ED' }}>
      <DoodleBackground />

      <div className="relative z-10 max-w-4xl mx-auto px-4 space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: '#DCEAE3', color: '#0F766E' }}
          >
            <Crown className="w-4 h-4 text-[#0F766E]" />
            <span>BioLearn BD Premium Access</span>
          </div>

          <h1
            className="text-3xl sm:text-5xl font-extrabold tracking-tight"
            style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}
          >
            Elevate Your Biology Mastery
          </h1>

          <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#475569' }}>
            Comprehensive examination preparation for HSC Biology Papers 1 & 2 and Medical/University Admission tests.
          </p>
        </div>

        {error && (
          <div
            className="p-4 rounded-2xl border text-xs flex items-center gap-2 max-w-md mx-auto"
            style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA', color: '#DC2626' }}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Existing Status Banner if Active or Pending */}
        {isActive && (
          <div
            className="p-6 rounded-3xl border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Active Subscription
                </div>
                <h3 className="text-lg font-bold" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
                  {subscription.plan_name} Membership
                </h3>
                <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
                  Valid until{' '}
                  <span className="font-semibold text-[#134E4A]">
                    {new Date(subscription.end_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </p>
              </div>
            </div>

            <Link
              to="/challenges"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition shadow-sm cursor-pointer"
              style={{ backgroundColor: '#0F766E' }}
            >
              Enter Weekly Challenges &rarr;
            </Link>
          </div>
        )}

        {isPending && (
          <div
            className="p-5 rounded-2xl border text-xs flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ backgroundColor: '#FFFBEB', borderColor: '#FDE68A', color: '#92400E' }}
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 shrink-0 text-amber-600" />
              <div>
                <span className="font-bold">Pending Demo Payment Confirmation</span>
                <p className="text-[11px] opacity-90">
                  You have a pending subscription. Complete simulated bKash confirmation to activate.
                </p>
              </div>
            </div>
            <Link
              to="/payment"
              state={{ subscription }}
              className="px-4 py-2 rounded-xl font-bold text-white transition shrink-0 cursor-pointer"
              style={{ backgroundColor: '#0F766E' }}
            >
              Resume Payment &rarr;
            </Link>
          </div>
        )}

        {/* Pricing Card */}
        <div className="max-w-md mx-auto">
          <div
            className="rounded-3xl border shadow-lg overflow-hidden transition"
            style={{ background: '#F5F8F4', borderColor: '#0F766E' }}
          >
            <div className="p-6 sm:p-8 space-y-6">
              {/* Plan Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span
                    className="inline-block text-[11px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full mb-2"
                    style={{ backgroundColor: '#DCEAE3', color: '#0F766E' }}
                  >
                    All-Inclusive Plan
                  </span>
                  <h3 className="text-2xl font-bold" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
                    Biology Premium
                  </h3>
                  <p className="text-xs mt-1" style={{ color: '#475569' }}>
                    Full 30-day unlimited access to challenge quizzes & model tests
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] flex items-center justify-center text-white shadow-md">
                  <Sparkles className="w-6 h-6" />
                </div>
              </div>

              {/* Fee */}
              <div className="pt-2 border-t" style={{ borderColor: '#B8D8CF' }}>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold" style={{ color: '#0F766E', fontFamily: 'Poppins, sans-serif' }}>
                    99 BDT
                  </span>
                  <span className="text-xs font-medium" style={{ color: '#475569' }}>
                    / 30 Days Access
                  </span>
                </div>
                <p className="text-[11px] mt-1" style={{ color: '#475569' }}>
                  Demo payment enabled via bKash simulator flow.
                </p>
              </div>

              {/* Benefits Checklist */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#134E4A' }}>
                  What is included:
                </div>

                <div className="flex items-start gap-3 text-xs" style={{ color: '#1E293B' }}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Weekly Biology Challenges:</strong> Timed simulated exams with server scoring.
                  </span>
                </div>

                <div className="flex items-start gap-3 text-xs" style={{ color: '#1E293B' }}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Chapter-End Model Quizzes:</strong> Rigorous evaluation for Botany & Zoology.
                  </span>
                </div>

                <div className="flex items-start gap-3 text-xs" style={{ color: '#1E293B' }}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Instant Solution Reviews:</strong> Question-by-question scientific rationales.
                  </span>
                </div>

                <div className="flex items-start gap-3 text-xs" style={{ color: '#1E293B' }}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Curated Resource Viewer:</strong> Notes, anatomical diagrams, and video lessons.
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4">
                {isActive ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wide opacity-80 cursor-not-allowed border"
                    style={{ backgroundColor: '#DCEAE3', color: '#0F766E', borderColor: '#B8D8CF' }}
                  >
                    Currently Active
                  </button>
                ) : (
                  <button
                    onClick={handleSubscribe}
                    disabled={subscribing}
                    className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition flex items-center justify-center gap-2 shadow-md cursor-pointer hover:opacity-95"
                    style={{ backgroundColor: '#0F766E' }}
                  >
                    <span>{subscribing ? 'Creating Subscription...' : 'Subscribe to Premium — 99 BDT'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="text-[11px] text-center" style={{ color: '#475569' }}>
                Secure checkout with simulated bKash demo authorization.
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          <div className="p-6 rounded-2xl border" style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}>
            <Award className="w-8 h-8 text-[#0F766E] mb-3" />
            <h4 className="text-sm font-bold" style={{ color: '#134E4A' }}>National Curriculum Aligned</h4>
            <p className="text-xs mt-1" style={{ color: '#475569' }}>
              All questions and learning content adhere strictly to the NCTB HSC Biology syllabus.
            </p>
          </div>

          <div className="p-6 rounded-2xl border" style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}>
            <Zap className="w-8 h-8 text-[#0F766E] mb-3" />
            <h4 className="text-sm font-bold" style={{ color: '#134E4A' }}>Immediate Feedback</h4>
            <p className="text-xs mt-1" style={{ color: '#475569' }}>
              Submissions are graded securely on the server with immediate breakdowns and explanations.
            </p>
          </div>

          <div className="p-6 rounded-2xl border" style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}>
            <ShieldCheck className="w-8 h-8 text-[#0F766E] mb-3" />
            <h4 className="text-sm font-bold" style={{ color: '#134E4A' }}>Server-Verified Safety</h4>
            <p className="text-xs mt-1" style={{ color: '#475569' }}>
              Guaranteed integrity: scores and access permissions are rigorously managed server-side.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

