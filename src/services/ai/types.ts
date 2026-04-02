export interface GiftSearchParams {
  gender: string;
  age: string;
  interests: string;
  minPrice: number;
  maxPrice: number;
}

export interface ProductResult {
  name: string;
  brand?: string;
  price: string;
  image?: string;
  aiReason: string;
  shopUrl?: string;
}

export interface CompareParams {
  productName: string;
}

export interface CompareResult {
  products: CompareProduct[];
  aiSummary: string;
  bestValue: string;
  bestPremium?: string;
}

export interface CompareProduct {
  name: string;
  brand?: string;
  price: string;
  image?: string;
  pros: string[];
  cons: string[];
  shopUrl?: string;
}

export interface AIProvider {
  searchGifts(params: GiftSearchParams): Promise<ProductResult[]>;
  compareProducts(params: CompareParams): Promise<CompareResult>;
}
