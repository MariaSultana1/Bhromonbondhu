import React, { useState } from "react";

const Register = ({ userType, goLogin, goBackToLogin}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Signup data:", { ...formData, userType });
   
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
        className="absolute top-[262px] left-[1187px] w-[98px] h-[29px] bg-[#d9d9d9] rounded-xl"
        onClick={goLogin}
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

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full h-[46px] bg-[#d9d9d9] rounded-xl px-4"
            placeholder="Full Name"
            required
          />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full h-[46px] bg-[#d9d9d9] rounded-xl px-4"
            placeholder="Email"
            required
          />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full h-[46px] bg-[#d9d9d9] rounded-xl px-4"
            placeholder="Phone Number"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full h-[46px] bg-[#d9d9d9] rounded-xl px-4 pr-12"
              placeholder="Password"
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

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full h-[46px] bg-[#d9d9d9] rounded-xl px-4 pr-12"
              placeholder="Confirm Password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute top-[10px] right-[12px] w-[25px] h-[25px]"
            >
              <img src="/images/image 238.png" alt="toggle password" />
            </button>
          </div>

          <button
               onClick={goBackToLogin} 
              className="w-full h-9 bg-[#82c98f] rounded-[20px] text-white hover:bg-[#72b97f]"
>
             Create Account
               </button>

          <p className="text-sm text-center">
            Already have an account?{" "}
            <span
              onClick={goLogin}
              className="text-[#047ba3] underline cursor-pointer"
            >
              Login now!
            </span>
          </p>
        </form>
      </main>
    </div>
  );
};

export default Register;