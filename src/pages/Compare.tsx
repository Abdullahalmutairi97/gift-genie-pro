import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCredits } from "@/contexts/CreditsContext";
import { useHistory } from "@/contexts/HistoryContext";
import { getAIProvider, CompareResult } from "@/services/ai";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { BuyCreditsDialog } from "@/components/BuyCreditsDialog";
import { Search, Sparkles, AlertCircle, RotateCcw, Check, X, Trophy, Crown, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function ComparePage() {
  const [productName, setProductName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { deductCredits, hasEnough } = useCredits();
  const { addHistory } = useHistory();

  const handleCompare = async () => {
    if (!productName.trim()) {
      toast.error("Please enter a product name");
      return;
    }
    if (!hasEnough()) {
      toast.error("Insufficient credits.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      deductCredits();
      const provider = getAIProvider();
      const res = await provider.compareProducts({ productName: productName.trim() });
      setResult(res);
      addHistory({ type: "compare", query: productName.trim(), creditsUsed: 5, results: res });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="font-display text-2xl font-semibold">Compare Products</h2>
        <p className="text-muted-foreground">Enter a product name and AI will compare it with relevant alternatives.</p>
      </div>

      <div className="glass-card p-5 space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Product Name</label>
          <Input
            placeholder="e.g. AirPods Pro 2"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCompare()}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">This will use 5 credits</span>
          {!hasEnough() ? (
            <BuyCreditsDialog>
              <Button variant="outline" size="sm" className="gap-1.5"><AlertCircle className="h-4 w-4" /> Get Credits</Button>
            </BuyCreditsDialog>
          ) : (
            <Button onClick={handleCompare} disabled={loading} className="gap-2">
              <Search className="h-4 w-4" /> Compare
            </Button>
          )}
        </div>
      </div>

      {loading && <LoadingSkeleton count={3} />}

      {error && (
        <div className="glass-card p-8 text-center space-y-3">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
          <p className="font-medium">{error}</p>
          <Button variant="outline" onClick={handleCompare} className="gap-2"><RotateCcw className="h-4 w-4" /> Try Again</Button>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* AI Summary */}
          <div className="glass-card p-5 border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-display text-lg font-semibold">AI Summary</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">{result.aiSummary}</p>
          </div>

          {/* Products */}
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
            {result.products.map((product, i) => {
              const isBestValue = product.name === result.bestValue;
              const isBestPremium = product.name === result.bestPremium;
              return (
                <div
                  key={i}
                  className={`glass-card overflow-hidden animate-scale-in ${isBestValue ? "ring-2 ring-primary/50" : ""}`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {(isBestValue || isBestPremium) && (
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary text-xs font-medium">
                      {isBestValue ? <Trophy className="h-3.5 w-3.5" /> : <Crown className="h-3.5 w-3.5" />}
                      {isBestValue ? "Best Value" : "Premium Choice"}
                    </div>
                  )}
                  {product.image && (
                    <div className="aspect-[4/3] overflow-hidden bg-secondary">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLElement).parentElement!.style.display = 'none'; }} />
                    </div>
                  )}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold">{product.name}</h4>
                        {product.brand && <p className="text-xs text-muted-foreground">{product.brand}</p>}
                      </div>
                      <span className="text-primary font-semibold px-2 py-0.5 rounded-md bg-primary/10 transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:scale-110 hover:-translate-y-0.5 cursor-default">{product.price}</span>
                    </div>
                    <div className="space-y-1.5">
                      {product.pros.map((pro, j) => (
                        <div key={j} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{pro}</span>
                        </div>
                      ))}
                      {product.cons.map((con, j) => (
                        <div key={j} className="flex items-start gap-2 text-sm">
                          <X className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{con}</span>
                        </div>
                      ))}
                    </div>
                    <a href={product.shopUrl || `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(product.name)}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="w-full gap-2 mt-1">
                        <ExternalLink className="h-3.5 w-3.5" /> Take me there
                      </Button>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
