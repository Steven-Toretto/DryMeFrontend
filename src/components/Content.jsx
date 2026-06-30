import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Droplets, Truck, Smile, MapPin, Star } from "lucide-react";
import { getFeaturedShops } from "../api";

import laundryImg from "../assets/images/img2.jpg";
import dryCleaningImg from "../assets/images/img.jpg";
import ironingImg from "../assets/images/carousel-2.jpg";
import ironingImg2 from "../assets/images/carousel-1.jpg";

import blog1Img from "../assets/images/blog-3.jpg";
import blog2Img from "../assets/images/blog-1.jpg";
import blog3Img from "../assets/images/blog-2.jpg";

function Content() {
  const [shops, setShops] = useState([]);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const data = await getFeaturedShops();
      setShops(data.results ?? data);
    } catch (err) {
      console.error("Failed to fetch shops");
    }
  };

  return (
    <div className="flex flex-col">

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="inline-block text-blue-600 font-bold text-xs tracking-widest uppercase mb-3">
              Simple process
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              How DryMe works
            </h2>
            <p className="text-gray-500 mt-3">
              From pickup to fresh, folded clothes — four easy steps.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <Calendar size={22} />, title: "Book Pickup", desc: "Schedule your laundry online in seconds." },
              { icon: <Droplets size={22} />, title: "We Wash", desc: "Professional cleaning with eco-friendly detergents." },
              { icon: <Truck size={22} />, title: "We Deliver", desc: "Fresh clothes delivered to your doorstep." },
              { icon: <Smile size={22} />, title: "You Relax", desc: "Enjoy your free time while we handle the laundry." },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all relative"
              >
                <span className="absolute top-4 right-5 text-3xl font-black text-gray-50">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-xl mb-4 shadow-md shadow-blue-100 relative z-10">
                  {s.icon}
                </div>
                <h3 className="font-bold text-base text-gray-900 mb-1.5 relative z-10">{s.title}</h3>
                <p className="text-sm text-gray-500 relative z-10">{s.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">

          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="inline-block text-blue-600 font-bold text-xs tracking-widest uppercase mb-3">
                What we offer
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">
                Shops' Services
              </h2>
            </div>
            <Link to="/services" className="text-sm font-semibold text-blue-600 hover:underline shrink-0">
              View all services →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { img: laundryImg, title: "Laundry", tag: "Popular", price: "KES 120 / kg", desc: "Wash, dry and fold with eco detergents." },
              { img: dryCleaningImg, title: "Dry Cleaning", tag: "Premium", price: "KES 250 / item", desc: "Delicate care for special fabrics." },
              { img: ironingImg, title: "Ironing", tag: "Quick", price: "KES 60 / item", desc: "Crisp, wrinkle-free clothes." },
              { img: ironingImg2, title: "Folding & Packaging", tag: "Careful", price: "KES 40 / item", desc: "Neatly folded and packaged clothes." },
            ].map((svc) => (
              <div
                key={svc.title}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-lg transition group"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={svc.img}
                    alt={svc.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute left-4 top-4 bg-white/95 text-xs text-gray-800 px-3 py-1 rounded-full font-semibold shadow-sm">
                    {svc.tag}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg text-gray-900">{svc.title}</h3>
                  <p className="text-sm text-gray-500 mt-2 flex-1">{svc.desc}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-400">From</div>
                      <div className="text-lg font-black text-gray-900">{svc.price}</div>
                    </div>
                    <Link
                      to="/shops"
                      className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-blue-600 transition"
                    >
                      View Shops
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── FEATURED SHOPS ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">

          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="inline-block text-blue-600 font-bold text-xs tracking-widest uppercase mb-3">
                Trusted partners
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">
                Top Rated Laundry Shops
              </h2>
            </div>
            <Link to="/shops" className="text-sm font-semibold text-blue-600 hover:underline shrink-0">
              See all shops →
            </Link>
          </div>

          {shops.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
              No featured shops yet — check back soon!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {shops.map((shop) => (
                <div
                  key={shop.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-lg transition group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={shop.image || laundryImg}
                      alt={shop.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute right-4 top-4 bg-white/95 px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm flex items-center gap-1">
                      {shop.rating ? (
                        <>
                          <Star size={11} className="fill-yellow-400 text-yellow-400" />
                          {shop.rating}
                        </>
                      ) : (
                        "New"
                      )}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg text-gray-900">{shop.name}</h3>
                    <p className="text-sm flex items-center gap-1.5 text-gray-500 mt-1">
                      <MapPin size={13} className="text-red-400" />
                      {shop.location}
                    </p>
                    <p className="text-sm text-gray-600 mt-3 line-clamp-3 flex-1">{shop.description}</p>

                    <div className="mt-4 flex items-center gap-3">
                      <Link
                        to={`/shop/${shop.id}`}
                        className="flex-1 text-center bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-blue-600 transition"
                      >
                        View Shop
                      </Link>
                      <Link
                        to={`/shop/${shop.id}#book`}
                        className="text-sm text-gray-500 hover:text-blue-600 transition font-medium"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ── BLOG ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">

          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="inline-block text-blue-600 font-bold text-xs tracking-widest uppercase mb-3">
                Resources
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">
                Latest From Blog
              </h2>
            </div>
            <Link to="/blog" className="text-sm font-semibold text-blue-600 hover:underline shrink-0">
              Read all posts →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { img: blog1Img, title: "Eco-Friendly Laundry Tips" },
              { img: blog2Img, title: "Dry Cleaning Secrets" },
              { img: blog3Img, title: "Ironing Hacks" },
            ].map((b, i) => (
              <article
                key={i}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition group"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={b.img}
                    alt={b.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute left-0 right-0 bottom-0 p-5 bg-gradient-to-t from-black/70 to-transparent text-white">
                    <h3 className="font-bold text-lg">{b.title}</h3>
                    <p className="text-xs text-white/80 mt-1">By Admin · Tips · 5 comments</p>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-gray-500 text-sm">
                    Short summary of the article to entice readers. Learn practical tips and tricks to keep your clothes fresh.
                  </p>
                  <Link to="/blog" className="inline-block mt-4 text-blue-600 font-semibold text-sm hover:underline">
                    Read more →
                  </Link>
                </div>
              </article>
            ))}
          </div>

        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Ready for fresh laundry?
          </h2>
          <p className="text-blue-100/90 mb-8">
            Book a pickup now and enjoy doorstep delivery from trusted local shops.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/shops"
              className="bg-white text-blue-700 px-7 py-3.5 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg"
            >
              Book Your Pickup
            </Link>
            <Link
              to="/shops"
              className="px-7 py-3.5 rounded-xl border-2 border-white/40 text-white font-semibold hover:bg-white/10 transition"
            >
              Browse Shops
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Content;

