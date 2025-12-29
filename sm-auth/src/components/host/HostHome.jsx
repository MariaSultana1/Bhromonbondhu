import { TrendingUp, Calendar, DollarSign, Star, Users, Eye, MessageSquare, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const earningsData = [
  { month: 'Jan', earnings: 12000 },
  { month: 'Feb', earnings: 15000 },
  { month: 'Mar', earnings: 18000 },
  { month: 'Apr', earnings: 16000 },
  { month: 'May', earnings: 22000 },
  { month: 'Jun', earnings: 25000 }
];

const upcomingBookings = [
  { id: 1, traveler: 'Riya Rahman', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=riya', dates: 'Dec 20-23, 2024', amount: 7500, status: 'confirmed' },
  { id: 2, traveler: 'Arif Hasan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arif', dates: 'Dec 25-27, 2024', amount: 6000, status: 'pending' },
  { id: 3, traveler: 'Nusrat Jahan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nusrat', dates: 'Jan 2-5, 2025', amount: 8000, status: 'confirmed' }
];

const recentReviews = [
  { id: 1, traveler: 'Mehedi Hassan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mehedi', rating: 5, comment: 'Excellent host! Made our trip unforgettable with local insights.', date: '2 days ago' },
  { id: 2, traveler: 'Aisha Rahman', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aisha', rating: 5, comment: 'Very welcoming and helpful. Highly recommended!', date: '1 week ago' }
];

export function HostHome({ user }) {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-6 text-white">
        <h2 className="text-2xl mb-2">Welcome back, {user.name}! 👋</h2>
        <p>You have 3 upcoming bookings and 2 new messages</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-500" />
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl mb-1">৳25,000</div>
          <p className="text-sm text-gray-600">This Month</p>
          <p className="text-xs text-green-600 mt-1">+15% from last month</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
          <div className="text-2xl mb-1">8</div>
          <p className="text-sm text-gray-600">Total Bookings</p>
          <p className="text-xs text-blue-600 mt-1">3 upcoming</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
          <div className="text-2xl mb-1">4.9</div>
          <p className="text-sm text-gray-600">Average Rating</p>
          <p className="text-xs text-gray-500 mt-1">From 45 reviews</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-8 h-8 text-purple-500" />
          </div>
          <div className="text-2xl mb-1">342</div>
          <p className="text-sm text-gray-600">Profile Views</p>
          <p className="text-xs text-purple-600 mt-1">+28 this week</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Earnings Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Earnings Overview</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={earningsData}>
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="earnings" stroke="#10b981" fillOpacity={1} fill="url(#colorEarnings)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Upcoming Bookings */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3>Upcoming Bookings</h3>
              <button className="text-sm text-blue-500 hover:underline">View All</button>
            </div>
            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <img src={booking.avatar} alt={booking.traveler} className="w-12 h-12 rounded-full" />
                    <div>
                      <h4 className="text-sm mb-1">{booking.traveler}</h4>
                      <p className="text-xs text-gray-600">{booking.dates}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="mb-1">৳{booking.amount}</div>
                    <span className={`text-xs px-2 py-1 rounded-full ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3>Recent Reviews</h3>
              <button className="text-sm text-blue-500 hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {recentReviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-start gap-3">
                    <img src={review.avatar} alt={review.traveler} className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm">{review.traveler}</h4>
                        <span className="text-xs text-gray-500">{review.date}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        ))}
                      </div>
                      <p className="text-sm text-gray-700">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Response Rate</span><span className="text-green-600">98%</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Response Time</span><span className="text-blue-600">2 hours</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Acceptance Rate</span><span className="text-green-600">92%</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Total Guests</span><span className="text-purple-600">124</span></div>
            </div>
          </div>

          {/* Verification Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Verification Status</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /><span className="text-sm">Identity Verified</span></div>
              <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /><span className="text-sm">Police Check</span></div>
              <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /><span className="text-sm">Training Complete</span></div>
              <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /><span className="text-sm">Bank Details</span></div>
            </div>
          </div>

          {/* Performance Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="mb-3">💡 Tips to Improve</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span><span>Respond to messages within 1 hour to boost your ranking</span></li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span><span>Keep your calendar updated to get more bookings</span></li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span><span>Add more photos to increase profile views by 40%</span></li>
            </ul>
          </div>

          {/* Platform Fee Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-3">Platform Fee</h3>
            <p className="text-sm text-gray-600 mb-2">15% service fee is deducted from each booking</p>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between text-sm mb-1"><span>Booking Amount:</span><span>৳10,000</span></div>
              <div className="flex items-center justify-between text-sm mb-1"><span>Platform Fee (15%):</span><span className="text-red-600">-৳1,500</span></div>
              <div className="flex items-center justify-between border-t pt-1 mt-1"><span>You Receive:</span><span className="text-green-600">৳8,500</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
