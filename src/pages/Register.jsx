import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api"; //  named export

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer",
    phone: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-[75vh] flex items-center justify-center bg-gray-300 px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden ring-1 ring-gray-100"
        aria-label="Register form"
      >
        {/* Header */}
        <div className="px-6 py-6 bg-gradient-to-r from-blue-600 to-blue-500">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white text-center">
            Create your account
          </h2>
          <p className="text-sm text-blue-100 text-center mt-1">
            Join DryMe — manage bookings and get laundry delivered.
          </p>
        </div>

        <div className="p-6">
          {/* Alerts */}
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-md bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mb-4 rounded-md bg-green-50 border border-green-100 text-green-700 px-4 py-3 text-sm"
            >
              {success}
            </div>
          )}

          {/* Username */}
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Enter a username"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
            autoComplete="username"
            aria-required="true"
          />

          {/* Email */}
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            autoComplete="email"
            aria-required="true"
          />

          {/* Phone */}
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="text"
            placeholder="2547XXXXXXXX"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          {/* Location */}
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            placeholder="e.g. Kileleshwa, Nairobi"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />

          {/* Password */}
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Create a password"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            autoComplete="new-password"
            aria-required="true"
          />

          {/* Confirm Password */}
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Repeat your password"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            required
            autoComplete="new-password"
            aria-required="true"
          />

          {/* Role */}
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
            Account type
          </label>
          <select
            id="role"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            value={form.role}
          >
            <option value="customer">Customer</option>
            <option value="owner">Laundry Owner</option>
          </select>

          {/* Submit */}
          <button
            disabled={loading}
            className={`w-full inline-flex items-center justify-center gap-2 ${
              loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            } text-white font-semibold px-4 py-3 rounded-lg transition`}
            aria-disabled={loading}
          >
            {loading ? "Creating account..." : "Register"}
          </button>

          {/* Footer links */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </form>
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
//     password: "",
//     confirmPassword: "",
//     role: "customer",
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
//         password: form.password,
//         role: form.role,
//       });

//       setSuccess("Account created successfully! Redirecting to login...");
//       setTimeout(() => navigate("/login"), 1000);
//     } catch (err) {
//       console.error(err);
//       if (err.response?.data) {
//         const data = err.response.data;
//         if (data.username) setError(data.username[0]);
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
//             placeholder="Choose a username"
//             className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
//             onChange={(e) => setForm({ ...form, username: e.target.value })}
//             required
//             autoComplete="username"
//             aria-required="true"
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
//             <option value="owner">Shop Owner</option>
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