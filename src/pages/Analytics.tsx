import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useAnalytics } from "@/hooks/useAnalytics";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format, formatDistanceToNow } from "date-fns";
import {
  TrendingUp,
  DollarSign,
  Package,
  FileText,
  MessageSquare,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

type TimeRange = "7d" | "30d" | "90d" | "1y";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(142, 76%, 36%)",
  "hsl(48, 96%, 53%)",
  "hsl(280, 65%, 60%)",
  "hsl(200, 80%, 50%)",
];

const Analytics = () => {
  const { user, loading: authLoading } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const { data, loading } = useAnalytics(timeRange);

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

  const timeRangeLabels: Record<TimeRange, string> = {
    "7d": "Last 7 days",
    "30d": "Last 30 days",
    "90d": "Last 90 days",
    "1y": "Last year",
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-muted-foreground">
                Track your performance and activity metrics
              </p>
            </div>
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-20 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : data ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex items-center gap-1 text-primary text-sm">
                        <ArrowUpRight className="w-4 h-4" />
                        <span>{timeRangeLabels[timeRange]}</span>
                      </div>
                    </div>
                    <p className="font-display text-3xl font-bold text-foreground">
                      ${data.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-accent" />
                      </div>
                    </div>
                    <p className="font-display text-3xl font-bold text-foreground">
                      {data.totalTransactions}
                    </p>
                    <p className="text-sm text-muted-foreground">Completed Transactions</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Package className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <p className="font-display text-3xl font-bold text-foreground">
                      {data.activeListings}
                    </p>
                    <p className="text-sm text-muted-foreground">Active Listings</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-accent" />
                      </div>
                    </div>
                    <p className="font-display text-3xl font-bold text-foreground">
                      {data.pendingOffers}
                    </p>
                    <p className="text-sm text-muted-foreground">Pending Offers</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Revenue Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Revenue Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.revenueByPeriod}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis 
                            dataKey="period" 
                            tick={{ fontSize: 12 }} 
                            className="text-muted-foreground"
                            tickLine={false}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }} 
                            className="text-muted-foreground"
                            tickLine={false}
                            tickFormatter={(value) => `$${value.toLocaleString()}`}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                            formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                          />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Transactions Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display text-lg flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-accent" />
                      Transaction Volume
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.revenueByPeriod}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis 
                            dataKey="period" 
                            tick={{ fontSize: 12 }} 
                            className="text-muted-foreground"
                            tickLine={false}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }} 
                            className="text-muted-foreground"
                            tickLine={false}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar
                            dataKey="transactions"
                            fill="hsl(var(--accent))"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Offers by Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display text-lg">Offers by Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      {data.offersByStatus.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={data.offersByStatus}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="count"
                              nameKey="status"
                            >
                              {data.offersByStatus.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                              }}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                          No offer data
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Orders by Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display text-lg">Orders by Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      {data.ordersByStatus.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={data.ordersByStatus}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="count"
                              nameKey="status"
                            >
                              {data.ordersByStatus.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                              }}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                          No order data
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Waste Types */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display text-lg">Top Waste Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.topWasteTypes.length > 0 ? (
                        data.topWasteTypes.map((item, index) => (
                          <div key={item.type} className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-foreground">{item.type}</span>
                                <span className="text-sm text-muted-foreground">{item.count} listings</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2 mt-1">
                                <div 
                                  className="h-2 rounded-full" 
                                  style={{ 
                                    width: `${(item.count / data.topWasteTypes[0].count) * 100}%`,
                                    backgroundColor: COLORS[index % COLORS.length]
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                          No listing data
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {data.recentActivity.map((activity, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              activity.type === "order" ? "bg-primary/10" : "bg-accent/10"
                            }`}>
                              {activity.type === "order" ? (
                                <ShoppingBag className="w-5 h-5 text-primary" />
                              ) : (
                                <MessageSquare className="w-5 h-5 text-accent" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{activity.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          {activity.amount && (
                            <span className="font-display font-bold text-foreground">
                              ${activity.amount.toLocaleString()}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-muted-foreground">
                      No recent activity
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Failed to load analytics data
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Analytics;
