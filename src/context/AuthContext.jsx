import { createContext, useState } from "react";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() =>
    localStorage.getItem("tokens")
      ? JSON.parse(localStorage.getItem("tokens"))
      : null
  );

  // Login
  const loginUser = async (username, password) => {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.status === 200) {
      setAuthTokens(data);
      localStorage.setItem("tokens", JSON.stringify(data));

      //  ROLE-BASED REDIRECT
      if (data.role === "owner") {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/shops";
      }

      return { success: true }; //  IMPORTANT
    } else {
      return { success: false }; //  IMPORTANT
    }
  } catch (error) {
    return { success: false }; //  IMPORTANT
  }
};

  //  Logout
  const logoutUser = () => {
    setAuthTokens(null);
    localStorage.removeItem("tokens");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ authTokens, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;