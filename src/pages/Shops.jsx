import { useEffect, useState, useContext } from "react";
import { getShops, deleteShop } from "../api";
import { useNavigate, Link } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";

import { AuthContext } from "../context/AuthContext";

function Shops() {

  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // ✅ USE AUTH CONTEXT INSTEAD OF DIRECT localStorage
  const { token, user } = useContext(AuthContext);

  // =========================
  // ✅ WAIT FOR TOKEN
  // =========================
  useEffect(() => {

    // Wait until auth loads
    if (token === undefined) return;

    // If logged in, fetch shops
    if (token) {
      fetchShops();

    } else {
      // Optional:
      // fetchShops(); // uncomment if shops should be public
      setLoading(false);
    }

  }, [token]);

  // =========================
  // FETCH SHOPS
  // =========================
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
            user?.role === "owner" &&
            user?.username === shop.owner;

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

                {shop.image ? (
  <img
    src={shop.image}
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

                <p className="flex gap-1 text-gray-500 text-sm mt-1">
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



// import { useEffect, useState } from "react";
// import { getShops, deleteShop } from "../api";
// import { useNavigate } from "react-router-dom";
// import { FaMapMarkerAlt } from "react-icons/fa";
// import {Link} from "react-router-dom"
// import { User } from "lucide-react";

// import { useContext } from "react";
// import { AuthContext } from "../context/AuthContext";

// function Shops() {
//   const [shops, setShops] = useState([]);
//   const navigate = useNavigate();

//   const user = JSON.parse(localStorage.getItem("user")); 

//   // avoids fetching before token exists, preventing unauthorized errors and ensuring shops load correctly after login. This is crucial for a smooth user experience, especially when navigating directly to the shops page after authentication.
// const { token } = useContext(AuthContext);

// useEffect(() => {
//   if (token) {
//     fetchOrders();
//   }
// }, [token]);

//   // useEffect(() => {
//   //   fetchShops();
//   // }, []);

//   const fetchShops = async () => {
//     const data = await getShops();
//     setShops(data);
//   };

//   //  DELETE SHOP
//   const handleDelete = async (id) => {
//     const confirmDelete = window.confirm("Delete this shop?");
//     if (!confirmDelete) return;

//     try {
//       await deleteShop(id);
//       setShops(shops.filter((shop) => shop.id !== id));
//     } catch (err) {
//       alert("Failed to delete shop");
//     }
//   };

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
//             user?.role === "owner" && user?.username === shop.owner;

//           if(!user){
//             return(
//               <div className="min-h-[50vh] items-center justify-center">
//                 <Link to="/login" className="text-gray-500"> <span text-blue-500>Login</span> to view available laundry shops</Link>
//               </div>
//             );
//           }

//           if(shops.length === 0){
//             return(
//               <div className="min-h-[50vh] flex items-center justify-center">
//                 <p className="text-gray-500">No available laundry shops</p>
//               </div>
//             );
//           }

//           return (
//             <div
//               key={shop.id}
//               onClick={() => navigate(`/shop/${shop.id}`)}
//               className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition duration-300 overflow-hidden cursor-pointer flex flex-col"
//             >
//               {/* Image */}
//               <div className="relative h-44 overflow-hidden">
//                 <img
//                   src={
//                     shop.image
//                       ? shop.image
//                       : "https://via.placeholder.com/600x400?text=No+Image"
//                   }
//                   alt={shop.name}
//                   className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
//                 />

//                 <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow">
//                   Featured
//                 </span>

//                 {/* Owner Controls */}
//                 {isOwner && (
//                   <div
//                     onClick={(e) => e.stopPropagation()}
//                     className="absolute top-3 right-3 flex gap-2"
//                   >
//                     <button
//                       onClick={() => navigate(`/edit-shop/${shop.id}`)}
//                       className="bg-white text-blue-600 px-2 py-1 rounded text-xs shadow hover:bg-gray-100"
//                     >
//                       Edit
//                     </button>

//                     <button
//                       onClick={() => handleDelete(shop.id)}
//                       className="bg-white text-red-600 px-2 py-1 rounded text-xs shadow hover:bg-gray-100"
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 )}
//               </div>

//               {/* Content */}
//               <div className="p-4 flex flex-col flex-1">
//                 <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
//                   {shop.name}
//                 </h3>

//                 <p className="flex gap-1 text-gray-500 text-sm mt-1">
//                   <FaMapMarkerAlt className="text-red-400" /> {shop.location}
//                 </p>

//                 <p className="text-gray-600 text-sm mt-2 line-clamp-2 flex-1">
//                   {shop.description}
//                 </p>

//                 {/* Actions */}
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













