import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

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
    alert("Login successful!");
    navigate("/");
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
    alert(`${isLoginPage ? "Login" : "Signup"} with Google clicked`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex flex-col">
      
      {/* Top Navigation */}
      <nav className="w-full bg-white/90 backdrop-blur-sm border-b border-gray-200 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="data:image/png;base64,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" 
            alt="Bhromonbondhu Logo" 
            className="w-10 h-10"
          />
          {/* TODO: আপনার লোগো ইমেজ লিংক দিন: src="YOUR_LOGO_LINK" */}
          <div>
            <h1 className="text-2xl font-serif text-gray-800">ভ্রমণবন্ধু</h1>
            <p className="text-sm text-gray-600">Bhromonbondhu</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {isLoginPage ? (
            <>
              <img 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShOmi4u3F0R9vcQEdchH-GIy2RzDNy-_dLIw&s" 
            alt="Bearth" 
            className="w-10 h-10"
          />
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
              src={isLoginPage 
                ? "https://png.pngtree.com/png-vector/20251104/ourlarge/pngtree-man-traveling-vector-illustration-png-image_17900177.webp" 
                : "https://png.pngtree.com/png-vector/20251104/ourlarge/pngtree-man-traveling-vector-illustration-png-image_17900177.webp"
              }alt={isLoginPage ? "" : ""}
              
              className="w-full max-w-xl mx-auto rounded-2xl shadow-2xl mb-8"
            />
            {/* TODO: লগিন ইমেজ: src="YOUR_LOGIN_IMAGE_LINK" */}
            {/* TODO: সাইনআপ ইমেজ: src="YOUR_SIGNUP_IMAGE_LINK" */}
            
            <div className="max-w-lg mx-auto">
              
              
              
              <div className="space-y-4">
                {[
                  
                  
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
                    <img 
                      src="https://cdn-icons-png.flaticon.com/512/2767/2767146.png" 
                      alt="Show/Hide" 
                      className="w-6 h-6 opacity-60"
                    />
                    {/* TODO: আই আইকন লিংক: src="YOUR_EYE_ICON_LINK" */}
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
                  <img 
                    src="data:image/png;base64,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" 
                    alt="Google" 
                    className="w-5 h-5"
                  />
                  {/* TODO: গুগল আইকন লিংক: src="YOUR_GOOGLE_ICON_LINK" */}
                  <span className="font-medium">Google</span>
                </button>

                {/* Demo Login Buttons */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-center text-gray-500 mb-4"></p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {["", "", ""].map((role) => (
                      <button
                        key={role}
                        type=""
                        onClick={() => handleDemoLogin(role.toLowerCase())}
                        className=""
                      >
                        
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
                    <img 
                      src="https://cdn-icons-png.flaticon.com/512/2767/2767146.png" 
                      alt="Show/Hide" 
                      className="w-6 h-6 opacity-60"
                    />
                    {/* TODO: আই আইকন লিংক: src="YOUR_EYE_ICON_LINK" */}
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
                    <img 
                      src="https://cdn-icons-png.flaticon.com/512/2767/2767146.png" 
                      alt="Show/Hide" 
                      className="w-6 h-6 opacity-60"
                    />
                    {/* TODO: আই আইকন লিংক: src="YOUR_EYE_ICON_LINK" */}
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
                    <img 
                      src="data:image/png;base64,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" 
                      alt="Google" 
                      className="w-5 h-5"
                    />
                    {/* TODO: গুগল আইকন লিংক: src="YOUR_GOOGLE_ICON_LINK" */}
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