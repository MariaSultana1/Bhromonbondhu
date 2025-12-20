import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* নেভবার */}
      <nav className="bg-white shadow-md py-4 px-8">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full"></div>
            <span className="text-2xl font-bold text-gray-800">Bhromonbondhu</span>
          </div>
          <div className="flex space-x-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">Home</Link>
            <Link to="/destinations" className="text-gray-700 hover:text-blue-600 font-medium">Destinations</Link>
            <Link to="/about" className="text-gray-700 hover:text-blue-600 font-medium">About</Link>
            <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700">Login</Link>
          </div>
        </div>
      </nav>

      {/* হিরো সেকশন */}
      <section className="py-20 px-8 text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-6">
          Explore, Book, Experience.
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
          Discover amazing destinations worldwide, organized without a need for explicit travel experience.
        </p>
        <div className="flex justify-center space-x-4">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700">
            Explore Now
          </button>
          <button className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-full hover:bg-blue-50">
            Watch Video
          </button>
        </div>
      </section>

      {/* ফিচার্ড ডেস্টিনেশনস */}
      <section className="py-16 px-8 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Featured Destinations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* কার্ড ১ */}
            <div className="bg-gray-50 rounded-2xl p-6 shadow-lg">
              <div className="w-full h-48 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl mb-4"></div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Mountain Paradise</h3>
              <p className="text-gray-600 mb-4">Experience the breathtaking views of snowy mountains.</p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>⭐ 4.8 (120 reviews)</span>
                <span className="font-bold">$299</span>
              </div>
            </div>

            {/* কার্ড ২ */}
            <div className="bg-gray-50 rounded-2xl p-6 shadow-lg">
              <div className="w-full h-48 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl mb-4"></div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Beach Haven</h3>
              <p className="text-gray-600 mb-4">Relax on pristine beaches with crystal clear water.</p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>⭐ 4.9 (89 reviews)</span>
                <span className="font-bold">$399</span>
              </div>
            </div>

            {/* কার্ড ৩ */}
            <div className="bg-gray-50 rounded-2xl p-6 shadow-lg">
              <div className="w-full h-48 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl mb-4"></div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">City Adventure</h3>
              <p className="text-gray-600 mb-4">Explore vibrant cities with rich culture and history.</p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>⭐ 4.7 (156 reviews)</span>
                <span className="font-bold">$259</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us সেকশন */}
      <section className="py-16 px-8 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">About Us</h2>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-gray-600 text-lg mb-8">
             Bhromonbondhu connects travelers with local hosts and provides seamless booking for destinations and transportation. We believe in authentic travel experiences that bring cultures together and create lasting memories. Our platform makes it easy to discover, book, and experience the world's most beautiful destinations while supporting local communities.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">10K+</div>
                <div className="text-gray-600">Happy Travelers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">50+</div>
                <div className="text-gray-600">Destinations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">24/7</div>
                <div className="text-gray-600">Support</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">5★</div>
                <div className="text-gray-600">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ফুটার */}
      <footer className="bg-gray-800 text-white py-12 px-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-white rounded-full"></div>
                <span className="text-2xl font-bold">Bhromonbondhu</span>
              </div>
              <p className="text-gray-400">Making travel dreams come true.</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400">© 2025 Bhromonbondhu. All rights reserved.</p>
              <div className="flex space-x-6 mt-4">
                <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white">Contact Us</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;