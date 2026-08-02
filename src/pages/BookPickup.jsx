import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createOrder, getShops, getServices, getProfile } from "../api";

function BookPickup() {
  const navigate = useNavigate();

  const [shops, setShops] = useState([]);
  const [services, setServices] = useState([]);

  // book again btn
  const [searchParams] = useSearchParams();

  const shopId = searchParams.get("shop");
  const serviceId = searchParams.get("service");

  const [form, setForm] = useState({
    shop: "",
    service: "",
    weight: "",
    notes: "",
    phone: "",
    location: "",
  });

  const [price, setPrice] = useState(0);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // =========================
  // 📡 PRE-FILL CONTACT INFO FROM PROFILE
  // =========================
  useEffect(() => {
    (async () => {
      try {
        const profile = await getProfile();
        setForm((prev) => ({
          ...prev,
          phone: prev.phone || profile.phone || "",
          location: prev.location || profile.location || "",
        }));
      } catch (err) {
        console.error("Couldn't load profile for pre-fill:", err.response?.data || err.message);
      }
    })();
  }, []);

  // book again btn
  useEffect(() => {
  if (shopId) {
    setForm((prev) => ({
      ...prev,
      shop: shopId,
    }));
  }
}, [shopId]);

useEffect(() => {
  if (serviceId) {
    setForm((prev) => ({
      ...prev,
      service: serviceId,
    }));
  }
}, [serviceId]);

  // =========================
  // 📡 FETCH SHOPS
  // =========================
  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const data = await getShops();
      setShops(data.results ?? data);
    } catch (err) {
      console.error("Failed to load shops");
    }
  };

  // =========================
  // 📡 FETCH SERVICES
  // =========================
  useEffect(() => {
    if (form.shop) {
      fetchServices(form.shop);
    } else {
      setServices([]);
    }
  }, [form.shop]);

  const fetchServices = async (shopId) => {
    try {
      const data = await getServices(shopId);

      // ✅ Handle paginated response from DRF
      const results = data.results ?? data;
      setServices(results);
    } catch (err) {
      console.error("Failed to load services");
    }
  };

  // =========================
  // ✍️ HANDLE INPUT
  // =========================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // 💰 AUTO PRICE CALCULATION
  // =========================
  useEffect(() => {
    if (form.service && form.weight) {
      const selected = services.find(
        (s) => s.id === parseInt(form.service)
      );

      if (selected) {
        setPrice(selected.price_per_kg * parseFloat(form.weight));
      }
    } else {
      setPrice(0);
    }
  }, [form.service, form.weight, services]);

  // =========================
  // 🚀 SUBMIT ORDER
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.shop || !form.service || !form.weight) {
      setFormError("Fill in the shop, service, and weight.");
      return;
    }
    if (!form.phone.trim()) {
      setFormError("A phone number is required so the shop can reach you.");
      return;
    }
    if (!form.location.trim()) {
      setFormError("A pickup location is required.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        shop_id: parseInt(form.shop),
        service_id: parseInt(form.service),
        weight: parseFloat(form.weight),
        customer_notes: form.notes.trim(),
        customer_phone: form.phone.trim(),
        customer_location: form.location.trim(),
      };

      await createOrder(payload);

      alert("Order placed successfully!");
      navigate("/orders");

      // Reset form
      setForm({
        shop: "",
        service: "",
        weight: "",
        notes: "",
        phone: form.phone,
        location: form.location,
      });

      setPrice(0);
    } catch (error) {
      console.error("ERROR:", error.response?.data);
      const data = error.response?.data;
      setFormError(data ? Object.values(data).flat().join(" ") : "Failed to place order.");
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="max-w-md mx-auto my-20 p-6 shadow-lg rounded-2xl bg-white">
      <h2 className="text-2xl font-bold mb-4">
        Book Laundry Pickup
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Shop */}
        <select
          name="shop"
          value={form.shop}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Select Shop</option>
          {shops.map((shop) => (
            <option key={shop.id} value={shop.id}>
              {shop.name}
            </option>
          ))}
        </select>

        {/* Service */}
        <select
          name="service"
          value={form.service}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
          disabled={!form.shop}
        >
          <option value="">Select Service</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} - KES {service.price_per_kg}/kg
            </option>
          ))}
        </select>

        {/* Weight */}
        <input
          name="weight"
          type="number"
          placeholder="Weight (kg)"
          value={form.weight}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          min={1}
          required
        />

        {/* Contact + pickup location — required so the shop can actually reach you */}
        <input
          name="phone"
          type="tel"
          placeholder="Phone number (e.g. 0712 345 678)"
          value={form.phone}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          name="location"
          type="text"
          placeholder="Pickup location (e.g. Kilimani, Nairobi)"
          value={form.location}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        {/* Notes */}
        <div>
          <textarea
            name="notes"
            placeholder="Anything the shop should know? Gate code, handling instructions, a stain to watch for..."
            value={form.notes}
            onChange={handleChange}
            maxLength={500}
            rows={3}
            className="w-full border p-2 rounded resize-none"
          />
          <p className="text-xs text-gray-400 text-right mt-1">
            {form.notes.length}/500
          </p>
        </div>

        {/* Price */}
        {price > 0 && (
          <div className="p-3 bg-gray-100 rounded">
            <strong>Total Price: KES {price}</strong>
          </div>
        )}

        {formError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded p-2">{formError}</p>
        )}

        {/* Submit */}
        <button disabled={submitting} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded disabled:opacity-50">
          {submitting ? "Booking..." : "Book Pickup"}
        </button>
      </form>
    </div>
  );
}

export default BookPickup;