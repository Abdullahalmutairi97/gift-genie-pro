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
- Return exactly 4 product suggestions
- For each product, provide a real Unsplash image URL in this format: https://images.unsplash.com/photo-{id}?w=400&h=400&fit=crop (use real Unsplash photo IDs related to the product)

You MUST respond with a JSON array of objects with these exact fields:
[{"name": "Product Name", "brand": "Brand", "price": "$XX", "image": "https://images.unsplash.com/photo-xxx?w=400&h=400&fit=crop", "aiReason": "Why this gift fits"}]

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
        model: "google/gemini-3-flash-preview",
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

    // Parse the JSON from the AI response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const products = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

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
