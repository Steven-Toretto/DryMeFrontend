import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api";

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
          aria-label="Register form"
        >

          {/* Card header */}
          <div className="px-8 pt-8 pb-6 border-b border-gray-100">
            <h2 className="text-2xl font-black text-gray-900">Create your account</h2>
            <p className="text-gray-500 text-sm mt-1">Join DryMe — book pickups, manage orders</p>
          </div>

          <div className="px-8 py-6">

            {/* Error */}
            {error && (
              <div role="alert" className="mb-5 flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <span className="text-red-500 mt-0.5">⚠</span>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div role="status" className="mb-5 flex items-start gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                <span className="text-green-500 mt-0.5">✓</span>
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}

            {/* Account type — segmented control */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: "customer" })}
                  className={`flex flex-col cursor-pointer items-center gap-1 py-3 rounded-lg text-sm font-semibold transition ${
                    form.role === "customer"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500"
                  }`}
                >
                  <span className="text-base">👕</span>
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: "owner" })}
                  className={`flex flex-col cursor-pointer items-center gap-1 py-3 rounded-lg text-sm font-semibold transition ${
                    form.role === "owner"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500"
                  }`}
                >
                  <span className="text-base">🏪</span>
                  Shop Owner
                </button>
              </div>
            </div>

            {/* Username */}
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-1.5">
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
                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition"
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
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
                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition"
              />
            </div>

            {/* Phone + Location side by side */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  placeholder="2547XXXXXXXX"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition"
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Location
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="Kileleshwa"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
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

            {/* Confirm Password */}
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1.5">
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
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 pr-16 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-blue-500 font-medium transition"
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
              className={`w-full py-3.5 cursor-pointer rounded-xl text-white font-bold text-sm transition shadow-lg ${
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
                  Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </button>

            {/* Footer link */}
            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                Sign in
              </Link>
            </p>

          </div>
        </form>

        <p className="text-center text-blue-100/60 text-xs mt-6">
          © 2026 DryMe · Kenya's laundry marketplace
        </p>

      </div>
    </div>
  );
}

export default Register;



// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { registerUser } from "../api"; //  named export

// function Register() {
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     username: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     role: "customer",
//     phone: "",
//   });

//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");

//     if (form.password !== form.confirmPassword) {
//       setError("Passwords do not match");
//       return;
//     }

//     setLoading(true);

//     try {
//       await registerUser({
//         username: form.username,
//         email: form.email,
//         password: form.password,
//         role: form.role,
//         phone: form.phone,
//         location: form.location,
//       });

//       setSuccess("Account created successfully! Redirecting to login...");
//       setTimeout(() => navigate("/login"), 1000);
//     } catch (err) {
//       console.error(err);
//       if (err.response?.data) {
//         const data = err.response.data;
//         if (data.username) setError(data.username[0]);
//         else if (data.email) setError(data.email[0]);
//         else if (data.password) setError(data.password[0]);
//         else if (data.role) setError(data.role[0]);
//         else setError("Registration failed. Try again.");
//       } else {
//         setError("Server error. Try again later.");
//       }
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="min-h-[75vh] flex items-center justify-center bg-gray-300 px-4 py-12">
//       <form
//         onSubmit={handleSubmit}
//         className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden ring-1 ring-gray-100"
//         aria-label="Register form"
//       >
//         {/* Header */}
//         <div className="px-6 py-6 bg-gradient-to-r from-blue-600 to-blue-500">
//           <h2 className="text-2xl md:text-3xl font-extrabold text-white text-center">
//             Create your account
//           </h2>
//           <p className="text-sm text-blue-100 text-center mt-1">
//             Join DryMe — manage bookings and get laundry delivered.
//           </p>
//         </div>

//         <div className="p-6">
//           {/* Alerts */}
//           {error && (
//             <div
//               role="alert"
//               className="mb-4 rounded-md bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm"
//             >
//               {error}
//             </div>
//           )}

//           {success && (
//             <div
//               role="status"
//               className="mb-4 rounded-md bg-green-50 border border-green-100 text-green-700 px-4 py-3 text-sm"
//             >
//               {success}
//             </div>
//           )}

//           {/* Username */}
//           <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
//             Username
//           </label>
//           <input
//             id="username"
//             name="username"
//             type="text"
//             placeholder="Enter a username"
//             className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
//             onChange={(e) => setForm({ ...form, username: e.target.value })}
//             required
//             autoComplete="username"
//             aria-required="true"
//           />

//           {/* Email */}
//           <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//             Email Address
//           </label>
//           <input
//             id="email"
//             name="email"
//             type="email"
//             placeholder="you@example.com"
//             className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
//             onChange={(e) => setForm({ ...form, email: e.target.value })}
//             required
//             autoComplete="email"
//             aria-required="true"
//           />

//           {/* Phone */}
//           <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
//             Phone Number
//           </label>
//           <input
//             id="phone"
//             name="phone"
//             type="text"
//             placeholder="2547XXXXXXXX"
//             className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
//             onChange={(e) => setForm({ ...form, phone: e.target.value })}
//           />

//           {/* Location */}
//           <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
//             Location
//           </label>
//           <input
//             id="location"
//             name="location"
//             type="text"
//             placeholder="e.g. Kileleshwa, Nairobi"
//             className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
//             onChange={(e) => setForm({ ...form, location: e.target.value })}
//           />

//           {/* Password */}
//           <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//             Password
//           </label>
//           <input
//             id="password"
//             name="password"
//             type="password"
//             placeholder="Create a password"
//             className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
//             onChange={(e) => setForm({ ...form, password: e.target.value })}
//             required
//             autoComplete="new-password"
//             aria-required="true"
//           />

//           {/* Confirm Password */}
//           <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
//             Confirm Password
//           </label>
//           <input
//             id="confirmPassword"
//             name="confirmPassword"
//             type="password"
//             placeholder="Repeat your password"
//             className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
//             onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
//             required
//             autoComplete="new-password"
//             aria-required="true"
//           />

//           {/* Role */}
//           <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
//             Account type
//           </label>
//           <select
//             id="role"
//             className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
//             onChange={(e) => setForm({ ...form, role: e.target.value })}
//             value={form.role}
//           >
//             <option value="customer">Customer</option>
//             <option value="owner">Laundry Owner</option>
//           </select>

//           {/* Submit */}
//           <button
//             disabled={loading}
//             className={`w-full inline-flex items-center justify-center gap-2 ${
//               loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
//             } text-white font-semibold px-4 py-3 rounded-lg transition`}
//             aria-disabled={loading}
//           >
//             {loading ? "Creating account..." : "Register"}
//           </button>

//           {/* Footer links */}
//           <div className="mt-6 text-center text-sm text-gray-600">
//             <p>
//               Already have an account?{" "}
//               <Link to="/login" className="text-blue-600 hover:underline">
//                 Login
//               </Link>
//             </p>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// }

// export default Register;


