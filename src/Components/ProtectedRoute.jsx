import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token"); // check if logged in

  if (!token) {
    // not logged in, send back to login
    return <Navigate to="/login" replace />;
  }

  // logged in, show the requested page
  return children;
};

export default ProtectedRoute;
