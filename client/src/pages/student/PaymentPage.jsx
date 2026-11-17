import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getMySubscription,
  createSubscription,
  initiatePayment,
  confirmDemoPayment,
} from '../../services/contentService';
import { DoodleBackgroundLight } from '../../components/DoodleBackground';
import {
  ExternalLink,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Clock,
  Sparkles,
  CreditCard,
} from 'lucide-react';

export const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [subscription, setSubscription] = useState(location.state?.subscription || null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasVisitedBkash, setHasVisitedBkash] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializePayment = async () => {
      setLoading(true);
      setError(null);
      try {
        let sub = subscription;
        if (!sub) {
          const subRes = await getMySubscription();
          sub = subRes.data;
          if (!sub || sub.status === 'active') {
            // Create pending default subscription
            const createRes = await createSubscription({
              plan_name: 'Premium',
              duration_days: 30,
              fee: 99,
            });
            sub = createRes.data?.subscription || createRes.data;
          }
          setSubscription(sub);
        }

        // Initialize pending payment transaction
        const payRes = await initiatePayment({ subscription_id: sub._id });
        setPayment(payRes.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to initialize payment transaction.');
      } finally {
        setLoading(false);
      }
    };

    initializePayment();
  }, []);

  const handleOpenBkash = () => {
    setHasVisitedBkash(true);
    window.open('https://www.bkash.com/', '_blank', 'noopener,noreferrer');
  };

  const handleProcessConfirmation = async () => {
    if (!payment?._id) return;
    setConfirming(true);
    setError(null);
    try {
      const res = await confirmDemoPayment(payment._id);
      const data = res.data;
      setShowConfirmModal(false);
      navigate('/payment/success', {
        state: {
          payment: data.payment,
          subscription: data.subscription,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment confirmation failed.');
      setShowConfirmModal(false);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="relative min-h-screen py-10" style={{ backgroundColor: '#EAF3ED' }}>
      <DoodleBackgroundLight />

      <div className="relative z-10 max-w-2xl mx-auto px-4 space-y-8">
        {/* Top Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/premium"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition hover:bg-white/80 cursor-pointer"
            style={{ borderColor: '#B8D8CF', color: '#0F766E', backgroundColor: '#F5F8F4' }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel & Return</span>
          </Link>

          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-amber-800 bg-amber-100 border border-amber-300"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            DEMO PAYMENT SIMULATOR
          </span>
        </div>

        {error && (
          <div
            className="p-4 rounded-xl border text-xs flex items-center gap-2"
            style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA', color: '#DC2626' }}
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Payment Checkout Box */}
        <div
          className="rounded-3xl border shadow-sm p-6 sm:p-8 space-y-6"
          style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}
        >
          <div className="border-b pb-4" style={{ borderColor: '#B8D8CF' }}>
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: '#0F766E' }}>
              Checkout Summary
            </div>
            <h1 className="text-2xl font-bold mt-1" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
              Confirm Your Premium Plan
            </h1>
          </div>

          {loading ? (
            <div className="py-12 text-center space-y-3">
              <div
                className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin mx-auto"
                style={{ borderColor: '#0F766E', borderTopColor: 'transparent' }}
              />
              <p className="text-xs" style={{ color: '#475569' }}>Setting up secure simulated order...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Plan Items Table */}
              <div className="rounded-2xl border p-4 space-y-3" style={{ backgroundColor: '#FFFFFF', borderColor: '#B8D8CF' }}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold" style={{ color: '#1E293B' }}>Subscription Plan</span>
                  <span className="font-bold text-[#0F766E]">{subscription?.plan_name || 'Premium'} (30 Days)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold" style={{ color: '#1E293B' }}>Registered Student</span>
                  <span style={{ color: '#475569' }}>{user?.name} ({user?.email})</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold" style={{ color: '#1E293B' }}>Payment Method</span>
                  <span className="font-semibold text-[#D12053]">bKash (External Demo)</span>
                </div>
                {payment?.reference_id && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold" style={{ color: '#1E293B' }}>Transaction Draft ID</span>
                    <span className="font-mono text-[11px]" style={{ color: '#475569' }}>{payment.reference_id}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex items-center justify-between" style={{ borderColor: '#E2E8F0' }}>
                  <span className="text-sm font-bold" style={{ color: '#134E4A' }}>Total Payable Amount</span>
                  <span className="text-xl font-extrabold text-[#0F766E]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {subscription?.fee || 99} BDT
                  </span>
                </div>
              </div>

              {/* Step 1: External Link */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold" style={{ color: '#134E4A' }}>
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white"
                    style={{ backgroundColor: '#0F766E' }}
                  >
                    1
                  </span>
                  <span>Open bKash Official Portal (Simulated Redirect)</span>
                </div>
                <p className="text-xs pl-7" style={{ color: '#475569' }}>
                  Click below to open the official bKash website in a new browser tab. Keep this BioLearn BD page open.
                </p>
                <div className="pl-7">
                  <button
                    type="button"
                    onClick={handleOpenBkash}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white transition shadow-sm cursor-pointer hover:opacity-95"
                    style={{ backgroundColor: '#D12053' }} // bKash brand magenta
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Official bKash (External Tab)</span>
                  </button>
                  {hasVisitedBkash && (
                    <span className="ml-3 text-xs text-emerald-700 font-semibold inline-flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Link opened
                    </span>
                  )}
                </div>
              </div>

              {/* Step 2: Confirm Demo Payment */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold" style={{ color: '#134E4A' }}>
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white"
                    style={{ backgroundColor: '#0F766E' }}
                  >
                    2
                  </span>
                  <span>Confirm Simulated Payment</span>
                </div>
                <p className="text-xs pl-7" style={{ color: '#475569' }}>
                  After testing the external link, click the confirmation button below to record the demo payment and activate your subscription.
                </p>
                <div className="pl-7">
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(true)}
                    disabled={confirming}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs text-white transition flex items-center justify-center gap-2 shadow-md cursor-pointer hover:opacity-95 disabled:opacity-50"
                    style={{ backgroundColor: '#0F766E' }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirm Demo Payment</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div
            className="w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-5 border shadow-xl animate-in fade-in zoom-in duration-150"
            style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
                Simulate bKash Payment?
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: '#475569' }}>
                This is an explicit demonstration action. No financial transaction has taken place on bKash.
                This will record a verified <strong>DEMO</strong> payment and activate your 30-day Premium Subscription.
              </p>
            </div>

            <div className="p-3.5 rounded-xl text-xs space-y-1.5 border" style={{ backgroundColor: '#FFFFFF', borderColor: '#B8D8CF' }}>
              <div className="flex justify-between">
                <span className="text-[#475569]">Plan:</span>
                <span className="font-bold text-[#134E4A]">{subscription?.plan_name || 'Premium'} (30 Days)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#475569]">Simulated Amount:</span>
                <span className="font-bold text-[#0F766E]">{subscription?.fee || 99} BDT</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={confirming}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold border transition hover:bg-slate-100 cursor-pointer"
                style={{ borderColor: '#B8D8CF', color: '#475569' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessConfirmation}
                disabled={confirming}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition shadow-sm cursor-pointer hover:opacity-95"
                style={{ backgroundColor: '#0F766E' }}
              >
                {confirming ? 'Activating...' : 'Yes, Confirm Demo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

