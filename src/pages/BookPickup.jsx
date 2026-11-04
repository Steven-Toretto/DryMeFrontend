import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { createOrder, getPickupSlots, getProfile, getServices, getShop } from "../api";
import { AuthContext } from "../context/AuthContext";
import { btn, card, wrap } from "../components/ui";
import { kes } from "../components/walletFormat";
import { DetailsStep, ReviewStep, ServiceStep, StepHeader, TimeStep } from "../components/BookingSteps";
import {
  LOAD_SIZES, addressError, clearDraft, cleanPhone, estimateTotal, findSlot, loadDraft,
  nearestLoadSize, phoneError, readableError, saveDraft,
} from "../components/bookingFormat";
import { reverseGeocode } from "../utils/reverseGeocode";

// The server's list of bookable days and windows, as a ready-to-store state.
async function readSlots() {
  try {
    const data = await getPickupSlots();
    return { status: "ready", days: data.days ?? [] };
  } catch {
    return { status: "error", days: [] };
  }
}

const EMPTY_FORM = {
  serviceId: "", loadSize: "", quantity: 1,
  address: "", phone: "", notes: "",
  date: "", slot: "",
};

/**
 * Book a pickup, one question at a time.
 *   1 What needs cleaning?   2 Collection details   3 Pick a time   4 Review and confirm
 *
 * The step lives in the URL (?step=2), so the phone's Back button walks back through the steps instead of
 * leaving the page. A step can only be reached once the ones before it are filled in. Signing in happens at
 * the very end: the answers are kept for the trip to the login page and back.
 */
function BookPickup() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { token } = useContext(AuthContext);
  const headingRef = useRef(null);

  // ---------- the shop ----------
  const [shop, setShop] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // ---------- the answers (restored if the customer just came back from signing in) ----------
  const [restored] = useState(() => loadDraft(id));
  const [form, setForm] = useState(() => ({ ...EMPTY_FORM, ...(restored?.form || {}) }));
  const [pin, setPin] = useState(restored?.pin || null);          // { lat, lng }
  const [locating, setLocating] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const [addressFromPin, setAddressFromPin] = useState(false);

  // ---------- the times the server says can be booked ----------
  const [slots, setSlots] = useState({ status: "loading", days: [] });

  // ---------- progress ----------
  const [showErrors, setShowErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [timeProblem, setTimeProblem] = useState(false);
  const [booked, setBooked] = useState(false);

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  // ---------- load the shop and its services ----------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [shopData, servicesData] = await Promise.all([getShop(id), getServices(id)]);
        if (cancelled) return;
        const list = servicesData.results ?? servicesData;
        setShop(shopData);
        setServices(list);

        // "Book again" arrives with ?service=&weight= (or &quantity=). A restored draft wins over those.
        if (!restored) {
          const wanted = list.find((s) => String(s.id) === searchParams.get("service"));
          if (wanted) {
            setForm((f) => ({
              ...f,
              serviceId: wanted.id,
              loadSize: wanted.pricing_type === "per_kg" ? nearestLoadSize(searchParams.get("weight"))?.key || "" : "",
              quantity: wanted.pricing_type === "per_item" ? Math.max(1, Number(searchParams.get("quantity")) || 1) : 1,
            }));
          }
        }
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // First load. The state starts out as "loading", so there's nothing to reset.
  useEffect(() => {
    let cancelled = false;
    readSlots().then((next) => {
      if (!cancelled) setSlots(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Refresh quietly (a window the customer picked has just been refused) ...
  const refreshSlots = async () => setSlots(await readSlots());

  // ... or "Try again" after a failure, with the loading state showing.
  const reloadSlots = () => {
    setSlots({ status: "loading", days: [] });
    refreshSlots();
  };

  // The draft has done its job once the page is back.
  useEffect(() => {
    if (restored) clearDraft(id);
  }, [id, restored]);

  // Pre-fill phone and address from the profile (signed-in customers, once, never over what they typed).
  useEffect(() => {
    if (!token || restored) return;
    let cancelled = false;
    getProfile()
      .then((profile) => {
        if (cancelled) return;
        setForm((f) => ({ ...f, phone: f.phone || profile.phone || "", address: f.address || profile.location || "" }));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [token, restored]);

  // ---------- what's been answered ----------
  const service = services.find((s) => String(s.id) === String(form.serviceId));
  const perItem = service?.pricing_type === "per_item";
  const total = estimateTotal(service, form);
  const chosenSlot = findSlot(slots.days, form.date, form.slot);
  const errors = { address: addressError(form.address), phone: phoneError(form.phone) };

  const step1Ok = Boolean(service) && total != null;
  const step2Ok = !errors.address && !errors.phone;
  const step3Ok = Boolean(chosenSlot);
  const furthest = !step1Ok ? 1 : !step2Ok ? 2 : !step3Ok ? 3 : 4;

  const ready = !loading && slots.status !== "loading";
  const requested = Math.min(Math.max(Number(searchParams.get("step")) || 1, 1), 4);
  const step = ready ? Math.min(requested, furthest) : 1;
  const expired = ready && slots.status === "ready" && Boolean(form.slot) && !chosenSlot;

  // Typed ?step=4 straight away, or a refresh that lost the answers: land on the first step still to do.
  useEffect(() => {
    if (ready && requested !== step) setSearchParams({ step: String(step) }, { replace: true });
  }, [ready, requested, step, setSearchParams]);

  const goTo = (n) => {
    setShowErrors(false);
    setSearchParams({ step: String(n) });
  };

  // New step: back to the top, and the heading read out to screen readers.
  useEffect(() => {
    window.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  const next = () => {
    const ok = step === 1 ? step1Ok : step === 2 ? step2Ok : step3Ok;
    if (!ok) {
      setShowErrors(true);
      return;
    }
    goTo(step + 1);
  };

  // ---------- the exact pin, and the street name it points at ----------
  const handleUseLocation = () => {
    setGpsError("");
    if (!navigator.geolocation) {
      setGpsError("Location isn't supported on this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        // The backend stores 6 decimal places.
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        setPin({ lat, lng });
        try {
          const address = await reverseGeocode(lat, lng);
          if (address) {
            setField("address", address);
            setAddressFromPin(true);
          } else {
            setGpsError("Pin saved, but we couldn't work out the street name. Type the address above.");
          }
        } catch {
          setGpsError("Pin saved, but we couldn't look up the street name. Type the address above.");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        setGpsError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. You can still type the address."
            : "Couldn't get your location. Try again, or type the address.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  // ---------- placing the order ----------
  const confirm = async () => {
    if (!token) {
      // Sign in last. Keep the answers for the trip to the login page and back.
      saveDraft(id, { form, pin });
      navigate("/login", { state: { from: `/shop/${id}/book?step=4` } });
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    setTimeProblem(false);
    try {
      await createOrder({
        shop_id: Number(id),
        service_id: service.id,
        ...(perItem ? { quantity: Number(form.quantity) } : { weight: LOAD_SIZES.find((s) => s.key === form.loadSize).kg }),
        customer_notes: form.notes.trim() || null,
        customer_phone: cleanPhone(form.phone),
        customer_location: form.address.trim(),
        pickup_date: form.date,
        pickup_slot: form.slot,
        ...(pin && { pickup_lat: pin.lat, pickup_lng: pin.lng }),
      });
      setBooked(true);
    } catch (err) {
      const data = err.response?.data;
      const timeIssue = Boolean(data && typeof data === "object" && (data.pickup_slot || data.pickup_date));
      setSubmitError(readableError(data) || "Couldn't place your order. Please try again.");
      setTimeProblem(timeIssue);
      if (timeIssue) refreshSlots();   // the list on screen is out of date
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!booked) return undefined;
    const timer = setTimeout(() => navigate("/orders"), 2500);
    return () => clearTimeout(timer);
  }, [booked, navigate]);

  // ---------- the screens ----------
  if (loading) {
    return (
      <div className="bg-blue-50/60 min-h-[60vh]">
        <div className={`${wrap} py-12`}>
          <div className="max-w-2xl mx-auto" aria-busy="true">
            <div className="h-10 w-2/3 mx-auto bg-blue-100 rounded animate-pulse mb-8" />
            <div className={`${card} p-8 space-y-4`}>
              <div className="h-5 w-1/2 bg-blue-50 rounded animate-pulse" />
              <div className="h-16 bg-blue-50 rounded-xl animate-pulse" />
              <div className="h-16 bg-blue-50 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadError || !shop) {
    return (
      <div className={`${wrap} py-16`}>
        <div className={`${card} max-w-md mx-auto p-8 text-center`}>
          <p className="text-xl font-extrabold text-slate-900">We couldn't load this shop.</p>
          <p className="text-slate-600 mt-2">It may have been removed, or the link is wrong.</p>
          <Link to="/shops" className={`${btn.primary} mt-5`}>Browse laundries</Link>
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className={`${wrap} py-16`}>
        <div className={`${card} max-w-md mx-auto p-8 text-center`}>
          <p className="text-xl font-extrabold text-slate-900">{shop.name} hasn't added any services yet.</p>
          <p className="text-slate-600 mt-2">Check back soon, or try another laundry.</p>
          <Link to="/shops" className={`${btn.primary} mt-5`}>Browse laundries</Link>
        </div>
      </div>
    );
  }

  if (booked) {
    return (
      <div className="bg-blue-50/60 min-h-[60vh]">
        <div className={`${wrap} py-16`}>
          <div role="status" className={`${card} max-w-md mx-auto p-8 text-center`}>
            <span className="mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={30} />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-4">Pickup booked</h1>
            <p className="text-slate-600 mt-2">
              {shop.name} will collect your laundry {chosenSlot ? `${chosenSlot.text.replace(", ", " between ")}.` : "at the time you chose."}
            </p>
            <p className="text-sm text-slate-500 mt-2">
              {perItem ? "You can pay from My Orders." : "You'll get a notification when the shop has weighed it, and you pay after that."}
            </p>
            <Link to="/orders" className={`${btn.primary} mt-6`}>View my orders</Link>
          </div>
        </div>
      </div>
    );
  }

  const size = LOAD_SIZES.find((s) => s.key === form.loadSize);
  const reviewRows = [
    {
      label: "Service",
      value: service?.name,
      sub: perItem ? `${form.quantity} × ${kes(service.price)}` : size ? `${size.label} load, about ${size.kg} kg` : "",
      step: 1,
    },
    { label: "Pickup", value: chosenSlot?.text || "—", step: 3 },
    { label: "Location", value: form.address.trim(), sub: pin ? "Exact pin saved" : "", step: 2 },
    { label: "Phone", value: form.phone.trim(), step: 2 },
    ...(form.notes.trim() ? [{ label: "Notes", value: form.notes.trim(), step: 2 }] : []),
  ];

  return (
    <div className="bg-blue-50/60 min-h-[calc(100vh-68px)]">
      <div className={`${wrap} py-8 sm:py-12`}>
        <div className="max-w-2xl mx-auto">
          <StepHeader step={step} shopName={shop.name} headingRef={headingRef} />

          {step === 1 && (
            <ServiceStep
              services={services}
              service={service}
              onService={(serviceId) => {
                setField("serviceId", serviceId);
                setShowErrors(false);
              }}
              loadSize={form.loadSize}
              onLoadSize={(key) => setField("loadSize", key)}
              quantity={form.quantity}
              onQuantity={(n) => setField("quantity", n)}
              total={total}
              showErrors={showErrors}
            />
          )}

          {step === 2 && (
            <DetailsStep
              address={form.address}
              phone={form.phone}
              notes={form.notes}
              onChange={(name, value) => {
                setField(name, value);
                if (name === "address") setAddressFromPin(false);
              }}
              errors={errors}
              showErrors={showErrors}
              pinned={Boolean(pin)}
              locating={locating}
              onUseLocation={handleUseLocation}
              gpsError={gpsError}
              addressFromPin={addressFromPin}
            />
          )}

          {step === 3 && (
            <TimeStep
              slots={slots}
              date={form.date}
              slotKey={form.slot}
              onPick={(date, slotKey) => {
                setForm((f) => ({ ...f, date, slot: slotKey }));
                setShowErrors(false);
              }}
              onReload={reloadSlots}
              expired={expired}
              showErrors={showErrors}
              perItem={perItem}
            />
          )}

          {step === 4 && (
            <ReviewStep
              rows={reviewRows}
              totalText={kes(total)}
              totalNote={perItem ? "" : "Weighed by the shop at pickup"}
              onEdit={goTo}
              onConfirm={confirm}
              submitting={submitting}
              error={submitError}
              timeProblem={timeProblem}
              onChangeTime={() => goTo(3)}
              payNote={
                perItem
                  ? "Nothing is charged now. You pay with M-Pesa from My Orders."
                  : "Nothing is charged now. The shop weighs your laundry at pickup, then you pay the final price from My Orders."
              }
            />
          )}

          <div className="flex items-center justify-between gap-3 mt-5 px-1">
            {step === 1 ? (
              <Link to={`/shop/${id}`} className="inline-flex items-center min-h-[44px] text-sm font-semibold text-slate-500 hover:text-slate-800">
                Back to shop
              </Link>
            ) : (
              <button type="button" onClick={() => goTo(step - 1)} className="inline-flex items-center min-h-[44px] text-sm font-semibold text-slate-500 hover:text-slate-800">
                Back
              </button>
            )}
            {step < 4 && (
              <button type="button" onClick={next} className={btn.primary}>
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookPickup;