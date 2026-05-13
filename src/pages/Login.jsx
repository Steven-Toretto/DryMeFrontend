

import { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser as loginUserAPI } from "../api";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { loginUser, user, token } = useContext(AuthContext);

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ AUTO REDIRECT (FROM CONTEXT, NOT localStorage)
  useEffect(() => {
    if (token && user) {
      if (user.role === "owner") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/shops", { replace: true });
      }
    }
  }, [token, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // 🔥 CALL API
      const res = await loginUserAPI(form.username, form.password);

      // 🔥 SAVE TO CONTEXT (this already saves to localStorage)
      loginUser(res);

      setSuccess("Login successful! Redirecting...");

      // ✅ REDIRECT BASED ON ROLE
      setTimeout(() => {
        if (res.role === "owner") {
          navigate("/dashboard");
        } else {
          navigate("/shops");
        }
      }, 500);

    } catch (err) {
      console.error(err);

      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Login failed. Please try again.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-gray-300 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-6 bg-gradient-to-r from-blue-600 to-blue-500">
          <h2 className="text-2xl font-extrabold text-white text-center">
            Welcome Back to DryMe
          </h2>
          <p className="text-sm text-blue-100 text-center mt-1">
            Sign in to manage bookings and orders
          </p>
        </div>

        <div className="p-6">
          {/* ERROR */}
          {error && (
            <div className="mb-4 rounded-md bg-red-50 text-red-600 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div className="mb-4 rounded-md bg-green-50 text-green-600 px-4 py-3 text-sm">
              {success}
            </div>
          )}

          {/* Username */}
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <input
            type="text"
            placeholder="Username"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={form.username}
            onChange={(e) =>
              setForm({ ...form, username: e.target.value })
            }
            required
          />

          {/* Password */}
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            required
          />

          {/* Button */}
          <button
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Links */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Don’t have an account?{" "}
              <Link to="/register" className="text-blue-600 hover:underline">
                Register
              </Link>
            </p>
            <p className="mt-2">
              <Link
                to="/forgot-password"
                className="text-gray-500 hover:underline text-xs"
              >
                Forgot password?
              </Link>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Login;






