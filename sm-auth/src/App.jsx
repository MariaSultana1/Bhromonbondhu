
import { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { TravelerDashboard } from './components/TravelerDashboard';
import { HostDashboard } from './components/HostDashboard';
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