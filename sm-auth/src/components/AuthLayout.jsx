import React from 'react';

const AuthLayout = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">SM</h1>
          <p className="text-gray-600 mt-2">Welcome to SM Platform</p>
          <h2 className="text-2xl font-semibold text-gray-800 mt-4">{title}</h2>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;