import React from "react";
import { Link } from "react-router-dom";
import { Zap, MapPin, CreditCard, Shirt, Star } from "lucide-react";

function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 min-h-[92vh] flex items-center">

      {/* Decorative background circles */}
      <div className="absolute top-0 right-0 w-[28rem] h-[28rem] bg-white/5 rounded-full -translate-y-1/3 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4 pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />

      {/* Floating bubbles */}
      <div className="absolute top-24 right-1/4 w-6 h-6 rounded-full bg-white/20 animate-bounce" style={{ animationDuration: "3s" }} />
      <div className="absolute top-1/2 right-16 w-4 h-4 rounded-full bg-white/15 animate-bounce" style={{ animationDuration: "2.5s", animationDelay: "0.5s" }} />
      <div className="absolute bottom-1/3 left-16 w-5 h-5 rounded-full bg-white/15 animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "1s" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">

        {/* ── LEFT — Copy ── */}
        <div className="text-center lg:text-left">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white text-xs font-semibold">Now live across Nairobi</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] mb-6">
            Fresh laundry,
            <br />
            <span className="text-blue-100">zero hassle.</span>
          </h1>

          <p className="text-blue-50/90 text-lg max-w-md mx-auto lg:mx-0 mb-8">
            Book a trusted laundry shop near you, track your order live, and pay
            instantly with M-Pesa — all from your phone.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
            <Link
              to="/register"
              className="bg-white text-blue-700 font-bold px-8 py-3.5 rounded-xl shadow-xl hover:bg-blue-50 transition text-center"
            >
              Get Started Free
            </Link>
            <Link
              to="/shops"
              className="bg-white/10 backdrop-blur border-2 border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/20 transition text-center"
            >
              Browse Shops
            </Link>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur border border-white/10 rounded-full px-4 py-2">
              <Zap size={14} className="text-yellow-300" />
              <span className="text-white text-xs font-medium">Fast Pickup</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur border border-white/10 rounded-full px-4 py-2">
              <MapPin size={14} className="text-red-300" />
              <span className="text-white text-xs font-medium">Live Tracking</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur border border-white/10 rounded-full px-4 py-2">
              <CreditCard size={14} className="text-green-300" />
              <span className="text-white text-xs font-medium">M-Pesa Payments</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur border border-white/10 rounded-full px-4 py-2">
              <Shirt size={14} className="text-blue-200" />
              <span className="text-white text-xs font-medium">Quality Cleaning</span>
            </div>
          </div>

        </div>

        {/* ── RIGHT — Illustration ── */}
        <div className="hidden lg:flex items-center justify-center relative">

          {/* Washing machine card illustration */}
          <div className="relative">

            <div className="w-72 h-80 bg-white/10 backdrop-blur-xl rounded-[2.5rem] border-2 border-white/20 shadow-2xl flex flex-col items-center justify-center p-8">

              {/* Top control dots */}
              <div className="flex gap-2 mb-6 self-start">
                <div className="w-3 h-3 rounded-full bg-blue-200" />
                <div className="w-3 h-3 rounded-full bg-white/40" />
                <div className="w-3 h-3 rounded-full bg-white/40" />
              </div>

              {/* Drum */}
              <div className="w-44 h-44 rounded-full border-4 border-white/40 bg-white/10 flex items-center justify-center relative shadow-inner">
                <div
                  className="w-32 h-32 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center animate-spin"
                  style={{ animationDuration: "10s" }}
                >
                  <Shirt size={36} className="text-white/70" />
                </div>

                {/* Porthole bolts */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white/50" />
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white/50" />
                <div className="absolute left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white/50" />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white/50" />
              </div>

              {/* Progress bar */}
              <div className="w-full mt-6">
                <div className="flex justify-between text-xs text-white/80 mb-1.5 font-medium">
                  <span>Washing</span>
                  <span>72%</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full w-[72%] bg-gradient-to-r from-blue-200 to-white rounded-full" />
                </div>
              </div>

            </div>

            {/* Floating rating card */}
            <div className="absolute -left-10 top-8 bg-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-2">
              <div className="flex text-yellow-400">
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
                <Star size={14} fill="currentColor" />
              </div>
              <span className="text-gray-700 text-xs font-bold">4.9</span>
            </div>

            {/* Floating order card */}
            <div className="absolute -right-8 bottom-10 bg-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800">Order ready</p>
                <p className="text-[10px] text-gray-400">2 mins ago</p>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" className="w-full h-auto" preserveAspectRatio="none">
          <path
            fill="#f9fafb"
            d="M0,32 C320,80 1120,0 1440,40 L1440,80 L0,80 Z"
          />
        </svg>
      </div>

    </div>
  );
}

export default Hero;


