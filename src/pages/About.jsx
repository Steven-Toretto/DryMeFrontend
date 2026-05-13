import React from "react";
import aboutImg from "../assets/images/img.jpg";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

function About() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 px-6 items-center">
        {/* Left Side - Image Card */}
        <div className="relative">
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img
              src={aboutImg}
              alt="About Us"
              className="w-full h-150 object-cover"
            />
            <div className="absolute left-4 bottom-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-md w-[calc(100%-2rem)] md:w-auto md:min-w-[260px]">
              <h5 className="text-sm text-blue-600 font-semibold">Who we are</h5>
              <p className="text-sm text-gray-600 mt-1">
                Local laundry experts delivering fast, reliable and affordable service.
              </p>
              <div className="mt-3 flex gap-3">
                <div className="flex flex-col items-start">
                  <span className="text-xs text-gray-500">Avg. Rating</span>
                  <span className="text-sm font-bold text-gray-800">4.8 ★</span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-xs text-gray-500">Deliveries</span>
                  <span className="text-sm font-bold text-gray-800">12k+</span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-xs text-gray-500">Cities</span>
                  <span className="text-sm font-bold text-gray-800">3</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Text */}
        <div>
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            About DryMe
          </span>

          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
            We make laundry effortless — quality service in your city
          </h2>

          <p className="text-gray-600 mb-6">
            DryMe connects you with trusted local laundries for wash, dry, ironing and
            dry-cleaning. We focus on convenience, transparent pricing and fast delivery.
          </p>

          {/* Feature list */}
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <CheckCircleIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800">Quality Laundry Service</h4>
                <p className="text-xs text-gray-500">Professional cleaning with eco-friendly detergents.</p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <CheckCircleIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800">Express Fast Delivery</h4>
                <p className="text-xs text-gray-500">Same-day and next-day options available in selected areas.</p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <CheckCircleIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800">Highly Professional Staff</h4>
                <p className="text-xs text-gray-500">Trained teams handling delicate fabrics with care.</p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <CheckCircleIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800">100% Satisfaction Guarantee</h4>
                <p className="text-xs text-gray-500">We re-clean or refund if you're not happy.</p>
              </div>
            </li>
          </ul>

          {/* CTA and mission */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <a
              href="/bookpickup"
              className="inline-block bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold px-6 py-3 rounded-lg shadow hover:from-blue-700 hover:to-blue-600 transition"
            >
              Book a Pickup
            </a>

            <a
              href="/shops"
              className="inline-block text-blue-600 font-medium px-4 py-2 rounded-lg border border-blue-100 hover:bg-blue-50 transition"
            >
              Browse Shops
            </a>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p>
              Our mission is to simplify laundry for busy people — reliable pickups,
              professional cleaning and doorstep delivery.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
