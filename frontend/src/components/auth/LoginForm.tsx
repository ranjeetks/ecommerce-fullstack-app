// ✅ LoginForm.tsx - Converted to Bootstrap 5+
import { useState } from "react";
//import { useNavigate } from "react-router-dom";
//import { login } from "@services/api";
//import { saveTokens } from "@services/api";
import { useAuth } from "@context/AuthContext"; // 👈 import context
import { logger } from "@utils/logger";

const LoginForm = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  //const navigate = useNavigate();
  const { login } = useAuth(); // 👈 use login from context
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await login(formData.username, formData.password); 
      logger.info("User logged in successfully", {username: formData.username});
    } catch (err: any) {
      alert("ERROR - inside catch");
      console.error(err);
      setError(err.response?.data?.detail || "Login failed");
      logger.error("Login failed", { username: formData.username, error: err });
    } finally {
      setLoading(false);
    }
  };

return (
    <div className="max-w-md mx-auto mt-16 bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>

      {message && (
        <div className="mb-4 text-green-700 bg-green-100 border border-green-300 px-4 py-2 rounded-md">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 text-red-700 bg-red-100 border border-red-300 px-4 py-2 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            name="username"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleChange}
            required
            className={`w-full px-4 py-2 border ${
              error ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
            className={`w-full px-4 py-2 border ${
              error ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

        {loading && (
          <div className="flex justify-center my-3">
            <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 text-white font-semibold rounded-md transition ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
