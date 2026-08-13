import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api";
import { Shirt, Store, AlertTriangle, CheckCircle2 } from "lucide-react";

const PAPER = "#F1EAD8";
const CARD = "#FBF8EF";
const INK = "#2B2A25";
const TICKET_FONT = "'Special Elite', 'Courier New', monospace";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer",
    phone: "",
    location: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone,
        location: form.location,
      });
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        const data = err.response.data;
        if (data.username) setError(data.username[0]);
        else if (data.email) setError(data.email[0]);
        else if (data.password) setError(data.password[0]);
        else if (data.role) setError(data.role[0]);
        else setError("Registration failed. Try again.");
      } else {
        setError("Server error. Try again later.");
      }
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
          aria-label="Register form"
        >
          {/* punch hole */}
          <div className="absolute -top-2.5 left-8 w-4 h-4 rounded-full border" style={{ background: PAPER, borderColor: `${INK}25` }} />

          {/* HEADER */}
          <div className="px-8 pt-9 pb-6 border-b border-dashed" style={{ borderColor: `${INK}20` }}>
            <p className="text-[10px] tracking-[0.25em] mb-1.5" style={{ fontFamily: TICKET_FONT, color: `${INK}66` }}>
              NEW MEMBER SIGN-UP
            </p>
            <h2 className="text-2xl font-bold" style={{ color: INK }}>Create your account</h2>
            <p className="text-sm mt-1" style={{ color: `${INK}80` }}>Join DryMe — book pickups, manage orders</p>
          </div>

          <div className="px-8 py-6">

            {/* Error */}
            {error && (
              <div role="alert" className="mb-5 flex items-start gap-2.5 p-3.5 border rounded-sm" style={{ borderColor: "#9C3B2E40", background: "#9C3B2E0D" }}>
                <AlertTriangle size={15} className="mt-0.5 shrink-0" style={{ color: "#9C3B2E" }} />
                <p className="text-sm" style={{ color: "#9C3B2E" }}>{error}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div role="status" className="mb-5 flex items-start gap-2.5 p-3.5 border rounded-sm" style={{ borderColor: "#3F6B4740", background: "#3F6B470D" }}>
                <CheckCircle2 size={15} className="mt-0.5 shrink-0" style={{ color: "#3F6B47" }} />
                <p className="text-sm" style={{ color: "#3F6B47" }}>{success}</p>
              </div>
            )}

            {/* Account type — ticket-stamp toggle */}
            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ fontFamily: TICKET_FONT, color: `${INK}80` }}>
                I am a
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: "customer" })}
                  className="flex flex-col cursor-pointer items-center gap-1.5 py-3 rounded-sm border-2 text-sm font-bold transition"
                  style={
                    form.role === "customer"
                      ? { borderColor: "#35548C", color: "#35548C", background: "#35548C0D" }
                      : { borderColor: `${INK}20`, color: `${INK}70` }
                  }
                >
                  <Shirt size={18} />
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: "owner" })}
                  className="flex flex-col cursor-pointer items-center gap-1.5 py-3 rounded-sm border-2 text-sm font-bold transition"
                  style={
                    form.role === "owner"
                      ? { borderColor: "#35548C", color: "#35548C", background: "#35548C0D" }
                      : { borderColor: `${INK}20`, color: `${INK}70` }
                  }
                >
                  <Store size={18} />
                  Shop Owner
                </button>
              </div>
            </div>

            {/* Username */}
            <div className="mb-4">
              <label htmlFor="username" className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ fontFamily: TICKET_FONT, color: `${INK}80` }}>
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Enter a username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                autoComplete="username"
                aria-required="true"
                className="w-full border rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 transition"
                style={{ borderColor: `${INK}25`, background: PAPER, color: INK }}
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ fontFamily: TICKET_FONT, color: `${INK}80` }}>
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
                aria-required="true"
                className="w-full border rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 transition"
                style={{ borderColor: `${INK}25`, background: PAPER, color: INK }}
              />
            </div>

            {/* Phone + Location side by side */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ fontFamily: TICKET_FONT, color: `${INK}80` }}>
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  placeholder="2547XXXXXXXX"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 transition"
                  style={{ borderColor: `${INK}25`, background: PAPER, color: INK }}
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ fontFamily: TICKET_FONT, color: `${INK}80` }}>
                  Location
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="Your location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full border rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 transition"
                  style={{ borderColor: `${INK}25`, background: PAPER, color: INK }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ fontFamily: TICKET_FONT, color: `${INK}80` }}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="new-password"
                  aria-required="true"
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

            {/* Confirm Password */}
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ fontFamily: TICKET_FONT, color: `${INK}80` }}>
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  autoComplete="new-password"
                  aria-required="true"
                  className="w-full border rounded-sm px-4 py-3 pr-16 text-sm focus:outline-none focus:ring-2 transition"
                  style={{ borderColor: `${INK}25`, background: PAPER, color: INK }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold transition"
                  style={{ color: "#35548C" }}
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              aria-disabled={loading}
              className="w-full py-3.5 cursor-pointer rounded-sm text-white font-bold text-sm transition disabled:opacity-60"
              style={{ background: "#35548C" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </button>

            {/* Footer link */}
            <p className="text-center text-sm mt-6" style={{ color: `${INK}80` }}>
              Already have an account?{" "}
              <Link to="/login" className="font-bold hover:underline" style={{ color: "#35548C" }}>
                Sign in
              </Link>
            </p>

          </div>
        </form>

        <p className="text-center text-xs mt-6" style={{ fontFamily: TICKET_FONT, color: `${INK}55` }}>
          © 2026 DryMe · Kenya's laundry marketplace
        </p>

      </div>
    </div>
  );
}

export default Register;