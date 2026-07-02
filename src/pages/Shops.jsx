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
  const { user } = useContext(AuthContext);

  // ✅ Fetch shops for EVERYONE — no token check
  useEffect(() => {
    fetchShops(1);
  }, []);

  const fetchShops = async (pageNum = 1) => {
    try {
      setLoading(true);
      const data = await getShops(pageNum);
      setShops(data.results ?? data);
      setTotalPages(Math.ceil((data.count ?? data.length) / 10));
      setPage(pageNum);
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

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HERO BANNER */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white py-14 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <span className="inline-block text-blue-200 text-xs font-bold tracking-widest uppercase mb-3">
            Browse
          </span>
          <h1 className="text-3xl md:text-4xl font-black mb-2">Laundry Shops</h1>
          <p className="text-blue-100/80 text-sm mb-8 max-w-md">
            Find trusted laundry shops near you — book a pickup in seconds.
          </p>

          {/* SEARCH */}
          <div className="relative max-w-xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by shop name or location..."
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
            {loading ? "Loading shops..." : (
              <>
                <span className="font-semibold text-gray-700">{filteredShops.length}</span>
                {" "}{filteredShops.length === 1 ? "shop" : "shops"} found
                {search && <span className="text-gray-400"> for "{search}"</span>}
              </>
            )}
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

        {/* LOADING SKELETON */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-44 bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-9 bg-gray-100 rounded-xl flex-1" />
                    <div className="h-9 bg-gray-100 rounded-xl flex-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredShops.length === 0 ? (
          /* EMPTY */
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <Store size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No shops found</p>
            {search ? (
              <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
            ) : (
              <p className="text-sm text-gray-400 mt-1">Check back soon!</p>
            )}
          </div>
        ) : (
          /* SHOP GRID */
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

                    {/* Badge */}
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
        {!loading && totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <button
              onClick={() => fetchShops(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
            >
              Previous
            </button>
            <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-bold">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => fetchShops(page + 1)}
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

