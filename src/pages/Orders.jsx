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

    // book again button

    const navigate = useNavigate();

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
  useEffect(() => {

    if (!token || !role) return;

    const interval =
      setInterval(() => {

        fetchOrders(false);

      }, 5000);

    return () =>
      clearInterval(interval);

  }, [
    token,
    role,
    activeTab
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


                {/* FOOTER */}
                <div className="mt-4 text-xs text-gray-400">

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


