import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/contexts/CreditsContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Coins, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  title: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  const { user } = useAuth();
  const { credits } = useCredits();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <h1 className="font-display text-lg font-semibold text-foreground">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Coins className="h-4 w-4" />
          <span>{credits}</span>
        </div>
        {user && (
          <span className="text-sm text-muted-foreground hidden sm:block">{user.name}</span>
        )}
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8 text-muted-foreground hover:text-foreground">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
}
