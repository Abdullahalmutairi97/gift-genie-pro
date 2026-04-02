import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface HistoryItem {
  id: string;
  type: "gift" | "compare";
  query: string;
  date: string;
  creditsUsed: number;
  results: any;
}

interface HistoryContextType {
  history: HistoryItem[];
  addHistory: (item: Omit<HistoryItem, "id" | "date">) => void;
  clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextType | null>(null);
const HISTORY_KEY = "muhtar_history";

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); }, [history]);

  const addHistory = (item: Omit<HistoryItem, "id" | "date">) => {
    const newItem: HistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    setHistory((h) => [newItem, ...h]);
  };

  const clearHistory = () => setHistory([]);

  return (
    <HistoryContext.Provider value={{ history, addHistory, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
}

export const useHistory = () => {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error("useHistory must be used within HistoryProvider");
  return ctx;
};
