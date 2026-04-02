// import { useContext } from "react";
// import { AuthContext } from "../context/AuthContext";
// import { Navigate } from "react-router-dom";

// const PrivateRoute = ({ children }) => {
//   const { authTokens } = useContext(AuthContext);

//   return authTokens ? children : <Navigate to="/login" />;
// };

// export default PrivateRoute;



import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("access"); // ✅ MUST be "access"
  console.log("TOKEN:", localStorage.getItem("access"));

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default PrivateRoute;