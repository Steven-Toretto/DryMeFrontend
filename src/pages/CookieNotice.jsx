import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";

const INK = "#2B2A25";
const CARD = "#FBF8EF";
const TICKET_FONT = "'Special Elite', 'Courier New', monospace";
const STORAGE_KEY = "dryme_cookie_notice_dismissed";

// Informational notice — DryMe currently only uses essential storage
// (keeping you logged in). If analytics/marketing tools are added later,
// upgrade this to a real accept/decline choice before they load.
function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // Storage unavailable (private mode etc.) — show the notice each visit
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore — notice will simply reappear next visit
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-[60] rounded-sm border shadow-lg p-4"
      style={{ background: CARD, borderColor: `${INK}25` }}
      role="dialog"
      aria-label="Cookie notice"
    >
      <button
        onClick={dismiss}
        className="absolute top-2.5 right-2.5 hover:opacity-70"
        style={{ color: `${INK}70` }}
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>

      <div className="flex items-start gap-3 pr-5">
        <Cookie size={18} className="mt-0.5 shrink-0" style={{ color: "#B5811E" }} />
        <div>
          <p className="text-[10px] tracking-[0.2em] mb-1" style={{ fontFamily: TICKET_FONT, color: `${INK}66` }}>
            COOKIES
          </p>
          <p className="text-xs leading-relaxed" style={{ color: `${INK}CC` }}>
            DryMe uses essential cookies and local storage to keep you signed in and the site
            working. Learn more in our{" "}
            <Link to="/privacy" className="font-semibold underline" style={{ color: "#35548C" }}>
              Privacy Policy
            </Link>
            .
          </p>
          <button
            onClick={dismiss}
            className="mt-3 px-4 py-1.5 text-xs font-bold rounded-sm text-white"
            style={{ background: "#35548C" }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

export default CookieNotice;