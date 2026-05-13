import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const { token } = useContext(AuthContext);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default PrivateRoute;


// function PrivateRoute({ children, roleRequired }) {

//   const token = localStorage.getItem("access");
//   const user = JSON.parse(localStorage.getItem("user"));

//   if (!token){
//     return <Navigate to="/login" replace />;
//   }

//   if (roleRequired && user?.role !== roleRequired) {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// }
// export default PrivateRoute;

