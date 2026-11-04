import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin, Star, Shirt, ArrowLeft } from "lucide-react";
import { getServices, getShop, getShopReviews } from "../api";
import { Pill, btn, card, textLink, wrap } from "../components/ui";
import { shopImageUrl } from "../components/ShopCard";
import { kes } from "../components/walletFormat";

function ShopDetails() {
  const { id } = useParams();

  const [shop, setShop] = useState(null);
  const [services, setServices] = useState([]);
  const [fetching, setFetching] = useState(true);

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // ===============================
  // FETCH SHOP + SERVICES + REVIEWS
  // ===============================
  useEffect(() => {
    if (!id) return undefined;
    let cancelled = false;

    (async () => {
      try {
        setFetching(true);
        const [shopData, servicesData] = await Promise.all([getShop(id), getServices(id)]);
        if (cancelled) return;
        setShop(shopData);
        setServices(servicesData.results ?? servicesData);
      } catch (err) {
        console.error("Failed to load shop details:", err);
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();

    (async () => {
      try {
        setLoadingReviews(true);
        const data = await getShopReviews(id);
        if (!cancelled) setReviews(data.results ?? data);
      } catch (err) {
        console.error("Couldn't load reviews:", err.response?.data || err.message);
      } finally {
        if (!cancelled) setLoadingReviews(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // ===============================
  // ARRIVING FROM A "Book" LINK (…/shop/12#book): scroll to the booking card
  // ===============================
  useEffect(() => {
    if (!fetching && window.location.hash === "#book") {
      document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [fetching]);

  // ===============================
  // LOADING / NOT FOUND
  // ===============================
  if (fetching) {
    return (
      <div className={`${wrap} py-24 text-center`}>
        <p className="text-sm font-semibold text-slate-500">Loading shop…</p>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className={`${wrap} py-16`}>
        <div className={`${card} max-w-md mx-auto p-8 text-center`}>
          <p className="text-xl font-extrabold text-slate-900">We couldn't find that shop.</p>
          <p className="text-slate-600 mt-2">It may have been removed, or the link is wrong.</p>
          <Link to="/shops" className={`${btn.primary} mt-5`}>Browse laundries</Link>
        </div>
      </div>
    );
  }

  // ===============================
  // UI
  // ===============================
  const imageUrl = shopImageUrl(shop);
  const rated = Number(shop.review_count) > 0;
  const bookPath = `/shop/${id}/book`;

  return (
    <div className="bg-blue-50/60">
      <div className={`${wrap} py-8 sm:py-12`}>

        <Link to="/shops" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-blue-700 mb-6">
          <ArrowLeft size={15} /> All laundries
        </Link>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-10 items-start">

          {/* ============ THE SHOP ============ */}
          <div className={`${card} lg:col-start-1 lg:row-start-1 overflow-hidden`}>
            <div className="h-56 sm:h-72 bg-gradient-to-br from-blue-100 to-blue-200">
              {imageUrl ? (
                <img src={imageUrl} alt={shop.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-blue-400">
                  <Shirt size={52} strokeWidth={1.4} />
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8">
              <h1 className="text-[28px] sm:text-[34px] font-extrabold tracking-tight leading-tight text-slate-900">
                {shop.name}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                {rated ? (
                  <span className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={16}
                        className="text-amber-500"
                        fill={n <= Math.round(shop.average_rating) ? "currentColor" : "none"}
                      />
                    ))}
                    <span className="text-sm font-bold text-slate-800 ml-1">{shop.average_rating}</span>
                    <span className="text-sm text-slate-500">
                      ({shop.review_count} {shop.review_count === 1 ? "review" : "reviews"})
                    </span>
                  </span>
                ) : (
                  <Pill>New on DryMe</Pill>
                )}
                <span className="flex items-center gap-1.5 text-slate-600">
                  <MapPin size={15} className="text-blue-600 shrink-0" /> {shop.location}
                </span>
              </div>

              <p className="mt-5 text-slate-700 leading-relaxed whitespace-pre-line">{shop.description}</p>

              {/* map: the owner's real pin if they set one, otherwise an honest fallback */}
              {shop.lat && shop.lng ? (
                <div className="mt-6 border border-blue-100 rounded-xl overflow-hidden">
                  <iframe
                    title={`${shop.name} location`}
                    src={`https://www.google.com/maps?q=${shop.lat},${shop.lng}&output=embed`}
                    width="100%"
                    height="220"
                    style={{ border: 0 }}
                    loading="lazy"
                  />
                  <a
                    href={`https://www.google.com/maps?q=${shop.lat},${shop.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 min-h-[44px] text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100"
                  >
                    <MapPin size={14} /> Open in Google Maps
                  </a>
                </div>
              ) : (
                <div className="mt-6 bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-slate-600">This shop hasn't pinned its exact location yet.</p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.location)}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`${textLink} inline-flex items-center gap-1.5 text-sm mt-1.5`}
                  >
                    <MapPin size={14} /> Search “{shop.location}” on Google Maps
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* ============ BOOK A PICKUP: the booking itself happens in four short steps on its own page ============ */}
          <div
            id="book"
            className={`${card} lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-24 scroll-mt-24 p-6 sm:p-7`}
          >
            <h2 className="text-2xl font-extrabold text-slate-900">Book a pickup</h2>
            <p className="text-sm text-slate-500 mt-1">
              Four quick steps: pick a service, say where to collect, choose a time, confirm.
            </p>

            {services.length === 0 ? (
              <p className="mt-6 text-sm text-slate-500 text-center">This shop hasn't added any services yet.</p>
            ) : (
              <>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mt-6 mb-2">Services</p>
                <ul className="rounded-xl border border-blue-100 divide-y divide-blue-100 overflow-hidden">
                  {services.map((s) => (
                    <li key={s.id}>
                      <Link
                        to={`${bookPath}?service=${s.id}`}
                        className="flex items-center justify-between gap-3 px-4 min-h-[52px] hover:bg-blue-50 transition"
                      >
                        <span className="text-sm font-semibold text-slate-900">{s.name}</span>
                        <span className="text-sm text-slate-600 shrink-0">
                          {kes(s.price)} / {s.pricing_type === "per_item" ? "item" : "kg"}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <Link to={bookPath} className={`${btn.primary} w-full mt-5`}>Book a pickup</Link>
                <p className="text-xs text-slate-500 text-center mt-3 leading-relaxed">
                  Nothing is charged when you book. You pay with M-Pesa from My Orders: for laundry sold by weight,
                  after the shop has weighed it.
                </p>
              </>
            )}
          </div>

          {/* ============ REVIEWS ============ */}
          <section className="lg:col-start-1 lg:row-start-2">
            <h2 className="text-xl font-extrabold text-slate-900 mb-4">
              Reviews {shop.review_count > 0 && <span className="text-base font-semibold text-slate-500">({shop.review_count})</span>}
            </h2>

            {loadingReviews ? (
              <p className="text-sm text-slate-500">Loading reviews…</p>
            ) : reviews.length === 0 ? (
              <div className="bg-white border border-blue-100 rounded-2xl p-6 text-center text-sm text-slate-500">
                No reviews yet. Be the first to book and rate this shop.
              </div>
            ) : (
              <ul className="space-y-3">
                {reviews.map((r) => (
                  <li key={r.id} className="bg-white border border-blue-100 rounded-2xl p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-bold text-slate-900">{r.username}</span>
                      <span className="flex items-center gap-0.5" aria-label={`${r.rating} out of 5`}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} size={13} className="text-amber-500" fill={n <= r.rating ? "currentColor" : "none"} />
                        ))}
                      </span>
                    </div>
                    {r.comment && <p className="text-sm text-slate-700 mt-2">{r.comment}</p>}
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(r.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}

export default ShopDetails;