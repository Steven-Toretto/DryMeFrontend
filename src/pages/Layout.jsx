import React from "react";
import { Outlet } from "react-router-dom";
import Nav from "../components/Nav";
import OwnerNav from "../components/OwnerNav"; // ✅ ADD THIS
import Footer from "../components/Footer";

function Layout() {
  // ✅ Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 🔥 ROLE-BASED NAVBAR */}
      {/* {user?.role === "owner" ? <OwnerNav /> : } */}
      <Nav />

      {/* Main content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Layout;

