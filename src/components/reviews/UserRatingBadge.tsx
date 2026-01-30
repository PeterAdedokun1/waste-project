import { Star } from "lucide-react";
import { useUserRating } from "@/hooks/useReviews";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface UserRatingBadgeProps {
  userId: string | undefined;
  showCount?: boolean;
  size?: "sm" | "md";
}

const UserRatingBadge = ({ userId, showCount = true, size = "md" }: UserRatingBadgeProps) => {
  const { rating, loading } = useUserRating(userId);

  if (loading) {
    return <Skeleton className={size === "sm" ? "h-4 w-16" : "h-5 w-20"} />;
  }

  if (rating.total_reviews === 0) {
    return (
      <span className={cn(
        "text-muted-foreground",
        size === "sm" ? "text-xs" : "text-sm"
      )}>
        No reviews yet
      </span>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-1",
      size === "sm" ? "text-xs" : "text-sm"
    )}>
      <Star className={cn(
        "fill-amber-400 text-amber-400",
        size === "sm" ? "h-3 w-3" : "h-4 w-4"
      )} />
      <span className="font-medium">{rating.average_rating}</span>
      {showCount && (
        <span className="text-muted-foreground">
          ({rating.total_reviews})
        </span>
      )}
    </div>
  );
};

export default UserRatingBadge;
