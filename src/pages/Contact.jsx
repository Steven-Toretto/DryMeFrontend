import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaYoutube, FaInstagram } from "react-icons/fa";
import { Mail, Phone, MapPin, Send } from "lucide-react";

function Contact() {
  return (
    <section className="py-20 bg-gray-50 relative overflow-hidden">

      {/* Decorative background blob */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* Section heading */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="inline-block text-blue-600 font-bold text-xs tracking-widest uppercase mb-3">
            Get in touch
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900">
            We'd love to hear from you
          </h2>
          <p className="text-gray-500 mt-3">
            Questions about services, a booking issue, or just feedback —
            we typically reply within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── Left — Contact Form ── */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/50 overflow-hidden">

              <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 px-8 py-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/4" />
                <h3 className="text-2xl font-black text-white relative z-10">
                  Send us a message
                </h3>
                <p className="text-blue-100/90 text-sm mt-1 relative z-10">
                  Fill in the form and our team will get back to you shortly.
                </p>
              </div>

              <form className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Phone
                    </label>
                    <div className="flex gap-2">
                      <select
                        className="w-24 border border-gray-200 bg-gray-50 rounded-xl px-3 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        defaultValue="+254"
                        aria-label="Country code"
                      >
                        <option value="+254">+254</option>
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                      </select>
                      <input
                        type="tel"
                        className="flex-1 border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition"
                        placeholder="712 345 678"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Message
                    </label>
                    <textarea
                      rows="5"
                      className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition resize-none"
                      placeholder="Tell us how we can help..."
                    ></textarea>
                  </div>

                  <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                    <label className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Subscribe to offers and updates
                    </label>

                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-blue-100 text-sm"
                    >
                      <Send size={15} />
                      Send Message
                    </button>
                  </div>

                </div>

                <p className="text-xs text-gray-400 mt-6 text-center sm:text-left">
                  Prefer a faster response? Call us at{" "}
                  <span className="text-gray-700 font-semibold">+254 123 456 789</span>
                </p>
              </form>

            </div>
          </div>

          {/* ── Right — Info ── */}
          <aside className="lg:col-span-5 space-y-5">

            {/* Contact info card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h4 className="text-base font-bold text-gray-800 mb-4">Contact information</h4>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm font-medium text-gray-800">support@dryme.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Phone size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="text-sm font-medium text-gray-800">+254 123 456 789</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Address</p>
                    <p className="text-sm font-medium text-gray-800">Nairobi, Kenya</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-3">Follow us</p>
                <div className="flex items-center gap-2.5">
                  <a
                    href="https://www.facebook.com/yourpage"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition"
                    aria-label="Facebook"
                  >
                    <FaFacebook className="w-4 h-4" />
                  </a>
                  <a
                    href="https://twitter.com/yourhandle"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-blue-50 text-blue-400 hover:bg-blue-100 flex items-center justify-center transition"
                    aria-label="Twitter"
                  >
                    <FaTwitter className="w-4 h-4" />
                  </a>
                  <a
                    href="https://www.youtube.com/https://dry-me-frontend.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition"
                    aria-label="YouTube"
                  >
                    <FaYoutube className="w-4 h-4" />
                  </a>
                  <a
                    href="https://www.instagram.com/yourhandle"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-pink-50 text-pink-500 hover:bg-pink-100 flex items-center justify-center transition"
                    aria-label="Instagram"
                  >
                    <FaInstagram className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Quick CTA */}
            <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white rounded-2xl p-6 shadow-lg shadow-blue-200/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
              <h4 className="text-lg font-bold mb-1.5 relative z-10">Need laundry now?</h4>
              <p className="text-sm text-blue-100/90 mb-5 relative z-10">
                Book a pickup and get same-day delivery in selected areas.
              </p>
              <div className="flex gap-3 relative z-10">
                <Link
                  to="/shops"
                  className="flex-1 text-center bg-white text-blue-700 font-bold px-4 py-2.5 rounded-xl hover:bg-blue-50 transition text-sm"
                >
                  Book Pickup
                </Link>
                <Link
                  to="/shops"
                  className="flex-1 text-center border-2 border-white/30 px-4 py-2.5 rounded-xl text-white hover:bg-white/10 transition text-sm font-semibold"
                >
                  Browse Shops
                </Link>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h5 className="text-sm font-bold text-gray-800">Our location</h5>
                <p className="text-xs text-gray-400">Nairobi, Kenya</p>
              </div>
              <div className="w-full h-56">
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

