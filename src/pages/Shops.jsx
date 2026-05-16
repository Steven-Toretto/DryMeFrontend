import { useEffect, useState, useContext } from "react";
import { getShops, deleteShop } from "../api";
import { useNavigate, Link } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";

import { AuthContext } from "../context/AuthContext";

function Shops() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setsearch] = useState("");

  const navigate = useNavigate();

  // ✅ AUTH CONTEXT
  const { token, user } = useContext(AuthContext);

  // =========================
  // FETCH SHOPS
  // =========================
  useEffect(() => {
    if (token === undefined) return;

    fetchShops();
  }, [token]);

  const fetchShops = async () => {
    try {
      setLoading(true);

      const data = await getShops();

      setShops(data);
    } catch (error) {
      console.error("Fetch shops error:", error);
    } finally {
      setLoading(false);
    }
  };

  //search
  const filteredShops = shops.filter((shop) => {
  const query = search.toLowerCase();

  return (
    shop.name?.toLowerCase().includes(query) ||
    shop.location?.toLowerCase().includes(query)
  );
});

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
    } catch (err) {
      console.error(err);

      alert("Failed to delete shop");
    }
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          Loading shops...
        </p>
      </div>
    );
  }

  // =========================
  // NOT LOGGED IN
  // =========================
  if (!user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4 text-center">
        <Link
          to="/login"
          className="text-gray-600"
        >
          <span className="text-blue-600 font-semibold">
            Login
          </span>{" "}
          to view available laundry shops
        </Link>
      </div>
    );
  }

  // =========================
  // NO SHOPS
  // =========================
  if (shops.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-gray-500">
          No available laundry shops
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Laundry Shops
        </h2>
      </div>

      
{/* SEARCH BAR */}
<div className="mb-8">
  <div className="relative">

    <input
      type="text"
      placeholder="Search by shop name or location..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full bg-white text-gray-800 placeholder:text-gray-400 border border-gray-200 rounded-2xl px-5 py-4 pl-12 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
    />

    {/* SEARCH ICON */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>

  </div>
</div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">

        {/*  search*/}
        {filteredShops.map((shop) => {

          const isOwner =
            user?.role === "owner" &&
            user?.username === shop.owner;

          // ✅ CLOUDINARY / MEDIA IMAGE FIX
          let imageUrl = "";

          if (shop.image) {

            // Cloudinary URL already full
            if (shop.image.startsWith("http")) {
              imageUrl = shop.image;

            } else {

              // fallback for local media
              imageUrl = `${
                import.meta.env.VITE_API_URL
              }${shop.image}`;
            }
          }

          {filteredShops.length === 0 && (
  <div className="text-center py-16 text-gray-500">
    No shops found
  </div>
)}
// 
          return (
            <div
              key={shop.id}
              onClick={() =>
                navigate(`/shop/${shop.id}`)
              }
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition duration-300 overflow-hidden cursor-pointer flex flex-col"
            >

              {/* IMAGE */}
              <div className="relative h-44 overflow-hidden">

                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={shop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
                    No Image
                  </div>
                )}

                <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow">
                  Featured
                </span>

                {/* OWNER CONTROLS */}
                {isOwner && (
                  <div
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                    className="absolute top-3 right-3 flex gap-2"
                  >

                    <button
                      onClick={() =>
                        navigate(`/edit-shop/${shop.id}`)
                      }
                      className="bg-white text-blue-600 px-2 py-1 rounded text-xs shadow hover:bg-gray-100"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(shop.id)
                      }
                      className="bg-white text-red-600 px-2 py-1 rounded text-xs shadow hover:bg-gray-100"
                    >
                      Delete
                    </button>

                  </div>
                )}

              </div>

              {/* CONTENT */}
              <div className="p-4 flex flex-col flex-1">

                <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                  {shop.name}
                </h3>

                <p className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                  <FaMapMarkerAlt className="text-red-400" />
                  {shop.location}
                </p>

                <p className="text-gray-600 text-sm mt-2 line-clamp-2 flex-1">
                  {shop.description}
                </p>

                {/* ACTIONS */}
                <div className="mt-4 flex gap-2">

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/shop/${shop.id}`);
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition text-sm"
                  >
                    View
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/shop/${shop.id}#book`);
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-100 transition text-sm"
                  >
                    Book
                  </button>

                </div>

              </div>

            </div>
          );
        })}

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

//   const navigate = useNavigate();

//   // ✅ USE AUTH CONTEXT INSTEAD OF DIRECT localStorage
//   const { token, user } = useContext(AuthContext);

//   // =========================
//   // ✅ WAIT FOR TOKEN
//   // =========================
//   useEffect(() => {

//     // Wait until auth loads
//     if (token === undefined) return;

//     // If logged in, fetch shops
//     if (token) {
//       fetchShops();

//     } else {
//       // Optional:
//       // fetchShops(); // uncomment if shops should be public
//       setLoading(false);
//     }

//   }, [token]);

//   // =========================
//   // FETCH SHOPS
//   // =========================
//   const fetchShops = async () => {

//     try {

//       setLoading(true);

//       const data = await getShops();

//       setShops(data);

//     } catch (error) {

//       console.error("Fetch shops error:", error);

//     } finally {

//       setLoading(false);
//     }
//   };

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

//       {/* Header */}
//       <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto">

//         <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
//           Laundry Shops
//         </h2>

//       </div>

//       {/* Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">

//         {shops.map((shop) => {

//           const isOwner =
//             user?.role === "owner" &&
//             user?.username === shop.owner;

//           return (

//             <div
//               key={shop.id}
//               onClick={() =>
//                 navigate(`/shop/${shop.id}`)
//               }
//               className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition duration-300 overflow-hidden cursor-pointer flex flex-col"
//             >

//               {/* IMAGE */}
//               <div className="relative h-44 overflow-hidden">

//                 {shop.image ? (
//   <img
//     src={shop.image}
//     alt={shop.name}
//     className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
//   />
// ) : (
//   <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
//     No Image
//   </div>
// )}

//                 <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow">
//                   Featured
//                 </span>

//                 {/* OWNER CONTROLS */}
//                 {isOwner && (

//                   <div
//                     onClick={(e) =>
//                       e.stopPropagation()
//                     }
//                     className="absolute top-3 right-3 flex gap-2"
//                   >

//                     <button
//                       onClick={() =>
//                         navigate(`/edit-shop/${shop.id}`)
//                       }
//                       className="bg-white text-blue-600 px-2 py-1 rounded text-xs shadow hover:bg-gray-100"
//                     >
//                       Edit
//                     </button>

//                     <button
//                       onClick={() =>
//                         handleDelete(shop.id)
//                       }
//                       className="bg-white text-red-600 px-2 py-1 rounded text-xs shadow hover:bg-gray-100"
//                     >
//                       Delete
//                     </button>

//                   </div>
//                 )}

//               </div>

//               {/* CONTENT */}
//               <div className="p-4 flex flex-col flex-1">

//                 <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
//                   {shop.name}
//                 </h3>

//                 <p className="flex gap-1 text-gray-500 text-sm mt-1">
//                   <FaMapMarkerAlt className="text-red-400" />
//                   {shop.location}
//                 </p>

//                 <p className="text-gray-600 text-sm mt-2 line-clamp-2 flex-1">
//                   {shop.description}
//                 </p>

//                 {/* ACTIONS */}
//                 <div className="mt-4 flex gap-2">

//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       navigate(`/shop/${shop.id}`);
//                     }}
//                     className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition text-sm"
//                   >
//                     View
//                   </button>

//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       navigate(`/shop/${shop.id}#book`);
//                     }}
//                     className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-100 transition text-sm"
//                   >
//                     Book
//                   </button>

//                 </div>

//               </div>

//             </div>
//           );
//         })}

//       </div>

//     </div>
//   );
// }

// export default Shops;



