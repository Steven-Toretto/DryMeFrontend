import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {

  // =========================
  // 🔐 TOKEN
  // =========================
  const [token, setToken] = useState(
    localStorage.getItem("access") || null
  );

  // =========================
  // 👤 USER
  // =========================
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");

      return storedUser
        ? JSON.parse(storedUser)
        : null;

    } catch (error) {
      console.error("User parse error:", error);
      return null;
    }
  });

  // =========================
  // ✅ LOGIN
  // =========================
  const loginUser = (data) => {

    // Ensure required fields exist
    if (!data?.access || !data?.refresh) {
      console.error("Invalid login response:", data);
      return;
    }

    // Save tokens
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);

    // Build user object
    const userData = {
      id: data.id,
      email: data.email,
      username: data.username,
      role: data.role,
      profile_image: data.profile_image || null,
    };

    // Save user
    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    // Update state
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
  // 🔄 SYNC ON PAGE REFRESH
  // =========================
  useEffect(() => {

    const storedToken = localStorage.getItem("access");

    try {
      const storedUser = JSON.parse(
        localStorage.getItem("user")
      );

      if (storedToken) {
        setToken(storedToken);
      }

      if (storedUser) {
        setUser(storedUser);
      }

    } catch (error) {
      console.error("Stored user parse error:", error);

      localStorage.removeItem("user");
    }

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