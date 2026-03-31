import { useEffect, useState } from "react";
import { getOrders, getOwnerOrders, updateOrderStatus } from "../api";
 import { FaPhoneAlt } from "react-icons/fa";
import { FaMapMarkerAlt } from "react-icons/fa";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const role = localStorage.getItem("role");

  const fetchOrders = async () => {
    try {
      const data =
        role === "owner" ? await getOwnerOrders() : await getOrders();
      setOrders(data);
    } catch (error) {
      console.error(" Failed:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      fetchOrders();
    } catch (err) {
      console.error(" Update error:", err.response?.data);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "washing":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-300 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-gray-500">No orders yet</p>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-gray-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">
            {role === "owner" ? "Shop Orders" : "My Orders"}
          </h2>
          <span className="text-gray-500 text-sm">
            {orders.length} orders
          </span>
        </div>

        {/* ORDER LIST */}
        <div className="space-y-5">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl shadow hover:shadow-lg transition p-5"
            >
              {/* TOP ROW */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">
                    {order.service?.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {order.shop?.name}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>

              {/* DETAILS */}
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-gray-500">Weight</p>
                  <p className="font-semibold">{order.weight} kg</p>
                </div>

                <div>
                  <p className="text-gray-500">Total</p>
                  <p className="font-semibold text-blue-600">
                    KES {order.total_price}
                  </p>
                </div>
              </div>

              {/* OWNER VIEW */}
              {role === "owner" && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
                  <p>
                    <strong>Customer:</strong>{" "}
                    {order.user?.username}
                  </p>

                  <p>
                    <strong>Phone:</strong>{" "}
                    {order.customer_phone || "N/A"}
                  </p>

                  <p>
                    <strong>Location:</strong>{" "}
                    {order.customer_location || "N/A"}
                  </p>

                  {/* ACTION LINKS */}
                 

{/* ACTION LINKS */}
<div className="flex gap-3 mt-2">
  {order.customer_phone && (
    <a
      href={`tel:${order.customer_phone}`}
      className="flex items-center gap-1 text-blue-600 text-xs"
    >
      <FaPhoneAlt className="h-4 w-4" />
      Call
    </a>
  )}

  {order.customer_location && (
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${order.customer_location}`}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-1 text-green-600 text-xs"
    >
      <FaMapMarkerAlt className="h-4 w-4" />
      Map
    </a>
  )}
</div>

                </div>
              )}

              {/* ACTION BUTTONS */}
              {role === "owner" && (
                <div className="flex gap-2 mt-4">
                  {["pending", "washing", "completed"].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusUpdate(order.id, s)}
                      className={`px-3 py-1 text-xs rounded-md text-white ${
                        s === "pending"
                          ? "bg-gray-500"
                          : s === "washing"
                          ? "bg-yellow-500"
                          : "bg-green-600"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* FOOTER */}
              <div className="mt-4 text-xs text-gray-400">
                Order #{order.id}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Orders;






// import { useEffect, useState } from "react";
// import { getOrders, getOwnerOrders, updateOrderStatus } from "../api";

// function Orders() {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const role = localStorage.getItem("role");

//   // =========================
//   // 📡 FETCH ORDERS
//   // =========================
//   const fetchOrders = async () => {
//     try {
//       let data;

//       if (role === "owner") {
//         data = await getOwnerOrders(); //  fetches shop orders if logged in as owner
//       } else {
//         data = await getOrders(); //  fetches customer’s own orders
//       }

//       setOrders(data); //  updates state with fetched orders
//     } catch (error) {
//       console.error(
//         " Failed to fetch orders:",
//         error.response?.data || error.message, //  good error handling
//       );
//     } finally {
//       setLoading(false); //  ensures loading state is cleared
//     }
//   };

//   useEffect(() => {
//     fetchOrders(); //  runs once on mount
//   }, []);

//   // =========================
//   // 🔄 UPDATE STATUS (OWNER)
//   // =========================
//   const handleStatusUpdate = async (id, status) => {
//     try {
//       await updateOrderStatus(id, status); //  updates order status via API
//       fetchOrders(); //  refreshes orders after update
//     } catch (err) {
//       console.error(" Update error:", err.response?.data); //  logs error clearly
//     }
//   };

//   // =========================
//   // UI STATES
//   // =========================
//   if (loading) {
//     return (
//       <div className="min-h-[50vh] flex items-center justify-center">
//         <div className="text-center">
//           <div className="inline-block w-10 h-10 border-4 border-blue-300 border-t-transparent rounded-full animate-spin mb-3" />
//           <div className="text-sm text-gray-600">Loading orders...</div>
//         </div>
//       </div>
//     );
//   }

//   if (orders.length === 0) {
//     return (
//       <div className="min-h-[50vh] flex items-center justify-center px-4">
//         <div className="max-w-xl text-center bg-white p-8 rounded-2xl shadow">
//           <h3 className="text-lg font-semibold text-gray-900 mb-2">
//             No orders found
//           </h3>
//           <p className="text-sm text-gray-500">
//             You don't have any orders yet. Once you place an order it will
//             appear here.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-[70vh] bg-gray-300 py-10">
//       <div className="max-w-4xl mx-auto px-4">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-2xl font-extrabold text-gray-900">
//             {role === "owner" ? "Shop Orders" : "My Orders"}
//           </h2>
//           <div className="text-sm text-gray-500">
//             {orders.length} {orders.length === 1 ? "order" : "orders"}
//           </div>
//         </div>

//         <div className="flex flex-col gap-4">
//           {orders.map((order) => (
//             <div
//               key={order.id}
//               className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-4"
//             >
//               <div className="flex items-start gap-4">
//                 {/* Left meta */}
//                 <div className="flex-shrink-0">
//                   <div className="w-14 h-14 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
//                     {order.id}
//                   </div>
//                 </div>

//                 {/* Main content */}
//                 <div className="flex-1">
//                   <div className="flex items-start justify-between gap-4">
//                     <div>
//                       <h3 className="text-md font-semibold text-gray-900">
//                         {order.service?.name ?? "Service"}
//                       </h3>

//                       <div className="mt-1 text-sm text-gray-600">
//                         <span className="mr-2">
//                           <strong>Shop:</strong> {order.shop?.name ?? "—"}
//                         </span>
//                         {role === "owner" && (
//                           <span>
//                             <strong>Customer:</strong>{" "}
//                             {order.user?.username ?? "—"}
//                           </span>
//                         )}
//                       </div>
//                     </div>

//                     <div className="text-right">
//                       <div className="text-sm text-gray-500">Weight</div>
//                       <div className="text-lg font-semibold text-gray-900">
//                         {order.weight} kg
//                       </div>
//                     </div>
//                   </div>

//                   <div className="mt-3 flex items-center justify-between gap-4">
//                     <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
//                       <div className="text-xs text-gray-500">Total</div>
//                       <div className="font-semibold">
//                         KES {order.total_price}
//                       </div>
//                     </div>

//                     <div className="ml-auto text-sm">
//                       <div>
//                         <span
//                           className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
//                           ${
//                             order.status === "completed"
//                               ? "bg-green-100 text-green-700"
//                               : order.status === "washing"
//                                 ? "bg-yellow-100 text-yellow-700"
//                                 : "bg-gray-100 text-gray-700"
//                           }`}
//                         >
//                           {order.status}
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Owner actions */}
//                   {role === "owner" && (
//                     <div className="mt-4 flex flex-wrap gap-2">
//                       {["pending", "washing", "completed"].map((s) => {
//                         const baseClasses =
//                           "text-sm px-3 py-1 rounded-md transition";
//                         const statusClasses =
//                           s === "pending"
//                             ? "bg-gray-400 hover:bg-gray-500 text-white"
//                             : s === "washing"
//                               ? "bg-yellow-600 hover:bg-yellow-600 text-white"
//                               : "bg-green-700 hover:bg-green-700 text-white";

//                         return (
//                           <button
//                             key={s}
//                             onClick={() => handleStatusUpdate(order.id, s)}
//                             className={`${baseClasses} ${statusClasses}`}
//                           >
//                             {s}
//                           </button>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Orders;
