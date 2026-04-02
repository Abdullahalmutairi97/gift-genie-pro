import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HARDCODED_OTP = "123456";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, phone, code, name } = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    if (action === "send") {
      if (!phone) throw new Error("Phone is required");

      // Store OTP (always 123456 for now)
      await supabase.from("otp_codes").insert({ phone, code: HARDCODED_OTP });

      return new Response(JSON.stringify({ success: true, message: "OTP sent" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "verify") {
      if (!phone || !code) throw new Error("Phone and code are required");

      // Check OTP
      const { data: otpRow } = await supabase
        .from("otp_codes")
        .select("*")
        .eq("phone", phone)
        .eq("code", code)
        .eq("verified", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!otpRow) {
        return new Response(JSON.stringify({ error: "Invalid or expired OTP" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Mark as verified
      await supabase.from("otp_codes").update({ verified: true }).eq("id", otpRow.id);

      // Check if user exists by looking up profile
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("phone", phone)
        .single();

      if (existingProfile) {
        // Sign in existing user - generate a magic link token
        const email = `${phone.replace("+", "")}@muhtar.phone`;
        const { data: signInData, error: signInError } = await supabase.auth.admin.generateLink({
          type: "magiclink",
          email,
        });

        if (signInError) throw signInError;

        return new Response(JSON.stringify({
          success: true,
          isNewUser: false,
          profile: existingProfile,
          token: signInData.properties?.hashed_token,
          actionLink: signInData.properties?.action_link,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, isNewUser: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "register") {
      if (!phone || !name) throw new Error("Phone and name are required");

      const email = `${phone.replace("+", "")}@muhtar.phone`;

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: crypto.randomUUID(),
        email_confirm: true,
      });

      if (authError) throw authError;

      // Create profile
      await supabase.from("profiles").insert({
        user_id: authData.user.id,
        phone,
        name,
      });

      // Generate sign-in link
      const { data: signInData, error: signInError } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email,
      });

      if (signInError) throw signInError;

      return new Response(JSON.stringify({
        success: true,
        profile: { phone, name, user_id: authData.user.id },
        token: signInData.properties?.hashed_token,
        actionLink: signInData.properties?.action_link,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("otp-auth error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
