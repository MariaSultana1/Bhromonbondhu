import { DollarSign, TrendingUp, Calendar, ArrowUpRight, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:5000/api';
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

const getToken = () => localStorage.getItem('token');

async function apiFetch(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function formatBDT(amount) {
  return `৳${Number(amount || 0).toLocaleString('en-IN')}`;
}

function groupByMonth(transactions) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const map = {};
  months.forEach(m => (map[m] = 0));
  transactions.forEach(t => {
    const d = new Date(t.date || t.createdAt);
    if (!isNaN(d)) {
      const m = months[d.getMonth()];
      map[m] = (map[m] || 0) + (t.amount || 0);
    }
  });
  return months.map(m => ({ month: m, amount: map[m] }));
}

function groupByService(transactions) {
  const map = {};
  transactions.forEach(t => {
    const svc = t.location || 'Other Services';
    map[svc] = (map[svc] || 0) + (t.amount || 0);
  });
  const total = Object.values(map).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(map).map(([name, amount]) => ({
    name,
    value: Math.round((amount / total) * 100),
    amount
  }));
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white rounded-lg px-3 py-2 shadow-xl text-sm">
        <p className="font-semibold">{label}</p>
        <p className="text-emerald-400">{formatBDT(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white rounded-lg px-3 py-2 shadow-xl text-sm">
        <p className="font-semibold">{payload[0].name}</p>
        <p className="text-emerald-400">{formatBDT(payload[0].payload.amount)}</p>
        <p className="text-gray-300">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

function StatCard({ icon: Icon, iconColor, value, label, sub, subColor }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <p className="text-sm text-gray-500">{label}</p>
      {sub && <p className={`text-xs mt-1 font-medium ${subColor || 'text-gray-400'}`}>{sub}</p>}
    </div>
  );
}

export function HostEarnings() {
  const [earningsData, setEarningsData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const [earningsRes, summaryRes] = await Promise.all([
        apiFetch('/host/earnings'),
        apiFetch('/host/earnings/summary')
      ]);
      setEarningsData(earningsRes.earnings || {});
      setSummaryData(summaryRes.summary || {});
    } catch (e) {
      setError(e.message || 'Failed to load earnings data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-4">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-gray-500 text-sm">Loading earnings data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-4">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-red-400" />
        </div>
        <p className="text-gray-700 font-medium">Could not load earnings</p>
        <p className="text-gray-400 text-sm max-w-xs text-center">{error}</p>
        <button
          onClick={() => fetchData()}
          className="mt-2 px-5 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const transactions = earningsData?.recentTransactions || [];
  const totalEarnings = summaryData?.allTime?.totalEarnings || 0;
  const thisMonthEarnings = summaryData?.thisMonth?.earnings || 0;
  const lastMonthEarnings = summaryData?.lastMonth?.earnings || 0;
  const thisMonthBookings = summaryData?.thisMonth?.bookings || 0;
  const totalBookings = summaryData?.allTime?.totalBookings || 0;

  const monthlyData = groupByMonth(transactions);
  const serviceBreakdown = groupByService(transactions);

  const completedTotal = transactions.filter(t => t.status === 'completed' || t.status === 'paid')
    .reduce((s, t) => s + (t.amount || 0), 0);
  const pendingTotal = transactions.filter(t => t.status === 'pending')
    .reduce((s, t) => s + (t.amount || 0), 0);

  const monthChange = lastMonthEarnings > 0
    ? Math.round(((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Earnings Dashboard</h2>
          <p className="text-gray-500 text-sm mt-0.5">Track your income in real time</p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          iconColor="bg-emerald-100 text-emerald-600"
          value={formatBDT(totalEarnings)}
          label="Total Earnings"
          sub={`${totalBookings} bookings`}
          subColor="text-emerald-600"
        />
        <StatCard
          icon={TrendingUp}
          iconColor="bg-blue-100 text-blue-600"
          value={formatBDT(thisMonthEarnings)}
          label="This Month"
          sub={monthChange !== null ? `${monthChange >= 0 ? '+' : ''}${monthChange}% vs last month` : 'First month'}
          subColor={monthChange >= 0 ? 'text-blue-600' : 'text-red-500'}
        />
        <StatCard
          icon={Calendar}
          iconColor="bg-purple-100 text-purple-600"
          value={formatBDT(pendingTotal)}
          label="Pending"
          sub={`${transactions.filter(t => t.status === 'pending').length} bookings`}
          subColor="text-purple-600"
        />
        <StatCard
          icon={ArrowUpRight}
          iconColor="bg-amber-100 text-amber-600"
          value={formatBDT(completedTotal)}
          label="Completed"
          sub={`${thisMonthBookings} this month`}
          subColor="text-amber-600"
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Monthly Earnings Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900">Monthly Earnings</h3>
              <p className="text-xs text-gray-400 mt-0.5">Based on your transaction history</p>
            </div>
          </div>
          {monthlyData.every(d => d.amount === 0) ? (
            <div className="flex flex-col items-center justify-center h-52 text-gray-400">
              <TrendingUp className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">No earnings recorded yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `৳${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2.5} fill="url(#earningsGrad)" dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-1">Earnings by Location</h3>
          <p className="text-xs text-gray-400 mb-4">Breakdown by booking location</p>
          {serviceBreakdown.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-44 text-gray-400">
              <DollarSign className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-xs">No data yet</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={serviceBreakdown}
                    cx="50%" cy="50%"
                    innerRadius={45} outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {serviceBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {serviceBreakdown.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-600 truncate">{item.name}</span>
                    </div>
                    <span className="text-gray-800 font-medium ml-2">{formatBDT(item.amount)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Transaction History</h3>
          <p className="text-xs text-gray-400 mt-0.5">{transactions.length} total transactions</p>
        </div>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Calendar className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No transactions yet</p>
            <p className="text-xs mt-1">Earnings will appear here once bookings are confirmed</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Guest</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Dates</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Gross</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Platform Fee</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Your Earnings</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.map((t, i) => {
                  const checkIn = t.bookingDetails?.checkIn
                    ? new Date(t.bookingDetails.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                    : '—';
                  const checkOut = t.bookingDetails?.checkOut
                    ? new Date(t.bookingDetails.checkOut).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                    : '—';

                  const statusMap = {
                    completed: { label: 'Completed', cls: 'bg-emerald-100 text-emerald-700' },
                    paid: { label: 'Paid', cls: 'bg-blue-100 text-blue-700' },
                    pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700' },
                    refunded: { label: 'Refunded', cls: 'bg-red-100 text-red-600' },
                  };
                  const { label, cls } = statusMap[t.status] || { label: t.status, cls: 'bg-gray-100 text-gray-600' };

                  return (
                    <tr key={t._id || i} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{t.guestName || 'Guest'}</p>
                          <p className="text-xs text-gray-400">{t.bookingDetails?.guests || 1} guest{(t.bookingDetails?.guests || 1) > 1 ? 's' : ''} · {t.bookingDetails?.days || 1} night{(t.bookingDetails?.days || 1) > 1 ? 's' : ''}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{t.location || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{checkIn} – {checkOut}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-800">{formatBDT(t.totalAmount)}</td>
                      <td className="px-6 py-4 text-sm text-right text-red-500">−{formatBDT(t.platformFee)}</td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-emerald-600">{formatBDT(t.amount)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}>{label}</span>
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
}