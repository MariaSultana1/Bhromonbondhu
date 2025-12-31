import React, { useState } from "react";

const SignUpas = ({ selectTraveller, selectHost, goLogin }) => {
  const [selectedUserType, setSelectedUserType] = useState(null);

  const userTypeOptions = [
    {
      id: "traveller",
      title: "Traveller",
      description: "Explore & book trips",
      image: "/images/image 31.png",
      imageAlt: "Traveller icon with backpack",
      action: () => {
        setSelectedUserType("traveller");
        selectTraveller();
      },
    },
    {
      id: "host",
      title: "Host",
      description: "Offer stays & tours",
      image: "/images/image 34.png",
      imageAlt: "Host icon with house",
      action: () => {
        setSelectedUserType("host");
        selectHost();
      },
    },
  ];

  const handleKeyDown = (event, option) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      option.action();
    }
  };

  return (
    <main className="bg-[#e9ffd9] w-full min-h-screen relative overflow-x-hidden">
      {/* Background image */}
      <img
        className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
        alt="Decorative background"
        src="/images/image 314.png"
        aria-hidden="true"
      />

      {/* Heading */}
      <h1 className="absolute top-[100px] left-[301px] sm:left-[45%] sm:-translate-x-1/2 text-[64px] font-serif text-black whitespace-nowrap">
        Sign up as
      </h1>

      {/* Options */}
      <div className="absolute top-[230px] left-[469px] sm:left-[50%] sm:-translate-x-1/2 w-[455px] flex flex-col gap-[44px] sm:flex-col">
        {userTypeOptions.map((option, index) => (
          <div key={option.id} className="relative">
            <button
              className={`w-[455px] bg-[#faca84] rounded-[20px] shadow-[0px_4px_4px_#00000040] cursor-pointer transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-black focus:ring-opacity-50 active:scale-95 ${
                selectedUserType === option.id
                  ? "ring-4 ring-black ring-opacity-70"
                  : ""
              }`}
              onClick={option.action}
              onKeyDown={(e) => handleKeyDown(e, option)}
              aria-label={`Sign up as ${option.title}: ${option.description}`}
              aria-pressed={selectedUserType === option.id}
              type="button"
              style={{
                height: index === 0 ? "145px" : "131px",
              }}
            />

            <img
              className={`absolute mix-blend-multiply aspect-[1] object-cover pointer-events-none`}
              alt={option.imageAlt}
              src={option.image}
              style={{
                top: index === 0 ? "12px" : "17px",
                left: index === 0 ? "47px" : "57px",
                width: index === 0 ? "118px" : "97px",
                height: index === 0 ? "118px" : "97px",
              }}
            />

            <div
              className="absolute pointer-events-none"
              style={{
                top: index === 0 ? "32px" : "14px",
                left: index === 0 ? "202px" : "217px",
              }}
            >
              <h2 className="font-normal text-black text-[32px] mb-[7px]">
                {option.title}
              </h2>
              <p className="font-normal text-black text-lg">{option.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Login link */}
      <p className="absolute top-[580px] left-[400px] sm:left-[49%] sm:-translate-x-1/2 text-center text-lg">
        Already have an account?{" "}
        <button onClick={goLogin} className="text-[#047ba3] underline">
          Login now!
        </button>
      </p>
    </main>
  );
};

export default SignUpas;
