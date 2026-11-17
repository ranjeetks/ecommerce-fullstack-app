import { createContext } from "react";

// ---------------------------
// 🧩 Types
// ---------------------------
export type Role = {
  id: number;
  name: string;
};

export type User = {
  id: number;
  username: string;
  email: string;
  roles: Role[];
};

export type AuthContextType = {
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
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
