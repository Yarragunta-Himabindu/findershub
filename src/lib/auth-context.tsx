import React, { createContext, useContext, useState, ReactNode } from "react";
import { User } from "./types";
import { currentUser } from "./dummy-data";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, _password: string) => {
    if (!email.endsWith("@college.edu")) return false;
    if (_password.length < 4) return false;
    setUser({ name: email.split("@")[0].replace(/\./g, " "), email });
    return true;
  };

  const register = (name: string, email: string, _password: string) => {
    if (!email.endsWith("@college.edu")) return false;
    setUser({ name, email });
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
