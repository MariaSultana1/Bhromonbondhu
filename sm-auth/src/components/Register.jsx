import React, { useState } from "react";

const Register = ({ userType, goLogin, onRegisterSuccess }) => {
  // Debug props on mount
  React.useEffect(() => {
    console.log("🔍 Register component mounted with props:");
    console.log("- userType:", userType);
    console.log("- userType type:", typeof userType);
    if (userType && typeof userType === 'object') {
      console.log("- userType keys:", Object.keys(userType));
    }
  }, [userType]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    // Clear previous errors
    setError("");

    if (!formData.fullName.trim()) {
      setError("Please enter your full name");
      return false;
    }
    if (formData.fullName.trim().length < 2) {
      setError("Full name must be at least 2 characters");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Please enter your email address");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!formData.password) {
      setError("Please enter a password");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match! Please check and try again.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Generate username from email
      const username = formData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

      // Handle userType safely
      let safeRole = "tourist"; // Default role
      
      // Debug userType
      console.log("🔍 Processing userType:", userType);
      
      if (userType) {
        if (typeof userType === 'string') {
          safeRole = userType.toLowerCase();
        } else if (typeof userType === 'object' && userType !== null) {
          // Extract role from object properties
          if (userType.role && typeof userType.role === 'string') {
            safeRole = userType.role.toLowerCase();
          } else if (userType.type && typeof userType.type === 'string') {
            safeRole = userType.type.toLowerCase();
          } else if (userType.userType && typeof userType.userType === 'string') {
            safeRole = userType.userType.toLowerCase();
          } else {
            // If it's an object but we can't extract role, use default
            console.warn("⚠️ Could not extract role from userType object, using 'tourist'");
          }
        }
      }
      
      console.log("✅ Final role being used:", safeRole);

      // Create clean request body with only string values
      const payload = {
        username: String(username),
        fullName: String(formData.fullName.trim()),
        email: String(formData.email.trim().toLowerCase()),
        phone: String(formData.phone.trim()),
        password: String(formData.password),
        role: String(safeRole),
      };

      console.log("📤 Sending registration request:", payload);

      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Parse response
      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        console.error("❌ Failed to parse response as JSON");
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      console.log("📥 Server response:", responseData);

      if (response.ok) {
        if (responseData.success) {
          // Store user data
          if (responseData.token) {
            localStorage.setItem("token", responseData.token);
          }
          if (responseData.user) {
            localStorage.setItem("user", JSON.stringify(responseData.user));
          }

          console.log("✅ Registration successful!");
          
          // Show success message
          setError(""); // Clear any errors
          
          // Call success callback after a short delay
          if (onRegisterSuccess) {
            setTimeout(() => {
              onRegisterSuccess(responseData.user);
            }, 1000);
          }
        } else {
          // Server returned success: false
          setError(responseData.message || "Registration failed on server.");
        }
      } else {
        // HTTP error (400, 500, etc.)
        setError(responseData.message || `Server error: ${response.status}`);
        console.error("❌ Server error response:", responseData);
      }
    } catch (err) {
      // Network or other errors
      const errorMessage = err.message || "Network error";
      
      if (errorMessage.includes("NetworkError") || errorMessage.includes("Failed to fetch")) {
        setError("Cannot connect to server. Please check your internet connection and ensure the backend is running.");
        console.error("🌐 Network error - Is backend running on http://localhost:5000?");
      } else if (errorMessage.includes("500")) {
        setError("Server error. Please try again later or contact support.");
      } else {
        setError(`Error: ${errorMessage}`);
      }
      
      console.error("❌ Registration error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#e1f3f7] overflow-hidden w-full min-w-[1440px] min-h-[1603px] relative">
      <header className="absolute top-0 left-0 w-full h-[97px] bg-[#cde5f9] border backdrop-blur">
        <img
          className="absolute top-[17px] left-[65px] w-[50px] h-[50px]"
          alt="Logo"
          src="/images/image 5.png"
        />
        <div className="absolute top-[9px] left-[127px] text-[40px] font-serif">ভ্রমণবন্ধু</div>
        <div className="absolute top-[57px] left-[71px] text-2xl font-light">Bhromonbondhu</div>
      </header>

      <img
        className="absolute top-[892px] left-[692px] w-[748px] h-[711px] object-cover"
        alt="Background"
        src="/images/image 187.png"
      />

      <img
        className="absolute top-[124px] left-[108px] w-[157px] h-[151px] object-cover"
        alt="Sun"
        src="/images/image 188.png"
      />

      <div className="absolute top-[243px] left-[124px] w-[1192px] h-[618px] bg-white rounded-[15px] shadow-md" />

      <img
        className="absolute top-[261px] left-[1142px] w-[30px] h-[30px]"
        alt="Globe"
        src="/images/image 174.png"
      />

      <button
        type="button"
        className="absolute top-[262px] left-[1187px] w-[98px] h-[29px] bg-[#d9d9d9] rounded-xl hover:bg-[#c9c9c9] transition-colors disabled:opacity-50"
        onClick={() => goLogin && goLogin()}
        disabled={isLoading}
      >
        Login
      </button>

      <div className="absolute top-[320px] left-[237px] w-[430px] h-[540px] bg-white rounded-xl flex flex-col items-center p-6">
        <img
          src="/images/TRAVEL.png"
          alt="Travel illustration"
          className="mt-8 w-[360px] h-auto object-contain"
        />
      </div>

      <main className="absolute top-[295px] left-[760px] w-[472px] h-[555px] bg-[#f1eeee] rounded-xl border shadow-md px-10 py-6">
        <h1 className="text-4xl text-center mt-2 font-serif">REGISTER</h1>
        <p className="text-center mt-2 text-lg font-serif">
          Create your account to join the Bhromonbondhu community
        </p>

        {error && (
          <div className={`mt-4 p-3 rounded-lg text-sm text-center ${error.includes("successful") ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'}`}>
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full h-[46px] bg-[#d9d9d9] rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-[#047ba3] transition-all disabled:opacity-50"
            placeholder="Full Name *"
            disabled={isLoading}
            autoComplete="name"
            required
          />
          
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full h-[46px] bg-[#d9d9d9] rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-[#047ba3] transition-all disabled:opacity-50"
            placeholder="Email *"
            disabled={isLoading}
            autoComplete="email"
            required
          />
          
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full h-[46px] bg-[#d9d9d9] rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-[#047ba3] transition-all disabled:opacity-50"
            placeholder="Phone Number (Optional)"
            disabled={isLoading}
            autoComplete="tel"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full h-[46px] bg-[#d9d9d9] rounded-xl px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-[#047ba3] transition-all disabled:opacity-50"
              placeholder="Password (min 6 characters) *"
              disabled={isLoading}
              autoComplete="new-password"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-[10px] right-[12px] w-[25px] h-[25px] hover:opacity-70 transition-opacity disabled:opacity-30"
              disabled={isLoading}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <img src="/images/image 238.png" alt="toggle password visibility" />
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full h-[46px] bg-[#d9d9d9] rounded-xl px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-[#047ba3] transition-all disabled:opacity-50"
              placeholder="Confirm Password *"
              disabled={isLoading}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute top-[10px] right-[12px] w-[25px] h-[25px] hover:opacity-70 transition-opacity disabled:opacity-30"
              disabled={isLoading}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              <img src="/images/image 238.png" alt="toggle password visibility" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full h-12 bg-[#82c98f] rounded-xl text-white hover:bg-[#72b97f] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>

          <p className="text-sm text-center mt-4">
            Already have an account?{" "}
            <span
              onClick={() => !isLoading && goLogin && goLogin()}
              className={`text-[#047ba3] underline cursor-pointer hover:text-[#035a7a] transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Login now!
            </span>
          </p>
          
          <div className="text-xs text-gray-500 text-center mt-4">
            <p>Fields marked with * are required</p>
            <p className="mt-1">Default role: Tourist</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;