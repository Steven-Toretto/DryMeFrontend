import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, ThumbsUp, Droplets, CheckCircle2, XCircle, Ban, Star, ArrowDownLeft, Wallet,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { getNotifications, getUnreadCount, markNotificationsRead } from "../api";
import { dedupeById } from "./walletFormat";
import { badgeText, notificationInk, notificationTarget, timeAgo } from "./notificationFormat";

const PAPER = "#F1EAD8";
const CARD = "#FBF8EF";
const INK = "#2B2A25";
const BLUE = "#35548C";
const TICKET_FONT = "'Special Elite', 'Courier New', monospace";

const EMPTY_LIST = { items: [], page: 1, hasMore: false, loading: false, loadingMore: false, error: "" };

function TypeIcon({ type }) {
  switch (type) {
    case "order_confirmed": return <ThumbsUp size={15} />;
    case "order_washing": return <Droplets size={15} />;
    case "order_completed": return <CheckCircle2 size={15} />;
    case "order_declined": return <XCircle size={15} />;
    case "order_cancelled": return <Ban size={15} />;
    case "new_review": return <Star size={15} />;
    case "wallet_credited": return <ArrowDownLeft size={15} />;
    case "payout_approved":
    case "payout_paid":
    case "payout_rejected":
    case "payout_failed":
      return <Wallet size={15} />;
    default: return <Bell size={15} />;
  }
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

/**
 * tone      "dark" for a dark bar (white icon) · default for light / paper backgrounds
 * onSelect  (notification, target) => void. Optional: the dashboard uses it to switch its own view.
 *           Without it the bell navigates (owners -> /dashboard with state.view, customers -> /orders).
 */
function NotificationBell({ tone = "light", onSelect }) {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [list, setList] = useState(EMPTY_LIST);

  const refreshUnread = useCallback(async () => {
    try {
      const data = await getUnreadCount();
      setUnread(Number(data.count) || 0);
    } catch {
      // keep the last number; the next tick will try again
    }
  }, []);

  // Badge: check on mount, then every 30s.
  useEffect(() => {
    if (!token) return undefined;
    refreshUnread();
    const id = setInterval(refreshUnread, 30000);
    return () => clearInterval(id);
  }, [token, refreshUnread]);

  // Escape closes the panel.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const openPanel = async () => {
    setOpen(true);
    setList((l) => ({ ...l, loading: true, error: "" }));
    try {
      const data = await getNotifications(1);
      setList({
        items: data.results ?? data,
        page: 1,
        hasMore: Boolean(data.next),
        loading: false,
        loadingMore: false,
        error: "",
      });
      // Opening the panel counts as reading. The rows we just loaded keep their unread dot for this visit.
      if (Number(data.unread_count) > 0) {
        try {
          await markNotificationsRead();
          setUnread(0);
        } catch {
          // badge stays until the next successful check
        }
      }
    } catch (err) {
      console.error("Notifications load failed:", err.response?.data || err.message);
      setList((l) => ({ ...l, loading: false, error: "Couldn't load your notifications." }));
    }
  };

  const loadMore = async () => {
    setList((l) => ({ ...l, loadingMore: true }));
    try {
      const data = await getNotifications(list.page + 1);
      setList((l) => ({
        ...l,
        items: dedupeById([...l.items, ...(data.results ?? data)]),
        page: l.page + 1,
        hasMore: Boolean(data.next),
        loadingMore: false,
      }));
    } catch (err) {
      console.error("Notifications load more failed:", err.response?.data || err.message);
      setList((l) => ({ ...l, loadingMore: false }));
    }
  };

  const select = (notification) => {
    setOpen(false);
    const target = notificationTarget(notification, user?.role);
    if (onSelect) {
      onSelect(notification, target);
    } else if (target.kind === "view") {
      navigate(target.to, { state: { view: target.view } });
    } else {
      navigate(target.to);
    }
  };

  if (!token) return null;

  const badge = badgeText(unread);
  const dark = tone === "dark";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPanel())}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`relative w-11 h-11 flex items-center justify-center rounded-lg transition ${
          dark ? "text-white hover:bg-white/10" : "hover:bg-black/5"
        }`}
        style={dark ? undefined : { color: INK }}
      >
        <Bell size={21} />
        {badge && (
          <span
            className="absolute top-1 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
            style={{ background: "#9C3B2E", fontFamily: TICKET_FONT }}
          >
            {badge}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* click-away layer */}
          <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} aria-hidden="true" />

          <div
            role="dialog"
            aria-label="Notifications"
            className="fixed inset-x-3 top-16 z-[70] md:absolute md:inset-x-auto md:right-0 md:top-full md:mt-2 md:w-96 max-h-[70vh] flex flex-col rounded-sm border shadow-xl"
            style={{ background: CARD, borderColor: `${INK}25` }}
          >
            <div className="px-4 pt-4 pb-3 border-b border-dashed shrink-0" style={{ borderColor: `${INK}25` }}>
              <p className="text-[10px] tracking-[0.25em]" style={{ fontFamily: TICKET_FONT, color: `${INK}66` }}>
                NOTIFICATIONS
              </p>
            </div>

            <div className="overflow-y-auto overscroll-contain">
              {list.loading && list.items.length === 0 ? (
                <div className="p-8 flex justify-center" style={{ color: `${INK}80` }}><Spinner /></div>
              ) : list.error ? (
                <div className="p-6 text-center">
                  <p className="text-sm" style={{ color: "#9C3B2E" }}>{list.error}</p>
                  <button
                    type="button"
                    onClick={openPanel}
                    className="mt-3 min-h-[44px] px-5 rounded-sm text-white text-sm font-bold"
                    style={{ background: BLUE }}
                  >
                    Try again
                  </button>
                </div>
              ) : list.items.length === 0 ? (
                <p className="p-8 text-center text-sm" style={{ color: `${INK}80` }}>
                  Nothing yet — order and payout updates show up here.
                </p>
              ) : (
                <ul>
                  {list.items.map((n) => {
                    const ink = notificationInk(n.notif_type);
                    return (
                      <li key={n.id} className="border-b border-dashed last:border-b-0" style={{ borderColor: `${INK}20` }}>
                        <button
                          type="button"
                          onClick={() => select(n)}
                          className="w-full min-h-[56px] flex items-start gap-3 px-4 py-3 text-left hover:bg-black/5"
                          style={n.is_read ? undefined : { background: `${BLUE}0A` }}
                        >
                          <span
                            className="w-8 h-8 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0"
                            style={{ borderColor: ink, color: ink }}
                          >
                            <TypeIcon type={n.notif_type} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm break-words" style={{ color: INK, fontWeight: n.is_read ? 500 : 700 }}>
                              {n.message}
                            </span>
                            <span className="block text-[11px] mt-0.5" style={{ fontFamily: TICKET_FONT, color: `${INK}70` }}>
                              {timeAgo(n.created_at)}
                            </span>
                          </span>
                          {!n.is_read && (
                            <span className="w-2 h-2 mt-2 rounded-full shrink-0" style={{ background: BLUE }} aria-label="Unread" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {list.hasMore && (
                <div className="p-3">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={list.loadingMore}
                    className="w-full min-h-[44px] rounded-sm border-2 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{ borderColor: `${BLUE}40`, color: BLUE, background: PAPER }}
                  >
                    {list.loadingMore ? (<><Spinner /> Loading…</>) : "Load more"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationBell;