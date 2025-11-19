import React from "react";
import { useNavigate } from "react-router-dom";


const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  if (!token) {
    navigate("/login");
  
    return null;
  }
  console.log("token", token);
  // Optionally, you can add logic to verify the token or fetch user data here
  return children;
};

export default PrivateRoute;
