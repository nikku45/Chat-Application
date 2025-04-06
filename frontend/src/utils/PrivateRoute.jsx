import { Navigate } from "react-router-dom";


const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("you have to login first")
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
