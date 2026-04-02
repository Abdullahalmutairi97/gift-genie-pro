import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Headphones, Info, Shield, Mail, Phone, Clock, HelpCircle, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 glass-card hover:border-primary/30 transition-colors text-left">
        <span className="text-sm font-medium pr-4">{q}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4 pt-0 text-sm text-muted-foreground leading-relaxed">
        {a}
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function MorePage() {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-semibold">More</h2>

      <Tabs defaultValue="support" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="support" className="gap-1.5"><Headphones className="h-4 w-4" /> Support</TabsTrigger>
          <TabsTrigger value="about" className="gap-1.5"><Info className="h-4 w-4" /> About</TabsTrigger>
          <TabsTrigger value="rules" className="gap-1.5"><Shield className="h-4 w-4" /> Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="support" className="space-y-4">
          <div className="glass-card p-5 space-y-4">
            <h3 className="font-display text-lg font-semibold">Customer Support</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our support team is here to help you with any questions or issues. We aim to respond within 24 hours during business days.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-xs text-muted-foreground">support@muhtar.app</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-xs text-muted-foreground">+966 13 860 0000</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 sm:col-span-2">
                <Clock className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium">Working Hours</p>
                  <p className="text-xs text-muted-foreground">Sunday – Thursday, 9:00 AM – 5:00 PM (AST)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" /> FAQ
            </h3>
            <div className="space-y-2">
              <FAQItem q="How do credits work?" a="Each AI-powered search (gift discovery or product comparison) costs 5 credits. You start with 100 free credits and can purchase more anytime from your profile or the header." />
              <FAQItem q="Are the product suggestions real?" a="Yes, Muhtar uses AI to suggest real products with real brands and estimated market prices. Actual prices and availability may vary by retailer and region." />
              <FAQItem q="Can I get a refund on credits?" a="Credits are non-refundable once purchased. However, if you experience a technical issue where credits were deducted without results, please contact our support team." />
              <FAQItem q="Is my data secure?" a="Your data is stored locally on your device. We do not share personal information with third parties. For more details, see our Rules of Use." />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="about" className="space-y-4">
          <div className="glass-card p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-xl">M</span>
            </div>
            <h3 className="font-display text-xl font-semibold">About Muhtar</h3>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                Muhtar started as a senior project idea by 5 students from <strong className="text-foreground">Prince Mohammad Bin Fahd University (PMU)</strong> in <strong className="text-foreground">Al Khobar</strong>. The goal was simple but meaningful — create a platform that helps people discover gifts and compare products in a simpler, smarter, and more personalized way.
              </p>
              <p>
                We noticed that finding the right gift for someone can be surprisingly difficult. And when it comes to comparing products, the process often feels scattered across dozens of tabs and reviews. We wanted to change that.
              </p>
              <p>
                Muhtar uses AI to understand what you're looking for, suggest real products that match your needs, and compare alternatives side by side — all in one clean experience.
              </p>
              <p>
                What started as a university project has grown into something we truly believe in. We hope Muhtar makes your next gift or purchase decision just a little bit easier.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="glass-card p-6 space-y-5">
            <h3 className="font-display text-xl font-semibold">Rules of Use</h3>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <div>
                <h4 className="font-medium text-foreground mb-1">Acceptable Use</h4>
                <p>Muhtar is designed for personal, non-commercial use. Users must not attempt to exploit, reverse-engineer, or abuse the platform's AI features or credit system.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Account Responsibility</h4>
                <p>You are responsible for maintaining the confidentiality of your account. Any activity that occurs under your phone number is your responsibility.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Credits Policy</h4>
                <p>Credits are consumed when performing AI-powered searches. Each action costs a fixed amount of credits. Purchased credits are non-refundable. Free starting credits are provided as a courtesy and may be adjusted.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Product Search Disclaimer</h4>
                <p>Product suggestions are generated by AI and are meant to be helpful recommendations. Muhtar does not guarantee the accuracy, availability, or pricing of any suggested product.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Comparison Disclaimer</h4>
                <p>Product comparisons are based on publicly available information and AI analysis. They are intended to assist your decision-making but should not be the sole basis for purchasing decisions.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Pricing Notice</h4>
                <p>All prices shown are estimated and may vary depending on the retailer, region, and time of purchase. Muhtar is not responsible for any discrepancies between displayed and actual prices.</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
