import { useState } from "react";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHeader, btn, card, field, fieldLabel, wrap } from "../components/ui";
import { SITE } from "../config/site";

function Contact() {
  const [form, setForm] = useState({ name: "", message: "" });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // There's no mail endpoint on the backend, so this opens the person's own email app, ready to send.
  const submit = (e) => {
    e.preventDefault();
    const subject = `DryMe enquiry${form.name ? ` from ${form.name}` : ""}`;
    const body = `${form.message}\n\n${form.name ? `— ${form.name}` : ""}`.trim();
    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const details = [
    SITE.email && { icon: Mail, label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
    SITE.phone && { icon: Phone, label: "Phone", value: SITE.phone, href: `tel:${SITE.phone.replace(/\s+/g, "")}` },
    SITE.whatsapp && { icon: MessageCircle, label: "WhatsApp", value: "Message us", href: SITE.whatsapp },
    SITE.hours && { icon: Clock, label: "Hours", value: SITE.hours },
    SITE.city && { icon: MapPin, label: "Based in", value: SITE.city },
  ].filter(Boolean);

  return (
    <div>
      <PageHeader title="Contact us">
        <p className="text-lg text-slate-600 mt-3 max-w-xl">
          Question about an order, or want to list your laundry? Write to us and we'll get back to you.
        </p>
      </PageHeader>

      <div className={`${wrap} py-10 sm:py-14 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start`}>

        <form onSubmit={submit} className={`${card} p-6 sm:p-8`}>
          <h2 className="text-2xl font-extrabold text-slate-900">Send us a message</h2>

          <label htmlFor="c-name" className={`${fieldLabel} mt-6`}>Your name</label>
          <input id="c-name" value={form.name} onChange={set("name")} autoComplete="name" className={`${field} mb-5`} placeholder="e.g. Wanjiru" />

          <label htmlFor="c-message" className={fieldLabel}>How can we help?</label>
          <textarea
            id="c-message"
            required
            rows={6}
            value={form.message}
            onChange={set("message")}
            className={`${field} py-3 resize-y`}
            placeholder="If it's about an order, include the order number from My Orders."
          />

          <button type="submit" disabled={!form.message.trim()} className={`${btn.primary} w-full sm:w-auto mt-6`}>
            Open in my email app
          </button>
          <p className="text-xs text-slate-500 mt-3">
            This opens your email app with the message ready to send to {SITE.email}.
          </p>
        </form>

        <aside className="bg-blue-50 border border-blue-100 rounded-2xl p-6 sm:p-7">
          <h2 className="text-lg font-extrabold text-slate-900">Details</h2>
          <ul className="mt-4 divide-y divide-blue-100">
            {details.map(({ icon: Icon, label, value, href }) => (
              <li key={label} className="flex gap-3.5 py-4 first:pt-0 last:pb-0">
                <span className="w-9 h-9 rounded-lg bg-white text-blue-600 flex items-center justify-center shrink-0">
                  <Icon size={17} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-500">{label}</p>
                  {href ? (
                    <a href={href} className="font-semibold text-slate-900 break-words hover:text-blue-700">{value}</a>
                  ) : (
                    <p className="font-semibold text-slate-900">{value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

export default Contact;