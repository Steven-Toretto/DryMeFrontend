import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Edit2, Search, Shirt, Trash2 } from "lucide-react";
import { getShops, deleteShop } from "../api";
import { AuthContext } from "../context/AuthContext";
import ShopCard from "../components/ShopCard";
import { PageHeader, btn, card, textLink, wrap } from "../components/ui";

const PAGE_SIZE = 10;

function Shops() {
  const [searchParams] = useSearchParams();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") || ""); // the home page search lands here
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Everyone can browse shops, signed in or not
  useEffect(() => {
    fetchShops(1);
  }, []);

  const fetchShops = async (pageNum = 1) => {
    try {
      setLoading(true);
      const data = await getShops(pageNum);
      setShops(data.results ?? data);
      setTotalPages(Math.ceil((data.count ?? data.length) / PAGE_SIZE));
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

  const ownerButton =
    "w-9 h-9 flex items-center justify-center rounded-lg bg-white/95 border border-white shadow hover:bg-white transition";

  return (
    <div>
      <PageHeader title="Find a laundry">
        <p className="text-lg text-slate-600 mt-3 max-w-xl">
          Search by shop name or neighbourhood, then book a pickup.
        </p>

        <div className="relative max-w-xl mt-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search by name or location, e.g. Kilimani"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search laundries"
            className="w-full min-h-[52px] pl-11 pr-4 bg-white border border-blue-200 rounded-xl text-base text-slate-900 placeholder:text-slate-400 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>
      </PageHeader>

      <div className={`${wrap} py-8 sm:py-10`}>

        {/* RESULT COUNT */}
        <div className="flex items-center justify-between mb-6 min-h-[24px]">
          <p className="text-sm font-semibold text-slate-500">
            {loading ? (
              "Loading shops…"
            ) : (
              <>
                {filteredShops.length} {filteredShops.length === 1 ? "shop" : "shops"}
                {search && <span> for “{search}”</span>}
              </>
            )}
          </p>
          {search && (
            <button onClick={() => setSearch("")} className={`${textLink} text-sm`}>
              Clear search
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[360px] bg-blue-50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredShops.length === 0 ? (
          <div className={`${card} max-w-lg mx-auto p-8 text-center`}>
            <span className="mx-auto flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 text-blue-500">
              <Shirt size={26} />
            </span>
            <p className="text-xl font-extrabold text-slate-900 mt-4">No shops found</p>
            <p className="text-slate-600 mt-1.5">
              {search ? "Try a different name or neighbourhood." : "Check back soon, or list your own shop."}
            </p>
            {search && (
              <button onClick={() => setSearch("")} className={`${btn.ghost} mt-5`}>
                Show all shops
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredShops.map((shop) => {
              const isOwner = user?.role === "owner" && user?.username === shop.owner;
              return (
                <ShopCard
                  key={shop.id}
                  shop={shop}
                  showMap
                  controls={
                    isOwner && (
                      <>
                        <button
                          onClick={() => navigate(`/edit-shop/${shop.id}`)}
                          aria-label={`Edit ${shop.name}`}
                          className={`${ownerButton} text-blue-700`}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(shop.id)}
                          aria-label={`Delete ${shop.name}`}
                          className={`${ownerButton} text-red-600`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )
                  }
                />
              );
            })}
          </div>
        )}

        {/* PAGINATION */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12">
            <button onClick={() => fetchShops(page - 1)} disabled={page === 1} className={btn.ghost}>
              Previous
            </button>
            <span className="text-sm font-semibold text-slate-600">
              Page {page} of {totalPages}
            </span>
            <button onClick={() => fetchShops(page + 1)} disabled={page === totalPages} className={btn.ghost}>
              Next
            </button>
          </div>
        )}

        <p className="mt-12 text-center text-sm text-slate-500">
          Run a laundry?{" "}
          <Link to="/register" className={textLink}>List your shop</Link>
        </p>
      </div>
    </div>
  );
}

export default Shops;