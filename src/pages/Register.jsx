import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api";
import { AlertTriangle, CheckCircle2, Shirt, Store } from "lucide-react";
import { Logo, btn, card, field, fieldLabel, textLink } from "../components/ui";


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

  const roleCard = (value, Icon, title, text) => (
    <button
      type="button"
      onClick={() => setForm({ ...form, role: value })}
      aria-pressed={form.role === value}
      className={`text-left p-4 rounded-xl border-2 transition ${
        form.role === value ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-blue-300"
      }`}
    >
      <Icon size={20} className={form.role === value ? "text-blue-600" : "text-slate-400"} />
      <span className="block font-bold text-slate-900 mt-2">{title}</span>
      <span className="block text-xs text-slate-500 mt-0.5 leading-snug">{text}</span>
    </button>
  );

  const passwordField = (id, label, value, onChange, shown, toggle, placeholder) => (
    <div>
      <label htmlFor={id} className={fieldLabel}>{label}</label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={shown ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
          autoComplete="new-password"
          className={`${field} pr-20`}
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
        >
          {shown ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-blue-50 px-4 py-12 sm:py-16">
      <div className="w-full max-w-md mx-auto">

        <div className="flex flex-col items-center text-center mb-8">
          <Logo />
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-6">Create your account</h1>
          <p className="text-slate-600 mt-1.5">Book pickups and track orders, or list your laundry.</p>
        </div>

        <form onSubmit={handleSubmit} className={`${card} p-6 sm:p-8`} aria-label="Register form">

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

          <fieldset className="mb-5">
            <legend className={fieldLabel}>I am a</legend>
            <div className="grid grid-cols-2 gap-3">
              {roleCard("customer", Shirt, "Customer", "I want my laundry done")}
              {roleCard("owner", Store, "Shop owner", "I run a laundry")}
            </div>
          </fieldset>

          <div className="space-y-5">
            <div>
              <label htmlFor="username" className={fieldLabel}>Username</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Enter a username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                autoComplete="username"
                className={field}
              />
            </div>

            <div>
              <label htmlFor="email" className={fieldLabel}>Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
                className={field}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="phone" className={fieldLabel}>Phone</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="0712 345 678"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={field}
                />
              </div>
              <div>
                <label htmlFor="location" className={fieldLabel}>Location</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="e.g. Kilimani"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className={field}
                />
              </div>
            </div>

            {passwordField(
              "password", "Password", form.password,
              (e) => setForm({ ...form, password: e.target.value }),
              showPassword, () => setShowPassword(!showPassword), "Create a password",
            )}

            {passwordField(
              "confirmPassword", "Confirm password", form.confirmPassword,
              (e) => setForm({ ...form, confirmPassword: e.target.value }),
              showConfirm, () => setShowConfirm(!showConfirm), "Repeat your password",
            )}

            <button type="submit" disabled={loading} aria-disabled={loading} className={`${btn.primary} w-full`}>
              {loading ? "Creating account…" : "Create account"}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6">
          Already have an account?{" "}
          <Link to="/login" className={textLink}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;