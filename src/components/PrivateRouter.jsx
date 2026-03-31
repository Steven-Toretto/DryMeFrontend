import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const { authTokens } = useContext(AuthContext);

  return authTokens ? children : <Navigate to="/login" />;
};

export default PrivateRoute;