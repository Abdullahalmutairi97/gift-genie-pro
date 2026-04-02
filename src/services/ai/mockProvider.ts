import { AIProvider, GiftSearchParams, ProductResult, CompareParams, CompareResult } from "./types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const giftDatabase: Record<string, ProductResult[]> = {
  tech: [
    { name: "Apple AirPods Pro 2", brand: "Apple", price: "$249", image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=400&fit=crop", aiReason: "Premium wireless earbuds perfect for music lovers and tech enthusiasts. Great noise cancellation for everyday use." },
    { name: "Samsung Galaxy Watch 6", brand: "Samsung", price: "$299", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop", aiReason: "A versatile smartwatch ideal for fitness tracking and staying connected on the go." },
    { name: "Kindle Paperwhite", brand: "Amazon", price: "$139", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop", aiReason: "Perfect for avid readers who enjoy a distraction-free reading experience." },
    { name: "JBL Flip 6", brand: "JBL", price: "$129", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop", aiReason: "Portable Bluetooth speaker with powerful sound, great for outdoor gatherings." },
  ],
  fashion: [
    { name: "Ray-Ban Wayfarer Sunglasses", brand: "Ray-Ban", price: "$163", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop", aiReason: "Timeless classic sunglasses that complement any style and occasion." },
    { name: "Nike Air Max 90", brand: "Nike", price: "$130", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop", aiReason: "Iconic sneakers combining comfort and style, perfect for everyday wear." },
    { name: "Daniel Wellington Classic Watch", brand: "Daniel Wellington", price: "$189", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop", aiReason: "Elegant minimalist watch that adds a touch of sophistication to any outfit." },
  ],
  sports: [
    { name: "Garmin Venu 3", brand: "Garmin", price: "$449", image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&h=400&fit=crop", aiReason: "Advanced fitness smartwatch with detailed health metrics for serious athletes." },
    { name: "Hydro Flask Water Bottle", brand: "Hydro Flask", price: "$44", image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop", aiReason: "Keeps drinks cold for 24 hours, ideal for active lifestyles and outdoor activities." },
    { name: "Theragun Mini", brand: "Therabody", price: "$199", image: "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&h=400&fit=crop", aiReason: "Compact massage gun for muscle recovery after workouts and physical activity." },
  ],
  gaming: [
    { name: "PlayStation 5 DualSense Controller", brand: "Sony", price: "$69", image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop", aiReason: "Immersive gaming controller with haptic feedback for an enhanced gaming experience." },
    { name: "Razer BlackShark V2", brand: "Razer", price: "$99", image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=400&fit=crop", aiReason: "High-quality gaming headset with excellent sound isolation and comfort." },
    { name: "Nintendo Switch OLED", brand: "Nintendo", price: "$349", image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400&h=400&fit=crop", aiReason: "Versatile gaming console that works both at home and on the go." },
  ],
  general: [
    { name: "Moleskine Classic Notebook", brand: "Moleskine", price: "$19", image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&h=400&fit=crop", aiReason: "Premium notebook for creative minds who love writing and journaling." },
    { name: "Yankee Candle Large Jar", brand: "Yankee Candle", price: "$29", image: "https://images.unsplash.com/photo-1602607688066-8919f5abe6e3?w=400&h=400&fit=crop", aiReason: "A thoughtful home gift that creates a warm and cozy atmosphere." },
    { name: "Fujifilm Instax Mini 12", brand: "Fujifilm", price: "$79", image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop", aiReason: "Fun instant camera for capturing and sharing memories instantly." },
  ],
};

function categorize(interests: string): string {
  const lower = interests.toLowerCase();
  if (/tech|gadget|computer|phone|electronic/.test(lower)) return "tech";
  if (/fashion|cloth|style|wear|shoe/.test(lower)) return "fashion";
  if (/sport|fitness|gym|run|exercise/.test(lower)) return "sports";
  if (/game|gaming|video|play/.test(lower)) return "gaming";
  return "general";
}

function filterByPrice(products: ProductResult[], min: number, max: number): ProductResult[] {
  return products.filter((p) => {
    const price = parseInt(p.price.replace(/[^0-9]/g, ""), 10);
    return price >= min && price <= max;
  });
}

const compareDatabase: Record<string, { products: CompareResult["products"]; aiSummary: string; bestValue: string; bestPremium?: string }> = {
  default: {
    products: [
      { name: "Apple AirPods Pro 2", brand: "Apple", price: "$249", image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=400&fit=crop", pros: ["Excellent noise cancellation", "Seamless Apple ecosystem", "Adaptive audio"], cons: ["Premium price", "No lossless Bluetooth", "Apple-centric features"] },
      { name: "Sony WF-1000XM5", brand: "Sony", price: "$279", image: "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=400&fit=crop", pros: ["Best-in-class ANC", "Hi-Res audio support", "Comfortable fit"], cons: ["Higher price point", "Bulkier case", "Touch controls can be finicky"] },
      { name: "Samsung Galaxy Buds 2 Pro", brand: "Samsung", price: "$179", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop", pros: ["Great value", "360 Audio", "Comfortable and compact"], cons: ["Best with Samsung devices", "Average call quality", "No multipoint"] },
    ],
    aiSummary: "All three earbuds offer premium noise cancellation and sound quality. The Samsung Galaxy Buds 2 Pro offers the best value at $179, while the Sony WF-1000XM5 leads in audio quality for audiophiles.",
    bestValue: "Samsung Galaxy Buds 2 Pro",
    bestPremium: "Sony WF-1000XM5",
  },
};

export class MockAIProvider implements AIProvider {
  async searchGifts(params: GiftSearchParams): Promise<ProductResult[]> {
    await delay(1500 + Math.random() * 1000);
    const category = categorize(params.interests);
    let results = [...(giftDatabase[category] || giftDatabase.general)];
    const filtered = filterByPrice(results, params.minPrice, params.maxPrice);
    if (filtered.length > 0) results = filtered;
    return results.slice(0, 4);
  }

  async compareProducts(params: CompareParams): Promise<CompareResult> {
    await delay(1800 + Math.random() * 1000);
    const data = compareDatabase.default;
    // Customize first product to match search
    const customized = { ...data, products: data.products.map((p, i) => i === 0 ? { ...p, name: params.productName } : p) };
    return customized;
  }
}
