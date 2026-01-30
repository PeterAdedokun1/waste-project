import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  ShoppingCart, 
  Package,
  IndianRupee,
  CheckCircle2
} from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: string;
  amount: number;
  completed_at: string;
  role: "buyer" | "seller";
  listing_title: string;
  waste_type: string;
}

interface ProfileTransactionsProps {
  transactions: Transaction[];
  stats: {
    totalCompleted: number;
    totalValue: number;
  };
  loading: boolean;
}

const ProfileTransactions = ({ transactions, stats, loading }: ProfileTransactionsProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.totalCompleted}
                </p>
                <p className="text-xs text-muted-foreground">
                  Completed Transactions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground flex items-center">
                  <IndianRupee className="h-5 w-5" />
                  {stats.totalValue.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Total Value Traded
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      {transactions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No completed transactions yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Recent Transactions
          </h3>
          {transactions.map((transaction) => (
            <Card key={transaction.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      transaction.role === "seller" 
                        ? "bg-green-500/10" 
                        : "bg-blue-500/10"
                    }`}>
                      {transaction.role === "seller" ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <ShoppingCart className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground line-clamp-1">
                        {transaction.listing_title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs py-0">
                          {transaction.waste_type}
                        </Badge>
                        <span>
                          {format(new Date(transaction.completed_at), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground flex items-center justify-end">
                      <IndianRupee className="h-4 w-4" />
                      {transaction.amount.toLocaleString()}
                    </p>
                    <Badge 
                      variant="secondary"
                      className={transaction.role === "seller" 
                        ? "bg-green-500/10 text-green-600" 
                        : "bg-blue-500/10 text-blue-600"
                      }
                    >
                      {transaction.role === "seller" ? "Sold" : "Purchased"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileTransactions;
