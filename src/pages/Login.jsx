import { useState, useEffect, useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { loginUser as loginUserAPI, getOrders } from "../api";
import { AuthContext } from "../context/AuthContext";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Logo, btn, card, field, fieldLabel, textLink } from "../components/ui";


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
    <div className="bg-blue-50 px-4 py-12 sm:py-16">
      <div className="w-full max-w-md mx-auto">

        <div className="flex flex-col items-center text-center mb-8">
          <Logo />
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-6">Welcome back</h1>
          <p className="text-slate-600 mt-1.5">Sign in to book pickups and track your orders.</p>
        </div>

        <form onSubmit={handleSubmit} className={`${card} p-6 sm:p-8`}>

          {error && (
            <div role="alert" className="mb-5 flex items-start gap-2.5 p-3.5 border border-red-200 bg-red-50 rounded-lg">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div role="status" className="mb-5 flex items-start gap-2.5 p-3.5 border border-emerald-200 bg-emerald-50 rounded-lg">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
              <p className="text-sm text-emerald-700">{success}</p>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label htmlFor="email" className={fieldLabel}>Email address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
                className={field}
              />
            </div>

            <div>
              <label htmlFor="password" className={fieldLabel}>Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                  className={`${field} pr-20`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className={`${btn.primary} w-full`}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6">
          New to DryMe?{" "}
          <Link to="/register" className={textLink}>Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;