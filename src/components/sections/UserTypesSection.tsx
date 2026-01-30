import { Factory, Truck, RefreshCw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const userTypes = [
  {
    icon: Factory,
    title: "Waste Generators",
    description: "Industries, businesses, and households looking to sell or dispose of waste materials responsibly.",
    features: ["List waste materials", "Set asking prices", "Review offers", "Track pickups"],
    color: "primary" as const,
  },
  {
    icon: Truck,
    title: "Middlemen",
    description: "Collectors and transporters who connect generators with recyclers and manage logistics.",
    features: ["Browse listings", "Make counter-offers", "Manage routes", "Earn margins"],
    color: "accent" as const,
  },
  {
    icon: RefreshCw,
    title: "Recyclers",
    description: "Processing facilities and recycling plants seeking raw materials for sustainable production.",
    features: ["Find materials", "Negotiate bulk deals", "Schedule deliveries", "Verify quality"],
    color: "primary" as const,
  },
];

const UserTypesSection = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Who's on WasteFlow?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three types of users, one connected ecosystem. Find your role and start trading.
          </p>
        </div>

        {/* User Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {userTypes.map((type, index) => (
            <div
              key={type.title}
              className="group bg-card rounded-3xl p-8 shadow-soft border border-border hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                type.color === 'accent' ? 'bg-accent-gradient' : 'bg-hero-gradient'
              }`}>
                <type.icon className="w-7 h-7 text-primary-foreground" />
              </div>

              {/* Content */}
              <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                {type.title}
              </h3>
              <p className="text-muted-foreground mb-6">
                {type.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {type.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                Join as {type.title.split(' ')[0]}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UserTypesSection;
