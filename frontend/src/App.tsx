import Layout from "./components/layout/Layout";
import { ProductListPage, ProductFormPage,ProductDetailsPage } 
from "@pages/Products";

// import Products from "./pages/Products"; // will add later
// import Cart from "./pages/Cart"; // will add later

import { Routes, Route } from "react-router-dom";
import AuthPage from "./pages/Auth/AuthPage";
import Dashboard from "./pages/Auth/Dashboard";
import { refreshAccessToken } from "@services/api";
import { useEffect } from "react";
import CartPage from "@pages/Cart/CartPage";
import WishlistPage from "@pages/Wishlist/WishlistPage";
import ProductList from "@pages/Products/ProductListFor_CartWishlist";
import RoleRoute from "@routes/RoleRoute";
import NotAuthorized from "@pages/NotAuthorized";
import CheckoutStripe from "@pages/Payments/CheckoutStripe";
import CheckoutRazorpay from "@pages/Payments/CheckoutRazorpay";
import Success from "@pages/Payments/Success";
import Failure from "@pages/Payments/Failure"; // 👈 Import failure page
import MyOrdersPage from "@pages/Orders/MyOrdersPage";


function App() {
  // merge from microdem

  useEffect(() => {
  const checkLogin = async () => {
    const refreshToken = localStorage.getItem("refresh");
    if (!refreshToken) return; // 🔹 Skip if no token

    try {
      await refreshAccessToken();
    } catch (err) {
      console.error("Token refresh failed", err);
    }
  };
  checkLogin();
}, []);

  //merge end

  return (

    <Layout>
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        {/* Future pages */}
        {/* <Route path="/products" element={<Products />} /> */}
        {/* <Route path="/cart" element={<Cart />} /> */}
        <Route path="/not-authorized" element={<NotAuthorized />} />
        <Route path="/" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <RoleRoute>
              <Dashboard />
           </RoleRoute>
          }
        />
        {/* Admin-only */}
          <Route path="/admin/products" 
          element={
          
            <RoleRoute requiredRole="ADMIN">
              <ProductListPage />
            </RoleRoute>
     
          } />
          <Route path="/admin/products/new" 
          element={
     
            <RoleRoute requiredRole="ADMIN">
              <ProductFormPage />
            </RoleRoute>
   
          } />
          <Route path="/admin/products/:id" 
          element={
    
            <RoleRoute requiredRole="ADMIN">
              <ProductDetailsPage />
            </RoleRoute>
 
          } />
          <Route path="/admin/products/:id/edit" 
          element={
  
            <RoleRoute requiredRole="ADMIN">
              <ProductFormPage />
            </RoleRoute>
   
          } />

          <Route
          path="/products"
          element={
    
            <RoleRoute requiredRole="CUSTOMER">
              <ProductList />
            </RoleRoute>
  
              
          }
        />
        <Route
          path="/cart"
          element={
   
            <RoleRoute requiredRole="CUSTOMER">
              <CartPage />
            </RoleRoute>
     
          }
        />
        <Route
          path="/wishlist"
          element={
     
            <RoleRoute requiredRole="CUSTOMER">
              <WishlistPage />
            </RoleRoute>
      
          }
        />
      <Route path="/checkout-stripe" element={<CheckoutStripe />} />
        <Route path="/checkout-razorpay" element={<CheckoutRazorpay />} />
        <Route path="/success" element={<Success />} />
        <Route path="/failure" element={<Failure />} />

        <Route
        path="/my-orders"
        element={
          <RoleRoute requiredRole="CUSTOMER">
              <MyOrdersPage />
            </RoleRoute>
        }
      />

      </Routes>
      
    </Layout>
  );
}

export default App;