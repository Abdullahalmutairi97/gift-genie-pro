import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface CreditsContextType {
  credits: number;
  totalSpent: number;
  totalSearches: number;
  deductCredits: (amount?: number) => boolean;
  addCredits: (amount: number) => void;
  hasEnough: (amount?: number) => boolean;
}

const CreditsContext = createContext<CreditsContextType | null>(null);
const CREDITS_KEY = "muhtar_credits";
const STATS_KEY = "muhtar_stats";
const AI_COST = 5;

export function CreditsProvider({ children }: { children: ReactNode }) {
  const [credits, setCredits] = useState(() => {
    const stored = localStorage.getItem(CREDITS_KEY);
    return stored ? parseInt(stored, 10) : 100;
  });
  const [stats, setStats] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STATS_KEY) || '{"totalSpent":0,"totalSearches":0}');
    } catch {
      return { totalSpent: 0, totalSearches: 0 };
    }
  });

  useEffect(() => { localStorage.setItem(CREDITS_KEY, String(credits)); }, [credits]);
  useEffect(() => { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); }, [stats]);

  const hasEnough = (amount = AI_COST) => credits >= amount;

  const deductCredits = (amount = AI_COST) => {
    if (!hasEnough(amount)) return false;
    setCredits((c) => c - amount);
    setStats((s: any) => ({ totalSpent: s.totalSpent + amount, totalSearches: s.totalSearches + 1 }));
    return true;
  };

  const addCredits = (amount: number) => setCredits((c) => c + amount);

  return (
    <CreditsContext.Provider value={{ credits, totalSpent: stats.totalSpent, totalSearches: stats.totalSearches, deductCredits, addCredits, hasEnough }}>
      {children}
    </CreditsContext.Provider>
  );
}

export const useCredits = () => {
  const ctx = useContext(CreditsContext);
  if (!ctx) throw new Error("useCredits must be used within CreditsProvider");
  return ctx;
};
