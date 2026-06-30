import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";

import {
  getOrders,
  getOwnerOrders,
  getArchivedOrders,
  getArchivedOwnerOrders,
  updateOrderStatus,
  archiveOrder,
  initiatePayment,
  checkPaymentStatus,
} from "../api";

import {
  Phone,
  MapPin,
  Archive,
  Package,
  Droplets,
  CheckCircle2,
  Clock,
  RotateCcw,
  CreditCard,
} from "lucide-react";

import { AuthContext } from "../context/AuthContext";

function Orders() {
  const { token, user } = useContext(AuthContext);
  const role = user?.role;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  const [payingOrderId, setPayingOrderId] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [pollingOrderId, setPollingOrderId] = useState(null);

  const navigate = useNavigate();

  // ===========================
  // INITIATE MPESA PAYMENT
  // ===========================
  const handlePay = async (orderId) => {
    setPaymentMessage("");
    setPayingOrderId(orderId);
    try {
      const res = await initiatePayment(orderId);
      setPaymentMessage(res.message || "Payment prompt sent to your phone!");
      startPolling(orderId);
    } catch (err) {
      const msg = err.response?.data?.error || "Payment initiation failed.";
      setPaymentMessage(msg);
      setPayingOrderId(null);
    }
  };

  // ===========================
  // POLL PAYMENT STATUS
  // ===========================
  const startPolling = (orderId) => {
    setPollingOrderId(orderId);
    let attempts = 0;
    const maxAttempts = 10;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await checkPaymentStatus(orderId);
        if (res.payment_status === "paid") {
          setPaymentMessage("Payment confirmed! M-Pesa code: " + res.mpesa_transaction_code);
          clearInterval(interval);
          setPollingOrderId(null);
          setPayingOrderId(null);
          fetchOrders();
        } else if (res.payment_status === "failed") {
          setPaymentMessage("Payment failed or cancelled. Click Pay to try again.");
          clearInterval(interval);
          setPollingOrderId(null);
          setPayingOrderId(null);
          fetchOrders();
        } else if (attempts >= maxAttempts) {
          setPaymentMessage("Payment pending. Check back shortly.");
          clearInterval(interval);
          setPollingOrderId(null);
          setPayingOrderId(null);
        }
      } catch (err) {
        clearInterval(interval);
        setPollingOrderId(null);
      }
    }, 3000);
  };

  // =========================
  // FETCH ORDERS
  // =========================
  const fetchOrders = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      let data;
      if (activeTab === "archived") {
        data = role === "owner" ? await getArchivedOwnerOrders() : await getArchivedOrders();
      } else {
        data = role === "owner" ? await getOwnerOrders() : await getOrders();
      }

      setOrders(data.results ?? data);
    } catch (error) {
      console.error("Fetch failed:", error.response?.data || error.message);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !role) return;
    fetchOrders(true);
  }, [token, role, activeTab]);

  // Only auto-refresh if there is a pending payment order
  useEffect(() => {
    if (!token || !role) return;
    const hasPendingPayment = orders.some((o) => o.payment_status === "pending_payment");
    if (!hasPendingPayment) return;

    const interval = setInterval(() => fetchOrders(false), 5000);
    return () => clearInterval(interval);
  }, [token, role, activeTab, orders]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      fetchOrders(false);
    } catch (error) {
      console.error("Update error:", error.response?.data || error.message);
    }
  };

  const handleArchive = async (id) => {
    const confirmArchive = window.confirm("Archive this order?");
    if (!confirmArchive) return;

    try {
      await archiveOrder(id);
      setOrders((prev) => prev.filter((order) => order.id !== id));
    } catch (err) {
      console.error("Archive error:", err.response?.data || err.message);
    }
  };

  const handleBookAgain = (order) => {
    navigate(`/book-pickup?shop=${order.shop.id}&service=${order.service.id}&weight=${order.weight}`);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "completed":
        return { color: "bg-green-100 text-green-700", icon: <CheckCircle2 size={13} /> };
      case "washing":
        return { color: "bg-blue-100 text-blue-700", icon: <Droplets size={13} /> };
      default:
        return { color: "bg-orange-100 text-orange-700", icon: <Clock size={13} /> };
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900">
              {role === "owner" ? "Shop Orders" : "My Orders"}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </p>
          </div>
          <div className="hidden sm:flex w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 items-center justify-center shadow-md shadow-blue-100">
            <Package size={20} className="text-white" />
          </div>
        </div>

        {/* TABS */}
        <div className="inline-flex bg-white border border-gray-100 rounded-xl p-1 mb-6 shadow-sm">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === "active"
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Active Orders
          </button>
          <button
            onClick={() => setActiveTab("archived")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === "archived"
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Archived
          </button>
        </div>

        {/* EMPTY */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-300 flex items-center justify-center mx-auto mb-4">
              <Package size={28} />
            </div>
            <p className="text-gray-500 font-medium">
              {activeTab === "archived" ? "No archived orders yet" : "No orders yet"}
            </p>
            {activeTab === "active" && role !== "owner" && (
              <Link
                to="/shops"
                className="inline-block mt-4 text-sm font-semibold text-blue-600 hover:underline"
              >
                Browse shops →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusCfg = getStatusConfig(order.status);

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition p-5"
                >

                  {/* TOP */}
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{order.service?.name}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{order.shop?.name}</p>
                    </div>
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${statusCfg.color}`}>
                      {statusCfg.icon}
                      {order.status}
                    </span>
                  </div>

                  {/* DETAILS */}
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-50 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">Weight</p>
                      <p className="font-bold text-gray-800 mt-0.5">{order.weight} kg</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Total</p>
                      <p className="font-bold text-blue-600 mt-0.5">KES {order.total_price}</p>
                    </div>
                  </div>

                  {/* PAYMENT SECTION — CUSTOMER ONLY */}
                  {role === "customer" && activeTab === "active" && (
                    <div className="mt-4 pt-4 border-t border-gray-50">

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-500 flex items-center gap-1.5">
                          <CreditCard size={14} />
                          Payment
                        </span>
                        <span className={
                          order.payment_status === "paid"
                            ? "text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700"
                            : order.payment_status === "pending_payment"
                            ? "text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700"
                            : order.payment_status === "failed"
                            ? "text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700"
                            : "text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600"
                        }>
                          {order.payment_status === "paid" && "Paid"}
                          {order.payment_status === "pending_payment" && "Pending"}
                          {order.payment_status === "failed" && "Failed"}
                          {order.payment_status === "unpaid" && "Unpaid"}
                        </span>
                      </div>

                      {order.payment_status === "paid" && order.mpesa_transaction_code && (
                        <p className="text-xs text-green-600 mb-3 bg-green-50 rounded-lg px-3 py-2">
                          M-Pesa Code: <strong>{order.mpesa_transaction_code}</strong>
                        </p>
                      )}

                      {(order.payment_status === "unpaid" || order.payment_status === "failed") && (
                        <button
                          onClick={() => handlePay(order.id)}
                          disabled={payingOrderId === order.id || pollingOrderId === order.id}
                          className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white text-sm font-bold py-3 rounded-xl transition disabled:opacity-50 shadow-sm shadow-green-100"
                        >
                          {payingOrderId === order.id
                            ? "Sending prompt..."
                            : pollingOrderId === order.id
                            ? "Waiting for payment..."
                            : "Pay with M-Pesa"}
                        </button>
                      )}

                      {paymentMessage && (
                        <p className="text-xs text-gray-500 mt-2.5 text-center">{paymentMessage}</p>
                      )}

                    </div>
                  )}

                  {/* OWNER INFO */}
                  {role === "owner" && (
                    <div className="mt-4 pt-4 border-t border-gray-50">
                      <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5">
                        <p className="text-gray-700">
                          <span className="font-semibold text-gray-900">Customer:</span> {order.user?.username}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-semibold text-gray-900">Phone:</span> {order.customer_phone || "N/A"}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-semibold text-gray-900">Location:</span> {order.customer_location || "N/A"}
                        </p>

                        <div className="flex gap-4 pt-2">
                          {order.customer_phone && (
                            <a
                              href={`tel:${order.customer_phone}`}
                              className="flex items-center gap-1.5 text-blue-600 text-xs font-semibold hover:underline"
                            >
                              <Phone size={12} />
                              Call
                            </a>
                          )}
                          {order.customer_location && (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${order.customer_location}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 text-green-600 text-xs font-semibold hover:underline"
                            >
                              <MapPin size={12} />
                              Map
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* OWNER ACTIONS */}
                  {role === "owner" && activeTab !== "archived" && (
                    <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-50">
                      {["pending", "washing", "completed"].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusUpdate(order.id, s)}
                          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg text-white capitalize transition ${
                            order.status === s ? "ring-2 ring-offset-1 ring-blue-300" : ""
                          } ${
                            s === "pending"
                              ? "bg-gray-500 hover:bg-gray-600"
                              : s === "washing"
                              ? "bg-blue-500 hover:bg-blue-600"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {s}
                        </button>
                      ))}

                      {order.status === "completed" && !order.owner_archived && (
                        <button
                          onClick={() => handleArchive(order.id)}
                          className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gray-800 text-white flex items-center gap-1.5 hover:bg-gray-900 transition ml-auto"
                        >
                          <Archive size={12} />
                          Archive
                        </button>
                      )}
                    </div>
                  )}

                  {/* CUSTOMER ARCHIVE */}
                  {role === "customer" &&
                    activeTab !== "archived" &&
                    order.status === "completed" &&
                    !order.customer_archived && (
                      <div className="mt-4 pt-4 border-t border-gray-50">
                        <button
                          onClick={() => handleArchive(order.id)}
                          className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-gray-800 hover:bg-gray-900 text-white flex items-center gap-2 transition"
                        >
                          <Archive size={14} />
                          Archive Order
                        </button>
                      </div>
                    )}

                  {/* BOOK AGAIN */}
                  {role === "customer" && activeTab === "archived" && (
                    <div className="mt-4 pt-4 border-t border-gray-50">
                      <button
                        onClick={() => handleBookAgain(order)}
                        className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white flex items-center gap-2 transition"
                      >
                        <RotateCcw size={14} />
                        Book Again
                      </button>
                    </div>
                  )}

                  {/* FOOTER */}
                  <div className="mt-4 text-xs text-gray-300 font-medium">
                    Order #{order.id}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

export default Orders;



// import { useEffect, useState, useContext } from "react";
// import { useNavigate, Link } from "react-router-dom";

// import {
//   getOrders,
//   getOwnerOrders,
//   getArchivedOrders,
//   getArchivedOwnerOrders,
//   updateOrderStatus,
//   archiveOrder,
//   initiatePayment,
//   checkPaymentStatus,
// } from "../api";

// import {
//   Phone,
//   MapPin,
//   Archive,
//   Package,
//   Droplets,
//   CheckCircle2,
//   Clock,
//   RotateCcw,
//   CreditCard,
// } from "lucide-react";

// import { AuthContext } from "../context/AuthContext";

// function Orders() {
//   const { token, user } = useContext(AuthContext);
//   const role = user?.role;

//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState("active");

//   const [payingOrderId, setPayingOrderId] = useState(null);
//   const [paymentMessage, setPaymentMessage] = useState("");
//   const [pollingOrderId, setPollingOrderId] = useState(null);

//   const navigate = useNavigate();

//   // ===========================
//   // INITIATE MPESA PAYMENT
//   // ===========================
//   const handlePay = async (orderId) => {
//     setPaymentMessage("");
//     setPayingOrderId(orderId);
//     try {
//       const res = await initiatePayment(orderId);
//       setPaymentMessage(res.message || "Payment prompt sent to your phone!");
//       startPolling(orderId);
//     } catch (err) {
//       const msg = err.response?.data?.error || "Payment initiation failed.";
//       setPaymentMessage(msg);
//       setPayingOrderId(null);
//     }
//   };

//   // ===========================
//   // POLL PAYMENT STATUS
//   // ===========================
//   const startPolling = (orderId) => {
//     setPollingOrderId(orderId);
//     let attempts = 0;
//     const maxAttempts = 10;

//     const interval = setInterval(async () => {
//       attempts++;
//       try {
//         const res = await checkPaymentStatus(orderId);
//         if (res.payment_status === "paid") {
//           setPaymentMessage("Payment confirmed! M-Pesa code: " + res.mpesa_transaction_code);
//           clearInterval(interval);
//           setPollingOrderId(null);
//           setPayingOrderId(null);
//           fetchOrders();
//         } else if (res.payment_status === "failed") {
//           setPaymentMessage("Payment failed or cancelled. Click Pay to try again.");
//           clearInterval(interval);
//           setPollingOrderId(null);
//           setPayingOrderId(null);
//           fetchOrders();
//         } else if (attempts >= maxAttempts) {
//           setPaymentMessage("Payment pending. Check back shortly.");
//           clearInterval(interval);
//           setPollingOrderId(null);
//           setPayingOrderId(null);
//         }
//       } catch (err) {
//         clearInterval(interval);
//         setPollingOrderId(null);
//       }
//     }, 3000);
//   };

//   // =========================
//   // FETCH ORDERS
//   // =========================
//   const fetchOrders = async (showLoader = true) => {
//     try {
//       if (showLoader) setLoading(true);

//       let data;
//       if (activeTab === "archived") {
//         data = role === "owner" ? await getArchivedOwnerOrders() : await getArchivedOrders();
//       } else {
//         data = role === "owner" ? await getOwnerOrders() : await getOrders();
//       }

//       setOrders(data.results ?? data);
//     } catch (error) {
//       console.error("Fetch failed:", error.response?.data || error.message);
//     } finally {
//       if (showLoader) setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!token || !role) return;
//     fetchOrders(true);
//   }, [token, role, activeTab]);

//   // Only auto-refresh if there is a pending payment order
//   useEffect(() => {
//     if (!token || !role) return;
//     const hasPendingPayment = orders.some((o) => o.payment_status === "pending_payment");
//     if (!hasPendingPayment) return;

//     const interval = setInterval(() => fetchOrders(false), 5000);
//     return () => clearInterval(interval);
//   }, [token, role, activeTab, orders]);

//   const handleStatusUpdate = async (id, status) => {
//     try {
//       await updateOrderStatus(id, status);
//       fetchOrders(false);
//     } catch (error) {
//       console.error("Update error:", error.response?.data || error.message);
//     }
//   };

//   const handleArchive = async (id) => {
//     const confirmArchive = window.confirm("Archive this order?");
//     if (!confirmArchive) return;

//     try {
//       await archiveOrder(id);
//       setOrders((prev) => prev.filter((order) => order.id !== id));
//     } catch (err) {
//       console.error("Archive error:", err.response?.data || err.message);
//     }
//   };

//   const handleBookAgain = (order) => {
//     navigate(`/book-pickup?shop=${order.shop.id}&service=${order.service.id}&weight=${order.weight}`);
//   };

//   const getStatusConfig = (status) => {
//     switch (status) {
//       case "completed":
//         return { color: "bg-green-100 text-green-700", icon: <CheckCircle2 size={13} /> };
//       case "washing":
//         return { color: "bg-blue-100 text-blue-700", icon: <Droplets size={13} /> };
//       default:
//         return { color: "bg-orange-100 text-orange-700", icon: <Clock size={13} /> };
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-[60vh] flex items-center justify-center">
//         <div className="animate-spin w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full" />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-[80vh] bg-gray-50 py-10 px-4">
//       <div className="max-w-4xl mx-auto">

//         {/* HEADER */}
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h1 className="text-2xl md:text-3xl font-black text-gray-900">
//               {role === "owner" ? "Shop Orders" : "My Orders"}
//             </h1>
//             <p className="text-gray-500 text-sm mt-0.5">
//               {orders.length} {orders.length === 1 ? "order" : "orders"}
//             </p>
//           </div>
//           <div className="hidden sm:flex w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 items-center justify-center shadow-md shadow-blue-100">
//             <Package size={20} className="text-white" />
//           </div>
//         </div>

//         {/* TABS */}
//         <div className="inline-flex bg-white border border-gray-100 rounded-xl p-1 mb-6 shadow-sm">
//           <button
//             onClick={() => setActiveTab("active")}
//             className={`px-5 py-2 rounded-lg text-sm cursor-pointer font-semibold transition ${
//               activeTab === "active"
//                 ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm"
//                 : "text-gray-500 hover:text-gray-700"
//             }`}
//           >
//             Active Orders
//           </button>
//           <button
//             onClick={() => setActiveTab("archived")}
//             className={`px-5 py-2 rounded-lg text-sm cursor-pointer font-semibold transition ${
//               activeTab === "archived"
//                 ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm"
//                 : "text-gray-500 hover:text-gray-700"
//             }`}
//           >
//             Archived
//           </button>
//         </div>

//         {/* EMPTY */}
//         {orders.length === 0 ? (
//           <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center">
//             <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-300 flex items-center justify-center mx-auto mb-4">
//               <Package size={28} />
//             </div>
//             <p className="text-gray-500 font-medium">
//               {activeTab === "archived" ? "No archived orders yet" : "No orders yet"}
//             </p>
//             {activeTab === "active" && role !== "owner" && (
//               <Link
//                 to="/shops"
//                 className="inline-block mt-4 text-sm font-semibold text-blue-600 hover:underline"
//               >
//                 Browse shops →
//               </Link>
//             )}
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {orders.map((order) => {
//               const statusCfg = getStatusConfig(order.status);

//               return (
//                 <div
//                   key={order.id}
//                   className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition p-5"
//                 >

//                   {/* TOP */}
//                   <div className="flex justify-between items-start gap-3">
//                     <div>
//                       <h3 className="font-bold text-lg text-gray-900">{order.service?.name}</h3>
//                       <Link to="/shop/:id" className="text-sm underline text-gray-500 mt-0.5">{order.shop?.name}</Link>
//                     </div>
//                     <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${statusCfg.color}`}>
//                       {statusCfg.icon}
//                       {order.status}
//                     </span>
//                   </div>

//                   {/* DETAILS */}
//                   <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-50 text-sm">
//                     <div>
//                       <p className="text-gray-400 text-xs">Weight</p>
//                       <p className="font-bold text-gray-800 mt-0.5">{order.weight} kg</p>
//                     </div>
//                     <div>
//                       <p className="text-gray-400 text-xs">Total</p>
//                       <p className="font-bold text-blue-600 mt-0.5">KES {order.total_price}</p>
//                     </div>
//                   </div>

//                   {/* PAYMENT SECTION — CUSTOMER ONLY */}
//                   {role === "customer" && activeTab === "active" && (
//                     <div className="mt-4 pt-4 border-t border-gray-50">

//                       <div className="flex items-center justify-between mb-3">
//                         <span className="text-sm text-gray-500 flex items-center gap-1.5">
//                           <CreditCard size={14} />
//                           Payment
//                         </span>
//                         <span className={
//                           order.payment_status === "paid"
//                             ? "text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700"
//                             : order.payment_status === "pending_payment"
//                             ? "text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700"
//                             : order.payment_status === "failed"
//                             ? "text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700"
//                             : "text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600"
//                         }>
//                           {order.payment_status === "paid" && "Paid"}
//                           {order.payment_status === "pending_payment" && "Pending"}
//                           {order.payment_status === "failed" && "Failed"}
//                           {order.payment_status === "unpaid" && "Unpaid"}
//                         </span>
//                       </div>

//                       {order.payment_status === "paid" && order.mpesa_transaction_code && (
//                         <p className="text-xs text-green-600 mb-3 bg-green-50 rounded-lg px-3 py-2">
//                           M-Pesa Code: <strong>{order.mpesa_transaction_code}</strong>
//                         </p>
//                       )}

//                       {(order.payment_status === "unpaid" || order.payment_status === "failed") && (
//                         <button
//                           onClick={() => handlePay(order.id)}
//                           disabled={payingOrderId === order.id || pollingOrderId === order.id}
//                           className="w-full cursor-pointer bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white text-sm font-bold py-3 rounded-xl transition disabled:opacity-50 shadow-sm shadow-green-100"
//                         >
//                           {payingOrderId === order.id
//                             ? "Sending prompt..."
//                             : pollingOrderId === order.id
//                             ? "Waiting for payment..."
//                             : "Pay with M-Pesa"}
//                         </button>
//                       )}

//                       {paymentMessage && (
//                         <p className="text-xs text-gray-500 mt-2.5 text-center">{paymentMessage}</p>
//                       )}

//                     </div>
//                   )}

//                   {/* OWNER INFO */}
//                   {role === "owner" && (
//                     <div className="mt-4 pt-4 border-t border-gray-50">
//                       <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5">
//                         <p className="text-gray-700">
//                           <span className="font-semibold text-gray-900">Customer:</span> {order.user?.username}
//                         </p>
//                         <p className="text-gray-700">
//                           <span className="font-semibold text-gray-900">Phone:</span> {order.customer_phone || "N/A"}
//                         </p>
//                         <p className="text-gray-700">
//                           <span className="font-semibold text-gray-900">Location:</span> {order.customer_location || "N/A"}
//                         </p>

//                         <div className="flex gap-4 pt-2">
//                           {order.customer_phone && (
//                             <a
//                               href={`tel:${order.customer_phone}`}
//                               className="flex items-center gap-1.5 text-blue-600 text-xs font-semibold hover:underline"
//                             >
//                               <Phone size={12} />
//                               Call
//                             </a>
//                           )}
//                           {order.customer_location && (
//                             <a
//                               href={`https://www.google.com/maps/search/?api=1&query=${order.customer_location}`}
//                               target="_blank"
//                               rel="noreferrer"
//                               className="flex items-center gap-1.5 text-green-600 text-xs font-semibold hover:underline"
//                             >
//                               <MapPin size={12} />
//                               Map
//                             </a>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {/* OWNER ACTIONS */}
//                   {role === "owner" && activeTab !== "archived" && (
//                     <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-50">
//                       {["pending", "washing", "completed"].map((s) => (
//                         <button
//                           key={s}
//                           onClick={() => handleStatusUpdate(order.id, s)}
//                           className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg text-white capitalize transition ${
//                             order.status === s ? "ring-2 ring-offset-1 ring-blue-300" : ""
//                           } ${
//                             s === "pending"
//                               ? "bg-gray-500 hover:bg-gray-600"
//                               : s === "washing"
//                               ? "bg-blue-500 hover:bg-blue-600"
//                               : "bg-green-600 hover:bg-green-700"
//                           }`}
//                         >
//                           {s}
//                         </button>
//                       ))}

//                       {order.status === "completed" && !order.owner_archived && (
//                         <button
//                           onClick={() => handleArchive(order.id)}
//                           className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gray-800 text-white flex items-center gap-1.5 hover:bg-gray-900 transition ml-auto"
//                         >
//                           <Archive size={12} />
//                           Archive
//                         </button>
//                       )}
//                     </div>
//                   )}

//                   {/* CUSTOMER ARCHIVE */}
//                   {role === "customer" &&
//                     activeTab !== "archived" &&
//                     order.status === "completed" &&
//                     !order.customer_archived && (
//                       <div className="mt-4 pt-4 border-t border-gray-50">
//                         <button
//                           onClick={() => handleArchive(order.id)}
//                           className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-gray-800 hover:bg-gray-900 text-white flex items-center gap-2 transition"
//                         >
//                           <Archive size={14} />
//                           Archive Order
//                         </button>
//                       </div>
//                     )}

//                   {/* BOOK AGAIN */}
//                   {role === "customer" && activeTab === "archived" && (
//                     <div className="mt-4 pt-4 border-t border-gray-50">
//                       <button
//                         onClick={() => handleBookAgain(order)}
//                         className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white flex items-center gap-2 transition"
//                       >
//                         <RotateCcw size={14} />
//                         Book Again
//                       </button>
//                     </div>
//                   )}

//                   {/* FOOTER */}
//                   <div className="mt-4 text-xs text-gray-300 font-medium">
//                     Order #{order.id}
//                   </div>

//                 </div>
//               );
//             })}
//           </div>
//         )}

//       </div>
//     </div>
//   );
// }

// export default Orders;

