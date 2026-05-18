import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getShop, updateShop } from "../api";

function EditShop() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    location: "",
    description: "",
    image: null,
  });

  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // FETCH SHOP
  // =========================
  useEffect(() => {
    fetchShop();
  }, []);

  const fetchShop = async () => {
    try {
      setFetching(true);

      const shops = await getShop();

      const shop = shops.find(
        (s) => s.id === Number(id)
      );

      if (!shop) {
        setError("Shop not found");
        return;
      }

      setForm({
        name: shop.name || "",
        location: shop.location || "",
        description: shop.description || "",
        image: null,
      });

      // =========================
      // FIX IMAGE URL
      // =========================
      let imageUrl = "";

      if (shop.image) {

        // cloudinary image
        if (shop.image.startsWith("http")) {
          imageUrl = shop.image;

        } else {

          // local image
          imageUrl = `${
            import.meta.env.VITE_API_URL
          }${shop.image}`;
        }
      }

      setPreview(imageUrl);

    } catch (err) {
      console.error(err);
      setError("Failed to load shop");

    } finally {
      setFetching(false);
    }
  };

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =========================
  // HANDLE IMAGE
  // =========================
  const handleImageChange = (file) => {

    if (!file) return;

    setForm((prev) => ({
      ...prev,
      image: file,
    }));

    // local preview
    const imagePreview =
      URL.createObjectURL(file);

    setPreview(imagePreview);
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // validation
    if (
      !form.name ||
      !form.location ||
      !form.description
    ) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("location", form.location);
      formData.append(
        "description",
        form.description
      );

      // IMPORTANT
      if (form.image instanceof File) {
        formData.append("image", form.image);
      }

      await updateShop(id, formData);

      setSuccess(
        "Shop updated successfully!"
      );

      // redirect
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

    } catch (err) {

      console.error(
        "UPDATE ERROR:",
        err.response?.data || err
      );

      if (err.response?.data) {

        setError(
          JSON.stringify(
            err.response.data,
            null,
            2
          )
        );

      } else {

        setError(
          "Failed to update shop"
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOADING
  // =========================
  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">
          Loading shop...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">

      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6">

        {/* HEADER */}
        <div className="mb-6 text-center">

          <h2 className="text-2xl font-bold text-gray-800">
            Edit Shop
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Update your laundry shop details
          </p>

        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mb-4 bg-green-50 text-green-600 p-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* NAME */}
          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shop Name
            </label>

            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                handleChange(
                  "name",
                  e.target.value
                )
              }
              placeholder="Enter shop name"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />

          </div>

          {/* LOCATION */}
          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>

            <input
              type="text"
              value={form.location}
              onChange={(e) =>
                handleChange(
                  "location",
                  e.target.value
                )
              }
              placeholder="Enter location"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />

          </div>

          {/* DESCRIPTION */}
          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>

            <textarea
              rows={4}
              value={form.description}
              onChange={(e) =>
                handleChange(
                  "description",
                  e.target.value
                )
              }
              placeholder="Describe your shop"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />

          </div>

          {/* IMAGE PREVIEW */}
          {preview && (
            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Image
              </label>

              <img
                src={preview}
                alt="Preview"
                className="w-full h-52 object-cover rounded-xl border"
              />

            </div>
          )}

          {/* FILE INPUT */}
          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload New Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleImageChange(
                  e.target.files[0]
                )
              }
              className="w-full text-sm"
            />

          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-semibold transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading
              ? "Updating Shop..."
              : "Update Shop"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default EditShop;



// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { getShops, updateShop } from "../api";

// function EditShop() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     name: "",
//     location: "",
//     description: "",
//     image: null,
//   });

//   const [preview, setPreview] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [fetching, setFetching] = useState(true);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   // =========================
//   // FETCH SHOP
//   // =========================
//   useEffect(() => {
//     fetchShop();
//   }, []);

//   const fetchShop = async () => {
//     try {
//       setFetching(true);
//       const shops = await getShops();
//       const shop = shops.find((s) => s.id === Number(id));

//       if (shop) {
//         setForm({
//           name: shop.name,
//           location: shop.location,
//           description: shop.description,
//           image: null,
//         });
//         setPreview(shop.image);
//       } else {
//         setError("Shop not found");
//       }
//     } catch (err) {
//       setError("Failed to load shop");
//     } finally {
//       setFetching(false);
//     }
//   };

//   // =========================
//   // HANDLE INPUT
//   // =========================
//   const handleChange = (field, value) => {
//     setForm({ ...form, [field]: value });
//     setError("");
//     setSuccess("");
//   };

//   // =========================
//   // HANDLE IMAGE PREVIEW
//   // =========================
//   const handleImageChange = (file) => {
//     setForm({ ...form, image: file });

//     if (file) {
//       const url = URL.createObjectURL(file);
//       setPreview(url);
//     }
//   };

//   // =========================
//   // SUBMIT
//   // =========================
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");

//     if (!form.name || !form.location || !form.description) {
//       setError("All fields are required");
//       return;
//     }

//     try {
//       setLoading(true);

//       const formData = new FormData();
//       formData.append("name", form.name);
//       formData.append("location", form.location);
//       formData.append("description", form.description);
//       if (form.image) formData.append("image", form.image);

//       await updateShop(id, formData);

//       setSuccess(" Shop updated successfully!");

//       // redirect after short delay
//       setTimeout(() => {
//         navigate("/dashboard");
//       }, 1200);

//     } catch (err) {
//       console.error(err);
//       setError(
//         err.response?.data
//           ? JSON.stringify(err.response.data)
//           : "Failed to update shop"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // =========================
//   // UI
//   // =========================
//   return (
//     <div className="min-h-[80vh] flex items-center justify-center bg-gray-100 px-4">
//       <div className="w-full max-w-lg bg-white p-6 rounded-2xl shadow-lg">

//         <h2 className="text-xl font-bold mb-4 text-center">Edit Shop</h2>

//         {/* Loading */}
//         {fetching && (
//           <p className="text-sm text-gray-500 text-center mb-4">
//             Loading shop...
//           </p>
//         )}

//         {/* Error */}
//         {error && (
//           <div className="mb-4 p-3 rounded bg-red-50 text-red-600 text-sm">
//             {error}
//           </div>
//         )}

//         {/* Success */}
//         {success && (
//           <div className="mb-4 p-3 rounded bg-green-50 text-green-600 text-sm">
//             {success}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">

//           <input
//             value={form.name}
//             onChange={(e) => handleChange("name", e.target.value)}
//             placeholder="Shop Name"
//             className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
//           />

//           <input
//             value={form.location}
//             onChange={(e) => handleChange("location", e.target.value)}
//             placeholder="Location"
//             className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
//           />

//           <textarea
//             value={form.description}
//             onChange={(e) => handleChange("description", e.target.value)}
//             placeholder="Description"
//             className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
//           />

//           {/* Image Preview */}
//           {preview && (
//             <img
//               src={preview}
//               alt="Preview"
//               className="h-32 w-full object-cover rounded-lg"
//             />
//           )}

//           <input
//             type="file"
//             onChange={(e) => handleImageChange(e.target.files[0])}
//             className="text-sm"
//           />

//           <button
//             disabled={loading}
//             className={`w-full py-3 rounded-lg text-white font-semibold ${
//               loading
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-blue-600 hover:bg-blue-700"
//             }`}
//           >
//             {loading ? "Updating..." : "Update Shop"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default EditShop;