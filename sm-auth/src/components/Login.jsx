import React, { useState } from "react";

const Login = ({ goSignupAs }) => {
  const [username, setUsername] = useState("Mim");
  const [password, setPassword] = useState("ab1234");
  const [showPassword, setShowPassword] = useState(false);

 

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Login attempted with:", { username, password });
  };

  const handleGoogleLogin = () => {
    console.log("Google login attempted");
  };

  const handleDemoLogin = (role) => {
    console.log(`Demo login as ${role}`);
   
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
        onClick={goSignupAs}
        className="absolute top-[262px] left-[1187px] w-[98px] h-[29px] bg-[#d9d9d9] rounded-xl"
      >
        Signup
      </button>

     
      <main className="absolute top-[301px] left-[237px] w-[472px] h-[513px] bg-[#f1eeee] rounded-xl border shadow-md p-10">
        <h1 className="text-4xl text-center font-serif mt-4">LOGIN</h1>
        <p className="text-center text-lg font-serif mt-2">
          Hey enter your details to login <br /> to your account
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-6">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full h-[46px] bg-[#d9d9d9] rounded-xl px-4"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full h-[46px] bg-[#d9d9d9] rounded-xl px-4 pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-[10px] right-[12px] w-[25px] h-[25px]"
            >
              <img src="/images/image 238.png" alt="toggle password" />
            </button>
          </div>

          <p className="text-sm text-center">
            Don’t have any account yet?{" "}
            <button type="button" onClick={goSignupAs} className="text-[#047ba3] underline">
              Register now!
            </button>
          </p>

          <button
            type="submit"
            className="w-full h-9 bg-[#82c98f] rounded-[20px] text-white hover:bg-[#72b97f]"
          >
            Login
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">- or login with -</p>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="mx-auto mt-4 flex items-center gap-2 bg-white border rounded-[20px] px-6 py-2"
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
