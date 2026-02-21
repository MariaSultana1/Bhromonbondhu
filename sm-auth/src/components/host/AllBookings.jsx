import { useState, useEffect } from 'react';
import {
  Calendar, User, Loader, AlertCircle, RefreshCw,
  ArrowLeft, Search, ChevronDown, ChevronUp, CheckCircle, XCircle
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const calcNights = (ci, co) => {
  if (!ci || !co) return 0;
  return Math.max(0, Math.ceil((new Date(co) - new Date(ci)) / 86400000));
};

const STATUS_STYLES = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
};

export function AllBookings({ onBack }) {
  const [bookings, setBookings]           = useState([]);
  const [transactions, setTransactions]   = useState([]);
  const [totalEarningsAll, setTotalEarningsAll] = useState(0);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [search, setSearch]               = useState('');
  const [statusFilter, setStatusFilter]   = useState('all');
  const [expandedId, setExpandedId]       = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [bookingsRes, earningsRes] = await Promise.allSettled([
        apiCall('/host/booking-requests'),
        
        apiCall('/hosts/earnings'),
      ]);

      const rawBookings = bookingsRes.status === 'fulfilled'
        ? (bookingsRes.value?.bookings || [])
        : [];
      setBookings(rawBookings);

      if (earningsRes.status === 'fulfilled') {
        const txns = earningsRes.value?.earnings?.recentTransactions || [];
        setTransactions(txns);

        
        let allTotal = 0;
        txns.forEach((t) => {

          const hostCut = Number(t.amount ?? 0);
          allTotal += hostCut;
        });
        setTotalEarningsAll(allTotal);
      }
    } catch (e) {
      setError(e.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const getEarnings = (booking) => {
    const matched = transactions.find(t =>
      String(t.bookingId) === String(booking._id) ||
      String(t._id)       === String(booking.earningId)
    );

    if (matched) {
      const hostEarnings = Number(matched.amount      ?? 0); 
      const guestPaid    = Number(matched.totalAmount ?? 0);  
      const platformFee  = Number(matched.platformFee ?? 0);

      // Fallback: reconstruct guestPaid if totalAmount is missing
      const finalGuestPaid = guestPaid > 0 ? guestPaid : hostEarnings + platformFee;

      return { guestPaid: finalGuestPaid, platformFee, hostEarnings };
    }

    // No matched earning record — use booking fields directly
    const guestPaid    = Number(booking.hostEarnings  || 0);
    const platformFee  = Number(booking.platformFee || 0);
    const hostEarnings = guestPaid-platformFee;
    return { guestPaid, platformFee, hostEarnings };
  };

  const handleAccept = async (bookingId, e) => {
    e.stopPropagation();
    setActionLoading(bookingId);
    try {
      await apiCall(`/host/booking-requests/${bookingId}/accept`, { method: 'PUT' });
      await fetchAll();
    } catch (err) {
      alert(err.message || 'Failed to accept booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (bookingId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to decline this booking?')) return;
    setActionLoading(bookingId);
    try {
      await apiCall(`/host/booking-requests/${bookingId}/decline`, {
        method: 'PUT',
        body: JSON.stringify({ reason: 'Host declined' }),
      });
      await fetchAll();
    } catch (err) {
      alert(err.message || 'Failed to decline booking');
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount   = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

  const filtered = bookings.filter(b => {
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (b.traveler?.name || '').toLowerCase().includes(q) ||
      (b.bookingId || '').toLowerCase().includes(q) ||
      (b.location || '').toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader className="w-8 h-8 animate-spin text-green-500" />
      <span className="ml-3 text-gray-600">Loading bookings...</span>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
      <AlertCircle className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-bold text-red-800">Failed to load bookings</p>
        <p className="text-sm text-red-700 mt-1">{error}</p>
        <button onClick={fetchAll} className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    </div>
  );

  const summaryCards = [
    { label: 'All',       value: bookings.length, color: 'gray',   filter: 'all' },
    { label: 'Pending',   value: pendingCount,     color: 'yellow', filter: 'pending' },
    { label: 'Confirmed', value: confirmedCount,   color: 'green',  filter: 'confirmed' },
    { label: 'Completed', value: completedCount,   color: 'blue',   filter: 'completed' },
    { label: 'Cancelled', value: cancelledCount,   color: 'red',    filter: 'cancelled' },
  ];

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h2 className="text-2xl font-bold">All Bookings</h2>
          <p className="text-sm text-gray-500">{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={fetchAll} className="ml-auto flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {summaryCards.map(({ label, value, color, filter }) => (
          <div
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={`bg-white rounded-xl p-4 shadow-sm border text-center cursor-pointer hover:shadow-md transition-all ${
              statusFilter === filter ? 'border-green-400 ring-2 ring-green-300' : 'border-gray-100'
            }`}
          >
            <div className={`text-2xl font-bold text-${color}-600`}>{value}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by guest name, booking ID or location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Booking List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-16 text-center shadow-sm border border-gray-100">
          <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 text-sm">No bookings match your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(booking => {
            const nights     = calcNights(booking.checkIn, booking.checkOut);
            const isExpanded = expandedId === booking._id;
            const isActing   = actionLoading === booking._id;
            const { guestPaid, platformFee, hostEarnings } = getEarnings(booking);

            return (
              <div key={booking._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Row */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => setExpandedId(isExpanded ? null : booking._id)}
                >
                  {booking.traveler?.avatar ? (
                    <img src={booking.traveler.avatar} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800 truncate">
                        {booking.traveler?.name || 'Guest'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[booking.status] || 'bg-gray-100 text-gray-600'}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
                      {' · '}{nights} night{nights !== 1 ? 's' : ''}
                      {' · '}{booking.guests || 1} guest{(booking.guests || 1) !== 1 ? 's' : ''}
                    </p>
                    {booking.bookingId && <p className="text-xs text-gray-400">#{booking.bookingId}</p>}
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="font-bold text-green-600">৳{hostEarnings.toLocaleString()}</div>
                      <div className="text-xs text-gray-400">your earnings</div>
                    </div>

                    {booking.status === 'pending' && (
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                        <button
                          disabled={isActing}
                          onClick={e => handleAccept(booking._id, e)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 disabled:opacity-50 transition"
                        >
                          {isActing ? <Loader className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                          Accept
                        </button>
                        <button
                          disabled={isActing}
                          onClick={e => handleDecline(booking._id, e)}
                          className="flex items-center gap-1 px-3 py-1.5 border border-red-300 text-red-600 text-xs rounded-lg hover:bg-red-50 disabled:opacity-50 transition"
                        >
                          <XCircle className="w-3 h-3" />
                          Decline
                        </button>
                      </div>
                    )}

                    {isExpanded
                      ? <ChevronUp className="w-4 h-4 text-gray-400" />
                      : <ChevronDown className="w-4 h-4 text-gray-400" />
                    }
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50">

                    {/* Earnings Breakdown */}
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Earnings Breakdown</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                          <span>Guest Paid (Total)</span>
                          <span>৳{guestPaid.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-red-500">
                          <span>Platform Fee (15%)</span>
                          <span>−৳{platformFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold pt-2 border-t border-gray-200 text-base">
                          <span>Your Earnings</span>
                          <span className="text-green-600">৳{hostEarnings.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Detail Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      {[
                        ['Check-in',       formatDate(booking.checkIn)],
                        ['Check-out',      formatDate(booking.checkOut)],
                        ['Guests',         booking.guests || 1],
                        ['Nights',         nights],
                        ['Payment Method', booking.paymentMethod === 'card' ? 'Card' : (booking.paymentMethod || '—')],
                        ['Payment Status', booking.paymentStatus || '—'],
                      ].map(([label, val]) => (
                        <div key={label} className="bg-white rounded-lg p-3 shadow-sm">
                          <p className="text-xs text-gray-400 mb-1">{label}</p>
                          <p className="font-medium capitalize">{val}</p>
                        </div>
                      ))}
                    </div>

                    {(booking.traveler?.email || booking.traveler?.phone) && (
                      <div className="bg-white rounded-xl p-4 shadow-sm text-sm space-y-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Guest Contact</p>
                        {booking.traveler?.email && <p className="text-gray-700">✉ {booking.traveler.email}</p>}
                        {booking.traveler?.phone && <p className="text-gray-700">📞 {booking.traveler.phone}</p>}
                      </div>
                    )}

                    {booking.notes && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                        <p className="text-xs font-semibold text-yellow-700 mb-1">Guest Notes</p>
                        <p className="text-gray-700">{booking.notes}</p>
                      </div>
                    )}

                    {booking.selectedServices?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2">Services Requested</p>
                        <div className="flex flex-wrap gap-2">
                          {booking.selectedServices.map((s, i) => (
                            <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {booking.status === 'pending' && (
                      <div className="flex gap-3 pt-2">
                        <button
                          disabled={isActing}
                          onClick={e => handleAccept(booking._id, e)}
                          className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2 transition"
                        >
                          {isActing ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                          Accept Booking
                        </button>
                        <button
                          disabled={isActing}
                          onClick={e => handleDecline(booking._id, e)}
                          className="flex-1 py-2.5 border-2 border-red-300 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 disabled:opacity-50 flex items-center justify-center gap-2 transition"
                        >
                          <XCircle className="w-4 h-4" />
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AllBookings;