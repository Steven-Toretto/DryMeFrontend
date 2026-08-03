import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { MapPin, CheckCircle2 } from "lucide-react";
import {
  getServices,
  createOrder,
  getShop,
  getProfile,
} from "../api";

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

  const [weight, setWeight] = useState(preselectWeight ? Number(preselectWeight) : 1);
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");

  // 📍 Exact GPS pin, captured on demand — optional, on top of the
  // required text landmark field above.
  const [pickupCoords, setPickupCoords] = useState(null); // { lat, lng }
  const [locatingGPS, setLocatingGPS] = useState(false);
  const [gpsError, setGpsError] = useState("");

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
  // 📍 CAPTURE EXACT GPS PIN
  // ===============================
  const handleUseMyLocation = () => {
    setGpsError("");

    if (!navigator.geolocation) {
      setGpsError("Location isn't supported on this browser.");
      return;
    }

    setLocatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Round to 6 decimal places — matches the backend's DecimalField
        // (max_digits=9, decimal_places=6). Raw browser coordinates can
        // carry far more precision than that and get rejected as invalid.
        setPickupCoords({
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
        });
        setLocatingGPS(false);
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
    }

  }, [id]);

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

        setPrice(
          Number(firstService.price_per_kg) *
          Number(weight)
        );
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
  // HANDLE SERVICE CHANGE
  // ===============================
  const handleServiceChange = (
    serviceId
  ) => {

    const parsedId = Number(serviceId);

    setSelectedService(parsedId);

    setError("");

    setSuccess("");

    const service = services.find(
      (s) => s.id === parsedId
    );

    if (service && weight > 0) {

      setPrice(
        Number(service.price_per_kg) *
        Number(weight)
      );

    } else {

      setPrice(0);
    }
  };

  // ===============================
  // HANDLE WEIGHT CHANGE
  // ===============================
  const handleWeightChange = (value) => {

    const newWeight = Number(value);

    setWeight(newWeight);

    setError("");

    setSuccess("");

    const service = services.find(
      (s) => s.id === Number(selectedService)
    );

    if (service && newWeight > 0) {

      setPrice(
        Number(service.price_per_kg) *
        Number(newWeight)
      );

    } else {

      setPrice(0);
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
  // HANDLE IMAGE URL
  // ===============================
  const getImageUrl = () => {

    if (!shop?.image) return null;

    // Cloudinary or full URL
    if (shop.image.startsWith("http")) {
      return shop.image;
    }

    // Local media image
    return `${import.meta.env.VITE_API_URL}${shop.image}`;
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

    if (!weight || weight <= 0) {

      setError(
        "Enter a valid weight"
      );

      return;
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
        weight: Number(weight),
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
      setWeight(1);
      setNotes("");

      setTimeout(() => {

        navigate("/orders");

      }, 1200);

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data
          ? JSON.stringify(
              err.response.data
            )
          : "Failed to place order"
      );

    } finally {

      setLoading(false);
    }
  };

  // ===============================
  // LOADING
  // ===============================
  if (fetching) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          Loading shop...
        </p>
      </div>
    );
  }

  // ===============================
  // SHOP NOT FOUND
  // ===============================
  if (!shop) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          Shop not found
        </p>
      </div>
    );
  }

  // ===============================
  // UI (user experience)
  // ===============================
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">

      <div className="max-w-5xl mx-auto">

        {/* SHOP CARD */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-8">

          {/* IMAGE */}
          {getImageUrl() ? (

            <img
              src={getImageUrl()}
              alt={shop.name}
              className="w-full h-72 object-cover"
            />

          ) : (

            <div className="w-full h-72 bg-gray-200 flex items-center justify-center text-gray-500">
              No Image
            </div>

          )}

          {/* SHOP INFO */}
          <div className="p-6">

            <h1 className="text-3xl font-bold text-gray-800">
              {shop.name}
            </h1>

            <p className="text-gray-500 mt-2">
              {shop.location}
            </p>

            <p className="mt-4 text-gray-700 leading-relaxed">
              {shop.description}
            </p>

          </div>

        </div>

        {/* BOOKING CARD */}
        <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">

          {/* HEADER */}
          <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-600">

            <h2 className="text-xl md:text-2xl font-extrabold text-white text-center">
              Book Laundry Service
            </h2>

          </div>

          <div className="p-6">

            {/* ERROR */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* SUCCESS */}
            {success && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 border text-green-600 text-sm">
                {success}
              </div>
            )}

            {/* NO SERVICES */}
            {services.length === 0 && (
              <div className="text-center text-gray-500 text-sm mb-4">
                No services available
              </div>
            )}

            {/* SERVICE */}
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service
            </label>

            <select
              value={selectedService}
              onChange={(e) =>
                handleServiceChange(
                  e.target.value
                )
              }
              className="w-full mb-4 rounded-xl border border-gray-200 px-3 py-3 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
            >

              <option value="">
                Select Service
              </option>

              {services.map((s) => (

                <option
                  key={s.id}
                  value={s.id}
                >
                  {s.name} — KES{" "}
                  {formatPrice(
                    s.price_per_kg
                  )}
                  /kg
                </option>

              ))}

            </select>

            {/* WEIGHT */}
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight (kg)
            </label>

            <input
              type="number"
              value={weight}
              min={1}
              onChange={(e) =>
                handleWeightChange(
                  e.target.value
                )
              }
              className="w-full mb-4 rounded-xl border border-gray-200 px-3 py-3 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
            />

            {/* PHONE */}
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0712 345 678"
              className="w-full mb-4 rounded-xl border border-gray-200 px-3 py-3 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
            />

            {/* PICKUP LOCATION */}
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Pickup location
              </label>
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={locatingGPS}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                <MapPin size={13} />
                {locatingGPS ? "Locating..." : pickupCoords ? "Update pin" : "Use my current location"}
              </button>
            </div>
            <input
              type="text"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              placeholder="e.g. Blue gate opposite Java House, Apt 4B"
              className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
            />
            <div className="mb-4 mt-1.5">
              {pickupCoords && (
                <p className="flex items-center gap-1 text-xs font-medium text-green-600">
                  <CheckCircle2 size={12} /> Exact pin captured — drivers will get precise directions.
                </p>
              )}
              {gpsError && (
                <p className="text-xs text-amber-600">{gpsError}</p>
              )}
              {!pickupCoords && !gpsError && (
                <p className="text-xs text-gray-400">
                  A neighborhood name alone can be hard to find — add a landmark, or tap "Use my current location" for an exact pin.
                </p>
              )}
            </div>

            {/* NOTES */}
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Gate code, stain alerts, special instructions..."
              className="w-full mb-4 rounded-xl border border-gray-200 px-3 py-3 text-sm focus:ring-2 focus:ring-blue-300 outline-none resize-none"
            />

            {/* PRICE */}
            <div className="mb-5 rounded-xl bg-gray-50 border p-4 text-center">

              <div className="text-xs text-gray-500">
                Total Price
              </div>

              <div className="text-2xl font-bold text-gray-900">
                KES {formatPrice(price)}
              </div>

            </div>

            {/* BUTTON */}
            <button
              onClick={handleBooking}
              disabled={
                loading ||
                !selectedService ||
                weight <= 0
              }
              className={`w-full py-3 rounded-xl text-white font-semibold transition ${
                loading ||
                !selectedService ||
                weight <= 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 shadow-md"
              }`}
            >

              {loading
                ? "Processing..."
                : "Confirm Booking"}

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ShopDetails;