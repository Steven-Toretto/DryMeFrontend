
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ AUTO REDIRECT IF ALREADY LOGGED IN
  useEffect(() => {
    const token = localStorage.getItem("access");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user) {
      if (user.role === "owner") {
        navigate("/dashboard");
      } else {
        navigate("/shops");
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await loginUser(form.username, form.password);

      // ✅ STORE TOKENS
      localStorage.setItem("access", res.access);
      localStorage.setItem("refresh", res.refresh);

      // ✅ STORE USER
      const userData = {
        username: res.username || form.username,
        role: res.role || "customer",
        profile_image: res.profile_image || null,
      };

      localStorage.setItem("user", JSON.stringify(userData));

      if (res.phone) {
        localStorage.setItem("phone", res.phone);
      }

      setSuccess("Login successful! Redirecting...");

      // ✅ CLEAN REDIRECT (NO BUGS)
      setTimeout(() => {
        if (userData.role === "owner") {
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





// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { loginUser } from "../api";

// function Login() {
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     username: "",
//     password: "",
//   });

//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     setSuccess("");

//     try {
//       const res = await loginUser(form.username, form.password);

//       // ✅ STORE TOKENS PROPERLY
//       localStorage.setItem("access", res.access);
//       localStorage.setItem("refresh", res.refresh);

//       // ✅ STORE ROLE (VERY IMPORTANT)
//       localStorage.setItem("role", res.role);

//       // 🔥 ADD THIS (PHONE STORAGE)
//       if (res.phone) {
//         localStorage.setItem("phone", res.phone);
//       }

//       setSuccess("Login successful! Redirecting...");

//       // 🔥 ROLE-BASED REDIRECT
//       setTimeout(() => {
//         if (res.role === "owner") {
//           navigate("/dashboard");
//         } else {
//           navigate("/shops");
//         }
//       }, 1000);

//     } catch (err) {
//       console.error(err);

//       if (err.response?.data?.error) {
//         setError(err.response.data.error);
//       } else {
//         setError("Login failed. Please try again.");
//       }
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="min-h-[75vh] flex items-center justify-center bg-gray-300 px-4">
//       <form
//         onSubmit={handleSubmit}
//         className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden"
//         aria-label="Login form"
//       >
//         {/* Header */}
//         <div className="px-6 py-6 bg-gradient-to-r from-blue-600 to-blue-500">
//           <h2 className="text-2xl md:text-3xl font-extrabold text-white text-center">
//             Welcome Back to DryMe
//           </h2>
//           <p className="text-sm text-blue-100 text-center mt-1">
//             Sign in to manage bookings and orders
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
//             placeholder="Username"
//             className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
//             value={form.username}
//             onChange={(e) =>
//               setForm({ ...form, username: e.target.value })
//             }
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
//             placeholder="Password"
//             className="w-full border border-gray-200  rounded-lg px-4 py-3 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
//             value={form.password}
//             onChange={(e) =>
//               setForm({ ...form, password: e.target.value })
//             }
//             required
//             autoComplete="current-password"
//             aria-required="true"
//           />

//           {/* Actions */}
//           <div className="flex items-center justify-between gap-4">
//             <button
//               disabled={loading}
//               className={`flex-1 inline-flex items-center justify-center gap-2 ${
//                 loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
//               } text-white font-semibold px-4 py-3 rounded-lg transition`}
//               aria-disabled={loading}
//             >
//               {loading ? "Logging in..." : "Login"}
//             </button>
//           </div>

//           {/* Footer links */}
//           <div className="mt-6 text-center text-sm text-gray-600">
//             <p>
//               Don’t have an account?{" "}
//               <Link to="/register" className="text-blue-600 hover:underline">
//                 Register
//               </Link>
//             </p>
//             <p className="mt-2">
//               <Link to="/forgot-password" className="text-gray-500 hover:underline text-xs">
//                 Forgot password?
//               </Link>
//             </p>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// }

// export default Login;