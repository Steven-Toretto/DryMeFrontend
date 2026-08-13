import { useState, useEffect, useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { loginUser as loginUserAPI, getOrders } from "../api";
import { AuthContext } from "../context/AuthContext";
import { Shirt, Store, AlertTriangle, CheckCircle2 } from "lucide-react";

const PAPER = "#F1EAD8";
const CARD = "#FBF8EF";
const INK = "#2B2A25";
const TICKET_FONT = "'Special Elite', 'Courier New', monospace";

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
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: PAPER,
        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)",
        backgroundSize: "16px 16px",
      }}
    >
      <div className="w-full max-w-md">

        {/* BRAND */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-full border-2 flex items-center justify-center mb-3" style={{ borderColor: INK, background: CARD }}>
            <Shirt size={26} style={{ color: INK }} strokeWidth={1.75} />
          </div>
          <h1 className="font-black text-3xl tracking-tight" style={{ color: INK }}>DryMe</h1>
          <p className="text-sm mt-1" style={{ fontFamily: TICKET_FONT, color: `${INK}80` }}>Kenya's laundry marketplace</p>
        </div>

        {/* TICKET CARD */}
        <form
          onSubmit={handleSubmit}
          className="relative rounded-sm border overflow-hidden"
          style={{ background: CARD, borderColor: `${INK}1F`, boxShadow: `0 1px 0 ${INK}0A` }}
        >
          {/* punch hole */}
          <div className="absolute -top-2.5 left-8 w-4 h-4 rounded-full border" style={{ background: PAPER, borderColor: `${INK}25` }} />

          {/* HEADER */}
          <div className="px-8 pt-9 pb-6 border-b border-dashed" style={{ borderColor: `${INK}20` }}>
            <p className="text-[10px] tracking-[0.25em] mb-1.5" style={{ fontFamily: TICKET_FONT, color: `${INK}66` }}>
              MEMBER ACCESS
            </p>
            <h2 className="text-2xl font-bold" style={{ color: INK }}>Welcome back</h2>
            <p className="text-sm mt-1" style={{ color: `${INK}80` }}>Sign in to your account</p>
          </div>

          <div className="px-8 py-6">

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-start gap-2.5 p-3.5 border rounded-sm" style={{ borderColor: "#9C3B2E40", background: "#9C3B2E0D" }}>
                <AlertTriangle size={15} className="mt-0.5 shrink-0" style={{ color: "#9C3B2E" }} />
                <p className="text-sm" style={{ color: "#9C3B2E" }}>{error}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mb-5 flex items-start gap-2.5 p-3.5 border rounded-sm" style={{ borderColor: "#3F6B4740", background: "#3F6B470D" }}>
                <CheckCircle2 size={15} className="mt-0.5 shrink-0" style={{ color: "#3F6B47" }} />
                <p className="text-sm" style={{ color: "#3F6B47" }}>{success}</p>
              </div>
            )}

            <div className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ fontFamily: TICKET_FONT, color: `${INK}80` }}>
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                  className="w-full border rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 transition"
                  style={{ borderColor: `${INK}25`, background: PAPER, color: INK }}
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wide" style={{ fontFamily: TICKET_FONT, color: `${INK}80` }}>
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs hover:underline transition"
                    style={{ color: "#35548C" }}
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
                    className="w-full border rounded-sm px-4 py-3 pr-16 text-sm focus:outline-none focus:ring-2 transition"
                    style={{ borderColor: `${INK}25`, background: PAPER, color: INK }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold transition"
                    style={{ color: "#35548C" }}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-sm text-white font-bold text-sm transition disabled:opacity-60"
                style={{ background: "#35548C" }}
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
              <div className="flex-1 border-t border-dashed" style={{ borderColor: `${INK}25` }} />
              <span className="text-xs" style={{ fontFamily: TICKET_FONT, color: `${INK}60` }}>New to DryMe?</span>
              <div className="flex-1 border-t border-dashed" style={{ borderColor: `${INK}25` }} />
            </div>

            {/* Register */}
            <Link
              to="/register"
              className="w-full flex items-center justify-center py-3 rounded-sm border-2 font-bold text-sm transition"
              style={{ borderColor: "#35548C40", color: "#35548C" }}
            >
              Create an account
            </Link>

          </div>

          {/* Role hints */}
          <div className="grid grid-cols-2 border-t border-dashed" style={{ borderColor: `${INK}20` }}>
            <div className="px-6 py-4 text-center border-r border-dashed" style={{ borderColor: `${INK}20` }}>
              <Store size={18} className="mx-auto mb-1.5" style={{ color: `${INK}80` }} />
              <p className="text-xs font-bold" style={{ color: INK }}>Shop Owner</p>
              <p className="text-xs mt-0.5" style={{ color: `${INK}60` }}>Manage your business</p>
            </div>
            <div className="px-6 py-4 text-center">
              <Shirt size={18} className="mx-auto mb-1.5" style={{ color: `${INK}80` }} />
              <p className="text-xs font-bold" style={{ color: INK }}>Customer</p>
              <p className="text-xs mt-0.5" style={{ color: `${INK}60` }}>Book & track laundry</p>
            </div>
          </div>

        </form>

        <p className="text-center text-xs mt-6" style={{ fontFamily: TICKET_FONT, color: `${INK}55` }}>
          © 2026 DryMe · Kenya's laundry marketplace
        </p>

      </div>
    </div>
  );
}

export default Login;