import React, { useState } from "react";

const Register = ({ userType, goLogin, onRegisterSuccess }) => {
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
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Generate username from email (part before @)
      const username = formData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

      // Create clean request body
      const payload = {
        username: username,
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: userType || "tourist",
      };

      console.log("📤 Sending registration request");

      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log("📥 Registration response:", data);

      if (response.ok && data.success) {
        // Store token and user data in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        console.log("✅ Registration successful:", data.user);

        // Call success callback to navigate to dashboard
        if (onRegisterSuccess) {
          onRegisterSuccess(data.user);
        }
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("Unable to connect to server. Please check your connection.");
      console.error("❌ Registration error:", err);
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
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full h-[46px] bg-[#d9d9d9] rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-[#047ba3] transition-all disabled:opacity-50"
            placeholder="Full Name"
            disabled={isLoading}
            autoComplete="name"
          />
          
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full h-[46px] bg-[#d9d9d9] rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-[#047ba3] transition-all disabled:opacity-50"
            placeholder="Email"
            disabled={isLoading}
            autoComplete="email"
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
              placeholder="Password (min 6 characters)"
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-[10px] right-[12px] w-[25px] h-[25px] hover:opacity-70 transition-opacity disabled:opacity-30"
              disabled={isLoading}
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
              placeholder="Confirm Password"
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute top-[10px] right-[12px] w-[25px] h-[25px] hover:opacity-70 transition-opacity disabled:opacity-30"
              disabled={isLoading}
            >
              <img src="/images/image 238.png" alt="toggle password visibility" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleSubmit()}
            className="w-full h-9 bg-[#82c98f] rounded-[20px] text-white hover:bg-[#72b97f] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>

          <p className="text-sm text-center">
            Already have an account?{" "}
            <span
              onClick={() => goLogin && goLogin()}
              className="text-[#047ba3] underline cursor-pointer hover:text-[#035a7a] transition-colors"
            >
              Login now!
            </span>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Register;