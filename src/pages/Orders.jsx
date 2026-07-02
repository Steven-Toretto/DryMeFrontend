import {
  useEffect,
  useState,
  useContext,
} from "react";

import {useNavigate} from "react-router-dom";

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
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaArchive,
} from "react-icons/fa";

import { Link } from "react-router-dom";

import { AuthContext }
from "../context/AuthContext";

function Orders() {

  const { token, user } =
    useContext(AuthContext);

  const role = user?.role;

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [activeTab, setActiveTab] =
    useState("active");

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
    const maxAttempts = 10; // poll for ~30 seconds

    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await checkPaymentStatus(orderId);
        if (res.payment_status === "paid") {
          setPaymentMessage("✅ Payment confirmed! M-Pesa code: " + res.mpesa_transaction_code);
          clearInterval(interval);
          setPollingOrderId(null);
          setPayingOrderId(null);
          fetchOrders();
        } else if (res.payment_status === "failed") {
          setPaymentMessage("❌ Payment failed or cancelled. Click Pay to try again.");
          clearInterval(interval);
          setPollingOrderId(null);
          setPayingOrderId(null);
          fetchOrders();
        } else if (attempts >= maxAttempts) {
          setPaymentMessage("⏳ Payment pending. Check back shortly.");
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
  const fetchOrders = async (
    showLoader = true
  ) => {

    try {

      if (showLoader) {
        setLoading(true);
      }

      let data;

      // =====================
      // ARCHIVED ORDERS
      // =====================
      if (
        activeTab === "archived"
      ) {

        data =
          role === "owner"
            ? await getArchivedOwnerOrders()
            : await getArchivedOrders();

      }

      // =====================
      // ACTIVE ORDERS
      // =====================
      else {

        data =
          role === "owner"
            ? await getOwnerOrders()
            : await getOrders();
      }

      // ✅ Handle paginated response from DRF
      setOrders(data.results ?? data);

    } catch (error) {

      console.error(
        "Fetch failed:",
        error.response?.data ||
        error.message
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

  }, [
    token,
    role,
    activeTab
  ]);

  // =========================
  // AUTO REFRESH
  // =========================
  // Only auto-refresh if there is a pending payment order
  useEffect(() => {

    if (!token || !role) return;

    const hasPendingPayment = orders.some(
      (o) => o.payment_status === "pending_payment"
    );

    if (!hasPendingPayment) return;

    const interval =
      setInterval(() => {

        fetchOrders(false);

      }, 5000);

    return () =>
      clearInterval(interval);

  }, [
    token,
    role,
    activeTab,
    orders
  ]);

  // =========================
  // UPDATE STATUS
  // =========================
  const handleStatusUpdate =
    async (id, status) => {

      try {

        await updateOrderStatus(
          id,
          status
        );

        fetchOrders(false);

      } catch (error) {

        console.error(
          "Update error:",
          error.response?.data ||
          error.message
        );
      }
    };

  // =========================
  // ARCHIVE ORDER
  // =========================
  const handleArchive =
    async (id) => {

      const confirmArchive =
        window.confirm(
          "Archive this order?"
        );

      if (!confirmArchive) return;

      try {

        await archiveOrder(id);

        // remove instantly from UI
        setOrders((prev) =>
          prev.filter(
            (order) =>
              order.id !== id
          )
        );

      } catch (err) {

        console.error(
          "Archive error:",
          err.response?.data ||
          err.message
        );
      }
    };

    // book again btn

    const handleBookAgain = (order) =>{
      navigate(
        `/book-pickup?shop=${order.shop.id}&service=${order.service.id}&weight=${order.weight}`
      );
    };

  // =========================
  // STATUS STYLE
  // =========================
  const getStatusStyle =
    (status) => {

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

        {/* TABS */}
        <div className="flex gap-3 mb-6">

          <button
            onClick={() =>
              setActiveTab(
                "active"
              )
            }
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === "active"
                ? "bg-blue-600 text-white"
                : "bg-white border text-gray-600"
            }`}
          >
            Active Orders
          </button>

          <button
            onClick={() =>
              setActiveTab(
                "archived"
              )
            }
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === "archived"
                ? "bg-blue-600 text-white"
                : "bg-white border text-gray-600"
            }`}
          >
            Archived Orders
          </button>

        </div>

        {/* EMPTY */}
        {orders.length === 0 ? (

          <div className="bg-white rounded-2xl p-10 text-center text-gray-500">

            No orders found

          </div>

        ) : (

          <div className="space-y-5">

            {orders.map((order) => (

              <div
                key={order.id}
                className="bg-white rounded-2xl shadow p-5"
              >

                {/* TOP */}
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

                {/* PAYMENT SECTION — CUSTOMER ONLY */}
                {role === "customer" && activeTab === "active" && (
                  <div className="mt-4 border-t pt-3">

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Payment</span>
                      <span className={
                        order.payment_status === "paid"
                          ? "text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700"
                          : order.payment_status === "pending_payment"
                          ? "text-xs font-semibold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700"
                          : order.payment_status === "failed"
                          ? "text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700"
                          : "text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600"
                      }>
                        {order.payment_status === "paid" && "Paid"}
                        {order.payment_status === "pending_payment" && "Pending"}
                        {order.payment_status === "failed" && "Failed"}
                        {order.payment_status === "unpaid" && "Unpaid"}
                      </span>
                    </div>

                    {order.payment_status === "paid" && order.mpesa_transaction_code && (
                      <p className="text-xs text-green-600 mb-2">
                        M-Pesa Code: <strong>{order.mpesa_transaction_code}</strong>
                      </p>
                    )}

                    {(order.payment_status === "unpaid" || order.payment_status === "failed") && (
                      <button
                        onClick={() => handlePay(order.id)}
                        disabled={payingOrderId === order.id || pollingOrderId === order.id}
                        className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 rounded-lg transition disabled:opacity-50"
                      >
                        {payingOrderId === order.id
                          ? "Sending prompt..."
                          : pollingOrderId === order.id
                          ? "Waiting for payment..."
                          : "Pay with M-Pesa"}
                      </button>
                    )}

                    {paymentMessage && (
                      <p className="text-xs text-gray-600 mt-2 text-center">{paymentMessage}</p>
                    )}

                  </div>
                )}

                {/* OWNER INFO */}
                {role === "owner" && (

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">

                    <p>

                      <strong>
                        Customer:
                      </strong>{" "}

                      {
                        order.user
                          ?.username
                      }

                    </p>

                    <p>

                      <strong>
                        Phone:
                      </strong>{" "}

                      {
                        order.customer_phone ||
                        "N/A"
                      }

                    </p>

                    <p>

                      <strong>
                        Location:
                      </strong>{" "}

                      {
                        order.customer_location ||
                        "N/A"
                      }

                    </p>

                    {/* ACTION LINKS */}
                    <div className="flex gap-3 mt-2">

                      {order.customer_phone && (

                        <a
                          href={`tel:${order.customer_phone}`}
                          className="flex items-center gap-1 text-blue-600 text-xs"
                        >

                          <FaPhoneAlt />

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

                          <FaMapMarkerAlt />

                          Map

                        </a>

                      )}

                    </div>

                  </div>

                )}

                {/* OWNER ACTIONS */}
                {role === "owner" &&
                 activeTab !== "archived" && (

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

                    {/* OWNER ARCHIVE */}
                    {order.status ===
                      "completed" &&
                      !order.owner_archived && (

                      <button
                        onClick={() =>
                          handleArchive(
                            order.id
                          )
                        }
                        className="px-3 py-1 text-xs rounded-md bg-blue-600 text-white flex items-center gap-1"
                      >

                        <FaArchive />

                        Archive

                      </button>

                    )}

                  </div>

                )}

                {/* CUSTOMER ARCHIVE */}
                {role === "customer" &&
                 activeTab !== "archived" &&
                 order.status ===
                   "completed" &&
                 !order.customer_archived && (

                  <div className="mt-4">

                    <button
                      onClick={() =>
                        handleArchive(
                          order.id
                        )
                      }
                      className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white flex items-center gap-2"
                    >

                      <FaArchive />

                      Archive Order

                    </button>

                  </div>

                )}

                {/* BOOK AGAIN */}
{role === "customer" &&
 activeTab === "archived" && (

  <div className="mt-4">

    <button
      onClick={() =>
        handleBookAgain(order)
      }
      className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white"
    >
      Book Again
    </button>

  </div>

)}


                {/* TIMELINE */}
                <div className="mt-4 pt-4 border-t border-gray-50">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Timeline</p>
                  <div className="space-y-1.5">

                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                      <span className="font-medium text-gray-700">Order placed</span>
                      <span className="ml-auto text-gray-400">
                        {new Date(order.created_at).toLocaleString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    {order.washing_at && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        <span className="font-medium text-gray-700">Washing started</span>
                        <span className="ml-auto text-gray-400">
                          {new Date(order.washing_at).toLocaleString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    )}

                    {order.completed_at && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                        <span className="font-medium text-gray-700">Completed</span>
                        <span className="ml-auto text-gray-400">
                          {new Date(order.completed_at).toLocaleString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    )}

                  </div>
                </div>

                {/* FOOTER */}
                <div className="mt-3 text-xs text-gray-300">
                  Order #{order.id}
                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default Orders;

