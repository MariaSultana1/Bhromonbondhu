import { useState, useEffect } from 'react';
import {
  TrendingUp, Calendar, DollarSign, Star,
  Loader, AlertCircle, RefreshCw, User, ArrowUpRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

import { AllBookings } from './AllBookings';
import { AllReviews } from './AllReviews';

const API = 'http://localhost:5000/api';

const apiFetch = async (path) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

const fmt = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
  return fmt(dateStr);
};

export function HostHome({ user, token }) {
  const [view, setView] = useState('home');

  const [earningsData, setEarningsData] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);

  const [thisMonthEarnings, setThisMonthEarnings] = useState(0);
  const [thisMonthBookings, setThisMonthBookings] = useState(0);
  const [allTimeEarnings, setAllTimeEarnings] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [avgRating, setAvgRating] = useState(null);
  const [totalReviews, setTotalReviews] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      // Step 1: get host profile first so we have the hostId for reviews
      const profileRes = await apiFetch('/hosts/my-profile').catch(() => null);
      const host = profileRes?.host;
      const hostId = host?._id;

      // Step 2: fetch everything else in parallel
      // ✅ FIXED: use /host/earnings (not /hosts/earnings) to avoid :id route conflict
      const [earningsRes, summaryRes, bookingsRes, reviewsRes] =
        await Promise.allSettled([
          apiFetch('/host/earnings'),
          apiFetch('/host/earnings/summary'),
          apiFetch('/host/booking-requests'),
          hostId ? apiFetch(`/hosts/${hostId}/reviews`) : Promise.resolve({ reviews: [] }),
        ]);

      // ── Host profile rating ───────────────────────────────────
      setAvgRating(host?.rating ?? null);
      setTotalReviews(host?.reviews ?? 0);

      // ── Summary (booking counts) ──────────────────────────────
      if (summaryRes.status === 'fulfilled') {
        const s = summaryRes.value?.summary;
        setThisMonthBookings(s?.thisMonth?.bookings ?? 0);
        setTotalBookings(s?.allTime?.totalBookings ?? 0);
      }

      // ── Earnings + Chart ──────────────────────────────────────
      // HostEarning DB schema fields:
      //   hostEarnings = host's cut (after 15% platform fee)
      //   amount       = gross booking amount (base price × nights)
      //   platformFee  = 15% deducted
      if (earningsRes.status === 'fulfilled') {
        const transactions = earningsRes.value?.earnings?.recentTransactions || [];

        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Build month-by-month chart data
        const monthMap = {};
        let allTotal = 0;
        let thisMonthTotal = 0;

        transactions.forEach((t) => {
          // date field from server = t.date (mapped from e.createdAt)
          const d = new Date(t.date || t.createdAt);
          if (isNaN(d.getTime())) return;

          // hostEarnings = the DB field = host's actual cut
          const hostCut = Number(t.hostEarnings ?? t.amount ?? 0);

          allTotal += hostCut;
          if (d >= thisMonthStart) thisMonthTotal += hostCut;

          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          if (!monthMap[key]) {
            monthMap[key] = {
              month: label,
              earnings: 0,
              fullDate: new Date(d.getFullYear(), d.getMonth(), 1),
            };
          }
          monthMap[key].earnings += hostCut;
        });

        setAllTimeEarnings(allTotal);
        setThisMonthEarnings(thisMonthTotal);

        // Last 6 months, sorted chronologically
        const chartData = Object.values(monthMap)
          .sort((a, b) => a.fullDate - b.fullDate)
          .slice(-6)
          .map(({ month, earnings }) => ({ month, earnings }));

        setEarningsData(chartData);
      } else {
        // earningsRes failed — log for debugging
        console.warn('Earnings fetch failed:', earningsRes.reason?.message);
      }

      // ── Upcoming bookings ─────────────────────────────────────
      if (bookingsRes.status === 'fulfilled') {
        const raw = bookingsRes.value?.bookings || [];
        const upcoming = raw
          .filter(b => ['pending', 'confirmed'].includes(b.status))
          .sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn))
          .slice(0, 5)
          .map(b => ({
            ...b,
            // Calculate hostEarnings if not present:
            // totalAmount on booking = base (before fee), grandTotal = base + fee
            // host keeps totalAmount (base), platform takes platformFee
            hostEarnings: b.hostEarnings ?? (b.totalAmount ?? 0),
          }));
        setUpcomingBookings(upcoming);
      }

      // ── Recent reviews ────────────────────────────────────────
      if (reviewsRes.status === 'fulfilled') {
        setRecentReviews((reviewsRes.value?.reviews || []).slice(0, 3));
      }

    } catch (e) {
      setError(e.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  if (view === 'allBookings') return <AllBookings onBack={() => setView('home')} token={token} />;
  if (view === 'allReviews') return <AllReviews onBack={() => setView('home')} token={token} />;

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader className="w-8 h-8 animate-spin text-green-500" />
      <span className="ml-3 text-gray-600">Loading dashboard...</span>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-start gap-3">
      <AlertCircle className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-bold text-red-800">Failed to load dashboard</p>
        <p className="text-sm text-red-700 mt-1">{error}</p>
        <button
          onClick={fetchDashboard}
          className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    </div>
  );

  const confirmedUpcoming = upcomingBookings.filter(b => b.status === 'confirmed').length;

  return (
    <div className="space-y-6">

      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-6 text-white flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl mb-1">Welcome back, {user?.fullName || user?.username || 'Host'}! 👋</h2>
          <p className="text-green-100">
            {upcomingBookings.length > 0
              ? `You have ${upcomingBookings.length} upcoming booking${upcomingBookings.length > 1 ? 's' : ''}`
              : 'No upcoming bookings yet'}
          </p>
        </div>
        <button
          onClick={fetchDashboard}
          className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* 4 stat cards */}
      <div className="grid md:grid-cols-4 gap-4">

        {/* This Month Earnings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-500" />
            <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">THIS MONTH</span>
          </div>
          <div className="text-2xl font-bold mt-3">৳{thisMonthEarnings.toLocaleString()}</div>
          <p className="text-sm text-gray-500 mt-1">Your Earnings</p>
          <p className="text-xs text-gray-400 mt-2">
            {thisMonthBookings} booking{thisMonthBookings !== 1 ? 's' : ''} this month
          </p>
        </div>

        {/* All-Time Earnings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-blue-500" />
            <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">ALL TIME</span>
          </div>
          <div className="text-2xl font-bold mt-3">৳{allTimeEarnings.toLocaleString()}</div>
          <p className="text-sm text-gray-500 mt-1">Total Earnings</p>
          <p className="text-xs text-gray-400 mt-2">
            {totalBookings} total booking{totalBookings !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-purple-500" />
            <span className="text-xs text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-full">UPCOMING</span>
          </div>
          <div className="text-2xl font-bold mt-3">{upcomingBookings.length}</div>
          <p className="text-sm text-gray-500 mt-1">Upcoming Bookings</p>
          <p className="text-xs text-purple-600 mt-2">
            {confirmedUpcoming > 0 ? `${confirmedUpcoming} confirmed` : 'None confirmed yet'}
          </p>
        </div>

        {/* Rating */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-8 h-8 text-yellow-500" />
            <span className="text-xs text-yellow-600 font-semibold bg-yellow-50 px-2 py-0.5 rounded-full">RATING</span>
          </div>
          <div className="text-2xl font-bold mt-3">
            {avgRating !== null && avgRating > 0 ? Number(avgRating).toFixed(1) : '—'}
          </div>
          <p className="text-sm text-gray-500 mt-1">Average Rating</p>
          <p className="text-xs text-gray-400 mt-2">
            {totalReviews > 0 ? `${totalReviews} review${totalReviews > 1 ? 's' : ''}` : 'No reviews yet'}
          </p>
        </div>
      </div>

      <div className="space-y-6">

        {/* Earnings Area Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="mb-1 font-bold text-lg">Your Earnings (Last 6 Months)</h3>
          <p className="text-xs text-gray-400 mb-4">After 15% platform fee deduction — pulled from hostearnings collection</p>
          {earningsData.length > 0 ? (
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={earningsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <YAxis
                    tickFormatter={(v) => v >= 1000 ? `৳${(v / 1000).toFixed(0)}k` : `৳${v}`}
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    formatter={(v) => [`৳${Number(v).toLocaleString()}`, 'Your Earnings']}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="earnings"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#colorEarnings)"
                    isAnimationActive={true}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-56 text-gray-400">
              <div className="text-center">
                <p className="text-sm mb-1">📊 No earnings data yet</p>
                <p className="text-xs text-gray-400">Complete your first booking to see the chart</p>
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Upcoming Bookings</h3>
            <button
              className="text-sm text-green-600 hover:text-green-700 font-semibold flex items-center gap-1"
              onClick={() => setView('allBookings')}
            >
              View All <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {upcomingBookings.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              No upcoming bookings yet
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map((booking) => {
                const guestName = booking.traveler?.name || 'Guest';
                const avatar = booking.traveler?.avatar || null;

                return (
                  <div
                    key={booking._id}
                    className="flex justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex gap-3">
                      {avatar ? (
                        <img src={avatar} alt={guestName} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-medium">{guestName}</h4>
                        <p className="text-xs text-gray-500">
                          {booking.checkIn && booking.checkOut
                            ? `${fmt(booking.checkIn)} – ${fmt(booking.checkOut)}`
                            : 'Dates not set'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {booking.guests || 1} guest{(booking.guests || 1) > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {/* hostEarnings = booking.totalAmount (base), platform takes platformFee on top */}
                      <div className="font-semibold text-green-600">
                        ৳{(booking.hostEarnings || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">your earnings</div>
                      <span className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700'
                        : booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Recent Reviews</h3>
            <button
              className="text-sm text-green-600 hover:text-green-700 font-semibold flex items-center gap-1"
              onClick={() => setView('allReviews')}
            >
              View All <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {recentReviews.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              No reviews yet — complete your first booking to receive reviews.
            </div>
          ) : (
            <div className="space-y-4">
              {recentReviews.map((review, i) => {
                const reviewerName = review.author?.name || review.traveler?.name || review.guestName || 'Guest';
                const reviewerAvatar = review.author?.avatar || review.traveler?.avatar || null;
                const rating = review.rating || 0;
                const comment = review.review || review.comment || review.text || '';
                const date = review.createdAt || review.date;

                return (
                  <div key={review._id || i} className="pb-4 border-b border-gray-100 last:border-0">
                    <div className="flex gap-3">
                      {reviewerAvatar ? (
                        <img src={reviewerAvatar} alt={reviewerName} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-sm font-medium">{reviewerName}</h4>
                          <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(date)}</span>
                        </div>
                        <div className="flex gap-0.5 mb-1 mt-0.5">
                          {[1, 2, 3, 4, 5].map(n => (
                            <Star
                              key={n}
                              className={`w-4 h-4 ${n <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200 fill-gray-200'}`}
                            />
                          ))}
                        </div>
                        {comment && <p className="text-sm text-gray-600">{comment}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}