import { useEffect, useState } from "react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { MapPin, CheckCircle2, Star, Shirt, ArrowLeft } from "lucide-react";
import {
  getServices,
  createOrder,
  getShop,
  getProfile,
  getShopReviews,
} from "../api";
import { Pill, btn, card, field, fieldLabel, textLink, wrap } from "../components/ui";
import { shopImageUrl } from "../components/ShopCard";
import { reverseGeocode } from "../utils/reverseGeocode";

// {"customer_phone": ["A phone number is required."]} -> "A phone number is required."
const readableError = (data) => {
  if (!data) return "";
  if (typeof data === "string") return data;
  if (Array.isArray(data)) return data.map(readableError).join(" ");
  if (typeof data === "object") return Object.values(data).map(readableError).join(" ");
  return String(data);
};

// Nobody can reliably guess "my laundry weighs 3.5kg" — let people pick
// a load size they can actually judge by eye instead. Each maps to an
// estimated kg figure used for the price shown.
const LOAD_SIZES = [
  { key: "small", label: "Small", kg: 2, desc: "A few days of clothes for one person" },
  { key: "medium", label: "Medium", kg: 4, desc: "A full laundry basket" },
  { key: "large", label: "Large", kg: 6, desc: "Bedding plus a few days of clothes" },
  { key: "xl", label: "Extra Large", kg: 9, desc: "A duffel bag — multiple loads" },
];

function ShopDetails() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const preselectService = searchParams.get("service");
  const preselectWeight = searchParams.get("weight");

  // ===============================
  // STATES
  // ===============================
  const [shop, setShop] = useState(null);

  const [services, setServices] = useState([]);

  const [selectedService, setSelectedService] =
    useState(preselectService || "");

  const [weight, setWeight] = useState(preselectWeight ? Number(preselectWeight) : "");
  const [quantity, setQuantity] = useState(1);
  const [loadSize, setLoadSize] = useState(""); // which basket-size button is selected
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");

  // 📍 Exact GPS pin, captured on demand — optional, on top of the
  // required text landmark field above.
  const [pickupCoords, setPickupCoords] = useState(null); // { lat, lng }
  const [locatingGPS, setLocatingGPS] = useState(false);
  const [gpsError, setGpsError] = useState("");
  // True while the location field still holds the address we filled in from
  // the pin. Flips to false the moment the customer edits the field.
  const [addressFromPin, setAddressFromPin] = useState(false);

  const [price, setPrice] = useState(0);

  const [loading, setLoading] = useState(false);

  const [fetching, setFetching] = useState(true);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // ===============================
  // PRE-FILL CONTACT INFO FROM PROFILE
  // ===============================
  useEffect(() => {
    (async () => {
      try {
        const profile = await getProfile();
        setPhone((prev) => prev || profile.phone || "");
        setPickupLocation((prev) => prev || profile.location || "");
      } catch (err) {
        console.error("Couldn't load profile for pre-fill:", err.response?.data || err.message);
      }
    })();
  }, []);

  // ===============================
  // 📍 CAPTURE EXACT GPS PIN + FILL THE ADDRESS FIELD
  // ===============================
  const handleUseMyLocation = () => {
    setGpsError("");

    if (!navigator.geolocation) {
      setGpsError("Location isn't supported on this browser.");
      return;
    }

    setLocatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        // Round to 6 decimal places — matches the backend's DecimalField
        // (max_digits=9, decimal_places=6). Raw browser coordinates can
        // carry far more precision than that and get rejected as invalid.
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        setPickupCoords({ lat, lng });

        // The pin is saved either way; the address lookup is a bonus.
        try {
          const address = await reverseGeocode(lat, lng);
          if (address) {
            setPickupLocation(address);
            setAddressFromPin(true);
          } else {
            setGpsError("Pin saved, but we couldn't work out the street name. Describe the spot above.");
          }
        } catch {
          setGpsError("Pin saved, but we couldn't look up the street name. Describe the spot above.");
        } finally {
          setLocatingGPS(false);
        }
      },
      (err) => {
        setLocatingGPS(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError("Location permission denied — you can still describe the spot below.");
        } else {
          setGpsError("Couldn't get your location. Try again, or just describe the spot below.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ===============================
  // FETCHING SHOP + SERVICES
  // ===============================
  useEffect(() => {

    if (id) {
      fetchShopAndServices();
      fetchReviews();
    }

  }, [id]);

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const data = await getShopReviews(id);
      setReviews(data.results ?? data);
    } catch (err) {
      console.error("Couldn't load reviews:", err.response?.data || err.message);
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchShopAndServices = async () => {

    try {

      setFetching(true);

      const [shopData, servicesData] =
        await Promise.all([
          getShop(id),
          getServices(id),
        ]);

      // =========================
      // SHOP
      // =========================
      // shopData is a single object (getShop), not paginated
      setShop(shopData);

      // =========================
      // SERVICES
      // =========================
      const services = servicesData.results ?? servicesData;
      setServices(services);

      // =========================
      // AUTO SELECT FIRST SERVICE
      // =========================
      if (services.length > 0) {

        const firstService = services[0];

        setSelectedService(firstService.id);

        if (firstService.pricing_type === "per_item") {
          setPrice(Number(firstService.price) * quantity);
        } else if (weight) {
          setPrice(Number(firstService.price) * Number(weight));
        } else {
          setPrice(0);
        }
      }

    } catch (err) {

      console.error(err);

      setError(
        "Failed to load shop details"
      );

    } finally {

      setFetching(false);
    }
  };

  // ===============================
  // HELPER — current selected service object
  // ===============================
  const getSelectedServiceObj = (idOverride) => {
    const targetId = idOverride !== undefined ? idOverride : Number(selectedService);
    return services.find((s) => s.id === targetId);
  };

  // ===============================
  // HANDLE SERVICE CHANGE
  // ===============================
  const handleServiceChange = (
    serviceId
  ) => {

    const parsedId = Number(serviceId);

    setSelectedService(parsedId);

    setError("");
    setSuccess("");

    const service = getSelectedServiceObj(parsedId);

    if (!service) {
      setPrice(0);
      return;
    }

    // Reset the other type's input so switching services doesn't leave
    // a stale weight/quantity behind
    if (service.pricing_type === "per_item") {
      setWeight("");
      setLoadSize("");
      setPrice(Number(service.price) * (quantity || 1));
    } else {
      setQuantity(1);
      if (weight) {
        setPrice(Number(service.price) * Number(weight));
      } else {
        setPrice(0);
      }
    }
  };

  // ===============================
  // HANDLE LOAD SIZE PICK (per-kg services)
  // ===============================
  const handleLoadSizeSelect = (size) => {
    setLoadSize(size.key);
    setWeight(size.kg);
    setError("");
    setSuccess("");

    const service = getSelectedServiceObj();
    if (service) {
      setPrice(Number(service.price) * size.kg);
    }
  };

  // ===============================
  // HANDLE QUANTITY CHANGE (per-item services)
  // ===============================
  const handleQuantityChange = (value) => {
    const newQty = Math.max(1, Number(value) || 1);
    setQuantity(newQty);
    setError("");
    setSuccess("");

    const service = getSelectedServiceObj();
    if (service) {
      setPrice(Number(service.price) * newQty);
    }
  };

  // ===============================
  // FORMAT PRICE
  // ===============================
  const formatPrice = (num) => {

    return new Intl.NumberFormat(
      "en-KE"
    ).format(num || 0);
  };

  // ===============================
  // HANDLE BOOKING
  // ===============================
  const handleBooking = async () => {

    const token =
      localStorage.getItem("access");

    if (!token) {
      // Redirect to login and come back after
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    setError("");

    setSuccess("");

    if (!selectedService) {

      setError(
        "Please select a service"
      );

      return;
    }

    const service = getSelectedServiceObj();
    const isPerItem = service?.pricing_type === "per_item";

    if (isPerItem) {
      if (!quantity || quantity < 1) {
        setError("Enter how many items");
        return;
      }
    } else {
      if (!weight || weight <= 0) {
        setError("Choose a load size");
        return;
      }
    }

    if (!phone.trim()) {
      setError("A phone number is required so the shop can reach you.");
      return;
    }

    if (!pickupLocation.trim()) {
      setError("A pickup location is required.");
      return;
    }

    try {

      setLoading(true);

      const payload = {
        shop_id: Number(id),
        service_id: Number(selectedService),
        ...(isPerItem
          ? { quantity: Number(quantity) }
          : { weight: Number(weight) }),
        customer_notes: notes.trim() || null,
        customer_phone: phone.trim(),
        customer_location: pickupLocation.trim(),
        ...(pickupCoords && {
          pickup_lat: pickupCoords.lat,
          pickup_lng: pickupCoords.lng,
        }),
      };

      await createOrder(payload);

      setSuccess(
        "Order placed successfully!"
      );

      // reset form
      setWeight("");
      setQuantity(1);
      setLoadSize("");
      setNotes("");

      setTimeout(() => {

        navigate("/orders");

      }, 1200);

    } catch (err) {

      console.error(err);

      setError(
        readableError(err.response?.data) || "Couldn't place your order. Please try again."
      );

    } finally {

      setLoading(false);
    }
  };

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
  const service = getSelectedServiceObj();
  const isPerItem = service?.pricing_type === "per_item";
  const bookingDisabled =
    loading || !selectedService || (isPerItem ? !quantity || quantity < 1 : !weight || weight <= 0);
  const imageUrl = shopImageUrl(shop);
  const rated = Number(shop.review_count) > 0;

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

          {/* ============ BOOKING ============ */}
          <div
            id="book"
            className={`${card} lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-24 scroll-mt-24 p-6 sm:p-7`}
          >
            <h2 className="text-2xl font-extrabold text-slate-900">Book a pickup</h2>
            <p className="text-sm text-slate-500 mt-1">Choose a service, tell the shop where to collect.</p>

            <div className="mt-6">
              {error && (
                <div role="alert" className="mb-5 p-3.5 border border-red-200 bg-red-50 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}
              {success && (
                <div role="status" className="mb-5 p-3.5 border border-emerald-200 bg-emerald-50 rounded-lg text-sm text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0" /> {success}
                </div>
              )}

              {services.length === 0 && (
                <p className="text-center text-sm text-slate-500 mb-5">This shop hasn't added any services yet.</p>
              )}

              {/* SERVICE */}
              <label htmlFor="service" className={fieldLabel}>Service</label>
              <select
                id="service"
                value={selectedService}
                onChange={(e) => handleServiceChange(e.target.value)}
                className={`${field} mb-5`}
              >
                <option value="">Select a service</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — KES {formatPrice(s.price)}{s.pricing_type === "per_item" ? "/item" : "/kg"}
                  </option>
                ))}
              </select>

              {/* HOW MUCH */}
              {service && (isPerItem ? (
                <div className="mb-5">
                  <span className={fieldLabel}>How many {service.name.toLowerCase()}?</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      aria-label="One fewer"
                      className="w-12 h-12 rounded-lg border border-slate-300 text-xl font-bold text-slate-700 hover:border-blue-500 hover:text-blue-700"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={1}
                      inputMode="numeric"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      aria-label="Quantity"
                      className={`${field} w-20 text-center text-lg font-bold px-2`}
                    />
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      aria-label="One more"
                      className="w-12 h-12 rounded-lg border border-slate-300 text-xl font-bold text-slate-700 hover:border-blue-500 hover:text-blue-700"
                    >
                      +
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-5">
                  <span className={fieldLabel}>How much laundry?</span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {LOAD_SIZES.map((size) => (
                      <button
                        key={size.key}
                        type="button"
                        onClick={() => handleLoadSizeSelect(size)}
                        aria-pressed={loadSize === size.key}
                        className={`text-left p-3 rounded-lg border-2 transition ${
                          loadSize === size.key ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        <span className="block text-sm font-bold text-slate-900">{size.label}</span>
                        <span className="block text-xs text-slate-500 mt-0.5 leading-snug">~{size.kg} kg · {size.desc}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Just an estimate. The shop weighs your laundry when they collect it, and you pay the final price.
                    If it comes to a lot more than your estimate, you'll be asked to approve the new price first.
                  </p>
                </div>
              ))}

              {/* PHONE */}
              <label htmlFor="phone" className={fieldLabel}>Phone number</label>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0712 345 678"
                className={`${field} mb-5`}
              />

              {/* PICKUP */}
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <label htmlFor="pickup" className="text-sm font-semibold text-slate-700">Pickup location</label>
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={locatingGPS}
                  className="inline-flex items-center gap-1 min-h-[36px] text-sm font-semibold text-blue-700 hover:underline disabled:opacity-50"
                >
                  <MapPin size={14} />
                  {locatingGPS ? "Locating…" : pickupCoords ? "Update pin" : "Use my location"}
                </button>
              </div>
              <input
                id="pickup"
                type="text"
                value={pickupLocation}
                onChange={(e) => {
                  setPickupLocation(e.target.value);
                  setAddressFromPin(false);
                }}
                placeholder="e.g. Blue gate opposite Java House, Apt 4B"
                className={field}
              />
              <div className="mt-1.5 mb-5 text-xs space-y-1">
                {pickupCoords && (
                  <p className="flex items-center gap-1 font-semibold text-emerald-700">
                    <CheckCircle2 size={12} /> Exact pin saved. The shop gets precise directions.
                  </p>
                )}
                {addressFromPin && (
                  <p className="text-slate-500">
                    Address filled in from your pin. Add a landmark (gate colour, building name, floor) so the shop finds you faster.
                  </p>
                )}
                {gpsError && <p className="text-amber-700">{gpsError}</p>}
                {!pickupCoords && !gpsError && (
                  <p className="text-slate-500">
                    A neighbourhood name alone can be hard to find. Add a landmark, or tap “Use my location”.
                  </p>
                )}
              </div>

              {/* NOTES */}
              <label htmlFor="notes" className={fieldLabel}>
                Notes <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Gate code, stains to watch for, anything the shop should know"
                className={`${field} py-3 resize-none mb-5`}
              />

              {/* TOTAL */}
              <div className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-4">
                <span className="text-sm font-semibold text-slate-600">Estimated total</span>
                <span className="text-[26px] font-extrabold text-slate-900">KES {formatPrice(price)}</span>
              </div>

              <button
                type="button"
                onClick={handleBooking}
                disabled={bookingDisabled}
                className={`${btn.primary} w-full mt-5`}
              >
                {loading ? "Placing your order…" : "Confirm booking"}
              </button>
              <p className="text-xs text-slate-500 text-center mt-3">
                {isPerItem
                  ? "You pay with M-Pesa after booking, from My Orders."
                  : "You pay with M-Pesa from My Orders, once the shop has weighed your laundry."}
              </p>
            </div>
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



// import { useEffect, useState } from "react";
// import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
// import { MapPin, CheckCircle2, Star, Shirt, ArrowLeft } from "lucide-react";
// import {
//   getServices,
//   createOrder,
//   getShop,
//   getProfile,
//   getShopReviews,
// } from "../api";
// import { Pill, btn, card, field, fieldLabel, textLink, wrap } from "../components/ui";
// import { shopImageUrl } from "../components/ShopCard";
// import { reverseGeocode } from "../utils/reverseGeocode";

// // {"customer_phone": ["A phone number is required."]} -> "A phone number is required."
// const readableError = (data) => {
//   if (!data) return "";
//   if (typeof data === "string") return data;
//   if (Array.isArray(data)) return data.map(readableError).join(" ");
//   if (typeof data === "object") return Object.values(data).map(readableError).join(" ");
//   return String(data);
// };

// // Nobody can reliably guess "my laundry weighs 3.5kg" — let people pick
// // a load size they can actually judge by eye instead. Each maps to an
// // estimated kg figure used for the price shown.
// const LOAD_SIZES = [
//   { key: "small", label: "Small", kg: 2, desc: "A few days of clothes for one person" },
//   { key: "medium", label: "Medium", kg: 4, desc: "A full laundry basket" },
//   { key: "large", label: "Large", kg: 6, desc: "Bedding plus a few days of clothes" },
//   { key: "xl", label: "Extra Large", kg: 9, desc: "A duffel bag — multiple loads" },
// ];

// function ShopDetails() {

//   const { id } = useParams();

//   const navigate = useNavigate();

//   const [searchParams] = useSearchParams();
//   const preselectService = searchParams.get("service");
//   const preselectWeight = searchParams.get("weight");

//   // ===============================
//   // STATES
//   // ===============================
//   const [shop, setShop] = useState(null);

//   const [services, setServices] = useState([]);

//   const [selectedService, setSelectedService] =
//     useState(preselectService || "");

//   const [weight, setWeight] = useState(preselectWeight ? Number(preselectWeight) : "");
//   const [quantity, setQuantity] = useState(1);
//   const [loadSize, setLoadSize] = useState(""); // which basket-size button is selected
//   const [notes, setNotes] = useState("");
//   const [phone, setPhone] = useState("");
//   const [pickupLocation, setPickupLocation] = useState("");

//   // 📍 Exact GPS pin, captured on demand — optional, on top of the
//   // required text landmark field above.
//   const [pickupCoords, setPickupCoords] = useState(null); // { lat, lng }
//   const [locatingGPS, setLocatingGPS] = useState(false);
//   const [gpsError, setGpsError] = useState("");
//   // True while the location field still holds the address we filled in from
//   // the pin. Flips to false the moment the customer edits the field.
//   const [addressFromPin, setAddressFromPin] = useState(false);

//   const [price, setPrice] = useState(0);

//   const [loading, setLoading] = useState(false);

//   const [fetching, setFetching] = useState(true);

//   const [error, setError] = useState("");

//   const [success, setSuccess] = useState("");

//   // ===============================
//   // PRE-FILL CONTACT INFO FROM PROFILE
//   // ===============================
//   useEffect(() => {
//     (async () => {
//       try {
//         const profile = await getProfile();
//         setPhone((prev) => prev || profile.phone || "");
//         setPickupLocation((prev) => prev || profile.location || "");
//       } catch (err) {
//         console.error("Couldn't load profile for pre-fill:", err.response?.data || err.message);
//       }
//     })();
//   }, []);

//   // ===============================
//   // 📍 CAPTURE EXACT GPS PIN + FILL THE ADDRESS FIELD
//   // ===============================
//   const handleUseMyLocation = () => {
//     setGpsError("");

//     if (!navigator.geolocation) {
//       setGpsError("Location isn't supported on this browser.");
//       return;
//     }

//     setLocatingGPS(true);
//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         // Round to 6 decimal places — matches the backend's DecimalField
//         // (max_digits=9, decimal_places=6). Raw browser coordinates can
//         // carry far more precision than that and get rejected as invalid.
//         const lat = Number(position.coords.latitude.toFixed(6));
//         const lng = Number(position.coords.longitude.toFixed(6));
//         setPickupCoords({ lat, lng });

//         // The pin is saved either way; the address lookup is a bonus.
//         try {
//           const address = await reverseGeocode(lat, lng);
//           if (address) {
//             setPickupLocation(address);
//             setAddressFromPin(true);
//           } else {
//             setGpsError("Pin saved, but we couldn't work out the street name. Describe the spot above.");
//           }
//         } catch {
//           setGpsError("Pin saved, but we couldn't look up the street name. Describe the spot above.");
//         } finally {
//           setLocatingGPS(false);
//         }
//       },
//       (err) => {
//         setLocatingGPS(false);
//         if (err.code === err.PERMISSION_DENIED) {
//           setGpsError("Location permission denied — you can still describe the spot below.");
//         } else {
//           setGpsError("Couldn't get your location. Try again, or just describe the spot below.");
//         }
//       },
//       { enableHighAccuracy: true, timeout: 10000 }
//     );
//   };

//   // ===============================
//   // FETCHING SHOP + SERVICES
//   // ===============================
//   useEffect(() => {

//     if (id) {
//       fetchShopAndServices();
//       fetchReviews();
//     }

//   }, [id]);

//   const [reviews, setReviews] = useState([]);
//   const [loadingReviews, setLoadingReviews] = useState(true);

//   const fetchReviews = async () => {
//     try {
//       setLoadingReviews(true);
//       const data = await getShopReviews(id);
//       setReviews(data.results ?? data);
//     } catch (err) {
//       console.error("Couldn't load reviews:", err.response?.data || err.message);
//     } finally {
//       setLoadingReviews(false);
//     }
//   };

//   const fetchShopAndServices = async () => {

//     try {

//       setFetching(true);

//       const [shopData, servicesData] =
//         await Promise.all([
//           getShop(id),
//           getServices(id),
//         ]);

//       // =========================
//       // SHOP
//       // =========================
//       // shopData is a single object (getShop), not paginated
//       setShop(shopData);

//       // =========================
//       // SERVICES
//       // =========================
//       const services = servicesData.results ?? servicesData;
//       setServices(services);

//       // =========================
//       // AUTO SELECT FIRST SERVICE
//       // =========================
//       if (services.length > 0) {

//         const firstService = services[0];

//         setSelectedService(firstService.id);

//         if (firstService.pricing_type === "per_item") {
//           setPrice(Number(firstService.price) * quantity);
//         } else if (weight) {
//           setPrice(Number(firstService.price) * Number(weight));
//         } else {
//           setPrice(0);
//         }
//       }

//     } catch (err) {

//       console.error(err);

//       setError(
//         "Failed to load shop details"
//       );

//     } finally {

//       setFetching(false);
//     }
//   };

//   // ===============================
//   // HELPER — current selected service object
//   // ===============================
//   const getSelectedServiceObj = (idOverride) => {
//     const targetId = idOverride !== undefined ? idOverride : Number(selectedService);
//     return services.find((s) => s.id === targetId);
//   };

//   // ===============================
//   // HANDLE SERVICE CHANGE
//   // ===============================
//   const handleServiceChange = (
//     serviceId
//   ) => {

//     const parsedId = Number(serviceId);

//     setSelectedService(parsedId);

//     setError("");
//     setSuccess("");

//     const service = getSelectedServiceObj(parsedId);

//     if (!service) {
//       setPrice(0);
//       return;
//     }

//     // Reset the other type's input so switching services doesn't leave
//     // a stale weight/quantity behind
//     if (service.pricing_type === "per_item") {
//       setWeight("");
//       setLoadSize("");
//       setPrice(Number(service.price) * (quantity || 1));
//     } else {
//       setQuantity(1);
//       if (weight) {
//         setPrice(Number(service.price) * Number(weight));
//       } else {
//         setPrice(0);
//       }
//     }
//   };

//   // ===============================
//   // HANDLE LOAD SIZE PICK (per-kg services)
//   // ===============================
//   const handleLoadSizeSelect = (size) => {
//     setLoadSize(size.key);
//     setWeight(size.kg);
//     setError("");
//     setSuccess("");

//     const service = getSelectedServiceObj();
//     if (service) {
//       setPrice(Number(service.price) * size.kg);
//     }
//   };

//   // ===============================
//   // HANDLE QUANTITY CHANGE (per-item services)
//   // ===============================
//   const handleQuantityChange = (value) => {
//     const newQty = Math.max(1, Number(value) || 1);
//     setQuantity(newQty);
//     setError("");
//     setSuccess("");

//     const service = getSelectedServiceObj();
//     if (service) {
//       setPrice(Number(service.price) * newQty);
//     }
//   };

//   // ===============================
//   // FORMAT PRICE
//   // ===============================
//   const formatPrice = (num) => {

//     return new Intl.NumberFormat(
//       "en-KE"
//     ).format(num || 0);
//   };

//   // ===============================
//   // HANDLE BOOKING
//   // ===============================
//   const handleBooking = async () => {

//     const token =
//       localStorage.getItem("access");

//     if (!token) {
//       // Redirect to login and come back after
//       navigate("/login", { state: { from: window.location.pathname } });
//       return;
//     }

//     setError("");

//     setSuccess("");

//     if (!selectedService) {

//       setError(
//         "Please select a service"
//       );

//       return;
//     }

//     const service = getSelectedServiceObj();
//     const isPerItem = service?.pricing_type === "per_item";

//     if (isPerItem) {
//       if (!quantity || quantity < 1) {
//         setError("Enter how many items");
//         return;
//       }
//     } else {
//       if (!weight || weight <= 0) {
//         setError("Choose a load size");
//         return;
//       }
//     }

//     if (!phone.trim()) {
//       setError("A phone number is required so the shop can reach you.");
//       return;
//     }

//     if (!pickupLocation.trim()) {
//       setError("A pickup location is required.");
//       return;
//     }

//     try {

//       setLoading(true);

//       const payload = {
//         shop_id: Number(id),
//         service_id: Number(selectedService),
//         ...(isPerItem
//           ? { quantity: Number(quantity) }
//           : { weight: Number(weight) }),
//         customer_notes: notes.trim() || null,
//         customer_phone: phone.trim(),
//         customer_location: pickupLocation.trim(),
//         ...(pickupCoords && {
//           pickup_lat: pickupCoords.lat,
//           pickup_lng: pickupCoords.lng,
//         }),
//       };

//       await createOrder(payload);

//       setSuccess(
//         "Order placed successfully!"
//       );

//       // reset form
//       setWeight("");
//       setQuantity(1);
//       setLoadSize("");
//       setNotes("");

//       setTimeout(() => {

//         navigate("/orders");

//       }, 1200);

//     } catch (err) {

//       console.error(err);

//       setError(
//         readableError(err.response?.data) || "Couldn't place your order. Please try again."
//       );

//     } finally {

//       setLoading(false);
//     }
//   };

//   // ===============================
//   // ARRIVING FROM A "Book" LINK (…/shop/12#book): scroll to the booking card
//   // ===============================
//   useEffect(() => {
//     if (!fetching && window.location.hash === "#book") {
//       document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "start" });
//     }
//   }, [fetching]);

//   // ===============================
//   // LOADING / NOT FOUND
//   // ===============================
//   if (fetching) {
//     return (
//       <div className={`${wrap} py-24 text-center`}>
//         <p className="text-sm font-semibold text-slate-500">Loading shop…</p>
//       </div>
//     );
//   }

//   if (!shop) {
//     return (
//       <div className={`${wrap} py-16`}>
//         <div className={`${card} max-w-md mx-auto p-8 text-center`}>
//           <p className="text-xl font-extrabold text-slate-900">We couldn't find that shop.</p>
//           <p className="text-slate-600 mt-2">It may have been removed, or the link is wrong.</p>
//           <Link to="/shops" className={`${btn.primary} mt-5`}>Browse laundries</Link>
//         </div>
//       </div>
//     );
//   }

//   // ===============================
//   // UI
//   // ===============================
//   const service = getSelectedServiceObj();
//   const isPerItem = service?.pricing_type === "per_item";
//   const bookingDisabled =
//     loading || !selectedService || (isPerItem ? !quantity || quantity < 1 : !weight || weight <= 0);
//   const imageUrl = shopImageUrl(shop);
//   const rated = Number(shop.review_count) > 0;

//   return (
//     <div className="bg-blue-50/60">
//       <div className={`${wrap} py-8 sm:py-12`}>

//         <Link to="/shops" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-blue-700 mb-6">
//           <ArrowLeft size={15} /> All laundries
//         </Link>

//         <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-10 items-start">

//           {/* ============ THE SHOP ============ */}
//           <div className={`${card} lg:col-start-1 lg:row-start-1 overflow-hidden`}>
//             <div className="h-56 sm:h-72 bg-gradient-to-br from-blue-100 to-blue-200">
//               {imageUrl ? (
//                 <img src={imageUrl} alt={shop.name} className="w-full h-full object-cover" />
//               ) : (
//                 <div className="w-full h-full flex items-center justify-center text-blue-400">
//                   <Shirt size={52} strokeWidth={1.4} />
//                 </div>
//               )}
//             </div>

//             <div className="p-6 sm:p-8">
//               <h1 className="text-[28px] sm:text-[34px] font-extrabold tracking-tight leading-tight text-slate-900">
//                 {shop.name}
//               </h1>

//               <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
//                 {rated ? (
//                   <span className="flex items-center gap-1">
//                     {[1, 2, 3, 4, 5].map((n) => (
//                       <Star
//                         key={n}
//                         size={16}
//                         className="text-amber-500"
//                         fill={n <= Math.round(shop.average_rating) ? "currentColor" : "none"}
//                       />
//                     ))}
//                     <span className="text-sm font-bold text-slate-800 ml-1">{shop.average_rating}</span>
//                     <span className="text-sm text-slate-500">
//                       ({shop.review_count} {shop.review_count === 1 ? "review" : "reviews"})
//                     </span>
//                   </span>
//                 ) : (
//                   <Pill>New on DryMe</Pill>
//                 )}
//                 <span className="flex items-center gap-1.5 text-slate-600">
//                   <MapPin size={15} className="text-blue-600 shrink-0" /> {shop.location}
//                 </span>
//               </div>

//               <p className="mt-5 text-slate-700 leading-relaxed whitespace-pre-line">{shop.description}</p>

//               {/* map: the owner's real pin if they set one, otherwise an honest fallback */}
//               {shop.lat && shop.lng ? (
//                 <div className="mt-6 border border-blue-100 rounded-xl overflow-hidden">
//                   <iframe
//                     title={`${shop.name} location`}
//                     src={`https://www.google.com/maps?q=${shop.lat},${shop.lng}&output=embed`}
//                     width="100%"
//                     height="220"
//                     style={{ border: 0 }}
//                     loading="lazy"
//                   />
//                   <a
//                     href={`https://www.google.com/maps?q=${shop.lat},${shop.lng}`}
//                     target="_blank"
//                     rel="noreferrer"
//                     className="flex items-center justify-center gap-1.5 min-h-[44px] text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100"
//                   >
//                     <MapPin size={14} /> Open in Google Maps
//                   </a>
//                 </div>
//               ) : (
//                 <div className="mt-6 bg-blue-50 rounded-xl p-4 text-center">
//                   <p className="text-sm text-slate-600">This shop hasn't pinned its exact location yet.</p>
//                   <a
//                     href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.location)}`}
//                     target="_blank"
//                     rel="noreferrer"
//                     className={`${textLink} inline-flex items-center gap-1.5 text-sm mt-1.5`}
//                   >
//                     <MapPin size={14} /> Search “{shop.location}” on Google Maps
//                   </a>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* ============ BOOKING ============ */}
//           <div
//             id="book"
//             className={`${card} lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-24 scroll-mt-24 p-6 sm:p-7`}
//           >
//             <h2 className="text-2xl font-extrabold text-slate-900">Book a pickup</h2>
//             <p className="text-sm text-slate-500 mt-1">Choose a service, tell the shop where to collect.</p>

//             <div className="mt-6">
//               {error && (
//                 <div role="alert" className="mb-5 p-3.5 border border-red-200 bg-red-50 rounded-lg text-sm text-red-700">
//                   {error}
//                 </div>
//               )}
//               {success && (
//                 <div role="status" className="mb-5 p-3.5 border border-emerald-200 bg-emerald-50 rounded-lg text-sm text-emerald-700 flex items-center gap-2">
//                   <CheckCircle2 size={16} className="shrink-0" /> {success}
//                 </div>
//               )}

//               {services.length === 0 && (
//                 <p className="text-center text-sm text-slate-500 mb-5">This shop hasn't added any services yet.</p>
//               )}

//               {/* SERVICE */}
//               <label htmlFor="service" className={fieldLabel}>Service</label>
//               <select
//                 id="service"
//                 value={selectedService}
//                 onChange={(e) => handleServiceChange(e.target.value)}
//                 className={`${field} mb-5`}
//               >
//                 <option value="">Select a service</option>
//                 {services.map((s) => (
//                   <option key={s.id} value={s.id}>
//                     {s.name} — KES {formatPrice(s.price)}{s.pricing_type === "per_item" ? "/item" : "/kg"}
//                   </option>
//                 ))}
//               </select>

//               {/* HOW MUCH */}
//               {service && (isPerItem ? (
//                 <div className="mb-5">
//                   <span className={fieldLabel}>How many {service.name.toLowerCase()}?</span>
//                   <div className="flex items-center gap-3">
//                     <button
//                       type="button"
//                       onClick={() => handleQuantityChange(quantity - 1)}
//                       aria-label="One fewer"
//                       className="w-12 h-12 rounded-lg border border-slate-300 text-xl font-bold text-slate-700 hover:border-blue-500 hover:text-blue-700"
//                     >
//                       −
//                     </button>
//                     <input
//                       type="number"
//                       min={1}
//                       inputMode="numeric"
//                       value={quantity}
//                       onChange={(e) => handleQuantityChange(e.target.value)}
//                       aria-label="Quantity"
//                       className={`${field} w-20 text-center text-lg font-bold px-2`}
//                     />
//                     <button
//                       type="button"
//                       onClick={() => handleQuantityChange(quantity + 1)}
//                       aria-label="One more"
//                       className="w-12 h-12 rounded-lg border border-slate-300 text-xl font-bold text-slate-700 hover:border-blue-500 hover:text-blue-700"
//                     >
//                       +
//                     </button>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="mb-5">
//                   <span className={fieldLabel}>How much laundry?</span>
//                   <div className="grid grid-cols-2 gap-2.5">
//                     {LOAD_SIZES.map((size) => (
//                       <button
//                         key={size.key}
//                         type="button"
//                         onClick={() => handleLoadSizeSelect(size)}
//                         aria-pressed={loadSize === size.key}
//                         className={`text-left p-3 rounded-lg border-2 transition ${
//                           loadSize === size.key ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-blue-300"
//                         }`}
//                       >
//                         <span className="block text-sm font-bold text-slate-900">{size.label}</span>
//                         <span className="block text-xs text-slate-500 mt-0.5 leading-snug">~{size.kg} kg · {size.desc}</span>
//                       </button>
//                     ))}
//                   </div>
//                   <p className="text-xs text-slate-500 mt-2">
//                     Just an estimate. The shop confirms the exact weight when they collect it.
//                   </p>
//                 </div>
//               ))}

//               {/* PHONE */}
//               <label htmlFor="phone" className={fieldLabel}>Phone number</label>
//               <input
//                 id="phone"
//                 type="tel"
//                 inputMode="tel"
//                 autoComplete="tel"
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//                 placeholder="0712 345 678"
//                 className={`${field} mb-5`}
//               />

//               {/* PICKUP */}
//               <div className="flex items-center justify-between gap-3 mb-1.5">
//                 <label htmlFor="pickup" className="text-sm font-semibold text-slate-700">Pickup location</label>
//                 <button
//                   type="button"
//                   onClick={handleUseMyLocation}
//                   disabled={locatingGPS}
//                   className="inline-flex items-center gap-1 min-h-[36px] text-sm font-semibold text-blue-700 hover:underline disabled:opacity-50"
//                 >
//                   <MapPin size={14} />
//                   {locatingGPS ? "Locating…" : pickupCoords ? "Update pin" : "Use my location"}
//                 </button>
//               </div>
//               <input
//                 id="pickup"
//                 type="text"
//                 value={pickupLocation}
//                 onChange={(e) => {
//                   setPickupLocation(e.target.value);
//                   setAddressFromPin(false);
//                 }}
//                 placeholder="e.g. Blue gate opposite Java House, Apt 4B"
//                 className={field}
//               />
//               <div className="mt-1.5 mb-5 text-xs space-y-1">
//                 {pickupCoords && (
//                   <p className="flex items-center gap-1 font-semibold text-emerald-700">
//                     <CheckCircle2 size={12} /> Exact pin saved. The shop gets precise directions.
//                   </p>
//                 )}
//                 {addressFromPin && (
//                   <p className="text-slate-500">
//                     Address filled in from your pin. Add a landmark (gate colour, building name, floor) so the shop finds you faster.
//                   </p>
//                 )}
//                 {gpsError && <p className="text-amber-700">{gpsError}</p>}
//                 {!pickupCoords && !gpsError && (
//                   <p className="text-slate-500">
//                     A neighbourhood name alone can be hard to find. Add a landmark, or tap “Use my location”.
//                   </p>
//                 )}
//               </div>

//               {/* NOTES */}
//               <label htmlFor="notes" className={fieldLabel}>
//                 Notes <span className="font-normal text-slate-400">(optional)</span>
//               </label>
//               <textarea
//                 id="notes"
//                 value={notes}
//                 onChange={(e) => setNotes(e.target.value)}
//                 rows={3}
//                 placeholder="Gate code, stains to watch for, anything the shop should know"
//                 className={`${field} py-3 resize-none mb-5`}
//               />

//               {/* TOTAL */}
//               <div className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-4">
//                 <span className="text-sm font-semibold text-slate-600">Estimated total</span>
//                 <span className="text-[26px] font-extrabold text-slate-900">KES {formatPrice(price)}</span>
//               </div>

//               <button
//                 type="button"
//                 onClick={handleBooking}
//                 disabled={bookingDisabled}
//                 className={`${btn.primary} w-full mt-5`}
//               >
//                 {loading ? "Placing your order…" : "Confirm booking"}
//               </button>
//               <p className="text-xs text-slate-500 text-center mt-3">
//                 You pay with M-Pesa after booking, from My Orders.
//               </p>
//             </div>
//           </div>

//           {/* ============ REVIEWS ============ */}
//           <section className="lg:col-start-1 lg:row-start-2">
//             <h2 className="text-xl font-extrabold text-slate-900 mb-4">
//               Reviews {shop.review_count > 0 && <span className="text-base font-semibold text-slate-500">({shop.review_count})</span>}
//             </h2>

//             {loadingReviews ? (
//               <p className="text-sm text-slate-500">Loading reviews…</p>
//             ) : reviews.length === 0 ? (
//               <div className="bg-white border border-blue-100 rounded-2xl p-6 text-center text-sm text-slate-500">
//                 No reviews yet. Be the first to book and rate this shop.
//               </div>
//             ) : (
//               <ul className="space-y-3">
//                 {reviews.map((r) => (
//                   <li key={r.id} className="bg-white border border-blue-100 rounded-2xl p-5">
//                     <div className="flex items-center justify-between gap-3">
//                       <span className="text-sm font-bold text-slate-900">{r.username}</span>
//                       <span className="flex items-center gap-0.5" aria-label={`${r.rating} out of 5`}>
//                         {[1, 2, 3, 4, 5].map((n) => (
//                           <Star key={n} size={13} className="text-amber-500" fill={n <= r.rating ? "currentColor" : "none"} />
//                         ))}
//                       </span>
//                     </div>
//                     {r.comment && <p className="text-sm text-slate-700 mt-2">{r.comment}</p>}
//                     <p className="text-xs text-slate-400 mt-2">
//                       {new Date(r.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
//                     </p>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </section>

//         </div>
//       </div>
//     </div>
//   );
// }

// export default ShopDetails;