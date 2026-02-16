import { useState } from 'react';
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Star,
  Eye,
  CheckCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { AllBookings } from './AllBookings';
import { AllReviews } from './AllReviews';

const earningsData = [
  { month: 'Jan', earnings: 12000 },
  { month: 'Feb', earnings: 15000 },
  { month: 'Mar', earnings: 18000 },
  { month: 'Apr', earnings: 16000 },
  { month: 'May', earnings: 22000 },
  { month: 'Jun', earnings: 25000 },
];

const upcomingBookings = [
  {
    id: 1,
    traveler: 'Riya Rahman',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=riya',
    dates: 'Dec 20-23, 2024',
    amount: 7500,
    status: 'confirmed',
  },
  {
    id: 2,
    traveler: 'Arif Hasan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arif',
    dates: 'Dec 25-27, 2024',
    amount: 6000,
    status: 'pending',
  },
  {
    id: 3,
    traveler: 'Nusrat Jahan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nusrat',
    dates: 'Jan 2-5, 2025',
    amount: 8000,
    status: 'confirmed',
  },
];

const recentReviews = [
  {
    id: 1,
    traveler: 'Mehedi Hassan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mehedi',
    rating: 5,
    comment:
      'Excellent host! Made our trip unforgettable with local insights.',
    date: '2 days ago',
  },
  {
    id: 2,
    traveler: 'Aisha Rahman',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aisha',
    rating: 5,
    comment: 'Very welcoming and helpful. Highly recommended!',
    date: '1 week ago',
  },
];

export function HostHome({ user }) {
  const [view, setView] = useState('home');

  if (view === 'allBookings') {
    return <AllBookings onBack={() => setView('home')} />;
  }

  if (view === 'allReviews') {
    return <AllReviews onBack={() => setView('home')} />;
  }

  return (
    <div className="space-y-6">
      
      <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-6 text-white">
        <h2 className="text-2xl mb-2">
          Welcome back, {user.name}! 👋
        </h2>
        <p>You have 3 upcoming bookings and 2 new messages</p>
      </div>

     
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-500" />
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl mb-1">৳25,000</div>
          <p className="text-sm text-gray-600">This Month</p>
          <p className="text-xs text-green-600 mt-1">
            +15% from last month
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <Calendar className="w-8 h-8 text-blue-500 mb-2" />
          <div className="text-2xl mb-1">8</div>
          <p className="text-sm text-gray-600">Total Bookings</p>
          <p className="text-xs text-blue-600 mt-1">3 upcoming</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <Star className="w-8 h-8 text-yellow-500 mb-2" />
          <div className="text-2xl mb-1">4.9</div>
          <p className="text-sm text-gray-600">Average Rating</p>
          <p className="text-xs text-gray-500 mt-1">
            From 45 reviews
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <Eye className="w-8 h-8 text-purple-500 mb-2" />
          <div className="text-2xl mb-1">342</div>
          <p className="text-sm text-gray-600">Profile Views</p>
          <p className="text-xs text-purple-600 mt-1">
            +28 this week
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
         
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Earnings Overview</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={earningsData}>
                  <defs>
                    <linearGradient
                      id="colorEarnings"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#10b981"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="#10b981"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="earnings"
                    stroke="#10b981"
                    fill="url(#colorEarnings)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

         
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between mb-4">
              <h3>Upcoming Bookings</h3>
              <button
                className="text-sm text-blue-500 hover:underline"
                onClick={() => setView('allBookings')}
              >
                View All
              </button>
            </div>

            {upcomingBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex gap-3">
                  <img
                    src={booking.avatar}
                    alt={booking.traveler}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h4 className="text-sm">{booking.traveler}</h4>
                    <p className="text-xs text-gray-600">
                      {booking.dates}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div>৳{booking.amount}</div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

         
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between mb-4">
              <h3>Recent Reviews</h3>
              <button
                className="text-sm text-blue-500 hover:underline"
                onClick={() => setView('allReviews')}
              >
                View All
              </button>
            </div>

            {recentReviews.map((review) => (
              <div key={review.id} className="pb-4 border-b last:border-0">
                <div className="flex gap-3">
                  <img
                    src={review.avatar}
                    alt={review.traveler}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="flex justify-between">
                      <h4 className="text-sm">{review.traveler}</h4>
                      <span className="text-xs text-gray-500">
                        {review.date}
                      </span>
                    </div>

                    <div className="flex gap-1 mb-2">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-yellow-500 fill-yellow-500"
                        />
                      ))}
                    </div>

                    <p className="text-sm text-gray-700">
                      {review.comment}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Verification Status</h3>
            {[
              'Identity Verified',
              'Police Check',
              'Training Complete',
              'Bank Details',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}