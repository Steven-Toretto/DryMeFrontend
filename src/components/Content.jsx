import React from "react";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaSoap, FaTruck, FaSmile } from "react-icons/fa";
import aboutImg from "../assets/images/img.jpg";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { getFeaturedShops } from "../api";

import laundryImg from "../assets/images/img2.jpg";
import dryCleaningImg from "../assets/images/img.jpg";
import ironingImg from "../assets/images/carousel-2.jpg";
import ironingImg2 from "../assets/images/carousel-1.jpg";

import blog1Img from "../assets/images/blog-3.jpg";
import blog2Img from "../assets/images/blog-1.jpg";
import blog3Img from "../assets/images/blog-2.jpg";

import { FaMapMarkerAlt } from "react-icons/fa";


function Content() {
  const [shops, setShops] = useState([]);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const data = await getFeaturedShops();
      setShops(data);
    } catch (err) { 
      console.error("Failed to fetch shops");
    }
  };

  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-500 text-white py-20 mt-30">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-10">
          <div className="lg:w-1/2">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              We Are <span className="text-white">Quality</span> Laundry Finder In Your City
            </h1>
            <p className="text-blue-100 max-w-xl mb-6">
              Fast pickups, professional cleaning, and doorstep delivery — all from trusted local shops.
              Compare prices, read reviews, and book in seconds.
            </p>

            <div className="flex gap-3 items-center">
              <input
                aria-label="Search shops or services"
                className="w-full md:w-2/3 px-4 py-3 rounded-lg text-gray-800 focus:outline-none"
                placeholder="Search shops, services or location..."
              />
              <Link
                to="/shops"
                className="inline-block bg-white/90 text-blue-700 font-semibold px-5 py-3 rounded-lg shadow hover:opacity-95 transition"
              >
                Find Shops
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-blue-100">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="w-5 h-5" />
                <span>Easy Booking</span>
              </div>
              <div className="flex items-center gap-2">
                <FaSoap className="w-5 h-5" />
                <span>Eco Cleaning</span>
              </div>
              <div className="flex items-center gap-2">
                <FaTruck className="w-5 h-5" />
                <span>Fast Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <FaSmile className="w-5 h-5" />
                <span>Satisfaction Guarantee</span>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img src={aboutImg} alt="About" className="w-full h-80 object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-8">How It Works</h2>

          <div className="flex  flex-col  md:flex-row justify-center items-center gap-5">
            {[{
              icon: <FaCalendarAlt className="w-8 h-8 text-blue-600" />,
              title: "Book Pickup",
              desc: "Schedule your laundry online in seconds."
            },{
              icon: <FaSoap className="w-8 h-8 text-blue-600" />,
              title: "We Wash",
              desc: "Professional cleaning with eco-friendly detergents."
            },{
              icon: <FaTruck className="w-8 h-8 text-blue-600" />,
              title: "We Deliver",
              desc: "Fresh clothes delivered to your doorstep."
            },{
              icon: <FaSmile className="w-8 h-8 text-blue-600" />,
              title: "You Relax",
              desc: "Enjoy your free time while we handle the laundry."
            }].map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col items-start w-full sm:w-1/2 lg:w-1/4">
                <div className="w-12 h-12 flex items-center justify-center bg-blue-50 rounded-md mb-4">
                  {s.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-extrabold text-gray-800">Shops' Services</h2>
            <Link to="/services" className="text-sm text-blue-600 hover:underline">View all services</Link>
          </div>

          {/* flexbox replacement for grid */}
          <div className="flex flex-col  md:flex-row justify-center gap-6">
            {[
              { img: laundryImg, title: "Laundry", tag: "Popular", price: "KES 120 / kg", desc: "Wash, dry and fold with eco detergents." },
              { img: dryCleaningImg, title: "Dry Cleaning", tag: "Premium", price: "KES 250 / item", desc: "Delicate care for special fabrics." },
              { img: ironingImg, title: "Ironing", tag: "Quick", price: "KES 60 / item", desc: "Crisp, wrinkle-free clothes." },
              { img: ironingImg2, title: "Folding & Packaging", tag: "Careful", price: "KES 40 / item", desc: "Neatly folded and packaged clothes." }
            ].map((svc) => (
              <div key={svc.title} className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
                <div className="relative h-44">
                  <img src={svc.img} alt={svc.title} className="w-full h-full object-cover" />
                  <span className="absolute left-4 top-4 bg-white/90 text-xs text-gray-800 px-3 py-1 rounded-full font-semibold">
                    {svc.tag}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg text-gray-900">{svc.title}</h3>
                  <p className="text-sm text-gray-500 mt-2 flex-1">{svc.desc}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500">From</div>
                      <div className="text-lg font-bold text-gray-900">{svc.price}</div>
                    </div>
                    <Link to="/shops" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
                      View Shops
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED SHOPS */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-extrabold text-gray-800">Top Rated Laundry Shops</h2>
            <Link to="/shops" className="text-sm text-blue-600 hover:underline">See all shops</Link>
          </div>

          {/* FLEXBOX: ensure four cards fit in one line on large screens */}
          <div className="flex flex-col  md:flex-row justify-start gap-6">
            {shops.map((shop) => (
              <div key={shop.id} className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
                <div className="relative h-48">
                  <img
                    src={shop.image ? `http://127.0.0.1:8000${shop.image}` : laundryImg}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute right-4 top-4 bg-white/90 px-3 py-1 rounded-full text-xs font-semibold text-gray-800">
                    {shop.rating ? `${shop.rating} ★` : "New"}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg text-gray-900">{shop.name}</h3>
                  <p className="text-sm flex gap-1 text-gray-500 mt-1"><FaMapMarkerAlt className="text-red-400" />{shop.location}</p>
                  <p className="text-sm text-gray-700 mt-3 line-clamp-3">{shop.description}</p>

                  <div className="mt-4 flex items-center gap-3">
                    <Link to={`/shops/${shop.id}`} className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
                      View Shop
                    </Link>
                    <Link to={`/shops/${shop.id}#book`} className="text-sm text-gray-600 hover:underline">
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-extrabold text-gray-800">Latest From Blog</h2>
            <Link to="/blog" className="text-sm text-blue-600 hover:underline">Read all posts</Link>
          </div>

          {/* FLEXBOX: blog row */}
          <div className="flex flex-col  md:flex-row gap-6">
            {[{img: blog1Img, title: "Eco-Friendly Laundry Tips"}, {img: blog2Img, title: "Dry Cleaning Secrets"}, {img: blog3Img, title: "Ironing Hacks"}].map((b, i) => (
              <article key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden w-full md:w-1/3">
                <div className="relative h-56">
                  <img src={b.img} alt={b.title} className="w-full h-full object-cover" />
                  <div className="absolute left-0 right-0 bottom-0 p-5 bg-gradient-to-t from-black/60 to-transparent text-white">
                    <h3 className="font-bold text-lg">{b.title}</h3>
                    <p className="text-xs text-white/80 mt-1">By Admin • Tips • 5 comments</p>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-gray-600 text-sm">
                    Short summary of the article to entice readers. Learn practical tips and tricks to keep your clothes fresh.
                  </p>
                  <div className="mt-4">
                    <Link to="/blog" className="text-blue-600 font-medium hover:underline">Read more →</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-900 to-blue-400 text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-4">Ready to Experience Fresh Laundry?</h2>
          <p className="text-sm mb-6">Book a pickup now and enjoy doorstep delivery from trusted local shops.</p>
          <div className="flex justify-center gap-4">
            <Link to="/bookpickup" className="bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-95 transition">Book Your Pickup</Link>
            <Link to="/shops" className="px-6 py-3 rounded-lg border border-white text-white hover:bg-blue-900 transition">Browse Shops</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Content;
