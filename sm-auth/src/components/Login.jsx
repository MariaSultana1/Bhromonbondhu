import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login:', { email, password });
  };

  return (
    <div className="min-h-screen flex">
      {/* বাম পাশ - ইমেজ/ডিজাইন */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center p-12">
        <div className="text-white max-w-md">
          <h1 className="text-4xl font-bold mb-6">Welcome Back!</h1>
          <p className="text-lg mb-8">
            Sign in to continue your journey with Bhromonbondhu. Discover amazing destinations and plan your next adventure.
          </p>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                <span className="text-white">✓</span>
              </div>
              <span>Exclusive travel deals</span>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                <span className="text-white">✓</span>
              </div>
              <span>Personalized recommendations</span>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                <span className="text-white">✓</span>
              </div>
              <span>24/7 customer support</span>
            </div>
          </div>
        </div>
      </div>

      {/* ডান পাশ - ফর্ম */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">BB</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">LOGIN</h1>
            <p className="text-gray-600 mt-2">Hey enter your details to login to your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Email/Phone no.
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                placeholder="you@example.com or +8801XXXXXXXXX"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Passcode
                </label>
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg transition duration-200"
            >
              Login
            </button>

            <div className="text-center text-gray-600 mt-6">
              Don't have any account yet?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-800">
                Signup now !
              </Link>
            </div>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">- or login with -</span>
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

            {/* ডেমো লগিন বাটন */}
            <div className="mt-10 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-500 mb-4">Demo login</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                  onClick={() => {
                    setEmail('host@example.com');
                    setPassword('host123');
                  }}
                >
                  Demo Host
                </button>
                <button
                  type="button"
                  className="py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                  onClick={() => {
                    setEmail('admin@example.com');
                    setPassword('admin123');
                  }}
                >
                  Demo Admin
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;