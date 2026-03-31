import laundryImg from "../assets/images/img2.jpg";
import dryCleaningImg from "../assets/images/img.jpg";
import ironingImg from "../assets/images/carousel-2.jpg";
import ironingImg2 from "../assets/images/carousel-1.jpg";

export default function Services() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <header className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Shops' Services
          </h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Professional laundry, dry-cleaning, ironing and packaging services from trusted local shops.
            Transparent pricing, eco-friendly options and fast delivery.
          </p>
        </header>

        {/* Services grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col">
            <div className="relative h-48">
              <img
                src={laundryImg}
                alt="Laundry"
                className="w-full h-full object-cover"
              />
              <div className="absolute left-4 top-4 bg-white/90 text-xs text-gray-700 px-3 py-1 rounded-full font-semibold">
                Popular
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-lg text-gray-900 mb-2">Laundry</h3>
              <p className="text-sm text-gray-500 mb-4 flex-1">
                Wash, dry and fold service with eco-friendly detergents and gentle cycles for all fabrics.
              </p>

              <div className="flex items-center justify-between mt-4">
                <div>
                  <div className="text-sm text-gray-500">From</div>
                  <div className="text-lg font-bold text-gray-900">KES 120 / kg</div>
                </div>

                <a
                  href="/shops"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                >
                  View Shops
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col">
            <div className="relative h-48">
              <img
                src={dryCleaningImg}
                alt="Dry Cleaning"
                className="w-full h-full object-cover"
              />
              <div className="absolute left-4 top-4 bg-white/90 text-xs text-gray-700 px-3 py-1 rounded-full font-semibold">
                Premium
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-lg text-gray-900 mb-2">Dry Cleaning</h3>
              <p className="text-sm text-gray-500 mb-4 flex-1">
                Professional dry-cleaning for delicate and specialty fabrics — stain treatment included.
              </p>

              <div className="flex items-center justify-between mt-4">
                <div>
                  <div className="text-sm text-gray-500">From</div>
                  <div className="text-lg font-bold text-gray-900">KES 250 / item</div>
                </div>

                <a
                  href="/shops"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                >
                  View Shops
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col">
            <div className="relative h-48">
              <img
                src={ironingImg}
                alt="Ironing"
                className="w-full h-full object-cover"
              />
              <div className="absolute left-4 top-4 bg-white/90 text-xs text-gray-700 px-3 py-1 rounded-full font-semibold">
                Quick
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-lg text-gray-900 mb-2">Ironing</h3>
              <p className="text-sm text-gray-500 mb-4 flex-1">
                Fast and precise ironing to keep your shirts and garments crisp and ready to wear.
              </p>

              <div className="flex items-center justify-between mt-4">
                <div>
                  <div className="text-sm text-gray-500">From</div>
                  <div className="text-lg font-bold text-gray-900">KES 60 / item</div>
                </div>

                <a
                  href="/shops"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                >
                  View Shops
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col">
            <div className="relative h-48">
              <img
                src={ironingImg2}
                alt="Folding & Packaging"
                className="w-full h-full object-cover"
              />
              <div className="absolute left-4 top-4 bg-white/90 text-xs text-gray-700 px-3 py-1 rounded-full font-semibold">
                Careful
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-lg text-gray-900 mb-2">Folding & Packaging</h3>
              <p className="text-sm text-gray-500 mb-4 flex-1">
                Neatly folded and packaged clothes, ideal for storage or gifting — attention to detail guaranteed.
              </p>

              <div className="flex items-center justify-between mt-4">
                <div>
                  <div className="text-sm text-gray-500">From</div>
                  <div className="text-lg font-bold text-gray-900">KES 40 / item</div>
                </div>

                <a
                  href="/shops"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                >
                  View Shops
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Want a custom service or bulk pricing? Our partner shops offer tailored solutions for businesses and hotels.
          </p>
          <div className="inline-flex gap-4">
            <a
              href="/contact"
              className="px-6 py-3 rounded-lg bg-white border border-gray-200 text-gray-800 hover:shadow-md transition"
            >
              Contact Sales
            </a>
            <a
              href="/bookpickup"
              className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Book a Pickup
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
