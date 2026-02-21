import { DollarSign, TrendingUp, Download, Calendar, CreditCard, X, Loader, AlertCircle, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const getAuthToken = () => localStorage.getItem('token');
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }), ...(options.headers || {}) },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

export function HostEarnings() {
  const [earnings, setEarnings] = useState(null);
  const [earningsSummary, setEarningsSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState('primary');
  const [processingPayout, setProcessingPayout] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [payoutSchedule, setPayoutSchedule] = useState('weekly');
  const [minPayoutAmount, setMinPayoutAmount] = useState(1000);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => { fetchEarningsData(); }, []);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [earningsRes, summaryRes] = await Promise.all([
        apiCall('/hosts/earnings'),
        apiCall('/hosts/earnings/summary'),
      ]);
      const rawTransactions = earningsRes.earnings?.recentTransactions || [];
      setEarnings(earningsRes.earnings);
      setTransactions(rawTransactions);
      setEarningsSummary(summaryRes.summary);
      generateMonthlyData(rawTransactions);
      setPayoutAmount(earningsRes.earnings?.paidEarnings?.toString() || '0');
      loadBankSettings();
    } catch (err) {
      setError(err.message || 'Failed to fetch earnings data');
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyData = (transactionList) => {
    const monthMap = {};
    transactionList.forEach((t) => {
      const date = new Date(t.date || t.createdAt);
      if (isNaN(date)) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { month: 'short' });
      if (!monthMap[key]) monthMap[key] = { month: label, amount: 0, key };
      // ✅ t.amount from /hosts/earnings is already hostEarnings (after platform fee)
      monthMap[key].amount += t.amount || 0;
    });
    const sorted = Object.values(monthMap).sort((a, b) => a.key.localeCompare(b.key)).slice(-6).map(({ month, amount }) => ({ month, amount }));
    setMonthlyData(sorted);
  };

  const loadBankSettings = () => {
    const saved = localStorage.getItem('hostBankSettings');
    if (saved) {
      const s = JSON.parse(saved);
      setBankAccounts(s.bankAccounts || defaultAccounts());
      setPayoutSchedule(s.payoutSchedule || 'weekly');
      setMinPayoutAmount(s.minPayoutAmount || 1000);
      setEmailNotifications(s.emailNotifications !== false);
    } else {
      setBankAccounts(defaultAccounts());
    }
  };

  const defaultAccounts = () => [
    { id: 'primary', name: 'Primary Account', bank: 'Dutch Bangla Bank', location: 'Dhaka', number: '**** **** **** 1234', isPrimary: true },
  ];

  const handleRequestPayout = async () => {
    const amount = parseFloat(payoutAmount);
    if (!amount || amount < minPayoutAmount) { alert(`Minimum payout amount is ৳${minPayoutAmount.toLocaleString()}`); return; }
    setProcessingPayout(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      alert(`✅ Payout request of ৳${amount.toLocaleString()} submitted! It will be processed within 2-3 business days.`);
      setShowPayoutModal(false);
    } catch (err) { alert(`Error: ${err.message}`); }
    finally { setProcessingPayout(false); }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      localStorage.setItem('hostBankSettings', JSON.stringify({ bankAccounts, payoutSchedule, minPayoutAmount, emailNotifications }));
      alert('✅ Settings saved successfully!');
      setShowSettingsModal(false);
    } finally { setSavingSettings(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader className="w-8 h-8 animate-spin text-blue-500" />
      <span className="ml-3 text-gray-600">Loading earnings data...</span>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-red-500 mt-0.5" />
        <div>
          <p className="font-bold text-red-800">Error loading earnings</p>
          <p className="text-sm text-red-700 mt-1">{error}</p>
          <button onClick={fetchEarningsData} className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    </div>
  );

  const totalEarnings = earningsSummary?.allTime?.totalEarnings || 0;
  const thisMonthEarnings = earningsSummary?.thisMonth?.earnings || 0;
  const upcomingEarnings = earnings?.pendingEarnings || 0;
  const availableBalance = earnings?.paidEarnings || 0;

  // ✅ FIX: Correct totals — t.totalAmount = guest paid, t.platformFee = fee, t.amount = host receives
  const totalGuestPaid  = transactions.reduce((s, t) => s + (t.totalAmount  || 0), 0);
  const totalFees       = transactions.reduce((s, t) => s + (t.platformFee  || 0), 0);
  const totalHostEarned = transactions.reduce((s, t) => s + (t.amount       || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-2 font-bold">Earnings Dashboard</h2>
          <p className="text-gray-600">Track your income and manage payouts</p>
        </div>
        <button onClick={fetchEarningsData} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { icon: <DollarSign className="w-8 h-8 text-green-500" />, value: totalEarnings, label: 'Total Earnings', sub: 'Lifetime (after fees)', color: 'text-green-600' },
          { icon: <TrendingUp className="w-8 h-8 text-blue-500" />, value: thisMonthEarnings, label: 'This Month', sub: `${earningsSummary?.thisMonth?.bookings || 0} bookings`, color: 'text-blue-600' },
          { icon: <Calendar className="w-8 h-8 text-purple-500" />, value: upcomingEarnings, label: 'Upcoming', sub: 'Pending bookings', color: 'text-purple-600' },
          { icon: <CreditCard className="w-8 h-8 text-orange-500" />, value: availableBalance, label: 'Available', sub: 'Ready to withdraw', color: 'text-orange-600' },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="mb-2">{card.icon}</div>
            <div className="text-2xl mb-1 font-bold">৳{card.value.toLocaleString()}</div>
            <p className="text-sm text-gray-600">{card.label}</p>
            <p className={`text-xs mt-1 ${card.color}`}>{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {monthlyData.length > 0 ? (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">Monthly Earnings (After Platform Fee)</h3>
                <button className="text-sm text-blue-500 hover:underline flex items-center gap-1"><Download className="w-4 h-4" /> Export</button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => `৳${v.toLocaleString()}`} />
                  <Tooltip formatter={(value) => [`৳${value.toLocaleString()}`, 'Your Earnings']} />
                  <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center text-gray-400">No earnings data yet to display chart</div>
          )}

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">
              Transaction History
              <span className="ml-2 text-sm font-normal text-gray-500">({transactions.length} records)</span>
            </h3>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No transactions yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Guest</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Location</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Date</th>
                      <th className="text-right py-3 text-sm font-medium text-gray-600">Guest Paid</th>
                      <th className="text-right py-3 text-sm font-medium text-gray-600">Platform Fee</th>
                      <th className="text-right py-3 text-sm font-medium text-gray-600">Your Earnings</th>
                      <th className="text-right py-3 text-sm font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t, i) => (
                      <tr key={t._id || i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <td className="py-3 text-sm">{t.bookingDetails?.guestName || t.guestName || 'Guest'}</td>
                        <td className="py-3 text-sm text-gray-500">{t.bookingDetails?.location || t.location || '—'}</td>
                        <td className="py-3 text-sm text-gray-600">{t.date ? new Date(t.date).toLocaleDateString() : '—'}</td>
                        {/* ✅ FIX: totalAmount = what guest paid (before fee) */}
                        <td className="py-3 text-sm text-right">৳{(t.totalAmount || 0).toLocaleString()}</td>
                        {/* ✅ FIX: platformFee = deducted amount */}
                        <td className="py-3 text-sm text-right text-red-500">-৳{(t.platformFee || 0).toLocaleString()}</td>
                        {/* ✅ FIX: t.amount is hostEarnings from the API response mapping */}
                        <td className="py-3 text-sm text-right font-semibold text-green-600">৳{(t.amount || 0).toLocaleString()}</td>
                        <td className="py-3 text-right">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            t.status === 'completed' ? 'bg-green-100 text-green-700'
                            : t.status === 'paid' ? 'bg-blue-100 text-blue-700'
                            : t.status === 'pending' ? 'bg-yellow-100 text-yellow-700'
                            : t.status === 'refunded' ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                          }`}>{t.status || 'completed'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 bg-gray-50">
                      <td colSpan={3} className="py-3 text-sm font-bold pl-2">Totals</td>
                      {/* ✅ FIX: correct total columns */}
                      <td className="py-3 text-sm text-right font-bold">৳{totalGuestPaid.toLocaleString()}</td>
                      <td className="py-3 text-sm text-right font-bold text-red-500">-৳{totalFees.toLocaleString()}</td>
                      <td className="py-3 text-sm text-right font-bold text-green-600">৳{totalHostEarned.toLocaleString()}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">Payout Management</h3>
            <div className="space-y-3 mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Available Balance</p>
                <p className="text-2xl font-bold text-green-600">৳{availableBalance.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                <p className="text-sm font-medium">{earnings?.totalBookings || 0} bookings</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Per Booking</p>
                <p className="text-sm font-medium">৳{(earningsSummary?.allTime?.averagePerBooking || 0).toLocaleString()}</p>
              </div>
            </div>
            <button onClick={() => { setPayoutAmount(availableBalance.toString()); setShowPayoutModal(true); }} className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 mb-2 font-medium">Request Payout</button>
            <button onClick={() => setShowSettingsModal(true)} className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">Update Settings</button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-bold text-blue-900 mb-3">Platform Fee Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-700">Service Fee</span><span className="font-medium">15%</span></div>
              <div className="flex justify-between"><span className="text-gray-700">Payment Processing</span><span className="font-medium">Included</span></div>
              <div className="flex justify-between"><span className="text-gray-700">Escrow Protection</span><span className="font-medium">Included</span></div>
            </div>
            <p className="text-xs text-gray-600 mt-3">The platform fee covers payment processing, insurance, and 24/7 support.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3">Tax Documents</h3>
            <button className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm mb-2 font-medium">Download 2025 Statement</button>
            <button className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">View Tax Info</button>
          </div>
        </div>
      </div>

      {showPayoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 flex items-center justify-between">
              <div><h3 className="text-2xl mb-1 font-bold">Request Payout</h3><p className="text-green-100 text-sm">Withdraw your earnings</p></div>
              <button onClick={() => setShowPayoutModal(false)} className="p-2 hover:bg-white/20 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="text-sm text-gray-600 mb-1">Available Balance</div>
                <div className="text-3xl text-green-600 font-bold">৳{availableBalance.toLocaleString()}</div>
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700 font-medium">Payout Amount</label>
                <input type="number" value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)} max={availableBalance} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" />
                <p className="text-xs text-gray-500 mt-1">Min: ৳{minPayoutAmount.toLocaleString()} · Max: ৳{availableBalance.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700 font-medium">Bank Account</label>
                <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500">
                  {bankAccounts.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.number})</option>)}
                </select>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl text-sm space-y-1">
                <div className="flex justify-between"><span className="text-gray-600">Amount:</span><span>৳{parseFloat(payoutAmount || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Processing Fee:</span><span>৳0</span></div>
                <div className="flex justify-between pt-2 border-t border-gray-200 font-medium"><span>You'll receive:</span><span className="text-green-600">৳{parseFloat(payoutAmount || 0).toLocaleString()}</span></div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">💡 Payouts are processed within 2-3 business days</div>
              <button onClick={handleRequestPayout} disabled={processingPayout || !payoutAmount || parseFloat(payoutAmount) <= 0} className="w-full py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:bg-gray-300 font-bold flex items-center justify-center gap-2">
                {processingPayout ? <><Loader className="w-5 h-5 animate-spin" /> Processing...</> : 'Confirm Payout Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 flex items-center justify-between">
              <div><h3 className="text-2xl mb-1 font-bold">Payout Settings</h3><p className="text-blue-100 text-sm">Manage your payment preferences</p></div>
              <button onClick={() => setShowSettingsModal(false)} className="p-2 hover:bg-white/20 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-bold text-gray-800 mb-4">Bank Accounts</h4>
                <div className="space-y-3">
                  {bankAccounts.map((a) => (
                    <div key={a.id} className={`flex items-center justify-between p-4 border-2 rounded-xl ${a.isPrimary ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
                      <div>
                        <div className="text-sm font-medium mb-1">{a.name}</div>
                        <div className="text-gray-600 text-sm">{a.number}</div>
                        <div className="text-xs text-gray-500 mt-1">{a.bank} - {a.location}</div>
                      </div>
                      {a.isPrimary && <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full font-medium">Primary</span>}
                    </div>
                  ))}
                </div>
                <button className="mt-3 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium">+ Add New Bank Account</button>
              </div>
              <div className="border-t pt-6">
                <h4 className="font-bold text-gray-800 mb-4">Payout Schedule</h4>
                <div className="space-y-3">
                  {[{ value: 'weekly', label: 'Weekly', desc: 'Every Monday' }, { value: 'biweekly', label: 'Bi-weekly', desc: 'Every 1st and 15th' }, { value: 'monthly', label: 'Monthly', desc: 'First Monday of each month' }, { value: 'manual', label: 'Manual', desc: 'Request payouts manually' }].map((opt) => (
                    <label key={opt.value} className={`flex items-center p-4 border-2 rounded-xl cursor-pointer ${payoutSchedule === opt.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input type="radio" name="schedule" value={opt.value} checked={payoutSchedule === opt.value} onChange={(e) => setPayoutSchedule(e.target.value)} className="mr-3" />
                      <div><div className="text-sm font-medium">{opt.label}</div><div className="text-xs text-gray-600">{opt.desc}</div></div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="border-t pt-6">
                <h4 className="font-bold text-gray-800 mb-4">Minimum Payout Amount</h4>
                <select value={minPayoutAmount} onChange={(e) => setMinPayoutAmount(parseInt(e.target.value))} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value={1000}>৳1,000</option><option value={2500}>৳2,500</option><option value={5000}>৳5,000</option><option value={10000}>৳10,000</option>
                </select>
              </div>
              <div className="border-t pt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} className="w-5 h-5 rounded border-gray-300" />
                  <div className="text-sm"><div className="font-medium text-gray-800">Email notifications</div><div className="text-xs text-gray-500">Get notified when payout is processed</div></div>
                </label>
              </div>
              <button onClick={handleSaveSettings} disabled={savingSettings} className="w-full py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 font-bold flex items-center justify-center gap-2">
                {savingSettings ? <><Loader className="w-5 h-5 animate-spin" /> Saving...</> : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HostEarnings;