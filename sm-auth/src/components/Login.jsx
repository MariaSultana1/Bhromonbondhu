import React, { useState } from "react";

const Login = ({ goSignupAs, onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        console.log(" Login successful:", data.user);
        
        if (onLoginSuccess) {
          onLoginSuccess(data.user);
        }
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("Unable to connect to server. Please check your connection.");
      console.error(" Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };
  return (
    <div className="bg-[#e1f3f7] overflow-hidden w-full min-w-[1440px] min-h-[1603px] relative">
      <header className="absolute top-0 left-0 w-full h-[97px] bg-[#cde5f9] border backdrop-blur">
        <img className="absolute top-[17px] left-[65px] w-[50px] h-[50px]" alt="Logo" src="/images/image 5.png" />
        <div className="absolute top-[9px] left-[127px] text-[40px] font-serif">ভ্রমণবন্ধু</div>
        <div className="absolute top-[57px] left-[71px] text-2xl font-light">Bhromonbondhu</div>
      </header>

      <img className="absolute top-[892px] left-[692px] w-[748px] h-[711px] object-cover" alt="Travel illustration" src="/images/image 187.png" />
      <img className="absolute top-[124px] left-[108px] w-[157px] h-[151px] object-cover" alt="Sun" src="/images/image 188.png" />

      <div className="absolute top-[243px] left-[124px] w-[1192px] h-[618px] bg-white rounded-[15px] shadow-md" />

      <img className="absolute top-[261px] left-[1142px] w-[30px] h-[30px]" alt="Globe" src="/images/image 174.png" />

      <button
        type="button"
        onClick={() => goSignupAs && goSignupAs()}
        className="absolute top-[262px] left-[1187px] w-[98px] h-[29px] bg-[#d9d9d9] rounded-xl hover:bg-[#c9c9c9] transition-colors disabled:opacity-50"
        disabled={isLoading}
      >
        Signup
      </button>

      <main className="absolute top-[301px] left-[237px] w-[472px] h-[513px] bg-[#f1eeee] rounded-xl border shadow-md p-10">
        <h1 className="text-4xl text-center font-serif mt-4">LOGIN</h1>
        <p className="text-center text-lg font-serif mt-2">
          Hey enter your details to login <br /> to your account
        </p>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-6">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Username or Email"
            className="w-full h-[46px] bg-[#d9d9d9] rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-[#047ba3] transition-all disabled:opacity-50"
            disabled={isLoading}
            autoComplete="username"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Password"
              className="w-full h-[46px] bg-[#d9d9d9] rounded-xl px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-[#047ba3] transition-all disabled:opacity-50"
              disabled={isLoading}
              autoComplete="current-password"
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

          <p className="text-sm text-center">
            Don't have any account yet?{" "}
            <button 
              type="button" 
              onClick={() => goSignupAs && goSignupAs()} 
              className="text-[#047ba3] underline hover:text-[#035a7a] transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              Register now!
            </button>
          </p>

          <button
            type="button"
            onClick={() => handleLogin()}
            className="w-full h-9 bg-[#82c98f] rounded-[20px] text-white hover:bg-[#72b97f] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </div>

        <p className="text-center mt-6 text-gray-600">- or login with -</p>

        <button
          type="button"
          className="mx-auto mt-4 flex items-center gap-2 bg-white border rounded-[20px] px-6 py-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          <img src="/images/image 175.png" alt="Google" className="w-5 h-5" />
          google
        </button>
      </main>

      <div className="absolute top-[320px] left-[760px] w-[430px] h-[540px] bg-white rounded-xl flex flex-col items-center p-6">
        <img src="/images/TRAVEL.png" alt="Travel illustration" className="mt-8 w-[360px] h-auto object-contain" />
      </div>
    </div>
  );
};

export default Login;