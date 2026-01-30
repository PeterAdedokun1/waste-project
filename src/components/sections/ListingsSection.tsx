import { Button } from "@/components/ui/button";
import { MapPin, Clock, Package, ArrowUpRight, Minus, Plus } from "lucide-react";
import { useState } from "react";

const listings = [
  {
    id: 1,
    title: "Industrial Plastic Waste",
    type: "Plastic",
    quantity: "2.5 tons",
    location: "Mumbai, Maharashtra",
    askingPrice: 18000,
    timePosted: "2 hours ago",
    offers: 4,
    image: "🏭",
  },
  {
    id: 2,
    title: "Office Paper & Cardboard",
    type: "Paper",
    quantity: "800 kg",
    location: "Bangalore, Karnataka",
    askingPrice: 12000,
    timePosted: "5 hours ago",
    offers: 7,
    image: "📦",
  },
  {
    id: 3,
    title: "E-Waste Components",
    type: "Electronics",
    quantity: "150 kg",
    location: "Delhi NCR",
    askingPrice: 45000,
    timePosted: "1 day ago",
    offers: 12,
    image: "💻",
  },
  {
    id: 4,
    title: "Metal Scrap & Alloys",
    type: "Metal",
    quantity: "5 tons",
    location: "Chennai, Tamil Nadu",
    askingPrice: 85000,
    timePosted: "3 hours ago",
    offers: 9,
    image: "🔩",
  },
];

const ListingCard = ({ listing }: { listing: typeof listings[0] }) => {
  const [offerAmount, setOfferAmount] = useState(listing.askingPrice * 0.85);

  const adjustOffer = (delta: number) => {
    setOfferAmount(prev => Math.max(1000, prev + delta));
  };

  return (
    <div className="bg-card rounded-3xl p-6 shadow-soft border border-border hover:shadow-elevated transition-all duration-300 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">
            {listing.image}
          </div>
          <div>
            <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full mb-1">
              {listing.type}
            </span>
            <h3 className="font-display font-bold text-foreground">
              {listing.title}
            </h3>
          </div>
        </div>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {listing.timePosted}
        </span>
      </div>

      {/* Details */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <span className="flex items-center gap-1">
          <Package className="w-4 h-4" />
          {listing.quantity}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {listing.location}
        </span>
      </div>

      {/* Pricing */}
      <div className="bg-muted/50 rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">Asking Price</span>
          <span className="font-display font-bold text-foreground text-lg">
            ₹{listing.askingPrice.toLocaleString()}
          </span>
        </div>
        
        {/* Offer Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Your Offer</span>
            <span className="font-display font-bold text-primary text-lg">
              ₹{offerAmount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => adjustOffer(-1000)}
              className="w-10 h-10 rounded-xl bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
            >
              <Minus className="w-4 h-4 text-foreground" />
            </button>
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-hero-gradient rounded-full transition-all duration-200"
                style={{ width: `${(offerAmount / listing.askingPrice) * 100}%` }}
              />
            </div>
            <button
              onClick={() => adjustOffer(1000)}
              className="w-10 h-10 rounded-xl bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
            >
              <Plus className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {listing.offers} offers received
        </span>
        <Button variant="negotiate" size="sm">
          Make Offer
          <ArrowUpRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

const ListingsSection = () => {
  return (
    <section id="listings" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
          <div>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Active Listings
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              Browse available waste materials and make your offers.
            </p>
          </div>
          <Button variant="outline" size="lg">
            View All Listings
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ListingsSection;
