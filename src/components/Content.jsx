import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BedDouble, CalendarCheck, Droplets, Search, Shirt, Truck, WashingMachine, Zap } from "lucide-react";
import { getFeaturedShops } from "../api";
import ShopCard from "./ShopCard";
import { Pill, SectionHead, btn, card, textLink, wrap } from "./ui";

// ===========================
// HOW IT WORKS
// ===========================
const STEPS = [
  { icon: Search, title: "Find a laundry", text: "Browse laundries near you, see their services and what customers say." },
  { icon: CalendarCheck, title: "Book a pickup", text: "Say how much you have and where to collect it. Pay with M-Pesa." },
  { icon: WashingMachine, title: "They wash it", text: "The laundry confirms, collects and cleans. Follow every step." },
  { icon: Truck, title: "Get it back", text: "Clean clothes returned to you. Leave a rating for the next customer." },
];

function HowItWorks() {
  return (
    <section id="how" className="py-16 sm:py-20 scroll-mt-16">
      <div className={wrap}>
        <SectionHead title="How DryMe works" text="Four simple steps from dirty laundry to clean clothes." />

        <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="relative">
              <span className="flex items-center justify-center w-[52px] h-[52px] rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 mb-5">
                <Icon size={24} />
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 mb-2">
                <span className="text-blue-600 mr-1.5">{i + 1}.</span>
                {title}
              </h3>
              <p className="text-[15px] text-slate-600 leading-relaxed">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ===========================
// WHAT LAUNDRIES OFFER (no made-up prices: every shop sets its own)
// ===========================
const SERVICES = [
  { icon: Droplets, title: "Wash & fold", text: "Everyday clothes, bedding and towels, washed, dried and folded.", priced: "By the kilo" },
  { icon: Shirt, title: "Dry cleaning", text: "Suits, dresses and coats that shouldn't go in a normal wash.", priced: "By the item" },
  { icon: Zap, title: "Ironing", text: "Shirts and trousers pressed and ready to wear.", priced: "By the item" },
  { icon: BedDouble, title: "Duvets & curtains", text: "The bulky things that won't fit in a machine at home.", priced: "By the item" },
];

function Services() {
  return (
    <section className="bg-blue-50 border-y border-blue-100 py-16 sm:py-20">
      <div className={wrap}>
        <SectionHead
          title="What laundries offer"
          text="Every laundry sets its own prices. You'll see exactly what it charges before you book."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map(({ icon: Icon, title, text, priced }) => (
            <div key={title} className={`${card} p-6 flex flex-col`}>
              <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-blue-50 text-blue-600 mb-4">
                <Icon size={22} />
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 mb-2">{title}</h3>
              <p className="text-[15px] text-slate-600 leading-relaxed flex-1">{text}</p>
              <div className="mt-4"><Pill>{priced}</Pill></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===========================
// LAUNDRIES NEAR YOU (real data)
// ===========================
function FeaturedShops() {
  const [shops, setShops] = useState(null); // null = loading

  useEffect(() => {
    let cancelled = false;
    getFeaturedShops()
      .then((data) => {
        if (!cancelled) setShops((data.results ?? data).slice(0, 3));
      })
      .catch(() => {
        if (!cancelled) setShops([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="py-16 sm:py-20">
      <div className={wrap}>
        <SectionHead
          title="Laundries near you"
          action={<Link to="/shops" className={`${textLink} self-start sm:self-auto`}>See all shops →</Link>}
        />

        {shops === null ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[360px] bg-blue-50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : shops.length === 0 ? (
          <div className={`${card} max-w-lg p-7`}>
            <p className="text-xl font-extrabold text-slate-900">No laundries listed yet.</p>
            <p className="text-slate-600 mt-2">
              Run a laundry? Be the first on DryMe. It takes a few minutes to list your shop.
            </p>
            <Link to="/register" className={`${btn.primary} mt-5`}>List your shop</Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ===========================
// FOR LAUNDRIES: the other side of the marketplace
// ===========================
function ForLaundries() {
  const lines = [
    ["Order #00012", "+ KES 360", true],
    ["Order #00013", "+ KES 540", true],
    ["Withdrawal", "− KES 500", false],
  ];

  return (
    <section className="bg-blue-700 text-white py-16 sm:py-20">
      <div className={`${wrap} grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center`}>
        <div>
          <h2 className="text-[28px] sm:text-4xl font-extrabold tracking-tight leading-tight">
            Run a laundry? Get more orders.
          </h2>
          <p className="mt-4 text-lg text-blue-100 max-w-[44ch] leading-relaxed">
            List your shop, set your own prices and receive bookings from people nearby.
          </p>
          <ul className="mt-7 mb-8 space-y-3 font-semibold">
            {[
              "Accept, wash and complete orders from one dashboard",
              "Customers pay through M-Pesa before you start",
              "Withdraw your earnings to M-Pesa or your bank",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-0.5 w-[22px] h-[22px] rounded-full bg-white/15 flex items-center justify-center text-xs shrink-0">✓</span>
                {t}
              </li>
            ))}
          </ul>
          <Link to="/register" className={btn.light}>List your shop</Link>
        </div>

        <div className="w-full max-w-[400px] lg:ml-auto bg-white text-slate-800 rounded-3xl p-6 sm:p-7 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.55)]" aria-hidden="true">
          <p className="text-[13px] font-semibold text-slate-500">Wallet · sample</p>
          <p className="text-[34px] font-extrabold text-slate-900 mt-1 mb-4">KES 400</p>
          {lines.map(([name, amount, plus]) => (
            <div key={name} className="flex items-center justify-between py-3 border-t border-blue-100 text-[15px]">
              <span>{name}</span>
              <span className={`font-bold ${plus ? "text-emerald-600" : "text-slate-800"}`}>{amount}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Content() {
  return (
    <>
      <HowItWorks />
      <Services />
      <FeaturedShops />
      <ForLaundries />
    </>
  );
}

export default Content;