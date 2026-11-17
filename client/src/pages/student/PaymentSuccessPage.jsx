import { useLocation, Link } from 'react-router-dom';
import { DoodleBackgroundLight } from '../../components/DoodleBackground';
import {
  CheckCircle,
  ArrowRight,
  Info,
  Crown,
} from 'lucide-react';

export const PaymentSuccessPage = () => {
  const location = useLocation();

  const payment = location.state?.payment;
  const subscription = location.state?.subscription;

  const referenceId = payment?.reference_id || `BIO-DEMO-${Date.now().toString(36).toUpperCase()}`;
  const planName = subscription?.plan_name || 'Biology Premium';
  const amount = payment?.amount || subscription?.fee || 99;
  const startDate = subscription?.start_date
    ? new Date(subscription.start_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  const endDate = subscription?.end_date
    ? new Date(subscription.end_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  return (
    <div className="relative min-h-screen py-12" style={{ backgroundColor: '#EAF3ED' }}>
      <DoodleBackgroundLight />

      <div className="relative z-10 max-w-xl mx-auto px-4 space-y-6">
        {/* Main Success Card */}
        <div
          className="rounded-3xl border shadow-lg p-6 sm:p-8 text-center space-y-6"
          style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}
        >
          {/* Animated/Icon Header */}
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: '#DCEAE3', color: '#0F766E' }}
            >
              <Crown className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Premium Membership Activated</span>
            </div>
            <h1
              className="text-2xl sm:text-3xl font-extrabold"
              style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}
            >
              Demo Payment Successful
            </h1>
          </div>

          {/* Mandatory Academic Transparency Disclaimer */}
          <div
            className="p-4 rounded-2xl border text-xs text-left space-y-1"
            style={{ backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', color: '#1E40AF' }}
          >
            <div className="font-bold flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Simulation Verification Notice</span>
            </div>
            <p className="leading-relaxed opacity-90">
              This is a simulated payment confirmation for project demonstration. No real bKash transaction was verified.
            </p>
          </div>

          {/* Transaction Metadata Table */}
          <div
            className="rounded-2xl border p-4 text-xs space-y-2.5 text-left"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#B8D8CF' }}
          >
            <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: '#F1F5F9' }}>
              <span style={{ color: '#475569' }}>Payment Status:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Successful (Demo)
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: '#F1F5F9' }}>
              <span style={{ color: '#475569' }}>Payment Reference ID:</span>
              <span className="font-mono font-semibold" style={{ color: '#0F766E' }}>
                {referenceId}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: '#F1F5F9' }}>
              <span style={{ color: '#475569' }}>Subscription Plan:</span>
              <span className="font-bold" style={{ color: '#134E4A' }}>
                {planName}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: '#F1F5F9' }}>
              <span style={{ color: '#475569' }}>Simulated Amount:</span>
              <span className="font-bold" style={{ color: '#0F766E' }}>
                {amount} BDT
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: '#F1F5F9' }}>
              <span style={{ color: '#475569' }}>Start Date:</span>
              <span className="font-medium" style={{ color: '#1E293B' }}>
                {startDate}
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span style={{ color: '#475569' }}>Expiry Date:</span>
              <span className="font-bold" style={{ color: '#134E4A' }}>
                {endDate}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            <Link
              to="/challenges"
              className="w-full py-3.5 rounded-xl font-bold text-xs text-white transition flex items-center justify-center gap-2 shadow-md cursor-pointer hover:opacity-95"
              style={{ backgroundColor: '#0F766E' }}
            >
              <span>Explore Weekly Biology Challenges</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/catalogue"
              className="w-full py-2.5 rounded-xl text-xs font-semibold border transition hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer"
              style={{ borderColor: '#B8D8CF', color: '#0F766E' }}
            >
              <span>Return to Syllabus Catalogue</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
