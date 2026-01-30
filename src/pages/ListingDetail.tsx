import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import MakeOfferDialog from "@/components/offers/MakeOfferDialog";
import UserRatingBadge from "@/components/reviews/UserRatingBadge";
import { toast } from "sonner";
import { 
  MapPin, 
  Package, 
  Clock, 
  ArrowLeft,
  IndianRupee,
  MessageSquare,
  User,
  Building2,
  Phone,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface Listing {
  id: string;
  title: string;
  description: string | null;
  waste_type: string;
  quantity: number;
  quantity_unit: string;
  asking_price: number;
  location: string;
  city: string | null;
  state: string | null;
  images: string[];
  offers_count: number;
  views_count: number;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string | null;
    company_name: string | null;
    phone: string | null;
    user_type: string;
  } | null;
}

const wasteTypeLabels: Record<string, string> = {
  plastic: "Plastic",
  paper: "Paper & Cardboard",
  metal: "Metal & Alloys",
  electronics: "E-Waste",
  organic: "Organic",
  textile: "Textile",
  glass: "Glass",
  rubber: "Rubber",
  wood: "Wood",
  other: "Other",
};

const wasteTypeEmojis: Record<string, string> = {
  plastic: "🏭",
  paper: "📦",
  metal: "🔩",
  electronics: "💻",
  organic: "🌿",
  textile: "👕",
  glass: "🫙",
  rubber: "🛞",
  wood: "🪵",
  other: "📋",
};

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id]);

  const fetchListing = async () => {
    const { data, error } = await supabase
      .from("waste_listings")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      toast.error("Listing not found");
      navigate("/browse");
      return;
    }

    // Fetch profile separately
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, company_name, phone, user_type")
      .eq("user_id", data.user_id)
      .maybeSingle();

    const listingWithProfile: Listing = {
      ...data,
      profiles: profile
    };

    setListing(listingWithProfile);
    setLoading(false);

    // Increment view count
    await supabase
      .from("waste_listings")
      .update({ views_count: (data.views_count || 0) + 1 })
      .eq("id", id);
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!listing) {
    return null;
  }

  const isOwner = user?.id === listing.user_id;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Listings
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images & Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <div className="bg-card rounded-3xl overflow-hidden shadow-soft border border-border">
                <div className="relative h-80 md:h-96 bg-muted">
                  {listing.images && listing.images.length > 0 ? (
                    <>
                      <img
                        src={listing.images[currentImageIndex]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                      {listing.images.length > 1 && (
                        <>
                          <button
                            onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? listing.images.length - 1 : prev - 1))}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setCurrentImageIndex((prev) => (prev === listing.images.length - 1 ? 0 : prev + 1))}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {listing.images.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                  index === currentImageIndex ? "bg-primary" : "bg-white/50"
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-7xl">
                      {wasteTypeEmojis[listing.waste_type] || "📦"}
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {listing.images && listing.images.length > 1 && (
                  <div className="p-4 flex gap-2 overflow-x-auto">
                    {listing.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                          index === currentImageIndex ? "border-primary" : "border-transparent"
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="bg-card rounded-3xl p-6 shadow-soft border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                    {wasteTypeLabels[listing.waste_type] || listing.waste_type}
                  </span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {timeAgo(listing.created_at)}
                  </span>
                </div>

                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                  {listing.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-6">
                  <span className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    <span className="font-medium text-foreground">
                      {listing.quantity} {listing.quantity_unit}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {listing.city}, {listing.state}
                  </span>
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    {listing.offers_count} offers
                  </span>
                </div>

                {listing.description && (
                  <div>
                    <h3 className="font-display font-bold text-foreground mb-2">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {listing.description}
                    </p>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="font-display font-bold text-foreground mb-2">Pickup Location</h3>
                  <p className="text-muted-foreground">
                    {listing.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Pricing & Seller */}
            <div className="space-y-6">
              {/* Pricing Card */}
              <div className="bg-card rounded-3xl p-6 shadow-soft border border-border sticky top-24">
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-1">Asking Price</p>
                  <p className="font-display text-4xl font-bold text-foreground flex items-center">
                    <IndianRupee className="w-8 h-8" />
                    {listing.asking_price.toLocaleString()}
                  </p>
                </div>

                {!isOwner && (
                  <MakeOfferDialog
                    listingId={listing.id}
                    sellerId={listing.user_id}
                    askingPrice={listing.asking_price}
                    listingTitle={listing.title}
                  />
                )}

                {isOwner && (
                  <div className="space-y-3">
                    <Button variant="outline" size="lg" className="w-full" asChild>
                      <Link to={`/edit-listing/${listing.id}`}>
                        Edit Listing
                      </Link>
                    </Button>
                    <Button variant="ghost" size="lg" className="w-full" asChild>
                      <Link to="/my-offers">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        View Offers ({listing.offers_count})
                      </Link>
                    </Button>
                  </div>
                )}
              </div>

              {/* Seller Card */}
              <div className="bg-card rounded-3xl p-6 shadow-soft border border-border">
                <h3 className="font-display font-bold text-foreground mb-4">Listed By</h3>
                <Link 
                  to={`/user/${listing.user_id}`}
                  className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                >
                  <div className="w-14 h-14 rounded-xl bg-hero-gradient flex items-center justify-center">
                    <User className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground hover:text-primary transition-colors">
                      {listing.profiles?.full_name || "Anonymous"}
                    </p>
                    {listing.profiles?.company_name && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {listing.profiles.company_name}
                      </p>
                    )}
                    <div className="mt-1">
                      <UserRatingBadge userId={listing.user_id} size="sm" />
                    </div>
                  </div>
                </Link>

                {listing.profiles?.phone && !isOwner && user && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {listing.profiles.phone}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ListingDetail;
