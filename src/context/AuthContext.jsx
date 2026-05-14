import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/`,
});

// ============================
// 🔐 ATTACH TOKEN TO EVERY REQUEST
// ============================

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================
// 🔐 AUTH
// ============================

export const registerUser = async (data) => {
  const res = await API.post("register/", data);
  return res.data;
};

export const loginUser = async (username, password) => {
  const res = await API.post("login/", {
    username,
    password,
  });

  return res.data;
};

// ============================
// 🏪 SHOPS
// ============================

export const getShops = async () => {
  const res = await API.get("shops/");
  return res.data;
};

export const createShop = async (data) => {
  const res = await API.post("shops/", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const deleteShop = async (id) => {
  const res = await API.delete(`shops/${id}/`);
  return res.data;
};

export const updateShop = async (id, data) => {
  const res = await API.put(`shops/${id}/`, data);
  return res.data;
};

// ============================
// 🧺 SERVICES
// ============================

export const getServices = async (shopId = null) => {
  let url = "services/";

  if (shopId) {
    url += `?shop=${shopId}`;
  }

  const res = await API.get(url);
  return res.data;
};

export const createService = async (data) => {
  const res = await API.post("services/", data);
  return res.data;
};

// ============================
// 📦 ORDERS
// ============================

export const getOrders = async () => {
  const res = await API.get("orders/");
  return res.data;
};

export const getOwnerOrders = async () => {
  const res = await API.get("owner/orders/");
  return res.data;
};

export const createOrder = async (data) => {
  const res = await API.post("orders/", data);
  return res.data;
};

export const updateOrderStatus = async (id, status) => {
  const res = await API.put(`orders/${id}/status/`, {
    status,
  });

  return res.data;
};

// ============================
// ⭐ FEATURED SHOPS
// ============================

export const getFeaturedShops = async () => {
  const res = await API.get("featured-shops/");
  return res.data;
};

export default API;






// import { createContext, useState, useEffect } from "react";

// export const AuthContext = createContext();

// const AuthProvider = ({ children }) => {
//   // 🔐 TOKEN
//   const [token, setToken] = useState(() =>
//     localStorage.getItem("access")
//   );

//   // 👤 USER
//   const [user, setUser] = useState(() => {
//     const stored = localStorage.getItem("user");
//     return stored ? JSON.parse(stored) : null;
//   });

//   // =========================
//   // ✅ LOGIN (NO REDIRECT HERE)
//   // =========================
//   const loginUser = (data) => {
//     // data = response from API

//     localStorage.setItem("access", data.access);
//     localStorage.setItem("refresh", data.refresh);

//     const userData = {
//       username: data.username,
//       role: data.role,
//       profile_image: data.profile_image || null,
//     };

//     localStorage.setItem("user", JSON.stringify(userData));

//     setToken(data.access);
//     setUser(userData);
//   };

//   // =========================
//   // 🚪 LOGOUT
//   // =========================
//   const logoutUser = () => {
//     localStorage.removeItem("access");
//     localStorage.removeItem("refresh");
//     localStorage.removeItem("user");

//     setToken(null);
//     setUser(null);
//   };

//   // =========================
//   // 🔄 SYNC ON LOAD
//   // =========================
//   useEffect(() => {
//     const storedToken = localStorage.getItem("access");
//     const storedUser = localStorage.getItem("user");

//     if (storedToken) setToken(storedToken);
//     if (storedUser) setUser(JSON.parse(storedUser));
//   }, []);

//   return (
//     <AuthContext.Provider
//       value={{
//         token,
//         user,
//         loginUser,
//         logoutUser,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export default AuthProvider;









// // import { createContext, useState } from "react";

// // export const AuthContext = createContext();

// // const AuthProvider = ({ children }) => {
// //   const [authTokens, setAuthTokens] = useState(() =>
// //     localStorage.getItem("tokens")
// //       ? JSON.parse(localStorage.getItem("tokens"))
// //       : null
// //   );

// //   // Login
// //   const loginUser = async (username, password) => {
// //   try {
// //     const response = await fetch("http://127.0.0.1:8000/api/login/", {
// //       method: "POST",
// //       headers: {
// //         "Content-Type": "application/json",
// //       },
// //       body: JSON.stringify({ username, password }),
// //     });

// //     const data = await response.json();

// //     if (response.status === 200) {
// //       setAuthTokens(data);
// //       localStorage.setItem("tokens", JSON.stringify(data));

// //       //  ROLE-BASED REDIRECT
// //       if (data.role === "owner") {
// //         window.location.href = "/dashboard";
// //       } else {
// //         window.location.href = "/shops";
// //       }

// //       return { success: true }; //  IMPORTANT
// //     } else {
// //       return { success: false }; //  IMPORTANT
// //     }
// //   } catch (error) {
// //     return { success: false }; //  IMPORTANT
// //   }
// // };

// //   //  Logout
// //   const logoutUser = () => {
// //     setAuthTokens(null);
// //     localStorage.removeItem("tokens");
// //     window.location.href = "/login";
// //   };

// //   return (
// //     <AuthContext.Provider value={{ authTokens, loginUser, logoutUser }}>
// //       {children}
// //     </AuthContext.Provider>
// //   );
// // };

// // export default AuthProvider;