import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { 
  MessageSquare, 
  Package, 
  TrendingUp, 
  ArrowDownLeft,
  ArrowUpRight,
  Truck
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRecentActivity, ActivityItem } from "@/hooks/useRecentActivity";
import { cn } from "@/lib/utils";

const activityIcons = {
  offer_received: ArrowDownLeft,
  offer_sent: ArrowUpRight,
  order_update: Truck,
  message: MessageSquare,
};

const activityColors = {
  offer_received: "text-primary bg-primary/10",
  offer_sent: "text-accent bg-accent/10",
  order_update: "text-primary bg-primary/10",
  message: "text-accent bg-accent/10",
};

const activityLinks = {
  offer_received: "/my-offers",
  offer_sent: "/my-offers",
  order_update: "/my-orders",
  message: "/messages",
};

const ActivityItemCard = ({ activity }: { activity: ActivityItem }) => {
  const Icon = activityIcons[activity.type];
  const colorClass = activityColors[activity.type];
  const link = activityLinks[activity.type];

  return (
    <Link
      to={link}
      className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
    >
      <div className={cn("p-2 rounded-lg shrink-0", colorClass)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
          {activity.title}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {activity.description}
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
        </p>
      </div>
    </Link>
  );
};

const RecentActivityFeed = () => {
  const { activities, loading } = useRecentActivity(8);

  if (loading) {
    return (
      <div className="bg-card rounded-2xl p-6 shadow-soft border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold text-foreground">
            Recent Activity
          </h3>
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-6 shadow-soft border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold text-foreground">
            Recent Activity
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
            <TrendingUp className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No recent activity</p>
          <p className="text-xs text-muted-foreground mt-1">
            Your offers, orders, and messages will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 shadow-soft border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold text-foreground">
          Recent Activity
        </h3>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {activities.length} updates
        </span>
      </div>
      <ScrollArea className="h-[320px] -mx-2">
        <div className="px-2 space-y-1">
          {activities.map((activity) => (
            <ActivityItemCard key={activity.id} activity={activity} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default RecentActivityFeed;
