import { useState, useEffect } from 'react';
import {
  TrendingUp, Calendar, DollarSign, Star, Eye,
  CheckCircle, Loader, AlertCircle, RefreshCw, User
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

  // ── State ──────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState(null);
  const [earningsData, setEarningsData] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Fetch all dashboard data ───────────────────────────────────────────────
  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Fetching host dashboard data...');

      // Fetch all endpoints in parallel
      const [earningsRes, earningsSummaryRes, bookingsRes, reviewsRes, hostProfileRes] =
        await Promise.allSettled([
          apiFetch('/hosts/earnings'),         // earnings data with transactions
          apiFetch('/hosts/earnings/summary'), // summary with allTime and thisMonth
          apiFetch('/host/booking-requests'),  // upcoming bookings
          apiFetch('/hosts/reviews'),          // recent reviews
          apiFetch('/hosts/my-profile'),       // host profile with verification dates
        ]);

      console.log('✅ All API calls completed');

      // ── Process earnings data ──
      const earningsPayload = earningsRes.status === 'fulfilled' ? earningsRes.value?.earnings : null;
      console.log('💰 Earnings payload:', earningsPayload);

      // ── Process summary data ──
      const summaryPayload = earningsSummaryRes.status === 'fulfilled' ? earningsSummaryRes.value?.summary : null;
      console.log('📊 Summary payload:', summaryPayload);

      // ── Process host profile ──
      const hostDoc = hostProfileRes.status === 'fulfilled' ? hostProfileRes.value?.host : null;
      console.log('👤 Host profile:', hostDoc);

      // ── Build stats from database ──
      const thisMonthEarnings = summaryPayload?.thisMonth?.earnings ?? 0;
      const thisMonthBookings = summaryPayload?.thisMonth?.bookings ?? 0;
      const allTimeEarnings = summaryPayload?.allTime?.totalEarnings ?? 0;
      const totalGuests = summaryPayload?.allTime?.totalGuests ?? 0;
      const averagePerBooking = summaryPayload?.allTime?.averagePerBooking ?? 0;
      const totalBookingsCount = earningsPayload?.totalBookings ?? summaryPayload?.allTime?.totalBookings ?? 0;
      const hostRating = hostDoc?.rating ?? null;
      const totalReviewsCount = hostDoc?.reviews ?? 0;
      const responseRate = hostDoc?.responseRate ?? null;

      console.log('📈 Stats:', {
        thisMonthEarnings,
        allTimeEarnings,
        totalBookingsCount,
        hostRating,
        totalReviewsCount,
      });

      setStats({
        thisMonth: {
          earnings: thisMonthEarnings,
          bookings: thisMonthBookings,
        },
        allTime: {
          hostEarnings: allTimeEarnings,
          totalGuests: totalGuests,
          averagePerBooking: averagePerBooking,
        },
        totalBookings: totalBookingsCount,
        averageRating: hostRating,
        totalReviews: totalReviewsCount,
        responseRate: responseRate,
      });

      // ── Build earnings chart from transactions ──
      const transactions = earningsPayload?.recentTransactions || [];
      console.log('📊 Transactions for chart:', transactions);

      if (transactions.length > 0) {
        const monthMap = {};
        
        transactions.forEach((t) => {
          // Parse the date from transaction
          const transDate = new Date(t.date || t.createdAt);
          
          if (isNaN(transDate.getTime())) {
            console.warn('Invalid date in transaction:', t);
            return;
          }

          // Create month key (YYYY-MM)
          const year = transDate.getFullYear();
          const month = transDate.getMonth();
          const key = `${year}-${String(month + 1).padStart(2, '0')}`;
          
          // Create label (e.g., "Jan", "Feb")
          const label = transDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

          // Initialize month entry if it doesn't exist
          if (!monthMap[key]) {
            monthMap[key] = { 
              month: label, 
              earnings: 0, 
              key,
              fullDate: new Date(year, month, 1)
            };
          }

          // Add amount (hostEarnings = amount after platform fee)
          const amount = t.amount || t.hostEarnings || 0;
          monthMap[key].earnings += amount;

          console.log(`✅ Added ৳${amount} to ${label}`);
        });

        // Sort by date and get last 6 months
        const chartData = Object.values(monthMap)
          .sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime())
          .slice(-6)
          .map(({ month, earnings }) => ({ month, earnings }));

        console.log('📈 Chart data (last 6 months):', chartData);
        setEarningsData(chartData);
      } else {
        console.log('⚠️ No transactions available for chart');
        setEarningsData([]);
      }

      // ── Process upcoming bookings ──
      if (bookingsRes.status === 'fulfilled') {
        const raw = bookingsRes.value?.bookings || [];
        console.log('📅 Total booking requests:', raw.length);
        
        const upcoming = raw
          .filter(b => ['pending', 'confirmed'].includes(b.status))
          .sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn))
          .slice(0, 5);
        
        console.log('📅 Upcoming bookings (filtered):', upcoming.length);
        setUpcomingBookings(upcoming);
      }

      // ── Process recent reviews ──
      if (reviewsRes.status === 'fulfilled') {
        const raw = reviewsRes.value?.reviews || [];
        console.log('⭐ Total reviews:', raw.length);
        setRecentReviews(raw.slice(0, 3));
      }

      // ── Process verification status ──
      if (hostDoc) {
        setVerification({
          identityVerified: !!hostDoc.idVerifiedAt,
          policeCheck: !!hostDoc.bgCheckAt,
          trainingComplete: !!hostDoc.trainingAt,
          bankDetails: !!hostDoc.bankVerifiedAt,
        });
        console.log('✅ Verification status set');
      }

    } catch (e) {
      console.error('❌ Dashboard fetch error:', e);
      setError(e.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ── Sub-views ──────────────────────────────────────────────────────────────
  if (view === 'allBookings') return <AllBookings onBack={() => setView('home')} token={token} />;
  if (view === 'allReviews') return <AllReviews onBack={() => setView('home')} token={token} />;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader className="w-8 h-8 animate-spin text-green-500" />
      <span className="ml-3 text-gray-600">Loading dashboard...</span>
    </div>
  );

  // ── Error ──────────────────────────────────────────────────────────────────
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

  // ── Get stats with fallbacks ──────────────────────────────────────────────
  const thisMonthEarnings = stats?.thisMonth?.earnings ?? 0;
  const thisMonthBookings = stats?.thisMonth?.bookings ?? 0;
  const totalBookings = stats?.totalBookings ?? 0;
  const upcomingCount = upcomingBookings.filter(b => b.status === 'confirmed').length;
  const avgRating = stats?.averageRating ?? null;
  const totalReviews = stats?.totalReviews ?? 0;
  const responseRate = stats?.responseRate ?? null;

  const verif = verification || {};

  return (
    <div className="space-y-6">

      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-6 text-white flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl mb-1">Welcome back, {user?.fullName || user?.username || 'Host'}! 👋</h2>
          <p className="text-green-100">
            {upcomingBookings.length > 0
              ? `You have ${upcomingBookings.length} booking${upcomingBookings.length > 1 ? 's' : ''}`
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

      {/* Stats cards */}
      <div className="grid md:grid-cols-4 gap-4">
        {/* This Month Earnings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-500" />
            <span className="text-xs text-green-600 font-semibold">THIS MONTH</span>
          </div>
          <div className="text-2xl mb-1 font-bold">৳{thisMonthEarnings.toLocaleString()}</div>
          <p className="text-sm text-gray-600">Earnings</p>
          <p className="text-xs text-gray-500 mt-2">
            {thisMonthBookings} booking{thisMonthBookings !== 1 ? 's' : ''} completed
          </p>
        </div>

        {/* All-Time Earnings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-blue-500" />
            <span className="text-xs text-blue-600 font-semibold">ALL TIME</span>
          </div>
          <div className="text-2xl mb-1 font-bold">৳{(stats?.allTime?.hostEarnings ?? 0).toLocaleString()}</div>
          <p className="text-sm text-gray-600">Total Earnings</p>
          <p className="text-xs text-gray-500 mt-2">
            Avg: ৳{(stats?.allTime?.averagePerBooking ?? 0).toLocaleString()} per booking
          </p>
        </div>

        {/* Total Bookings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <Calendar className="w-8 h-8 text-blue-500 mb-2" />
          <div className="text-2xl mb-1 font-bold">{totalBookings}</div>
          <p className="text-sm text-gray-600">Total Bookings</p>
          <p className="text-xs text-blue-600 mt-2">
            {upcomingCount > 0 ? `${upcomingCount} confirmed upcoming` : 'No confirmed upcoming'}
          </p>
        </div>

        {/* Average Rating */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <Star className="w-8 h-8 text-yellow-500 mb-2" />
          <div className="text-2xl mb-1 font-bold">
            {avgRating !== null ? Number(avgRating).toFixed(1) : '—'}
          </div>
          <p className="text-sm text-gray-600">Average Rating</p>
          <p className="text-xs text-gray-500 mt-2">
            {totalReviews > 0 ? `From ${totalReviews} review${totalReviews > 1 ? 's' : ''}` : 'No reviews yet'}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Earnings Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="mb-4 font-bold text-lg">Earnings Overview (Last 6 Months)</h3>
            {earningsData.length > 0 ? (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={earningsData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#9ca3af"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`}
                      stroke="#9ca3af"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      formatter={(v) => [`৳${v.toLocaleString()}`, 'Earnings']}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
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
              <div className="flex items-center justify-center h-64 text-gray-400">
                <div className="text-center">
                  <p className="text-sm mb-2">📊 No earnings data yet</p>
                  <p className="text-xs text-gray-500">Complete your first booking to see the chart</p>
                </div>
              </div>
            )}
          </div>

          {/* Upcoming Bookings */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Upcoming Bookings</h3>
              <button 
                className="text-sm text-green-600 hover:text-green-700 font-semibold" 
                onClick={() => setView('allBookings')}
              >
                View All →
              </button>
            </div>

            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No upcoming bookings yet
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.map((booking) => {
                  const guestName = booking.traveler?.name || booking.guestName || booking.travelerName || 'Guest';
                  const avatar = booking.traveler?.avatar || booking.avatar || null;
                  const checkIn = booking.checkIn || booking.checkInDate;
                  const checkOut = booking.checkOut || booking.checkOutDate;
                  const status = booking.status || 'pending';

                  // ✅ Show host earnings (amount after platform fee)
                  const amount = booking.hostEarnings ?? (booking.totalAmount ?? 0);

                  return (
                    <div 
                      key={booking._id || booking.id} 
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
                          <p className="text-xs text-gray-600">
                            {checkIn && checkOut
                              ? `${fmt(checkIn)} – ${fmt(checkOut)}`
                              : 'Dates not set'}
                          </p>
                          <p className="text-xs text-gray-400">{booking.guests || 1} guest{(booking.guests || 1) > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">৳{amount.toLocaleString()}</div>
                        <span className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                          status === 'confirmed' ? 'bg-green-100 text-green-700'
                          : status === 'pending' ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                        }`}>
                          {status}
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
                className="text-sm text-green-600 hover:text-green-700 font-semibold" 
                onClick={() => setView('allReviews')}
              >
                View All →
              </button>
            </div>

            {recentReviews.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No reviews yet — complete your first booking to receive reviews.
              </div>
            ) : (
              <div className="space-y-4">
                {recentReviews.map((review, i) => {
                  const reviewerName = review.traveler?.name || review.travelerName || review.guestName || review.userName || 'Guest';
                  const reviewerAvatar = review.traveler?.avatar || review.avatar || null;
                  const rating = review.rating || 0;
                  const comment = review.comment || review.text || review.review || '';
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
                            <span className="text-xs text-gray-500 whitespace-nowrap">{timeAgo(date)}</span>
                          </div>
                          <div className="flex gap-0.5 mb-2 mt-0.5">
                            {[1, 2, 3, 4, 5].map(n => (
                              <Star 
                                key={n} 
                                className={`w-4 h-4 ${n <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200 fill-gray-200'}`} 
                              />
                            ))}
                          </div>
                          {comment && <p className="text-sm text-gray-700">{comment}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Verification Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-4">Verification Status</h3>
            {[
              { label: 'Identity Verified', done: verif.identityVerified },
              { label: 'Police Check', done: verif.policeCheck },
              { label: 'Training Complete', done: verif.trainingComplete },
              { label: 'Bank Details', done: verif.bankDetails },
            ].map(({ label, done }) => (
              <div key={label} className="flex items-center gap-2 mb-3">
                {done
                  ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  : <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />}
                <span className={`text-sm ${done ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                  {label}
                </span>
                {!done && <span className="text-xs text-amber-600 ml-auto font-semibold">Pending</span>}
              </div>
            ))}
          </div>

          {/* All-Time Stats */}
          {stats && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg mb-4">All-Time Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Earnings</span>
                  <span className="font-semibold text-green-600">৳{(stats.allTime?.hostEarnings || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Guests</span>
                  <span className="font-semibold">{stats.allTime?.totalGuests || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Bookings</span>
                  <span className="font-semibold">{stats.totalBookings || 0}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-100 pt-3 mt-3">
                  <span className="text-gray-600">Response Rate</span>
                  <span className="font-semibold">{responseRate ?? '—'}{responseRate != null ? '%' : ''}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}