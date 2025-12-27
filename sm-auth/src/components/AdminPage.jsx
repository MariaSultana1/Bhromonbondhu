import React from "react";

const statsCards = [
  {
    id: 1,
    icon: "/images/people 2.png",
    mainValue: "1248",
    label: "Total Users",
    subLabel: "856 travelers • 392 hosts",
  },
  {
    id: 2,
    icon: "/images/image 24.png",
    mainValue: "45",
    label: "Active Bookings",
    subLabel: "+12 this week",
    subLabelColor: "#672121",
  },
  {
    id: 3,
    icon: "/images/image 25.png",
    mainValue: "৳3250K",
    label: "Total Revenue",
    subLabel: "+15.8% this month",
    subLabelColor: "#1a8d52",
  },
  {
    id: 4,
    icon: "/images/image 26.png",
    mainValue: "1",
    label: "Open Disputes",
    subLabel: "Requires attention",
    subLabelColor: "#b56d20",
  },
];

const revenueData = [
  { month: "Jan", value: 100000, yPos: 108 },
  { month: "Feb", value: 75000, yPos: 70 },
  { month: "Mar", value: 50000, yPos: 70 },
  { month: "Apr", value: 25000, yPos: 70 },
  { month: "May", value: 75000, yPos: 69 },
  { month: "Jun", value: 100000, yPos: 116 },
];

const userGrowthData = [
  { month: "Jan", travelers: 77, hosts: 57 },
  { month: "Feb", travelers: 97, hosts: 52 },
  { month: "Mar", travelers: 119, hosts: 40 },
  { month: "Apr", travelers: 134, hosts: 64 },
  { month: "May", travelers: 137, hosts: 71 },
  { month: "Jun", travelers: 143, hosts: 84 },
];

const recentUsers = [
  {
    id: 1,
    name: "Riya Rahman",
    type: "Traveler",
    status: "verified",
    time: "2 hours ago",
    image: "/images/Ellipse 11.png",
  },
  {
    id: 2,
    name: "Karim Ahmed",
    type: "host",
    status: "Pending",
    time: "5 hours ago",
    image: "/images/Ellipse 13.png",
  },
  {
    id: 3,
    name: "Ayesha Khan",
    type: "Traveler",
    status: "Reject",
    time: "1 day ago",
    image: "/images/Ellipse 20.png",
  },
  {
    id: 4,
    name: "Rafiq Rahman",
    type: "host",
    status: "verified",
    time: "2 day ago",
    image: "/images/Ellipse 19.png",
  },
];

const disputes = [
  {
    id: 1,
    bookingId: "B-1234",
    parties: "Riya Rahman vs Karim Ahmed",
    issue: "Service not provided",
    status: "open",
  },
  {
    id: 2,
    bookingId: "B-1235",
    parties: "Mehedi Hassan vs Shahana Begum",
    issue: "Payment issue",
    status: "resolved",
  },
];

const quickActions = [
  {
    id: 1,
    icon: "/images/image 38.png",
    title: "manage users",
    description: "view and moderate user",
  },
  {
    id: 2,
    icon: "/images/image 36.png",
    title: "verification",
    description: "approve host application",
  },
  {
    id: 3,
    icon: "/images/image 35.png",
    title: "reports",
    description: "review reported contents",
  },
  {
    id: 4,
    icon: "/images/image 136.png",
    title: "analytic",
    description: "view detailed reports",
  },
];

const AdminPage = () => {

  {
  return (
     <div className="bg-white overflow-hidden w-full min-w-[1440px] min-h-[1603px] relative">
      
       {/* Header */}
      <header className="fixed top-0 left-0 w-full h-[78px] bg-[#cde5f9] border-[0.25px] border-solid border-[#a6b6b8cc] backdrop-blur-[2px] z-50">
        <div className="flex items-center h-full px-8">
          <div className="flex items-center gap-3">
            <img
              className="w-[27px] h-[27px] object-cover"
              alt="Logo"
              src="/images/image 5.png"
            />
            <div className="flex flex-col">
              <div className="text-[15px] font-normal">Bhromonbondhu</div>
              <div className="text-[32px] font-normal">ভ্রমণবন্ধু</div>
            </div>
          </div>
          
          <div className="ml-auto text-base font-normal">Admin Dashboard</div>
          
          <div className="ml-12 flex items-center gap-4">
            <img
              className="w-6 h-6 object-cover cursor-pointer"
              alt="Notification"
              src="/images/notification 1.png"
            />
            <div className="flex items-center gap-2">
              <img
                className="w-8 h-8 object-cover rounded-full"
                alt="Admin profile"
                src="/images/image 143.png"
              />
              <div className="text-[17px] font-normal">Admin User</div>
            </div>
            <img
              className="w-5 h-5 object-cover cursor-pointer ml-4"
              alt="Logout"
              src="/images/logout 2.png"
            />
          </div>
        </div>
      </header>

      
      {/* Sidebar */}
      <nav className="fixed left-0 top-[78px] w-[243px] h-[calc(100%-78px)] bg-white">
        <div className="pt-8">
          <div className="flex items-center gap-3 px-6 py-4 hover:bg-[#d9d9d9] rounded-xl mx-3.5">
            <img
              className="w-5 h-5 object-cover"
              alt="Home button"
              src="/images/home-button 1.png"
            />
            <div className="text-[15px] font-light">Home</div>
          </div>
          
          <div className="flex items-center gap-3 px-6 py-4 mt-2 hover:bg-gray-100 rounded-xl mx-3.5">
            <img
              className="w-5 h-5 object-cover"
              src="/images/chat 1.png"
              alt="Chat"
            />
            <div className="text-[15px] font-light">Message</div>
          </div>
        </div>
      </nav>

        {/* Main Content */}
      <main className="ml-[243px] mt-[78px] p-8">
        {/* Platform Overview Section */}
        <section className="mb-8">
          <h1 className="text-xl font-semibold">Platform Overview</h1>
          <p className="text-xl font-normal mt-2">
            Monitor and manage Bhromonbondhu
          </p>
        </section>

       {/* Stats Cards */}
        <section className="flex gap-6 mb-8">
          {statsCards.map((card) => (
            <div
              key={card.id}
              className="w-[283px] h-[200px] rounded-[30px] shadow-lg bg-white p-6 flex flex-col"
            >
              <div className="flex items-start gap-4">
                <img
                  className="w-12 h-12 object-cover"
                  alt={card.label}
                  src={card.icon}
                />
                <div>
                  <div className="text-2xl font-semibold">{card.mainValue}</div>
                  <div className="text-base font-normal">{card.label}</div>
                </div>
              </div>
              <div className="mt-4">
                <div 
                  className="text-[15px] font-light"
                  style={{ color: card.subLabelColor || "#000" }}
                >
                  {card.subLabel}
                </div>
              </div>
            </div>
          ))}
        </section>


        <section className="top-[459px] left-[266px] w-[653px] h-[295px] rounded-[15px] overflow-hidden shadow-[0px_4px_4px_#00000040] absolute bg-white">
         

          <h2 className="absolute top-3.5 left-5 w-[165px] h-[22px] flex items-center justify-center [font-family:'Inter-Medium',Helvetica] font-medium text-black text-[17px] tracking-[0] leading-[normal]">
            Revenue Trend
          </h2>

          <div className="top-[54px] left-[22px] w-[58px] absolute h-[17px] flex items-center justify-center [font-family:'Inter-Light',Helvetica] font-light text-black text-[15px] tracking-[0] leading-[normal] whitespace-nowrap">
            100000
          </div>

          <div className="top-[92px] left-[22px] w-[58px] absolute h-[17px] flex items-center justify-center [font-family:'Inter-Light',Helvetica] font-light text-black text-[15px] tracking-[0] leading-[normal] whitespace-nowrap">
            75000
          </div>

          <div className="top-[131px] left-[22px] w-[58px] absolute h-[17px] flex items-center justify-center [font-family:'Inter-Light',Helvetica] font-light text-black text-[15px] tracking-[0] leading-[normal] whitespace-nowrap">
            50000
          </div>

          <div className="top-[169px] left-[22px] w-[58px] absolute h-[17px] flex items-center justify-center [font-family:'Inter-Light',Helvetica] font-light text-black text-[15px] tracking-[0] leading-[normal] whitespace-nowrap">
            25000
          </div>

          <div className="absolute top-[205px] left-[35px] w-[58px] h-[17px] flex items-center justify-center [font-family:'Inter-Light',Helvetica] font-light text-black text-[15px] tracking-[0] leading-[normal] whitespace-nowrap">
            00
          </div>

          {revenueData.map((data, index) => (
            <div
              key={data.month}
              className="absolute top-[222px] w-[52px] h-[17px] flex items-center justify-center [font-family:'Inter-Light',Helvetica] font-light text-black text-[15px] tracking-[0] leading-[normal] whitespace-nowrap"
              style={{ left: `${83 + index * 64}px` }}
            >
              {data.month}
            </div>
          ))}

          

          <img
            className="absolute top-[104px] left-[145px] w-[7px] h-[7px]"
            alt="Data point"
            //src={vector1}
          />

          <img
            className="absolute top-[67px] left-[265px] w-1.5 h-1.5"
            alt="Data point"
            //src={vector2}
          />

          <img
            className="absolute top-[89px] left-[203px] w-[5px] h-1.5"
            alt="Data point"
            //src={vector4}
          />

          <img
            className="absolute top-[116px] left-[421px] w-[3px] h-1"
            alt="Data point"
            //src={vector5}
          />

          <img
            className="absolute top-[118px] left-[423px] w-[3px] h-[3px]"
            alt="Data point"
            //src={vector6}
          />

          <img
            className="absolute top-[88px] left-[202px] w-[5px] h-1.5"
            alt="Data point"
            //src={vector7}
          />

          <div className="top-[103px] left-[143px] w-[9px] h-2 rounded-[4.5px/4px] absolute bg-black" />

          <div className="top-[86px] left-[200px] w-2.5 h-[9px] rounded-[5px/4.5px] absolute bg-black" />

          <div className="top-[66px] left-[263px] w-2.5 h-[9px] rounded-[5px/4.5px] absolute bg-black" />

          <div className="top-[67px] left-[337px] w-[9px] h-[9px] rounded-[4.5px] absolute bg-black" />
        </section>

        <section className="top-[459px] left-[937px] w-[487px] h-[295px] rounded-[15px] overflow-hidden shadow-[0px_4px_4px_#00000040] absolute bg-white">
          

          <h2 className="absolute top-[15px] left-[9px] w-[165px] h-[22px] flex items-center justify-center [font-family:'Inter-Medium',Helvetica] font-medium text-black text-[17px] tracking-[0] leading-[normal]">
            User Growth
          </h2>

          <div className="top-[60px] left-[29px] w-[58px] absolute h-[17px] flex items-center justify-center [font-family:'Inter-Light',Helvetica] font-light text-black text-[15px] tracking-[0] leading-[normal] whitespace-nowrap">
            220
          </div>

          <div className="top-[92px] left-[29px] w-[58px] absolute h-[17px] flex items-center justify-center [font-family:'Inter-Light',Helvetica] font-light text-black text-[15px] tracking-[0] leading-[normal] whitespace-nowrap">
            165
          </div>

          <div className="top-[124px] left-11 w-[29px] absolute h-[17px] flex items-center justify-center [font-family:'Inter-Light',Helvetica] font-light text-black text-[15px] tracking-[0] leading-[normal] whitespace-nowrap">
            110
          </div>

          <div className="top-[159px] left-[50px] w-[25px] absolute h-[17px] flex items-center justify-center [font-family:'Inter-Light',Helvetica] font-light text-black text-[15px] tracking-[0] leading-[normal] whitespace-nowrap">
            55
          </div>

          <div className="absolute top-[194px] left-[35px] w-[58px] h-[17px] flex items-center justify-center [font-family:'Inter-Light',Helvetica] font-light text-black text-[15px] tracking-[0] leading-[normal] whitespace-nowrap">
            00
          </div>

          {userGrowthData.map((data, index) => (
            <div
              key={data.month}
              className="absolute top-[222px] w-[52px] h-[17px] flex items-center justify-center [font-family:'Inter-Light',Helvetica] font-light text-black text-[15px] tracking-[0] leading-[normal] whitespace-nowrap"
              style={{ left: `${83 + index * 64}px` }}
            >
              {data.month}
            </div>
          ))}

          {userGrowthData.map((data, index) => (
            <React.Fragment key={`bars-${data.month}`}>
              <div
                className="absolute w-4 bg-[#04a0ae]"
                style={{
                  left: `${89 + index * 70}px`,
                  top: `${211 - data.travelers}px`,
                  height: `${data.travelers}px`,
                }}
              />
              <div
                className="absolute w-4 bg-[#04ae42]"
                style={{
                  left: `${109 + index * 70}px`,
                  top: `${211 - data.hosts}px`,
                  height: `${data.hosts}px`,
                }}
              />
            </React.Fragment>
          ))}
        </section>

        <section className="absolute top-[795px] left-[267px] w-[656px] h-[438px] bg-white rounded-[15px] shadow-[0px_4px_4px_#00000040]">
          <h2 className="absolute top-[8px] left-[20px] w-[161px] h-[47px] flex items-center justify-center [font-family:'Inter-Regular',Helvetica] font-normal text-black text-[17px] tracking-[0] leading-[normal]">
            Recent user
          </h2>

          {recentUsers.map((user, index) => (
            <article
              key={user.id}
              className="absolute w-[610px] h-[69px] bg-[#f8fdff] rounded-[15px] shadow-[0px_4px_4px_#00000040]"
              style={{ top: `${48 + index * 84}px`, left: "30px" }}
            >
               {/* User Image */}
      <div className="absolute top-[10px] left-[15px] w-10 h-10 rounded-full overflow-hidden">
        <img
          className="w-full h-full object-cover"
          alt={user.name}
          src={user.image}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/images/default-user.png"; // fallback image
          }}
        />
      </div>
              <div className="absolute top-[19px] left-[1px] w-[482px] h-[37px] flex items-center justify-center [font-family:'Inter-Regular',Helvetica] font-normal text-black text-[15px] tracking-[0] leading-[normal]">
                {user.name}
              </div>

              <div
                className={`absolute top-[50px] left-[13px] ${
                  user.type === "Traveler" ? "w-[60px]" : "w-[45px]"
                } h-4 bg-[#a8d4f6] rounded-[10px]`}
              />

              <div className="absolute top-[54px] left-[9px] w-[68px] h-[9px] flex">
                <div className="flex items-center justify-center w-20 h-[9px] [font-family:'Inter-Light',Helvetica] font-light text-black text-[13px] tracking-[0] leading-[normal] whitespace-nowrap">
                  {user.type}
                </div>
              </div>

              <div
                className={`absolute top-[31px] left-[533px] ${
                  user.status === "verified"
                    ? "w-[59px] bg-[#a4eec2]"
                    : user.status === "Pending"
                      ? "w-[59px] bg-[#fad2a2]"
                      : "w-[59px] bg-[#ed4f4f]"
                } h-4 rounded-[10px]`}
              />

              <div className="absolute top-[35px] left-[541px] w-[46px] h-[8px] flex">
                <div
                  className={`flex items-center justify-center ${
                    user.status === "Pending"
                      ? "-mt-1 w-[50px] h-4 -ml-0.5"
                      : "w-12 h-[9px]"
                  } [font-family:'Inter-Light',Helvetica] font-light text-black text-[13px] tracking-[0] leading-[normal] whitespace-nowrap`}
                >
                  {user.status === "Reject"
                    ? "\u00a0\u00a0Reject"
                    : user.status}
                </div>
              </div>

              <div className="absolute top-[49px] left-[89px] w-[88px] h-[15px] flex items-center justify-center [font-family:'Inter-Light',Helvetica] font-light text-black text-[13px] tracking-[0] leading-[normal] whitespace-nowrap">
                {user.time}
              </div>
            </article>
          ))}

          <button className="absolute top-[381px] left-[35px] w-[583px] h-[38px] bg-[#91a3fe] rounded-[10px] shadow-[inset_0px_4px_2px_#00000040]">
            <div className="absolute top-[8px] left-[205px] w-[228px] h-[23px] flex items-center justify-center [font-family:'Inter-Regular',Helvetica] font-normal text-black text-[13px] tracking-[0] leading-[normal]">
              view all users→
            </div>
          </button>
        </section>

        <section className="absolute top-[787px] left-[939px] w-[489px] h-[440px] bg-white rounded-[15px] shadow-[0px_4px_4px_#00000040]">
          <h2 className="absolute top-[35px] left-[39px] w-[200px] h-[15px] flex items-center justify-center [font-family:'Inter-Regular',Helvetica] font-normal text-black text-[17px] tracking-[0] leading-[normal] whitespace-nowrap">
            Dispute Resolution
          </h2>

          {disputes.map((dispute, index) => (
            <article
              key={dispute.id}
              className="absolute w-[440px] h-[95px] bg-[#f8fdff] rounded-[10px] shadow-[0px_4px_2px_#00000040]"
              style={{ top: `${83 + index * 117}px`, left: "37px" }}
            >
              <div className="absolute top-[15px] left-[22px] w-[148px] h-[71px] flex items-center justify-center [font-family:'Inter-Regular',Helvetica] font-normal text-black text-[13px] tracking-[0] leading-[18px]">
                {`Booking ${dispute.bookingId}\n${dispute.parties}\n${dispute.issue}`}
              </div>

              <div
                className={`absolute top-[40px] left-[370px] ${
                  dispute.status === "open"
                    ? "w-[63px] bg-[#fad2a2]"
                    : "w-[63px] bg-[#a2fab6]"
                } h-4 rounded-[15px]`}
              />

              <div className="absolute top-[43px] left-[376px] w-14 h-2 flex items-center justify-center [font-family:'Inter-Light',Helvetica] font-light text-black text-xs tracking-[0] leading-[normal] whitespace-nowrap">
                {dispute.status}
              </div>
            </article>
          ))}

          <button className="absolute top-[330px] left-[37px] w-[423px] h-[38px] bg-[#91a3fe] rounded-[10px] shadow-[inset_0px_4px_2px_#00000040]">
            <div className="absolute top-[8px] left-[125px] w-[228px] h-[23px] flex items-center justify-center [font-family:'Inter-Regular',Helvetica] font-normal text-black text-[13px] tracking-[0] leading-[normal]">
              <span className="[font-family:'Inter-Regular',Helvetica] font-normal text-black text-[13px] tracking-[0]">
                view all disputes
              </span>
              <span className="text-xs"> →</span>
            </div>
          </button>
        </section>

        <section className="absolute top-[1254px] left-[278px] w-[1159px] h-[201px] bg-white rounded-[15px] shadow-[0px_4px_4px_#00000040]">
  <h2 className="absolute top-[22px] left-[1px] w-[273px] h-[26px] flex items-center justify-center [font-family:'Inter-Regular',Helvetica] font-normal text-black text-[17px] tracking-[0] leading-[normal]">
    quick action
  </h2>

  <div className="absolute top-[66px] left-[36px] flex gap-4 w-[1087px]">
    {quickActions.map((action) => (
      <div
        key={action.id}
        className="relative w-[271px] h-[100px] bg-[#f8feff] rounded-[15px] shadow-[0px_4px_4px_#00000040] flex items-center"
      >
        <img
          className="absolute left-6 w-11 h-11 aspect-[1] object-cover"
          alt={action.title}
          src={action.icon}
        />

        <div className="absolute left-[90px] flex flex-col justify-center h-full">
          <div className="[font-family:'Inter-Regular',Helvetica] font-normal text-black text-[15px] tracking-[0] leading-[normal] capitalize">
            {action.title}
          </div>
          <div className="[font-family:'Inter-Light',Helvetica] font-light text-[13px] text-black tracking-[0] leading-[normal] mt-1">
            {action.description}
          </div>
        </div>
      </div>
    ))}
  </div>
</section>
      </main>

      

      <img
        className="absolute top-[-10468px] left-[-104870px] w-[23px] h-[23px] aspect-[1] object-cover"
        alt="Home button"
        src="/images/home-button 1.png"
      />
    </div>
  );
};
}

export default AdminPage;