import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  // 🔐 TOKEN
  const [token, setToken] = useState(() =>
    localStorage.getItem("access")
  );

  // 👤 USER
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  // =========================
  // ✅ LOGIN (NO REDIRECT HERE)
  // =========================
  const loginUser = (data) => {
    // data = response from API

    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);

    const userData = {
      username: data.username,
      role: data.role,
      profile_image: data.profile_image || null,
    };

    localStorage.setItem("user", JSON.stringify(userData));

    setToken(data.access);
    setUser(userData);
  };

  // =========================
  // 🚪 LOGOUT
  // =========================
  const logoutUser = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  // =========================
  // 🔄 SYNC ON LOAD
  // =========================
  useEffect(() => {
    const storedToken = localStorage.getItem("access");
    const storedUser = localStorage.getItem("user");

    if (storedToken) setToken(storedToken);
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;









// import { createContext, useState } from "react";

// export const AuthContext = createContext();

// const AuthProvider = ({ children }) => {
//   const [authTokens, setAuthTokens] = useState(() =>
//     localStorage.getItem("tokens")
//       ? JSON.parse(localStorage.getItem("tokens"))
//       : null
//   );

//   // Login
//   const loginUser = async (username, password) => {
//   try {
//     const response = await fetch("http://127.0.0.1:8000/api/login/", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ username, password }),
//     });

//     const data = await response.json();

//     if (response.status === 200) {
//       setAuthTokens(data);
//       localStorage.setItem("tokens", JSON.stringify(data));

//       //  ROLE-BASED REDIRECT
//       if (data.role === "owner") {
//         window.location.href = "/dashboard";
//       } else {
//         window.location.href = "/shops";
//       }

//       return { success: true }; //  IMPORTANT
//     } else {
//       return { success: false }; //  IMPORTANT
//     }
//   } catch (error) {
//     return { success: false }; //  IMPORTANT
//   }
// };

//   //  Logout
//   const logoutUser = () => {
//     setAuthTokens(null);
//     localStorage.removeItem("tokens");
//     window.location.href = "/login";
//   };

//   return (
//     <AuthContext.Provider value={{ authTokens, loginUser, logoutUser }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export default AuthProvider;