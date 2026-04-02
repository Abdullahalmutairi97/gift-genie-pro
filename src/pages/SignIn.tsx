import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, ArrowRight, User } from "lucide-react";
import { toast } from "sonner";

export default function SignIn() {
  const [step, setStep] = useState<"phone" | "name">("phone");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [name, setName] = useState("");
  const { signIn, register, checkUserExists } = useAuth();
  const navigate = useNavigate();

  const fullPhone = `+966${phoneDigits}`;

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneDigits.length < 9 || !phoneDigits.startsWith("5")) {
      toast.error("Please enter a valid Saudi phone number starting with 5");
      return;
    }
    const existing = checkUserExists(fullPhone);
    if (existing) {
      signIn(fullPhone);
      toast.success(`Welcome back, ${existing.name}!`);
      navigate("/gifts", { replace: true });
    } else {
      setStep("name");
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    register(fullPhone, name.trim());
    toast.success(`Welcome to Muhtar, ${name.trim()}!`);
    navigate("/gifts", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-primary mx-auto flex items-center justify-center mb-4">
            <span className="text-primary-foreground font-display font-bold text-2xl">M</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Muhtar</h1>
          <p className="text-muted-foreground">AI-powered gift discovery & product comparison</p>
        </div>

        {step === "phone" ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Phone Number</label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 rounded-lg bg-secondary text-sm font-medium text-foreground shrink-0">
                  +966
                </div>
                <Input
                  type="tel"
                  placeholder="5XXXXXXXX"
                  value={phoneDigits}
                  onChange={(e) => setPhoneDigits(e.target.value.replace(/\D/g, "").slice(0, 9))}
                  className="flex-1"
                  autoFocus
                />
              </div>
              <p className="text-xs text-muted-foreground">Enter your Saudi mobile number</p>
            </div>
            <Button type="submit" className="w-full gap-2" size="lg">
              <Phone className="h-4 w-4" /> Continue
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
          </form>
        ) : (
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">What's your name?</label>
              <Input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">This is your first time with Muhtar</p>
            </div>
            <Button type="submit" className="w-full gap-2" size="lg">
              <User className="h-4 w-4" /> Create Account
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
