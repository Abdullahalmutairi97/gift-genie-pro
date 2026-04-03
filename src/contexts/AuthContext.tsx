import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  phone: string;
  name: string;
  user_id: string;
}

interface AuthContextType {
  user: Profile | null;
  isAuthenticated: boolean;
  loading: boolean;
  sendOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (phone: string, code: string) => Promise<{ success: boolean; isNewUser?: boolean; error?: string }>;
  registerUser: (phone: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single();
        if (profile) {
          setUser({ phone: profile.phone, name: profile.name, user_id: profile.user_id });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single();
        if (profile) {
          setUser({ phone: profile.phone, name: profile.name, user_id: profile.user_id });
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const sendOtp = async (phone: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("otp-auth", {
        body: { action: "send", phone },
      });
      if (error) return { success: false, error: error.message };
      if (data?.error) return { success: false, error: data.error };
      return { success: true };
    } catch {
      return { success: false, error: "Failed to send OTP" };
    }
  };

  const verifyOtp = async (phone: string, code: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("otp-auth", {
        body: { action: "verify", phone, code },
      });
      if (error) return { success: false, error: error.message };
      if (data?.error) return { success: false, error: data.error };

      if (!data.isNewUser && data.token) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: data.token,
          type: "magiclink",
        });
        if (verifyError) {
          console.error("Auth verifyOtp error:", verifyError);
          return { success: false, error: verifyError.message };
        }
      }

      return { success: true, isNewUser: data.isNewUser };
    } catch (e) {
      console.error("verifyOtp catch:", e);
      return { success: false, error: "Verification failed" };
    }
  };

  const registerUser = async (phone: string, name: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("otp-auth", {
        body: { action: "register", phone, name },
      });
      if (error) return { success: false, error: error.message };
      if (data?.error) return { success: false, error: data.error };

      if (data.actionLink) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: data.token,
          type: "magiclink",
        });
        if (verifyError) return { success: false, error: verifyError.message };
      }

      return { success: true };
    } catch {
      return { success: false, error: "Registration failed" };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, sendOtp, verifyOtp, registerUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
