import React from "react";
import { Link } from "react-router-dom";
import { Home, Store, ArrowLeft } from "lucide-react";

function NotFound() {
return ( <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-6 py-16"> <div className="max-w-xl w-full text-center">


    {/* 404 Illustration */}
    <div className="relative mb-8">
      <h1 className="text-9xl sm:text-[160px] font-black tracking-tight text-blue-100 select-none">
        404
      </h1>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-blue-600 shadow-xl shadow-blue-200 flex items-center justify-center rotate-[-8deg]">
          <span className="text-6xl" role="img" aria-label="Laundry">
            🧺
          </span>
        </div>
      </div>
    </div>

    {/* Message */}
    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
      Oops! Page Not Found
    </h2>

    <p className="text-gray-500 text-base sm:text-lg leading-relaxed mb-8 max-w-md mx-auto">
      Looks like this page went missing in the wash!
      Don't worry — let's get you back to fresh clothes
      and reliable laundry services.
    </p>

    {/* Action Buttons */}
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <Link
        to="/"
        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
      >
        <Home size={18} />
        Go Home
      </Link>

      <Link
        to="/shops"
        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-xl border border-blue-200 bg-white text-blue-700 font-semibold hover:bg-blue-50 transition"
      >
        <Store size={18} />
        Browse Shops
      </Link>
    </div>

    {/* Back Button */}
    <button
      type="button"
      onClick={() => window.history.back()}
      className="mt-8 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition"
    >
      <ArrowLeft size={16} />
      Go back to previous page
    </button>

    {/* Branding */}
    <p className="mt-12 text-sm text-gray-400">
      Made with care by{" "}
      <span className="font-bold text-blue-600">DryMe</span>
    </p>
  </div>
</div>


);
}

export default NotFound;
