// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import HomePage from './components/HomePage';
// import LoginPage from './components/Login';
// import RegisterPage from './components/Register';



// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<HomePage />} />
//         <Route path="/login" element={<LoginPage />} />
//         <Route path="/register" element={<RegisterPage />} />
//         <Route path="/signup" element={<RegisterPage />} />
          
//         {/* Alternative: Use AuthPages for both login/signup */}
       
//       </Routes>
//     </Router>
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

  if (!isAuthenticated || !currentUser) {
    return <AuthPage onLogin={handleLogin} />;
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