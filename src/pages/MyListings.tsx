import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { 
  Plus, 
  Package, 
  MapPin, 
  Clock, 
  Eye, 
  MessageSquare,
  Edit,
  Trash2,
  IndianRupee
} from "lucide-react";

interface Listing {
  id: string;
  title: string;
  waste_type: string;
  quantity: number;
  quantity_unit: string;
  asking_price: number;
  location: string;
  city: string | null;
  status: string;
  images: string[];
  offers_count: number;
  views_count: number;
  created_at: string;
}

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

const statusColors: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  pending: "bg-accent/20 text-accent-foreground",
  sold: "bg-muted text-muted-foreground",
  expired: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

const MyListings = () => {
  const { user, loading: authLoading } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchListings();
    }
  }, [user]);

  const fetchListings = async () => {
    const { data, error } = await supabase
      .from("waste_listings")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load listings");
      console.error(error);
    } else {
      setListings(data || []);
    }
    setLoading(false);
  };

  const deleteListing = async (id: string) => {
    const { error } = await supabase
      .from("waste_listings")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete listing");
      console.error(error);
    } else {
      toast.success("Listing deleted");
      setListings(listings.filter((l) => l.id !== id));
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "cancelled" : "active";
    const { error } = await supabase
      .from("waste_listings")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update status");
      console.error(error);
    } else {
      toast.success(`Listing ${newStatus === "active" ? "activated" : "cancelled"}`);
      fetchListings();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                My Listings
              </h1>
              <p className="text-muted-foreground">
                Manage your waste material listings
              </p>
            </div>
            <Button variant="hero" asChild>
              <Link to="/create-listing">
                <Plus className="w-4 h-4 mr-2" />
                Create Listing
              </Link>
            </Button>
          </div>

          {/* Listings Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-2xl p-6 animate-pulse">
                  <div className="h-32 bg-muted rounded-xl mb-4" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                No listings yet
              </h2>
              <p className="text-muted-foreground mb-6">
                Create your first listing to start receiving offers.
              </p>
              <Button variant="hero" asChild>
                <Link to="/create-listing">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Listing
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-card rounded-2xl shadow-soft border border-border overflow-hidden hover:shadow-elevated transition-shadow"
                >
                  {/* Image */}
                  <div className="h-40 bg-muted relative">
                    {listing.images && listing.images.length > 0 ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        {wasteTypeEmojis[listing.waste_type] || "📦"}
                      </div>
                    )}
                    <Badge className={`absolute top-3 right-3 ${statusColors[listing.status]}`}>
                      {listing.status}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-xs font-medium text-primary uppercase">
                          {listing.waste_type}
                        </span>
                        <h3 className="font-display font-bold text-foreground line-clamp-1">
                          {listing.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {listing.quantity} {listing.quantity_unit}
                      </span>
                      {listing.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {listing.city}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="font-display text-xl font-bold text-foreground flex items-center">
                        <IndianRupee className="w-4 h-4" />
                        {listing.asking_price.toLocaleString()}
                      </span>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {listing.views_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {listing.offers_count}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                      <Clock className="w-3 h-3" />
                      {new Date(listing.created_at).toLocaleDateString()}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link to={`/edit-listing/${listing.id}`}>
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleStatus(listing.id, listing.status)}
                      >
                        {listing.status === "active" ? "Pause" : "Activate"}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Listing?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this listing and all associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteListing(listing.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyListings;
