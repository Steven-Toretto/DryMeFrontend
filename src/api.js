import axios from "axios";

// ============================
// 🌍 BASE URL
// ============================
const BASE_URL = import.meta.env.VITE_API_URL;

// ============================
// 🚀 API INSTANCE
// ============================
const API = axios.create({
  baseURL: `${BASE_URL}/api/`,
});

// ============================
// 🔐 ATTACH ACCESS TOKEN
// ============================
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================
// 🔁 AUTO REFRESH TOKEN
// ============================
API.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // prevent infinite retry loop
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem("refresh");

        if (!refresh) {
          throw error;
        }

        const response = await axios.post(
          `${BASE_URL}/api/token/refresh/`,
          {
            refresh,
          }
        );

        const newAccess = response.data.access;

        // save new access token
        localStorage.setItem("access", newAccess);

        // update axios headers
        API.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newAccess}`;

        originalRequest.headers[
          "Authorization"
        ] = `Bearer ${newAccess}`;

        // retry failed request
        return API(originalRequest);

      } catch (refreshError) {

        // logout if refresh fails
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");

        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ============================
// 🔐 AUTH
// ============================

export const registerUser = async (data) => {
  const res = await API.post("register/", data);
  return res.data;
};

export const loginUser = async (
  username,
  password
) => {
  const res = await API.post("login/", {
    username,
    password,
  });

  return res.data;
};

// ============================
// 🏪 SHOPS
// ============================

export const getShop = async (id) => {

  const response = await API.get(
    `/shops/${id}/`
  );

  return response.data;
};

// export const getShops = async () => {
//   const res = await API.get("shops/");
//   return res.data;
// };

export const createShop = async (data) => {

  const res = await API.post(
    "shops/",
    data,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return res.data;
};

export const updateShop = async (
  id,
  data
) => {

  const res = await API.put(
    `shops/${id}/`,
    data,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return res.data;
};

export const deleteShop = async (id) => {
  const res = await API.delete(
    `shops/${id}/`
  );

  return res.data;
};

// ============================
// 🧺 SERVICES
// ============================

export const getServices = async (
  shopId = null
) => {

  let url = "services/";

  if (shopId) {
    url += `?shop=${shopId}`;
  }

  const res = await API.get(url);

  return res.data;
};

export const createService = async (
  data
) => {

  const res = await API.post(
    "services/",
    data
  );

  return res.data;
};

// ============================
// 📦 ORDERS
// ============================

export const getOrders = async () => {
  const res = await API.get("orders/");
  return res.data;
};

export const getOwnerOrders =
  async () => {

    const res = await API.get(
      "owner/orders/"
    );

    return res.data;
  };

export const createOrder = async (
  data
) => {

  const res = await API.post(
    "orders/",
    data
  );

  return res.data;
};

export const updateOrderStatus =
  async (id, status) => {

    const res = await API.put(
      `orders/${id}/status/`,
      {
        status,
      }
    );

    return res.data;
  };

// ============================
// ⭐ FEATURED SHOPS
// ============================

export const getFeaturedShops =
  async () => {

    const res = await API.get(
      "featured-shops/"
    );

    return res.data;
  };

export default API;




// import axios from "axios";


// // ============================
// // BASE API
// // ============================
// const API = axios.create({
//   baseURL: `${import.meta.env.VITE_API_URL}/api/`,
// });

// // ============================
// // 🔐 REQUEST INTERCEPTOR (ATTACH ACCESS TOKEN)
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
// // 🔁 RESPONSE INTERCEPTOR (AUTO REFRESH TOKEN)
// // ============================
// API.interceptors.response.use(
//   (response) => response,

//   async (error) => {
//     const originalRequest = error.config;

//     if (
//       error.response?.status === 401 &&
//       !originalRequest._retry
//     ) {
//       originalRequest._retry = true;

//       try {
//         const refresh = localStorage.getItem("refresh");

//         if (!refresh) {
//           return Promise.reject(error);
//         }

//         const res = await axios.post(
//           `${import.meta.env.VITE_API_URL}/api/token/refresh/`,
//           { refresh }
//         );

//         const newAccess = res.data.access;

//         localStorage.setItem("access", newAccess);

//         // update headers
//         API.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
//         originalRequest.headers.Authorization = `Bearer ${newAccess}`;

//         return API(originalRequest);
//       } catch (err) {
//         // refresh failed → logout user
//         localStorage.removeItem("access");
//         localStorage.removeItem("refresh");
//         localStorage.removeItem("user");

//         window.location.href = "/login";

//         return Promise.reject(err);
//       }
//     }

//     return Promise.reject(error);
//   }
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

// export const deleteShop = async (id) => {
//   const res = await API.delete(`shops/${id}/`);
//   return res.data;
// };

// export const updateShop = async (id, data) => {
//   const res = await API.put(`shops/${id}/`, data);
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

// export const createOrder = async (data) => {
//   const res = await API.post("orders/", data);
//   return res.data;
// };

// export const updateOrderStatus = async (id, status) => {
//   const res = await API.put(`orders/${id}/status/`, {
//     status,
//   });

//   return res.data;
// };

// // ============================
// // ⭐ FEATURED SHOPS
// // ============================

// export const getFeaturedShops = async () => {
//   const res = await API.get("featured-shops/");
//   return res.data;
// };

// export default API;




