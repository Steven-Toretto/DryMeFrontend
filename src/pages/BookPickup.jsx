import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createOrder, getShops, getServices } from "../api";

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
  });

  const [price, setPrice] = useState(0);

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

    if (!form.shop || !form.service || !form.weight) {
      alert("Fill all fields");
      return;
    }

    try {
      const payload = {
        shop_id: parseInt(form.shop),        // ✅ FIXED
        service_id: parseInt(form.service),  // ✅ FIXED
        weight: parseFloat(form.weight),
      };

      console.log("Sending:", payload);

      await createOrder(payload);

      alert("Order placed successfully!");
      navigate("/orders");

      // Reset form
      setForm({
        shop: "",
        service: "",
        weight: "",
      });

      setPrice(0);
    } catch (error) {
      console.error("ERROR:", error.response?.data);
      alert("Failed to place order");
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

        {/* Price */}
        {price > 0 && (
          <div className="p-3 bg-gray-100 rounded">
            <strong>Total Price: KES {price}</strong>
          </div>
        )}

        {/* Submit */}
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded">
          Book Pickup
        </button>
      </form>
    </div>
  );
}

export default BookPickup;


