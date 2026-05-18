import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getShops } from "../api";

function ShopDetail() {

  const { id } = useParams();

  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShop();
  }, []);

  const fetchShop = async () => {
    try {

      const data = await getShops();

      const foundShop = data.find(
        (s) => s.id === Number(id)
      );

      setShop(foundShop);

    } catch (error) {
      console.error(error);

    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Shop not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow overflow-hidden">

        {/* IMAGE */}
        {shop.image && (
          <img
            src={shop.image}
            alt={shop.name}
            className="w-full h-72 object-cover"
          />
        )}

        {/* CONTENT */}
        <div className="p-6">

          <h1 className="text-3xl font-bold text-gray-800">
            {shop.name}
          </h1>

          <p className="text-gray-500 mt-2">
            {shop.location}
          </p>

          <p className="mt-4 text-gray-700">
            {shop.description}
          </p>

        </div>

      </div>

    </div>
  );
}

export default ShopDetail;




// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { getServices, createOrder } from "../api";

// function ShopDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [services, setServices] = useState([]);
//   const [selectedService, setSelectedService] = useState("");
//   const [weight, setWeight] = useState(1);
//   const [price, setPrice] = useState(0);

//   const [loading, setLoading] = useState(false);
//   const [fetching, setFetching] = useState(true);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   // ===============================
//   // FETCH SERVICES
//   // ===============================
//   useEffect(() => {
//     if (id) fetchServices();
//   }, [id]);

//   const fetchServices = async () => {
//     try {
//       setFetching(true);
//       const data = await getServices(id);
//       setServices(data);

//       // ✅ Auto-select first service (premium UX)
//       if (data.length > 0) {
//         const first = data[0];
//         setSelectedService(first.id);
//         setPrice(first.price_per_kg * weight);
//       }
//     } catch (err) {
//       setError("Failed to load services");
//     } finally {
//       setFetching(false);
//     }
//   };

//   // ===============================
//   // HANDLE SERVICE CHANGE
//   // ===============================
//   const handleServiceChange = (serviceId) => {
//     const parsedId = Number(serviceId);
//     setSelectedService(parsedId);
//     setError("");
//     setSuccess("");

//     const service = services.find((s) => s.id === parsedId);

//     if (service && weight > 0) {
//       setPrice(service.price_per_kg * weight);
//     } else {
//       setPrice(0);
//     }
//   };

//   // ===============================
//   // HANDLE WEIGHT CHANGE
//   // ===============================
//   const handleWeightChange = (value) => {
//     const newWeight = Number(value);
//     setWeight(newWeight);
//     setError("");
//     setSuccess("");

//     const service = services.find((s) => s.id === selectedService);

//     if (service && newWeight > 0) {
//       setPrice(service.price_per_kg * newWeight);
//     } else {
//       setPrice(0);
//     }
//   };

//   // ===============================
//   // FORMAT PRICE
//   // ===============================
//   const formatPrice = (num) => {
//     return new Intl.NumberFormat("en-KE").format(num || 0);
//   };

//   // ===============================
//   // HANDLE BOOKING
//   // ===============================
//   const handleBooking = async () => {
//     const token = localStorage.getItem("access");

//     if (!token) {
//       navigate("/login");
//       return;
//     }

//     setError("");
//     setSuccess("");

//     if (!selectedService) {
//       setError("Please select a service");
//       return;
//     }

//     if (!weight || weight <= 0) {
//       setError("Enter a valid weight");
//       return;
//     }

//     try {
//       setLoading(true);

//       const payload = {
//         shop_id: Number(id),
//         service_id: Number(selectedService),
//         weight: Number(weight),
//       };

//       await createOrder(payload);

//       setSuccess("Order placed successfully!");

//       // Reset
//       setWeight(1);

//       setTimeout(() => {
//         navigate("/orders");
//       }, 1200);

//     } catch (err) {
//       setError(
//         err.response?.data
//           ? JSON.stringify(err.response.data)
//           : "Failed to place order"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ===============================
//   // UI
//   // ===============================
//   return (
//     <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12">
//       <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden">
        
//         {/* Header */}
//         <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-600">
//           <h2 className="text-xl md:text-2xl font-extrabold text-white text-center">
//             Book Laundry Service
//           </h2>
//         </div>

//         <div className="p-6">

//           {/* Loading */}
//           {fetching && (
//             <div className="text-center text-gray-500 text-sm mb-4">
//               Loading services...
//             </div>
//           )}

//           {/* Error */}
//           {error && (
//             <div className="mb-4 p-3 rounded-lg bg-red-50 border text-red-600 text-sm">
//               {error}
//             </div>
//           )}

//           {/* Success */}
//           {success && (
//             <div className="mb-4 p-3 rounded-lg bg-green-50 border text-green-600 text-sm">
//               {success}
//             </div>
//           )}

//           {/* No services */}
//           {!fetching && services.length === 0 && (
//             <div className="text-center text-gray-500 text-sm mb-4">
//               No services available for this shop
//             </div>
//           )}

//           {/* Service Select */}
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Service
//           </label>
//           <select
//             value={selectedService}
//             onChange={(e) => handleServiceChange(e.target.value)}
//             className="w-full mb-4 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
//           >
//             <option value="">Select Service</option>
//             {services.map((s) => (
//               <option key={s.id} value={s.id}>
//                 {s.name} - KES {formatPrice(s.price_per_kg)}/kg
//               </option>
//             ))}
//           </select>

//           {/* Weight */}
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Weight (kg)
//           </label>
//           <input
//             type="number"
//             value={weight}
//             onChange={(e) => handleWeightChange(e.target.value)}
//             className="w-full mb-4 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
//             min={1}
//           />

//           {/* Price */}
//           <div className="mb-5 rounded-xl bg-gray-50 border p-4 text-center">
//             <div className="text-xs text-gray-500">Total Price</div>
//             <div className="text-2xl font-bold text-gray-900">
//               KES {formatPrice(price)}
//             </div>
//           </div>

//           {/* Button */}
//           <button
//             onClick={handleBooking}
//             disabled={loading || !selectedService || weight <= 0}
//             className={`w-full py-3 rounded-xl text-white font-semibold transition ${
//               loading || !selectedService || weight <= 0
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-blue-600 hover:bg-blue-700 shadow-md"
//             }`}
//           >
//             {loading ? "Processing..." : "Confirm Booking"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ShopDetails;


