import React, { useState } from "react";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [passcode, setPasscode] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ইমেজ পাথ ডিফাইন করুন (public/images/ ফোল্ডার থেকে)
  const images = {
    logo: "/images/image-5.png",
    travelImage: "/images/597167217-26322675484000717-4961793980322896520-n-22.png",
    eyeIcon: "/images/image-142.png",
    googleIcon: "/images/image-175.png",
    decorativeImage1: "/images/image-187.png",
    decorativeImage2: "/images/image-188.png",
    globeIcon: "/images/image-174.png",
    decorativeImage3: "/images/image-227.png",
  };

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Login attempt with:", { email, passcode });
    // এখানে আপনার API call যোগ করুন
  };

  const handleDemoLogin = (role) => {
    console.log("Demo login as:", role);
    // ডেমো লগিন লজিক
  };

  const handleGoogleLogin = () => {
    console.log("Google login initiated");
    // Google লগিন লজিক
  };

  return (
    <div className="min-h-screen bg-[#e1f3f7] relative overflow-hidden">
      {/* নেভবার */}
      <nav className="w-full h-24 bg-[#cde5f9] border border-[#a6b6b8cc] backdrop-blur-sm flex items-center px-4 md:px-8 lg:px-16">
        <div className="flex items-center gap-3 md:gap-4">
          <img 
            src={images.logo} 
            alt="Bhromonbondhu Logo" 
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
            to="/register" 
            className="bg-[#d9d9d9] px-3 py-1 md:px-6 md:py-2 rounded-xl text-black hover:bg-gray-300 transition-colors text-sm md:text-base"
          >
            Signup
          </Link>
        </div>
      </nav>

      {/* মেইন কন্টেন্ট */}
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
          
          {/* লগিন ফর্ম */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-2xl p-4 md:p-6 lg:p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-center mb-3 md:mb-4">LOGIN</h1>
            <p className="text-base md:text-lg lg:text-xl text-center text-gray-700 mb-4 md:mb-6 lg:mb-8">
              Hey enter your details to login to your account
            </p>

            <form onSubmit={handleLogin} className="space-y-4 md:space-y-6">
              <div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email/Phone no."
                  className="w-full h-10 md:h-12 bg-gray-100 rounded-lg md:rounded-xl border border-gray-300 px-3 md:px-4 font-serif text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                  required
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Passcode"
                  className="w-full h-10 md:h-12 bg-gray-100 rounded-lg md:rounded-xl border border-gray-300 px-3 md:px-4 font-serif text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 md:pr-12 text-sm md:text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2"
                >
                  <img 
                    src={images.eyeIcon} 
                    alt={showPassword ? "Hide password" : "Show password"} 
                    className="w-5 h-5 md:w-6 md:h-6"
                    onError={(e) => e.target.src = "https://via.placeholder.com/24x24?text=👁️"}
                  />
                </button>
              </div>

              <button
                type="submit"
                className="w-full h-10 bg-green-500 rounded-xl md:rounded-2xl text-white font-serif hover:bg-green-600 transition-colors shadow-md text-sm md:text-base"
              >
                Login
              </button>
            </form>

            <div className="text-center mt-4 md:mt-6">
              <p className="text-gray-600 text-sm md:text-base">
                Don't have any account yet?{" "}
                <Link to="/register" className="text-blue-600 hover:underline font-medium">
                  Signup now!
                </Link>
              </p>
            </div>

            <div className="relative my-6 md:my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 text-xs md:text-sm">- or login with -</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 md:gap-3 bg-white border border-gray-300 rounded-xl md:rounded-2xl py-2 md:py-3 hover:bg-gray-50 transition-colors text-sm md:text-base"
            >
              <img 
                src={images.googleIcon} 
                alt="Google" 
                className="w-4 h-4 md:w-5 md:h-5"
                onError={(e) => e.target.src = "https://via.placeholder.com/20x20?text=G"}
              />
              <span className="font-medium">Google</span>
            </button>

            {/* ডেমো লগিন বাটন */}
            <div className="mt-8 md:mt-10 space-y-3 md:space-y-4">
              <h3 className="text-center text-gray-600 text-sm md:text-base">Demo Login</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
                {["Traveller", "Host", "Admin"].map((role) => (
                  <button
                    key={role}
                    onClick={() => handleDemoLogin(role.toLowerCase())}
                    className="bg-[#adfbef] rounded-lg md:rounded-xl py-2 md:py-3 shadow-md hover:bg-[#9de8dc] transition-colors text-xs md:text-sm font-medium"
                  >
                    Demo login {role}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ডেকোরেটিভ ইমেজ */}
          <div className="relative order-first lg:order-last">
            <div className="relative">
              <img
                src={images.travelImage}
                alt="Travel Illustration"
                className="w-full rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl"
                onError={(e) => e.target.src = "https://via.placeholder.com/600x400?text=Travel+Image"}
              />
              <img
                src={images.decorativeImage2}
                alt="Sun"
                className="absolute -top-4 -left-4 md:-top-10 md:-left-10 w-16 h-16 md:w-40 md:h-40 animate-pulse"
                onError={(e) => e.target.style.display = 'none'}
              />
              <img
                src={images.decorativeImage3}
                alt="Decorative"
                className="absolute -bottom-4 -right-4 md:-bottom-10 md:-right-10 w-32 h-40 md:w-60 md:h-72 opacity-80"
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ব্যাকগ্রাউন্ড ডেকোরেশন */}
      <img
        src={images.decorativeImage1}
        alt="Background"
        className="absolute bottom-0 right-0 w-1/3 opacity-30 -z-10 hidden md:block"
        onError={(e) => e.target.style.display = 'none'}
      />
    </div>
  );
};

export default LoginPage;