import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// ✅ Component name must start with UPPERCASE
const SignUpas = () => {
  const [selectedUserType, setSelectedUserType] = useState(null);
  const navigate = useNavigate();

  const userTypeOptions = [
    {
      id: "traveller",
      title: "Traveller",
      description: "Explore & book trips",
      image: "/images/image-31.png",
      imageAlt: "Traveller icon with backpack",
    },
    {
      id: "host",
      title: "Host",
      description: "Offer stays & tours",
      image: "/images/image-34.png",
      imageAlt: "Host icon with house",
    },
  ];

  const handleUserTypeClick = (userTypeId) => {
    setSelectedUserType(userTypeId);
    
    // রেজিস্টার পেজে রিডাইরেক্ট করবে userType সহ
    navigate(`/register?userType=${userTypeId}`);
  };

  const handleKeyDown = (event, userTypeId) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleUserTypeClick(userTypeId);
    }
  };

  return (
    <main className="bg-[#e9ffd9] border border-solid border-transparent w-full min-w-[1440px] min-h-[1461px] relative">
      <img
        className="absolute top-[78px] left-0 w-[1440px] h-[1310px] aspect-[1.15]"
        alt="Decorative background illustration with travel elements"
        src="/images/image-314.png"
        aria-hidden="true"
      />

      <section className="relative z-10" aria-labelledby="signup-heading">
        <h1
          id="signup-heading"
          className="absolute top-[317px] left-[481px] w-[509px] [font-family:'Holtwood_One_SC-Regular',Helvetica] font-normal text-black text-[64px] tracking-[0] leading-[normal] whitespace-nowrap"
        >
          Sign up as
        </h1>

        <div className="absolute top-[478px] left-[469px] w-[455px] space-y-[44px]">
          {userTypeOptions.map((option, index) => {
            const topPosition = index === 0 ? "top-[478px]" : "top-[667px]";
            const height = index === 0 ? "h-[145px]" : "h-[131px]";
            const imageTop = index === 0 ? "top-[490px]" : "top-[678px]";
            const imageLeft = index === 0 ? "left-[516px]" : "left-[526px]";
            const imageSize =
              index === 0 ? "w-[118px] h-[118px]" : "w-[97px] h-[97px]";
            const titleTop = index === 0 ? "top-[510px]" : "top-[692px]";
            const titleLeft = index === 0 ? "left-[671px]" : "left-[686px]";
            const descTop = index === 0 ? "top-[564px]" : "top-[731px]";
            const descLeft = index === 0 ? "left-[679px]" : "left-[686px]";

            return (
              <div key={option.id}>
                <button
                  className={`${topPosition} ${height} absolute left-[469px] w-[455px] bg-[#faca84] rounded-[20px] shadow-[0px_4px_4px_#00000040] cursor-pointer transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-black focus:ring-opacity-50 active:scale-95 ${
                    selectedUserType === option.id
                      ? "ring-4 ring-black ring-opacity-70"
                      : ""
                  }`}
                  onClick={() => handleUserTypeClick(option.id)}
                  onKeyDown={(e) => handleKeyDown(e, option.id)}
                  aria-label={`Sign up as ${option.title}: ${option.description}`}
                  aria-pressed={selectedUserType === option.id}
                  type="button"
                />

                <img
                  className={`absolute ${imageTop} ${imageLeft} ${imageSize} mix-blend-multiply aspect-[1] object-cover pointer-events-none`}
                  alt={option.imageAlt}
                  src={option.image}
                  aria-hidden="true"
                />

                <div
                  className={`absolute ${titleTop} ${titleLeft} [font-family:'Inter-Regular',Helvetica] font-normal text-black text-[32px] tracking-[0] leading-[normal] pointer-events-none`}
                  aria-hidden="true"
                >
                  {option.title}
                </div>

                <div
                  className={`absolute ${descTop} ${descLeft} [font-family:'Inter-Regular',Helvetica] font-normal text-black text-lg tracking-[0] leading-[normal] pointer-events-none`}
                  aria-hidden="true"
                >
                  {option.description}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
};

// ✅ Export with UPPERCASE name
export default SignUpas;