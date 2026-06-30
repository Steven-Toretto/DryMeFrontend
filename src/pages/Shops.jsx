import { useEffect, useState, useContext } from "react";
import { getShops, deleteShop } from "../api";
import { useNavigate, Link } from "react-router-dom";
import { MapPin, Search, Edit2, Trash2, Store } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

function Shops() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);

  useEffect(() => {
    if (!token) return;
    fetchShops();
  }, [token]);

  const fetchShops = async (pageNum = 1) => {
    try {
      setLoading(true);
      const data = await getShops(pageNum);
      setShops(data.results ?? data);
      setTotalPages(Math.ceil((data.count ?? data.length) / 10));
    } catch (error) {
      console.error("Fetch shops error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = shops.filter((shop) => {
    const query = search.toLowerCase();
    return (
      shop.name?.toLowerCase().includes(query) ||
      shop.location?.toLowerCase().includes(query)
    );
  });

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this shop?")) return;
    try {
      await deleteShop(id);
      setShops(shops.filter((shop) => shop.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete shop");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
          <Store size={28} className="text-blue-400" />
        </div>
        <p className="text-gray-600">
          <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign in</Link>{" "}
          to view available laundry shops
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HERO BANNER */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white py-14 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/4 pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <span className="inline-block text-blue-200 text-xs font-bold tracking-widest uppercase mb-3">
            Browse
          </span>
          <h1 className="text-3xl md:text-4xl font-black mb-2">Laundry Shops</h1>
          <p className="text-blue-100/80 text-sm mb-8">
            Find trusted laundry shops near you — book a pickup in seconds.
          </p>

          {/* SEARCH */}
          <div className="relative max-w-xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white text-gray-800 placeholder-gray-400 rounded-xl pl-11 pr-4 py-3.5 text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* RESULTS COUNT */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            {filteredShops.length} {filteredShops.length === 1 ? "shop" : "shops"} found
            {search && ` for "${search}"`}
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Clear search
            </button>
          )}
        </div>

        {/* EMPTY */}
        {filteredShops.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <Store size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No shops found</p>
            {search && (
              <p className="text-sm text-gray-400 mt-1">
                Try a different search term
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredShops.map((shop) => {
              const isOwner = user?.role === "owner" && user?.username === shop.owner;
              const imageUrl = shop.image?.startsWith("http")
                ? shop.image
                : shop.image
                ? `${import.meta.env.VITE_API_URL}${shop.image}`
                : null;

              return (
                <div
                  key={shop.id}
                  onClick={() => navigate(`/shop/${shop.id}`)}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition duration-300 overflow-hidden cursor-pointer flex flex-col"
                >
                  {/* IMAGE */}
                  <div className="relative h-44 overflow-hidden bg-gray-100">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={shop.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                        <Store size={36} />
                        <p className="text-xs mt-2">No Image</p>
                      </div>
                    )}

                    {/* Featured badge */}
                    <span className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs px-2.5 py-1 rounded-full font-semibold shadow-sm">
                      Featured
                    </span>

                    {/* OWNER CONTROLS */}
                    {isOwner && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-3 right-3 flex gap-1.5"
                      >
                        <button
                          onClick={() => navigate(`/edit-shop/${shop.id}`)}
                          className="bg-white/95 text-blue-600 p-1.5 rounded-lg shadow hover:bg-blue-50 transition"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(shop.id)}
                          className="bg-white/95 text-red-500 p-1.5 rounded-lg shadow hover:bg-red-50 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-900 line-clamp-1">{shop.name}</h3>
                    <p className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                      <MapPin size={11} className="text-red-400 shrink-0" />
                      {shop.location}
                    </p>
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2 flex-1">
                      {shop.description}
                    </p>

                    {/* ACTIONS */}
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/shop/${shop.id}`);
                        }}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-2.5 rounded-xl font-semibold text-sm transition"
                      >
                        View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/shop/${shop.id}#book`);
                        }}
                        className="flex-1 border-2 border-gray-100 text-gray-600 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <button
              onClick={() => { setPage(p => p - 1); fetchShops(page - 1); }}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
            >
              Previous
            </button>
            <span className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => { setPage(p => p + 1); fetchShops(page + 1); }}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
            >
              Next
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default Shops;




// import { useEffect, useState, useContext } from "react";
// import { getShops, deleteShop } from "../api";
// import { useNavigate, Link } from "react-router-dom";
// import { FaMapMarkerAlt } from "react-icons/fa";

// import { AuthContext } from "../context/AuthContext";

// function Shops() {
//   const [shops, setShops] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // ✅ FIXED
//   const [search, setSearch] = useState("");

//   const navigate = useNavigate();

//   // ✅ AUTH CONTEXT
//   const { token, user } = useContext(AuthContext);

//   // =========================
//   // FETCH SHOPS
//   // =========================
// useEffect(() => {
//   if (!token) return;

//   fetchShops();
// }, [token]);

//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   const fetchShops = async (pageNum = 1) => {
//     try {
//       setLoading(true);

//       const data = await getShops(pageNum);

//       // ✅ DRF pagination returns { count, next, previous, results }
//       setShops(data.results ?? data);
//       setTotalPages(Math.ceil((data.count ?? data.length) / 10));

//     } catch (error) {
//       console.error("Fetch shops error:", error);

//     } finally {
//       setLoading(false);
//     }
//   };

//   // =========================
//   // SEARCH FILTER
//   // =========================
//   const filteredShops = shops.filter((shop) => {
//     const query = search.toLowerCase();

//     return (
//       shop.name?.toLowerCase().includes(query) ||
//       shop.location?.toLowerCase().includes(query)
//     );
//   });

//   // =========================
//   // DELETE SHOP
//   // =========================
//   const handleDelete = async (id) => {
//     const confirmDelete = window.confirm(
//       "Delete this shop?"
//     );

//     if (!confirmDelete) return;

//     try {
//       await deleteShop(id);

//       setShops(
//         shops.filter((shop) => shop.id !== id)
//       );

//     } catch (err) {
//       console.error(err);

//       alert("Failed to delete shop");
//     }
//   };

//   // =========================
//   // LOADING
//   // =========================
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-gray-500">
//           Loading shops...
//         </p>
//       </div>
//     );
//   }

//   // =========================
//   // NOT LOGGED IN
//   // =========================
//   if (!user) {
//     return (
//       <div className="min-h-[50vh] flex items-center justify-center px-4 text-center">
//         <Link
//           to="/login"
//           className="text-gray-600"
//         >
//           <span className="text-blue-600 font-semibold">
//             Login
//           </span>{" "}
//           to view available laundry shops
//         </Link>
//       </div>
//     );
//   }

//   // =========================
//   // NO SHOPS
//   // =========================
//   if (shops.length === 0) {
//     return (
//       <div className="min-h-[50vh] flex items-center justify-center">
//         <p className="text-gray-500">
//           No available laundry shops
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">

//       {/* HEADER */}
//       <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
//         <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
//           Laundry Shops
//         </h2>
//       </div>

//       {/* SEARCH BAR */}
//       <div className="mb-8 max-w-6xl mx-auto">
//         <div className="relative">

//           <input
//             type="text"
//             placeholder="Search by shop name or location..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="w-full bg-white text-gray-800 placeholder:text-gray-400 border border-gray-200 rounded-2xl px-5 py-4 pl-12 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
//           />

//           {/* SEARCH ICON */}
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
//             />
//           </svg>

//         </div>
//       </div>

//       {/* NO SEARCH RESULTS */}
//       {filteredShops.length === 0 ? (
//         <div className="text-center py-16 text-gray-500">
//           No shops found
//         </div>
//       ) : (

//         /* GRID */
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">

//           {filteredShops.map((shop) => {

//             const isOwner =
//               user?.role === "owner" &&
//               user?.username === shop.owner;

//             // =========================
//             // IMAGE URL FIX
//             // =========================
//             // =========================
// // IMAGE URL FIX
// // =========================
// let imageUrl = "";

// if (shop.image) {
//   imageUrl = shop.image?.startsWith("http")
//     ? shop.image
//     : `${import.meta.env.VITE_API_URL}${shop.image}`;
// }

//             return (
//               <div
//                 key={shop.id}
//                 onClick={() =>
//                   navigate(`/shop/${shop.id}`)
//                 }
//                 className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition duration-300 overflow-hidden cursor-pointer flex flex-col"
//               >

//                 {/* IMAGE */}
//                 <div className="relative h-44 overflow-hidden">

//                   {imageUrl ? (
//                     <img
//                       src={imageUrl}
//                       alt={shop.name}
//                       className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
//                     />
//                   ) : (
//                     <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
//                       No Image
//                     </div>
//                   )}

//                   <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow">
//                     Featured
//                   </span>

//                   {/* OWNER CONTROLS */}
//                   {isOwner && (
//                     <div
//                       onClick={(e) =>
//                         e.stopPropagation()
//                       }
//                       className="absolute top-3 right-3 flex gap-2"
//                     >

//                       <button
//                         onClick={() =>
//                           navigate(`/edit-shop/${shop.id}`)
//                         }
//                         className="bg-white text-blue-600 px-2 py-1 rounded text-xs shadow hover:bg-gray-100"
//                       >
//                         Edit
//                       </button>

//                       <button
//                         onClick={() =>
//                           handleDelete(shop.id)
//                         }
//                         className="bg-white text-red-600 px-2 py-1 rounded text-xs shadow hover:bg-gray-100"
//                       >
//                         Delete
//                       </button>

//                     </div>
//                   )}

//                 </div>

//                 {/* CONTENT */}
//                 <div className="p-4 flex flex-col flex-1">

//                   <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
//                     {shop.name}
//                   </h3>

//                   <p className="flex items-center gap-1 text-gray-500 text-sm mt-1">
//                     <FaMapMarkerAlt className="text-red-400" />
//                     {shop.location}
//                   </p>

//                   <p className="text-gray-600 text-sm mt-2 line-clamp-2 flex-1">
//                     {shop.description}
//                   </p>

//                   {/* ACTIONS */}
//                   <div className="mt-4 flex gap-2">

//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         navigate(`/shop/${shop.id}`);
//                       }}
//                       className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition text-sm"
//                     >
//                       View
//                     </button>

//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         navigate(`/shop/${shop.id}#book`);
//                       }}
//                       className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-100 transition text-sm"
//                     >
//                       Book
//                     </button>

//                   </div>

//                 </div>

//               </div>
//             );
//           })}

//         </div>
//       )}

//     </div>
//   );
// }

// export default Shops;



