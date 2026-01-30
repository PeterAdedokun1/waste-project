import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, ShoppingCart, DollarSign, UserX, Clock } from "lucide-react";

interface PlatformStats {
  totalUsers: number;
  activeListings: number;
  totalTransactions: number;
  totalRevenue: number;
  suspendedUsers: number;
  pendingOrders: number;
}

interface AdminStatsCardsProps {
  stats: PlatformStats;
}

const AdminStatsCards = ({ stats }: AdminStatsCardsProps) => {
  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Active Listings",
      value: stats.activeListings,
      icon: Package,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Completed Transactions",
      value: stats.totalTransactions,
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      title: "Suspended Users",
      value: stats.suspendedUsers,
      icon: UserX,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminStatsCards;
