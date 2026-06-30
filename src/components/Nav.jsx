import React, { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, LogOut, Menu, X, ChevronDown } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

function Nav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, logoutUser } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const role = user?.role;

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
    setOpen(false);
    setMobileMenu(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `relative text-sm font-medium transition py-1 ${
      isActive(path)
        ? "text-blue-600"
        : "text-gray-600 hover:text-blue-600"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-black text-sm">D</span>
          </div>
          <span className="text-xl font-black tracking-tight">
            <span className="text-blue-700">Dry</span>
            <span className="text-blue-400">Me</span>
          </span>
        </Link>

        {/* ========================= */}
        {/* DESKTOP NAV */}
        {/* ========================= */}
        {role !== "owner" && (
          <div className="hidden md:flex items-center gap-7 ml-6">
            <Link to="/" className={navLinkClass("/")}>
              Home
              {isActive("/") && <span className="absolute -bottom-[14px] left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
            </Link>
            <Link to="/shops" className={navLinkClass("/shops")}>
              Shops
              {isActive("/shops") && <span className="absolute -bottom-[14px] left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
            </Link>
            {token && role !== "owner" && (
              <Link to="/orders" className={navLinkClass("/orders")}>
                My Orders
                {isActive("/orders") && <span className="absolute -bottom-[14px] left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
              </Link>
            )}
            <Link to="/services" className={navLinkClass("/services")}>
              Services
              {isActive("/services") && <span className="absolute -bottom-[14px] left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
            </Link>
            <Link to="/contact" className={navLinkClass("/contact")}>
              Contact
              {isActive("/contact") && <span className="absolute -bottom-[14px] left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
            </Link>
            <Link to="/about" className={navLinkClass("/about")}>
              About
              {isActive("/about") && <span className="absolute -bottom-[14px] left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
            </Link>
          </div>
        )}

        {/* ========================= */}
        {/* RIGHT SIDE */}
        {/* ========================= */}
        <div className="flex items-center gap-3">

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            aria-label="Toggle menu"
          >
            {mobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* OWNER NAV */}
          {role === "owner" && token ? (
            <>
              <Link
                to="/dashboard"
                className={`hidden md:block text-sm font-semibold px-4 py-2 rounded-lg transition ${
                  isActive("/dashboard")
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Dashboard
              </Link>

              {/* Profile */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 pl-2 pr-3 py-1.5 rounded-full transition border border-gray-100"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 text-white flex items-center justify-center text-xs font-bold">
                    {user?.username?.charAt(0).toUpperCase() || "O"}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.username || "Owner"}
                  </span>
                  <ChevronDown size={14} className={`text-gray-400 transition ${open ? "rotate-180" : ""}`} />
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 overflow-hidden">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* GUEST */}
              {!token && (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition shadow-sm shadow-blue-100"
                  >
                    Get started
                  </Link>
                </div>
              )}

              {/* LOGGED IN CUSTOMER */}
              {token && role !== "owner" && (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setOpen(!open)}
                    className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 pl-2 pr-3 py-1.5 rounded-full transition border border-gray-100"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 text-white flex items-center justify-center text-xs font-bold">
                      {user?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {user?.username || "User"}
                    </span>
                    <ChevronDown size={14} className={`text-gray-400 transition ${open ? "rotate-180" : ""}`} />
                  </button>

                  {open && (
                    <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 overflow-hidden">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ========================= */}
      {/* MOBILE MENU */}
      {/* ========================= */}
      {mobileMenu && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-1 shadow-sm">

          {role !== "owner" && (
            <>
              <Link
                to="/"
                onClick={() => setMobileMenu(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive("/") ? "bg-blue-50 text-blue-600" : "text-gray-700"
                }`}
              >
                Home
              </Link>
              <Link
                to="/shops"
                onClick={() => setMobileMenu(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive("/shops") ? "bg-blue-50 text-blue-600" : "text-gray-700"
                }`}
              >
                Shops
              </Link>
              {token && (
                <Link
                  to="/orders"
                  onClick={() => setMobileMenu(false)}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive("/orders") ? "bg-blue-50 text-blue-600" : "text-gray-700"
                  }`}
                >
                  My Orders
                </Link>
              )}
              <Link
                to="/services"
                onClick={() => setMobileMenu(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive("/services") ? "bg-blue-50 text-blue-600" : "text-gray-700"
                }`}
              >
                Services
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenu(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive("/contact") ? "bg-blue-50 text-blue-600" : "text-gray-700"
                }`}
              >
                Contact
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenu(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive("/about") ? "bg-blue-50 text-blue-600" : "text-gray-700"
                }`}
              >
                About
              </Link>
            </>
          )}

          {/* OWNER LINKS */}
          {role === "owner" && token && (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenu(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive("/dashboard") ? "bg-blue-50 text-blue-600" : "text-gray-700"
                }`}
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-600 w-full"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          )}

          {/* GUEST BUTTONS */}
          {!token && (
            <div className="flex flex-col gap-2 pt-3 border-t border-gray-100 mt-3">
              <Link
                to="/login"
                onClick={() => setMobileMenu(false)}
                className="px-4 py-2.5 border-2 border-blue-100 text-blue-600 rounded-lg text-center text-sm font-semibold"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenu(false)}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg text-center text-sm font-semibold"
              >
                Get started
              </Link>
            </div>
          )}

          {/* CUSTOMER LOGOUT */}
          {token && role !== "owner" && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-600 w-full border-t border-gray-100 mt-3 pt-4"
            >
              <LogOut size={16} />
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

export default Nav;



// import React, { useState, useContext } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { User, LogOut, Menu, X } from "lucide-react";
// import { AuthContext } from "../context/AuthContext";

// function Nav() {
//   const navigate = useNavigate();
//   const { user, token, logoutUser } = useContext(AuthContext);

//   const [open, setOpen] = useState(false);
//   const [mobileMenu, setMobileMenu] = useState(false);

//   const role = user?.role;

//   const handleLogout = () => {
//     logoutUser();
//     navigate("/login");
//     setOpen(false);
//     setMobileMenu(false);
//   };

//   return (
//     <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100 shadow-sm">
//       <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        
//         {/* Logo */}
//         <Link to="/" className="flex items-center gap-0.5">
//           <span className="text-2xl font-extrabold text-blue-700">DRY</span>
//           <span className="text-2xl font-extrabold text-blue-500">ME</span>
//         </Link>

//         {/* ========================= */}
//         {/* DESKTOP NAV */}
//         {/* ========================= */}
//         {role !== "owner" && (
//           <div className="hidden md:flex items-center gap-8 ml-6">
//             <Link to="/" className="nav-link">
//               Home
//             </Link>

//             <Link to="/shops" className="nav-link">
//               Shops
//             </Link>

//             {token && role !== "owner" && (
//               <Link to="/orders" className="nav-link">
//                 My Orders
//               </Link>
//             )}

//             <Link to="/services" className="nav-link">
//               Services
//             </Link>

//             <Link to="/contact" className="nav-link">
//               Contact
//             </Link>

//             <Link to="/about" className="nav-link">
//               About
//             </Link>
//           </div>
//         )}

//         {/* ========================= */}
//         {/* RIGHT SIDE */}
//         {/* ========================= */}
//         <div className="flex items-center gap-3">

//           {/* MOBILE MENU BUTTON */}
//           <button
//             onClick={() => setMobileMenu(!mobileMenu)}
//             className="md:hidden p-2 rounded-lg hover:bg-gray-100"
//           >
//             {mobileMenu ? <X size={24} /> : <Menu size={24} />}
//           </button>

//           {/* OWNER NAV */}
//           {role === "owner" && token ? (
//             <>
//               <Link
//                 to="/dashboard"
//                 className="hidden md:block text-sm font-medium text-gray-700 hover:text-blue-600"
//               >
//                 Dashboard
//               </Link>

//               {/* Profile */}
//               <div className="relative hidden md:block">
//                 <button
//                   onClick={() => setOpen(!open)}
//                   className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full hover:bg-gray-200 transition"
//                 >
//                   <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
//                     <User size={16} />
//                   </div>

//                   <span className="text-sm font-medium text-gray-700">
//                     {user?.username || "Owner"}
//                   </span>
//                 </button>

//                 {/* Dropdown */}
//                 {open && (
//                   <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md">
//                     <button
//                       onClick={handleLogout}
//                       className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
//                     >
//                       <LogOut size={16} />
//                       Logout
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </>
//           ) : (
//             <>
//               {/* GUEST */}
//               {!token && (
//                 <div className="hidden md:flex items-center gap-3">
//                   <Link
//                     to="/login"
//                     className="px-3 py-2 border border-blue-700 text-blue-700 rounded hover:bg-blue-700 hover:text-white"
//                   >
//                     Login
//                   </Link>

//                   <Link
//                     to="/register"
//                     className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//                   >
//                     Register
//                   </Link>
//                 </div>
//               )}

//               {/* LOGGED IN CUSTOMER */}
//               {token && role !== "owner" && (
//                 <div className="relative hidden md:block">
//                   <button
//                     onClick={() => setOpen(!open)}
//                     className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full hover:bg-gray-200 transition"
//                   >
//                     <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
//                       <User size={16} />
//                     </div>

//                     <span className="text-sm font-medium text-gray-700">
//                       {user?.username || "User"}
//                     </span>
//                   </button>

//                   {/* Dropdown */}
//                   {open && (
//                     <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md">
//                       <button
//                         onClick={handleLogout}
//                         className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
//                       >
//                         <LogOut size={16} />
//                         Logout
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>

//       {/* ========================= */}
//       {/* MOBILE MENU */}
//       {/* ========================= */}
//       {mobileMenu && (
//         <div className="md:hidden border-t bg-white px-6 py-4 space-y-4 shadow-sm">

//           {role !== "owner" && (
//             <>
//               <Link
//                 to="/"
//                 onClick={() => setMobileMenu(false)}
//                 className="block text-gray-700 hover:text-blue-600"
//               >
//                 Home
//               </Link>

//               <Link
//                 to="/shops"
//                 onClick={() => setMobileMenu(false)}
//                 className="block text-gray-700 hover:text-blue-600"
//               >
//                 Shops
//               </Link>

//               {token && (
//                 <Link
//                   to="/orders"
//                   onClick={() => setMobileMenu(false)}
//                   className="block text-gray-700 hover:text-blue-600"
//                 >
//                   My Orders
//                 </Link>
//               )}

//               <Link
//                 to="/services"
//                 onClick={() => setMobileMenu(false)}
//                 className="block text-gray-700 hover:text-blue-600"
//               >
//                 Services
//               </Link>

//               <Link
//                 to="/contact"
//                 onClick={() => setMobileMenu(false)}
//                 className="block text-gray-700 hover:text-blue-600"
//               >
//                 Contact
//               </Link>

//               <Link
//                 to="/about"
//                 onClick={() => setMobileMenu(false)}
//                 className="block text-gray-700 hover:text-blue-600"
//               >
//                 About
//               </Link>
//             </>
//           )}

//           {/* OWNER LINKS */}
//           {role === "owner" && token && (
//             <>
//               <Link
//                 to="/dashboard"
//                 onClick={() => setMobileMenu(false)}
//                 className="block text-gray-700 hover:text-blue-600"
//               >
//                 Dashboard
//               </Link>

//               <button
//                 onClick={handleLogout}
//                 className="flex items-center gap-2 text-red-600"
//               >
//                 <LogOut size={16} />
//                 Logout
//               </button>
//             </>
//           )}

//           {/* GUEST BUTTONS */}
//           {!token && (
//             <div className="flex flex-col gap-3 pt-2">
//               <Link
//                 to="/login"
//                 onClick={() => setMobileMenu(false)}
//                 className="px-3 py-2 border border-blue-700 text-blue-700 rounded text-center"
//               >
//                 Login
//               </Link>

//               <Link
//                 to="/register"
//                 onClick={() => setMobileMenu(false)}
//                 className="px-3 py-2 bg-blue-600 text-white rounded text-center"
//               >
//                 Register
//               </Link>
//             </div>
//           )}

//           {/* CUSTOMER LOGOUT */}
//           {token && role !== "owner" && (
//             <button
//               onClick={handleLogout}
//               className="flex items-center gap-2 text-red-600 pt-2"
//             >
//               <LogOut size={16} />
//               Logout
//             </button>
//           )}
//         </div>
//       )}
//     </nav>
//   );
// }

// export default Nav;

