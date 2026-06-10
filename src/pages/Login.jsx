import { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser as loginUserAPI, getOrders } from "../api";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();

  const { loginUser, user, token } = useContext(AuthContext);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Auto redirect if already logged in
  useEffect(() => {
    const handleRedirect = async () => {
      if (token && user) {

        // OWNER → DASHBOARD
        if (user.role === "owner") {
          navigate("/dashboard", { replace: true });
          return;
        }

        // CUSTOMER → CHECK ORDERS
        try {
          const orders = await getOrders();

          if (orders.length > 0) {
            navigate("/orders", { replace: true });
          } else {
            navigate("/shops", { replace: true });
          }

        } catch (err) {
          console.error("Order check failed:", err);

          // fallback
          navigate("/shops", { replace: true });
        }
      }
    };

    handleRedirect();

  }, [token, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // ✅ Login request
      const res = await loginUserAPI(
        form.email,
        form.password
      );

      console.log("LOGIN RESPONSE:", res);

      // ✅ Save auth data
      loginUser(res);

      setSuccess("Login successful! Redirecting...");

      // =========================
      // OWNER REDIRECT
      // =========================
      if (res.role === "owner") {

        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);

      } else {

        // =========================
        // CUSTOMER REDIRECT LOGIC
        // =========================
        try {
          const orders = await getOrders();

          setTimeout(() => {

            // If customer already ordered before
            if (orders.length > 0) {
              navigate("/orders");

            } else {
              // First time customer
              navigate("/shops");
            }

          }, 1000);

        } catch (err) {

          console.error("Orders fetch error:", err);

          // fallback
          setTimeout(() => {
            navigate("/shops");
          }, 1000);
        }
      }

    } catch (err) {

      console.error("LOGIN ERROR:", err);

      // Better error handling
      if (err.response?.data?.error) {

        setError(err.response.data.error);

      } else if (err.response?.data?.detail) {

        setError(err.response.data.detail);

      } else if (err.message) {

        setError(err.message);

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

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-md bg-red-50 text-red-600 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-4 rounded-md bg-green-50 text-green-600 px-4 py-3 text-sm">
              {success}
            </div>
          )}

          {/* Email */}
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>

          <input
            type="email"
            placeholder="you@example.com"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            required
            autoComplete="email"
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
              setForm({
                ...form,
                password: e.target.value,
              })
            }
            required
          />

          {/* Button */}
          <button
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition ${
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
              <Link
                to="/register"
                className="text-blue-600 hover:underline"
              >
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

