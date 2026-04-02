import { useHistory, HistoryItem } from "@/contexts/HistoryContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Gift, GitCompare, Clock, Coins } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export default function HistoryPage() {
  const { history } = useHistory();
  const [selected, setSelected] = useState<HistoryItem | null>(null);

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3 text-center">
        <Clock className="h-12 w-12 text-muted-foreground" />
        <h2 className="font-display text-xl font-semibold">No History Yet</h2>
        <p className="text-muted-foreground max-w-sm">Your gift discoveries and product comparisons will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-semibold">Search History</h2>
      <div className="space-y-3">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelected(item)}
            className="glass-card p-4 w-full text-left hover:border-primary/30 transition-colors flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              {item.type === "gift" ? <Gift className="h-5 w-5 text-primary" /> : <GitCompare className="h-5 w-5 text-primary" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-primary uppercase">{item.type === "gift" ? "Gift Search" : "Comparison"}</span>
              </div>
              <p className="text-sm font-medium text-foreground truncate">{item.query}</p>
              <p className="text-xs text-muted-foreground">{format(new Date(item.date), "MMM d, yyyy 'at' h:mm a")}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <Coins className="h-3.5 w-3.5" /> {item.creditsUsed}
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              {selected?.type === "gift" ? <Gift className="h-5 w-5 text-primary" /> : <GitCompare className="h-5 w-5 text-primary" />}
              {selected?.type === "gift" ? "Gift Results" : "Comparison Results"}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 mt-2">
              <p className="text-sm text-muted-foreground">Query: <span className="text-foreground">{selected.query}</span></p>
              <p className="text-sm text-muted-foreground">{format(new Date(selected.date), "MMMM d, yyyy 'at' h:mm a")}</p>

              {selected.type === "gift" && Array.isArray(selected.results) && (
                <div className="space-y-3 pt-2">
                  {selected.results.map((r: any, i: number) => (
                    <div key={i} className="flex gap-3 p-3 rounded-lg bg-secondary/50">
                      <img src={r.image} alt={r.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{r.name}</p>
                        <p className="text-xs text-primary">{r.price}</p>
                        <p className="text-xs text-muted-foreground mt-1">{r.aiReason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selected.type === "compare" && selected.results?.products && (
                <div className="space-y-3 pt-2">
                  <p className="text-sm text-muted-foreground">{selected.results.aiSummary}</p>
                  {selected.results.products.map((p: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{p.name}</p>
                        <span className="text-xs text-primary">{p.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
