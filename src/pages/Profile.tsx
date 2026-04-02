import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/contexts/CreditsContext";
import { useTheme } from "@/contexts/ThemeContext";
import { BuyCreditsDialog } from "@/components/BuyCreditsDialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { User, Phone, Coins, Search, Moon, Sun, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { credits, totalSpent, totalSearches } = useCredits();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    toast.success("Signed out successfully");
    navigate("/signin", { replace: true });
  };

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="font-display text-2xl font-semibold">Profile</h2>

      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{user?.name}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {user?.phone}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-4 text-center">
          <Coins className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-semibold">{credits}</p>
          <p className="text-xs text-muted-foreground">Credits</p>
        </div>
        <div className="glass-card p-4 text-center">
          <Search className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-semibold">{totalSearches}</p>
          <p className="text-xs text-muted-foreground">Searches</p>
        </div>
        <div className="glass-card p-4 text-center">
          <Coins className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-semibold">{totalSpent}</p>
          <p className="text-xs text-muted-foreground">Spent</p>
        </div>
      </div>

      <BuyCreditsDialog>
        <Button variant="outline" className="w-full gap-2"><Coins className="h-4 w-4" /> Buy Credits</Button>
      </BuyCreditsDialog>

      <div className="glass-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {theme === "dark" ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
          <div>
            <p className="text-sm font-medium">Theme</p>
            <p className="text-xs text-muted-foreground">{theme === "dark" ? "Dark Mode" : "Light Mode"}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={toggleTheme}>
          Switch to {theme === "dark" ? "Light" : "Dark"}
        </Button>
      </div>

      <Button variant="destructive" className="w-full gap-2" onClick={handleLogout}>
        <LogOut className="h-4 w-4" /> Sign Out
      </Button>
    </div>
  );
}
