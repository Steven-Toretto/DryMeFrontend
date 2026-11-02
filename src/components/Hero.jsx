import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, MapPin } from "lucide-react";
import { Pill, btn, wrap } from "./ui";

// What an order looks like once you've booked. Sample figures, not real data.
function TrackingCard() {
  const steps = [
    { title: "Booked", note: "Today, 9:12 am", state: "done" },
    { title: "Picked up", note: "Today, 10:40 am", state: "done" },
    { title: "Being washed", note: "The laundry is on it", state: "now" },
    { title: "On its way back", note: "We'll let you know", state: "todo" },
  ];

  return (
    <div
      className="relative w-full max-w-[430px] lg:ml-auto bg-white border border-blue-100 rounded-3xl p-6 sm:p-7 shadow-[0_30px_50px_-30px_rgb(23_59_96/0.45)]"
      aria-hidden="true"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-slate-500">Order #00012 · Suds &amp; Co</p>
          <p className="text-xl font-extrabold text-slate-900 mt-0.5">Wash &amp; fold · 4 kg</p>
        </div>
        <Pill className="bg-emerald-50 text-emerald-700">Paid</Pill>
      </div>

      <ol className="mt-6">
        {steps.map((s, i) => (
          <li key={s.title} className="relative flex gap-3.5 pb-5 last:pb-1">
            {i < steps.length - 1 && (
              <span
                className={`absolute left-[11px] top-6 bottom-0 w-0.5 ${s.state === "done" ? "bg-blue-500" : "bg-blue-100"}`}
              />
            )}
            <span
              className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 ${
                s.state === "done"
                  ? "bg-blue-600 border-blue-600 text-white"
                  : s.state === "now"
                  ? "bg-white border-blue-600 ring-4 ring-blue-100"
                  : "bg-white border-blue-200"
              }`}
            >
              {s.state === "done" && <Check size={13} strokeWidth={3} />}
            </span>
            <span className="leading-snug">
              <span className={`block text-[15px] font-bold ${s.state === "todo" ? "text-slate-400" : "text-slate-900"}`}>
                {s.title}
              </span>
              <span className="block text-[13px] text-slate-500">{s.note}</span>
            </span>
          </li>
        ))}
      </ol>

      <div className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3.5 mt-3 text-sm text-slate-600">
        <span>Total · M-Pesa</span>
        <span className="text-[17px] font-extrabold text-slate-900">KES 480</span>
      </div>
    </div>
  );
}

function Hero() {
  const navigate = useNavigate();
  const [where, setWhere] = useState("");

  // The search is real: it opens the shop list already filtered by what you typed.
  const search = (e) => {
    e.preventDefault();
    const q = where.trim();
    navigate(q ? `/shops?q=${encodeURIComponent(q)}` : "/shops");
  };

  return (
    <header className="relative overflow-hidden bg-blue-50">
      {/* two soft circles, the only decoration */}
      <div className="pointer-events-none absolute -right-32 -top-36 w-[560px] h-[560px] rounded-full bg-blue-100" />
      <div className="pointer-events-none absolute right-[340px] -bottom-48 w-[340px] h-[340px] rounded-full bg-blue-100/60" />

      <div className={`${wrap} relative grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-14 items-center py-12 sm:py-16 lg:py-20`}>

        <div>
          <Pill className="bg-white border border-blue-200 text-blue-700 gap-2 py-1.5 px-3.5 text-[13px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Now serving Nairobi
          </Pill>

          <h1 className="mt-5 text-[40px] sm:text-5xl lg:text-[56px] font-extrabold tracking-tight leading-[1.08] text-slate-900">
            Laundry day, <span className="text-blue-600">sorted.</span>
          </h1>

          <p className="mt-5 text-lg text-slate-600 max-w-[36ch] leading-relaxed">
            Book a pickup from a laundry near you and pay with M-Pesa. They collect it, wash it and bring it back.
          </p>

          <form
            onSubmit={search}
            className="mt-8 flex flex-col sm:flex-row gap-2 bg-white border border-blue-200 rounded-2xl p-2 max-w-[520px] shadow-[0_12px_28px_-18px_rgb(23_59_96/0.35)]"
          >
            <label className="flex-1 flex items-center gap-2.5 px-3 min-h-[48px]">
              <MapPin size={18} className="text-slate-400 shrink-0" />
              <input
                type="search"
                value={where}
                onChange={(e) => setWhere(e.target.value)}
                placeholder="Where are you? e.g. Kilimani"
                aria-label="Your neighbourhood"
                className="w-full bg-transparent outline-none text-base text-slate-900 placeholder:text-slate-400"
              />
            </label>
            <button type="submit" className={btn.primary}>Find laundries</button>
          </form>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-slate-600">
            {["Pay with M-Pesa", "Track every order", "Rate your laundry"].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Check size={15} strokeWidth={3} className="text-emerald-600" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <TrackingCard />
      </div>
    </header>
  );
}

export default Hero;