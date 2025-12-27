// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// const WelcomePage = () => {
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     // LocalStorage থেকে ইউজার ডেটা লোড করুন
//     const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
//     if (!currentUser) {
//       navigate("/login");
//     } else {
//       setUser(currentUser);
//     }
//   }, [navigate]);

//   const handleLogout = () => {
//     localStorage.removeItem('currentUser');
//     navigate("/login");
//   };

//   if (!user) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
//         <div className="text-center mb-8">
//           <h1 className="text-4xl font-bold text-green-600 mb-2">
//             Welcome Back!
//           </h1>
//           <p className="text-gray-600">ভ্রমণবন্ধু-তে আপনাকে স্বাগতম</p>
//         </div>
        
//         <div className="bg-green-50 rounded-xl p-6 mb-6">
//           <div className="flex items-center justify-center mb-4">
//             <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
//               <span className="text-2xl font-bold text-green-600">
//                 {user.fullName.charAt(0).toUpperCase()}
//               </span>
//             </div>
//           </div>
          
//           <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
//             {user.fullName}
//           </h2>
          
//           <div className="space-y-3 mt-4">
//             <div className="flex items-center gap-3">
//               <span className="text-gray-600">📧</span>
//               <span className="text-gray-700">{user.email}</span>
//             </div>
            
//             {user.phone && (
//               <div className="flex items-center gap-3">
//                 <span className="text-gray-600">📱</span>
//                 <span className="text-gray-700">{user.phone}</span>
//               </div>
//             )}
            
//             <div className="flex items-center gap-3">
//               <span className="text-gray-600">👤</span>
//               <span className="text-gray-700">Registered User</span>
//             </div>
//           </div>
//         </div>
        
//         <div className="text-center space-y-4">
//           <button
//             onClick={() => navigate("/dashboard")}
//             className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors font-semibold"
//           >
//             Go to Dashboard
//           </button>
          
//           <button
//             onClick={handleLogout}
//             className="w-full border-2 border-red-500 text-red-500 py-3 rounded-xl hover:bg-red-50 transition-colors font-semibold"
//           >
//             Logout
//           </button>
//         </div>
        
//         <div className="mt-8 text-center text-gray-500 text-sm">
//           <p>আপনার ভ্রমণ অভিজ্ঞতা শেয়ার করুন এবং নতুন গন্তব্য আবিষ্কার করুন!</p>
//         </div>
//       </div>
      
//       <div className="mt-8 text-center">
//         <p className="text-gray-400">
//           Powered by <span className="font-bold text-green-600">ভ্রমণবন্ধু</span>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default WelcomePage;