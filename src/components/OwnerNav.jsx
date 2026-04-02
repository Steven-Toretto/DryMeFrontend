import React from "react";
import { Link } from "react-router-dom";

function OwnerNav() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center">
      
      <Link to="/dashboard" className="font-bold text-lg">
        Owner Dashboard
      </Link>

      <div className="flex items-center gap-4">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/orders">Orders</Link>

        <div className="flex items-center gap-2">
          <span>{user?.username}</span>
          <img
            src={
              user?.profile_image ||
              "https://via.placeholder.com/40"
            }
            className="w-8 h-8 rounded-full"
            alt="profile"
          />
        </div>
      </div>
    </nav>
  );
}

export default OwnerNav;