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

export default function AuthPage({ onLogin }) {
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
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=riya",
      },
      host: {
        id: "host-1",
        name: "Karim Ahmed",
        email: "karim@example.com",
        type: "host",
        verified: true,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=karim",
      },
      admin: {
        id: "admin-1",
        name: "Admin User",
        email: "admin@bhromonbondhu.com",
        type: "admin",
        verified: true,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      },
    };

    if (users[type]) {
      onLogin(users[type]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8">
        {/* Branding */}
        <div className="text-white flex flex-col justify-center space-y-6">
          <div>
            <h1 className="text-5xl mb-4">ভ্রমণবন্ধু</h1>
            <h2 className="text-3xl mb-2">Bhromonbondhu</h2>
            <p className="text-xl opacity-90">Your Trusted Travel Companion</p>
          </div>

          <div className="space-y-4">
            <Feature icon={<Shield />} title="Secure & Verified">
              2FA authentication, KYC verification, and police checks for all hosts
            </Feature>
            <Feature icon={<Home />} title="Authentic Experiences">
              Stay with verified local hosts and discover hidden gems
            </Feature>
            <Feature icon={<UserCircle />} title="AI-Powered Travel">
              Smart itineraries, mood-based suggestions, and real-time assistance
            </Feature>
          </div>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl mb-2">
            {isLogin ? "Welcome Back" : "Join Bhromonbondhu"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <Input
                  label="Full Name"
                  value={name}
                  onChange={setName}
                  placeholder="Enter your name"
                />

                <div className="grid grid-cols-2 gap-3">
                  <RoleButton
                    active={userType === "traveler"}
                    onClick={() => setUserType("traveler")}
                    icon={<UserCircle />}
                    label="Travel"
                  />
                  <RoleButton
                    active={userType === "host"}
                    onClick={() => setUserType("host")}
                    icon={<Home />}
                    label="Host"
                  />
                </div>
              </>
            )}

            <Input
              label="Email"
              icon={<Mail />}
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="your@email.com"
            />

            {!otpSent && (
              <Input
                label="Password"
                icon={<Lock />}
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
              />
            )}

            {!isLogin && !otpSent && (
              <Input
                label="Phone"
                icon={<Phone />}
                value={phone}
                onChange={setPhone}
                placeholder="+880 1XXX-XXXXXX"
              />
            )}

            {otpSent && (
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg text-center"
                placeholder="000000"
                maxLength={6}
                required
              />
            )}

            <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg">
              {otpSent ? "Verify & Continue" : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <QuickBtn icon={<UserCircle />} label="Traveler" onClick={() => handleQuickLogin("traveler")} />
            <QuickBtn icon={<Home />} label="Host" onClick={() => handleQuickLogin("host")} />
            <QuickBtn icon={<UserCog />} label="Admin" onClick={() => handleQuickLogin("admin")} />
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setOtpSent(false);
              }}
              className="text-sm text-blue-500"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          <div className="mt-4 flex justify-center gap-2 text-sm text-gray-500">
            <Fingerprint className="w-4 h-4" />
            Biometric login available
          </div>
        </div>
      </div>
    </div>
  );
}

/* helpers */
const Feature = ({ icon, title, children }) => (
  <div className="flex gap-3">
    {icon}
    <div>
      <h3>{title}</h3>
      <p className="text-sm opacity-80">{children}</p>
    </div>
  </div>
);

const Input = ({ label, icon, value, onChange, ...rest }) => (
  <div>
    <label className="block text-sm mb-2">{label}</label>
    <div className="relative">
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</span>}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-3 border rounded-lg"
        {...rest}
        required
      />
    </div>
  </div>
);

const RoleButton = ({ active, icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-4 border-2 rounded-lg ${active ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
  >
    {icon}
    <div className="text-sm">{label}</div>
  </button>
);

const QuickBtn = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="p-3 border rounded-lg">
    {icon}
    <div className="text-xs">{label}</div>
  </button>
);
