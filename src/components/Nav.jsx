import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, LogOut, Menu, X, ChevronDown } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import { Logo, btn } from "./ui";

function Nav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, logoutUser } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const role = user?.role;
  const isOwner = role === "owner";

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
    setOpen(false);
    setMobileMenu(false);
  };

  // /shop/12 (a single laundry) should light up "Shops" too
  const isActive = (to) =>
    to === "/shops" ? location.pathname.startsWith("/shop") : location.pathname === to;

  const links = [
    { to: "/", label: "Home"},
    { to: "/shops", label: "Shops" },
    ...(token ? [{ to: "/orders", label: "My Orders" }] : []),
    { to: "/services", label: "Services" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  const linkClass = (to) =>
    `px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
      isActive(to) ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
    }`;

  const initial = user?.username?.charAt(0).toUpperCase() || (isOwner ? "O" : "U");
  const displayName = user?.username || (isOwner ? "Owner" : "Account");

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-blue-100">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 h-[68px] flex items-center justify-between gap-4">

        <Logo />

        {/* ========================= DESKTOP LINKS ========================= */}
        {!isOwner && (
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className={linkClass(l.to)}>
                {l.label}
              </Link>
            ))}
          </div>
        )}

        {/* ========================= RIGHT SIDE ========================= */}
        <div className="flex items-center gap-1 sm:gap-3">

          {token && <NotificationBell />}

          {/* owner: Dashboard shortcut */}
          {isOwner && token && (
            <Link to="/dashboard" className={`hidden md:inline-flex ${btn.small}`}>
              Dashboard
            </Link>
          )}

          {/* signed in: profile menu */}
          {token && (
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                className="flex items-center gap-2 h-11 pl-1.5 pr-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition"
              >
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                  {initial}
                </span>
                <span className="text-sm font-semibold text-slate-800 max-w-[120px] truncate">{displayName}</span>
                <ChevronDown size={14} className={`text-slate-400 transition ${open ? "rotate-180" : ""}`} />
              </button>

              {open && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
                  <div className="absolute right-0 mt-2 w-52 z-50 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 overflow-hidden">
                    <Link
                      to="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <User size={16} /> My profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} /> Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* guest */}
          {!token && (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900">
                Sign in
              </Link>
              <Link to="/register" className={btn.small}>
                Get started
              </Link>
            </div>
          )}

          {/* mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden w-11 h-11 flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100"
            aria-label="Toggle menu"
            aria-expanded={mobileMenu}
          >
            {mobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ========================= MOBILE MENU ========================= */}
      {mobileMenu && (
        <div className="md:hidden border-t border-blue-100 bg-white px-5 pt-3 pb-5 shadow-lg">

          {token && (
            <Link
              to="/profile"
              onClick={() => setMobileMenu(false)}
              className="flex items-center gap-3 p-3 mb-2 rounded-xl bg-blue-50"
            >
              <span className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                {initial}
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-slate-900 truncate">{displayName}</span>
                <span className="block text-xs text-slate-500">
                  {isOwner ? "Shop owner" : "Customer"} · View profile
                </span>
              </span>
            </Link>
          )}

          {!isOwner &&
            links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobileMenu(false)}
                className={`flex items-center min-h-[48px] px-3 rounded-lg text-[15px] font-semibold ${
                  isActive(l.to) ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {l.label}
              </Link>
            ))}

          {isOwner && token && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenu(false)}
              className="flex items-center min-h-[48px] px-3 rounded-lg text-[15px] font-semibold text-slate-700 hover:bg-slate-50"
            >
              Dashboard
            </Link>
          )}

          {token ? (
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 min-h-[48px] px-3 mt-1 w-full rounded-lg text-[15px] font-semibold text-red-600 hover:bg-red-50"
            >
              <LogOut size={17} /> Log out
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-4">
              <Link to="/login" onClick={() => setMobileMenu(false)} className={btn.ghost}>
                Sign in
              </Link>
              <Link to="/register" onClick={() => setMobileMenu(false)} className={btn.primary}>
                Get started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Nav;