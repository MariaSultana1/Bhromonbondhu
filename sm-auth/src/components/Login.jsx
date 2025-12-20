import React, { useState } from "react";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [passcode, setPasscode] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // সরাসরি অনলাইন ইমেজ URL ব্যবহার করুন
  const images = {
    logo: "data:image/png;base64,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" ,
    travelImage: "https://png.pngtree.com/png-vector/20251104/ourlarge/pngtree-man-traveling-vector-illustration-png-image_17900177.webp",
    eyeIcon: "https://cdn-icons-png.flaticon.com/512/2767/2767146.png",
    googleIcon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAeFBMVEUAAAD///96enrc3Nz09PTKysptbW36+vrr6+tkZGQ5OTnFxcXn5+fCwsInJyeWlparq6uxsbGLi4va2tpBQUHS0tIXFxe4uLhnZ2eFhYUeHh5LS0vq6uqhoaFFRUUNDQ1VVVU0NDR0dHSPj48jIyNdXV0uLi5QUFDiEAOvAAAJ2UlEQVR4nN2d6WKqMBCFrVJXFK1W1NbrVuv7v+FVlMoSIGdmkoDnvzRfA8lktrTeLMjzR+H2o939Ovz+LHet1m65+V1cBu11EL77nuE/3jL7+E4YrIbLVqmWw24w8o0NwRyhH358laOldfkIv02MwwyhP13tELpYm3Yo/tLKE/ZG7YrXslyH01x0PMKEvXDAoYu1/pQbkijhaCWBd9dRClKO0D/J4UXabEW+SSnCMbRu6molMJEihL0taeXU0U9YA0JvbQov0mbmmLBvli/S1CGh1zbPd9WOMY88Qunls1i/IxeEM2t8N+2Jxjmd8PNgFfCqtVVCr2ub76axPcKpC76rzriZQyL8XjgCvApeVSmEribwrnPPNKFnxAJF9G6W8N0131WBScIP13SRLsCbihF6/1yzxeqYIey45kpI+1SFENq10qr0IU9o4ZgEaSBNeHZNlNNQy8DRJew5NGMKtdM5bmgS9llOXmP6EiP0XaOo9U9n7FqEddolEtIC1CJsNKAO4dw1ilqagBqETf4GtQj7rlHUWugCVhJ6xvz1LGnPYDXhxDWLUvozWEl4cc2iFDCDVYRH1yxKITNYQRi4ZlEKAywlHLtmUQoELCP8ds2iFApYRljLZRQGLCEUSRvJaTkZ/lscJhviz4cwYDHhVhbsaz1976TO5N/z8bYNepfxGSwmFLRGl+uw+Cze68z0o1iEGSwmlPoI9zONdLzOVmsuKTNYSCgTnv+aaQfDvOmw6mkHEmABoUhwIuhjQ+mUuyuHYMypnJB/oBhSwrW9EiOK9A0WErLf0SEWANNgpM6gmvCTyfdDmb8/RuW7Sp5BNSFzHd3SRxPJzy+sB/IMKgl5J4ouYzCxsiY/YwZVhB6Hb0n9ANPqpawAzgyqCDn2aJszlJTC50Ppi0ykHCFnmSHnninUj43zX+aDcoSVpkWhFsKFBGeJGcwT0s/1cm9orNu+cWA/JUv4SwVkZbkWaMpcZCJlCMNqFLU4m3yxxgIvfoaQutkLVoBIK01InUJzlWd8pQmJX6F++o4DpQhHNEDZSixppQhpWYc1/gZvShLSgr3sohbDShKSUre5ZyXjShCSDhVHd0PXVIKQci7kmsUWlCCkpD2B7jQXehJSPIhmbDVZPQkJ60z9P8K3BGEPB9y5HLi2/ggJCcAyPhnT+iPE7Zmuy3HrKyYkbIamW3YIKSbEX1ITh3oTign3KODE6bABPQjxlVTSc2hUD0LYxUaLx7rQgxCOpzVjp7jpQYh6oJozhQ9COP2pCQbpQ3dCdK9YOh41ojshanXX/mCf0J0QPRo2xJyJFBGi2eoNsUjvigjR3bAxu/1NESHawMP1oCFFo91jgPKRQpOKCMEpZNoz9qqMvmJC9GzI/KdaLBSLCcHkhHNzCL0HIdjngnv0tUj4+SAEi7S54VCLhLMH4R77GRPQJuHpQYhFfjXL4GtB2H0QYr9iW90WCYd3QtAqZZ/uLRIu74TgX2SHm2wWTnsRIRh04gJaJexHhFgSDSub1TphJyLEXBj8iJpNwlFEiEW3ddvC1IMwjAgxk4YfrrBJOI0IsWJfvh/RJuE2IsQcbXxnt03Cj4gQa1HNT2KzSdiOCLHkfH4eok3C48sTdgmE/GRZm4Srl5/DAYGwWSvNgLCW8vNl7RO+8n54J8Qi3M2yae6EWEvSZtmlq5c/W9z3Q8wh3KzzYfvlz/jrl/fTnCJCsMlHo3xt01f3l94CFy04a69JPu/b7n37rLCUrybFLW425mvHnm5nvdeOHz68+i8cA44ia2/whsj9EC0STh6EaNJXcwj3b07yaSwSrmPCPfY7Zk6URcJtTGg3r80i4SgmRMvwea+pf2zThWVVdGJCtMGew6o8jPAtJoS7lwl0SqIJS8E7PAnRPG9nNU9Yru/qSYje4LRxRYgZmNsnIdzp0lUe9A8+yhbll3oXSxgQxR1BrXty0wwDc3ze65SptWtuJhG7cnGVJMTrD10Ur4HW0DRJiLeX5/tNcYFH9XmKEK8Dtt+1BX3R3lKEhGssrBs2YHvqc5qQUI9Pu/iUIXB80wwhoaeC5QZYqOHlZwgJfTEsN6cBjwdx147naZbQ1ZMfSwSENgiKP6InIaWVmUXLBm5rEW/YzB5D9opJ4Vcs/iGzT9TFFiD8hv35Ibi9vixtGYyuFux+bYyb6wHh10v+/ZTfc8/GaoNftvH06aZ8n7S7cM1v/IQ2ZM//e4qQ2ETYdNM2wpU+ie45af81sQWtWUSPsI0lQvEyPWiNIlLaxib26UwMAvVIxTLYZpfSYHyV+H2GELXf/2RqRe1hrhnFaLJxJOpFTIaO/B5pZUh5WLKE5IbeRg4aPu06mNR/OxcLJDdlhy6t1xPx353uD5Qj5FwTJPwxUq+7SceN8vFczg3jJ0G+Pvkm8PRz8oSsy2N/xUw4gt/ooUzinSImD/pdM5KZxm9aa/FImUepsg5491ntBDqdYcn1aWWjtypC7u2cF2ZdDf0Fveon+zRl5gj7csc9g3HGe4VysVslIetCpLsutJ2jx71Ycp97pDr7h27ZPDWZwhbAnH8pYf4IUJDfhFV7FWmALDr9rcCtkgrHWAEhwcevVnesNZPzgOZByUrxx4py1Lj35yW0CN7LHMfee8Axo1JSvTOFWXicLSmvwyAI5xlPQM//nAUDyVuHlbm9xXmGRq5VXy4u59XqfPkycp2y8oMoJhT7FK1Jva6V5IrazDiXUEHGZFk2LMt6sq6cuaZByDxlWFbRua08o3nvetj6KkwIrcjZruUN8ioVpy1XEHr8u4+tqKS/eFXeveAd6yZVYjRVVhbY66fKUFlQobp2QuQWcrMqzZPUqA6pPWJ5oF2n/qXmiBVlu1oVPsR7Ee2oyn2pV8MkeFqUVmVASLNKq7abRnXES7cOzSMHFo1Kw8OuXWnXk3GkyCrQGDhQS0hKmTIqrXwspFqSktpnUnoFEVA9aL12Dc1AHlbx6tfnNKV9Vz1a08sO2ghJ/5oUuGq5Hs4boMQTr8v+piQpyWqJxNIpledocbu0sIt8SLX1HXrSjYDAKDqxe4C7rbGLRiWp/RF8RrIEQ0u87JHeAWLswA2nY4fKEUoH4Kp1JiXqsrp4eFgrcJ4OxLpcZp8SXyx8W6ElOX+V37nLxjzuGG0q+G0Q3/qmQ1QTVl2OAOEtz8fgurpg5smJEF41NhL2b7WO7HROKcLroiNvrg7xtKq85AivGkm6ciYnmSIOUcLrFxnKHJEnJ7FkY2HCq3qjNqXeNqHzVLIER57wJn/aJa6ul6109Y0Zwpv8cI2dPxbHqYlSRnOEkTphsKqsXNosjsHYWJ2mYcJIvf58PAvWx/O/wz36sVtufheXQXsdhON533DF+3+5Kpyb0sYTtwAAAABJRU5ErkJggg==" 
                   ,
    //decorativeImage1: "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
   // decorativeImage2: "https://img.icons8.com/color/96/000000/sun--v1.png",
    globeIcon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShOmi4u3F0R9vcQEdchH-GIy2RzDNy-_dLIw&s",
     //decorativeImage3: "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w-800&q=80",
  };

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Login attempt with:", { email, passcode });
    // এখানে আপনার API call যোগ করুন
  };

  const handleDemoLogin = (role) => {
    console.log(" ", role);
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
              />
              <span className="font-medium">Google</span>
            </button>

            {/* ডেমো লগিন বাটন */}
            <div className=" ">
              
              <div className=" ">
                {["", "", ""].map((role) => (
                  <button
                    key={role}
                    onClick={() => handleDemoLogin(role.toLowerCase())}
                    className=" "
                  >
                     {role}
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
      />
    </div>
  );
};

export default LoginPage;