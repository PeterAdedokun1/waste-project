import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Users, Leaf } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-8 animate-fade-in">
            <Leaf className="w-4 h-4" />
            <span>Sustainable Waste Marketplace</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight animate-slide-up">
            Negotiate. Connect.{" "}
            <span className="text-gradient">Recycle.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            The first negotiation-based marketplace connecting waste generators, 
            middlemen, and recyclers. Set your price. Make your offer. Close the deal.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Button variant="hero" size="xl">
              Start Trading
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="xl">
              List Your Waste
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border">
              <div className="flex items-center justify-center gap-2 text-primary mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="font-display text-3xl font-bold">12K+</span>
              </div>
              <p className="text-sm text-muted-foreground">Successful Trades</p>
            </div>
            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border">
              <div className="flex items-center justify-center gap-2 text-primary mb-2">
                <Users className="w-5 h-5" />
                <span className="font-display text-3xl font-bold">5K+</span>
              </div>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border">
              <div className="flex items-center justify-center gap-2 text-primary mb-2">
                <Leaf className="w-5 h-5" />
                <span className="font-display text-3xl font-bold">850T</span>
              </div>
              <p className="text-sm text-muted-foreground">Waste Recycled</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
