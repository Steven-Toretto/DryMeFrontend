import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  baseURL: "http://127.0.0.1:8000/api/",
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

  // ❌ REMOVE token storage from here
  // ✅ Let Login.jsx handle storage

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
  return res.data; // ✅ FIXED
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
  const res = await API.put(`orders/${id}/status/`, { status });
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













// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://127.0.0.1:8000/api/",
// });

// // ============================
// // 🔐 ATTACH TOKEN TO EVERY REQUEST
// // ============================
// API.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("access");

//     if (token) {
//       config.headers = config.headers || {};
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );



// // ============================
// // 🔐 AUTH
// // ============================
// export const registerUser = async (data) => {
//   const res = await API.post("register/", data);
//   return res.data;
// };

// export const loginUser = async (username, password) => {
//   const res = await API.post("login/", {
//     username,
//     password,
//   });

//   // 🔥 SAVE TOKEN + ROLE IMMEDIATELY
//   localStorage.setItem("access", res.data.access);
//   localStorage.setItem("refresh", res.data.refresh);
//   localStorage.setItem("role", res.data.role);

//   return res.data;
// };

// // ============================
// // 🏪 SHOPS
// // ============================
// export const getShops = async () => {
//   const res = await API.get("shops/");
//   return res.data;
// };

// export const createShop = async (data) => {
//   const res = await API.post("shops/", data, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//     },
//   });

//   return res.data;
// };

// // ============================
// // 🧺 SERVICES
// // ============================
// export const getServices = async (shopId = null) => {
//   let url = "services/";

//   if (shopId) {
//     url += `?shop=${shopId}`;
//   }

//   const res = await API.get(url);
//   return res.data;
// };

// export const createService = async (data) => {
//   const res = await API.post("services/", data);
//   return res.data;
// };

// // ============================
// // 📦 ORDERS
// // ============================
// export const getOrders = async () => {
//   const res = await API.get("orders/");
//   return res.data;
// };

// export const getOwnerOrders = async () => {
//   const res = await API.get("owner/orders/");
//   return res.data;
// };

// // 🔥 CREATE ORDER (MATCHES SERIALIZER)
// export const createOrder = async (data) => {
//  /**
//  * EXPECTED FORMAT:
//  * {
//  *   shop: number,
//  *   service: number,
//  *   weight: number
//  * }
//  */
//   const res = await API.post("orders/", data);
//   return res.data;
// };

// // 🔄 UPDATE ORDER STATUS (FIXED → PUT)
// export const updateOrderStatus = async (id, status) => {
//   const res = await API.put(`orders/${id}/status/`, {
//     status,
//   });
//   return res.data;
// };
// // featured shops
// export const getFeaturedShops = async () => {
//   const res = await API.get("featured-shops/");
//   return res.data;
// };

// export default API;

// // 
// export const deleteShop = async (id) => {
//   const res = await API.delete(`/shops/${id}/`);
//   return res.data;
// };
// // 
// export const updateShop = (id, data) =>
//   API.put(`/shops/${id}/`, data);
