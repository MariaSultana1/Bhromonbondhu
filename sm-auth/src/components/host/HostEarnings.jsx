import { DollarSign, TrendingUp, Download, Calendar, CreditCard, ArrowUpRight, ArrowDownRight, Eye, ExternalLink, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useState } from 'react';

const monthlyEarnings = [
  { month: 'Jan', amount: 12000 },
  { month: 'Feb', amount: 15000 },
  { month: 'Mar', amount: 18000 },
  { month: 'Apr', amount: 16000 },
  { month: 'May', amount: 22000 },
  { month: 'Jun', amount: 25000 }
];

const earningsBreakdown = [
  { name: 'Local Guide', value: 45, amount: 45000 },
  { name: 'Meals', value: 30, amount: 30000 },
  { name: 'Transportation', value: 15, amount: 15000 },
  { name: 'Other Services', value: 10, amount: 10000 }
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

const transactions = [
  {
    id: 1,
    guest: 'Riya Rahman',
    date: 'Dec 15, 2024',
    amount: 7500,
    platformFee: 1125,
    netAmount: 6375,
    status: 'completed'
  },
  {
    id: 2,
    guest: 'Mehedi Hassan',
    date: 'Dec 10, 2024',
    amount: 6000,
    platformFee: 900,
    netAmount: 5100,
    status: 'completed'
  },
  {
    id: 3,
    guest: 'Arif Hasan',
    date: 'Dec 25, 2024',
    amount: 6000,
    platformFee: 900,
    netAmount: 5100,
    status: 'pending'
  },
  {
    id: 4,
    guest: 'Nusrat Jahan',
    date: 'Jan 5, 2025',
    amount: 8000,
    platformFee: 1200,
    netAmount: 6800,
    status: 'upcoming'
  }
];

export function HostEarnings() {
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showTransactionDetail, setShowTransactionDetail] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-2xl mb-2">Earnings Dashboard</h2>
        <p className="text-gray-600">Track your income and payouts</p>
      </div>

      
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
          <div className="text-2xl mb-1">৳108,000</div>
          <p className="text-sm text-gray-600">Total Earnings</p>
          <p className="text-xs text-green-600 mt-1">Lifetime</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
          <div className="text-2xl mb-1">৳25,000</div>
          <p className="text-sm text-gray-600">This Month</p>
          <p className="text-xs text-blue-600 mt-1">+15% from last month</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-purple-500" />
          </div>
          <div className="text-2xl mb-1">৳13,900</div>
          <p className="text-sm text-gray-600">Upcoming</p>
          <p className="text-xs text-purple-600 mt-1">2 bookings</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <CreditCard className="w-8 h-8 text-orange-500" />
          </div>
          <div className="text-2xl mb-1">৳11,475</div>
          <p className="text-sm text-gray-600">Available</p>
          <p className="text-xs text-orange-600 mt-1">Ready to withdraw</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
       
        <div className="lg:col-span-2 space-y-6">
         
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3>Monthly Earnings</h3>
              <button className="text-sm text-blue-500 hover:underline flex items-center gap-1">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={monthlyEarnings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Transaction History</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-sm">Guest</th>
                    <th className="text-left py-3 text-sm">Date</th>
                    <th className="text-right py-3 text-sm">Amount</th>
                    <th className="text-right py-3 text-sm">Fee (15%)</th>
                    <th className="text-right py-3 text-sm">Net</th>
                    <th className="text-right py-3 text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 text-sm">{transaction.guest}</td>
                      <td className="py-3 text-sm text-gray-600">{transaction.date}</td>
                      <td className="py-3 text-sm text-right">৳{transaction.amount}</td>
                      <td className="py-3 text-sm text-right text-red-600">-৳{transaction.platformFee}</td>
                      <td className="py-3 text-sm text-right">৳{transaction.netAmount}</td>
                      <td className="py-3 text-right">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs ${
                            transaction.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : transaction.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

       
        <div className="space-y-6">
         
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Earnings by Service</h3>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={earningsBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {earningsBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {earningsBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    ></div>
                    <span>{item.name}</span>
                  </div>
                  <span className="text-gray-600">৳{item.amount}</span>
                </div>
              ))}
            </div>
          </div>

         
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Payout Settings</h3>
            <div className="space-y-3 mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Bank Account</p>
                <p className="text-sm">**** **** **** 1234</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Next Payout</p>
                <p className="text-sm">Dec 20, 2024</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Payout Schedule</p>
                <p className="text-sm">Weekly</p>
              </div>
            </div>
            <button 
              onClick={() => setShowPayoutModal(true)}
              className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 mb-2"
            >
              Request Payout
            </button>
            <button 
              onClick={() => setShowSettingsModal(true)}
              className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              Update Settings
            </button>
          </div>

          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="mb-3">Platform Fee Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Service Fee</span>
                <span>15%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Payment Processing</span>
                <span>Included</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Escrow Protection</span>
                <span>Included</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              The platform fee covers payment processing, insurance, and 24/7 support.
            </p>
          </div>

       
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-3">Tax Documents</h3>
            <button className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm mb-2">
              Download 2024 Statement
            </button>
            <button className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              View Tax Info
            </button>
          </div>
        </div>
      </div>

      
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl mb-1">Request Payout</h3>
                <p className="text-green-100 text-sm">Withdraw your earnings</p>
              </div>
              <button onClick={() => setShowPayoutModal(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="text-sm text-gray-600 mb-1">Available Balance</div>
                <div className="text-3xl text-green-600">৳11,475</div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Payout Amount</label>
                <input
                  type="number"
                  defaultValue="11475"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum payout: ৳1,000</p>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Bank Account</label>
                <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option>**** **** **** 1234 (Primary)</option>
                  <option>**** **** **** 5678 (Secondary)</option>
                </select>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm mb-2">Payout Summary</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span>৳11,475</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processing Fee:</span>
                    <span>৳0</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span>Total:</span>
                    <span className="text-green-600">৳11,475</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">
                <p>💡 Payouts are typically processed within 2-3 business days</p>
              </div>

              <button className="w-full py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-md">
                Confirm Payout Request
              </button>
            </div>
          </div>
        </div>
      )}

     
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl mb-1">Payout Settings</h3>
                <p className="text-blue-100 text-sm">Manage your payment preferences</p>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="mb-4">Bank Accounts</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border-2 border-blue-200 bg-blue-50 rounded-xl">
                    <div>
                      <div className="text-sm mb-1">Primary Account</div>
                      <div className="text-gray-600">**** **** **** 1234</div>
                      <div className="text-xs text-gray-500 mt-1">Dutch Bangla Bank - Dhaka</div>
                    </div>
                    <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full">Primary</span>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div>
                      <div className="text-sm mb-1">Secondary Account</div>
                      <div className="text-gray-600">**** **** **** 5678</div>
                      <div className="text-xs text-gray-500 mt-1">Brac Bank - Chittagong</div>
                    </div>
                    <button className="text-sm text-blue-500 hover:underline">Set as Primary</button>
                  </div>
                </div>
                <button className="mt-3 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50">
                  + Add New Bank Account
                </button>
              </div>

              <div className="border-t pt-6">
                <h4 className="mb-4">Payout Schedule</h4>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 border-blue-500 bg-blue-50 rounded-xl cursor-pointer">
                    <input type="radio" name="schedule" defaultChecked className="mr-3" />
                    <div className="flex-1">
                      <div className="text-sm mb-1">Weekly</div>
                      <div className="text-xs text-gray-600">Every Monday</div>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="schedule" className="mr-3" />
                    <div className="flex-1">
                      <div className="text-sm mb-1">Bi-weekly</div>
                      <div className="text-xs text-gray-600">Every 1st and 15th</div>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="schedule" className="mr-3" />
                    <div className="flex-1">
                      <div className="text-sm mb-1">Monthly</div>
                      <div className="text-xs text-gray-600">First Monday of each month</div>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="schedule" className="mr-3" />
                    <div className="flex-1">
                      <div className="text-sm mb-1">Manual</div>
                      <div className="text-xs text-gray-600">Request payouts manually</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="mb-4">Minimum Payout Amount</h4>
                <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>৳1,000</option>
                  <option>৳2,500</option>
                  <option>৳5,000</option>
                  <option>৳10,000</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">Payouts will only be processed when your balance reaches this amount</p>
              </div>

              <div className="border-t pt-6">
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                  <div className="text-sm">
                    <div>Email me when payout is processed</div>
                    <div className="text-xs text-gray-500">Get notified about successful transactions</div>
                  </div>
                </label>
              </div>

              <button className="w-full py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 shadow-md">
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}