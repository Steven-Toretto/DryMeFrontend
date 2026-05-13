import React, { useState, useEffect, useContext } from "react";
import {
  createShop,
  getShops,
  createService,
  getOwnerOrders,
  updateOrderStatus,
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
} from "lucide-react";

import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { logoutUser } = useContext(AuthContext);
  // const role = localStorage.getItem("role");
  // const token = localStorage.getItem("access");

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;
  const token = localStorage.getItem("access");

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

  // useEffect(() => {
  //   if (!token || role !== "owner") {
  //     navigate("/login");
  //     return;
  //   }
  //   fetchAll();
  // }, []);

    useEffect(() => {
      if (!token){
        navigate("/login");
        return;
      }

      if (role !== "owner") {
        navigate("/shops");
        return;
      }
      fetchAll();
    },[token,role]);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchShops(), fetchOrders()]);
    setLoading(false);
  };

  const fetchShops = async () => {
    const data = await getShops();
    setShops(data);
  };

  const fetchOrders = async () => {
    const data = await getOwnerOrders();
    setOrders(data);
  };

  //  DELETE SHOP
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this shop?")) return;

    await deleteShop(id);
    setShops(shops.filter((s) => s.id !== id));
  };

  //  CREATE SHOP
  const handleShopSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", shopForm.name);
    formData.append("location", shopForm.location);
    formData.append("description", shopForm.description);
    if (shopForm.image) formData.append("image", shopForm.image);

    await createShop(formData);

    setShopMessage("Shop created!");
    setShopForm({ name: "", location: "", description: "", image: null });
    fetchShops();
  };

  // Logout
  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  //  CREATE SERVICE
  const handleServiceSubmit = async (e) => {
    e.preventDefault();

    if (!serviceForm.shop) {
      setServiceMessage("Select a shop");
      return;
    }

    await createService(serviceForm);

    setServiceMessage("Service added!");
    setServiceForm({ shop: "", name: "", price_per_kg: "" });
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-200 text-gray-800 flex">
      {/* SIDEBAR - fixed, full height, blue */}
      <aside
        className="hidden md:flex flex-col fixed inset-y-0 left-0 w-72 bg-blue-600 text-white p-6 pt-8 pb-6 shadow-xl z-40 overflow-y-auto"
        aria-label="Sidebar"
      >
        {/* Brand */}
        <div className="flex items-center gap-3 mb-6 mt-2 px-1">
          <div className="bg-white/10 p-2 rounded">
            <Store size={22} />
          </div>
          <div className="min-w-0">
            <div className="text-2xl font-bold tracking-tight leading-tight">
              DRYME
            </div>
            <div className="text-xs text-white/90"> Admin Dashboard</div>
          </div>
        </div>

        {/* Sidebar items */}
        <nav className="flex-1 mt-2">
          <ul className="space-y-2">
            <li>
              <Link
                to="/dashboard"
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/10 transition"
              >
                <Home size={16} />
                <span className="text-sm">Dashboard</span>
              </Link>
            </li>

            <li>
              <Link
                to="/orders"
                className="flex items-center justify-between gap-3 px-3 py-2 rounded-md hover:bg-white/10 transition"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart size={16} />
                  <span className="text-sm">Orders</span>
                </div>
                <div className="bg-white/10 text-xs px-2 py-0.5 rounded-full">
                  {orders.length}
                </div>
              </Link>
            </li>

            <li>
              <Link
                to="/shops"
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/10 transition"
              >
                <Store size={16} />
                <span className="text-sm">View Shops</span>
              </Link>
            </li>

            <li>
              <Link
                to="/services"
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/10 transition"
              >
                <Tag size={16} />
                <span className="text-sm">Services</span>
              </Link>
            </li>

            <li>
              <Link
                onClick={handleLogout}
                // aria-label="Logout"
                className="flex items-center gap-3 w-full text-left px-3 py-2 mt-6 rounded-md bg-red-700 hover:bg-red-600 text-white transition-shadow shadow-sm "
              >
                <LogOut size={16} />
                <span className="text-sm font-medium">Logout</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Tip */}
        <div className="mt-auto text-xs text-white/90 px-1">
          <div className="font-medium mb-1">Tip</div>
          <div>Keep your services updated to reflect current pricing.</div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-72">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <h1 className="text-2xl mb-4 font-extrabold text-gray-800">
            Welcome {user?.username}!
          </h1>

          <div className="space-y-6">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
                  <ShoppingCart size={20} />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Open Orders</div>
                  <div className="text-2xl font-semibold">{orders.length}</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
                <div className="bg-green-50 text-green-600 p-3 rounded-lg">
                  <Store size={20} />
                </div>
                <div>
                  <div className="text-sm text-gray-500">My Shops</div>
                  <div className="text-2xl font-semibold">{shops.length}</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4 justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-50 text-yellow-600 p-3 rounded-lg">
                    <Users size={20} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Active Owners</div>
                    <div className="text-2xl font-semibold">You</div>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/orders")}
                  className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-3 py-2 rounded-md flex items-center gap-2"
                >
                  <ShoppingCart size={14} />
                  View Orders
                  <div className="bg-white/10 text-xs px-2 py-0.5 rounded-full">
                    {orders.length}
                  </div>
                </button>
              </div>
            </div>

            {/* Shops list + Add Shop column */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <section className="lg:col-span-2 bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    My Shops
                  </h2>
                  <div className="text-sm text-gray-500">
                    {shops.length} total
                  </div>
                </div>

                {shops.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    You have no shops yet. Add one using the form.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {shops.map((shop) => (
                      <div
                        key={shop.id}
                        className="flex items-start gap-4 border rounded-lg p-4 hover:shadow-sm transition"
                      >
                        <div className="w-16 h-18 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-lg font-semibold">
                          {shop.name?.charAt(0) || "S"}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              {/* <div><img
                  src={
                    shop.image
                      ? shop.image
                      : "https://via.placeholder.com/600x400?text=No+Image"
                  }
                  alt={shop.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                /></div> */}
                              <div className="font-semibold text-gray-800">
                                {shop.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {shop.location}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  navigate(`/edit-shop/${shop.id}`)
                                }
                                className="flex items-center cursor-pointer gap-2 text-sm px-3 py-1 rounded-md border border-gray-200 hover:bg-gray-50"
                              >
                                <Edit2 size={14} />
                                Edit
                              </button>

                              <button
                                onClick={() => handleDelete(shop.id)}
                                className="flex items-center cursor-pointer gap-2 text-sm px-3 py-1 rounded-md border border-red-100 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          </div>

                          <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                            {shop.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Add Shop */}
              <aside className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-semibold text-gray-800">
                    Add Shop
                  </h3>
                  <div className="text-xs text-gray-500">Quick add</div>
                </div>

                <form onSubmit={handleShopSubmit} className="space-y-3">
                  <input
                    placeholder="Name"
                    required
                    value={shopForm.name}
                    onChange={(e) =>
                      setShopForm({ ...shopForm, name: e.target.value })
                    }
                    className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  />

                  <input
                    placeholder="Location"
                    required
                    value={shopForm.location}
                    onChange={(e) =>
                      setShopForm({ ...shopForm, location: e.target.value })
                    }
                    className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  />

                  <textarea
                    placeholder="Description"
                    required
                    value={shopForm.description}
                    onChange={(e) =>
                      setShopForm({ ...shopForm, description: e.target.value })
                    }
                    className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
                    rows={3}
                  />

                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">
                      Shop image (optional)
                    </label>
                    <input
                      type="file"
                      onChange={(e) =>
                        setShopForm({ ...shopForm, image: e.target.files[0] })
                      }
                      className="text-sm"
                    />
                  </div>

                  <button className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2">
                    <PlusCircle size={16} />
                    Create Shop
                  </button>
                </form>

                <p className="text-green-600 text-sm mt-3">{shopMessage}</p>
              </aside>
            </div>

            {/* Add Service */}
            <section className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Add Service
                </h3>
                <div className="text-sm text-gray-500">Attach to a shop</div>
              </div>
              ServiceS
              <form
                onSubmit={handleServiceSubmit}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
              >
                <div className="md:col-span-1">
                  <label className="text-sm text-gray-600 mb-1 block">
                    Shop
                  </label>
                  <select
                    value={serviceForm.shop}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, shop: e.target.value })
                    }
                    className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  >
                    <option value="">Select Shop</option>
                    {shops.map((shop) => (
                      <option key={shop.id} value={shop.id}>
                        {shop.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-1">
                  <label className="text-sm text-gray-600 mb-1 block">
                    Service name
                  </label>
                  <input
                    placeholder="Service name"
                    value={serviceForm.name}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, name: e.target.value })
                    }
                    className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="text-sm text-gray-600 mb-1 block">
                    Price per kg (KES)
                  </label>
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
                    className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-1">
                  <button className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2">
                    <PlusCircle size={16} />
                    Add Service
                  </button>
                </div>
              </form>
              <p className="text-green-600 text-sm mt-3">{serviceMessage}</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

// import React, { useState, useEffect } from "react";
// import {
//   createShop,
//   getShops,
//   createService,
//   getOwnerOrders,
//   updateOrderStatus,
//   deleteShop,
// } from "../api";
// import { Link, useNavigate } from "react-router-dom";
// import { Home, ShoppingCart, Store } from "lucide-react";

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const role = localStorage.getItem("role");
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

//   useEffect(() => {
//     if (!token || role !== "owner") {
//       navigate("/");
//       return;
//     }
//     fetchAll();
//   }, []);

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

//   // 🗑️ DELETE SHOP
//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this shop?")) return;

//     await deleteShop(id);
//     setShops(shops.filter((s) => s.id !== id));
//   };

//   // 🏪 CREATE SHOP
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

//   // 🧺 CREATE SERVICE
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
//     <div className="flex min-h-screen bg-gray-100">

//       {/* SIDEBAR */}
//       <aside className="w-72 bg-blue-900 text-white p-6 hidden md:block">
//         <h2 className="text-xl font-bold mb-6">Dashboard</h2>

//         <nav className="space-y-4 text-sm">
//           <Link to="/dashboard">Dashboard</Link>
//           <Link to="/orders">Orders</Link>
//           <Link to="/shops">View Shops</Link>
//         </nav>
//       </aside>

//       {/* MAIN */}
//       <main className="flex-1 p-6">

//         {/* 🏪 MY SHOPS */}
//         <div className="bg-white p-6 rounded shadow mb-8">
//           <h3 className="font-semibold mb-4">My Shops</h3>

//           {shops.map((shop) => (
//             <div key={shop.id} className="flex justify-between border p-3 mb-2 rounded">
//               <div>
//                 <p className="font-semibold">{shop.name}</p>
//                 <p className="text-sm text-gray-500">{shop.location}</p>
//               </div>

//               <div className="flex gap-2">
//                 <button onClick={() => navigate(`/edit-shop/${shop.id}`)} className="text-blue-600">
//                   Edit
//                 </button>

//                 <button onClick={() => handleDelete(shop.id)} className="text-red-600">
//                   Delete
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* ➕ ADD SHOP */}
//         <div className="bg-white p-6 rounded shadow mb-8">
//           <h3 className="font-semibold mb-4">Add Shop</h3>

//           <form onSubmit={handleShopSubmit} className="space-y-3">
//             <input
//               placeholder="Name"
//               value={shopForm.name}
//               onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
//               className="w-full border p-2 rounded"
//             />

//             <input
//               placeholder="Location"
//               value={shopForm.location}
//               onChange={(e) => setShopForm({ ...shopForm, location: e.target.value })}
//               className="w-full border p-2 rounded"
//             />

//             <textarea
//               placeholder="Description"
//               value={shopForm.description}
//               onChange={(e) => setShopForm({ ...shopForm, description: e.target.value })}
//               className="w-full border p-2 rounded"
//             />

//             <input type="file" onChange={(e) => setShopForm({ ...shopForm, image: e.target.files[0] })} />

//             <button className="bg-blue-600 text-white px-4 py-2 rounded">
//               Create Shop
//             </button>
//           </form>

//           <p className="text-green-600 text-sm mt-2">{shopMessage}</p>
//         </div>

//         {/* 🧺 ADD SERVICE */}
//         <div className="bg-white p-6 rounded shadow">
//           <h3 className="font-semibold mb-4">Add Service</h3>

//           <form onSubmit={handleServiceSubmit} className="space-y-3">

//             <select
//               value={serviceForm.shop}
//               onChange={(e) => setServiceForm({ ...serviceForm, shop: e.target.value })}
//               className="w-full border p-2 rounded"
//             >
//               <option value="">Select Shop</option>
//               {shops.map((shop) => (
//                 <option key={shop.id} value={shop.id}>
//                   {shop.name}
//                 </option>
//               ))}
//             </select>

//             <input
//               placeholder="Service name"
//               value={serviceForm.name}
//               onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
//               className="w-full border p-2 rounded"
//             />

//             <input
//               type="number"
//               placeholder="Price per kg"
//               value={serviceForm.price_per_kg}
//               onChange={(e) =>
//                 setServiceForm({ ...serviceForm, price_per_kg: e.target.value })
//               }
//               className="w-full border p-2 rounded"
//             />

//             <button className="bg-blue-600 text-white px-4 py-2 rounded">
//               Add Service
//             </button>
//           </form>

//           <p className="text-green-600 text-sm mt-2">{serviceMessage}</p>
//         </div>

//       </main>
//     </div>
//   );
// };

// export default Dashboard;

// import React, { useState, useEffect } from "react";
// import {
//   createShop,
//   getShops,
//   createService,
//   getOwnerOrders,
//   updateOrderStatus,
// } from "../api";
// import { Link, useNavigate } from "react-router-dom";
// import { Home, ShoppingCart, Store } from "lucide-react";

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const role = localStorage.getItem("role");
//   const token = localStorage.getItem("access");

//   // 🔹 State
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
//   // 🔐 PROTECT ROUTE
//   // =========================
//   useEffect(() => {
//     if (!token || role !== "owner") {
//       navigate("/");
//       return;
//     }

//     fetchAll();
//   }, [navigate]);

//   const fetchAll = async () => {
//     setLoading(true);
//     await Promise.all([fetchShops(), fetchOrders()]);
//     setLoading(false);
//   };

//   // =========================
//   // 📡 FETCH DATA
//   // =========================
//   const fetchShops = async () => {
//     try {
//       const data = await getShops();
//       setShops(data);
//     } catch (err) {
//       console.error("Error fetching shops:", err);
//     }
//   };

//   const fetchOrders = async () => {
//     try {
//       const data = await getOwnerOrders();
//       setOrders(data);
//     } catch (err) {
//       console.error("Error fetching orders:", err);
//     }
//   };

//   // =========================
//   // 🏪 CREATE SHOP
//   // =========================
//   const handleShopSubmit = async (e) => {
//     e.preventDefault();
//     setShopMessage("");

//     const formData = new FormData();
//     formData.append("name", shopForm.name);
//     formData.append("location", shopForm.location);
//     formData.append("description", shopForm.description);
//     if (shopForm.image) formData.append("image", shopForm.image);

//     try {
//       await createShop(formData);

//       setShopMessage("Shop created successfully!");
//       setShopForm({ name: "", location: "", description: "", image: null });

//       fetchShops();
//     } catch (err) {
//       console.error(err);
//       setShopMessage("Error creating shop");
//     }
//   };

//   // =========================
//   // 🧺 CREATE SERVICE
//   // =========================
//   const handleServiceSubmit = async (e) => {
//     e.preventDefault();
//     setServiceMessage("");

//     if (!serviceForm.shop) {
//       setServiceMessage(" Select a shop");
//       return;
//     }

//     try {
//       await createService(serviceForm);

//       setServiceMessage(" Service added!");
//       setServiceForm({ shop: "", name: "", price_per_kg: "" });
//     } catch (err) {
//       console.error(err);
//       setServiceMessage(" Error adding service");
//     }
//   };

//   // =========================
//   // 🔄 UPDATE ORDER STATUS
//   // =========================
//   const handleStatusUpdate = async (id, status) => {
//     try {
//       await updateOrderStatus(id, status);
//       fetchOrders();
//     } catch (err) {
//       console.error("Status update failed:", err);
//     }
//   };

//   // =========================
//   // LOADING STATE
//   // =========================
//   if (loading) {
//     return <div className="p-10 text-center">Loading dashboard...</div>;
//   }

//   return (
//     <div className="flex min-h-screen bg-gray-200">
//       {/* SIDEBAR */}
//       <aside className="w-72 bg-gradient-to-b from-blue-900 to-blue-800 text-white p-6 hidden md:block">
//         <h2 className="text-2xl font-bold mb-6">Owner Dashboard</h2>

//         <nav className="flex flex-col space-y-4 text-sm">
//           <Link to="/dashboard" className="flex items-center gap-3 hover:text-blue-200">
//             <Home size={18} /> <span>Dashboard</span>
//           </Link>

//           <Link to="/orders" className="flex items-center gap-3 hover:text-blue-200">
//             <ShoppingCart size={18} /> <span>Orders</span>
//           </Link>

//           <Link to="/shops" className="flex items-center gap-3 hover:text-blue-200">
//             <Store size={18} /> <span>View Shops</span>
//           </Link>
//         </nav>

//         <div className="mt-8 text-xs text-blue-200">
//           <p className="mb-1">Pro tip: Keep your services updated for better conversions.</p>
//         </div>
//       </aside>

//       {/* MAIN */}
//       <main className="flex-1 p-6 md:p-10">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h1 className="text-2xl font-extrabold text-gray-800">Welcome back</h1>
//             <p className="text-sm text-gray-500">Manage shops, services and orders from here</p>
//           </div>

//           <div className="flex items-center gap-3">
//             <button
//               onClick={() => navigate("/shops")}
//               className="hidden sm:inline-block bg-white border border-gray-200 px-4 py-2 rounded shadow-sm text-sm hover:bg-gray-50"
//             >
//               View Public Shops
//             </button>
//             <div className="bg-white px-3 py-2 rounded shadow-sm text-sm text-gray-700">
//               Owner
//             </div>
//           </div>
//         </div>

//         {/* STATS */}
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
//           <div className="bg-white p-5 rounded-lg shadow flex items-center gap-4">
//             <div className="bg-blue-50 p-3 rounded">
//               <Store className="text-blue-600" size={20} />
//             </div>
//             <div>
//               <h4 className="text-sm text-gray-500">Total Shops</h4>
//               <p className="text-2xl font-bold text-gray-800">{shops.length}</p>
//             </div>
//           </div>

//           <div className="bg-white p-5 rounded-lg shadow flex items-center gap-4">
//             <div className="bg-blue-50 p-3 rounded">
//               <ShoppingCart className="text-blue-600" size={20} />
//             </div>
//             <div>
//               <h4 className="text-sm text-gray-500">Total Orders</h4>
//               <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
//             </div>
//           </div>

//           <div className="bg-white p-5 rounded-lg shadow flex items-center gap-4">
//             <div className="bg-blue-50 p-3 rounded">
//               <Home className="text-blue-600" size={20} />
//             </div>
//             <div>
//               <h4 className="text-sm text-gray-500">Services</h4>
//               <p className="text-2xl font-bold text-gray-800">Active</p>
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Left column: Forms */}
//           <div className="lg:col-span-2 space-y-8">
//             {/* SHOP FORM */}
//             <div className="bg-white p-6 rounded-lg shadow">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-semibold text-gray-800">Add Shop</h3>
//                 <p className="text-sm text-green-600">{shopMessage}</p>
//               </div>

//               <form onSubmit={handleShopSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="col-span-1">
//                   <label className="text-sm text-gray-600 mb-1 block">Shop Name</label>
//                   <input
//                     value={shopForm.name}
//                     onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
//                     placeholder="Shop Name"
//                     className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
//                     required
//                   />
//                 </div>

//                 <div className="col-span-1">
//                   <label className="text-sm text-gray-600 mb-1 block">Location</label>
//                   <input
//                     value={shopForm.location}
//                     onChange={(e) => setShopForm({ ...shopForm, location: e.target.value })}
//                     placeholder="Location"
//                     className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
//                     required
//                   />
//                 </div>

//                 <div className="col-span-1 md:col-span-2">
//                   <label className="text-sm text-gray-600 mb-1 block">Description</label>
//                   <textarea
//                     value={shopForm.description}
//                     onChange={(e) => setShopForm({ ...shopForm, description: e.target.value })}
//                     placeholder="Description"
//                     className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
//                     required
//                   />
//                 </div>

//                 <div className="col-span-1">
//                   <label className="text-sm text-gray-600 mb-1 block">Image</label>
//                   <input
//                     type="file"
//                     onChange={(e) => setShopForm({ ...shopForm, image: e.target.files[0] })}
//                     className="w-full text-sm"
//                   />
//                 </div>

//                 <div className="col-span-1 md:col-span-2">
//                   <button className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
//                     Add Shop
//                   </button>
//                 </div>
//               </form>
//             </div>

//             {/* SERVICE FORM */}
//             <div className="bg-white p-6 rounded-lg shadow">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-semibold text-gray-800">Add Service</h3>
//                 <p className="text-sm text-green-600">{serviceMessage}</p>
//               </div>

//               <form onSubmit={handleServiceSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <select
//                   value={serviceForm.shop}
//                   onChange={(e) => setServiceForm({ ...serviceForm, shop: e.target.value })}
//                   className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
//                   required
//                 >
//                   <option value="">Select Shop</option>
//                   {shops.map((shop) => (
//                     <option key={shop.id} value={shop.id}>
//                       {shop.name}
//                     </option>
//                   ))}
//                 </select>

//                 <input
//                   value={serviceForm.name}
//                   onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
//                   placeholder="Service Name"
//                   className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
//                   required
//                 />

//                 <input
//                   value={serviceForm.price_per_kg}
//                   onChange={(e) =>
//                     setServiceForm({ ...serviceForm, price_per_kg: e.target.value })
//                   }
//                   type="number"
//                   placeholder="Price per kg"
//                   className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
//                   required
//                 />

//                 <div className="md:col-span-3">
//                   <button className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
//                     Add Service
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>

//           {/* Right column: Orders preview */}
//           <aside className="space-y-6">
//             {/* <div className="bg-white p-6 rounded-lg shadow">
//               <h4 className="text-lg font-semibold mb-3">Recent Orders</h4>

//               {orders.length === 0 ? (
//                 <p className="text-sm text-gray-500">No orders yet</p>
//               ) : (
//                 <div className="space-y-4 max-h-96 overflow-auto pr-2">
//                   {orders.map((order) => (
//                     <div key={order.id} className="border rounded p-3 bg-gray-50">
//                       <div className="flex items-start justify-between">
//                         <div>
//                           <p className="text-sm font-semibold text-gray-800">{order.username}</p>
//                           <p className="text-xs text-gray-500">{order.service_name} • {order.shop_name}</p>
//                         </div>
//                         <div className="text-sm font-medium text-gray-700">KES {order.total_price}</div>
//                       </div>

//                       <div className="mt-3 flex items-center gap-2">
//                         <span className="text-xs px-2 py-1 rounded bg-white border text-gray-600">
//                           {order.status}
//                         </span>

//                         <div className="ml-auto flex gap-2">
//                           {["pending", "washing", "completed"].map((s) => (
//                             <button
//                               key={s}
//                               onClick={() => handleStatusUpdate(order.id, s)}
//                               className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition"
//                             >
//                               {s}
//                             </button>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div> */}

//             <div className="bg-white p-6 rounded-lg shadow">
//               <h4 className="text-lg font-semibold mb-2">Quick Actions</h4>
//               <div className="flex flex-col gap-3">
//                 <button
//                   onClick={() => navigate("/create-promo")}
//                   className="w-full text-left bg-blue-50 border border-blue-100 text-blue-700 px-3 py-2 rounded"
//                 >
//                   Create Promotion
//                 </button>
//                 <button
//                   onClick={() => navigate("/reports")}
//                   className="w-full text-left bg-blue-50 border border-blue-100 text-blue-700 px-3 py-2 rounded"
//                 >
//                   View Reports
//                 </button>
//               </div>
//             </div>
//           </aside>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Dashboard;
