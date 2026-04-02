import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { gender, age, interests, minPrice, maxPrice } = await req.json();

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
- Only suggest REAL products with real brand names
- Use realistic estimated prices in USD
- Provide a short, warm explanation of why each gift fits the person
- Return exactly 4 product suggestions (or fewer if you truly can't find 4)
- For "shopUrl", generate a Google Shopping search URL: https://www.google.com/search?tbm=shop&q= followed by the URL-encoded product name and brand
- For "image", try to provide a real product image URL from the manufacturer or a major retailer. If you cannot confidently provide a real working image URL, set image to null.

You MUST respond with a JSON array of objects with these exact fields:
[{"name": "Product Name", "brand": "Brand", "price": "$XX", "image": "url or null", "aiReason": "Why this gift fits", "shopUrl": "https://www.google.com/search?tbm=shop&q=..."}]

Return ONLY the JSON array, no other text.`;

    const userPrompt = `Find gift suggestions for:
- Gender: ${gender}
- Age: ${age}
- Interests: ${interests}
- Budget: $${minPrice || 0} – $${maxPrice || 10000}`;

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

    // Ensure shopUrl exists for each product
    products = products.slice(0, 4).map((p: any) => ({
      ...p,
      image: p.image || null,
      shopUrl: p.shopUrl || `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(`${p.name} ${p.brand || ""}`).trim()}`,
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
