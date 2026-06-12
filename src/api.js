import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL?.trim();

if (!BASE_URL) {
  console.error(
    "VITE_API_URL is missing. Check Vercel Environment Variables."
  );
}

const API = axios.create({
  baseURL: `${BASE_URL}/api/`,
});

// ===============================
// 🔐 JWT INTERCEPTORS
// ===============================
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

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const refresh = localStorage.getItem("refresh");
        if (!refresh) throw error;

        const response = await axios.post(
          `${BASE_URL}/api/token/refresh/`,
          { refresh }
        );

        const newAccess = response.data.access;
        localStorage.setItem("access", newAccess);
        API.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;

        return API(originalRequest);
      } catch (refreshError) {
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

// ===============================
// 🔐 AUTH
// ===============================
export const registerUser = async (data) => {
  const res = await API.post("register/", data);
  return res.data;
};

export const loginUser = async (email, password) => {
  const res = await API.post("login/", { email, password });
  return res.data;
};

// ===============================
// 🏪 SHOPS
// ===============================
export const getShops = async (page = 1) => {
  const res = await API.get(`shops/?page=${page}`);
  return res.data;
};

export const getShop = async (id) => {
  const res = await API.get(`shops/${id}/`);
  return res.data;
};

export const createShop = async (data) => {
  const res = await API.post("shops/", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateShop = async (id, data) => {
  const res = await API.patch(`shops/${id}/`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteShop = async (id) => {
  const res = await API.delete(`shops/${id}/`);
  return res.data;
};

export const getFeaturedShops = async () => {
  const res = await API.get("featured-shops/");
  return res.data;
};

// ===============================
// 🧺 SERVICES
// ===============================
export const getServices = async (shopId = null, page = 1) => {
  let url = `services/?page=${page}`;
  if (shopId) url += `&shop=${shopId}`;
  const res = await API.get(url);
  return res.data;
};

export const createService = async (data) => {
  const res = await API.post("services/", data);
  return res.data;
};

export const updateService = async (id, data) => {
  const res = await API.patch(`services/${id}/`, data);
  return res.data;
};

export const deleteService = async (id) => {
  const res = await API.delete(`services/${id}/`);
  return res.data;
};

// ===============================
// 📦 ORDERS
// ===============================
export const getOrders = async (page = 1) => {
  const res = await API.get(`orders/?page=${page}`);
  return res.data;
};

export const getOwnerOrders = async (page = 1) => {
  const res = await API.get(`owner/orders/?page=${page}`);
  return res.data;
};

export const getArchivedOrders = async (page = 1) => {
  const res = await API.get(`orders/archived/?page=${page}`);
  return res.data;
};

export const getArchivedOwnerOrders = async (page = 1) => {
  const res = await API.get(`owner/orders/archived/?page=${page}`);
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

export const archiveOrder = async (id) => {
  const res = await API.put(`orders/${id}/archive/`);
  return res.data;
};

// ===============================
// 💳 MPESA
// ===============================
export const initiatePayment = async (orderId) => {
  const res = await API.post(`orders/${orderId}/pay/`);
  return res.data;
};

export const checkPaymentStatus = async (orderId) => {
  const res = await API.get(`orders/${orderId}/payment-status/`);
  return res.data;
};

export default API;