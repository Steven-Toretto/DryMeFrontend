import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { PageHeader, btn, card, textLink, wrap } from "../components/ui";

const CUSTOMERS = [
  "See laundries near you, their services and what other customers say",
  "Book a pickup and say exactly where to collect from",
  "Pay with M-Pesa and follow your order from confirmed to done",
];

const LAUNDRIES = [
  "List your shop and set your own prices",
  "Accept, wash and complete orders from one dashboard",
  "Get paid through M-Pesa and withdraw your earnings",
];

function Points({ items }) {
  return (
    <ul className="mt-5 space-y-3">
      {items.map((t) => (
        <li key={t} className="flex gap-3 leading-relaxed text-slate-700">
          <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Check size={12} strokeWidth={3} />
          </span>
          {t}
        </li>
      ))}
    </ul>
  );
}

function About() {
  return (
    <div>
      <PageHeader title="A marketplace for neighbourhood laundries.">
        <p className="text-lg text-slate-600 mt-4 max-w-2xl leading-relaxed">
          DryMe connects people in Nairobi with independent laundries. You book and pay in one place. The laundry
          collects your clothes, washes them and brings them back.
        </p>
      </PageHeader>

      <div className={`${wrap} py-10 sm:py-14`}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className={`${card} p-6 sm:p-8`}>
            <p className="text-sm font-bold text-blue-600">For customers</p>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">Laundry without the trip</h2>
            <Points items={CUSTOMERS} />
            <Link to="/shops" className={`${btn.primary} mt-7`}>Find a laundry</Link>
          </div>

          <div className={`${card} p-6 sm:p-8`}>
            <p className="text-sm font-bold text-blue-600">For laundries</p>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">More orders, less paperwork</h2>
            <Points items={LAUNDRIES} />
            <Link to="/register" className={`${btn.ghost} mt-7`}>List your shop</Link>
          </div>
        </div>

        <div className="mt-12 max-w-2xl">
          <h2 className="text-[26px] font-extrabold tracking-tight text-slate-900">How we fit in</h2>
          <p className="text-slate-700 mt-3 leading-relaxed">
            The laundries on DryMe are independent businesses. They wash and return your clothes, and DryMe provides
            the booking, payment and tracking around that. If something goes wrong with an order, raise it with the
            shop first, and{" "}
            <Link to="/contact" className={textLink}>get in touch with us</Link>{" "}
            if you need a hand. The details are in our{" "}
            <Link to="/terms-and-conditions" className={textLink}>terms</Link> and{" "}
            <Link to="/privacy-policy" className={textLink}>privacy policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;