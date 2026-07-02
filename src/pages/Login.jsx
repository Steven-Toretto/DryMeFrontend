import { useState, useEffect, useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { loginUser as loginUserAPI, getOrders } from "../api";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || null;

  const { loginUser, user, token } = useContext(AuthContext);

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Auto redirect if already logged in
  useEffect(() => {
    const handleRedirect = async () => {
      if (token && user) {
        if (user.role === "owner") {
          navigate("/dashboard", { replace: true });
          return;
        }
        try {
          const data = await getOrders();
          const orders = data.results ?? data;
          navigate(orders.length > 0 ? "/orders" : "/shops", { replace: true });
        } catch (err) {
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
      const res = await loginUserAPI(form.email, form.password);
      loginUser(res);
      setSuccess("Login successful! Redirecting...");

      if (res.role === "owner") {
        setTimeout(() => navigate("/dashboard"), 1000);
      } else if (from) {
        // ✅ Redirect back to the page they came from (e.g. shop booking)
        setTimeout(() => navigate(from, { replace: true }), 1000);
      } else {
        try {
          const ordersData = await getOrders();
          const orders = ordersData.results ?? ordersData;
          setTimeout(() => navigate(orders.length > 0 ? "/orders" : "/shops"), 1000);
        } catch {
          setTimeout(() => navigate("/shops"), 1000);
        }
      }
    } catch (err) {
      if (err.response?.data?.error) setError(err.response.data.error);
      else if (err.response?.data?.detail) setError(err.response.data.detail);
      else if (err.message) setError(err.message);
      else setError("Login failed. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 flex items-center justify-center px-4 py-12 relative overflow-hidden">

      {/* Background circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl mb-3">
            <span className="text-blue-600 font-black text-2xl">D</span>
          </div>
          <h1 className="text-white font-black text-3xl tracking-tight">DryMe</h1>
          <p className="text-blue-100/80 text-sm mt-1">Kenya's laundry marketplace</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >

          {/* Card header */}
          <div className="px-8 pt-8 pb-6 border-b border-gray-100">
            <h2 className="text-2xl font-black text-gray-900">Welcome back</h2>
            <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
          </div>

          <div className="px-8 py-6">

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <span className="text-red-500 mt-0.5">⚠</span>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mb-5 flex items-start gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                <span className="text-green-500 mt-0.5">✓</span>
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}

            <div className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-blue-500 hover:text-blue-700 transition"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    autoComplete="current-password"
                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 pr-16 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-blue-500 font-medium transition"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl text-white font-bold text-sm transition shadow-lg ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-blue-100"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>

            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 my-5">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">New to DryMe?</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Register */}
            <Link
              to="/register"
              className="w-full flex items-center justify-center py-3 rounded-xl border-2 border-blue-100 text-blue-600 font-semibold text-sm hover:bg-blue-50 transition"
            >
              Create an account
            </Link>

          </div>

          {/* Role hints */}
          <div className="grid grid-cols-2 border-t border-gray-100">
            <div className="px-6 py-4 text-center border-r border-gray-100">
              <p className="text-lg mb-1">🏪</p>
              <p className="text-xs font-semibold text-gray-700">Shop Owner</p>
              <p className="text-xs text-gray-400 mt-0.5">Manage your business</p>
            </div>
            <div className="px-6 py-4 text-center">
              <p className="text-lg mb-1">👕</p>
              <p className="text-xs font-semibold text-gray-700">Customer</p>
              <p className="text-xs text-gray-400 mt-0.5">Book & track laundry</p>
            </div>
          </div>

        </form>

        <p className="text-center text-blue-100/60 text-xs mt-6">
          © 2026 DryMe · Kenya's laundry marketplace
        </p>

      </div>
    </div>
  );
}

export default Login;


