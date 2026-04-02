import { supabase } from "@/integrations/supabase/client";
import type { GiftSearchParams, ProductResult, CompareParams, CompareResult, AIProvider } from "./types";

export class LiveAIProvider implements AIProvider {
  async searchGifts(params: GiftSearchParams): Promise<ProductResult[]> {
    const { data, error } = await supabase.functions.invoke("gift-search", {
      body: params,
    });

    if (error) throw new Error(error.message || "Gift search failed");
    if (data?.error) throw new Error(data.error);
    return data?.products || [];
  }

  async compareProducts(params: CompareParams): Promise<CompareResult> {
    const { data, error } = await supabase.functions.invoke("compare-products", {
      body: params,
    });

    if (error) throw new Error(error.message || "Comparison failed");
    if (data?.error) throw new Error(data.error);
    return data as CompareResult;
  }
}
