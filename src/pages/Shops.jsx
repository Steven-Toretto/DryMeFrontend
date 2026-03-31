import { useEffect, useState } from "react";
import { getShops, deleteShop } from "../api";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";


function Shops() {
  const [shops, setShops] = useState([]);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")); // assumes you store user

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    const data = await getShops();
    setShops(data);
  };

  // 🗑️ DELETE SHOP
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this shop?");
    if (!confirmDelete) return;

    try {
      await deleteShop(id);
      setShops(shops.filter((shop) => shop.id !== id));
    } catch (err) {
      alert("Failed to delete shop");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Laundry Shops
        </h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {shops.map((shop) => {
          const isOwner =
            user?.role === "owner" && user?.username === shop.owner;

          return (
            <div
              key={shop.id}
              onClick={() => navigate(`/shop/${shop.id}`)}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition duration-300 overflow-hidden cursor-pointer flex flex-col"
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={
                    shop.image
                      ? shop.image
                      : "https://via.placeholder.com/600x400?text=No+Image"
                  }
                  alt={shop.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />

                <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow">
                  Featured
                </span>

                {/* Owner Controls */}
                {isOwner && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-3 right-3 flex gap-2"
                  >
                    <button
                      onClick={() => navigate(`/edit-shop/${shop.id}`)}
                      className="bg-white text-blue-600 px-2 py-1 rounded text-xs shadow hover:bg-gray-100"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(shop.id)}
                      className="bg-white text-red-600 px-2 py-1 rounded text-xs shadow hover:bg-gray-100"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                  {shop.name}
                </h3>

                <p className="flex gap-1 text-gray-500 text-sm mt-1">
                  <FaMapMarkerAlt className="text-red-400" /> {shop.location}
                </p>

                <p className="text-gray-600 text-sm mt-2 line-clamp-2 flex-1">
                  {shop.description}
                </p>

                {/* Actions */}
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














// import { useEffect, useState } from "react";
// import { getShops } from "../api";
// import { useNavigate } from "react-router-dom";

// function Shops() {
//   const [shops, setShops] = useState([]);
//   const navigate = useNavigate(); // navigation hook

//   useEffect(() => {
//     fetchShops();
//   }, []);

//   const fetchShops = async () => {
//     const data = await getShops();
//     setShops(data);
//   };

//   return (
//     <div className="p-6">
//       {/* Header matching screenshot */}
//       <div className="flex items-center justify-between mb-6 max-w-6xl mx-auto">
//         <h2 className="text-2xl font-extrabold text-gray-900">Available Laundry Shops</h2>
//       </div>

//       {/* Flexbox layout (cards side-by-side) */}
//       <div className="flex flex-wrap justify-center bg-gray-100 p-5 gap-6">
//         {shops.map((shop) => (
//           <div
//             key={shop.id}
//             onClick={() => navigate(`/shop/${shop.id}`)} // CLICK NAVIGATION
//             className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition transform hover:-translate-y-1 flex flex-col w-full sm:w-[48%] md:w-[32%] lg:w-[30%] max-w-sm"
//             aria-label={`Open ${shop.name} shop page`}
//           >
//             {/* Image */}
//             <div className="relative w-full h-48 overflow-hidden bg-gray-100">
//               <img
//                 src={
//                   shop.image
//                     ? shop.image
//                     : "https://via.placeholder.com/600x400?text=No+Image"
//                 }
//                 alt={shop.name}
//                 className="w-full h-full object-cover"
//               />

//               {/* "New" label top-right like screenshot */}
//               <span className="absolute right-3 top-3 bg-white text-xs text-gray-800 px-2 py-1 rounded-full font-semibold shadow-sm">
//                 New
//               </span>
//             </div>

//             {/* Content */}
//             <div className="p-4 flex-1 flex flex-col">
//               <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
//                 {shop.name}
//               </h3>

//               {/* location in lowercase like screenshot */}
//               <p className="text-gray-500 text-sm mt-1 lowercase">
//                 {shop.location}
//               </p>

//               <p className="text-gray-700 mt-3 text-sm flex-1 line-clamp-3">
//                 {shop.description}
//               </p>

//               {/* Two buttons exactly as in screenshot */}
//               <div className="mt-4 flex gap-3">
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     navigate(`/shop/${shop.id}`);
//                   }}
//                   className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition text-sm"
//                   aria-label={`View ${shop.name}`}
//                 >
//                   View Shop
//                 </button>

//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     navigate(`/shop/${shop.id}#book`);
//                   }}
//                   className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 rounded font-semibold hover:bg-gray-50 transition text-sm"
//                   aria-label={`Book at ${shop.name}`}
//                 >
//                   Book Now
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default Shops;
