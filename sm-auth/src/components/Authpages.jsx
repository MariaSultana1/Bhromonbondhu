import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "./assets/images/image-5.png";
import travelImage from "./assets/images/597167217-26322675484000717-4961793980322896520-n-22.png";
import signupImage from "./assets/images/image-238.png";
import eyeIcon from "./assets/images/image-142.png";
import googleIcon from "./assets/images/image-175.png";
import decorativeImage1 from "./assets/images/image-187.png";
import decorativeImage2 from "./assets/images/image-188.png";

const AuthPages = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === "/login";

  // লগিন স্টেট
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  // সাইনআপ স্টেট
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // লগিন হ্যান্ডলার
  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData({
      ...loginData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // সাইনআপ হ্যান্ডলার
  const handleSignupChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSignupData({
      ...signupData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // লগিন সাবমিট
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    console.log("Login attempt:", loginData);
    
    // ডেমো লগিন চেক
    if (loginData.email === "demo@traveller.com" || loginData.email === "demo@host.com" || loginData.email === "demo@admin.com") {
      alert(`Demo login successful as ${loginData.email}`);
      navigate("/");
    } else {
      // আপনার লগিন লজিক এখানে যোগ করুন
      console.log("Proceeding with normal login...");
    }
  };

  // সাইনআপ সাবমিট
  const handleSignupSubmit = (e) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    
    if (!signupData.agreeTerms) {
      alert("Please agree to terms and conditions");
      return;
    }
    
    console.log("Signup data:", signupData);
    alert("Account created successfully!");
    navigate("/login");
  };

  // ডেমো লগিন
  const handleDemoLogin = (role) => {
    const demoCredentials = {
      traveller: { email: "traveller@demo.com", password: "demo123" },
      host: { email: "host@demo.com", password: "demo123" },
      admin: { email: "admin@demo.com", password: "demo123" },
    };
    
    const creds = demoCredentials[role];
    setLoginData({
      email: creds.email,
      password: creds.password,
      rememberMe: false,
    });
    
    alert(`Demo login as ${role}. Click Login button to proceed.`);
  };

  // গুগল লগিন
  const handleGoogleAuth = () => {
    console.log(`${isLoginPage ? "Login" : "Signup"} with Google`);
    // গুগল অথেন্টিকেশন লজিক এখানে যোগ করুন
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex flex-col">
      
      {/* Top Navigation */}
      <nav className="w-full bg-white/90 backdrop-blur-sm border-b border-gray-200 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Bhromonbondhu Logo" className="w-10 h-10" />
          <div>
            <h1 className="text-2xl font-serif text-gray-800">ভ্রমণবন্ধু</h1>
            <p className="text-sm text-gray-600">Bhromonbondhu</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {isLoginPage ? (
            <>
              <span className="text-gray-600">Don't have account?</span>
              <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <span className="text-gray-600">Already have account?</span>
              <Link to="/login" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Login
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* Left Side - Image */}
        <div className="lg:w-1/2 relative bg-gradient-to-br from-blue-500 to-cyan-600 p-8 lg:p-12">
          <div className="absolute inset-0 bg-black/20 z-0"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-center text-white">
            <img
              src={isLoginPage ? travelImage : signupImage}
              alt={isLoginPage ? "Travel Adventure" : "Join Community"}
              className="w-full max-w-xl mx-auto rounded-2xl shadow-2xl mb-8"
            />
            
            <div className="max-w-lg mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {isLoginPage ? "Welcome Back!" : "Join Our Community"}
              </h2>
              <p className="text-lg md:text-xl mb-8 opacity-90">
                {isLoginPage 
                  ? "Sign in to continue your journey with Bhromonbondhu. Discover amazing destinations and plan your next adventure."
                  : "Create your account and start your journey with us. Get access to exclusive deals and personalized travel plans."
                }
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: "✓", text: "Exclusive travel deals" },
                  { icon: "✓", text: "Personalized recommendations" },
                  { icon: "✓", text: "24/7 customer support" },
                  isLoginPage ? null : { icon: "🎁", text: "Member-only discounts" }
                ].filter(Boolean).map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                      <span className="text-lg">{item.icon}</span>
                    </div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Background Decorations */}
          <img src={decorativeImage2} alt="Decoration" className="absolute top-4 left-4 w-20 h-20 opacity-30" />
          <img src={decorativeImage1} alt="Decoration" className="absolute bottom-4 right-4 w-32 h-32 opacity-20" />
        </div>

        {/* Right Side - Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">
            
            {/* Form Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className={`w-16 h-16 ${isLoginPage ? 'bg-blue-600' : 'bg-green-600'} rounded-full flex items-center justify-center`}>
                  <span className="text-white text-2xl font-bold">BB</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {isLoginPage ? "LOGIN" : "REGISTER"}
              </h1>
              <p className="text-gray-600">
                {isLoginPage 
                  ? "Hey enter your details to login to your account"
                  : "Welcome to Bhromonbondhu"
                }
              </p>
            </div>

            {/* Conditional Form Rendering */}
            {isLoginPage ? (
              /* ========== LOGIN FORM ========== */
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Email/Phone no.
                  </label>
                  <input
                    type="text"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    placeholder="you@example.com or +8801XXXXXXXXX"
                    className="w-full h-12 bg-gray-50 rounded-xl border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Passcode
                    </label>
                    <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    placeholder="••••••••"
                    className="w-full h-12 bg-gray-50 rounded-xl border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-10"
                  >
                    <img src={eyeIcon} alt="Show/Hide" className="w-6 h-6 opacity-60" />
                  </button>
                </div>

                {/* Remember Me */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={loginData.rememberMe}
                    onChange={handleLoginChange}
                    id="rememberMe"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="w-full h-12 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md"
                >
                  Login
                </button>

                {/* Signup Link */}
                <div className="text-center text-gray-600">
                  Don't have any account yet?{' '}
                  <Link to="/signup" className="text-blue-600 hover:underline font-medium">
                    Signup now!
                  </Link>
                </div>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">- or login with -</span>
                  </div>
                </div>

                {/* Google Login */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <img src={googleIcon} alt="Google" className="w-5 h-5" />
                  <span className="font-medium">Google</span>
                </button>

                {/* Demo Login Buttons */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-center text-gray-500 mb-4">Demo login</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {["Traveller", "Host", "Admin"].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleDemoLogin(role.toLowerCase())}
                        className="py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                      >
                        Demo login {role}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            ) : (
              /* ========== SIGNUP FORM ========== */
              <form onSubmit={handleSignupSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={signupData.fullName}
                    onChange={handleSignupChange}
                    placeholder="John Doe"
                    className="w-full h-12 bg-gray-50 rounded-xl border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={signupData.email}
                    onChange={handleSignupChange}
                    placeholder="you@example.com"
                    className="w-full h-12 bg-gray-50 rounded-xl border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone no.
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={signupData.phone}
                    onChange={handleSignupChange}
                    placeholder="+8801XXXXXXXXX"
                    className="w-full h-12 bg-gray-50 rounded-xl border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passcode *
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={signupData.password}
                    onChange={handleSignupChange}
                    placeholder="Create a strong password"
                    className="w-full h-12 bg-gray-50 rounded-xl border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-10"
                  >
                    <img src={eyeIcon} alt="Show/Hide" className="w-6 h-6 opacity-60" />
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Passcode *
                  </label>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={signupData.confirmPassword}
                    onChange={handleSignupChange}
                    placeholder="Re-enter your password"
                    className="w-full h-12 bg-gray-50 rounded-xl border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-10"
                  >
                    <img src={eyeIcon} alt="Show/Hide" className="w-6 h-6 opacity-60" />
                  </button>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={signupData.agreeTerms}
                    onChange={handleSignupChange}
                    id="agreeTerms"
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1"
                  />
                  <label htmlFor="agreeTerms" className="text-sm text-gray-600">
                    I agree to the{' '}
                    <a href="/terms" className="text-green-600 hover:underline">Terms & Conditions</a>
                    {' '}and{' '}
                    <a href="/privacy" className="text-green-600 hover:underline">Privacy Policy</a>
                  </label>
                </div>

                {/* Signup Button */}
                <button
                  type="submit"
                  className="w-full h-12 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-md"
                >
                  Create Your Account
                </button>

                {/* Login Link */}
                <div className="text-center text-gray-600">
                  Already have account yet?{' '}
                  <Link to="/login" className="text-green-600 hover:underline font-medium">
                    Login
                  </Link>
                </div>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">- or signup with -</span>
                  </div>
                </div>

                {/* Social Signup */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    className="flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <img src={googleIcon} alt="Google" className="w-5 h-5" />
                    <span className="font-medium">Google</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-5 h-5 bg-gray-800 rounded-full"></div>
                    <span className="font-medium">Apple</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPages;