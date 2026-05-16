import React, { useState, useEffect, useContext } from "react";
import {
  createShop,
  getShops,
  createService,
  getOwnerOrders,
  deleteShop,
} from "../api";

import { Link, useNavigate } from "react-router-dom";

import {
  Home,
  ShoppingCart,
  Store,
  PlusCircle,
  Trash2,
  Edit2,
  Users,
  Tag,
  LogOut,
  Image as ImageIcon,
  Menu,X,
} from "lucide-react";

import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();

  const { logoutUser, token, user } = useContext(AuthContext);

  const role = user?.role;

  const [shops, setShops] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [shopForm, setShopForm] = useState({
    name: "",
    location: "",
    description: "",
    image: null,
  });

  const [serviceForm, setServiceForm] = useState({
    shop: "",
    name: "",
    price_per_kg: "",
  });

  const [shopMessage, setShopMessage] = useState("");
  const [serviceMessage, setServiceMessage] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // =========================
  // AUTH + FETCH
  // =========================
  useEffect(() => {
    if (token === undefined) return;

    if (!token) {
      navigate("/login");
      return;
    }

    if (role !== "owner") {
      navigate("/shops");
      return;
    }

    fetchAll();
  }, [token, role]);

  // =========================
  // FETCH EVERYTHING
  // =========================
  const fetchAll = async () => {
    try {
      setLoading(true);

      await Promise.all([
        fetchShops(),
        fetchOrders(),
      ]);

    } catch (error) {
      console.error("Dashboard fetch error:", error);

    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FETCH SHOPS
  // =========================
  const fetchShops = async () => {
    try {
      const data = await getShops();

      // only owner shops
      const ownerShops = data.filter(
        (shop) => shop.owner === user?.username
      );

      setShops(ownerShops);

    } catch (error) {
      console.error("Fetch shops error:", error);
    }
  };

  // =========================
  // FETCH ORDERS
  // =========================
  const fetchOrders = async () => {
    try {
      const data = await getOwnerOrders();
      setOrders(data);

    } catch (error) {
      console.error("Fetch orders error:", error);
    }
  };

  // =========================
  // DELETE SHOP
  // =========================
  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
      "Delete this shop?"
    );

    if (!confirmDelete) return;

    try {
      await deleteShop(id);

      setShops(
        shops.filter((shop) => shop.id !== id)
      );

    } catch (error) {
      console.error("Delete shop error:", error);
      alert("Failed to delete shop");
    }
  };

  // =========================
  // CREATE SHOP
  // =========================
  const handleShopSubmit = async (e) => {
    e.preventDefault();

    setShopMessage("");

    try {
      const formData = new FormData();

      formData.append("name", shopForm.name);
      formData.append("location", shopForm.location);
      formData.append("description", shopForm.description);

      // IMPORTANT FOR CLOUDINARY
      if (shopForm.image instanceof File) {
        formData.append("image", shopForm.image);
      }

      await createShop(formData);

      setShopMessage("Shop created successfully!");

      setShopForm({
        name: "",
        location: "",
        description: "",
        image: null,
      });

      // clear file input
      document.getElementById("shop-image-input").value = "";

      fetchShops();

    } catch (error) {
      console.error("Create shop error:", error);

      if (error.response?.data) {
        console.log(error.response.data);
      }

      setShopMessage("Failed to create shop");
    }
  };

  // =========================
  // CREATE SERVICE
  // =========================
  const handleServiceSubmit = async (e) => {
    e.preventDefault();

    setServiceMessage("");

    if (!serviceForm.shop) {
      setServiceMessage("Please select a shop");
      return;
    }

    try {
      await createService(serviceForm);

      setServiceMessage("Service added successfully!");

      setServiceForm({
        shop: "",
        name: "",
        price_per_kg: "",
      });

    } catch (error) {
      console.error("Create service error:", error);
      setServiceMessage("Failed to create service");
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  // =========================
  // LOADING
  // =========================
  if (!token || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">

      {/* SIDEBAR */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-72 bg-blue-600 text-white p-6 shadow-xl z-40 overflow-y-auto">

        {/* BRAND */}
        <div className="flex items-center gap-3 mb-8">

          <div className="bg-white/10 p-3 rounded-xl">
            <Store size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              DRYME
            </h1>

            <p className="text-sm text-white/80">
              Owner Dashboard
            </p>
          </div>

        </div>

        {/* NAVIGATION */}
        <nav className="flex-1">

          <ul className="space-y-2">

            <li>
              <Link
                to="/dashboard"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition"
              >
                <Home size={18} />
                Dashboard
              </Link>
            </li>

            <li>
              <Link
                to="/orders"
                className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-white/10 transition"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart size={18} />
                  Orders
                </div>

                <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                  {orders.length}
                </span>
              </Link>
            </li>

            <li>
              <Link
                to="/shops"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition"
              >
                <Store size={18} />
                Shops
              </Link>
            </li>

            <li>
              <Link
                to="/services"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition"
              >
                <Tag size={18} />
                Services
              </Link>
            </li>

          </ul>

        </nav>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="mt-6 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg transition"
        >
          <LogOut size={18} />
          Logout
        </button>

      </aside>

      {/* MAIN */}
      <main className="flex-1 md:ml-72 pt-20 md:pt-0">

        {/* MOBILE TOPBAR */}
<div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white flex items-center justify-between px-4 py-3 shadow-lg">
  <div className="flex items-center gap-2">
    <Store size={22} />
    <h1 className="font-bold text-lg">DRYME</h1>
  </div>

  <button
    onClick={() => setSidebarOpen(true)}
    className="p-2 rounded-lg hover:bg-white/10"
  >
    <Menu size={24} />
  </button>
</div>

{/* MOBILE OVERLAY */}
{sidebarOpen && (
  <div
    onClick={() => setSidebarOpen(false)}
    className="fixed inset-0 bg-black/50 z-40 md:hidden"
  />
)}

{/* SIDEBAR */}
<aside
  className={`
    fixed inset-y-0 left-0 z-50 w-72 bg-blue-600 text-white
    transform transition-transform duration-300 overflow-y-auto

    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}

    md:translate-x-0 md:flex
  `}
>
  <div className="p-6 flex flex-col min-h-screen">

    {/* MOBILE CLOSE */}
    <div className="md:hidden flex justify-end mb-4">
      <button
        onClick={() => setSidebarOpen(false)}
        className="p-2 rounded-lg hover:bg-white/10"
      >
        <X size={24} />
      </button>
    </div>

    {/* BRAND */}
    <div className="flex items-center gap-3 mb-8">
      <div className="bg-white/10 p-2 rounded">
        <Store size={22} />
      </div>

      <div>
        <h2 className="text-2xl font-bold">
          DRYME
        </h2>

        <p className="text-sm text-white/80">
          Admin Dashboard
        </p>
      </div>
    </div>

    {/* NAVIGATION */}
    <nav className="flex-1">
      <ul className="space-y-2">

        <li>
          <Link
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition"
          >
            <Home size={18} />
            Dashboard
          </Link>
        </li>

        <li>
          <Link
            to="/orders"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-white/10 transition"
          >
            <div className="flex items-center gap-3">
              <ShoppingCart size={18} />
              Orders
            </div>

            <span className="bg-white/10 px-2 py-1 rounded-full text-xs">
              {orders.length}
            </span>
          </Link>
        </li>

        <li>
          <Link
            to="/shops"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition"
          >
            <Store size={18} />
            Shops
          </Link>
        </li>

        <li>
          <Link
            to="/services"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition"
          >
            <Tag size={18} />
            Services
          </Link>
        </li>

      </ul>
    </nav>

    {/* LOGOUT */}
    {/* <button
      onClick={handleLogout}
      className="mt-3 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg transition"
    >
      <LogOut size={18} />
      Logout
    </button> */}

  </div>
</aside>



<button
  onClick={handleLogout}
  className="md:hidden fixed bottom-5 right-5 bg-red-600 text-white p-3 rounded-full shadow-lg"
>
  <LogOut size={18} />
</button>
        {/* HEADER */}
        <div className="my-8 ml-4">

          <h1 className="text-3xl font-extrabold text-gray-800">
            Welcome {user?.username}
          </h1>

          <p className="text-gray-500 mt-1">
            Manage your laundry business
          </p>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-4">

              <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                <Store size={22} />
              </div>

              <div>
                <p className="text-gray-500 text-sm">
                  My Shops
                </p>

                <h2 className="text-2xl font-bold">
                  {shops.length}
                </h2>
              </div>

            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-4">

              <div className="bg-green-100 p-3 rounded-xl text-green-600">
                <ShoppingCart size={22} />
              </div>

              <div>
                <p className="text-gray-500 text-sm">
                  Orders
                </p>

                <h2 className="text-2xl font-bold">
                  {orders.length}
                </h2>
              </div>

            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-4">

              <div className="bg-yellow-100 p-3 rounded-xl text-yellow-600">
                <Users size={22} />
              </div>

              <div>
                <p className="text-gray-500 text-sm">
                  Owner
                </p>

                <h2 className="text-2xl font-bold">
                  You
                </h2>
              </div>

            </div>
          </div>

        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* SHOPS */}
          <section className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-xl font-bold text-gray-800">
                My Shops
              </h2>

              <span className="text-sm text-gray-500">
                {shops.length} shops
              </span>

            </div>

            {shops.length === 0 ? (

              <div className="text-center py-10 text-gray-500">
                No shops created yet
              </div>

            ) : (

              <div className="space-y-5">

                {shops.map((shop) => (

                  <div
                    key={shop.id}
                    className="border rounded-2xl overflow-hidden hover:shadow-md transition"
                  >

                    {/* SHOP IMAGE */}
                    <div className="h-52 bg-gray-100 overflow-hidden">

                      {shop.image ? (

                        <img
                          src={shop.image}
                          alt={shop.name}
                          className="w-full h-full object-cover"
                        />

                      ) : (

                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                          <ImageIcon size={40} />
                          <p className="text-sm mt-2">
                            No Image
                          </p>
                        </div>

                      )}

                    </div>

                    {/* SHOP INFO */}
                    <div className="p-5">

                      <div className="flex items-start justify-between gap-4">

                        <div>
                          <h3 className="font-bold text-lg text-gray-800">
                            {shop.name}
                          </h3>

                          <p className="text-sm text-gray-500 mt-1">
                            {shop.location}
                          </p>
                        </div>

                        <div className="flex gap-2">

                          <button
                            onClick={() =>
                              navigate(`/edit-shop/${shop.id}`)
                            }
                            className="flex items-center gap-1 border px-3 py-2 rounded-lg text-sm hover:bg-gray-50"
                          >
                            <Edit2 size={14} />
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(shop.id)
                            }
                            className="flex items-center gap-1 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>

                        </div>

                      </div>

                      <p className="text-gray-600 text-sm mt-3">
                        {shop.description}
                      </p>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </section>

          {/* ADD SHOP */}
          <aside className="bg-white rounded-2xl shadow-sm p-6 h-fit">

            <div className="flex items-center justify-between mb-5">

              <h2 className="text-xl font-bold text-gray-800">
                Add Shop
              </h2>

              <PlusCircle className="text-blue-600" size={22} />

            </div>

            <form
              onSubmit={handleShopSubmit}
              className="space-y-4"
            >

              <input
                type="text"
                placeholder="Shop Name"
                required
                value={shopForm.name}
                onChange={(e) =>
                  setShopForm({
                    ...shopForm,
                    name: e.target.value,
                  })
                }
                className="w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
              />

              <input
                type="text"
                placeholder="Location"
                required
                value={shopForm.location}
                onChange={(e) =>
                  setShopForm({
                    ...shopForm,
                    location: e.target.value,
                  })
                }
                className="w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
              />

              <textarea
                rows={4}
                placeholder="Description"
                required
                value={shopForm.description}
                onChange={(e) =>
                  setShopForm({
                    ...shopForm,
                    description: e.target.value,
                  })
                }
                className="w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
              />

              {/* FILE INPUT */}
              <div>

                <label className="block text-sm text-gray-600 mb-2">
                  Shop Image
                </label>

                <input
                  id="shop-image-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setShopForm({
                      ...shopForm,
                      image: e.target.files[0],
                    })
                  }
                  className="w-full text-sm"
                />

              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition"
              >
                Create Shop
              </button>

            </form>

            {shopMessage && (
              <p className="mt-4 text-sm text-center text-green-600">
                {shopMessage}
              </p>
            )}

          </aside>

        </div>

        {/* SERVICES */}
        <section className="bg-white rounded-2xl shadow-sm p-6 mt-6">

          <div className="flex items-center justify-between mb-5">

            <h2 className="text-xl font-bold text-gray-800">
              Add Service
            </h2>

            <Tag className="text-blue-600" size={22} />

          </div>

          <form
            onSubmit={handleServiceSubmit}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >

            {/* SHOP */}
            <select
              value={serviceForm.shop}
              onChange={(e) =>
                setServiceForm({
                  ...serviceForm,
                  shop: e.target.value,
                })
              }
              className="border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">
                Select Shop
              </option>

              {shops.map((shop) => (
                <option
                  key={shop.id}
                  value={shop.id}
                >
                  {shop.name}
                </option>
              ))}

            </select>

            {/* SERVICE NAME */}
            <input
              type="text"
              placeholder="Service Name"
              value={serviceForm.name}
              onChange={(e) =>
                setServiceForm({
                  ...serviceForm,
                  name: e.target.value,
                })
              }
              className="border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
            />

            {/* PRICE */}
            <input
              type="number"
              placeholder="Price per kg"
              value={serviceForm.price_per_kg}
              onChange={(e) =>
                setServiceForm({
                  ...serviceForm,
                  price_per_kg: e.target.value,
                })
              }
              className="border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
            />

            {/* BUTTON */}
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition"
            >
              Add Service
            </button>

          </form>

          {serviceMessage && (
            <p className="mt-4 text-sm text-green-600">
              {serviceMessage}
            </p>
          )}

        </section>

      </main>

    </div>
  );
};

export default Dashboard;




// import React, { useState, useEffect, useContext } from "react";
// import {
//   createShop,
//   getShops,
//   createService,
//   getOwnerOrders,
//   deleteShop,
// } from "../api";

// import { Link, useNavigate } from "react-router-dom";

// import {
//   Home,
//   ShoppingCart,
//   Store,
//   PlusCircle,
//   Trash2,
//   Edit2,
//   Users,
//   Tag,
//   LogOut,
// } from "lucide-react";

// import { AuthContext } from "../context/AuthContext";

// const Dashboard = () => {
//   const navigate = useNavigate();

//   // ✅ USE CONTEXT INSTEAD OF DIRECT localStorage
//   const { logoutUser, token, user } = useContext(AuthContext);

//   const role = user?.role;

//   const [shops, setShops] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [shopForm, setShopForm] = useState({
//     name: "",
//     location: "",
//     description: "",
//     image: null,
//   });

//   const [serviceForm, setServiceForm] = useState({
//     shop: "",
//     name: "",
//     price_per_kg: "",
//   });

//   const [shopMessage, setShopMessage] = useState("");
//   const [serviceMessage, setServiceMessage] = useState("");

//   // =========================
//   // ✅ AUTH + FETCH CONTROL
//   // =========================
//   useEffect(() => {

//     // Wait until auth context fully loads
//     if (token === undefined) return;

//     // Not logged in
//     if (!token) {
//       navigate("/login");
//       return;
//     }

//     // Wrong role
//     if (role !== "owner") {
//       navigate("/shops");
//       return;
//     }

//     // Safe to fetch protected data
//     fetchAll();

//   }, [token, role]);

//   // =========================
//   // FETCH EVERYTHING
//   // =========================
//   const fetchAll = async () => {
//     try {
//       setLoading(true);

//       await Promise.all([
//         fetchShops(),
//         fetchOrders(),
//       ]);

//     } catch (error) {
//       console.error("Dashboard fetch error:", error);

//     } finally {
//       setLoading(false);
//     }
//   };

//   // =========================
//   // FETCH SHOPS
//   // =========================
//   const fetchShops = async () => {
//     try {
//       const data = await getShops();
//       setShops(data);

//     } catch (error) {
//       console.error("Fetch shops error:", error);
//     }
//   };

//   // =========================
//   // FETCH ORDERS
//   // =========================
//   const fetchOrders = async () => {
//     try {
//       const data = await getOwnerOrders();
//       setOrders(data);

//     } catch (error) {
//       console.error("Fetch orders error:", error);
//     }
//   };

//   // =========================
//   // DELETE SHOP
//   // =========================
//   const handleDelete = async (id) => {

//     if (!window.confirm("Delete this shop?")) return;

//     try {
//       await deleteShop(id);

//       setShops(
//         shops.filter((s) => s.id !== id)
//       );

//     } catch (error) {
//       console.error("Delete shop error:", error);
//     }
//   };

//   // =========================
//   // CREATE SHOP
//   // =========================
//   const handleShopSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const formData = new FormData();

//       formData.append("name", shopForm.name);
//       formData.append("location", shopForm.location);
//       formData.append("description", shopForm.description);

//       if (shopForm.image) {
//         formData.append("image", shopForm.image);
//       }

//       await createShop(formData);

//       setShopMessage("Shop created!");

//       setShopForm({
//         name: "",
//         location: "",
//         description: "",
//         image: null,
//       });

//       fetchShops();

//     } catch (error) {
//       console.error("Create shop error:", error);
//       setShopMessage("Failed to create shop");
//     }
//   };

//   // =========================
//   // LOGOUT
//   // =========================
//   const handleLogout = () => {
//     logoutUser();
//     navigate("/login");
//   };

//   // =========================
//   // CREATE SERVICE
//   // =========================
//   const handleServiceSubmit = async (e) => {
//     e.preventDefault();

//     if (!serviceForm.shop) {
//       setServiceMessage("Select a shop");
//       return;
//     }

//     try {
//       await createService(serviceForm);

//       setServiceMessage("Service added!");

//       setServiceForm({
//         shop: "",
//         name: "",
//         price_per_kg: "",
//       });

//     } catch (error) {
//       console.error("Create service error:", error);
//       setServiceMessage("Failed to create service");
//     }
//   };

//   // =========================
//   // LOADING STATE
//   // =========================
//   if (!token || loading) {
//     return (
//       <div className="p-10 text-center">
//         Loading...
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-200 text-gray-800 flex">
//       {/* SIDEBAR - fixed, full height, blue */}
//       <aside
//         className="hidden md:flex flex-col fixed inset-y-0 left-0 w-72 bg-blue-600 text-white p-6 pt-8 pb-6 shadow-xl z-40 overflow-y-auto"
//         aria-label="Sidebar"
//       >
//         {/* Brand */}
//         <div className="flex items-center gap-3 mb-6 mt-2 px-1">
//           <div className="bg-white/10 p-2 rounded">
//             <Store size={22} />
//           </div>
//           <div className="min-w-0">
//             <div className="text-2xl font-bold tracking-tight leading-tight">
//               DRYME
//             </div>
//             <div className="text-xs text-white/90"> Admin Dashboard</div>
//           </div>
//         </div>

//         {/* Sidebar items */}
//         <nav className="flex-1 mt-2">
//           <ul className="space-y-2">
//             <li>
//               <Link
//                 to="/dashboard"
//                 className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/10 transition"
//               >
//                 <Home size={16} />
//                 <span className="text-sm">Dashboard</span>
//               </Link>
//             </li>

//             <li>
//               <Link
//                 to="/orders"
//                 className="flex items-center justify-between gap-3 px-3 py-2 rounded-md hover:bg-white/10 transition"
//               >
//                 <div className="flex items-center gap-3">
//                   <ShoppingCart size={16} />
//                   <span className="text-sm">Orders</span>
//                 </div>
//                 <div className="bg-white/10 text-xs px-2 py-0.5 rounded-full">
//                   {orders.length}
//                 </div>
//               </Link>
//             </li>

//             <li>
//               <Link
//                 to="/shops"
//                 className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/10 transition"
//               >
//                 <Store size={16} />
//                 <span className="text-sm">View Shops</span>
//               </Link>
//             </li>

//             <li>
//               <Link
//                 to="/services"
//                 className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/10 transition"
//               >
//                 <Tag size={16} />
//                 <span className="text-sm">Services</span>
//               </Link>
//             </li>

//             <li>
//               <Link
//                 onClick={handleLogout}
//                 // aria-label="Logout"
//                 className="flex items-center gap-3 w-full text-left px-3 py-2 mt-6 rounded-md bg-red-700 hover:bg-red-600 text-white transition-shadow shadow-sm "
//               >
//                 <LogOut size={16} />
//                 <span className="text-sm font-medium">Logout</span>
//               </Link>
//             </li>
//           </ul>
//         </nav>

//         {/* Tip */}
//         <div className="mt-auto text-xs text-white/90 px-1">
//           <div className="font-medium mb-1">Tip</div>
//           <div>Keep your services updated to reflect current pricing.</div>
//         </div>
//       </aside>

//       {/* MAIN CONTENT */}
//       <main className="flex-1 md:ml-72">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
//           <h1 className="text-2xl mb-4 font-extrabold text-gray-800">
//             Welcome {user?.username}!
//           </h1>

//           <div className="space-y-6">
//             {/* Header / Stats */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
//                 <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
//                   <ShoppingCart size={20} />
//                 </div>
//                 <div>
//                   <div className="text-sm text-gray-500">Open Orders</div>
//                   <div className="text-2xl font-semibold">{orders.length}</div>
//                 </div>
//               </div>

//               <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
//                 <div className="bg-green-50 text-green-600 p-3 rounded-lg">
//                   <Store size={20} />
//                 </div>
//                 <div>
//                   <div className="text-sm text-gray-500">My Shops</div>
//                   <div className="text-2xl font-semibold">{shops.length}</div>
//                 </div>
//               </div>

//               <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4 justify-between">
//                 <div className="flex items-center gap-4">
//                   <div className="bg-yellow-50 text-yellow-600 p-3 rounded-lg">
//                     <Users size={20} />
//                   </div>
//                   <div>
//                     <div className="text-sm text-gray-500">Active Owners</div>
//                     <div className="text-2xl font-semibold">You</div>
//                   </div>
//                 </div>

//                 <button
//                   onClick={() => navigate("/orders")}
//                   className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-3 py-2 rounded-md flex items-center gap-2"
//                 >
//                   <ShoppingCart size={14} />
//                   View Orders
//                   <div className="bg-white/10 text-xs px-2 py-0.5 rounded-full">
//                     {orders.length}
//                   </div>
//                 </button>
//               </div>
//             </div>

//             {/* Shops list + Add Shop column */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//               <section className="lg:col-span-2 bg-white rounded-xl shadow p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <h2 className="text-lg font-semibold text-gray-800">
//                     My Shops
//                   </h2>
//                   <div className="text-sm text-gray-500">
//                     {shops.length} total
//                   </div>
//                 </div>

//                 {shops.length === 0 ? (
//                   <div className="text-sm text-gray-500">
//                     You have no shops yet. Add one using the form.
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     {shops.map((shop) => (
//                       <div
//                         key={shop.id}
//                         className="flex items-start gap-4 border rounded-lg p-4 hover:shadow-sm transition"
//                       >
//                         <div className="w-16 h-18 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-lg font-semibold">
//                           {shop.name?.charAt(0) || "S"}
//                         </div>

//                         <div className="flex-1">
//                           <div className="flex items-start justify-between gap-4">
//                             <div>
//                               {/* <div><img
//                   src={
//                     shop.image
//                       ? shop.image
//                       : "https://via.placeholder.com/600x400?text=No+Image"
//                   }
//                   alt={shop.name}
//                   className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
//                 /></div> */}
//                               <div className="font-semibold text-gray-800">
//                                 {shop.name}
//                               </div>
//                               <div className="text-sm text-gray-500">
//                                 {shop.location}
//                               </div>
//                             </div>

//                             <div className="flex items-center gap-2">
//                               <button
//                                 onClick={() =>
//                                   navigate(`/edit-shop/${shop.id}`)
//                                 }
//                                 className="flex items-center cursor-pointer gap-2 text-sm px-3 py-1 rounded-md border border-gray-200 hover:bg-gray-50"
//                               >
//                                 <Edit2 size={14} />
//                                 Edit
//                               </button>

//                               <button
//                                 onClick={() => handleDelete(shop.id)}
//                                 className="flex items-center cursor-pointer gap-2 text-sm px-3 py-1 rounded-md border border-red-100 text-red-600 hover:bg-red-50"
//                               >
//                                 <Trash2 size={14} />
//                                 Delete
//                               </button>
//                             </div>
//                           </div>

//                           <p className="text-sm text-gray-500 mt-2 line-clamp-3">
//                             {shop.description}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </section>

//               {/* Add Shop */}
//               <aside className="bg-white rounded-xl shadow p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-md font-semibold text-gray-800">
//                     Add Shop
//                   </h3>
//                   <div className="text-xs text-gray-500">Quick add</div>
//                 </div>

//                 <form onSubmit={handleShopSubmit} className="space-y-3">
//                   <input
//                     placeholder="Name"
//                     required
//                     value={shopForm.name}
//                     onChange={(e) =>
//                       setShopForm({ ...shopForm, name: e.target.value })
//                     }
//                     className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
//                   />

//                   <input
//                     placeholder="Location"
//                     required
//                     value={shopForm.location}
//                     onChange={(e) =>
//                       setShopForm({ ...shopForm, location: e.target.value })
//                     }
//                     className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
//                   />

//                   <textarea
//                     placeholder="Description"
//                     required
//                     value={shopForm.description}
//                     onChange={(e) =>
//                       setShopForm({ ...shopForm, description: e.target.value })
//                     }
//                     className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
//                     rows={3}
//                   />

//                   <div>
//                     <label className="text-sm text-gray-600 mb-1 block">
//                       Shop image (optional)
//                     </label>
//                     <input
//                       type="file"
//                       onChange={(e) =>
//                         setShopForm({ ...shopForm, image: e.target.files[0] })
//                       }
//                       className="text-sm"
//                     />
//                   </div>

//                   <button className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2">
//                     <PlusCircle size={16} />
//                     Create Shop
//                   </button>
//                 </form>

//                 <p className="text-green-600 text-sm mt-3">{shopMessage}</p>
//               </aside>
//             </div>

//             {/* Add Service */}
//             <section className="bg-white rounded-xl shadow p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-semibold text-gray-800">
//                   Add Service
//                 </h3>
//                 <div className="text-sm text-gray-500">Attach to a shop</div>
//               </div>
//               ServiceS
//               <form
//                 onSubmit={handleServiceSubmit}
//                 className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
//               >
//                 <div className="md:col-span-1">
//                   <label className="text-sm text-gray-600 mb-1 block">
//                     Shop
//                   </label>
//                   <select
//                     value={serviceForm.shop}
//                     onChange={(e) =>
//                       setServiceForm({ ...serviceForm, shop: e.target.value })
//                     }
//                     className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
//                   >
//                     <option value="">Select Shop</option>
//                     {shops.map((shop) => (
//                       <option key={shop.id} value={shop.id}>
//                         {shop.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="md:col-span-1">
//                   <label className="text-sm text-gray-600 mb-1 block">
//                     Service name
//                   </label>
//                   <input
//                     placeholder="Service name"
//                     value={serviceForm.name}
//                     onChange={(e) =>
//                       setServiceForm({ ...serviceForm, name: e.target.value })
//                     }
//                     className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
//                   />
//                 </div>

//                 <div className="md:col-span-1">
//                   <label className="text-sm text-gray-600 mb-1 block">
//                     Price per kg (KES)
//                   </label>
//                   <input
//                     type="number"
//                     placeholder="Price per kg"
//                     value={serviceForm.price_per_kg}
//                     onChange={(e) =>
//                       setServiceForm({
//                         ...serviceForm,
//                         price_per_kg: e.target.value,
//                       })
//                     }
//                     className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
//                   />
//                 </div>

//                 <div className="md:col-span-1">
//                   <button className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2">
//                     <PlusCircle size={16} />
//                     Add Service
//                   </button>
//                 </div>
//               </form>
//               <p className="text-green-600 text-sm mt-3">{serviceMessage}</p>
//             </section>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Dashboard;




// import React, { useState, useEffect, useContext } from "react";
// import {
//   createShop,
//   getShops,
//   createService,
//   getOwnerOrders,
//   updateOrderStatus,
//   deleteShop,
// } from "../api";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   Home,
//   ShoppingCart,
//   Store,
//   PlusCircle,
//   Trash2,
//   Edit2,
//   Users,
//   Tag,
//   LogOut,
// } from "lucide-react";

// import { AuthContext } from "../context/AuthContext";

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const { logoutUser } = useContext(AuthContext);
//   // const role = localStorage.getItem("role");
//   // const token = localStorage.getItem("access");

//   const user = JSON.parse(localStorage.getItem("user"));
//   const role = user?.role;
//   const token = localStorage.getItem("access");

//   const [shops, setShops] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [shopForm, setShopForm] = useState({
//     name: "",
//     location: "",
//     description: "",
//     image: null,
//   });

//   const [serviceForm, setServiceForm] = useState({
//     shop: "",
//     name: "",
//     price_per_kg: "",
//   });

//   const [shopMessage, setShopMessage] = useState("");
//   const [serviceMessage, setServiceMessage] = useState("");

//   // useEffect(() => {
//   //   if (!token || role !== "owner") {
//   //     navigate("/login");
//   //     return;
//   //   }
//   //   fetchAll();
//   // }, []);

//     useEffect(() => {
//       if (!token){
//         navigate("/login");
//         return;
//       }

//       if (role !== "owner") {
//         navigate("/shops");
//         return;
//       }
//       fetchAll();
//     },[token,role]);

//   const fetchAll = async () => {
//     setLoading(true);
//     await Promise.all([fetchShops(), fetchOrders()]);
//     setLoading(false);
//   };

//   const fetchShops = async () => {
//     const data = await getShops();
//     setShops(data);
//   };

//   const fetchOrders = async () => {
//     const data = await getOwnerOrders();
//     setOrders(data);
//   };

//   //  DELETE SHOP
//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this shop?")) return;

//     await deleteShop(id);
//     setShops(shops.filter((s) => s.id !== id));
//   };

//   //  CREATE SHOP
//   const handleShopSubmit = async (e) => {
//     e.preventDefault();

//     const formData = new FormData();
//     formData.append("name", shopForm.name);
//     formData.append("location", shopForm.location);
//     formData.append("description", shopForm.description);
//     if (shopForm.image) formData.append("image", shopForm.image);

//     await createShop(formData);

//     setShopMessage("Shop created!");
//     setShopForm({ name: "", location: "", description: "", image: null });
//     fetchShops();
//   };

//   // Logout
//   const handleLogout = () => {
//     logoutUser();
//     navigate("/login");
//   };

//   //  CREATE SERVICE
//   const handleServiceSubmit = async (e) => {
//     e.preventDefault();

//     if (!serviceForm.shop) {
//       setServiceMessage("Select a shop");
//       return;
//     }

//     await createService(serviceForm);

//     setServiceMessage("Service added!");
//     setServiceForm({ shop: "", name: "", price_per_kg: "" });
//   };

//   if (loading) return <div className="p-10 text-center">Loading...</div>;

//   return (
//     <div className="min-h-screen bg-gray-200 text-gray-800 flex">
//       {/* SIDEBAR - fixed, full height, blue */}
//       <aside
//         className="hidden md:flex flex-col fixed inset-y-0 left-0 w-72 bg-blue-600 text-white p-6 pt-8 pb-6 shadow-xl z-40 overflow-y-auto"
//         aria-label="Sidebar"
//       >
//         {/* Brand */}
//         <div className="flex items-center gap-3 mb-6 mt-2 px-1">
//           <div className="bg-white/10 p-2 rounded">
//             <Store size={22} />
//           </div>
//           <div className="min-w-0">
//             <div className="text-2xl font-bold tracking-tight leading-tight">
//               DRYME
//             </div>
//             <div className="text-xs text-white/90"> Admin Dashboard</div>
//           </div>
//         </div>

//         {/* Sidebar items */}
//         <nav className="flex-1 mt-2">
//           <ul className="space-y-2">
//             <li>
//               <Link
//                 to="/dashboard"
//                 className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/10 transition"
//               >
//                 <Home size={16} />
//                 <span className="text-sm">Dashboard</span>
//               </Link>
//             </li>

//             <li>
//               <Link
//                 to="/orders"
//                 className="flex items-center justify-between gap-3 px-3 py-2 rounded-md hover:bg-white/10 transition"
//               >
//                 <div className="flex items-center gap-3">
//                   <ShoppingCart size={16} />
//                   <span className="text-sm">Orders</span>
//                 </div>
//                 <div className="bg-white/10 text-xs px-2 py-0.5 rounded-full">
//                   {orders.length}
//                 </div>
//               </Link>
//             </li>

//             <li>
//               <Link
//                 to="/shops"
//                 className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/10 transition"
//               >
//                 <Store size={16} />
//                 <span className="text-sm">View Shops</span>
//               </Link>
//             </li>

//             <li>
//               <Link
//                 to="/services"
//                 className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/10 transition"
//               >
//                 <Tag size={16} />
//                 <span className="text-sm">Services</span>
//               </Link>
//             </li>

//             <li>
//               <Link
//                 onClick={handleLogout}
//                 // aria-label="Logout"
//                 className="flex items-center gap-3 w-full text-left px-3 py-2 mt-6 rounded-md bg-red-700 hover:bg-red-600 text-white transition-shadow shadow-sm "
//               >
//                 <LogOut size={16} />
//                 <span className="text-sm font-medium">Logout</span>
//               </Link>
//             </li>
//           </ul>
//         </nav>

//         {/* Tip */}
//         <div className="mt-auto text-xs text-white/90 px-1">
//           <div className="font-medium mb-1">Tip</div>
//           <div>Keep your services updated to reflect current pricing.</div>
//         </div>
//       </aside>

//       {/* MAIN CONTENT */}
//       <main className="flex-1 md:ml-72">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
//           <h1 className="text-2xl mb-4 font-extrabold text-gray-800">
//             Welcome {user?.username}!
//           </h1>

//           <div className="space-y-6">
//             {/* Header / Stats */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
//                 <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
//                   <ShoppingCart size={20} />
//                 </div>
//                 <div>
//                   <div className="text-sm text-gray-500">Open Orders</div>
//                   <div className="text-2xl font-semibold">{orders.length}</div>
//                 </div>
//               </div>

//               <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
//                 <div className="bg-green-50 text-green-600 p-3 rounded-lg">
//                   <Store size={20} />
//                 </div>
//                 <div>
//                   <div className="text-sm text-gray-500">My Shops</div>
//                   <div className="text-2xl font-semibold">{shops.length}</div>
//                 </div>
//               </div>

//               <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4 justify-between">
//                 <div className="flex items-center gap-4">
//                   <div className="bg-yellow-50 text-yellow-600 p-3 rounded-lg">
//                     <Users size={20} />
//                   </div>
//                   <div>
//                     <div className="text-sm text-gray-500">Active Owners</div>
//                     <div className="text-2xl font-semibold">You</div>
//                   </div>
//                 </div>

//                 <button
//                   onClick={() => navigate("/orders")}
//                   className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-3 py-2 rounded-md flex items-center gap-2"
//                 >
//                   <ShoppingCart size={14} />
//                   View Orders
//                   <div className="bg-white/10 text-xs px-2 py-0.5 rounded-full">
//                     {orders.length}
//                   </div>
//                 </button>
//               </div>
//             </div>

//             {/* Shops list + Add Shop column */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//               <section className="lg:col-span-2 bg-white rounded-xl shadow p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <h2 className="text-lg font-semibold text-gray-800">
//                     My Shops
//                   </h2>
//                   <div className="text-sm text-gray-500">
//                     {shops.length} total
//                   </div>
//                 </div>

//                 {shops.length === 0 ? (
//                   <div className="text-sm text-gray-500">
//                     You have no shops yet. Add one using the form.
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     {shops.map((shop) => (
//                       <div
//                         key={shop.id}
//                         className="flex items-start gap-4 border rounded-lg p-4 hover:shadow-sm transition"
//                       >
//                         <div className="w-16 h-18 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-lg font-semibold">
//                           {shop.name?.charAt(0) || "S"}
//                         </div>

//                         <div className="flex-1">
//                           <div className="flex items-start justify-between gap-4">
//                             <div>
//                               {/* <div><img
//                   src={
//                     shop.image
//                       ? shop.image
//                       : "https://via.placeholder.com/600x400?text=No+Image"
//                   }
//                   alt={shop.name}
//                   className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
//                 /></div> */}
//                               <div className="font-semibold text-gray-800">
//                                 {shop.name}
//                               </div>
//                               <div className="text-sm text-gray-500">
//                                 {shop.location}
//                               </div>
//                             </div>

//                             <div className="flex items-center gap-2">
//                               <button
//                                 onClick={() =>
//                                   navigate(`/edit-shop/${shop.id}`)
//                                 }
//                                 className="flex items-center cursor-pointer gap-2 text-sm px-3 py-1 rounded-md border border-gray-200 hover:bg-gray-50"
//                               >
//                                 <Edit2 size={14} />
//                                 Edit
//                               </button>

//                               <button
//                                 onClick={() => handleDelete(shop.id)}
//                                 className="flex items-center cursor-pointer gap-2 text-sm px-3 py-1 rounded-md border border-red-100 text-red-600 hover:bg-red-50"
//                               >
//                                 <Trash2 size={14} />
//                                 Delete
//                               </button>
//                             </div>
//                           </div>

//                           <p className="text-sm text-gray-500 mt-2 line-clamp-3">
//                             {shop.description}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </section>

//               {/* Add Shop */}
//               <aside className="bg-white rounded-xl shadow p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-md font-semibold text-gray-800">
//                     Add Shop
//                   </h3>
//                   <div className="text-xs text-gray-500">Quick add</div>
//                 </div>

//                 <form onSubmit={handleShopSubmit} className="space-y-3">
//                   <input
//                     placeholder="Name"
//                     required
//                     value={shopForm.name}
//                     onChange={(e) =>
//                       setShopForm({ ...shopForm, name: e.target.value })
//                     }
//                     className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
//                   />

//                   <input
//                     placeholder="Location"
//                     required
//                     value={shopForm.location}
//                     onChange={(e) =>
//                       setShopForm({ ...shopForm, location: e.target.value })
//                     }
//                     className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
//                   />

//                   <textarea
//                     placeholder="Description"
//                     required
//                     value={shopForm.description}
//                     onChange={(e) =>
//                       setShopForm({ ...shopForm, description: e.target.value })
//                     }
//                     className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
//                     rows={3}
//                   />

//                   <div>
//                     <label className="text-sm text-gray-600 mb-1 block">
//                       Shop image (optional)
//                     </label>
//                     <input
//                       type="file"
//                       onChange={(e) =>
//                         setShopForm({ ...shopForm, image: e.target.files[0] })
//                       }
//                       className="text-sm"
//                     />
//                   </div>

//                   <button className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2">
//                     <PlusCircle size={16} />
//                     Create Shop
//                   </button>
//                 </form>

//                 <p className="text-green-600 text-sm mt-3">{shopMessage}</p>
//               </aside>
//             </div>

//             {/* Add Service */}
//             <section className="bg-white rounded-xl shadow p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-semibold text-gray-800">
//                   Add Service
//                 </h3>
//                 <div className="text-sm text-gray-500">Attach to a shop</div>
//               </div>
//               ServiceS
//               <form
//                 onSubmit={handleServiceSubmit}
//                 className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
//               >
//                 <div className="md:col-span-1">
//                   <label className="text-sm text-gray-600 mb-1 block">
//                     Shop
//                   </label>
//                   <select
//                     value={serviceForm.shop}
//                     onChange={(e) =>
//                       setServiceForm({ ...serviceForm, shop: e.target.value })
//                     }
//                     className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
//                   >
//                     <option value="">Select Shop</option>
//                     {shops.map((shop) => (
//                       <option key={shop.id} value={shop.id}>
//                         {shop.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="md:col-span-1">
//                   <label className="text-sm text-gray-600 mb-1 block">
//                     Service name
//                   </label>
//                   <input
//                     placeholder="Service name"
//                     value={serviceForm.name}
//                     onChange={(e) =>
//                       setServiceForm({ ...serviceForm, name: e.target.value })
//                     }
//                     className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
//                   />
//                 </div>

//                 <div className="md:col-span-1">
//                   <label className="text-sm text-gray-600 mb-1 block">
//                     Price per kg (KES)
//                   </label>
//                   <input
//                     type="number"
//                     placeholder="Price per kg"
//                     value={serviceForm.price_per_kg}
//                     onChange={(e) =>
//                       setServiceForm({
//                         ...serviceForm,
//                         price_per_kg: e.target.value,
//                       })
//                     }
//                     className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
//                   />
//                 </div>

//                 <div className="md:col-span-1">
//                   <button className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2">
//                     <PlusCircle size={16} />
//                     Add Service
//                   </button>
//                 </div>
//               </form>
//               <p className="text-green-600 text-sm mt-3">{serviceMessage}</p>
//             </section>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Dashboard;

