import React, { useState } from "react";
import Login from "./Login";
import SignUpAs from "./SignUpas";
import Register from "./Register";

const AuthPage = () => {
  const [page, setPage] = useState("login");
  const [userType, setUserType] = useState(null);

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
      goBackToLogin={() => setPage("login")} // এইটা Create Account button এর জন্য
    />
  );
};

export default AuthPage;
