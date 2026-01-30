import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MapPin, 
  Calendar, 
  Factory, 
  Truck, 
  RefreshCw,
  Star
} from "lucide-react";
import { format } from "date-fns";

interface ProfileHeaderProps {
  profile: {
    full_name: string | null;
    company_name: string | null;
    location: string | null;
    bio: string | null;
    avatar_url: string | null;
    user_type: "generator" | "middleman" | "recycler";
    created_at: string;
  };
  rating: {
    average_rating: number | null;
    total_reviews: number;
  };
}

const userTypeConfig = {
  generator: { label: "Generator", icon: Factory, color: "bg-blue-500/10 text-blue-600" },
  middleman: { label: "Middleman", icon: Truck, color: "bg-amber-500/10 text-amber-600" },
  recycler: { label: "Recycler", icon: RefreshCw, color: "bg-green-500/10 text-green-600" },
};

const ProfileHeader = ({ profile, rating }: ProfileHeaderProps) => {
  const typeConfig = userTypeConfig[profile.user_type];
  const TypeIcon = typeConfig.icon;
  const displayName = profile.full_name || profile.company_name || "Anonymous User";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <Card className="overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
      <CardContent className="relative pt-0 pb-6">
        <div className="flex flex-col sm:flex-row gap-4 -mt-12">
          <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 pt-2 sm:pt-6">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="font-display text-2xl font-bold text-foreground">
                {displayName}
              </h1>
              <Badge variant="secondary" className={typeConfig.color}>
                <TypeIcon className="h-3 w-3 mr-1" />
                {typeConfig.label}
              </Badge>
            </div>

            {profile.company_name && profile.full_name && (
              <p className="text-muted-foreground mb-2">{profile.company_name}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {profile.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Joined {format(new Date(profile.created_at), "MMMM yyyy")}
              </span>
              {rating.total_reviews > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {rating.average_rating?.toFixed(1)} ({rating.total_reviews} reviews)
                </span>
              )}
            </div>

            {profile.bio && (
              <p className="mt-4 text-foreground/80 max-w-2xl">
                {profile.bio}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
