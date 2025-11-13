import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getProducts, deleteProduct } from "@services/productService";
import ConfirmDeleteDialog from "@components/common/ConfirmDeleteDialog";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { formatCurrency } from "@services/formatService";
import type { Product } from "interfaces/product";
import { Paging } from "@constants/constant";

const PAGE_SIZE = Paging.PAGE_SIZE;

const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<keyof Product | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const navigate = useNavigate();

  // ✅ Fetch Products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      const normalizedProducts: Product[] = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
        ? data.results
        : [];

      setProducts(normalizedProducts);
      setFiltered(normalizedProducts);
      setError("");
    } catch (err) {
      console.error("Error loading products:", err);
      setError("❌ Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ Search Filter
  useEffect(() => {
    let updated = [...products];

    if (search.trim() !== "") {
      updated = updated.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortField) {
      updated.sort((a: any, b: any) => {
        if (a[sortField] < b[sortField]) return sortOrder === "asc" ? -1 : 1;
        if (a[sortField] > b[sortField]) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    setFiltered(updated);
    setCurrentPage(1); // reset pagination after search
  }, [search, products, sortField, sortOrder]);

  // ✅ Sorting Handler
  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // ✅ Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // ✅ Delete Product
  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteProduct(deleteId);
      setSnackbar({
        open: true,
        message: "✅ Product deleted successfully",
        severity: "success",
      });
      setDeleteId(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "❌ Failed to delete product",
        severity: "error",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4">
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        {/* 🏷️ Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Manage Products</h2>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="🔍 Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full sm:w-64 focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm"
            />
            <button
              onClick={() => navigate("/admin/products/new")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition text-sm w-full sm:w-auto"
            >
              <AddIcon className="w-5 h-5" />
              Add Product
            </button>
          </div>
        </div>

        {/* 🚨 Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* ⏳ Loading */}
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <svg
              className="animate-spin h-6 w-6 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
          </div>
        ) : paginatedProducts.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            No products found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    #
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none"
                    onClick={() => handleSort("name")}
                  >
                    Product
                    {sortField === "name" &&
                      (sortOrder === "asc" ? (
                        <ArrowUpwardIcon className="inline ml-1 text-xs" />
                      ) : (
                        <ArrowDownwardIcon className="inline ml-1 text-xs" />
                      ))}
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none"
                    onClick={() => handleSort("price")}
                  >
                    Price
                    {sortField === "price" &&
                      (sortOrder === "asc" ? (
                        <ArrowUpwardIcon className="inline ml-1 text-xs" />
                      ) : (
                        <ArrowDownwardIcon className="inline ml-1 text-xs" />
                      ))}
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none"
                    onClick={() => handleSort("stock")}
                  >
                    Stock
                    {sortField === "stock" &&
                      (sortOrder === "asc" ? (
                        <ArrowUpwardIcon className="inline ml-1 text-xs" />
                      ) : (
                        <ArrowDownwardIcon className="inline ml-1 text-xs" />
                      ))}
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((p, idx) => (
                  <tr
                    key={p.id}
                    className={`border-b hover:bg-gray-50 transition ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-700">{p.id}</td>
                    <td className="px-4 py-3 flex items-center gap-3">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded-md border"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded-md text-gray-400 text-xl">
                          🛍️
                        </div>
                      )}
                      <span className="font-medium text-gray-800 truncate max-w-xs">
                        {p.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatCurrency(Number(p.price) || 0, "INR", "en-IN")}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {p.stock > 0 ? (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                          In Stock ({p.stock})
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-medium">
                          Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            navigate(`/admin/products/${p.id}/edit`)
                          }
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <EditIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <DeleteIcon className="w-5 h-5" />
                        </button>
                        <Link
                          to={`/admin/products/${p.id}`}
                          className="text-gray-600 hover:text-gray-800 text-sm border border-gray-300 px-2 py-1 rounded-md"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 📄 Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
              className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
            >
              ← Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i + 1)}
                className={`px-3 py-1 border rounded-md text-sm ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
              className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        )}

        {/* 🗑️ Delete Confirmation */}
        {deleteId !== null && (
          <ConfirmDeleteDialog
            open={deleteId !== null}
            onClose={() => setDeleteId(null)}
            onConfirm={handleDelete}
          />
        )}

        {/* 🔔 Snackbar */}
        {snackbar.open && (
          <div className="fixed top-5 right-5 bg-white border shadow-lg rounded-md px-4 py-3 flex items-center justify-between w-72 animate-fade-in">
            <div
              className={`text-sm ${
                snackbar.severity === "success"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {snackbar.message}
            </div>
            <button
              onClick={() => setSnackbar({ ...snackbar, open: false })}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListPage;