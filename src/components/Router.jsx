import { Routes, Route } from "react-router-dom";

// Pages
import BookPickup from "../pages/BookPickup";
import Orders from "../pages/Orders";
import Layout from "../pages/Layout";
import Shops from "../pages/Shops";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Login from "../pages/Login"
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import ShopDetails from "../pages/ShopDetails"; 
import Services from "../pages/Services";


// Components
import PrivateRoute from "../components/PrivateRouter";
import Home from "../pages/Home";
import EditShop from "../pages/EditShop";

export default function Router() {
  return (
    <Routes>
      {/* Layout Wrapper */}
      <Route path="/" element={<Layout />}>
        
        {/* Homepage */}
        <Route index element={<Home />} />

        {/* Public Routes */}
        <Route path="bookpickup" element={<BookPickup />} />
        <Route path="shops" element={<Shops />} />

        {/* Shop Details (Booking Page) */}
        <Route path="shop/:id" element={
              <ShopDetails />
            } />
<Route path="/shops/:id" element={<ShopDetails />} />

        <Route path="about" element={<About />} />
        <Route path="services" element={<Services/>}/>
        <Route path="contact" element={<Contact />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="dashboard"
          element={
              <Dashboard />
            
          }
        />

        <Route
          path="orders"
          element={
            
              <Orders />
            
          }
        />
        <Route
          path="edit-shop/:id"
          element={
            
              <EditShop />
            
          }
        />
      </Route>

      
    </Routes>
  );
}