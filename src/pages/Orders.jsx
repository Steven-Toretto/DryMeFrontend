import { useEffect, useState, useContext } from "react";
import {
  getOrders,
  getOwnerOrders,
  updateOrderStatus,
  archiveOrder,
} from "../api";

import {
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaArchive,
} from "react-icons/fa";

import { Link } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

function Orders() {

  const { token, user } = useContext(AuthContext);

  const role = user?.role;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // FETCH ORDERS
  // =========================
  const fetchOrders = async (showLoader = true) => {

    try {

      if (showLoader) {
        setLoading(true);
      }

      const data =
        role === "owner"
          ? await getOwnerOrders()
          : await getOrders();

      // hide archived orders
      const activeOrders = data.filter(
        (order) => !order.archived
      );

      setOrders(activeOrders);

    } catch (error) {

      console.error(
        "Fetch failed:",
        error.response?.data || error.message
      );

    } finally {

      if (showLoader) {
        setLoading(false);
      }
    }
  };

  // =========================
  // INITIAL FETCH
  // =========================
  useEffect(() => {

    if (!token || !role) return;

    fetchOrders(true);

  }, [token, role]);

  // =========================
  // AUTO REFRESH
  // =========================
  useEffect(() => {

    if (!token || !role) return;

    const interval = setInterval(async () => {

      try {

        const data =
          role === "owner"
            ? await getOwnerOrders()
            : await getOrders();

        // hide archived orders
        const activeOrders = data.filter(
          (order) => !order.archived
        );

        setOrders(activeOrders);

      } catch (error) {

        console.error(
          "Auto refresh failed:",
          error.response?.data || error.message
        );
      }

    }, 5000);

    return () => clearInterval(interval);

  }, [token, role]);

  // =========================
  // UPDATE STATUS
  // =========================
  const handleStatusUpdate = async (
    id,
    status
  ) => {

    try {

      await updateOrderStatus(id, status);

      fetchOrders(false);

    } catch (error) {

      console.error(
        "Update error:",
        error.response?.data || error.message
      );
    }
  };

  // =========================
  // ARCHIVE ORDER
  // =========================
  const handleArchive = async (id) => {

    const confirmArchive = window.confirm(
      "Archive this completed order?"
    );

    if (!confirmArchive) return;

    try {

      await archiveOrder(id);

      // instantly remove from UI
      setOrders((prev) =>
        prev.filter(
          (order) => order.id !== id
        )
      );

    } catch (err) {

      console.error(
        "Archive error:",
        err.response?.data || err.message
      );
    }
  };

  // =========================
  // STATUS STYLES
  // =========================
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

  // =========================
  // LOADING
  // =========================
  if (loading) {

    return (
      <div className="min-h-[50vh] flex items-center justify-center">

        <div className="animate-spin w-10 h-10 border-4 border-blue-300 border-t-transparent rounded-full" />

      </div>
    );
  }

  // =========================
  // EMPTY
  // =========================
  if (orders.length === 0) {

    return (
      <div className="min-h-[50vh] flex items-center justify-center">

        <Link
          to="/shops"
          className="text-gray-500"
        >
          No active orders yet{" "}
          <span className="text-blue-500">
            add
          </span>

        </Link>

      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (

    <div className="min-h-[80vh] bg-gray-100 py-10 px-4">

      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">

          <h2 className="text-3xl font-bold">

            {role === "owner"
              ? "Shop Orders"
              : "My Orders"}

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

                  <p className="text-gray-500">
                    Weight
                  </p>

                  <p className="font-semibold">
                    {order.weight} kg
                  </p>

                </div>

                <div>

                  <p className="text-gray-500">
                    Total
                  </p>

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

              {/* OWNER ACTION BUTTONS */}
              {role === "owner" && (

                <div className="flex flex-wrap gap-2 mt-4">

                  {[
                    "pending",
                    "washing",
                    "completed",
                  ].map((s) => (

                    <button
                      key={s}
                      onClick={() =>
                        handleStatusUpdate(
                          order.id,
                          s
                        )
                      }
                      className={`px-3 py-1 text-xs rounded-md text-white cursor-pointer ${
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

                  {/* ARCHIVE BUTTON */}
                  {order.status ===
                    "completed" && (

                    <button
                      onClick={() =>
                        handleArchive(
                          order.id
                        )
                      }
                      className="px-3 py-1 text-xs rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
                    >

                      <FaArchive />

                      Archive

                    </button>

                  )}

                </div>

              )}

              {/* CUSTOMER ARCHIVE */}
              {role === "customer" &&
                order.status ===
                  "completed" && (

                  <div className="mt-4">

                    <button
                      onClick={() =>
                        handleArchive(
                          order.id
                        )
                      }
                      className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                    >

                      <FaArchive />

                      Archive Order

                    </button>

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




// import { useEffect, useState, useContext } from "react";
// import {
//   getOrders,
//   getOwnerOrders,
//   updateOrderStatus,
//   archiveOrder,
// } from "../api";

// import { FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";

// import { Link } from "react-router-dom";

// import { AuthContext } from "../context/AuthContext";

// function Orders() {

//   const { token, user } = useContext(AuthContext);

//   const role = user?.role;

//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // =========================
//   // FETCH ORDERS
//   // =========================
//   const fetchOrders = async (showLoader = true) => {

//     try {

//       // only show spinner on first load
//       if (showLoader) {
//         setLoading(true);
//       }

//       const data =
//         role === "owner"
//           ? await getOwnerOrders()
//           : await getOrders();

//       setOrders(data);

//     } catch (error) {

//       console.error(
//         "Fetch failed:",
//         error.response?.data || error.message
//       );

//     } finally {

//       if (showLoader) {
//         setLoading(false);
//       }
//     }
//   };

//   // =========================
//   // INITIAL FETCH
//   // =========================
//   useEffect(() => {

//     // prevents unauthorized fetch
//     if (!token || !role) return;

//     fetchOrders(true);

//   }, [token, role]);

//   // =========================
//   // AUTO REFRESH
//   // =========================
//   useEffect(() => {

//     if (!token || !role) return;

//     const interval = setInterval(async () => {

//       try {

//         const data =
//           role === "owner"
//             ? await getOwnerOrders()
//             : await getOrders();

//         // refresh only orders state
//         setOrders(data);

//       } catch (error) {

//         console.error(
//           "Auto refresh failed:",
//           error.response?.data || error.message
//         );
//       }

//     }, 5000);

//     return () => clearInterval(interval);

//   }, [token, role]);

//   // =========================
//   // UPDATE STATUS
//   // =========================
//   const handleStatusUpdate = async (id, status) => {

//     try {

//       await updateOrderStatus(id, status);

//       // refresh silently
//       fetchOrders(false);

//     } catch (error) {

//       console.error(
//         "Update error:",
//         error.response?.data || error.message
//       );
//     }
//   };

//   // archive order (owner only)

//   const handleArchive = async (id) => {
//   try {

//     await archiveOrder(id);

//     // remove instantly from UI
//     setOrders(
//       orders.filter((order) => order.id !== id)
//     );

//   } catch (err) {
//     console.error(err);
//   }
// };


//   // =========================
//   // STATUS STYLES
//   // =========================
//   const getStatusStyle = (status) => {

//     switch (status) {

//       case "completed":
//         return "bg-green-100 text-green-700";

//       case "washing":
//         return "bg-yellow-100 text-yellow-700";

//       default:
//         return "bg-gray-100 text-gray-700";
//     }
//   };

//   // =========================
//   // LOADING
//   // =========================
//   if (loading) {

//     return (
//       <div className="min-h-[50vh] flex items-center justify-center">

//         <div className="animate-spin w-10 h-10 border-4 border-blue-300 border-t-transparent rounded-full" />

//       </div>
//     );
//   }

//   // =========================
//   // EMPTY
//   // =========================
//   if (orders.length === 0) {

//     return (
//       <div className="min-h-[50vh] flex items-center justify-center">

//         <Link
//           to="/shops"
//           className="text-gray-500"
//         >
//           No orders yet{" "}
//           <span className="text-blue-500">
//             add
//           </span>

//         </Link>

//       </div>
//     );
//   }

//   // =========================
//   // UI
//   // =========================
//   return (

//     <div className="min-h-[80vh] bg-gray-100 py-10 px-4">

//       <div className="max-w-5xl mx-auto">

//         {/* HEADER */}
//         <div className="flex justify-between items-center mb-8">

//           <h2 className="text-3xl font-bold">

//             {role === "owner"
//               ? "Shop Orders"
//               : "My Orders"}

//           </h2>

//           <span className="text-gray-500 text-sm">

//             {orders.length} orders

//           </span>

//         </div>

//         {/* ORDER LIST */}
//         <div className="space-y-5">

//           {orders.map((order) => (

//             <div
//               key={order.id}
//               className="bg-white rounded-2xl shadow hover:shadow-lg transition p-5"
//             >

//               {/* TOP ROW */}
//               <div className="flex justify-between items-center">

//                 <div>

//                   <h3 className="font-semibold text-lg">
//                     {order.service?.name}
//                   </h3>

//                   <p className="text-sm text-gray-500">
//                     {order.shop?.name}
//                   </p>

//                 </div>

//                 <span
//                   className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
//                     order.status
//                   )}`}
//                 >
//                   {order.status}
//                 </span>

//               </div>

//               {/* DETAILS */}
//               <div className="grid grid-cols-2 gap-4 mt-4 text-sm">

//                 <div>

//                   <p className="text-gray-500">
//                     Weight
//                   </p>

//                   <p className="font-semibold">
//                     {order.weight} kg
//                   </p>

//                 </div>

//                 <div>

//                   <p className="text-gray-500">
//                     Total
//                   </p>

//                   <p className="font-semibold text-blue-600">
//                     KES {order.total_price}
//                   </p>

//                 </div>

//               </div>

//               {/* OWNER VIEW */}
//               {role === "owner" && (

//                 <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">

//                   <p>
//                     <strong>Customer:</strong>{" "}
//                     {order.user?.username}
//                   </p>

//                   <p>
//                     <strong>Phone:</strong>{" "}
//                     {order.customer_phone || "N/A"}
//                   </p>

//                   <p>
//                     <strong>Location:</strong>{" "}
//                     {order.customer_location || "N/A"}
//                   </p>

//                   {/* ACTION LINKS */}
//                   <div className="flex gap-3 mt-2">

//                     {order.customer_phone && (

//                       <a
//                         href={`tel:${order.customer_phone}`}
//                         className="flex items-center gap-1 text-blue-600 text-xs"
//                       >

//                         <FaPhoneAlt className="h-4 w-4" />

//                         Call

//                       </a>

//                     )}

//                     {order.customer_location && (

//                       <a
//                         href={`https://www.google.com/maps/search/?api=1&query=${order.customer_location}`}
//                         target="_blank"
//                         rel="noreferrer"
//                         className="flex items-center gap-1 text-green-600 text-xs"
//                       >

//                         <FaMapMarkerAlt className="h-4 w-4" />

//                         Map

//                       </a>

//                     )}

//                   </div>

//                 </div>

//               )}

//               {/* OWNER ACTION BUTTONS */}
//               {role === "owner" && (

//                 <div className="flex gap-2 mt-4">

//                   {["pending", "washing", "completed"].map((s) => (

//                     <button
//                       key={s}
//                       onClick={() =>
//                         handleStatusUpdate(order.id, s)
//                       }
//                       className={`px-3 py-1 text-xs rounded-md text-white cursor-pointer ${
//                         s === "pending"
//                           ? "bg-gray-500"
//                           : s === "washing"
//                           ? "bg-yellow-500"
//                           : "bg-green-600"
//                       }`}
//                     >

//                       {s}

//                     </button>

//                   ))}

//                 </div>

//               )}

//               {/* FOOTER */}
//               <div className="mt-4 text-xs text-gray-400">

//                 Order #{order.id}

//               </div>

//             </div>

//           ))}

//         </div>

//       </div>

//     </div>
//   );
// }

// export default Orders;



