import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-gradient-to-t from-blue-50 to-white text-gray-700 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="md:col-span-1">
          <h2 className="text-2xl font-extrabold text-blue-700 mb-3">DryMe</h2>
          <p className="text-gray-600 mb-4">
            Your one-stop site for reliable laundry services with friendly prices and fast delivery.
          </p>

          <div className="flex items-center gap-3 mt-4">
            <div className="text-sm text-gray-500">Follow us</div>
            <div className="flex gap-3">
              <a
                href="https://twitter.com/yourhandle"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white shadow-sm text-blue-400 hover:text-blue-600 transition"
                aria-label="Twitter"
              >
                <FaTwitter className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com/yourpage"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white shadow-sm text-blue-600 hover:text-blue-800 transition"
                aria-label="Facebook"
              >
                <FaFacebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com/yourhandle"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white shadow-sm text-pink-500 hover:text-pink-700 transition"
                aria-label="Instagram"
              >
                <FaInstagram className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com/company/yourcompany"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white shadow-sm text-blue-700 hover:text-blue-900 transition"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* About */}
        <div>
          <h3 className="text-lg font-semibold text-blue-600 mb-4">About Us</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <a href="/company" className="hover:text-blue-700 transition">
                Our Company
              </a>
            </li>
            <li>
              <a href="/careers" className="hover:text-blue-700 transition">
                Careers
              </a>
            </li>
            <li>
              <a href="/blog" className="hover:text-blue-700 transition">
                Blog
              </a>
            </li>
            <li>
              <a href="/faq" className="hover:text-blue-700 transition">
                FAQs
              </a>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-blue-600 mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <a href="/shops" className="hover:text-blue-700 transition">
                Shops
              </a>
            </li>
            <li>
              <a href="/" className="hover:text-blue-700 transition">
                Home
              </a>
            </li>
            <li>
              <a href="/about" className="hover:text-blue-700 transition">
                About
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:text-blue-700 transition">
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Contact & Newsletter */}
        <div>
          <h3 className="text-lg font-semibold text-blue-600 mb-4">Contact</h3>
          <p className="text-sm text-gray-700">Nairobi, Kenya</p>
          <p className="text-sm text-gray-700 mt-1">+254 123 456 789</p>
          <p className="text-sm text-gray-700 mt-1">support@dryme.com</p>

          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-800 mb-2">Subscribe for updates</h4>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                aria-label="Email"
              />
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2">
              Get exclusive offers and service updates. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">© 2026 DryMe. All Rights Reserved</p>

          <div className="flex items-center gap-6 text-sm">
            <a href="/privacy" className="text-gray-600 hover:text-blue-700 transition">
              Privacy Policy
            </a>
            <a href="/terms" className="text-gray-600 hover:text-blue-700 transition">
              Terms of Service
            </a>
            <span className="hidden md:inline text-gray-400">•</span>
            <span className="text-xs text-gray-500">Built with care for local laundries</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
