import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useOrders, OrderStatus } from "@/hooks/useOrders";
import Header from "@/components/layout/Header";
import OrderCard from "@/components/orders/OrderCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Truck, CheckCircle2, Clock } from "lucide-react";

const statusCategories = {
  active: ["pending_pickup", "pickup_scheduled", "in_transit", "delivered"] as OrderStatus[],
  completed: ["completed"] as OrderStatus[],
  cancelled: ["cancelled", "disputed"] as OrderStatus[],
};

const MyOrders = () => {
  const { user, loading: authLoading } = useAuth();
  const { orders, loading, refetch } = useOrders();
  const [activeTab, setActiveTab] = useState("active");

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

  const activeOrders = orders.filter(o => statusCategories.active.includes(o.status));
  const completedOrders = orders.filter(o => statusCategories.completed.includes(o.status));
  const cancelledOrders = orders.filter(o => statusCategories.cancelled.includes(o.status));

  const getOrdersByTab = () => {
    switch (activeTab) {
      case "active":
        return activeOrders;
      case "completed":
        return completedOrders;
      case "cancelled":
        return cancelledOrders;
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              My Orders
            </h1>
            <p className="text-muted-foreground">
              Track your transactions from pickup to completion
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-accent" />
                <span className="text-sm text-muted-foreground">Pending</span>
              </div>
              <p className="font-display text-2xl font-bold text-foreground">
                {orders.filter(o => o.status === "pending_pickup").length}
              </p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">In Progress</span>
              </div>
              <p className="font-display text-2xl font-bold text-foreground">
                {orders.filter(o => ["pickup_scheduled", "in_transit", "delivered"].includes(o.status)).length}
              </p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Completed</span>
              </div>
              <p className="font-display text-2xl font-bold text-foreground">
                {completedOrders.length}
              </p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total</span>
              </div>
              <p className="font-display text-2xl font-bold text-foreground">
                {orders.length}
              </p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="active" className="gap-2">
                Active
                {activeOrders.length > 0 && (
                  <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
                    {activeOrders.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed
                {completedOrders.length > 0 && (
                  <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full ml-1">
                    {completedOrders.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Cancelled
                {cancelledOrders.length > 0 && (
                  <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full ml-1">
                    {cancelledOrders.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  Loading orders...
                </div>
              ) : getOrdersByTab().length === 0 ? (
                <div className="text-center py-12 bg-card rounded-2xl border border-border">
                  <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">
                    No {activeTab} orders yet
                  </p>
                  {activeTab === "active" && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Orders are created when offers are accepted
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getOrdersByTab().map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onUpdate={refetch}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default MyOrders;
