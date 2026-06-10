import { Routes, Route } from "react-router-dom";

// Pages
import BookPickup from "../pages/BookPickup";
import Orders from "../pages/Orders";
import Layout from "../pages/Layout";
import Shops from "../pages/Shops";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import ShopDetails from "../pages/ShopDetails";
import Services from "../pages/Services";
import Home from "../pages/Home";
import EditShop from "../pages/EditShop";

// Components
import PrivateRoute from "../components/PrivateRouter";

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>

        {/* Home */}
        <Route index element={<Home />} />

        {/* Public */}
        <Route path="shops" element={<Shops />} />
        <Route path="shop/:id" element={<ShopDetails />} />
        <Route path="services" element={<Services />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="book-pickup" element={<BookPickup />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Protected */}
        

        <Route
          path="orders"
          element={
            <PrivateRoute>
              <Orders />
            </PrivateRoute>
          }
        />

        <Route
          path="edit-shop/:id"
          element={
            <PrivateRoute>
              <EditShop />
            </PrivateRoute>
          }
        />

      </Route>

      <Route
          path="dashboard"
          element={
            <PrivateRoute roleRequired="owner">
              <Dashboard />
            </PrivateRoute>
          }
        />
    </Routes>
  );
}






