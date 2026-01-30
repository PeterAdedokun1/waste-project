import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="relative bg-hero-gradient rounded-[2rem] p-12 md:p-16 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white/90 font-medium text-sm mb-8">
              <Leaf className="w-4 h-4" />
              <span>Join the Circular Economy</span>
            </div>

            <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Turn Waste into Opportunity?
            </h2>
            <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
              Join thousands of generators, middlemen, and recyclers already trading on WasteFlow. 
              Start negotiating better deals today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="xl" 
                className="bg-white text-primary hover:bg-white/90 shadow-elevated hover:shadow-soft"
              >
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="xl"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
