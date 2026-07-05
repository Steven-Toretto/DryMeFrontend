import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getProfile, updateProfile, changePassword } from "../api";
import {
  User, Phone, MapPin, Mail, Lock, Pencil, X, Check,
  ShoppingBag, Clock, CheckCircle2, XCircle, Wallet,
  Store, TrendingUp, Sparkles, Shirt,
} from "lucide-react";

function Profile() {
  const { user, updateUser } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // ===========================
  // ACCOUNT DETAILS — edit state
  // ===========================
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ username: "", phone: "", location: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // ===========================
  // PASSWORD — form state
  // ===========================
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      const { stats: statsData, ...profileData } = data;
      setProfile(profileData);
      setStats(statsData);
      setDraft({
        username: profileData.username || "",
        phone: profileData.phone || "",
        location: profileData.location || "",
      });
    } catch (err) {
      setLoadError("Couldn't load your profile. Try refreshing the page.");
      console.error("Profile fetch error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const formatDate = (dt) => {
    if (!dt) return "—";
    return new Date(dt).toLocaleDateString("en-KE", {
      month: "long", year: "numeric",
    });
  };

  // ===========================
  // ACCOUNT DETAILS HANDLERS
  // ===========================
  const handleStartEdit = () => {
    setDraft({
      username: profile.username || "",
      phone: profile.phone || "",
      location: profile.location || "",
    });
    setProfileError("");
    setProfileSuccess("");
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setProfileError("");
  };

  const handleSaveProfile = async () => {
    if (!draft.username.trim()) {
      setProfileError("Username can't be empty.");
      return;
    }
    setSavingProfile(true);
    setProfileError("");
    try {
      const updated = await updateProfile({
        username: draft.username.trim(),
        phone: draft.phone.trim(),
        location: draft.location.trim(),
      });
      setProfile((prev) => ({ ...prev, ...updated }));
      updateUser({
        username: updated.username,
        phone: updated.phone,
        location: updated.location,
      });
      setEditing(false);
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

  // ===========================
  // PASSWORD HANDLERS
  // ===========================
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

  // ===========================
  // LOADING
  // ===========================
  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50/40">
        <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="h-8 w-40 bg-white/20 rounded-xl animate-pulse mb-2" />
            <div className="h-4 w-24 bg-white/10 rounded-xl animate-pulse" />
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-5">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-[28px] border border-blue-900/5 p-6 animate-pulse h-40" />
          ))}
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-blue-50/40 flex items-center justify-center p-6">
        <div className="bg-white rounded-[28px] border border-blue-900/5 p-10 text-center max-w-sm">
          <XCircle size={28} className="text-rose-400 mx-auto mb-3" />
          <p className="font-semibold text-slate-700">{loadError}</p>
        </div>
      </div>
    );
  }

  const isOwner = profile.role === "owner";

  return (
    <div className="min-h-screen bg-blue-50/40">

      {/* HERO */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 py-16 px-6 relative overflow-hidden">
        <div className="absolute -top-8 right-10 w-40 h-40 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute top-16 right-32 w-16 h-16 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute -bottom-10 left-0 w-52 h-52 rounded-full bg-white/5 pointer-events-none" />

        <div className="max-w-3xl mx-auto relative z-10 flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center text-3xl font-black text-white shrink-0">
            {profile.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 text-blue-100 text-xs font-bold tracking-widest uppercase mb-1.5">
              <Sparkles size={12} />
              {isOwner ? "Shop Owner" : "Customer"}
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              {profile.username}
            </h1>
            <p className="text-blue-50/80 text-sm mt-1 font-medium">
              Member since {formatDate(profile.date_joined)}
            </p>
          </div>
        </div>

        <svg className="absolute bottom-0 left-0 w-full text-blue-50" viewBox="0 0 1440 40" preserveAspectRatio="none" style={{ height: "24px" }}>
          <path d="M0,20 C240,40 480,0 720,15 C960,30 1200,5 1440,20 L1440,40 L0,40 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* STATS */}
        {isOwner ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatCard icon={<Store size={16} />} label="Shops" value={stats.shops_count} color="blue" />
            <StatCard icon={<ShoppingBag size={16} />} label="Total orders" value={stats.total_orders} color="blue" />
            <StatCard icon={<Clock size={16} />} label="Active" value={stats.active_orders} color="amber" />
            <StatCard icon={<CheckCircle2 size={16} />} label="Completed" value={stats.completed_orders} color="emerald" />
            <StatCard icon={<XCircle size={16} />} label="Declined" value={stats.declined_orders} color="rose" />
            <StatCard icon={<TrendingUp size={16} />} label="Revenue" value={`KES ${stats.revenue}`} color="indigo" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={<ShoppingBag size={16} />} label="Total orders" value={stats.total_orders} color="blue" />
            <StatCard icon={<Clock size={16} />} label="Active" value={stats.active_orders} color="amber" />
            <StatCard icon={<CheckCircle2 size={16} />} label="Completed" value={stats.completed_orders} color="emerald" />
            <StatCard icon={<Wallet size={16} />} label="Total spent" value={`KES ${stats.total_spent}`} color="indigo" />
          </div>
        )}

        {/* ACCOUNT DETAILS */}
        <div className="bg-white rounded-[28px] border border-blue-900/5 shadow-md p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-lg text-slate-900">Account details</h2>
            {!editing && (
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-900"
              >
                <Pencil size={14} /> Edit
              </button>
            )}
          </div>

          {!editing ? (
            <div className="space-y-4">
              <DetailRow icon={<User size={15} />} label="Username" value={profile.username} />
              <DetailRow icon={<Mail size={15} />} label="Email" value={profile.email} />
              <DetailRow icon={<Phone size={15} />} label="Phone" value={profile.phone || "Not set"} />
              <DetailRow icon={<MapPin size={15} />} label="Location" value={profile.location || "Not set"} />
            </div>
          ) : (
            <div className="space-y-4">
              <Field label="Username">
                <input
                  value={draft.username}
                  onChange={(e) => setDraft((d) => ({ ...d, username: e.target.value }))}
                  className="w-full text-sm border border-blue-100 rounded-xl px-3.5 py-2.5 bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </Field>

              <Field label="Email">
                <input
                  value={profile.email}
                  disabled
                  className="w-full text-sm border border-slate-100 rounded-xl px-3.5 py-2.5 bg-slate-50 text-slate-400 cursor-not-allowed"
                />
              </Field>

              <Field label="Phone" hint="Used for delivery coordination">
                <input
                  value={draft.phone}
                  onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                  placeholder="e.g. 0712 345 678"
                  className="w-full text-sm border border-blue-100 rounded-xl px-3.5 py-2.5 bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </Field>

              <Field label="Location" hint={isOwner ? "Where your shop operates" : "Your default pickup location"}>
                <input
                  value={draft.location}
                  onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
                  placeholder="e.g. Kilimani, Nairobi"
                  className="w-full text-sm border border-blue-100 rounded-xl px-3.5 py-2.5 bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </Field>

              {profileError && <p className="text-xs text-rose-600">{profileError}</p>}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold rounded-full bg-blue-700 hover:bg-blue-800 text-white transition disabled:opacity-50"
                >
                  <Check size={15} /> {savingProfile ? "Saving..." : "Save changes"}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={savingProfile}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-full text-slate-500 hover:text-slate-700 transition"
                >
                  <X size={15} /> Cancel
                </button>
              </div>
            </div>
          )}

          {profileSuccess && !editing && (
            <p className="text-xs text-emerald-600 font-medium mt-4">{profileSuccess}</p>
          )}
        </div>

        {/* CHANGE PASSWORD */}
        <div className="bg-white rounded-[28px] border border-blue-900/5 shadow-md p-6">
          <div className="flex items-center gap-2 mb-5">
            <Lock size={16} className="text-blue-700" />
            <h2 className="font-bold text-lg text-slate-900">Change password</h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <Field label="Current password">
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full text-sm border border-blue-100 rounded-xl px-3.5 py-2.5 bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </Field>

            <Field label="New password" hint="At least 8 characters">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full text-sm border border-blue-100 rounded-xl px-3.5 py-2.5 bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </Field>

            <Field label="Confirm new password">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-sm border border-blue-100 rounded-xl px-3.5 py-2.5 bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </Field>

            {passwordError && <p className="text-xs text-rose-600">{passwordError}</p>}
            {passwordSuccess && <p className="text-xs text-emerald-600 font-medium">{passwordSuccess}</p>}

            <button
              type="submit"
              disabled={changingPassword}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold rounded-full bg-blue-700 hover:bg-blue-800 text-white transition disabled:opacity-50"
            >
              <Lock size={14} /> {changingPassword ? "Updating..." : "Update password"}
            </button>
          </form>
        </div>

        {/* FOOTER FLOURISH */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-blue-900/30 font-medium pt-2">
          <Shirt size={12} /> DryMe account
        </div>

      </div>
    </div>
  );
}

// ===========================
// SMALL PRESENTATIONAL PIECES
// ===========================
function StatCard({ icon, label, value, color }) {
  const colors = {
    blue: "bg-blue-50 border-blue-100 text-blue-600",
    amber: "bg-amber-50 border-amber-100 text-amber-600",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-600",
    rose: "bg-rose-50 border-rose-100 text-rose-600",
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-600",
  };
  return (
    <div className={`border rounded-2xl p-4 text-center ${colors[color]}`}>
      <div className="flex justify-center mb-1.5">{icon}</div>
      <p className="text-[11px] font-bold uppercase tracking-wide opacity-80">{label}</p>
      <p className="text-lg font-black mt-0.5">{value}</p>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-blue-900/5 last:border-0">
      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-slate-800 truncate">{value}</p>
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

export default Profile;


// import { useEffect, useState, useContext } from "react";
// import { AuthContext } from "../context/AuthContext";
// import { getProfile, updateProfile, changePassword } from "../api";
// import {
//   User, Phone, MapPin, Mail, Lock, Pencil, X, Check,
//   ShoppingBag, Clock, CheckCircle2, XCircle, Wallet,
//   Store, TrendingUp, Sparkles, Shirt,
// } from "lucide-react";

// function Profile() {
//   const { user, updateUser } = useContext(AuthContext);

//   const [profile, setProfile] = useState(null);
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [loadError, setLoadError] = useState("");

//   // ===========================
//   // ACCOUNT DETAILS — edit state
//   // ===========================
//   const [editing, setEditing] = useState(false);
//   const [draft, setDraft] = useState({ username: "", phone: "", location: "" });
//   const [savingProfile, setSavingProfile] = useState(false);
//   const [profileError, setProfileError] = useState("");
//   const [profileSuccess, setProfileSuccess] = useState("");

//   // ===========================
//   // PASSWORD — form state
//   // ===========================
//   const [oldPassword, setOldPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [changingPassword, setChangingPassword] = useState(false);
//   const [passwordError, setPasswordError] = useState("");
//   const [passwordSuccess, setPasswordSuccess] = useState("");

//   const fetchProfile = async () => {
//     try {
//       setLoading(true);
//       const data = await getProfile();
//       const { stats: statsData, ...profileData } = data;
//       setProfile(profileData);
//       setStats(statsData);
//       setDraft({
//         username: profileData.username || "",
//         phone: profileData.phone || "",
//         location: profileData.location || "",
//       });
//     } catch (err) {
//       setLoadError("Couldn't load your profile. Try refreshing the page.");
//       console.error("Profile fetch error:", err.response?.data || err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   const formatDate = (dt) => {
//     if (!dt) return "—";
//     return new Date(dt).toLocaleDateString("en-KE", {
//       month: "long", year: "numeric",
//     });
//   };

//   // ===========================
//   // ACCOUNT DETAILS HANDLERS
//   // ===========================
//   const handleStartEdit = () => {
//     setDraft({
//       username: profile.username || "",
//       phone: profile.phone || "",
//       location: profile.location || "",
//     });
//     setProfileError("");
//     setProfileSuccess("");
//     setEditing(true);
//   };

//   const handleCancelEdit = () => {
//     setEditing(false);
//     setProfileError("");
//   };

//   const handleSaveProfile = async () => {
//     if (!draft.username.trim()) {
//       setProfileError("Username can't be empty.");
//       return;
//     }
//     setSavingProfile(true);
//     setProfileError("");
//     try {
//       const updated = await updateProfile({
//         username: draft.username.trim(),
//         phone: draft.phone.trim(),
//         location: draft.location.trim(),
//       });
//       setProfile((prev) => ({ ...prev, ...updated }));
//       updateUser({
//         username: updated.username,
//         phone: updated.phone,
//         location: updated.location,
//       });
//       setEditing(false);
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

//   // ===========================
//   // PASSWORD HANDLERS
//   // ===========================
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

//   // ===========================
//   // LOADING
//   // ===========================
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-blue-50/40">
//         <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 py-16 px-6">
//           <div className="max-w-3xl mx-auto">
//             <div className="h-8 w-40 bg-white/20 rounded-xl animate-pulse mb-2" />
//             <div className="h-4 w-24 bg-white/10 rounded-xl animate-pulse" />
//           </div>
//         </div>
//         <div className="max-w-3xl mx-auto px-6 py-8 space-y-5">
//           {[...Array(2)].map((_, i) => (
//             <div key={i} className="bg-white rounded-[28px] border border-blue-900/5 p-6 animate-pulse h-40" />
//           ))}
//         </div>
//       </div>
//     );
//   }

//   if (loadError) {
//     return (
//       <div className="min-h-screen bg-blue-50/40 flex items-center justify-center p-6">
//         <div className="bg-white rounded-[28px] border border-blue-900/5 p-10 text-center max-w-sm">
//           <XCircle size={28} className="text-rose-400 mx-auto mb-3" />
//           <p className="font-semibold text-slate-700">{loadError}</p>
//         </div>
//       </div>
//     );
//   }

//   const isOwner = profile.role === "owner";

//   return (
//     <div className="min-h-screen bg-blue-50/40">

//       {/* HERO */}
//       <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 py-16 px-6 relative overflow-hidden">
//         <div className="absolute -top-8 right-10 w-40 h-40 rounded-full border border-white/10 pointer-events-none" />
//         <div className="absolute top-16 right-32 w-16 h-16 rounded-full border border-white/10 pointer-events-none" />
//         <div className="absolute -bottom-10 left-0 w-52 h-52 rounded-full bg-white/5 pointer-events-none" />

//         <div className="max-w-3xl mx-auto relative z-10 flex items-center gap-5">
//           <div className="w-20 h-20 rounded-full bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center text-3xl font-black text-white shrink-0">
//             {profile.username?.charAt(0).toUpperCase() || "U"}
//           </div>
//           <div>
//             <span className="inline-flex items-center gap-1.5 text-blue-100 text-xs font-bold tracking-widest uppercase mb-1.5">
//               <Sparkles size={12} />
//               {isOwner ? "Shop Owner" : "Customer"}
//             </span>
//             <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
//               {profile.username}
//             </h1>
//             <p className="text-blue-50/80 text-sm mt-1 font-medium">
//               Member since {formatDate(profile.date_joined)}
//             </p>
//           </div>
//         </div>

//         <svg className="absolute bottom-0 left-0 w-full text-blue-50" viewBox="0 0 1440 40" preserveAspectRatio="none" style={{ height: "24px" }}>
//           <path d="M0,20 C240,40 480,0 720,15 C960,30 1200,5 1440,20 L1440,40 L0,40 Z" fill="currentColor" />
//         </svg>
//       </div>

//       <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

//         {/* STATS */}
//         {isOwner ? (
//           <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//             <StatCard icon={<Store size={16} />} label="Shops" value={stats.shops_count} color="blue" />
//             <StatCard icon={<ShoppingBag size={16} />} label="Total orders" value={stats.total_orders} color="blue" />
//             <StatCard icon={<Clock size={16} />} label="Active" value={stats.active_orders} color="amber" />
//             <StatCard icon={<CheckCircle2 size={16} />} label="Completed" value={stats.completed_orders} color="emerald" />
//             <StatCard icon={<XCircle size={16} />} label="Declined" value={stats.declined_orders} color="rose" />
//             <StatCard icon={<TrendingUp size={16} />} label="Revenue" value={`KES ${stats.revenue}`} color="indigo" />
//           </div>
//         ) : (
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//             <StatCard icon={<ShoppingBag size={16} />} label="Total orders" value={stats.total_orders} color="blue" />
//             <StatCard icon={<Clock size={16} />} label="Active" value={stats.active_orders} color="amber" />
//             <StatCard icon={<CheckCircle2 size={16} />} label="Completed" value={stats.completed_orders} color="emerald" />
//             <StatCard icon={<Wallet size={16} />} label="Total spent" value={`KES ${stats.total_spent}`} color="indigo" />
//           </div>
//         )}

//         {/* ACCOUNT DETAILS */}
//         <div className="bg-white rounded-[28px] border border-blue-900/5 shadow-[0_2px_20px_-8px_rgba(30,64,175,0.1)] p-6">
//           <div className="flex items-center justify-between mb-5">
//             <h2 className="font-bold text-lg text-slate-900">Account details</h2>
//             {!editing && (
//               <button
//                 onClick={handleStartEdit}
//                 className="flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-900"
//               >
//                 <Pencil size={14} /> Edit
//               </button>
//             )}
//           </div>

//           {!editing ? (
//             <div className="space-y-4">
//               <DetailRow icon={<User size={15} />} label="Username" value={profile.username} />
//               <DetailRow icon={<Mail size={15} />} label="Email" value={profile.email} />
//               <DetailRow icon={<Phone size={15} />} label="Phone" value={profile.phone || "Not set"} />
//               <DetailRow icon={<MapPin size={15} />} label="Location" value={profile.location || "Not set"} />
//             </div>
//           ) : (
//             <div className="space-y-4">
//               <Field label="Username">
//                 <input
//                   value={draft.username}
//                   onChange={(e) => setDraft((d) => ({ ...d, username: e.target.value }))}
//                   className="w-full text-sm border border-blue-100 rounded-xl px-3.5 py-2.5 bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-blue-300"
//                 />
//               </Field>

//               <Field label="Email">
//                 <input
//                   value={profile.email}
//                   disabled
//                   className="w-full text-sm border border-slate-100 rounded-xl px-3.5 py-2.5 bg-slate-50 text-slate-400 cursor-not-allowed"
//                 />
//               </Field>

//               <Field label="Phone" hint="Used for delivery coordination">
//                 <input
//                   value={draft.phone}
//                   onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
//                   placeholder="e.g. 0712 345 678"
//                   className="w-full text-sm border border-blue-100 rounded-xl px-3.5 py-2.5 bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-blue-300"
//                 />
//               </Field>

//               <Field label="Location" hint={isOwner ? "Where your shop operates" : "Your default pickup location"}>
//                 <input
//                   value={draft.location}
//                   onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
//                   placeholder="e.g. Kilimani, Nairobi"
//                   className="w-full text-sm border border-blue-100 rounded-xl px-3.5 py-2.5 bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-blue-300"
//                 />
//               </Field>

//               {profileError && <p className="text-xs text-rose-600">{profileError}</p>}

//               <div className="flex gap-2 pt-1">
//                 <button
//                   onClick={handleSaveProfile}
//                   disabled={savingProfile}
//                   className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold rounded-full bg-blue-700 hover:bg-blue-800 text-white transition disabled:opacity-50"
//                 >
//                   <Check size={15} /> {savingProfile ? "Saving..." : "Save changes"}
//                 </button>
//                 <button
//                   onClick={handleCancelEdit}
//                   disabled={savingProfile}
//                   className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-full text-slate-500 hover:text-slate-700 transition"
//                 >
//                   <X size={15} /> Cancel
//                 </button>
//               </div>
//             </div>
//           )}

//           {profileSuccess && !editing && (
//             <p className="text-xs text-emerald-600 font-medium mt-4">{profileSuccess}</p>
//           )}
//         </div>

//         {/* CHANGE PASSWORD */}
//         <div className="bg-white rounded-[28px] border border-blue-900/5 shadow-[0_2px_20px_-8px_rgba(30,64,175,0.1)] p-6">
//           <div className="flex items-center gap-2 mb-5">
//             <Lock size={16} className="text-blue-700" />
//             <h2 className="font-bold text-lg text-slate-900">Change password</h2>
//           </div>

//           <form onSubmit={handleChangePassword} className="space-y-4">
//             <Field label="Current password">
//               <input
//                 type="password"
//                 value={oldPassword}
//                 onChange={(e) => setOldPassword(e.target.value)}
//                 className="w-full text-sm border border-blue-100 rounded-xl px-3.5 py-2.5 bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-blue-300"
//               />
//             </Field>

//             <Field label="New password" hint="At least 8 characters">
//               <input
//                 type="password"
//                 value={newPassword}
//                 onChange={(e) => setNewPassword(e.target.value)}
//                 className="w-full text-sm border border-blue-100 rounded-xl px-3.5 py-2.5 bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-blue-300"
//               />
//             </Field>

//             <Field label="Confirm new password">
//               <input
//                 type="password"
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//                 className="w-full text-sm border border-blue-100 rounded-xl px-3.5 py-2.5 bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-blue-300"
//               />
//             </Field>

//             {passwordError && <p className="text-xs text-rose-600">{passwordError}</p>}
//             {passwordSuccess && <p className="text-xs text-emerald-600 font-medium">{passwordSuccess}</p>}

//             <button
//               type="submit"
//               disabled={changingPassword}
//               className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold rounded-full bg-blue-700 hover:bg-blue-800 text-white transition disabled:opacity-50"
//             >
//               <Lock size={14} /> {changingPassword ? "Updating..." : "Update password"}
//             </button>
//           </form>
//         </div>

//         {/* FOOTER FLOURISH */}
//         <div className="flex items-center justify-center gap-1.5 text-xs text-blue-900/30 font-medium pt-2">
//           <Shirt size={12} /> DryMe account
//         </div>

//       </div>
//     </div>
//   );
// }

// // ===========================
// // SMALL PRESENTATIONAL PIECES
// // ===========================
// function StatCard({ icon, label, value, color }) {
//   const colors = {
//     blue: "bg-blue-50 border-blue-100 text-blue-600",
//     amber: "bg-amber-50 border-amber-100 text-amber-600",
//     emerald: "bg-emerald-50 border-emerald-100 text-emerald-600",
//     rose: "bg-rose-50 border-rose-100 text-rose-600",
//     indigo: "bg-indigo-50 border-indigo-100 text-indigo-600",
//   };
//   return (
//     <div className={`border rounded-2xl p-4 text-center ${colors[color]}`}>
//       <div className="flex justify-center mb-1.5">{icon}</div>
//       <p className="text-[11px] font-bold uppercase tracking-wide opacity-80">{label}</p>
//       <p className="text-lg font-black mt-0.5">{value}</p>
//     </div>
//   );
// }

// function DetailRow({ icon, label, value }) {
//   return (
//     <div className="flex items-center gap-3 py-2.5 border-b border-blue-900/5 last:border-0">
//       <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
//         {icon}
//       </div>
//       <div className="min-w-0">
//         <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">{label}</p>
//         <p className="text-sm font-medium text-slate-800 truncate">{value}</p>
//       </div>
//     </div>
//   );
// }

// function Field({ label, hint, children }) {
//   return (
//     <div>
//       <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
//         {label}
//       </label>
//       {children}
//       {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
//     </div>
//   );
// }

// export default Profile;