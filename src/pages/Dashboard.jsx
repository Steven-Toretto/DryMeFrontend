import React, { useState, useEffect, useContext } from "react";
import {
  createShop,
  getShops,
  createService,
  updateService,
  deleteService,
  getServices,
  getOwnerOrders,
  deleteShop,
} from "../api";
import { Link, useNavigate } from "react-router-dom";
import {
  Home, ShoppingCart, Store, PlusCircle,
  Trash2, Edit2, Users, Tag, LogOut,
  Image as ImageIcon, Menu, X, TrendingUp,
  CheckCircle2, Clock, Droplets,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { logoutUser, token, user } = useContext(AuthContext);
  const role = user?.role;

  const hour = new Date().getHours();
  const greeting =
    hour >= 5 && hour < 12 ? "Good morning" :
    hour >= 12 && hour < 17 ? "Good afternoon" :
    hour >= 17 && hour < 21 ? "Good evening" : "Welcome";

  const [shops, setShops] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [shopForm, setShopForm] = useState({ name: "", location: "", description: "", image: null });
  const [serviceForm, setServiceForm] = useState({ shop: "", name: "", price_per_kg: "" });

  const [shopMessage, setShopMessage] = useState("");
  const [serviceMessage, setServiceMessage] = useState("");
  const [shopServices, setShopServices] = useState({});
  const [editingService, setEditingService] = useState(null);
  const [editServiceMessage, setEditServiceMessage] = useState("");

  useEffect(() => {
    if (token === undefined) return;
    if (!token) { navigate("/login"); return; }
    if (role !== "owner") { navigate("/shops"); return; }
    fetchAll();
  }, [token, role]);

  useEffect(() => {
    if (!token || role !== "owner") return;
    const interval = setInterval(async () => {
      try {
        const updatedOrders = await getOwnerOrders();
        setOrders(updatedOrders.results ?? updatedOrders);
      } catch (error) {
        console.error("Auto refresh failed:", error);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [token, role]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchShops(), fetchOrders()]);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShops = async () => {
    try {
      const data = await getShops();
      const results = data.results ?? data;
      setShops(results.filter((shop) => shop.owner === user?.username));
    } catch (error) {
      console.error("Fetch shops error:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await getOwnerOrders();
      setOrders(data.results ?? data);
    } catch (error) {
      console.error("Fetch orders error:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this shop?")) return;
    try {
      await deleteShop(id);
      setShops(shops.filter((shop) => shop.id !== id));
    } catch (error) {
      console.error("Delete shop error:", error);
      alert("Failed to delete shop");
    }
  };

  const handleShopSubmit = async (e) => {
    e.preventDefault();
    setShopMessage("");
    try {
      const formData = new FormData();
      formData.append("name", shopForm.name);
      formData.append("location", shopForm.location);
      formData.append("description", shopForm.description);
      if (shopForm.image instanceof File) formData.append("image", shopForm.image);
      await createShop(formData);
      setShopMessage("Shop created successfully!");
      setShopForm({ name: "", location: "", description: "", image: null });
      document.getElementById("shop-image-input").value = "";
      fetchShops();
    } catch (error) {
      console.error("Create shop error:", error);
      setShopMessage("Failed to create shop");
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setServiceMessage("");
    if (!serviceForm.shop) { setServiceMessage("Please select a shop"); return; }
    try {
      await createService(serviceForm);
      setServiceMessage("Service added successfully!");
      setServiceForm({ shop: "", name: "", price_per_kg: "" });
    } catch (error) {
      console.error("Create service error:", error);
      setServiceMessage("Failed to create service");
    }
  };

  const fetchShopServices = async (shopId) => {
    try {
      const data = await getServices(shopId);
      setShopServices(prev => ({ ...prev, [shopId]: data.results ?? data }));
    } catch (err) {
      console.error("Failed to load services", err);
    }
  };

  const handleEditService = async (serviceId, shopId) => {
    if (!editingService) return;
    try {
      await updateService(serviceId, { name: editingService.name, price_per_kg: editingService.price_per_kg });
      setEditServiceMessage("Service updated!");
      setEditingService(null);
      fetchShopServices(shopId);
      setTimeout(() => setEditServiceMessage(""), 2000);
    } catch (err) {
      setEditServiceMessage("Failed to update service.");
    }
  };

  const handleDeleteService = async (serviceId, shopId) => {
    if (!window.confirm("Delete this service? This cannot be undone.")) return;
    try {
      await deleteService(serviceId);
      fetchShopServices(shopId);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete service.");
    }
  };

  const handleLogout = () => { logoutUser(); navigate("/login"); };

  if (!token || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full" />
      </div>
    );
  }

  // Analytics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const washingOrders = orders.filter(o => o.status === "washing").length;
  const completedOrders = orders.filter(o => o.status === "completed").length;
  const paidOrders = orders.filter(o => o.payment_status === "paid");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);
  const uniqueCustomers = new Set(orders.map(o => o.user?.id)).size;
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thisWeekOrders = orders.filter(o => new Date(o.created_at) >= weekAgo).length;

  const inputClass = "w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition";

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* MOBILE TOPBAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-700 to-blue-600 text-white flex items-center justify-between px-4 py-3 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="font-black text-sm">D</span>
          </div>
          <span className="font-bold">DryMe</span>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-white/10">
          <Menu size={22} />
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40 md:hidden" />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-700 to-blue-800 text-white
        transform transition-transform duration-300 flex flex-col
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}>

        <div className="flex-1 overflow-y-auto p-6">

          {/* CLOSE — mobile */}
          <div className="md:hidden flex justify-end mb-4">
            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-white/10">
              <X size={20} />
            </button>
          </div>

          {/* BRAND */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-blue-600 font-black text-lg">D</span>
            </div>
            <div>
              <h1 className="font-black text-lg leading-none">DryMe</h1>
              <p className="text-xs text-blue-200 mt-0.5">Owner Dashboard</p>
            </div>
          </div>

          {/* OWNER CARD */}
          <div className="bg-white/10 rounded-2xl p-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg mb-2">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <p className="font-semibold text-sm">{user?.username}</p>
            <p className="text-xs text-blue-200 mt-0.5">Shop Owner</p>
          </div>

          {/* NAV */}
          <nav>
            <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-3 px-2">Menu</p>
            <ul className="space-y-1">
              {[
                { to: "/dashboard", icon: <Home size={17} />, label: "Dashboard" },
                { to: "/orders", icon: <ShoppingCart size={17} />, label: "Orders", badge: orders.length },
                { to: "/shops", icon: <Store size={17} />, label: "Shops" },
                { to: "/services", icon: <Tag size={17} />, label: "Services" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/10 transition text-sm font-medium"
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      {item.label}
                    </div>
                    {item.badge !== undefined && (
                      <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* LOGOUT */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-red-500/80 px-4 py-3 rounded-xl transition text-sm font-semibold"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 p-5 md:p-8">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">
            {greeting},{" "}
            <span className="text-blue-600">
              {user?.username?.charAt(0).toUpperCase() + user?.username?.slice(1)}
            </span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Here's what's happening with your business today.</p>
        </div>

        {/* ANALYTICS — TOP ROW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[
            { icon: <ShoppingCart size={18} />, color: "blue", label: "Total Orders", value: totalOrders, sub: `${thisWeekOrders} this week` },
            { icon: <TrendingUp size={18} />, color: "green", label: "Revenue", value: `KES ${totalRevenue.toFixed(0)}`, sub: `${paidOrders.length} paid orders` },
            { icon: <Users size={18} />, color: "purple", label: "Customers", value: uniqueCustomers, sub: "unique customers" },
            { icon: <Store size={18} />, color: "yellow", label: "My Shops", value: shops.length, sub: "active listings" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-xl bg-${stat.color}-100 text-${stat.color}-600`}>
                  {stat.icon}
                </div>
                <p className="text-gray-500 text-xs font-medium">{stat.label}</p>
              </div>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* STATUS BREAKDOWN */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-center">
            <div className="flex justify-center mb-2 text-orange-500"><Clock size={18} /></div>
            <p className="text-orange-600 text-xs font-bold uppercase tracking-wide">Pending</p>
            <p className="text-2xl font-black text-orange-700 mt-1">{pendingOrders}</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
            <div className="flex justify-center mb-2 text-blue-500"><Droplets size={18} /></div>
            <p className="text-blue-600 text-xs font-bold uppercase tracking-wide">Washing</p>
            <p className="text-2xl font-black text-blue-700 mt-1">{washingOrders}</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
            <div className="flex justify-center mb-2 text-green-500"><CheckCircle2 size={18} /></div>
            <p className="text-green-600 text-xs font-bold uppercase tracking-wide">Completed</p>
            <p className="text-2xl font-black text-green-700 mt-1">{completedOrders}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* MY SHOPS */}
          <section className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800">My Shops</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{shops.length} shops</span>
            </div>

            {shops.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Store size={32} className="mx-auto mb-3 text-gray-200" />
                <p className="text-sm">No shops yet — create one below</p>
              </div>
            ) : (
              <div className="space-y-4">
                {shops.map((shop) => (
                  <div key={shop.id} className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition">
                    <div className="h-44 bg-gray-100 overflow-hidden">
                      {shop.image ? (
                        <img src={shop.image} alt={shop.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                          <ImageIcon size={32} />
                          <p className="text-xs mt-2">No Image</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-gray-900">{shop.name}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">{shop.location}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => navigate(`/edit-shop/${shop.id}`)}
                            className="flex items-center gap-1.5 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(shop.id)}
                            className="flex items-center gap-1.5 border border-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-50 transition"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">{shop.description}</p>

                      {/* SERVICES */}
                      <div className="mt-4 pt-3 border-t border-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Services</p>
                          <button
                            onClick={() => fetchShopServices(shop.id)}
                            className="text-xs text-blue-500 hover:underline font-medium"
                          >
                            Load
                          </button>
                        </div>

                        {editServiceMessage && (
                          <p className="text-xs text-green-600 mb-2 bg-green-50 px-2 py-1 rounded-lg">{editServiceMessage}</p>
                        )}

                        <div className="space-y-1.5">
                          {(shopServices[shop.id] || []).map((service) => (
                            <div key={service.id}>
                              {editingService?.id === service.id ? (
                                <div className="flex gap-2 items-center bg-blue-50 rounded-xl p-2">
                                  <input
                                    type="text"
                                    value={editingService.name}
                                    onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                                    className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs flex-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                  />
                                  <input
                                    type="number"
                                    value={editingService.price_per_kg}
                                    onChange={(e) => setEditingService({ ...editingService, price_per_kg: e.target.value })}
                                    className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs w-20 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                  />
                                  <button
                                    onClick={() => handleEditService(service.id, shop.id)}
                                    className="text-xs bg-blue-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-blue-700"
                                  >Save</button>
                                  <button
                                    onClick={() => setEditingService(null)}
                                    className="text-xs text-gray-500 hover:underline"
                                  >Cancel</button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                                  <div>
                                    <span className="text-sm font-semibold text-gray-800">{service.name}</span>
                                    <span className="text-xs text-gray-400 ml-2">KES {service.price_per_kg}/kg</span>
                                  </div>
                                  <div className="flex gap-3">
                                    <button
                                      onClick={() => setEditingService({ id: service.id, name: service.name, price_per_kg: service.price_per_kg })}
                                      className="text-xs text-blue-500 hover:underline font-medium"
                                    >Edit</button>
                                    <button
                                      onClick={() => handleDeleteService(service.id, shop.id)}
                                      className="text-xs text-red-500 hover:underline font-medium"
                                    >Delete</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ADD SHOP */}
          <aside className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800">Add Shop</h2>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <PlusCircle size={18} />
              </div>
            </div>
            <form onSubmit={handleShopSubmit} className="space-y-3">
              <input type="text" placeholder="Shop Name" required value={shopForm.name}
                onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
                className={inputClass} />
              <input type="text" placeholder="Location" required value={shopForm.location}
                onChange={(e) => setShopForm({ ...shopForm, location: e.target.value })}
                className={inputClass} />
              <textarea rows={3} placeholder="Description" required value={shopForm.description}
                onChange={(e) => setShopForm({ ...shopForm, description: e.target.value })}
                className={`${inputClass} resize-none`} />
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Shop Image</label>
                <input id="shop-image-input" type="file" accept="image/*"
                  onChange={(e) => setShopForm({ ...shopForm, image: e.target.files[0] })}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100" />
              </div>
              <button type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-3 rounded-xl font-bold text-sm transition shadow-sm shadow-blue-100">
                Create Shop
              </button>
            </form>
            {shopMessage && (
              <p className={`mt-3 text-xs text-center font-medium ${shopMessage.includes("success") ? "text-green-600" : "text-red-500"}`}>
                {shopMessage}
              </p>
            )}
          </aside>
        </div>

        {/* ADD SERVICE */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-800">Add Service</h2>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Tag size={18} />
            </div>
          </div>
          <form onSubmit={handleServiceSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select value={serviceForm.shop}
              onChange={(e) => setServiceForm({ ...serviceForm, shop: e.target.value })}
              className={inputClass}>
              <option value="">Select Shop</option>
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>{shop.name}</option>
              ))}
            </select>
            <input type="text" placeholder="Service Name" value={serviceForm.name}
              onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
              className={inputClass} />
            <input type="number" placeholder="Price per kg (KES)" value={serviceForm.price_per_kg}
              onChange={(e) => setServiceForm({ ...serviceForm, price_per_kg: e.target.value })}
              className={inputClass} />
            <button type="submit"
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl font-bold text-sm transition py-3 shadow-sm shadow-blue-100">
              Add Service
            </button>
          </form>
          {serviceMessage && (
            <p className={`mt-3 text-xs font-medium ${serviceMessage.includes("success") ? "text-green-600" : "text-red-500"}`}>
              {serviceMessage}
            </p>
          )}
        </section>

        {/* RECENT ORDERS */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
            <Link to="/orders" className="text-xs font-semibold text-blue-600 hover:underline">View all →</Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              <ShoppingCart size={28} className="mx-auto mb-3 text-gray-200" />
              No orders yet
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{order.user?.username}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{order.service?.name} — {order.shop?.name}</p>
                    <p className="text-xs font-semibold text-blue-600 mt-0.5">KES {order.total_price}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      order.status === "completed" ? "bg-green-100 text-green-700"
                      : order.status === "washing" ? "bg-blue-100 text-blue-700"
                      : "bg-orange-100 text-orange-700"
                    }`}>
                      {order.status}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      order.payment_status === "paid" ? "bg-green-50 text-green-600"
                      : order.payment_status === "pending_payment" ? "bg-yellow-50 text-yellow-600"
                      : "bg-red-50 text-red-500"
                    }`}>
                      {order.payment_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
};

export default Dashboard;



