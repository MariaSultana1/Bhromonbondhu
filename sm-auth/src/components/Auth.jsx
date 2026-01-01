import { useState } from "react";
import {
  Mail,
  Lock,
  Phone,
  Fingerprint,
  Shield,
  UserCircle,
  Home,
  UserCog,
} from "lucide-react";

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [userType, setUserType] = useState("traveler");
  const [use2FA, setUse2FA] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isLogin && !otpSent) {
      setOtpSent(true);
      return;
    }

    const user = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || "Demo User",
      email,
      type: userType,
      verified: true,
      kycCompleted: true,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    };

    onLogin(user);
  };

  const handleQuickLogin = (type) => {
    const users = {
      traveler: {
        id: "traveler-1",
        name: "Riya Rahman",
        email: "riya@example.com",
        type: "traveler",
        verified: true,
        kycCompleted: true,
        avatar:
          "https://api.dicebear.com/7.x/avataaars/svg?seed=riya",
      },
      host: {
        id: "host-1",
        name: "Karim Ahmed",
        email: "karim@example.com",
        type: "host",
        verified: true,
        avatar:
          "https://api.dicebear.com/7.x/avataaars/svg?seed=karim",
      },
      admin: {
        id: "admin-1",
        name: "Admin User",
        email: "admin@bhromonbondhu.com",
        type: "admin",
        verified: true,
        avatar:
          "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      },
    };

    onLogin(users[type]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8">
        {/* LEFT SIDE */}
        <div className="text-white flex flex-col justify-center space-y-6">
          <div>
            <h1 className="text-5xl mb-4">ভ্রমণবন্ধু</h1>
            <h2 className="text-3xl mb-2">Bhromonbondhu</h2>
            <p className="text-xl opacity-90">
              Your Trusted Travel Companion
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <Shield className="w-6 h-6 mt-1" />
              <div>
                <h3>Secure & Verified</h3>
                <p className="text-sm opacity-80">
                  2FA authentication & KYC verification
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Home className="w-6 h-6 mt-1" />
              <div>
                <h3>Authentic Experiences</h3>
                <p className="text-sm opacity-80">
                  Stay with verified local hosts
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <UserCircle className="w-6 h-6 mt-1" />
              <div>
                <h3>AI-Powered Travel</h3>
                <p className="text-sm opacity-80">
                  Smart itineraries & suggestions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl mb-2">
            {isLogin ? "Welcome Back" : "Join Bhromonbondhu"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <input
                  className="w-full border px-4 py-3 rounded-lg"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUserType("traveler")}
                    className={`p-3 border rounded-lg ${
                      userType === "traveler"
                        ? "border-blue-500 bg-blue-50"
                        : ""
                    }`}
                  >
                    Traveler
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserType("host")}
                    className={`p-3 border rounded-lg ${
                      userType === "host"
                        ? "border-blue-500 bg-blue-50"
                        : ""
                    }`}
                  >
                    Host
                  </button>
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                className="w-full pl-10 py-3 border rounded-lg"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {!otpSent && (
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  className="w-full pl-10 py-3 border rounded-lg"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}

            {!isLogin && !otpSent && (
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="tel"
                  className="w-full pl-10 py-3 border rounded-lg"
                  placeholder="+880 1XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            )}

            {otpSent && (
              <input
                className="w-full border px-4 py-3 rounded-lg text-center"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />
            )}

            <button className="w-full bg-blue-500 text-white py-3 rounded-lg">
              {otpSent
                ? "Verify & Continue"
                : isLogin
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <button onClick={() => handleQuickLogin("traveler")}>
              <UserCircle />
              Traveler
            </button>
            <button onClick={() => handleQuickLogin("host")}>
              <Home />
              Host
            </button>
            <button onClick={() => handleQuickLogin("admin")}>
              <UserCog />
              Admin
            </button>
          </div>

          <button
            className="mt-4 text-blue-500 text-sm"
            onClick={() => {
              setIsLogin(!isLogin);
              setOtpSent(false);
            }}
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>

          <div className="mt-4 flex justify-center text-gray-500 gap-2">
            <Fingerprint />
            Biometric login available
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
