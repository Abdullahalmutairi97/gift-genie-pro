import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { productName } = await req.json();

    if (!productName?.trim()) {
      return new Response(JSON.stringify({ error: "Product name is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are Muhtar, an AI product comparison assistant. You compare real products with their best alternatives.

RULES:
- Only use REAL products with real brand names
- Use realistic estimated prices in SAR (Saudi Riyal). Format as "SAR XX" (e.g. "SAR 150")
- Provide 2-3 real pros and 2-3 real cons per product
- Compare the searched product with 2 relevant alternatives (3 products total)
- Write a helpful AI summary comparing all products
- Pick a "bestValue" and optionally a "bestPremium" from the product names
- For "shopUrl", generate a search URL on a real Saudi shopping site. Prefer these in order: https://www.amazon.sa/s?k= , https://www.noon.com/saudi-en/search?q= , https://www.jarir.com/sa-en/catalogsearch/result/?q= , or https://www.aliexpress.com/wholesale?SearchText= . Pick whichever site is most likely to carry the product.
- For "image", try to provide a real product image URL from the manufacturer or a major retailer. If you cannot confidently provide a real working image URL, set image to null.

You MUST respond with a JSON object with these exact fields:
{
  "products": [
    {"name": "Product Name", "brand": "Brand", "price": "SAR XX", "image": "url or null", "pros": ["pro1", "pro2"], "cons": ["con1", "con2"], "shopUrl": "https://www.amazon.sa/s?k=..."}
  ],
  "aiSummary": "Comparison summary text",
  "bestValue": "Product Name",
  "bestPremium": "Product Name or null"
}

Return ONLY the JSON object, no other text.`;

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
          { role: "user", content: `Compare "${productName}" with its best alternatives.` },
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
    const content = data.choices?.[0]?.message?.content || "{}";

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { products: [], aiSummary: "No results", bestValue: "" };

    // Ensure shopUrl exists for each product
    if (result.products) {
      result.products = result.products.map((p: any) => ({
        ...p,
        image: p.image || null,
        shopUrl: p.shopUrl || `https://www.amazon.sa/s?k=${encodeURIComponent(`${p.name} ${p.brand || ""}`.trim())}`,
      }));
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("compare-products error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
