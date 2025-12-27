import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginPage from './components/Login';
import RegisterPage from './components/Register';
import AdminPage from './components/AdminPage';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/signup" element={<RegisterPage />} />
          <Route path="/adminPage" element={<AdminPage />} />
        {/* Alternative: Use AuthPages for both login/signup */}
       
      </Routes>
    </Router>
  );
}
export default App;