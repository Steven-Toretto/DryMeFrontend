import { Link } from "react-router-dom";
import { BedDouble, Droplets, Shirt, Zap } from "lucide-react";
import { PageHeader, Pill, btn, card, wrap } from "../components/ui";

// No prices here on purpose: every laundry sets its own, and they're shown on the shop's page.
const SERVICES = [
  {
    icon: Droplets,
    name: "Wash & fold",
    priced: "By the kilo",
    text: "Everyday clothes, bedding and towels, washed, dried and folded. The usual way to send a basket of laundry.",
  },
  {
    icon: Shirt,
    name: "Dry cleaning",
    priced: "By the item",
    text: "Suits, dresses, coats and delicate fabrics that shouldn't go in a normal wash.",
  },
  {
    icon: Zap,
    name: "Ironing",
    priced: "By the item",
    text: "Shirts, trousers and work clothes pressed and returned ready to wear.",
  },
  {
    icon: BedDouble,
    name: "Duvets, curtains & bulky items",
    priced: "By the item",
    text: "The things that don't fit in a machine at home. Not every laundry takes these, so check the shop page.",
  },
];

const NOTES = [
  ["Prices", "Every laundry sets its own. Open a shop to see what it charges, by the kilo or by the item."],
  ["Weight", "When you book by weight you pick a load size. It's an estimate. The shop weighs your laundry when it collects, and you pay the final price."],
  ["Paying", "You pay with M-Pesa from My Orders. For laundry sold by weight, that's once the shop has weighed it. If the final price is well above your estimate, you approve it first."],
];

function Services() {
  return (
    <div>
      <PageHeader title="Services">
        <p className="text-lg text-slate-600 mt-3 max-w-xl">
          Most laundries on DryMe offer the same few things. Which ones, and at what price, depends on the shop.
        </p>
      </PageHeader>

      <div className={`${wrap} py-10 sm:py-14`}>
        <div className="grid gap-5 sm:grid-cols-2">
          {SERVICES.map(({ icon: Icon, name, priced, text }) => (
            <div key={name} className={`${card} p-6 sm:p-7 flex gap-5`}>
              <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <Icon size={24} />
              </span>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">{name}</h2>
                <p className="text-slate-600 mt-1.5 leading-relaxed">{text}</p>
                <div className="mt-3"><Pill>{priced}</Pill></div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.5fr] items-start">
          <div>
            <h2 className="text-[26px] sm:text-3xl font-extrabold tracking-tight leading-tight text-slate-900">
              Good to know before you book
            </h2>
            <Link to="/shops" className={`${btn.primary} mt-6`}>Find a laundry</Link>
          </div>

          <dl className={`${card} divide-y divide-blue-100`}>
            {NOTES.map(([k, v]) => (
              <div key={k} className="p-5 sm:flex gap-6">
                <dt className="text-sm font-bold text-blue-700 sm:w-24 shrink-0">{k}</dt>
                <dd className="text-slate-700 mt-1 sm:mt-0 leading-relaxed">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

export default Services;

