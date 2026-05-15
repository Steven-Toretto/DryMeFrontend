import React from "react";
import { FaFacebook, FaTwitter, FaYoutube, FaInstagram } from "react-icons/fa";

function Contact() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Side - Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-10">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                  Contact Us
                </h2>
                <p className="text-blue-100 mt-2 max-w-xl">
                  We’d love to hear from you — whether it’s a question about services,
                  a booking request, or feedback. We’ll get back to you within 24 hours.
                </p>
              </div>

              <div className="p-8">
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                      placeholder="Your Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <div className="flex gap-2">
                      <select
                        className="w-28 border border-gray-200 rounded-lg px-3 py-3 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                        defaultValue="+254"
                        aria-label="Country code"
                      >
                        <option value="+254">+254</option>
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                      </select>
                      <input
                        type="tel"
                        className="flex-1 border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                        placeholder="712 345 678"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      rows="5"
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                      placeholder="Tell us how we can help..."
                    ></textarea>
                  </div>

                  <div className="md:col-span-2 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <input
                        id="subscribe"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <label htmlFor="subscribe" className="text-sm text-gray-600">
                        Subscribe to offers and updates
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="ml-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition text-sm"
                    >
                      Send Message
                    </button>
                  </div>
                </form>

                <div className="mt-6 text-sm text-gray-500">
                  <p>
                    Prefer a faster response? Call us at{" "}
                    <span className="text-gray-800 font-medium">+254 123 456 789</span>{" "}
                    or use the chat in the bottom-right corner.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Contact Info */}
          <aside className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Contact Info</h4>

              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <p className="font-medium text-gray-800">Email</p>
                  <p className="text-gray-600">support@dryme.com</p>
                </div>

                <div>
                  <p className="font-medium text-gray-800">Phone</p>
                  <p className="text-gray-600">+254 123 456 789</p>
                </div>

                <div>
                  <p className="font-medium text-gray-800">Address</p>
                  <p className="text-gray-600">Nairobi, Kenya</p>
                </div>
              </div>

              <div className="mt-6">
                <h5 className="text-sm font-semibold text-gray-800 mb-2">Follow us</h5>
                <div className="flex items-center gap-3">
                  <a
                    href="https://www.facebook.com/yourpage"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                    aria-label="Facebook"
                  >
                    <FaFacebook className="w-5 h-5" />
                  </a>
                  <a
                    href="https://twitter.com/yourhandle"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-blue-50 text-blue-400 hover:bg-blue-100 transition"
                    aria-label="Twitter"
                  >
                    <FaTwitter className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.youtube.com/https://dry-me-frontend.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition"
                    aria-label="YouTube"
                  >
                    <FaYoutube className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.instagram.com/yourhandle"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-pink-50 text-pink-500 hover:bg-pink-100 transition"
                    aria-label="Instagram"
                  >
                    <FaInstagram className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Quick CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl p-6 shadow-md">
              <h4 className="text-lg font-semibold mb-2">Need Laundry Now?</h4>
              <p className="text-sm mb-4">Book a pickup and get same-day delivery in selected areas.</p>
              <div className="flex gap-3">
                <a
                  href="/bookpickup"
                  className="flex-1 text-center bg-white text-blue-600 font-semibold px-4 py-2 rounded-lg hover:opacity-95 transition"
                >
                  Book Pickup
                </a>
                <a
                  href="/shops"
                  className="flex-1 text-center border border-white/30 px-4 py-2 rounded-lg text-white hover:bg-white/10 transition text-sm"
                >
                  Browse Shops
                </a>
              </div>
            </div>

            {/* Map Embed */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h5 className="text-sm font-semibold text-gray-800">Our Location</h5>
                <p className="text-xs text-gray-500">Nairobi, Kenya</p>
              </div>
              <div className="w-full h-64">
                <iframe
                  title="map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31910.123456789!2d36.8219!3d-1.2921!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f173123456789%3A0xabcdef123456789!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2ske!4v1670000000000!5m2!1sen!2ske"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default Contact;
