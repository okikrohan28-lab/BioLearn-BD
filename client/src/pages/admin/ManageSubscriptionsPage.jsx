import { useState, useEffect, useMemo } from 'react';
import { getAllSubscriptions } from '../../services/contentService';
import {
  Crown,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  CreditCard,
  RefreshCw,
  Users,
  DollarSign,
  ShieldCheck,
  Copy,
  Check,
} from 'lucide-react';

export const ManageSubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  const fetchSubscriptions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllSubscriptions();
      setSubscriptions(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load subscriber records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered subscribers
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const studentName = sub.student_id?.name?.toLowerCase() || '';
      const studentEmail = sub.student_id?.email?.toLowerCase() || '';
      const refId = sub.reference_id?.toLowerCase() || '';
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !query ||
        studentName.includes(query) ||
        studentEmail.includes(query) ||
        refId.includes(query);

      const matchesStatus =
        statusFilter === 'all' || sub.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [subscriptions, searchQuery, statusFilter]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = subscriptions.length;
    const active = subscriptions.filter((s) => s.status === 'active').length;
    const pending = subscriptions.filter((s) => s.status === 'pending').length;
    const expired = subscriptions.filter((s) => s.status === 'expired').length;
    const revenue = subscriptions
      .filter((s) => s.status === 'active' || s.payment?.status === 'successful')
      .reduce((sum, s) => sum + (s.payment_amount || s.fee || 0), 0);

    return { total, active, pending, expired, revenue };
  }, [subscriptions]);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300">
            <CheckCircle className="w-3 h-3" />
            Active
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-300">
            <AlertCircle className="w-3 h-3" />
            Expired
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4" style={{ color: '#1E293B' }}>
      {/* Header */}
      <div className="border-b pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" style={{ borderColor: '#B8D8CF' }}>
        <div>
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2"
            style={{ backgroundColor: '#DCEAE3', color: '#0F766E' }}
          >
            <Crown className="w-3.5 h-3.5 text-amber-600" />
            <span>Premium Subscriber Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
            Student Premium Subscriptions
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: '#475569' }}>
            Review real-time student memberships, payment amounts, transaction reference IDs, and subscription dates.
          </p>
        </div>

        <button
          onClick={fetchSubscriptions}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border bg-white hover:bg-slate-50 transition shadow-2xs self-start sm:self-auto cursor-pointer"
          style={{ borderColor: '#B8D8CF', color: '#0F766E' }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl text-xs flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Subscribers */}
        <div className="p-5 rounded-2xl border space-y-2 shadow-2xs" style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#475569]">
            <span>Total Orders</span>
            <Users className="w-4 h-4 text-[#0F766E]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
            {loading ? '...' : stats.total}
          </div>
          <div className="text-[11px] text-[#475569]">All-time registrations</div>
        </div>

        {/* Active Subscribers */}
        <div className="p-5 rounded-2xl border space-y-2 shadow-2xs" style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#475569]">
            <span>Active Premium</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {loading ? '...' : stats.active}
          </div>
          <div className="text-[11px] text-[#475569]">Current valid subscribers</div>
        </div>

        {/* Pending Checkout */}
        <div className="p-5 rounded-2xl border space-y-2 shadow-2xs" style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#475569]">
            <span>Pending Demo</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {loading ? '...' : stats.pending}
          </div>
          <div className="text-[11px] text-[#475569]">Awaiting confirmation</div>
        </div>

        {/* Total Revenue */}
        <div className="p-5 rounded-2xl border space-y-2 shadow-2xs" style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#475569]">
            <span>Total Revenue</span>
            <DollarSign className="w-4 h-4 text-[#0F766E]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold" style={{ color: '#0F766E', fontFamily: 'Poppins, sans-serif' }}>
            {loading ? '...' : `${stats.revenue} BDT`}
          </div>
          <div className="text-[11px] text-[#475569]">Confirmed payments</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs" style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}>
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, email, or ref ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
            style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#0F766E] shrink-0" />
          <span className="text-xs font-semibold text-[#475569]">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E] cursor-pointer"
            style={{ borderColor: '#B8D8CF', color: '#1E293B' }}
          >
            <option value="all">All Subscriptions ({subscriptions.length})</option>
            <option value="active">Active Only ({stats.active})</option>
            <option value="pending">Pending Only ({stats.pending})</option>
            <option value="expired">Expired Only ({stats.expired})</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Subscriber Records Table */}
      <div className="rounded-3xl border overflow-hidden shadow-sm" style={{ background: '#F5F8F4', borderColor: '#B8D8CF' }}>
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div
              className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin mx-auto"
              style={{ borderColor: '#0F766E', borderTopColor: 'transparent' }}
            />
            <p className="text-xs" style={{ color: '#475569' }}>Loading subscriber database records...</p>
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="py-16 text-center space-y-3 px-4">
            <div className="w-12 h-12 rounded-2xl bg-[#DCEAE3] text-[#0F766E] flex items-center justify-center mx-auto">
              <Crown className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold" style={{ color: '#134E4A', fontFamily: 'Poppins, sans-serif' }}>
              No Subscriber Records Found
            </h3>
            <p className="text-xs max-w-sm mx-auto" style={{ color: '#475569' }}>
              {searchQuery || statusFilter !== 'all'
                ? 'No subscriptions match your search filter criteria. Try resetting the filter.'
                : 'No premium subscriptions have been created in the database yet.'}
            </p>
            {(searchQuery || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#0F766E] text-white hover:bg-[#134E4A] transition"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b" style={{ borderColor: '#B8D8CF', backgroundColor: '#EAF3ED' }}>
                  <th className="py-3.5 px-4 font-bold text-[#134E4A]">Student</th>
                  <th className="py-3.5 px-4 font-bold text-[#134E4A]">Plan</th>
                  <th className="py-3.5 px-4 font-bold text-[#134E4A]">Payment Amount</th>
                  <th className="py-3.5 px-4 font-bold text-[#134E4A]">Status</th>
                  <th className="py-3.5 px-4 font-bold text-[#134E4A]">Reference ID</th>
                  <th className="py-3.5 px-4 font-bold text-[#134E4A]">Start Date</th>
                  <th className="py-3.5 px-4 font-bold text-[#134E4A]">Expiry Date</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#DCEAE3' }}>
                {filteredSubscriptions.map((sub) => {
                  const student = sub.student_id;
                  const isCopied = copiedId === sub._id;
                  const refId = sub.reference_id || sub.payment?.reference_id;

                  return (
                    <tr key={sub._id} className="hover:bg-white/60 transition">
                      {/* Student Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#1E293B]">
                          {student?.name || 'Unknown Student'}
                        </div>
                        <div className="text-[11px] text-[#475569]">
                          {student?.email || 'No email registered'}
                        </div>
                        {student?.phone && (
                          <div className="text-[10px] text-slate-400">
                            {student.phone}
                          </div>
                        )}
                      </td>

                      {/* Plan */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#0F766E]">
                          {sub.plan_name || 'Premium'}
                        </div>
                        <div className="text-[10px] text-[#475569]">
                          {sub.duration_days || 30} Days Access
                        </div>
                      </td>

                      {/* Payment Amount */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-[#134E4A]">
                          {sub.payment_amount || sub.fee || 99} BDT
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {sub.payment?.payment_method || 'bKash Demo'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(sub.status)}
                      </td>

                      {/* Payment/Reference ID */}
                      <td className="py-3.5 px-4">
                        {refId ? (
                          <div className="inline-flex items-center gap-1.5 font-mono text-[11px] bg-white px-2 py-1 rounded-lg border border-[#B8D8CF]">
                            <span className="font-semibold text-[#0F766E]">{refId}</span>
                            <button
                              onClick={() => handleCopy(refId, sub._id)}
                              className="text-slate-400 hover:text-[#0F766E] transition p-0.5"
                              title="Copy Reference ID"
                            >
                              {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Not generated yet</span>
                        )}
                      </td>

                      {/* Start Date */}
                      <td className="py-3.5 px-4 text-[#475569]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#0F766E]" />
                          <span>{formatDate(sub.start_date)}</span>
                        </div>
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#0F766E]" />
                          <span className={sub.status === 'active' ? 'font-semibold text-[#134E4A]' : 'text-[#475569]'}>
                            {formatDate(sub.end_date)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

