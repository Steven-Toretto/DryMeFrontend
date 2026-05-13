import React from "react";
import { Link } from "react-router-dom";
import bg from "../assets/images/carousel-1.jpg";

//  Import icons
import { FaBolt, FaMapMarkerAlt, FaCreditCard, FaTshirt } from "react-icons/fa";

function Hero() {
  return (
    <div
      className="relative flex items-center justify-center min-h-[95vh] bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/75 to-black/75"></div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl">

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
          Laundry Made <span className="text-blue-400">Simple</span> &{" "}
          <span className="text-blue-400">Fast</span>
        </h1>

        {/* Subtext */}
        <p className="text-gray-100 text-lg md:text-xl mb-8">
          Book laundry services in seconds. Track your orders in real-time and
          get your clothes cleaned and delivered — stress free.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition"
          >
            Get Started
          </Link>

          <Link
            to="/shops"
            className="bg-white/10 backdrop-blur border border-white/20 text-white px-8 py-3 rounded-xl hover:bg-white/20 transition"
          >
            Browse Shops
          </Link>
        </div>

        {/*  FEATURES WITH ICONS */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-300">

          <div className="flex items-center gap-2">
            <FaBolt className="text-yellow-400" />
            <span className="text-white">Fast Pickup</span>
          </div>

          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-red-400" />
            <span className="text-white">Real-time Tracking</span>
          </div>

          {/* <div className="flex items-center gap-2">
            <FaCreditCard className="text-green-400" />
            <span>Easy Payments</span>
          </div> */}

          <div className="flex items-center gap-2">
            <FaTshirt className="text-blue-400" />
            <span className="text-white">Quality Cleaning</span>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Hero;