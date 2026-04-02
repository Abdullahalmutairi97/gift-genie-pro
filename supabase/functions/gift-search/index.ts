import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { gender, age, interests, minPrice, maxPrice } = await req.json();
    const budgetMin = minPrice || 100;
    const budgetMax = maxPrice || 25000;

    if (!gender || !age || !interests) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are Muhtar, an AI gift discovery assistant. You suggest real, purchasable products as gift ideas.

RULES:
- Only suggest REAL products that are currently sold on Amazon.sa, Noon.com, Jarir.com, or AliExpress
- For the price, provide a realistic SAR price RANGE based on what the product actually costs on Saudi retailers. Format exactly as "SAR XX – SAR YY" (e.g. "SAR 120 – SAR 180"). Research the actual retail price carefully. Do NOT guess.
- Provide a short, warm explanation of why each gift fits the person
- Return exactly 4 product suggestions (or fewer if you truly can't find 4)
- For "shopUrl", generate a direct search URL on a real Saudi shopping site. Prefer: https://www.amazon.sa/s?k= , https://www.noon.com/saudi-en/search?q= , https://www.jarir.com/sa-en/catalogsearch/result/?q= , or https://www.aliexpress.com/wholesale?SearchText=
- For "image", set to null. Do not invent image URLs.

You MUST respond with a JSON array of objects with these exact fields:
[{"name": "Product Name", "brand": "Brand", "price": "SAR XX – SAR YY", "image": null, "aiReason": "Why this gift fits", "shopUrl": "https://www.amazon.sa/s?k=..."}]

Return ONLY the JSON array, no other text.`;

    const userPrompt = `Find gift suggestions for:
- Gender: ${gender}
- Age: ${age}
- Interests: ${interests}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    let products = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    products = products.slice(0, 4).map((p: any) => ({
      ...p,
      image: p.image || null,
      shopUrl: p.shopUrl || `https://www.amazon.sa/s?k=${encodeURIComponent(`${p.name} ${p.brand || ""}`.trim())}`,
    }));

    return new Response(JSON.stringify({ products }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("gift-search error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
