
// import { useState, useEffect } from 'react';
// import TravelerDashboard from './components/TravelerDashboard';
// import AuthPage from './components/AuthPage';
// import HostDashboard from './components/HostDashboard';
// import { AdminDashboard } from './components/AdminDashboard';

// function App() {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   useEffect(() => {
    
//     const storedUser = localStorage.getItem('bhromonbondhu_user');
//     if (storedUser) {
//       const user = JSON.parse(storedUser);
//       setCurrentUser(user);
//       setIsAuthenticated(true);
//     }
//   }, []);

//   const handleLogin = (user) => {
//     setCurrentUser(user);
//     setIsAuthenticated(true);
//     localStorage.setItem('bhromonbondhu_user', JSON.stringify(user));
//   };

//   const handleLogout = () => {
//     setCurrentUser(null);
//     setIsAuthenticated(false);
//     localStorage.removeItem('bhromonbondhu_user');
//   };

//   if (!isAuthenticated || !currentUser) {
//     return <AuthPage onLogin={handleLogin} />;
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {currentUser.type === 'traveler' && (
//         <TravelerDashboard user={currentUser} onLogout={handleLogout} />
//       )}
//       {currentUser.type === 'host' && (
//         <HostDashboard user={currentUser} onLogout={handleLogout} />
//       )}
//       {currentUser.type === 'admin' && (
//         <AdminDashboard user={currentUser} onLogout={handleLogout} />
//       )}
//     </div>
//   );
// }

// export default App;




import { useState, useEffect } from 'react';
import TravelerDashboard from './components/TravelerDashboard';
import AuthPage from './components/AuthPage';
import HostDashboard from './components/HostDashboard';
import { AdminDashboard } from './components/AdminDashboard';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('bhromonbondhu_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('bhromonbondhu_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('bhromonbondhu_user');
  };

 
  const handleDemoLogin = (type) => {
    let user;
    switch (type) {
      case "traveler":
        user = { type: "traveler", name: "Demo Traveler" };
        break;
      case "host":
        user = { type: "host", name: "Demo Host" };
        break;
      case "admin":
        user = { type: "admin", name: "Demo Admin" };
        break;
      default:
        return;
    }
    handleLogin(user);
  };

  const demoButtons = [
    { id: "traveler", label: "TravelerDashboard", top: "900px" },
    { id: "host", label: "HostDashboard", top: "950px" },
    { id: "admin", label: "AdminDashboard", top: "1000px" },
  ];

 
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="relative min-h-screen bg-gray-50">
        <AuthPage onLogin={handleLogin} />

        <div
  className="flex flex-col gap-4"
  style={{ marginTop: "120px", marginLeft: "50px" }}
>
          {demoButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => handleDemoLogin(btn.id)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              style={{ top: btn.top, position: "absolute" }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

 
  return (
    <div className="min-h-screen bg-gray-50">
      {currentUser.type === 'traveler' && (
        <TravelerDashboard user={currentUser} onLogout={handleLogout} />
      )}
      {currentUser.type === 'host' && (
        <HostDashboard user={currentUser} onLogout={handleLogout} />
      )}
      {currentUser.type === 'admin' && (
        <AdminDashboard user={currentUser} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
