import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, MapPin, IndianRupee } from "lucide-react";

interface Listing {
  id: string;
  title: string;
  waste_type: string;
  quantity: number;
  quantity_unit: string;
  asking_price: number;
  location: string;
  images: string[] | null;
}

interface ProfileListingsProps {
  listings: Listing[];
  loading: boolean;
}

const wasteTypeColors: Record<string, string> = {
  plastic: "bg-blue-500/10 text-blue-600",
  paper: "bg-amber-500/10 text-amber-600",
  metal: "bg-slate-500/10 text-slate-600",
  electronics: "bg-purple-500/10 text-purple-600",
  organic: "bg-green-500/10 text-green-600",
  textile: "bg-pink-500/10 text-pink-600",
  glass: "bg-cyan-500/10 text-cyan-600",
  rubber: "bg-orange-500/10 text-orange-600",
  wood: "bg-yellow-800/10 text-yellow-800",
  other: "bg-gray-500/10 text-gray-600",
};

const ProfileListings = ({ listings, loading }: ProfileListingsProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-32 w-full rounded-lg mb-3" />
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No active listings</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {listings.map((listing) => (
        <Link key={listing.id} to={`/listing/${listing.id}`}>
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              {listing.images && listing.images.length > 0 ? (
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
              ) : (
                <div className="w-full h-32 bg-muted rounded-lg mb-3 flex items-center justify-center">
                  <Package className="h-8 w-8 text-muted-foreground/50" />
                </div>
              )}
              
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-foreground line-clamp-1">
                  {listing.title}
                </h3>
                <Badge 
                  variant="secondary" 
                  className={wasteTypeColors[listing.waste_type] || wasteTypeColors.other}
                >
                  {listing.waste_type}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {listing.location}
                </span>
                <span className="flex items-center font-medium text-foreground">
                  <IndianRupee className="h-3 w-3" />
                  {listing.asking_price.toLocaleString()}
                </span>
              </div>
              
              <p className="text-xs text-muted-foreground mt-1">
                {listing.quantity} {listing.quantity_unit}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default ProfileListings;
