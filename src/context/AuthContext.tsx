// src/context/AuthContext.tsx

"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  is_active?: boolean;
}

type LoginErrorCode = "INVALID_CREDENTIALS" | "ACCOUNT_INACTIVE" | "UNKNOWN_ERROR";

type LoginResult =
  | { success: true }
  | { success: false; errorCode: LoginErrorCode; message: string };

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // helper: normalize /api/auth/me responses (either { user } or bare user)
  const extractUser = (data: any): User | null => {
    if (!data) return null;
    if ("user" in data) return data.user || null;
    return data; // assume data itself is the user object
  };

  // Load user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.status === 401) {
          // Not logged in — normal for public visitors
          setUser(null);
          setLoading(false);
          return;
        }
        if (!res.ok) {
          console.warn("Unexpected auth response:", res.status);
          setUser(null);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setUser(extractUser(data));
      } catch (err) {
        console.warn("Auth check skipped (visitor mode).", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (res.ok) {
        // expect { user: {...}, success?: true }
        if (data && data.user) {
          setUser(data.user);
        } else {
          // fallback if API returns bare user
          setUser(extractUser(data));
        }
        return { success: true };
      }

      // Not OK → read errorCode/message from backend
      const errorCode: LoginErrorCode =
        data?.errorCode === "ACCOUNT_INACTIVE" || data?.errorCode === "INVALID_CREDENTIALS"
          ? data.errorCode
          : "UNKNOWN_ERROR";

      const message: string =
        typeof data?.message === "string" && data.message.trim().length > 0
          ? data.message
          : "Login failed";

      return {
        success: false,
        errorCode,
        message,
      };
    } catch (err) {
      console.error("Login request failed", err);
      return {
        success: false,
        errorCode: "UNKNOWN_ERROR",
        message: "Network error. Please try again.",
      };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = await res.json();
      setUser(extractUser(data));
    } catch {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

async function changePassword(currentPassword: string, newPassword: string) {
  const res = await fetch("/api/auth/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to change password");
  return data;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};