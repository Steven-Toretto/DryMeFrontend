import React from "react";
import { Outlet } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav always at the top */}
      <Nav />

      {/* Main content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer always at the bottom */}
      <Footer />
    </div>
  );
}

export default Layout;
