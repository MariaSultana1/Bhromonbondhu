// App.js - Main Application with Role-Based Routing
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import TravelerDashboard from './components/TravelerDashboard';
import HostDashboard from './components/HostDashboard';
import { AdminDashboard } from './components/AdminDashboard';

function App() {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', 'dashboard'
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState('tourist'); // For registration: 'tourist', 'guide', 'host', 'admin'
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on app mount
  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Verify token with backend
          const response = await fetch('http://localhost:5000/api/auth/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setUser(data.user);
              setCurrentView('dashboard');
              console.log('✅ Auto-login successful:', data.user);
            } else {
              // Token invalid, clear storage
              handleClearAuth();
            }
          } else {
            // Token expired or invalid
            handleClearAuth();
          }
        } catch (error) {
          console.error('❌ Authentication check error:', error);
          handleClearAuth();
        }
      }
      
      setIsLoading(false);
    };

    checkAuthentication();
  }, []);

  const handleClearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentView('login');
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
    console.log(`✅ User logged in and navigating to ${userData.role} dashboard`);
  };

  const handleRegisterSuccess = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
    console.log(`✅ User registered and navigating to ${userData.role} dashboard`);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Call logout endpoint
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      handleClearAuth();
    }
  };

  const goToLogin = () => {
    setCurrentView('login');
  };

  const goToRegister = (type = 'tourist') => {
    setUserType(type);
    setCurrentView('register');
  };

  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    if (!user) return null;

    const dashboardProps = {
      user: user,
      onLogout: handleLogout
    };

    // Route based on user role
    switch (user.role) {
      case 'tourist':
        return <TravelerDashboard {...dashboardProps} />;
      
      case 'guide':
      case 'host':
        return <HostDashboard {...dashboardProps} />;
      
      case 'admin':
        return <AdminDashboard {...dashboardProps} />;
      
      default:
        console.warn(`Unknown role: ${user.role}, defaulting to TravelerDashboard`);
        return <TravelerDashboard {...dashboardProps} />;
    }
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#e1f3f7] to-[#cde5f9]">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-t-4 border-[#047ba3] mx-auto"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <svg className="w-8 h-8 text-[#047ba3]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16z"/>
              </svg>
            </div>
          </div>
          <p className="mt-6 text-xl font-serif text-gray-700">ভ্রমণবন্ধু</p>
          <p className="mt-2 text-sm text-gray-600">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App min-h-screen">
      {currentView === 'login' && (
        <Login 
          goSignupAs={goToRegister} 
          onLoginSuccess={handleLoginSuccess} 
        />
      )}
      
      {currentView === 'register' && (
        <Register 
          userType={userType}
          goLogin={goToLogin}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}
      
      {currentView === 'dashboard' && user && renderDashboard()}
    </div>
  );
}

export default App;