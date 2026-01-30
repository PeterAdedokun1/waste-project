import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

interface AdminOrder {
  id: string;
  offer_id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  status: string;
  pickup_date: string | null;
  created_at: string;
  updated_at: string;
  buyer_name: string | null;
  seller_name: string | null;
  listing_title: string | null;
}

interface AdminOrdersTableProps {
  orders: AdminOrder[];
}

const AdminOrdersTable = ({ orders }: AdminOrdersTableProps) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.listing_title?.toLowerCase().includes(search.toLowerCase()) ||
      o.buyer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.seller_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending_pickup: "bg-yellow-100 text-yellow-800",
      pickup_scheduled: "bg-blue-100 text-blue-800",
      in_transit: "bg-purple-100 text-purple-800",
      delivered: "bg-indigo-100 text-indigo-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      disputed: "bg-orange-100 text-orange-800",
    };
    const labels: Record<string, string> = {
      pending_pickup: "Pending Pickup",
      pickup_scheduled: "Pickup Scheduled",
      in_transit: "In Transit",
      delivered: "Delivered",
      completed: "Completed",
      cancelled: "Cancelled",
      disputed: "Disputed",
    };
    return (
      <Badge variant="secondary" className={colors[status] || ""}>
        {labels[status] || status}
      </Badge>
    );
  };

  const statuses = [
    "all",
    "pending_pickup",
    "pickup_scheduled",
    "in_transit",
    "delivered",
    "completed",
    "cancelled",
  ];

  return (
    <>
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statuses.map((status) => (
            <Button
              key={status}
              size="sm"
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => setStatusFilter(status)}
            >
              {status === "all"
                ? "All"
                : status
                    .split("_")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
            </Button>
          ))}
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Listing</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pickup Date</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <div className="max-w-[200px] truncate font-medium">
                    {order.listing_title || "—"}
                  </div>
                </TableCell>
                <TableCell>{order.buyer_name || "—"}</TableCell>
                <TableCell>{order.seller_name || "—"}</TableCell>
                <TableCell className="font-medium">
                  ${Number(order.amount).toLocaleString()}
                </TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell>
                  {order.pickup_date
                    ? format(new Date(order.pickup_date), "MMM d, yyyy")
                    : "—"}
                </TableCell>
                <TableCell>
                  {format(new Date(order.created_at), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" asChild>
                    <Link to={`/listing/${order.listing_id}`}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default AdminOrdersTable;
