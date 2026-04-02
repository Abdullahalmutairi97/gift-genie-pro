import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useCredits } from "@/contexts/CreditsContext";
import { useHistory } from "@/contexts/HistoryContext";
import { getAIProvider, ProductResult } from "@/services/ai";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { BuyCreditsDialog } from "@/components/BuyCreditsDialog";
import { Sparkles, AlertCircle, RotateCcw, Gift, ExternalLink, Wallet } from "lucide-react";
import { toast } from "sonner";

const MIN_BUDGET = 100;
const MAX_BUDGET = 25000;

function formatSAR(value: number) {
  return `SAR ${value.toLocaleString()}`;
}

export default function GiftsPage() {
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [interests, setInterests] = useState("");
  const [budget, setBudget] = useState([500]);
  const [isHoveringSlider, setIsHoveringSlider] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ProductResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { deductCredits, hasEnough } = useCredits();
  const { addHistory } = useHistory();

  const handleSearch = async () => {
    if (!gender || !age || !interests.trim()) {
      toast.error("Please fill in gender, age, and interests");
      return;
    }
    if (!hasEnough()) {
      toast.error("Insufficient credits. Please buy more credits.");
      return;
    }
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      deductCredits();
      const provider = getAIProvider();
      const res = await provider.searchGifts({
        gender,
        age,
        interests: interests.trim(),
        minPrice: MIN_BUDGET,
        maxPrice: budget[0],
      });
      setResults(res);
      addHistory({ type: "gift", query: `${gender}, ${age}yo, ${interests}, ≤${formatSAR(budget[0])}`, creditsUsed: 5, results: res });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="font-display text-2xl font-semibold">Find the Perfect Gift</h2>
        <p className="text-muted-foreground">Tell us about the person and we'll suggest ideal gifts using AI.</p>
      </div>

      <div className="glass-card p-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Gender</label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Age</label>
            <Input type="number" placeholder="e.g. 25" value={age} onChange={(e) => setAge(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Interests & Hobbies</label>
          <Input placeholder="e.g. technology, fitness, reading" value={interests} onChange={(e) => setInterests(e.target.value)} />
        </div>

        {/* Budget Slider */}
        <div
          className="space-y-3"
          onMouseEnter={() => setIsHoveringSlider(true)}
          onMouseLeave={() => setIsHoveringSlider(false)}
        >
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Wallet className="h-4 w-4 text-primary" /> Budget
            </label>
            <span
              className={`text-sm font-semibold px-3 py-1 rounded-full transition-all duration-300 ${
                isHoveringSlider
                  ? "bg-primary text-primary-foreground scale-110 shadow-lg"
                  : "bg-primary/10 text-primary"
              }`}
            >
              ≤ {formatSAR(budget[0])}
            </span>
          </div>
          <Slider
            value={budget}
            onValueChange={setBudget}
            min={MIN_BUDGET}
            max={MAX_BUDGET}
            step={100}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatSAR(MIN_BUDGET)}</span>
            <span>{formatSAR(MAX_BUDGET)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">This will use 5 credits</span>
          {!hasEnough() ? (
            <BuyCreditsDialog>
              <Button variant="outline" size="sm" className="gap-1.5">
                <AlertCircle className="h-4 w-4" /> Get Credits
              </Button>
            </BuyCreditsDialog>
          ) : (
            <Button onClick={handleSearch} disabled={loading} className="gap-2">
              <Sparkles className="h-4 w-4" /> Discover Gifts
            </Button>
          )}
        </div>
      </div>

      {loading && <LoadingSkeleton count={4} />}

      {error && (
        <div className="glass-card p-8 text-center space-y-3">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
          <p className="text-foreground font-medium">{error}</p>
          <Button variant="outline" onClick={handleSearch} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Try Again
          </Button>
        </div>
      )}

      {results && results.length === 0 && (
        <div className="glass-card p-8 text-center space-y-2">
          <Gift className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="text-foreground font-medium">No gifts found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      )}

      {results && results.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> AI Suggestions
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {results.slice(0, 4).map((product, i) => (
              <div key={i} className="glass-card overflow-hidden group hover:border-primary/30 transition-all premium-shadow animate-scale-in" style={{ animationDelay: `${i * 100}ms` }}>
                {product.image && (
                  <div className="aspect-[4/3] overflow-hidden bg-secondary">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { (e.target as HTMLElement).parentElement!.style.display = 'none'; }} />
                  </div>
                )}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{product.name}</h4>
                      {product.brand && <p className="text-xs text-muted-foreground">{product.brand}</p>}
                    </div>
                    <span className="text-primary font-semibold shrink-0 px-2 py-0.5 rounded-md bg-primary/10 transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:scale-110 hover:-translate-y-0.5 cursor-default">
                      {product.price}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{product.aiReason}</p>
                  <a href={product.shopUrl || `https://www.amazon.sa/s?k=${encodeURIComponent(product.name)}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="w-full gap-2 mt-1">
                      <ExternalLink className="h-3.5 w-3.5" /> Take me there
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
