import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { User } from "./types";

type AuthResult = {
  success: boolean;
  message?: string;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const TOKEN_KEY = "findershub_auth_token";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const apiBaseUrl = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
    [],
  );

  const storeToken = (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  };

  const getToken = () => localStorage.getItem(TOKEN_KEY);

  const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY);
  };

  useEffect(() => {
    const loadUser = async () => {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          clearToken();
          setUser(null);
          setIsLoading(false);
          return;
        }

        const data = (await response.json()) as { user: User };
        setUser(data.user);
      } catch {
        clearToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadUser();
  }, [apiBaseUrl]);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      const data = (await response.json()) as {
        token?: string;
        user?: User;
        message?: string;
      };

      if (!response.ok || !data.token || !data.user) {
        return { success: false, message: data.message || "Login failed" };
      }

      storeToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch {
      return { success: false, message: "Server error. Please try again." };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
  ): Promise<AuthResult> => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const trimmedName = name.trim();
      const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmedName, email: normalizedEmail, password }),
      });

      const data = (await response.json()) as {
        token?: string;
        user?: User;
        message?: string;
      };

      if (!response.ok || !data.token || !data.user) {
        return { success: false, message: data.message || "Registration failed" };
      }

      storeToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch {
      return { success: false, message: "Server error. Please try again." };
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
