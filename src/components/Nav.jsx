import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Menu, X } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

function Nav() {
  const navigate = useNavigate();
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

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-0.5">
          <span className="text-2xl font-extrabold text-blue-700">DRY</span>
          <span className="text-2xl font-extrabold text-blue-500">ME</span>
        </Link>

        {/* ========================= */}
        {/* DESKTOP NAV */}
        {/* ========================= */}
        {role !== "owner" && (
          <div className="hidden md:flex items-center gap-8 ml-6">
            <Link to="/" className="nav-link">
              Home
            </Link>

            <Link to="/shops" className="nav-link">
              Shops
            </Link>

            {token && role !== "owner" && (
              <Link to="/orders" className="nav-link">
                My Orders
              </Link>
            )}

            <Link to="/services" className="nav-link">
              Services
            </Link>

            <Link to="/contact" className="nav-link">
              Contact
            </Link>

            <Link to="/about" className="nav-link">
              About
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
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* OWNER NAV */}
          {role === "owner" && token ? (
            <>
              <Link
                to="/dashboard"
                className="hidden md:block text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Dashboard
              </Link>

              {/* Profile */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full hover:bg-gray-200 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <User size={16} />
                  </div>

                  <span className="text-sm font-medium text-gray-700">
                    {user?.username || "Owner"}
                  </span>
                </button>

                {/* Dropdown */}
                {open && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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
                <div className="hidden md:flex items-center gap-3">
                  <Link
                    to="/login"
                    className="px-3 py-2 border border-blue-700 text-blue-700 rounded hover:bg-blue-700 hover:text-white"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* LOGGED IN CUSTOMER */}
              {token && role !== "owner" && (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setOpen(!open)}
                    className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full hover:bg-gray-200 transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <User size={16} />
                    </div>

                    <span className="text-sm font-medium text-gray-700">
                      {user?.username || "User"}
                    </span>
                  </button>

                  {/* Dropdown */}
                  {open && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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
        <div className="md:hidden border-t bg-white px-6 py-4 space-y-4 shadow-sm">

          {role !== "owner" && (
            <>
              <Link
                to="/"
                onClick={() => setMobileMenu(false)}
                className="block text-gray-700 hover:text-blue-600"
              >
                Home
              </Link>

              <Link
                to="/shops"
                onClick={() => setMobileMenu(false)}
                className="block text-gray-700 hover:text-blue-600"
              >
                Shops
              </Link>

              {token && (
                <Link
                  to="/orders"
                  onClick={() => setMobileMenu(false)}
                  className="block text-gray-700 hover:text-blue-600"
                >
                  My Orders
                </Link>
              )}

              <Link
                to="/services"
                onClick={() => setMobileMenu(false)}
                className="block text-gray-700 hover:text-blue-600"
              >
                Services
              </Link>

              <Link
                to="/contact"
                onClick={() => setMobileMenu(false)}
                className="block text-gray-700 hover:text-blue-600"
              >
                Contact
              </Link>

              <Link
                to="/about"
                onClick={() => setMobileMenu(false)}
                className="block text-gray-700 hover:text-blue-600"
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
                className="block text-gray-700 hover:text-blue-600"
              >
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          )}

          {/* GUEST BUTTONS */}
          {!token && (
            <div className="flex flex-col gap-3 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenu(false)}
                className="px-3 py-2 border border-blue-700 text-blue-700 rounded text-center"
              >
                Login
              </Link>

              <Link
                to="/register"
                onClick={() => setMobileMenu(false)}
                className="px-3 py-2 bg-blue-600 text-white rounded text-center"
              >
                Register
              </Link>
            </div>
          )}

          {/* CUSTOMER LOGOUT */}
          {token && role !== "owner" && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 pt-2"
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

