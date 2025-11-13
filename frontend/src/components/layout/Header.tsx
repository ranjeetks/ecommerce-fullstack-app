// src/components/layout/Header.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@context/AuthContext";

const Header: React.FC = () => {
  const { isLoggedIn, isCustomer, isAdmin, logout } = useAuth();

  return (
    <header className="bg-gray-900 text-white shadow-md">
      {/* 🔹 Top Bar: Logo + Search + User Menu */}
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
        {/* ✅ Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-yellow-400 hover:text-yellow-300 transition-colors"
        >
          MyShop
        </Link>

        {/* 🔍 Search Bar */}
        <div className="flex-1 max-w-lg relative">
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full px-4 py-2 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-full px-3 py-1 transition">
            🔍
          </button>
        </div>

        {/* 👤 Right Menu */}
        <div className="flex items-center gap-6 text-sm">
          {!isLoggedIn ? (
            // 🔸 Not Logged In
            <Link
              to="/"
              className="hover:text-yellow-400 transition-colors"
            >
              Login / Signup
            </Link>
          ) : (
            <>

              {/* 🔸 Customer-only Links */}
              {isCustomer && (
                <>
                          
                  <Link
                    to="/my-orders"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    My Orders
                  </Link>
                  <Link
                    to="/cart"
                    className="hover:text-yellow-400 transition-colors flex items-center"
                  >
                    🛒 <span className="ml-1">Cart</span>
                  </Link>
                  <Link
                    to="/wishlist"
                    className="hover:text-yellow-400 transition-colors flex items-center"
                  >
                    ❤️ <span className="ml-1">Wishlist</span>
                  </Link>
                </>
              )}

              {/* 🔸 Common Logged-in Link */}
              <button
                onClick={logout}
                className="hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* 🔸 Category Bar */}
      <nav className="bg-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-2 flex flex-wrap items-center gap-6 text-sm text-gray-300">
          <Link
            to="/products"
            className="hover:text-yellow-400 transition-colors"
          >
            All Products
          </Link>
          <Link
            to="/category/electronics"
            className="hover:text-yellow-400 transition-colors"
          >
            Electronics
          </Link>
          <Link
            to="/category/fashion"
            className="hover:text-yellow-400 transition-colors"
          >
            Fashion
          </Link>
          <Link
            to="/category/deals"
            className="hover:text-yellow-400 transition-colors"
          >
            Deals
          </Link>

          {/* 🔹 Admin-only shortcut link (optional placement) */}
          {isAdmin && (
            <Link
              to="/admin/products"
              className="ml-auto text-yellow-400 hover:text-yellow-300 transition-colors font-medium"
            >
              Manage Products
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;