import { Link } from "react-router-dom";
import { Shirt } from "lucide-react";

/*
  DryMe's look: classic white with soft blue. A few shared class strings and pieces, so the whole site
  changes together. Colours are Tailwind's own names (white, slate-*, blue-*); blue-* is the soft blue
  scale defined in index.css, blue-600 being the brand colour.
*/

// ---------- buttons (class strings: they work on <button>, <Link> and <a>) ----------
const BTN =
  "inline-flex items-center justify-center gap-2 min-h-[46px] px-6 rounded-xl text-[15px] font-semibold transition cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed";

export const btn = {
  primary: `${BTN} bg-blue-600 text-white shadow-sm hover:bg-blue-700`,
  ghost: `${BTN} bg-white text-blue-700 border border-blue-200 hover:bg-blue-50`,
  light: `${BTN} bg-white text-blue-700 hover:bg-blue-50`,
  small:
    "inline-flex items-center justify-center min-h-[40px] px-4 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition",
};

export const textLink =
  "font-semibold text-blue-700 hover:text-blue-800 hover:underline underline-offset-4";

// ---------- surfaces and form fields ----------
export const card =
  "bg-white border border-blue-100 rounded-2xl shadow-[0_1px_2px_rgb(23_59_96/0.05),0_14px_28px_-20px_rgb(23_59_96/0.28)]";

export const field =
  "w-full bg-white border border-slate-300 rounded-lg px-4 min-h-[48px] text-base text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

export const fieldLabel = "block text-sm font-semibold text-slate-700 mb-1.5";

// shared width wrapper
export const wrap = "max-w-6xl mx-auto px-5 sm:px-6";

// ---------- the mark ----------
export function Logo({ to = "/", light = false, className = "" }) {
  return (
    <Link to={to} className={`flex items-center gap-2.5 shrink-0 ${className}`}>
      <span className="w-9 h-9 rounded-[10px] bg-blue-600 text-white flex items-center justify-center">
        <Shirt size={19} strokeWidth={2} />
      </span>
      <span className={`text-[21px] font-extrabold tracking-tight ${light ? "text-white" : "text-slate-900"}`}>
        Dry<span className={light ? "text-blue-200" : "text-blue-600"}>Me</span>
      </span>
    </Link>
  );
}

// ---------- section heading ----------
export function SectionHead({ title, text, action, light = false, className = "mb-10 sm:mb-12" }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 ${className}`}>
      <div className="max-w-xl">
        <h2 className={`text-[28px] sm:text-4xl font-extrabold tracking-tight leading-tight ${light ? "text-white" : "text-slate-900"}`}>
          {title}
        </h2>
        {text && <p className={`mt-3 text-base sm:text-lg ${light ? "text-blue-100" : "text-slate-600"}`}>{text}</p>}
      </div>
      {action}
    </div>
  );
}

// ---------- header band for inner pages ----------
export function PageHeader({ title, children }) {
  return (
    <div className="bg-blue-50 border-b border-blue-100">
      <div className={`${wrap} py-10 sm:py-14`}>
        <h1 className="text-[32px] sm:text-[42px] font-extrabold tracking-tight leading-tight text-slate-900">{title}</h1>
        {children}
      </div>
    </div>
  );
}

// small rounded tag, e.g. "By the kilo"
export function Pill({ children, className = "bg-blue-50 text-blue-700" }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${className}`}>{children}</span>
  );
}

// ---------- typewriter label ----------
export function Label({ children, light = false, className = "" }) {
  return (
    <p className={`font-ticket text-[11px] tracking-[0.25em] uppercase ${light ? "text-paper/60" : "text-ink/55"} ${className}`}>
      {children}
    </p>
  );
}

// ---------- ticket card with the punch hole it hangs from ----------
export function Ticket({ children, className = "", hole = true, holeClass = "left-7", as: Tag = "div", ...rest }) {
  return (
    <Tag
      className={`relative bg-card border border-ink/20 rounded-sm shadow-[0_1px_0_rgb(43_42_37/0.06)] ${className}`}
      {...rest}
    >
      {hole && (
        <span
          aria-hidden="true"
          className={`absolute -top-2.5 ${holeClass} w-4 h-4 rounded-full bg-paper border border-ink/25`}
        />
      )}
      {children}
    </Tag>
  );
}

// ---------- dashed tear line, optionally with the half-circle notches at each edge ----------
export function Perforation({ notches = false, notchClass = "bg-paper", className = "my-4" }) {
  return (
    <div className={`relative border-t-2 border-dashed border-ink/20 ${className}`}>
      {notches && (
        <>
          <span aria-hidden="true" className={`absolute -top-[9px] -left-2 w-4 h-4 rounded-full ${notchClass}`} />
          <span aria-hidden="true" className={`absolute -top-[9px] -right-2 w-4 h-4 rounded-full ${notchClass}`} />
        </>
      )}
    </div>
  );
}

// ---------- strip of kraft tape holding a photo or card ----------
export function Tape({ className = "-top-3 left-8 -rotate-3" }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute z-10 w-[72px] h-[22px] bg-kraft/80 border-x border-dashed border-ink/15 ${className}`}
    />
  );
}

// ---------- ink stamp ----------
export function Stamp({ children, className = "text-moss border-moss", rotate = -6 }) {
  return (
    <span
      className={`inline-block font-ticket font-bold tracking-[0.15em] text-xs px-3 py-1 border-[3px] rounded-[3px] select-none whitespace-nowrap opacity-85 mix-blend-multiply ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  );
}

// underlined text link, like an inked "see all" on a price list
export const inkLink = "font-bold border-b-2 border-ink pb-0.5 hover:text-denim hover:border-denim transition";
