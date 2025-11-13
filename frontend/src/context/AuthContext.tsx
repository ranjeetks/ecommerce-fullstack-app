import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, {
  login as loginService,
  logout as logoutService,
  saveTokens,
  getTokens,
  signup as signupService,
} from "@services/api";

// ---------------------------
// 🧩 Types
// ---------------------------
type Role = {
  id: number;
  name: string;
};

type User = {
  id: number;
  username: string;
  email: string;
  roles: Role[];
};

type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
  loading: boolean;
  signup: (email: string, password: string, username: string,confirmPassword: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

// ---------------------------
// 🧩 Context Setup
// ---------------------------
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ On first load, check token and fetch /me
  useEffect(() => {
    const tokens = getTokens();
    if (tokens?.access) {
      fetchCurrentUser();
    }
  }, []);

  // ✅ Fetch current user
  const fetchCurrentUser = async () => {
    try {
      const res = await api.get("/auth/me/");
      setUser(res.data);
      console.log("Fetched user from /me:", res.data);
    } catch (err) {
      console.error("Failed to fetch /me:", err);
      setUser(null);
    }
  };

  // ✅ Signup flow
  const signup = async (email: string, password: string, username: string,confirmPassword: string) => {
    try {
      setLoading(true);
      await signupService(email, password, username,confirmPassword);
      console.log("✅ Signup successful via API");
      // Optional: auto-login after signup
      navigate("/");
    } catch (err) {
      console.error("❌ Signup failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Login flow
  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      const loggedInUser = await loginService(username, password);

      // Save tokens
      saveTokens(loggedInUser.access, loggedInUser.refresh);

      const userData: User = {
        id: loggedInUser.id,
        username: loggedInUser.username,
        email: loggedInUser.email,
        roles: loggedInUser.roles,
      };

      setUser(userData);
      console.log("AuthContext login set user:", userData);

      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Login failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Logout flow
  const logout = () => {
    logoutService();
    setUser(null);
    navigate("/");
  };

  // ✅ Derived flags
  const isLoggedIn = !!user;
  const isAdmin = user?.roles?.some((r) => r.name === "ADMIN") ?? false;
  const isCustomer = user?.roles?.some((r) => r.name === "CUSTOMER") ?? false;

  console.log("AuthContext user:", user);
  console.log("Roles:", user?.roles?.map((r) => r.name));
  console.log("isAdmin:", isAdmin, "isCustomer:", isCustomer);

  // ✅ Provide all values
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isAdmin,
        isCustomer,
        loading,
        signup,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ---------------------------
// 🧩 Hook
// ---------------------------
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};