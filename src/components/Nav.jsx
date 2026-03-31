import React from "react";
import { Link } from "react-router-dom";

function Nav() {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link to="/" className="flex items-center gap-0.5">
          <span className="text-2xl md:text-3xl font-extrabold text-blue-700 tracking-tight">
            DRY
          </span>
          <span className="text-2xl md:text-3xl font-extrabold text-blue-500 tracking-tight">
            ME
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 ml-6">
          <Link
            to="/"
            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition"
          >
            Home
          </Link>
          <Link
            to="/shops"
            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition"
          >
            Shops
          </Link>
          <Link
            to="/orders"
            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition"
          >
            My Orders
          </Link>
          <Link
            to="/services"
            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition"
          >
            Services
          </Link>
          <Link
            to="/about"
            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition"
          >
            Contact
          </Link>
        </div>

        {/* Actions: search + auth buttons */}
        <div className="flex items-center gap-3">
          {/* Search (visual only) */}
          <div className="hidden sm:flex items-center bg-gray-100 rounded-full px-3 py-1 gap-2 w-64">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
            <input
              className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
              placeholder="Search shops, services..."
              aria-label="Search"
            />
          </div>

          <Link
            to="/login"
            className="px-3 py-2 rounded-md font-semibold text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white transition text-sm"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="px-3 py-2 rounded-md font-semibold bg-blue-600 text-white hover:bg-blue-700 transition text-sm"
          >
            Register
          </Link>

          {/* Mobile menu icon (visual only) */}
          <button className="md:hidden ml-1 p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition">
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden px-6 pb-4 space-y-2 font-medium text-gray-700 border-t border-gray-100 bg-white">
        <Link to="/" className="block py-2 hover:text-blue-600">
          Home
        </Link>
        <Link to="/shops" className="block py-2 hover:text-blue-600">
          Shops
        </Link>
        <Link to="/services" className="block py-2 hover:text-blue-600">
          Services
        </Link>
        <Link to="/orders" className="block py-2 hover:text-blue-600">
          My Orders
        </Link>
        <Link to="/about" className="block py-2 hover:text-blue-600">
          About
        </Link>
        <Link to="/contact" className="block py-2 hover:text-blue-600">
          Contact
        </Link>
        <div className="flex gap-3 pt-2">
          <Link
            to="/login"
            className="flex-1 text-center py-2 rounded-md border border-blue-700 text-blue-700 font-semibold hover:bg-blue-700 hover:text-white transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="flex-1 text-center py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Nav;
