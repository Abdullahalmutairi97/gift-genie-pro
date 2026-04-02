import { useCredits } from "@/contexts/CreditsContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const packages = [
  { credits: 50, price: "$4.99" },
  { credits: 100, price: "$8.99" },
  { credits: 250, price: "$19.99" },
  { credits: 500, price: "$34.99" },
];

export function BuyCreditsDialog({ children }: { children?: React.ReactNode }) {
  const { addCredits } = useCredits();
  const [open, setOpen] = useState(false);

  const handleBuy = (amount: number) => {
    addCredits(amount);
    toast.success(`${amount} credits added to your account!`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-1.5">
            <Coins className="h-4 w-4" /> Buy Credits
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Buy Credits</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 mt-4">
          {packages.map((pkg) => (
            <button
              key={pkg.credits}
              onClick={() => handleBuy(pkg.credits)}
              className="glass-card p-4 text-center hover:border-primary/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-center gap-1 text-primary text-xl font-semibold mb-1">
                <Coins className="h-5 w-5" />
                {pkg.credits}
              </div>
              <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{pkg.price}</div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
