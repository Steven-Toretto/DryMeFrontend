import { Link } from "react-router-dom";
import { Logo } from "./ui";
import { SITE } from "../config/site";

const COLUMNS = [
  {
    title: "Customers",
    links: [
      { to: "/shops", label: "Find a laundry" },
      { to: "/orders", label: "My orders" },
      { to: "/services", label: "Services" },
    ],
  },
  {
    title: "Laundries",
    links: [
      { to: "/register", label: "List your shop" },
      { to: "/dashboard", label: "Owner dashboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
      { to: "/privacy-policy", label: "Privacy policy" },
      { to: "/terms-and-conditions", label: "Terms & conditions" },
    ],
  },
];

const heading = "text-sm font-bold text-slate-900 mb-4";
const link = "text-slate-600 hover:text-blue-700 transition";

function Footer() {
  const socials = Object.entries(SITE.social || {});

  return (
    <footer className="bg-blue-50 border-t border-blue-100 text-[14.5px] text-slate-600">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-14 pb-7">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">

          <div className="sm:col-span-2 lg:col-span-1">
            <Logo />
            <p className="mt-4 max-w-[30ch] leading-relaxed">
              A marketplace connecting {SITE.city.split(",")[0]} customers with neighbourhood laundries.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className={heading}>{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className={link}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className={heading}>Contact</h4>
            <ul className="space-y-2.5">
              {SITE.email && (
                <li><a href={`mailto:${SITE.email}`} className={link}>{SITE.email}</a></li>
              )}
              {SITE.phone && (
                <li><a href={`tel:${SITE.phone.replace(/\s+/g, "")}`} className={link}>{SITE.phone}</a></li>
              )}
              {SITE.whatsapp && (
                <li><a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className={link}>WhatsApp</a></li>
              )}
              {SITE.city && <li>{SITE.city}</li>}
              {SITE.hours && <li className="text-slate-500">{SITE.hours}</li>}
              {socials.map(([name, url]) => (
                <li key={name}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className={`${link} capitalize`}>{name}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-5 border-t border-blue-200 flex flex-col sm:flex-row gap-2 sm:justify-between text-[13px] text-slate-500">
          <span>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</span>
          <span>Pay with M-Pesa · Kenya</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;