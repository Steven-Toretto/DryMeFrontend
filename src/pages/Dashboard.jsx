import React, { useState, useEffect, useContext } from "react";
import {
  createShop,
  getShops,
  updateShop,
  createService,
  updateService,
  deleteService,
  getServices,
  getOwnerOrders,
  getArchivedOwnerOrders,
  deleteShop,
  updateOrderStatus,
  declineOrder,
  archiveOrder,
  getProfile,
  updateProfile,
  changePassword,
} from "../api";
import { useNavigate } from "react-router-dom";
import {
  Home, ShoppingCart, Store, PlusCircle,
  Trash2, Edit2, Users, LogOut, Tag,
  Image as ImageIcon, Menu, X, TrendingUp,
  CheckCircle2, Clock, Droplets, ThumbsUp, XCircle, Archive, Ban,
  User, Phone, MapPin, Mail, Lock, Check, Settings, AlertTriangle, Shirt,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";

// ===========================
// TICKET PALETTE — matches the claim-ticket styling on the
// customer-facing Orders page, applied to the order cards here too.
// ===========================
const TICKET_INK = "#2B2A25";
const TICKET_FONT = "'Special Elite', 'Courier New', monospace";

const STAMP_STYLES = {
  pending:   { label: "PENDING",   ink: "#B5811E" },
  confirmed: { label: "CONFIRMED", ink: "#35548C" },
  washing:   { label: "WASHING",   ink: "#1C6E8C" },
  completed: { label: "COMPLETE",  ink: "#3F6B47" },
  declined:  { label: "DECLINED",  ink: "#9C3B2E" },
  cancelled: { label: "VOID",      ink: "#6B675D" },
};

function getStamp(status) {
  return STAMP_STYLES[status] || { label: (status || "—").toUpperCase(), ink: "#6B675D" };
}

function StatusStamp({ status, rotate = -4 }) {
  const stamp = getStamp(status);
  return (
    <div
      className="shrink-0 text-[10px] font-bold tracking-[0.15em] px-2.5 py-1 border-2 rounded-[3px] select-none whitespace-nowrap"
      style={{
        fontFamily: TICKET_FONT,
        color: stamp.ink,
        borderColor: stamp.ink,
        transform: `rotate(${rotate}deg)`,
        opacity: 0.88,
        mixBlendMode: "multiply",
      }}
    >
      {stamp.label}
    </div>
  );
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { logoutUser, token, user, updateUser } = useContext(AuthContext);
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
  const [activeView, setActiveView] = useState("overview");
  const [orderFilter, setOrderFilter] = useState("all");
  const [archivedOrders, setArchivedOrders] = useState([]);
  const [loadingArchived, setLoadingArchived] = useState(false);
  const [archivedLoaded, setArchivedLoaded] = useState(false);

  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState({ username: "", phone: "", location: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [decliningOrderId, setDecliningOrderId] = useState(null);
  const [declineReasonDraft, setDeclineReasonDraft] = useState("");
  const [decliningSubmitId, setDecliningSubmitId] = useState(null);
  const [declineError, setDeclineError] = useState("");

  const [shopForm, setShopForm] = useState({ name: "", location: "", description: "", image: null });
  const [serviceForm, setServiceForm] = useState({ shop: "", name: "", price_per_kg: "" });

  const [editingShopId, setEditingShopId] = useState(null);
  const [editShopForm, setEditShopForm] = useState({ name: "", location: "", description: "", image: null });
  const [editShopPreview, setEditShopPreview] = useState("");
  const [savingShopEdit, setSavingShopEdit] = useState(false);
  const [editShopError, setEditShopError] = useState("");

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

  const fetchArchivedOrders = async () => {
    setLoadingArchived(true);
    try {
      const data = await getArchivedOwnerOrders();
      setArchivedOrders(data.results ?? data);
      setArchivedLoaded(true);
    } catch (error) {
      console.error("Fetch archived orders error:", error);
    } finally {
      setLoadingArchived(false);
    }
  };

  const fetchProfileData = async () => {
    setLoadingProfile(true);
    try {
      const data = await getProfile();
      const { stats, ...rest } = data;
      setProfileData(rest);
      setProfileDraft({
        username: rest.username || "",
        phone: rest.phone || "",
        location: rest.location || "",
      });
      setProfileLoaded(true);
    } catch (error) {
      console.error("Fetch profile error:", error.response?.data || error.message);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleStartEditProfile = () => {
    setProfileDraft({
      username: profileData.username || "",
      phone: profileData.phone || "",
      location: profileData.location || "",
    });
    setProfileError("");
    setProfileSuccess("");
    setEditingProfile(true);
  };

  const handleCancelEditProfile = () => {
    setEditingProfile(false);
    setProfileError("");
  };

  const handleSaveProfile = async () => {
    if (!profileDraft.username.trim()) {
      setProfileError("Username can't be empty.");
      return;
    }
    setSavingProfile(true);
    setProfileError("");
    try {
      const updated = await updateProfile({
        username: profileDraft.username.trim(),
        phone: profileDraft.phone.trim(),
        location: profileDraft.location.trim(),
      });
      setProfileData((prev) => ({ ...prev, ...updated }));
      updateUser({
        username: updated.username,
        phone: updated.phone,
        location: updated.location,
      });
      setEditingProfile(false);
      setProfileSuccess("Profile updated.");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (err) {
      const data = err.response?.data;
      const msg = data
        ? Object.values(data).flat().join(" ")
        : "Couldn't save your changes. Try again.";
      setProfileError(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("Fill in all three fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword(oldPassword, newPassword);
      setPasswordSuccess("Password updated.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.error || "Couldn't update your password.");
    } finally {
      setChangingPassword(false);
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

  // ===========================
  // INLINE EDIT SHOP (no navigation)
  // ===========================
  const handleStartEditShop = (shop) => {
    setEditingShopId(shop.id);
    setEditShopForm({
      name: shop.name || "",
      location: shop.location || "",
      description: shop.description || "",
      image: null,
    });

    let imageUrl = "";
    if (shop.image) {
      imageUrl = shop.image.startsWith("http")
        ? shop.image
        : `${import.meta.env.VITE_API_URL}${shop.image}`;
    }
    setEditShopPreview(imageUrl);
    setEditShopError("");
  };

  const handleCancelEditShop = () => {
    setEditingShopId(null);
    setEditShopError("");
  };

  const handleEditShopImageChange = (file) => {
    if (!file) return;
    setEditShopForm((prev) => ({ ...prev, image: file }));
    setEditShopPreview(URL.createObjectURL(file));
  };

  const handleSaveShopEdit = async (shopId) => {
    if (!editShopForm.name || !editShopForm.location || !editShopForm.description) {
      setEditShopError("All fields are required.");
      return;
    }
    setSavingShopEdit(true);
    setEditShopError("");
    try {
      const formData = new FormData();
      formData.append("name", editShopForm.name);
      formData.append("location", editShopForm.location);
      formData.append("description", editShopForm.description);
      if (editShopForm.image instanceof File) {
        formData.append("image", editShopForm.image);
      }
      await updateShop(shopId, formData);
      setEditingShopId(null);
      fetchShops();
    } catch (err) {
      console.error("Update shop error:", err.response?.data || err.message);
      setEditShopError("Failed to update shop.");
    } finally {
      setSavingShopEdit(false);
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

  // ===========================
  // ORDER MANAGEMENT (inline Orders view)
  // ===========================
  const handleStatusUpdate = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      fetchOrders();
    } catch (error) {
      console.error("Update error:", error.response?.data || error.message);
    }
  };

  const handleArchive = async (id) => {
    if (!window.confirm("Archive this order?")) return;
    try {
      await archiveOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      setArchivedLoaded(false);
    } catch (err) {
      console.error("Archive error:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Couldn't archive this order. Try again.");
    }
  };

  const handleStartDecline = (order) => {
    setDecliningOrderId(order.id);
    setDeclineReasonDraft("");
    setDeclineError("");
  };

  const handleCancelDecline = () => {
    setDecliningOrderId(null);
    setDeclineReasonDraft("");
    setDeclineError("");
  };

  const handleSubmitDecline = async (orderId) => {
    const reason = declineReasonDraft.trim();
    if (!reason) {
      setDeclineError("Let the customer know why — this is required.");
      return;
    }
    setDecliningSubmitId(orderId);
    setDeclineError("");
    try {
      await declineOrder(orderId, reason);
      setDecliningOrderId(null);
      setDeclineReasonDraft("");
      fetchOrders();
    } catch (err) {
      setDeclineError(err.response?.data?.error || "Couldn't decline this order. Try again.");
    } finally {
      setDecliningSubmitId(null);
    }
  };

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
  const confirmedOrders = orders.filter(o => o.status === "confirmed").length;
  const washingOrders = orders.filter(o => o.status === "washing").length;
  const completedOrders = orders.filter(o => o.status === "completed").length;
  const declinedOrders = orders.filter(o => o.status === "declined").length;
  const cancelledOrders = orders.filter(o => o.status === "cancelled").length;
  const paidOrders = orders.filter(o => o.payment_status === "paid");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);
  const uniqueCustomers = new Set(orders.map(o => o.user?.id)).size;
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thisWeekOrders = orders.filter(o => new Date(o.created_at) >= weekAgo).length;

  const inputClass = "w-full border border-gray-200 bg-gray-50 rounded-sm px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition";

  return (
    <div className="min-h-screen flex" style={{ background: "#F1EAD8" }}>

      {/* MOBILE TOPBAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 text-white flex items-center justify-between px-4 py-3 shadow-lg" style={{ background: TICKET_INK }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white/15 rounded-sm flex items-center justify-center">
            <span className="font-black text-sm">D</span>
          </div>
          <span className="font-bold" style={{ fontFamily: TICKET_FONT }}>DryMe</span>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-sm hover:bg-white/10">
          <Menu size={22} />
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40 md:hidden" />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 text-white
        transform transition-transform duration-300 flex flex-col
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `} style={{ background: TICKET_INK }}>

        <div className="flex-1 overflow-y-auto p-6">

          {/* CLOSE — mobile */}
          <div className="md:hidden flex justify-end mb-4">
            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-sm hover:bg-white/10">
              <X size={20} />
            </button>
          </div>

          {/* BRAND */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center shadow-lg">
              <Shirt size={20} style={{ color: TICKET_INK }} strokeWidth={2} />
            </div>
            <div>
              <h1 className="font-black text-lg leading-none" style={{ fontFamily: TICKET_FONT }}>DryMe</h1>
              <p className="text-[11px] mt-1 tracking-[0.15em]" style={{ color: "#B5811E", fontFamily: TICKET_FONT }}>OWNER COUNTER</p>
            </div>
          </div>

          {/* OWNER CARD */}
          <div className="border rounded-sm p-4 mb-6" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
            <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-lg mb-2" style={{ borderColor: "#B5811E", color: "#B5811E", fontFamily: TICKET_FONT }}>
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <p className="font-semibold text-sm">{user?.username}</p>
            <p className="text-[11px] mt-0.5 tracking-wide" style={{ color: "rgba(255,255,255,0.5)" }}>Shop Owner</p>
          </div>

          {/* NAV */}
          <nav>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-3 px-2" style={{ color: "rgba(255,255,255,0.35)", fontFamily: TICKET_FONT }}>Menu</p>
            <ul className="space-y-1">
              {[
                { view: "overview", icon: <Home size={17} />, label: "Dashboard" },
                { view: "orders", icon: <ShoppingCart size={17} />, label: "Orders", badge: orders.length },
                { view: "shops", icon: <Store size={17} />, label: "Shops", badge: shops.length },
                { view: "profile", icon: <User size={17} />, label: "Profile" },
                { view: "settings", icon: <Settings size={17} />, label: "Settings" },
              ].map((item) => (
                <li key={item.view}>
                  <button
                    onClick={() => {
                      setActiveView(item.view);
                      setSidebarOpen(false);
                      if (item.view === "profile" && !profileLoaded) {
                        fetchProfileData();
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm transition text-sm font-medium ${
                      activeView === item.view ? "bg-white/10" : "hover:bg-white/5"
                    }`}
                    style={activeView === item.view ? { borderLeft: "3px solid #B5811E" } : { borderLeft: "3px solid transparent" }}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      {item.label}
                    </div>
                    {item.badge !== undefined && (
                      <span className="text-xs px-2 py-0.5 rounded-full border" style={{ borderColor: "rgba(255,255,255,0.2)", fontFamily: TICKET_FONT }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* LOGOUT */}
        <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 border hover:bg-white/5 px-4 py-3 rounded-sm transition text-sm font-semibold"
            style={{ borderColor: "rgba(255,255,255,0.15)" }}
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
          <p className="text-[11px] tracking-[0.3em] mb-1.5" style={{ fontFamily: TICKET_FONT, color: `${TICKET_INK}66` }}>
            COUNTER · BUSINESS
          </p>
          <h1 className="text-2xl md:text-3xl font-black" style={{ color: TICKET_INK }}>
            {activeView === "overview" ? (
              <>
                {greeting},{" "}
                <span style={{ color: "#35548C" }}>
                  {user?.username?.charAt(0).toUpperCase() + user?.username?.slice(1)}
                </span>
              </>
            ) : activeView === "shops" ? (
              "Shops"
            ) : activeView === "profile" ? (
              "Profile"
            ) : activeView === "settings" ? (
              "Settings"
            ) : (
              "Orders"
            )}
          </h1>
          <p className="mt-1 text-sm" style={{ color: `${TICKET_INK}80` }}>
            {activeView === "overview"
              ? "Here's what's happening with your business today."
              : activeView === "shops"
              ? `${shops.length} ${shops.length === 1 ? "shop" : "shops"} under your account.`
              : activeView === "profile"
              ? "Manage your account details and password."
              : activeView === "settings"
              ? "Manage sensitive, irreversible account actions."
              : `${orders.length} ${orders.length === 1 ? "order" : "orders"} across your shops.`}
          </p>
        </div>

        {activeView === "overview" ? (
          <>

        {/* ANALYTICS — TOP ROW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[
            { icon: <ShoppingCart size={18} />, ink: "#35548C", label: "Total Orders", value: totalOrders, sub: `${thisWeekOrders} this week`, onClick: () => setActiveView("orders") },
            { icon: <TrendingUp size={18} />, ink: "#3F6B47", label: "Revenue", value: `KES ${totalRevenue.toFixed(0)}`, sub: `${paidOrders.length} paid orders` },
            { icon: <Users size={18} />, ink: "#8A6D3B", label: "Customers", value: uniqueCustomers, sub: "unique customers" },
            { icon: <Store size={18} />, ink: "#B5811E", label: "My Shops", value: shops.length, sub: "active listings", onClick: () => setActiveView("shops") },
          ].map((stat) => (
            <div
              key={stat.label}
              onClick={stat.onClick}
              className={`rounded-sm p-5 border ${stat.onClick ? "cursor-pointer hover:shadow-sm transition" : ""}`}
              style={{ background: "#FBF8EF", borderColor: `${TICKET_INK}1A` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full border-2 flex items-center justify-center" style={{ borderColor: stat.ink, color: stat.ink }}>
                  {stat.icon}
                </div>
                <p className="text-xs font-medium" style={{ color: `${TICKET_INK}80` }}>{stat.label}</p>
              </div>
              <p className="text-2xl font-black" style={{ color: TICKET_INK }}>{stat.value}</p>
              <p className="text-xs mt-1" style={{ color: `${TICKET_INK}60` }}>{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* STATUS BREAKDOWN */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          {[
            { key: "pending", icon: <Clock size={18} />, value: pendingOrders },
            { key: "confirmed", icon: <ThumbsUp size={18} />, value: confirmedOrders },
            { key: "washing", icon: <Droplets size={18} />, value: washingOrders },
            { key: "completed", icon: <CheckCircle2 size={18} />, value: completedOrders },
            { key: "declined", icon: <XCircle size={18} />, value: declinedOrders },
            { key: "cancelled", icon: <Ban size={18} />, value: cancelledOrders },
          ].map((s) => {
            const stamp = getStamp(s.key);
            return (
              <div key={s.key} className="rounded-sm border p-4 text-center" style={{ background: `${stamp.ink}0D`, borderColor: `${stamp.ink}30` }}>
                <div className="flex justify-center mb-2" style={{ color: stamp.ink }}>{s.icon}</div>
                <p className="text-xs font-bold uppercase tracking-wide" style={{ fontFamily: TICKET_FONT, color: stamp.ink }}>{stamp.label}</p>
                <p className="text-2xl font-black mt-1" style={{ color: TICKET_INK }}>{s.value}</p>
              </div>
            );
          })}
        </div>


        {/* RECENT ORDERS */}
        <section className="rounded-sm border p-6" style={{ background: "#FBF8EF", borderColor: `${TICKET_INK}1A` }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold" style={{ color: TICKET_INK }}>Recent Orders</h2>
            <button onClick={() => setActiveView("orders")} className="text-xs font-semibold hover:underline" style={{ color: "#35548C" }}>View all →</button>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-10 text-sm" style={{ color: `${TICKET_INK}60` }}>
              <ShoppingCart size={28} className="mx-auto mb-3" style={{ color: `${TICKET_INK}30` }} />
              No orders yet
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3.5 rounded-sm border" style={{ borderColor: `${TICKET_INK}15` }}>
                  <div>
                    <p className="text-sm font-bold" style={{ color: TICKET_INK }}>{order.user?.username}</p>
                    <p className="text-xs mt-0.5" style={{ color: `${TICKET_INK}80` }}>{order.service?.name} — {order.shop?.name}</p>
                    <p className="text-xs font-bold mt-0.5" style={{ fontFamily: TICKET_FONT, color: "#35548C" }}>KES {order.total_price}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusStamp status={order.status} rotate={order.id % 2 === 0 ? -4 : 4} />
                    <span
                      className="text-[10px] font-bold"
                      style={{
                        fontFamily: TICKET_FONT,
                        color: order.payment_status === "paid" ? "#3F6B47"
                          : order.payment_status === "pending_payment" ? "#B5811E"
                          : "#9C3B2E",
                      }}
                    >
                      {order.payment_status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
          </>
        ) : activeView === "shops" ? (

          <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* MY SHOPS */}
          <section className="lg:col-span-2 bg-[#FBF8EF] rounded-sm border border-[#2B2A25]/10 shadow-sm p-6">
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
                  <div key={shop.id} className="border border-gray-100 rounded-sm overflow-hidden hover:shadow-md transition">
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
                      {editingShopId === shop.id ? (
                        <div className="space-y-3">
                          <input type="text" placeholder="Shop Name" value={editShopForm.name}
                            onChange={(e) => setEditShopForm({ ...editShopForm, name: e.target.value })}
                            className={inputClass} />
                          <input type="text" placeholder="Location" value={editShopForm.location}
                            onChange={(e) => setEditShopForm({ ...editShopForm, location: e.target.value })}
                            className={inputClass} />
                          <textarea rows={3} placeholder="Description" value={editShopForm.description}
                            onChange={(e) => setEditShopForm({ ...editShopForm, description: e.target.value })}
                            className={`${inputClass} resize-none`} />

                          {editShopPreview && (
                            <img src={editShopPreview} alt="Preview" className="w-full h-32 object-cover rounded-sm border border-gray-100" />
                          )}

                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Replace Image</label>
                            <input type="file" accept="image/*"
                              onChange={(e) => handleEditShopImageChange(e.target.files[0])}
                              className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100" />
                          </div>

                          {editShopError && (
                            <p className="text-xs text-red-500 bg-red-50 px-2 py-1.5 rounded-lg">{editShopError}</p>
                          )}

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveShopEdit(shop.id)}
                              disabled={savingShopEdit}
                              className="flex-1 bg-[#35548C] hover:bg-[#2A4370] text-white py-2.5 rounded-sm font-bold text-xs transition disabled:opacity-50"
                            >
                              {savingShopEdit ? "Saving..." : "Save Changes"}
                            </button>
                            <button
                              onClick={handleCancelEditShop}
                              disabled={savingShopEdit}
                              className="px-4 py-2.5 rounded-sm text-xs font-semibold text-gray-500 hover:text-gray-700 border border-gray-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-bold text-gray-900">{shop.name}</h3>
                              <p className="text-xs text-gray-400 mt-0.5">{shop.location}</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => handleStartEditShop(shop)}
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
                                onClick={() => {
                                  if (shopServices[shop.id]) {
                                    setShopServices(prev => {
                                      const updated = { ...prev };
                                      delete updated[shop.id];
                                      return updated;
                                    });
                                  } else {
                                    fetchShopServices(shop.id);
                                  }
                                }}
                                className="text-xs text-blue-500 hover:underline font-medium"
                              >
                                {shopServices[shop.id] ? "Hide" : "Load"}
                              </button>
                            </div>

                            {editServiceMessage && (
                              <p className="text-xs text-green-600 mb-2 bg-green-50 px-2 py-1 rounded-lg">{editServiceMessage}</p>
                            )}

                            <div className="space-y-1.5">
                              {(shopServices[shop.id] || []).map((service) => (
                                <div key={service.id}>
                                  {editingService?.id === service.id ? (
                                    <div className="flex gap-2 items-center bg-blue-50 rounded-sm p-2">
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
                                    <div className="flex items-center justify-between bg-gray-50 rounded-sm px-3 py-2">
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
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ADD SHOP */}
          <aside className="bg-[#FBF8EF] rounded-sm border border-[#2B2A25]/10 shadow-sm p-6 h-fit">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800">Add Shop</h2>
              <div className="w-8 h-8 rounded-sm bg-blue-50 text-blue-600 flex items-center justify-center">
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
                className="w-full bg-[#35548C] hover:bg-[#2A4370] text-white py-3 rounded-sm font-bold text-sm transition shadow-sm">
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
        <section className="bg-[#FBF8EF] rounded-sm border border-[#2B2A25]/10 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-800">Add Service</h2>
            <div className="w-8 h-8 rounded-sm bg-blue-50 text-blue-600 flex items-center justify-center">
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
              className="bg-[#35548C] hover:bg-[#2A4370] text-white rounded-sm font-bold text-sm transition py-3 shadow-sm">
              Add Service
            </button>
          </form>
          {serviceMessage && (
            <p className={`mt-3 text-xs font-medium ${serviceMessage.includes("success") ? "text-green-600" : "text-red-500"}`}>
              {serviceMessage}
            </p>
          )}
        </section>
          </>

        ) : activeView === "profile" ? (

          <>
          {/* ===========================
              PROFILE VIEW (inline, no navigation)
              =========================== */}
          {loadingProfile || !profileData ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              Loading your profile...
            </div>
          ) : (
            <div className="max-w-2xl space-y-6">

              {/* ACCOUNT DETAILS */}
              <section className="bg-[#FBF8EF] rounded-sm border border-[#2B2A25]/10 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-lg text-gray-900">Account details</h2>
                  {!editingProfile && (
                    <button
                      onClick={handleStartEditProfile}
                      className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                  )}
                </div>

                {!editingProfile ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><User size={15} /></div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Username</p>
                        <p className="text-sm font-medium text-gray-800 truncate">{profileData.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Mail size={15} /></div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Email</p>
                        <p className="text-sm font-medium text-gray-800 truncate">{profileData.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Phone size={15} /></div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Phone</p>
                        <p className="text-sm font-medium text-gray-800 truncate">{profileData.phone || "Not set"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 py-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><MapPin size={15} /></div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Shop location</p>
                        <p className="text-sm font-medium text-gray-800 truncate">{profileData.location || "Not set"}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Username</label>
                      <input value={profileDraft.username}
                        onChange={(e) => setProfileDraft((d) => ({ ...d, username: e.target.value }))}
                        className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Email</label>
                      <input value={profileData.email} disabled
                        className={`${inputClass} bg-gray-50 text-gray-400 cursor-not-allowed`} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Phone</label>
                      <input value={profileDraft.phone} placeholder="e.g. 0712 345 678"
                        onChange={(e) => setProfileDraft((d) => ({ ...d, phone: e.target.value }))}
                        className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Shop location</label>
                      <input value={profileDraft.location} placeholder="e.g. Kilimani, Nairobi"
                        onChange={(e) => setProfileDraft((d) => ({ ...d, location: e.target.value }))}
                        className={inputClass} />
                    </div>

                    {profileError && <p className="text-xs text-red-500 bg-red-50 px-2 py-1.5 rounded-lg">{profileError}</p>}

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className="flex items-center gap-1.5 bg-[#35548C] hover:bg-[#2A4370] text-white px-4 py-2.5 rounded-sm font-bold text-sm transition disabled:opacity-50"
                      >
                        <Check size={15} /> {savingProfile ? "Saving..." : "Save changes"}
                      </button>
                      <button
                        onClick={handleCancelEditProfile}
                        disabled={savingProfile}
                        className="px-4 py-2.5 rounded-sm text-sm font-semibold text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {profileSuccess && !editingProfile && (
                  <p className="text-xs text-green-600 font-medium mt-4">{profileSuccess}</p>
                )}
              </section>

              {/* CHANGE PASSWORD */}
              <section className="bg-[#FBF8EF] rounded-sm border border-[#2B2A25]/10 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Lock size={16} className="text-blue-600" />
                  <h2 className="font-bold text-lg text-gray-900">Change password</h2>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Current password</label>
                    <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">New password</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} />
                    <p className="text-[11px] text-gray-400 mt-1">At least 8 characters</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Confirm new password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} />
                  </div>

                  {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
                  {passwordSuccess && <p className="text-xs text-green-600 font-medium">{passwordSuccess}</p>}

                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="flex items-center gap-1.5 bg-[#35548C] hover:bg-[#2A4370] text-white px-4 py-2.5 rounded-sm font-bold text-sm transition disabled:opacity-50"
                  >
                    <Lock size={14} /> {changingPassword ? "Updating..." : "Update password"}
                  </button>
                </form>
              </section>
            </div>
          )}
          </>

        ) : activeView === "settings" ? (

          <>
          {/* ===========================
              SETTINGS VIEW — Danger Zone
              =========================== */}
          <div className="max-w-2xl">
            <section className="bg-[#FBF8EF] rounded-sm border border-[#9C3B2E]/25 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={18} className="text-red-500" />
                <h2 className="font-bold text-lg text-gray-900">Danger Zone</h2>
              </div>
              <p className="text-sm text-gray-500 mb-5">
                These actions are permanent and can't be undone. Deleting a shop also removes its services
                and cannot be recovered.
              </p>

              {shops.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">You have no shops to manage.</p>
              ) : (
                <div className="space-y-2">
                  {shops.map((shop) => (
                    <div
                      key={shop.id}
                      className="flex items-center justify-between gap-3 p-4 border border-red-100 bg-red-50/40 rounded-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{shop.name}</p>
                        <p className="text-xs text-gray-500">{shop.location}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(shop.id)}
                        className="flex items-center gap-1.5 shrink-0 border border-red-200 text-red-600 px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition"
                      >
                        <Trash2 size={13} /> Delete Shop
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
          </>

        ) : (

          /* ===========================
             ORDERS VIEW (inline, no navigation)
             =========================== */
          <section className="bg-[#FBF8EF] rounded-sm border border-[#2B2A25]/10 shadow-sm p-6">

            {/* FILTER TABS */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { key: "all", label: "All", count: orders.length },
                { key: "pending", label: "Pending", count: pendingOrders },
                { key: "confirmed", label: "Confirmed", count: confirmedOrders },
                { key: "washing", label: "Washing", count: washingOrders },
                { key: "completed", label: "Completed", count: completedOrders },
                { key: "declined", label: "Declined", count: declinedOrders },
                { key: "cancelled", label: "Cancelled", count: cancelledOrders },
                { key: "archived", label: "Archived", count: archivedLoaded ? archivedOrders.length : null },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => {
                    setOrderFilter(f.key);
                    if (f.key === "archived" && !archivedLoaded) {
                      fetchArchivedOrders();
                    }
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition ${
                    orderFilter === f.key
                      ? "text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                  style={orderFilter === f.key ? { background: TICKET_INK } : undefined}
                >
                  {f.label}
                  {f.count !== null && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                      orderFilter === f.key ? "bg-white/20" : "bg-white text-gray-400"
                    }`}>
                      {f.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {orderFilter === "archived" && loadingArchived ? (
              <div className="text-center py-16 text-gray-400 text-sm">
                Loading archived orders...
              </div>
            ) : (() => {
              const filteredOrders = orderFilter === "all"
                ? orders
                : orderFilter === "archived"
                ? archivedOrders
                : orders.filter((o) => o.status === orderFilter);

              if (filteredOrders.length === 0) {
                return (
                  <div className="text-center py-16 text-gray-400 text-sm">
                    <ShoppingCart size={28} className="mx-auto mb-3 text-gray-200" />
                    No orders here
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="relative border rounded-sm"
                      style={{ background: "#FBF8EF", borderColor: `${TICKET_INK}1F` }}
                    >
                      {/* punch hole — the tag this ticket hangs from */}
                      <div
                        className="absolute -top-2 left-5 w-3.5 h-3.5 rounded-full border"
                        style={{ background: "#ffffff", borderColor: `${TICKET_INK}25` }}
                      />

                      <div className="p-4 pt-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <p className="text-[9px] tracking-[0.2em] mb-0.5" style={{ fontFamily: TICKET_FONT, color: `${TICKET_INK}66` }}>
                              CLAIM No.
                            </p>
                            <p className="text-lg font-bold mb-1.5" style={{ fontFamily: TICKET_FONT, color: TICKET_INK }}>
                              {String(order.id).padStart(5, "0")}
                            </p>
                            <p className="text-sm font-bold" style={{ color: TICKET_INK }}>{order.user?.username}</p>
                            <p className="text-xs mt-0.5" style={{ color: `${TICKET_INK}99` }}>{order.service?.name} — {order.shop?.name}</p>
                            <p className="text-xs font-bold mt-1" style={{ fontFamily: TICKET_FONT, color: "#35548C" }}>
                              KES {order.total_price} · {order.weight} kg
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <StatusStamp status={order.status} rotate={order.id % 2 === 0 ? -4 : 4} />
                            {order.owner_archived && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-semibold">
                                Archived
                              </span>
                            )}
                            <span
                              className="text-[10px] font-bold"
                              style={{
                                fontFamily: TICKET_FONT,
                                color: order.payment_status === "paid" ? "#3F6B47"
                                  : order.payment_status === "pending_payment" ? "#B5811E"
                                  : "#9C3B2E",
                              }}
                            >
                              {order.payment_status.replace("_", " ").toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="border-t border-dashed mb-3" style={{ borderColor: `${TICKET_INK}20` }} />

                        {order.status === "declined" && order.decline_reason && (
                          <div className="mb-3 p-3 border rounded-sm" style={{ borderColor: "#9C3B2E40", background: "#9C3B2E0D" }}>
                            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "#9C3B2E" }}>You declined this order</p>
                            <p className="text-sm" style={{ color: `${TICKET_INK}CC` }}>{order.decline_reason}</p>
                            {order.refund_needed && (
                              <p className="text-xs font-medium mt-2 pt-2 border-t" style={{ color: "#B5811E", borderColor: "#9C3B2E30" }}>
                                ⚠ Already paid — process a manual M-Pesa refund.
                              </p>
                            )}
                          </div>
                        )}

                        {order.status === "cancelled" && (
                          <div className="mb-3 p-3 border rounded-sm" style={{ borderColor: `${TICKET_INK}20`, background: `${TICKET_INK}08` }}>
                            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: `${TICKET_INK}99` }}>
                              <Ban size={12} className="inline mr-1" /> Customer cancelled this order
                            </p>
                            {order.refund_needed && (
                              <p className="text-xs font-medium mt-2 pt-2 border-t" style={{ color: "#B5811E", borderColor: `${TICKET_INK}15` }}>
                                ⚠ Already paid — process a manual M-Pesa refund.
                              </p>
                            )}
                          </div>
                        )}

                        {/* ACTIONS */}
                        {order.status !== "declined" && order.status !== "cancelled" && !order.owner_archived && (
                          <div className="flex flex-wrap items-center gap-2">
                            {order.status === "pending" && (
                              <>
                                <button onClick={() => handleStatusUpdate(order.id, "confirmed")}
                                  className="px-3.5 py-1.5 text-xs font-bold rounded-sm text-white"
                                  style={{ background: "#35548C" }}>
                                  <ThumbsUp size={11} className="inline mr-1" /> Accept
                                </button>
                                <button onClick={() => handleStartDecline(order)}
                                  className="px-3.5 py-1.5 text-xs font-bold rounded-sm border"
                                  style={{ borderColor: "#9C3B2E40", color: "#9C3B2E" }}>
                                  <XCircle size={11} className="inline mr-1" /> Decline
                                </button>
                              </>
                            )}
                            {order.status === "confirmed" && (
                              <>
                                <button onClick={() => handleStatusUpdate(order.id, "washing")}
                                  className="px-3.5 py-1.5 text-xs font-bold rounded-sm text-white"
                                  style={{ background: "#1C6E8C" }}>
                                  <Droplets size={11} className="inline mr-1" /> Start Washing
                                </button>
                                <button onClick={() => handleStartDecline(order)}
                                  className="px-3.5 py-1.5 text-xs font-bold rounded-sm border"
                                  style={{ borderColor: "#9C3B2E40", color: "#9C3B2E" }}>
                                  <XCircle size={11} className="inline mr-1" /> Decline
                                </button>
                              </>
                            )}
                            {order.status === "washing" && (
                              <button onClick={() => handleStatusUpdate(order.id, "completed")}
                                className="px-3.5 py-1.5 text-xs font-bold rounded-sm text-white"
                                style={{ background: "#3F6B47" }}>
                                <CheckCircle2 size={11} className="inline mr-1" /> Mark Completed
                              </button>
                            )}
                            {order.status === "completed" && !order.owner_archived && (
                              <button onClick={() => handleArchive(order.id)}
                                className="ml-auto flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-sm text-white"
                                style={{ background: TICKET_INK }}>
                                <Archive size={12} /> Archive
                              </button>
                            )}
                          </div>
                        )}

                        {(order.status === "declined" || order.status === "cancelled") && !order.owner_archived && (
                          <button onClick={() => handleArchive(order.id)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-sm text-white"
                            style={{ background: TICKET_INK }}>
                            <Archive size={12} /> Archive
                          </button>
                        )}

                        {/* INLINE DECLINE FORM */}
                        {decliningOrderId === order.id && (
                          <div className="mt-3 p-4 border rounded-sm" style={{ borderColor: "#9C3B2E40", background: "#9C3B2E0D" }}>
                            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#9C3B2E" }}>
                              <XCircle size={13} /> Reason for declining (required)
                            </label>
                            <textarea
                              value={declineReasonDraft}
                              onChange={(e) => setDeclineReasonDraft(e.target.value)}
                              maxLength={500}
                              rows={3}
                              placeholder="e.g. Fully booked today... The customer will see this."
                              className="w-full text-sm border rounded-sm p-3 bg-white focus:outline-none focus:ring-2 resize-none"
                              style={{ borderColor: "#9C3B2E40" }}
                              autoFocus
                            />
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-[11px]" style={{ color: "#9C3B2E80" }}>{declineReasonDraft.length}/500</span>
                              <div className="flex gap-2">
                                <button onClick={handleCancelDecline} className="px-3 py-1.5 text-xs font-semibold hover:opacity-70" style={{ color: `${TICKET_INK}80` }}>
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSubmitDecline(order.id)}
                                  disabled={decliningSubmitId === order.id}
                                  className="px-4 py-1.5 text-xs font-bold rounded-sm text-white disabled:opacity-50"
                                  style={{ background: "#9C3B2E" }}
                                >
                                  {decliningSubmitId === order.id ? "Declining..." : "Confirm decline"}
                                </button>
                              </div>
                            </div>
                            {declineError && <p className="text-xs mt-2" style={{ color: "#9C3B2E" }}>{declineError}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </section>
        )}

      </main>
    </div>
  );
};

export default Dashboard;



// import React, { useState, useEffect, useContext } from "react";
// import {
//   createShop,
//   getShops,
//   updateShop,
//   createService,
//   updateService,
//   deleteService,
//   getServices,
//   getOwnerOrders,
//   getArchivedOwnerOrders,
//   deleteShop,
//   updateOrderStatus,
//   declineOrder,
//   archiveOrder,
//   getProfile,
//   updateProfile,
//   changePassword,
// } from "../api";
// import { useNavigate } from "react-router-dom";
// import {
//   Home, ShoppingCart, Store, PlusCircle,
//   Trash2, Edit2, Users, LogOut, Tag,
//   Image as ImageIcon, Menu, X, TrendingUp,
//   CheckCircle2, Clock, Droplets, ThumbsUp, XCircle, Archive, Ban,
//   User, Phone, MapPin, Mail, Lock, Check, Settings, AlertTriangle,
// } from "lucide-react";
// import { AuthContext } from "../context/AuthContext";

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const { logoutUser, token, user, updateUser } = useContext(AuthContext);
//   const role = user?.role;

//   const hour = new Date().getHours();
//   const greeting =
//     hour >= 5 && hour < 12 ? "Good morning" :
//     hour >= 12 && hour < 17 ? "Good afternoon" :
//     hour >= 17 && hour < 21 ? "Good evening" : "Welcome";

//   const [shops, setShops] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [activeView, setActiveView] = useState("overview");
//   const [orderFilter, setOrderFilter] = useState("all");
//   const [archivedOrders, setArchivedOrders] = useState([]);
//   const [loadingArchived, setLoadingArchived] = useState(false);
//   const [archivedLoaded, setArchivedLoaded] = useState(false);

//   const [profileData, setProfileData] = useState(null);
//   const [loadingProfile, setLoadingProfile] = useState(false);
//   const [profileLoaded, setProfileLoaded] = useState(false);
//   const [editingProfile, setEditingProfile] = useState(false);
//   const [profileDraft, setProfileDraft] = useState({ username: "", phone: "", location: "" });
//   const [savingProfile, setSavingProfile] = useState(false);
//   const [profileError, setProfileError] = useState("");
//   const [profileSuccess, setProfileSuccess] = useState("");

//   const [oldPassword, setOldPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [changingPassword, setChangingPassword] = useState(false);
//   const [passwordError, setPasswordError] = useState("");
//   const [passwordSuccess, setPasswordSuccess] = useState("");

//   const [decliningOrderId, setDecliningOrderId] = useState(null);
//   const [declineReasonDraft, setDeclineReasonDraft] = useState("");
//   const [decliningSubmitId, setDecliningSubmitId] = useState(null);
//   const [declineError, setDeclineError] = useState("");

//   const [shopForm, setShopForm] = useState({ name: "", location: "", description: "", image: null });
//   const [serviceForm, setServiceForm] = useState({ shop: "", name: "", price_per_kg: "" });

//   const [editingShopId, setEditingShopId] = useState(null);
//   const [editShopForm, setEditShopForm] = useState({ name: "", location: "", description: "", image: null });
//   const [editShopPreview, setEditShopPreview] = useState("");
//   const [savingShopEdit, setSavingShopEdit] = useState(false);
//   const [editShopError, setEditShopError] = useState("");

//   const [shopMessage, setShopMessage] = useState("");
//   const [serviceMessage, setServiceMessage] = useState("");
//   const [shopServices, setShopServices] = useState({});
//   const [editingService, setEditingService] = useState(null);
//   const [editServiceMessage, setEditServiceMessage] = useState("");

//   useEffect(() => {
//     if (token === undefined) return;
//     if (!token) { navigate("/login"); return; }
//     if (role !== "owner") { navigate("/shops"); return; }
//     fetchAll();
//   }, [token, role]);

//   useEffect(() => {
//     if (!token || role !== "owner") return;
//     const interval = setInterval(async () => {
//       try {
//         const updatedOrders = await getOwnerOrders();
//         setOrders(updatedOrders.results ?? updatedOrders);
//       } catch (error) {
//         console.error("Auto refresh failed:", error);
//       }
//     }, 5000);
//     return () => clearInterval(interval);
//   }, [token, role]);

//   const fetchAll = async () => {
//     try {
//       setLoading(true);
//       await Promise.all([fetchShops(), fetchOrders()]);
//     } catch (error) {
//       console.error("Dashboard fetch error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchShops = async () => {
//     try {
//       const data = await getShops();
//       const results = data.results ?? data;
//       setShops(results.filter((shop) => shop.owner === user?.username));
//     } catch (error) {
//       console.error("Fetch shops error:", error);
//     }
//   };

//   const fetchOrders = async () => {
//     try {
//       const data = await getOwnerOrders();
//       setOrders(data.results ?? data);
//     } catch (error) {
//       console.error("Fetch orders error:", error);
//     }
//   };

//   const fetchArchivedOrders = async () => {
//     setLoadingArchived(true);
//     try {
//       const data = await getArchivedOwnerOrders();
//       setArchivedOrders(data.results ?? data);
//       setArchivedLoaded(true);
//     } catch (error) {
//       console.error("Fetch archived orders error:", error);
//     } finally {
//       setLoadingArchived(false);
//     }
//   };

//   const fetchProfileData = async () => {
//     setLoadingProfile(true);
//     try {
//       const data = await getProfile();
//       const { stats, ...rest } = data;
//       setProfileData(rest);
//       setProfileDraft({
//         username: rest.username || "",
//         phone: rest.phone || "",
//         location: rest.location || "",
//       });
//       setProfileLoaded(true);
//     } catch (error) {
//       console.error("Fetch profile error:", error.response?.data || error.message);
//     } finally {
//       setLoadingProfile(false);
//     }
//   };

//   const handleStartEditProfile = () => {
//     setProfileDraft({
//       username: profileData.username || "",
//       phone: profileData.phone || "",
//       location: profileData.location || "",
//     });
//     setProfileError("");
//     setProfileSuccess("");
//     setEditingProfile(true);
//   };

//   const handleCancelEditProfile = () => {
//     setEditingProfile(false);
//     setProfileError("");
//   };

//   const handleSaveProfile = async () => {
//     if (!profileDraft.username.trim()) {
//       setProfileError("Username can't be empty.");
//       return;
//     }
//     setSavingProfile(true);
//     setProfileError("");
//     try {
//       const updated = await updateProfile({
//         username: profileDraft.username.trim(),
//         phone: profileDraft.phone.trim(),
//         location: profileDraft.location.trim(),
//       });
//       setProfileData((prev) => ({ ...prev, ...updated }));
//       updateUser({
//         username: updated.username,
//         phone: updated.phone,
//         location: updated.location,
//       });
//       setEditingProfile(false);
//       setProfileSuccess("Profile updated.");
//       setTimeout(() => setProfileSuccess(""), 3000);
//     } catch (err) {
//       const data = err.response?.data;
//       const msg = data
//         ? Object.values(data).flat().join(" ")
//         : "Couldn't save your changes. Try again.";
//       setProfileError(msg);
//     } finally {
//       setSavingProfile(false);
//     }
//   };

//   const handleChangePassword = async (e) => {
//     e.preventDefault();
//     setPasswordError("");
//     setPasswordSuccess("");

//     if (!oldPassword || !newPassword || !confirmPassword) {
//       setPasswordError("Fill in all three fields.");
//       return;
//     }
//     if (newPassword !== confirmPassword) {
//       setPasswordError("New passwords don't match.");
//       return;
//     }
//     if (newPassword.length < 8) {
//       setPasswordError("New password must be at least 8 characters.");
//       return;
//     }

//     setChangingPassword(true);
//     try {
//       await changePassword(oldPassword, newPassword);
//       setPasswordSuccess("Password updated.");
//       setOldPassword("");
//       setNewPassword("");
//       setConfirmPassword("");
//       setTimeout(() => setPasswordSuccess(""), 3000);
//     } catch (err) {
//       setPasswordError(err.response?.data?.error || "Couldn't update your password.");
//     } finally {
//       setChangingPassword(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this shop?")) return;
//     try {
//       await deleteShop(id);
//       setShops(shops.filter((shop) => shop.id !== id));
//     } catch (error) {
//       console.error("Delete shop error:", error);
//       alert("Failed to delete shop");
//     }
//   };

//   // ===========================
//   // INLINE EDIT SHOP (no navigation)
//   // ===========================
//   const handleStartEditShop = (shop) => {
//     setEditingShopId(shop.id);
//     setEditShopForm({
//       name: shop.name || "",
//       location: shop.location || "",
//       description: shop.description || "",
//       image: null,
//     });

//     let imageUrl = "";
//     if (shop.image) {
//       imageUrl = shop.image.startsWith("http")
//         ? shop.image
//         : `${import.meta.env.VITE_API_URL}${shop.image}`;
//     }
//     setEditShopPreview(imageUrl);
//     setEditShopError("");
//   };

//   const handleCancelEditShop = () => {
//     setEditingShopId(null);
//     setEditShopError("");
//   };

//   const handleEditShopImageChange = (file) => {
//     if (!file) return;
//     setEditShopForm((prev) => ({ ...prev, image: file }));
//     setEditShopPreview(URL.createObjectURL(file));
//   };

//   const handleSaveShopEdit = async (shopId) => {
//     if (!editShopForm.name || !editShopForm.location || !editShopForm.description) {
//       setEditShopError("All fields are required.");
//       return;
//     }
//     setSavingShopEdit(true);
//     setEditShopError("");
//     try {
//       const formData = new FormData();
//       formData.append("name", editShopForm.name);
//       formData.append("location", editShopForm.location);
//       formData.append("description", editShopForm.description);
//       if (editShopForm.image instanceof File) {
//         formData.append("image", editShopForm.image);
//       }
//       await updateShop(shopId, formData);
//       setEditingShopId(null);
//       fetchShops();
//     } catch (err) {
//       console.error("Update shop error:", err.response?.data || err.message);
//       setEditShopError("Failed to update shop.");
//     } finally {
//       setSavingShopEdit(false);
//     }
//   };

//   const handleShopSubmit = async (e) => {
//     e.preventDefault();
//     setShopMessage("");
//     try {
//       const formData = new FormData();
//       formData.append("name", shopForm.name);
//       formData.append("location", shopForm.location);
//       formData.append("description", shopForm.description);
//       if (shopForm.image instanceof File) formData.append("image", shopForm.image);
//       await createShop(formData);
//       setShopMessage("Shop created successfully!");
//       setShopForm({ name: "", location: "", description: "", image: null });
//       document.getElementById("shop-image-input").value = "";
//       fetchShops();
//     } catch (error) {
//       console.error("Create shop error:", error);
//       setShopMessage("Failed to create shop");
//     }
//   };

//   const handleServiceSubmit = async (e) => {
//     e.preventDefault();
//     setServiceMessage("");
//     if (!serviceForm.shop) { setServiceMessage("Please select a shop"); return; }
//     try {
//       await createService(serviceForm);
//       setServiceMessage("Service added successfully!");
//       setServiceForm({ shop: "", name: "", price_per_kg: "" });
//     } catch (error) {
//       console.error("Create service error:", error);
//       setServiceMessage("Failed to create service");
//     }
//   };

//   const fetchShopServices = async (shopId) => {
//     try {
//       const data = await getServices(shopId);
//       setShopServices(prev => ({ ...prev, [shopId]: data.results ?? data }));
//     } catch (err) {
//       console.error("Failed to load services", err);
//     }
//   };

//   const handleEditService = async (serviceId, shopId) => {
//     if (!editingService) return;
//     try {
//       await updateService(serviceId, { name: editingService.name, price_per_kg: editingService.price_per_kg });
//       setEditServiceMessage("Service updated!");
//       setEditingService(null);
//       fetchShopServices(shopId);
//       setTimeout(() => setEditServiceMessage(""), 2000);
//     } catch (err) {
//       setEditServiceMessage("Failed to update service.");
//     }
//   };

//   const handleDeleteService = async (serviceId, shopId) => {
//     if (!window.confirm("Delete this service? This cannot be undone.")) return;
//     try {
//       await deleteService(serviceId);
//       fetchShopServices(shopId);
//     } catch (err) {
//       alert(err.response?.data?.error || "Failed to delete service.");
//     }
//   };

//   const handleLogout = () => { logoutUser(); navigate("/login"); };

//   // ===========================
//   // ORDER MANAGEMENT (inline Orders view)
//   // ===========================
//   const handleStatusUpdate = async (id, status) => {
//     try {
//       await updateOrderStatus(id, status);
//       fetchOrders();
//     } catch (error) {
//       console.error("Update error:", error.response?.data || error.message);
//     }
//   };

//   const handleArchive = async (id) => {
//     if (!window.confirm("Archive this order?")) return;
//     try {
//       await archiveOrder(id);
//       setOrders((prev) => prev.filter((o) => o.id !== id));
//       setArchivedLoaded(false);
//     } catch (err) {
//       console.error("Archive error:", err.response?.data || err.message);
//       alert(err.response?.data?.error || "Couldn't archive this order. Try again.");
//     }
//   };

//   const handleStartDecline = (order) => {
//     setDecliningOrderId(order.id);
//     setDeclineReasonDraft("");
//     setDeclineError("");
//   };

//   const handleCancelDecline = () => {
//     setDecliningOrderId(null);
//     setDeclineReasonDraft("");
//     setDeclineError("");
//   };

//   const handleSubmitDecline = async (orderId) => {
//     const reason = declineReasonDraft.trim();
//     if (!reason) {
//       setDeclineError("Let the customer know why — this is required.");
//       return;
//     }
//     setDecliningSubmitId(orderId);
//     setDeclineError("");
//     try {
//       await declineOrder(orderId, reason);
//       setDecliningOrderId(null);
//       setDeclineReasonDraft("");
//       fetchOrders();
//     } catch (err) {
//       setDeclineError(err.response?.data?.error || "Couldn't decline this order. Try again.");
//     } finally {
//       setDecliningSubmitId(null);
//     }
//   };

//   if (!token || loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full" />
//       </div>
//     );
//   }

//   // Analytics
//   const totalOrders = orders.length;
//   const pendingOrders = orders.filter(o => o.status === "pending").length;
//   const confirmedOrders = orders.filter(o => o.status === "confirmed").length;
//   const washingOrders = orders.filter(o => o.status === "washing").length;
//   const completedOrders = orders.filter(o => o.status === "completed").length;
//   const declinedOrders = orders.filter(o => o.status === "declined").length;
//   const cancelledOrders = orders.filter(o => o.status === "cancelled").length;
//   const paidOrders = orders.filter(o => o.payment_status === "paid");
//   const totalRevenue = paidOrders.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);
//   const uniqueCustomers = new Set(orders.map(o => o.user?.id)).size;
//   const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
//   const thisWeekOrders = orders.filter(o => new Date(o.created_at) >= weekAgo).length;

//   const inputClass = "w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition";

//   return (
//     <div className="min-h-screen bg-gray-50 flex">

//       {/* MOBILE TOPBAR */}
//       <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-700 to-blue-600 text-white flex items-center justify-between px-4 py-3 shadow-lg">
//         <div className="flex items-center gap-2">
//           <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
//             <span className="font-black text-sm">D</span>
//           </div>
//           <span className="font-bold">DryMe</span>
//         </div>
//         <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-white/10">
//           <Menu size={22} />
//         </button>
//       </div>

//       {/* MOBILE OVERLAY */}
//       {sidebarOpen && (
//         <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40 md:hidden" />
//       )}

//       {/* SIDEBAR */}
//       <aside className={`
//         fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-700 to-blue-800 text-white
//         transform transition-transform duration-300 flex flex-col
//         ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
//         md:translate-x-0
//       `}>

//         <div className="flex-1 overflow-y-auto p-6">

//           {/* CLOSE — mobile */}
//           <div className="md:hidden flex justify-end mb-4">
//             <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-white/10">
//               <X size={20} />
//             </button>
//           </div>

//           {/* BRAND */}
//           <div className="flex items-center gap-3 mb-8">
//             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
//               <span className="text-blue-600 font-black text-lg">D</span>
//             </div>
//             <div>
//               <h1 className="font-black text-lg leading-none">DryMe</h1>
//               <p className="text-xs text-blue-200 mt-0.5">Owner Dashboard</p>
//             </div>
//           </div>

//           {/* OWNER CARD */}
//           <div className="bg-white/10 rounded-2xl p-4 mb-6">
//             <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg mb-2">
//               {user?.username?.charAt(0).toUpperCase()}
//             </div>
//             <p className="font-semibold text-sm">{user?.username}</p>
//             <p className="text-xs text-blue-200 mt-0.5">Shop Owner</p>
//           </div>

//           {/* NAV */}
//           <nav>
//             <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-3 px-2">Menu</p>
//             <ul className="space-y-1">
//               {[
//                 { view: "overview", icon: <Home size={17} />, label: "Dashboard" },
//                 { view: "orders", icon: <ShoppingCart size={17} />, label: "Orders", badge: orders.length },
//                 { view: "shops", icon: <Store size={17} />, label: "Shops", badge: shops.length },
//                 { view: "profile", icon: <User size={17} />, label: "Profile" },
//                 { view: "settings", icon: <Settings size={17} />, label: "Settings" },
//               ].map((item) => (
//                 <li key={item.view}>
//                   <button
//                     onClick={() => {
//                       setActiveView(item.view);
//                       setSidebarOpen(false);
//                       if (item.view === "profile" && !profileLoaded) {
//                         fetchProfileData();
//                       }
//                     }}
//                     className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition text-sm font-medium ${
//                       activeView === item.view ? "bg-white/15" : "hover:bg-white/10"
//                     }`}
//                   >
//                     <div className="flex items-center gap-3">
//                       {item.icon}
//                       {item.label}
//                     </div>
//                     {item.badge !== undefined && (
//                       <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
//                         {item.badge}
//                       </span>
//                     )}
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           </nav>
//         </div>

//         {/* LOGOUT */}
//         <div className="p-4 border-t border-white/10">
//           <button
//             onClick={handleLogout}
//             className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-red-500/80 px-4 py-3 rounded-xl transition text-sm font-semibold"
//           >
//             <LogOut size={16} />
//             Logout
//           </button>
//         </div>
//       </aside>

//       {/* MAIN */}
//       <main className="flex-1 md:ml-64 pt-16 md:pt-0 p-5 md:p-8">

//         {/* HEADER */}
//         <div className="mb-8">
//           <h1 className="text-2xl md:text-3xl font-black text-gray-900">
//             {activeView === "overview" ? (
//               <>
//                 {greeting},{" "}
//                 <span className="text-blue-600">
//                   {user?.username?.charAt(0).toUpperCase() + user?.username?.slice(1)}
//                 </span>
//               </>
//             ) : activeView === "shops" ? (
//               "Shops"
//             ) : activeView === "profile" ? (
//               "Profile"
//             ) : activeView === "settings" ? (
//               "Settings"
//             ) : (
//               "Orders"
//             )}
//           </h1>
//           <p className="text-gray-500 mt-1 text-sm">
//             {activeView === "overview"
//               ? "Here's what's happening with your business today."
//               : activeView === "shops"
//               ? `${shops.length} ${shops.length === 1 ? "shop" : "shops"} under your account.`
//               : activeView === "profile"
//               ? "Manage your account details and password."
//               : activeView === "settings"
//               ? "Manage sensitive, irreversible account actions."
//               : `${orders.length} ${orders.length === 1 ? "order" : "orders"} across your shops.`}
//           </p>
//         </div>

//         {activeView === "overview" ? (
//           <>

//         {/* ANALYTICS — TOP ROW */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
//           {[
//             { icon: <ShoppingCart size={18} />, color: "blue", label: "Total Orders", value: totalOrders, sub: `${thisWeekOrders} this week`, onClick: () => setActiveView("orders") },
//             { icon: <TrendingUp size={18} />, color: "green", label: "Revenue", value: `KES ${totalRevenue.toFixed(0)}`, sub: `${paidOrders.length} paid orders` },
//             { icon: <Users size={18} />, color: "purple", label: "Customers", value: uniqueCustomers, sub: "unique customers" },
//             { icon: <Store size={18} />, color: "yellow", label: "My Shops", value: shops.length, sub: "active listings", onClick: () => setActiveView("shops") },
//           ].map((stat) => (
//             <div
//               key={stat.label}
//               onClick={stat.onClick}
//               className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm ${stat.onClick ? "cursor-pointer hover:border-blue-200 hover:shadow-md transition" : ""}`}
//             >
//               <div className="flex items-center gap-3 mb-3">
//                 <div className={`p-2 rounded-xl bg-${stat.color}-100 text-${stat.color}-600`}>
//                   {stat.icon}
//                 </div>
//                 <p className="text-gray-500 text-xs font-medium">{stat.label}</p>
//               </div>
//               <p className="text-2xl font-black text-gray-900">{stat.value}</p>
//               <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
//             </div>
//           ))}
//         </div>

//         {/* STATUS BREAKDOWN */}
//         <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
//           <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-center">
//             <div className="flex justify-center mb-2 text-orange-500"><Clock size={18} /></div>
//             <p className="text-orange-600 text-xs font-bold uppercase tracking-wide">Pending</p>
//             <p className="text-2xl font-black text-orange-700 mt-1">{pendingOrders}</p>
//           </div>
//           <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-center">
//             <div className="flex justify-center mb-2 text-indigo-500"><ThumbsUp size={18} /></div>
//             <p className="text-indigo-600 text-xs font-bold uppercase tracking-wide">Confirmed</p>
//             <p className="text-2xl font-black text-indigo-700 mt-1">{confirmedOrders}</p>
//           </div>
//           <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
//             <div className="flex justify-center mb-2 text-blue-500"><Droplets size={18} /></div>
//             <p className="text-blue-600 text-xs font-bold uppercase tracking-wide">Washing</p>
//             <p className="text-2xl font-black text-blue-700 mt-1">{washingOrders}</p>
//           </div>
//           <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
//             <div className="flex justify-center mb-2 text-green-500"><CheckCircle2 size={18} /></div>
//             <p className="text-green-600 text-xs font-bold uppercase tracking-wide">Completed</p>
//             <p className="text-2xl font-black text-green-700 mt-1">{completedOrders}</p>
//           </div>
//           <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-center">
//             <div className="flex justify-center mb-2 text-rose-500"><XCircle size={18} /></div>
//             <p className="text-rose-600 text-xs font-bold uppercase tracking-wide">Declined</p>
//             <p className="text-2xl font-black text-rose-700 mt-1">{declinedOrders}</p>
//           </div>
//           <div className="bg-gray-100 border border-gray-200 rounded-2xl p-4 text-center">
//             <div className="flex justify-center mb-2 text-gray-500"><Ban size={18} /></div>
//             <p className="text-gray-600 text-xs font-bold uppercase tracking-wide">Cancelled</p>
//             <p className="text-2xl font-black text-gray-700 mt-1">{cancelledOrders}</p>
//           </div>
//         </div>


//         {/* RECENT ORDERS */}
//         <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
//           <div className="flex items-center justify-between mb-5">
//             <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
//             <button onClick={() => setActiveView("orders")} className="text-xs font-semibold text-blue-600 hover:underline">View all →</button>
//           </div>

//           {orders.length === 0 ? (
//             <div className="text-center py-10 text-gray-400 text-sm">
//               <ShoppingCart size={28} className="mx-auto mb-3 text-gray-200" />
//               No orders yet
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {orders.slice(0, 5).map((order) => (
//                 <div key={order.id} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
//                   <div>
//                     <p className="text-sm font-bold text-gray-800">{order.user?.username}</p>
//                     <p className="text-xs text-gray-500 mt-0.5">{order.service?.name} — {order.shop?.name}</p>
//                     <p className="text-xs font-semibold text-blue-600 mt-0.5">KES {order.total_price}</p>
//                   </div>
//                   <div className="flex flex-col items-end gap-1">
//                     <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
//                       order.status === "completed" ? "bg-green-100 text-green-700"
//                       : order.status === "washing" ? "bg-blue-100 text-blue-700"
//                       : order.status === "confirmed" ? "bg-indigo-100 text-indigo-700"
//                       : order.status === "declined" ? "bg-rose-100 text-rose-700"
//                       : order.status === "cancelled" ? "bg-gray-200 text-gray-600"
//                       : "bg-orange-100 text-orange-700"
//                     }`}>
//                       {order.status}
//                     </span>
//                     <span className={`text-xs px-2 py-0.5 rounded-full ${
//                       order.payment_status === "paid" ? "bg-green-50 text-green-600"
//                       : order.payment_status === "pending_payment" ? "bg-yellow-50 text-yellow-600"
//                       : "bg-red-50 text-red-500"
//                     }`}>
//                       {order.payment_status}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </section>
//           </>
//         ) : activeView === "shops" ? (

//           <>
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

//           {/* MY SHOPS */}
//           <section className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
//             <div className="flex items-center justify-between mb-5">
//               <h2 className="text-lg font-bold text-gray-800">My Shops</h2>
//               <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{shops.length} shops</span>
//             </div>

//             {shops.length === 0 ? (
//               <div className="text-center py-10 text-gray-400">
//                 <Store size={32} className="mx-auto mb-3 text-gray-200" />
//                 <p className="text-sm">No shops yet — create one below</p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {shops.map((shop) => (
//                   <div key={shop.id} className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition">
//                     <div className="h-44 bg-gray-100 overflow-hidden">
//                       {shop.image ? (
//                         <img src={shop.image} alt={shop.name} className="w-full h-full object-cover" />
//                       ) : (
//                         <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
//                           <ImageIcon size={32} />
//                           <p className="text-xs mt-2">No Image</p>
//                         </div>
//                       )}
//                     </div>
//                     <div className="p-4">
//                       {editingShopId === shop.id ? (
//                         <div className="space-y-3">
//                           <input type="text" placeholder="Shop Name" value={editShopForm.name}
//                             onChange={(e) => setEditShopForm({ ...editShopForm, name: e.target.value })}
//                             className={inputClass} />
//                           <input type="text" placeholder="Location" value={editShopForm.location}
//                             onChange={(e) => setEditShopForm({ ...editShopForm, location: e.target.value })}
//                             className={inputClass} />
//                           <textarea rows={3} placeholder="Description" value={editShopForm.description}
//                             onChange={(e) => setEditShopForm({ ...editShopForm, description: e.target.value })}
//                             className={`${inputClass} resize-none`} />

//                           {editShopPreview && (
//                             <img src={editShopPreview} alt="Preview" className="w-full h-32 object-cover rounded-xl border border-gray-100" />
//                           )}

//                           <div>
//                             <label className="block text-xs font-semibold text-gray-600 mb-1.5">Replace Image</label>
//                             <input type="file" accept="image/*"
//                               onChange={(e) => handleEditShopImageChange(e.target.files[0])}
//                               className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100" />
//                           </div>

//                           {editShopError && (
//                             <p className="text-xs text-red-500 bg-red-50 px-2 py-1.5 rounded-lg">{editShopError}</p>
//                           )}

//                           <div className="flex gap-2">
//                             <button
//                               onClick={() => handleSaveShopEdit(shop.id)}
//                               disabled={savingShopEdit}
//                               className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-2.5 rounded-xl font-bold text-xs transition disabled:opacity-50"
//                             >
//                               {savingShopEdit ? "Saving..." : "Save Changes"}
//                             </button>
//                             <button
//                               onClick={handleCancelEditShop}
//                               disabled={savingShopEdit}
//                               className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-700 border border-gray-200"
//                             >
//                               Cancel
//                             </button>
//                           </div>
//                         </div>
//                       ) : (
//                         <>
//                           <div className="flex items-start justify-between gap-3">
//                             <div>
//                               <h3 className="font-bold text-gray-900">{shop.name}</h3>
//                               <p className="text-xs text-gray-400 mt-0.5">{shop.location}</p>
//                             </div>
//                             <div className="flex gap-2 shrink-0">
//                               <button
//                                 onClick={() => handleStartEditShop(shop)}
//                                 className="flex items-center gap-1.5 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
//                               >
//                                 <Edit2 size={12} /> Edit
//                               </button>
//                               <button
//                                 onClick={() => handleDelete(shop.id)}
//                                 className="flex items-center gap-1.5 border border-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-50 transition"
//                               >
//                                 <Trash2 size={12} /> Delete
//                               </button>
//                             </div>
//                           </div>
//                           <p className="text-sm text-gray-500 mt-2">{shop.description}</p>

//                           {/* SERVICES */}
//                           <div className="mt-4 pt-3 border-t border-gray-50">
//                             <div className="flex items-center justify-between mb-2">
//                               <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Services</p>
//                               <button
//                                 onClick={() => {
//                                   if (shopServices[shop.id]) {
//                                     setShopServices(prev => {
//                                       const updated = { ...prev };
//                                       delete updated[shop.id];
//                                       return updated;
//                                     });
//                                   } else {
//                                     fetchShopServices(shop.id);
//                                   }
//                                 }}
//                                 className="text-xs text-blue-500 hover:underline font-medium"
//                               >
//                                 {shopServices[shop.id] ? "Hide" : "Load"}
//                               </button>
//                             </div>

//                             {editServiceMessage && (
//                               <p className="text-xs text-green-600 mb-2 bg-green-50 px-2 py-1 rounded-lg">{editServiceMessage}</p>
//                             )}

//                             <div className="space-y-1.5">
//                               {(shopServices[shop.id] || []).map((service) => (
//                                 <div key={service.id}>
//                                   {editingService?.id === service.id ? (
//                                     <div className="flex gap-2 items-center bg-blue-50 rounded-xl p-2">
//                                       <input
//                                         type="text"
//                                         value={editingService.name}
//                                         onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
//                                         className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs flex-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
//                                       />
//                                       <input
//                                         type="number"
//                                         value={editingService.price_per_kg}
//                                         onChange={(e) => setEditingService({ ...editingService, price_per_kg: e.target.value })}
//                                         className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs w-20 focus:outline-none focus:ring-1 focus:ring-blue-400"
//                                       />
//                                       <button
//                                         onClick={() => handleEditService(service.id, shop.id)}
//                                         className="text-xs bg-blue-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-blue-700"
//                                       >Save</button>
//                                       <button
//                                         onClick={() => setEditingService(null)}
//                                         className="text-xs text-gray-500 hover:underline"
//                                       >Cancel</button>
//                                     </div>
//                                   ) : (
//                                     <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
//                                       <div>
//                                         <span className="text-sm font-semibold text-gray-800">{service.name}</span>
//                                         <span className="text-xs text-gray-400 ml-2">KES {service.price_per_kg}/kg</span>
//                                       </div>
//                                       <div className="flex gap-3">
//                                         <button
//                                           onClick={() => setEditingService({ id: service.id, name: service.name, price_per_kg: service.price_per_kg })}
//                                           className="text-xs text-blue-500 hover:underline font-medium"
//                                         >Edit</button>
//                                         <button
//                                           onClick={() => handleDeleteService(service.id, shop.id)}
//                                           className="text-xs text-red-500 hover:underline font-medium"
//                                         >Delete</button>
//                                       </div>
//                                     </div>
//                                   )}
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         </>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </section>

//           {/* ADD SHOP */}
//           <aside className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit">
//             <div className="flex items-center justify-between mb-5">
//               <h2 className="text-lg font-bold text-gray-800">Add Shop</h2>
//               <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
//                 <PlusCircle size={18} />
//               </div>
//             </div>
//             <form onSubmit={handleShopSubmit} className="space-y-3">
//               <input type="text" placeholder="Shop Name" required value={shopForm.name}
//                 onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
//                 className={inputClass} />
//               <input type="text" placeholder="Location" required value={shopForm.location}
//                 onChange={(e) => setShopForm({ ...shopForm, location: e.target.value })}
//                 className={inputClass} />
//               <textarea rows={3} placeholder="Description" required value={shopForm.description}
//                 onChange={(e) => setShopForm({ ...shopForm, description: e.target.value })}
//                 className={`${inputClass} resize-none`} />
//               <div>
//                 <label className="block text-xs font-semibold text-gray-600 mb-1.5">Shop Image</label>
//                 <input id="shop-image-input" type="file" accept="image/*"
//                   onChange={(e) => setShopForm({ ...shopForm, image: e.target.files[0] })}
//                   className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100" />
//               </div>
//               <button type="submit"
//                 className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-3 rounded-xl font-bold text-sm transition shadow-sm shadow-blue-100">
//                 Create Shop
//               </button>
//             </form>
//             {shopMessage && (
//               <p className={`mt-3 text-xs text-center font-medium ${shopMessage.includes("success") ? "text-green-600" : "text-red-500"}`}>
//                 {shopMessage}
//               </p>
//             )}
//           </aside>
//         </div>

//         {/* ADD SERVICE */}
//         <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
//           <div className="flex items-center justify-between mb-5">
//             <h2 className="text-lg font-bold text-gray-800">Add Service</h2>
//             <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
//               <Tag size={18} />
//             </div>
//           </div>
//           <form onSubmit={handleServiceSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
//             <select value={serviceForm.shop}
//               onChange={(e) => setServiceForm({ ...serviceForm, shop: e.target.value })}
//               className={inputClass}>
//               <option value="">Select Shop</option>
//               {shops.map((shop) => (
//                 <option key={shop.id} value={shop.id}>{shop.name}</option>
//               ))}
//             </select>
//             <input type="text" placeholder="Service Name" value={serviceForm.name}
//               onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
//               className={inputClass} />
//             <input type="number" placeholder="Price per kg (KES)" value={serviceForm.price_per_kg}
//               onChange={(e) => setServiceForm({ ...serviceForm, price_per_kg: e.target.value })}
//               className={inputClass} />
//             <button type="submit"
//               className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl font-bold text-sm transition py-3 shadow-sm shadow-blue-100">
//               Add Service
//             </button>
//           </form>
//           {serviceMessage && (
//             <p className={`mt-3 text-xs font-medium ${serviceMessage.includes("success") ? "text-green-600" : "text-red-500"}`}>
//               {serviceMessage}
//             </p>
//           )}
//         </section>
//           </>

//         ) : activeView === "profile" ? (

//           <>
//           {/* ===========================
//               PROFILE VIEW (inline, no navigation)
//               =========================== */}
//           {loadingProfile || !profileData ? (
//             <div className="text-center py-16 text-gray-400 text-sm">
//               Loading your profile...
//             </div>
//           ) : (
//             <div className="max-w-2xl space-y-6">

//               {/* ACCOUNT DETAILS */}
//               <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
//                 <div className="flex items-center justify-between mb-5">
//                   <h2 className="font-bold text-lg text-gray-900">Account details</h2>
//                   {!editingProfile && (
//                     <button
//                       onClick={handleStartEditProfile}
//                       className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800"
//                     >
//                       <Edit2 size={14} /> Edit
//                     </button>
//                   )}
//                 </div>

//                 {!editingProfile ? (
//                   <div className="space-y-4">
//                     <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
//                       <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><User size={15} /></div>
//                       <div className="min-w-0">
//                         <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Username</p>
//                         <p className="text-sm font-medium text-gray-800 truncate">{profileData.username}</p>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
//                       <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Mail size={15} /></div>
//                       <div className="min-w-0">
//                         <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Email</p>
//                         <p className="text-sm font-medium text-gray-800 truncate">{profileData.email}</p>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
//                       <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Phone size={15} /></div>
//                       <div className="min-w-0">
//                         <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Phone</p>
//                         <p className="text-sm font-medium text-gray-800 truncate">{profileData.phone || "Not set"}</p>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-3 py-2.5">
//                       <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><MapPin size={15} /></div>
//                       <div className="min-w-0">
//                         <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Shop location</p>
//                         <p className="text-sm font-medium text-gray-800 truncate">{profileData.location || "Not set"}</p>
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     <div>
//                       <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Username</label>
//                       <input value={profileDraft.username}
//                         onChange={(e) => setProfileDraft((d) => ({ ...d, username: e.target.value }))}
//                         className={inputClass} />
//                     </div>
//                     <div>
//                       <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Email</label>
//                       <input value={profileData.email} disabled
//                         className={`${inputClass} bg-gray-50 text-gray-400 cursor-not-allowed`} />
//                     </div>
//                     <div>
//                       <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Phone</label>
//                       <input value={profileDraft.phone} placeholder="e.g. 0712 345 678"
//                         onChange={(e) => setProfileDraft((d) => ({ ...d, phone: e.target.value }))}
//                         className={inputClass} />
//                     </div>
//                     <div>
//                       <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Shop location</label>
//                       <input value={profileDraft.location} placeholder="e.g. Kilimani, Nairobi"
//                         onChange={(e) => setProfileDraft((d) => ({ ...d, location: e.target.value }))}
//                         className={inputClass} />
//                     </div>

//                     {profileError && <p className="text-xs text-red-500 bg-red-50 px-2 py-1.5 rounded-lg">{profileError}</p>}

//                     <div className="flex gap-2 pt-1">
//                       <button
//                         onClick={handleSaveProfile}
//                         disabled={savingProfile}
//                         className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition disabled:opacity-50"
//                       >
//                         <Check size={15} /> {savingProfile ? "Saving..." : "Save changes"}
//                       </button>
//                       <button
//                         onClick={handleCancelEditProfile}
//                         disabled={savingProfile}
//                         className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:text-gray-700"
//                       >
//                         Cancel
//                       </button>
//                     </div>
//                   </div>
//                 )}

//                 {profileSuccess && !editingProfile && (
//                   <p className="text-xs text-green-600 font-medium mt-4">{profileSuccess}</p>
//                 )}
//               </section>

//               {/* CHANGE PASSWORD */}
//               <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
//                 <div className="flex items-center gap-2 mb-5">
//                   <Lock size={16} className="text-blue-600" />
//                   <h2 className="font-bold text-lg text-gray-900">Change password</h2>
//                 </div>

//                 <form onSubmit={handleChangePassword} className="space-y-4">
//                   <div>
//                     <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Current password</label>
//                     <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className={inputClass} />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">New password</label>
//                     <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} />
//                     <p className="text-[11px] text-gray-400 mt-1">At least 8 characters</p>
//                   </div>
//                   <div>
//                     <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Confirm new password</label>
//                     <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} />
//                   </div>

//                   {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
//                   {passwordSuccess && <p className="text-xs text-green-600 font-medium">{passwordSuccess}</p>}

//                   <button
//                     type="submit"
//                     disabled={changingPassword}
//                     className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition disabled:opacity-50"
//                   >
//                     <Lock size={14} /> {changingPassword ? "Updating..." : "Update password"}
//                   </button>
//                 </form>
//               </section>
//             </div>
//           )}
//           </>

//         ) : activeView === "settings" ? (

//           <>
//           {/* ===========================
//               SETTINGS VIEW — Danger Zone
//               =========================== */}
//           <div className="max-w-2xl">
//             <section className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
//               <div className="flex items-center gap-2 mb-2">
//                 <AlertTriangle size={18} className="text-red-500" />
//                 <h2 className="font-bold text-lg text-gray-900">Danger Zone</h2>
//               </div>
//               <p className="text-sm text-gray-500 mb-5">
//                 These actions are permanent and can't be undone. Deleting a shop also removes its services
//                 and cannot be recovered.
//               </p>

//               {shops.length === 0 ? (
//                 <p className="text-sm text-gray-400 py-6 text-center">You have no shops to manage.</p>
//               ) : (
//                 <div className="space-y-2">
//                   {shops.map((shop) => (
//                     <div
//                       key={shop.id}
//                       className="flex items-center justify-between gap-3 p-4 border border-red-100 bg-red-50/40 rounded-xl"
//                     >
//                       <div className="min-w-0">
//                         <p className="font-semibold text-gray-900 truncate">{shop.name}</p>
//                         <p className="text-xs text-gray-500">{shop.location}</p>
//                       </div>
//                       <button
//                         onClick={() => handleDelete(shop.id)}
//                         className="flex items-center gap-1.5 shrink-0 border border-red-200 text-red-600 px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition"
//                       >
//                         <Trash2 size={13} /> Delete Shop
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </section>
//           </div>
//           </>

//         ) : (

//           /* ===========================
//              ORDERS VIEW (inline, no navigation)
//              =========================== */
//           <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

//             {/* FILTER TABS */}
//             <div className="flex flex-wrap gap-2 mb-6">
//               {[
//                 { key: "all", label: "All", count: orders.length },
//                 { key: "pending", label: "Pending", count: pendingOrders },
//                 { key: "confirmed", label: "Confirmed", count: confirmedOrders },
//                 { key: "washing", label: "Washing", count: washingOrders },
//                 { key: "completed", label: "Completed", count: completedOrders },
//                 { key: "declined", label: "Declined", count: declinedOrders },
//                 { key: "cancelled", label: "Cancelled", count: cancelledOrders },
//                 { key: "archived", label: "Archived", count: archivedLoaded ? archivedOrders.length : null },
//               ].map((f) => (
//                 <button
//                   key={f.key}
//                   onClick={() => {
//                     setOrderFilter(f.key);
//                     if (f.key === "archived" && !archivedLoaded) {
//                       fetchArchivedOrders();
//                     }
//                   }}
//                   className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition ${
//                     orderFilter === f.key
//                       ? "bg-blue-600 text-white"
//                       : "bg-gray-100 text-gray-500 hover:bg-gray-200"
//                   }`}
//                 >
//                   {f.label}
//                   {f.count !== null && (
//                     <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
//                       orderFilter === f.key ? "bg-white/20" : "bg-white text-gray-400"
//                     }`}>
//                       {f.count}
//                     </span>
//                   )}
//                 </button>
//               ))}
//             </div>

//             {orderFilter === "archived" && loadingArchived ? (
//               <div className="text-center py-16 text-gray-400 text-sm">
//                 Loading archived orders...
//               </div>
//             ) : (() => {
//               const filteredOrders = orderFilter === "all"
//                 ? orders
//                 : orderFilter === "archived"
//                 ? archivedOrders
//                 : orders.filter((o) => o.status === orderFilter);

//               if (filteredOrders.length === 0) {
//                 return (
//                   <div className="text-center py-16 text-gray-400 text-sm">
//                     <ShoppingCart size={28} className="mx-auto mb-3 text-gray-200" />
//                     No orders here
//                   </div>
//                 );
//               }

//               return (
//                 <div className="space-y-4">
//                   {filteredOrders.map((order) => (
//                     <div key={order.id} className="border border-gray-100 rounded-2xl overflow-hidden">

//                       <div className={`h-1 w-full ${
//                         order.status === "completed" ? "bg-green-400"
//                         : order.status === "washing" ? "bg-blue-400"
//                         : order.status === "confirmed" ? "bg-indigo-400"
//                         : order.status === "declined" ? "bg-rose-400"
//                         : order.status === "cancelled" ? "bg-gray-400"
//                         : "bg-orange-300"
//                       }`} />

//                       <div className="p-4">
//                         <div className="flex items-start justify-between gap-3 mb-3">
//                           <div>
//                             <p className="text-sm font-bold text-gray-800">{order.user?.username}</p>
//                             <p className="text-xs text-gray-500 mt-0.5">{order.service?.name} — {order.shop?.name}</p>
//                             <p className="text-xs font-semibold text-blue-600 mt-0.5">
//                               KES {order.total_price} · {order.weight} kg
//                             </p>
//                           </div>
//                           <div className="flex flex-col items-end gap-1 shrink-0">
//                             <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
//                               order.status === "completed" ? "bg-green-100 text-green-700"
//                               : order.status === "washing" ? "bg-blue-100 text-blue-700"
//                               : order.status === "confirmed" ? "bg-indigo-100 text-indigo-700"
//                               : order.status === "declined" ? "bg-rose-100 text-rose-700"
//                               : order.status === "cancelled" ? "bg-gray-200 text-gray-600"
//                               : "bg-orange-100 text-orange-700"
//                             }`}>
//                               {order.status}
//                             </span>
//                             {order.owner_archived && (
//                               <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-semibold">
//                                 Archived
//                               </span>
//                             )}
//                             <span className={`text-xs px-2 py-0.5 rounded-full ${
//                               order.payment_status === "paid" ? "bg-green-50 text-green-600"
//                               : order.payment_status === "pending_payment" ? "bg-yellow-50 text-yellow-600"
//                               : "bg-red-50 text-red-500"
//                             }`}>
//                               {order.payment_status}
//                             </span>
//                           </div>
//                         </div>

//                         {order.status === "declined" && order.decline_reason && (
//                           <div className="mb-3 p-3 border border-rose-200 bg-rose-50/70 rounded-xl">
//                             <p className="text-xs font-bold text-rose-800 uppercase tracking-wide mb-1">You declined this order</p>
//                             <p className="text-sm text-gray-700">{order.decline_reason}</p>
//                             {order.refund_needed && (
//                               <p className="text-xs text-amber-700 font-medium mt-2 pt-2 border-t border-rose-200/70">
//                                 ⚠ Already paid — process a manual M-Pesa refund.
//                               </p>
//                             )}
//                           </div>
//                         )}

//                         {order.status === "cancelled" && (
//                           <div className="mb-3 p-3 border border-gray-200 bg-gray-50 rounded-xl">
//                             <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
//                               <Ban size={12} className="inline mr-1" /> Customer cancelled this order
//                             </p>
//                             {order.refund_needed && (
//                               <p className="text-xs text-amber-700 font-medium mt-2 pt-2 border-t border-gray-200">
//                                 ⚠ Already paid — process a manual M-Pesa refund.
//                               </p>
//                             )}
//                           </div>
//                         )}

//                         {/* ACTIONS */}
//                         {order.status !== "declined" && order.status !== "cancelled" && !order.owner_archived && (
//                           <div className="flex flex-wrap items-center gap-2">
//                             {order.status === "pending" && (
//                               <>
//                                 <button onClick={() => handleStatusUpdate(order.id, "confirmed")}
//                                   className="px-3.5 py-1.5 text-xs font-bold rounded-full text-white bg-indigo-600 hover:bg-indigo-700">
//                                   <ThumbsUp size={11} className="inline mr-1" /> Accept
//                                 </button>
//                                 <button onClick={() => handleStartDecline(order)}
//                                   className="px-3.5 py-1.5 text-xs font-bold rounded-full bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100">
//                                   <XCircle size={11} className="inline mr-1" /> Decline
//                                 </button>
//                               </>
//                             )}
//                             {order.status === "confirmed" && (
//                               <>
//                                 <button onClick={() => handleStatusUpdate(order.id, "washing")}
//                                   className="px-3.5 py-1.5 text-xs font-bold rounded-full text-white bg-blue-500 hover:bg-blue-600">
//                                   <Droplets size={11} className="inline mr-1" /> Start Washing
//                                 </button>
//                                 <button onClick={() => handleStartDecline(order)}
//                                   className="px-3.5 py-1.5 text-xs font-bold rounded-full bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100">
//                                   <XCircle size={11} className="inline mr-1" /> Decline
//                                 </button>
//                               </>
//                             )}
//                             {order.status === "washing" && (
//                               <button onClick={() => handleStatusUpdate(order.id, "completed")}
//                                 className="px-3.5 py-1.5 text-xs font-bold rounded-full text-white bg-emerald-600 hover:bg-emerald-700">
//                                 <CheckCircle2 size={11} className="inline mr-1" /> Mark Completed
//                               </button>
//                             )}
//                             {order.status === "completed" && !order.owner_archived && (
//                               <button onClick={() => handleArchive(order.id)}
//                                 className="ml-auto flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full bg-gray-800 hover:bg-gray-900 text-white">
//                                 <Archive size={12} /> Archive
//                               </button>
//                             )}
//                           </div>
//                         )}

//                         {(order.status === "declined" || order.status === "cancelled") && !order.owner_archived && (
//                           <button onClick={() => handleArchive(order.id)}
//                             className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full bg-gray-800 hover:bg-gray-900 text-white">
//                             <Archive size={12} /> Archive
//                           </button>
//                         )}

//                         {/* INLINE DECLINE FORM */}
//                         {decliningOrderId === order.id && (
//                           <div className="mt-3 p-4 border border-rose-200 bg-rose-50/60 rounded-2xl">
//                             <label className="flex items-center gap-1.5 text-xs font-bold text-rose-800 uppercase tracking-wide mb-2">
//                               <XCircle size={13} /> Reason for declining (required)
//                             </label>
//                             <textarea
//                               value={declineReasonDraft}
//                               onChange={(e) => setDeclineReasonDraft(e.target.value)}
//                               maxLength={500}
//                               rows={3}
//                               placeholder="e.g. Fully booked today... The customer will see this."
//                               className="w-full text-sm border border-rose-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
//                               autoFocus
//                             />
//                             <div className="flex items-center justify-between mt-2">
//                               <span className="text-[11px] text-rose-700/60">{declineReasonDraft.length}/500</span>
//                               <div className="flex gap-2">
//                                 <button onClick={handleCancelDecline} className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700">
//                                   Cancel
//                                 </button>
//                                 <button
//                                   onClick={() => handleSubmitDecline(order.id)}
//                                   disabled={decliningSubmitId === order.id}
//                                   className="px-4 py-1.5 text-xs font-bold rounded-full bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50"
//                                 >
//                                   {decliningSubmitId === order.id ? "Declining..." : "Confirm decline"}
//                                 </button>
//                               </div>
//                             </div>
//                             {declineError && <p className="text-xs text-rose-600 mt-2">{declineError}</p>}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               );
//             })()}
//           </section>
//         )}

//       </main>
//     </div>
//   );
// };

// export default Dashboard;