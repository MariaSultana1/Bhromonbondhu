import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    console.log('Register data:', formData);
  };

  return (
    <div className="min-h-screen flex">
      {/* ডান পাশ - ইমেজ/ডিজাইন */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-500 to-teal-600 items-center justify-center p-12">
        <div className="text-white max-w-md">
          <h1 className="text-4xl font-bold mb-6">Join Bhromonbondhu</h1>
          <p className="text-lg mb-8">
            Create your account and start your journey with us. Get access to exclusive deals, personalized travel plans, and much more.
          </p>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                <span className="text-white">✈️</span>
              </div>
              <span>Best price guarantee</span>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                <span className="text-white">🛡️</span>
              </div>
              <span>Secure booking</span>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                <span className="text-white">🎁</span>
              </div>
              <span>Member-only discounts</span>
            </div>
          </div>
        </div>
      </div>

      {/* বাম পাশ - ফর্ম */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">BB</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Register</h1>
            <p className="text-gray-600 mt-2">Welcome to Bhromonbondhu</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Email
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone no.
              </label>
              <input
                type="tel"
                name="phone"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                placeholder="+8801XXXXXXXXX"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passcode
              </label>
              <input
                type="password"
                name="password"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Passcode
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-start mt-4">
              <input
                type="checkbox"
                id="terms"
                className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                I agree to the{' '}
                <Link to="/terms" className="text-green-600 hover:text-green-800">
                  Terms & Conditions
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-green-600 hover:text-green-800">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl shadow-lg transition duration-200 mt-4"
            >
              Create Your Account
            </button>

            <div className="text-center text-gray-600 mt-6">
              Already have account yet?{' '}
              <Link to="/login" className="font-medium text-green-600 hover:text-green-800">
                Login
              </Link>
            </div>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">- or signup with -</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex items-center justify-center py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition"
              >
                <div className="w-5 h-5 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full mr-2"></div>
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition"
              >
                <div className="w-5 h-5 bg-gray-800 rounded-full mr-2"></div>
                Apple
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;