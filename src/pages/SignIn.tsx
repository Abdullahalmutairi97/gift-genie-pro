import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Phone, ArrowRight, User, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Step = "phone" | "otp" | "name";

export default function SignIn() {
  const [step, setStep] = useState<Step>("phone");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { sendOtp, verifyOtp, registerUser } = useAuth();
  const navigate = useNavigate();

  const fullPhone = `+966${phoneDigits}`;

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneDigits.length < 9 || !phoneDigits.startsWith("5")) {
      toast.error("Please enter a valid Saudi phone number starting with 5");
      return;
    }
    setSubmitting(true);
    const res = await sendOtp(fullPhone);
    setSubmitting(false);
    if (res.success) {
      toast.success("OTP sent! (Use 123456)");
      setStep("otp");
    } else {
      toast.error(res.error || "Failed to send OTP");
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }
    setSubmitting(true);
    const res = await verifyOtp(fullPhone, otp);
    setSubmitting(false);
    if (!res.success) {
      toast.error(res.error || "Invalid OTP");
      return;
    }
    if (res.isNewUser) {
      setStep("name");
    } else {
      toast.success("Welcome back!");
      navigate("/gifts", { replace: true });
    }
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    setSubmitting(true);
    const res = await registerUser(fullPhone, name.trim());
    setSubmitting(false);
    if (res.success) {
      toast.success(`Welcome to Muhtar, ${name.trim()}!`);
      navigate("/gifts", { replace: true });
    } else {
      toast.error(res.error || "Registration failed");
    }
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

        {step === "phone" && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Phone Number</label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 rounded-lg bg-secondary text-sm font-medium text-foreground shrink-0">+966</div>
                <Input type="tel" placeholder="5XXXXXXXX" value={phoneDigits} onChange={(e) => setPhoneDigits(e.target.value.replace(/\D/g, "").slice(0, 9))} className="flex-1" autoFocus />
              </div>
              <p className="text-xs text-muted-foreground">Enter your Saudi mobile number</p>
            </div>
            <Button type="submit" className="w-full gap-2" size="lg" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
              Continue <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Enter OTP</label>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className="text-xs text-muted-foreground text-center">Enter the 6-digit code sent to {fullPhone}</p>
            </div>
            <Button type="submit" className="w-full gap-2" size="lg" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              Verify <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
            <Button type="button" variant="ghost" className="w-full text-sm" onClick={() => { setStep("phone"); setOtp(""); }}>
              Change phone number
            </Button>
          </form>
        )}

        {step === "name" && (
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">What's your name?</label>
              <Input type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
              <p className="text-xs text-muted-foreground">This is your first time with Muhtar</p>
            </div>
            <Button type="submit" className="w-full gap-2" size="lg" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <User className="h-4 w-4" />}
              Create Account <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
