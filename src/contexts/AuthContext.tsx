import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  phone: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (phone: string) => User | null;
  register: (phone: string, name: string) => User;
  signOut: () => void;
  checkUserExists: (phone: string) => User | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_KEY = "muhtar_users";
const SESSION_KEY = "muhtar_session";

function getStoredUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const s = localStorage.getItem(SESSION_KEY);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  }, [user]);

  const checkUserExists = (phone: string): User | null => {
    return getStoredUsers().find((u) => u.phone === phone) || null;
  };

  const signIn = (phone: string): User | null => {
    const found = checkUserExists(phone);
    if (found) setUser(found);
    return found;
  };

  const register = (phone: string, name: string): User => {
    const newUser = { phone, name };
    const users = getStoredUsers();
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    setUser(newUser);
    return newUser;
  };

  const signOut = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, signIn, register, signOut, checkUserExists }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
