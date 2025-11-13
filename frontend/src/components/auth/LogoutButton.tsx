// src/components/auth/LogoutButton.tsx
import { useAuth } from "@context/AuthContext";

const LogoutButton = () => {
  const { logout } = useAuth(); // 👈 use AuthContext

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  return (
    <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded mt-3 transition"
 onClick={handleLogout}>
      Logout
    </button>
  );
};

export default LogoutButton;