import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ইমেজ পাথ ডিফাইন করুন (public/images/ ফোল্ডার থেকে)
  const images = {
    logo: "/images/airplane.png",
    signupImage: "/images/image-238.png",
    eyeIcon: "/images/image-142.png",
    googleIcon: "/images/image-175.png",
    decorativeImage1: "/images/image-187.png",
    decorativeImage2: "/images/image-188.png",
    globeIcon: "/images/image-174.png",
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    
    if (!formData.agreeTerms) {
      alert("Please agree to terms and conditions");
      return;
    }
    
    console.log("Register data:", formData);
    alert("Account created successfully!");
    navigate("/login");
  };

  const handleGoogleSignup = () => {
    console.log("Google signup initiated");
    // Google সাইনআপ লজিক
  };

  return (
    <div className="min-h-screen bg-[#e1f3f7] relative overflow-hidden">
      {/* নেভবার */}
      <nav className="w-full h-24 bg-[#cde5f9] border border-[#a6b6b8cc] backdrop-blur-sm flex items-center px-4 md:px-8 lg:px-16">
        <div className="flex items-center gap-3 md:gap-4">
          <img 
            src={images.logo} 
            alt="logo" 
            className="w-10 h-10 md:w-12 md:h-12"
            onError={(e) => e.target.src = "https://via.placeholder.com/48x48?text=Logo"}
          />
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-gray-800">ভ্রমণবন্ধু</h1>
            <p className="text-lg md:text-xl lg:text-2xl font-light text-gray-600 -mt-1 md:-mt-2">Bhromonbondhu</p>
          </div>
        </div>
        
        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <button className="w-6 h-6 md:w-8 md:h-8">
            <img 
              src={images.globeIcon} 
              alt="Language" 
              className="w-full h-full"
              onError={(e) => e.target.src = "https://via.placeholder.com/32x32?text=🌐"}
            />
          </button>
          <Link 
            to="/login" 
            className="bg-green-500 text-white px-3 py-1 md:px-6 md:py-2 rounded-xl hover:bg-green-600 transition-colors text-sm md:text-base"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* মেইন কন্টেন্ট */}
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
          
          {/* ডেকোরেটিভ ইমেজ */}
          <div className="relative order-first lg:order-first">
            <div className="relative">
              <img
                src={images.signupImage}
                alt="Join our community"
                className="w-full rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl"
                onError={(e) => e.target.src = "https://via.placeholder.com/600x400?text=Join+Community"}
              />
              <img
                src={images.decorativeImage2}
                alt="Decoration"
                className="absolute -top-4 -left-4 md:-top-10 md:-left-10 w-16 h-16 md:w-40 md:h-40 animate-pulse"
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
            
            <div className="mt-6 md:mt-8 text-center lg:text-left">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-3 md:mb-4">
                Join Our Travel Community
              </h2>
              <p className="text-gray-600 mb-4 md:mb-6">
                Connect with fellow travelers, share experiences, and discover amazing destinations together.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                <div className="bg-white/50 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4">
                  <div className="text-lg md:text-xl lg:text-2xl font-bold text-blue-600">5000+</div>
                  <div className="text-xs md:text-sm text-gray-600">Active Travelers</div>
                </div>
                <div className="bg-white/50 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4">
                  <div className="text-lg md:text-xl lg:text-2xl font-bold text-blue-600">100+</div>
                  <div className="text-xs md:text-sm text-gray-600">Destinations</div>
                </div>
                <div className="bg-white/50 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 md:col-span-1 col-span-2">
                  <div className="text-lg md:text-xl lg:text-2xl font-bold text-blue-600">24/7</div>
                  <div className="text-xs md:text-sm text-gray-600">Support</div>
                </div>
              </div>
            </div>
          </div>

          {/* রেজিস্টার ফর্ম */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-2xl p-4 md:p-6 lg:p-8 max-w-2xl mx-auto">
            <div className="text-center mb-6 md:mb-8">
              <div className="flex justify-center mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl md:text-2xl font-bold">BB</span>
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Register</h1>
              <p className="text-gray-600 text-sm md:text-base">Welcome to Bhromonbondhu</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full h-10 md:h-12 bg-gray-100 rounded-lg md:rounded-xl border border-gray-300 px-3 md:px-4 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm md:text-base"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Enter Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full h-10 md:h-12 bg-gray-100 rounded-lg md:rounded-xl border border-gray-300 px-3 md:px-4 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm md:text-base"
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Phone no.
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+8801XXXXXXXXX"
                  className="w-full h-10 md:h-12 bg-gray-100 rounded-lg md:rounded-xl border border-gray-300 px-3 md:px-4 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm md:text-base"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Passcode *
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="w-full h-10 md:h-12 bg-gray-100 rounded-lg md:rounded-xl border border-gray-300 px-3 md:px-4 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10 md:pr-12 transition-all text-sm md:text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 md:right-4 top-8 md:top-10"
                >
                  <img 
                    src={images.eyeIcon} 
                    alt="Show/Hide" 
                    className="w-5 h-5 md:w-6 md:h-6 opacity-60"
                    onError={(e) => e.target.src = "https://via.placeholder.com/24x24?text=👁️"}
                  />
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Confirm Passcode *
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className="w-full h-10 md:h-12 bg-gray-100 rounded-lg md:rounded-xl border border-gray-300 px-3 md:px-4 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10 md:pr-12 transition-all text-sm md:text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 md:right-4 top-8 md:top-10"
                >
                  <img 
                    src={images.eyeIcon} 
                    alt="Show/Hide" 
                    className="w-5 h-5 md:w-6 md:h-6 opacity-60"
                    onError={(e) => e.target.src = "https://via.placeholder.com/24x24?text=👁️"}
                  />
                </button>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2 md:space-x-3 pt-2">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  id="terms"
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 mt-1"
                />
                <label htmlFor="terms" className="text-xs md:text-sm text-gray-600">
                  I agree to the{" "}
                  <a href="/terms" className="text-green-600 hover:underline">
                    Terms & Conditions
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-green-600 hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Signup Button */}
              <button
                type="submit"
                className="w-full h-10 md:h-12 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm md:text-base"
              >
                Create Your Account
              </button>
            </form>

            {/* Already have account */}
            <div className="text-center mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200">
              <p className="text-gray-600 text-sm md:text-base">
                Already have account yet?{" "}
                <Link to="/login" className="text-green-600 hover:underline font-semibold">
                  Login
                </Link>
              </p>
            </div>

            {/* Social Signup */}
            <div className="mt-6 md:mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 text-xs md:text-sm">- or signup with -</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4 mt-4 md:mt-6">
                <button
                  onClick={handleGoogleSignup}
                  className="flex items-center justify-center gap-2 md:gap-3 bg-white border border-gray-300 rounded-lg md:rounded-xl py-2 md:py-3 hover:bg-gray-50 transition-colors text-sm md:text-base"
                >
                  <img 
                    src={images.googleIcon} 
                    alt="Google" 
                    className="w-4 h-4 md:w-5 md:h-5"
                    onError={(e) => e.target.src = "https://via.placeholder.com/20x20?text=G"}
                  />
                  <span className="font-medium">Google</span>
                </button>
                <button className="flex items-center justify-center gap-2 md:gap-3 bg-white border border-gray-300 rounded-lg md:rounded-xl py-2 md:py-3 hover:bg-gray-50 transition-colors text-sm md:text-base">
                  <div className="w-4 h-4 md:w-5 md:h-5 bg-gray-800 rounded-full"></div>
                  <span className="font-medium">Apple</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ব্যাকগ্রাউন্ড ডেকোরেশন */}
      <img
        src={images.decorativeImage1}
        alt="Background"
        className="absolute bottom-0 right-0 w-1/3 opacity-20 -z-10 hidden md:block"
        onError={(e) => e.target.style.display = 'none'}
      />
      
      {/* ফুটার */}
      <footer className="mt-8 md:mt-12 py-6 px-4 border-t border-gray-200">
        <div className="container mx-auto text-center text-gray-500 text-xs md:text-sm">
          <p>© 2024 Bhromonbondhu. All rights reserved. | Making travel dreams come true</p>
          <div className="flex justify-center gap-4 md:gap-6 mt-2 md:mt-4">
            <a href="/privacy" className="hover:text-green-600">Privacy Policy</a>
            <a href="/terms" className="hover:text-green-600">Terms of Service</a>
            <a href="/contact" className="hover:text-green-600">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RegisterPage;