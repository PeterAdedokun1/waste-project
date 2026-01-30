import { Package, DollarSign, Handshake, Truck } from "lucide-react";

const steps = [
  {
    icon: Package,
    step: "01",
    title: "List Your Waste",
    description: "Generators post waste materials with type, quantity, location, and asking price.",
  },
  {
    icon: DollarSign,
    step: "02",
    title: "Receive Offers",
    description: "Middlemen and recyclers view listings and submit their price offers.",
  },
  {
    icon: Handshake,
    step: "03",
    title: "Negotiate & Accept",
    description: "Counter-offer, negotiate, and accept the best deal for your materials.",
  },
  {
    icon: Truck,
    step: "04",
    title: "Schedule Pickup",
    description: "Arrange collection, track logistics, and complete the transaction.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A simple four-step process to turn your waste into value.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-24 left-[calc(12.5%+2rem)] right-[calc(12.5%+2rem)] h-0.5 bg-border" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.step} className="relative text-center">
                {/* Step Number & Icon */}
                <div className="relative inline-flex flex-col items-center mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-hero-gradient flex items-center justify-center shadow-glow mb-3 relative z-10">
                    <step.icon className="w-9 h-9 text-primary-foreground" />
                  </div>
                  <span className="font-display text-sm font-bold text-primary">
                    Step {step.step}
                  </span>
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
