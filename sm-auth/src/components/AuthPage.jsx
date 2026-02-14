//AuthPage.jsx
import React, { useState } from "react";
import HomePage from "./HomePage";
import Login from "./Login";
import SignUpAs from "./SignUpas";
import Register from "./Register";
  
const AuthPage = () => {
  const [page, setPage] = useState("home"); 
  const [userType, setUserType] = useState(null);

  if (page === "home") {
    return (
      <HomePage
        goLogin={() => setPage("login")}
        goSignup={() => setPage("signupas")}
      />
    );
  }

  if (page === "login") {
    return <Login goSignupAs={() => setPage("signupas")} />;
  }

  if (page === "signupas") {
    return (
      <SignUpAs
        selectTraveller={() => {
          setUserType("traveller");
          setPage("register");
        }}
        selectHost={() => {
          setUserType("host");
          setPage("register");
        }}
        goLogin={() => setPage("login")}
      />
    );
  }

  return (
    <Register
      userType={userType}
      goLogin={() => setPage("login")}
      goBackToLogin={() => setPage("login")}
    />
  );
};

export default AuthPage;

