import { useState } from "react";
import { format } from "date-fns";
import { Order, OrderStatus, useUpdateOrderStatus, useSchedulePickup, useConfirmDelivery } from "@/hooks/useOrders";
import { useAuth } from "@/contexts/AuthContext";
import { useCanReviewOrder } from "@/hooks/useReviews";
import { useOrderDispute } from "@/hooks/useDisputes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Package,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  Truck,
  User,
  Building2,
  Phone,
  DollarSign,
  MessageSquare,
  ArrowRight,
  XCircle,
  Star,
  AlertTriangle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useGetOrCreateConversation } from "@/hooks/useMessages";
import ReviewDialog from "@/components/reviews/ReviewDialog";
import RaiseDisputeDialog from "@/components/disputes/RaiseDisputeDialog";
import DisputeDetails from "@/components/disputes/DisputeDetails";

interface OrderCardProps {
  order: Order;
  onUpdate?: () => void;
}

const statusConfig: Record<OrderStatus, { label: string; className: string; icon: React.ReactNode }> = {
  pending_pickup: { label: "Pending Pickup", className: "bg-accent/20 text-accent-foreground", icon: <Clock className="w-3 h-3" /> },
  pickup_scheduled: { label: "Pickup Scheduled", className: "bg-primary/10 text-primary", icon: <Calendar className="w-3 h-3" /> },
  in_transit: { label: "In Transit", className: "bg-accent/20 text-accent-foreground", icon: <Truck className="w-3 h-3" /> },
  delivered: { label: "Delivered", className: "bg-primary/10 text-primary", icon: <Package className="w-3 h-3" /> },
  completed: { label: "Completed", className: "bg-primary/10 text-primary", icon: <CheckCircle2 className="w-3 h-3" /> },
  cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive", icon: <XCircle className="w-3 h-3" /> },
  disputed: { label: "Disputed", className: "bg-destructive/10 text-destructive", icon: <XCircle className="w-3 h-3" /> },
};

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

const OrderCard = ({ order, onUpdate }: OrderCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { updateStatus } = useUpdateOrderStatus();
  const { schedulePickup } = useSchedulePickup();
  const { confirmDelivery } = useConfirmDelivery();
  const { getOrCreateConversation } = useGetOrCreateConversation();
  const { canReview } = useCanReviewOrder(order.id);
  const { dispute } = useOrderDispute(order.id);
  
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [showDisputeDetails, setShowDisputeDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Schedule pickup form
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [pickupAddress, setPickupAddress] = useState(order.seller_profile?.location || "");
  const [pickupNotes, setPickupNotes] = useState("");
  
  // Status update
  const [newStatus, setNewStatus] = useState<OrderStatus>(order.status);
  const [statusNotes, setStatusNotes] = useState("");
  
  const canRaiseDispute = !dispute && 
    !["completed", "cancelled"].includes(order.status) &&
    order.status !== "disputed";

  const isBuyer = user?.id === order.buyer_id;
  const isSeller = user?.id === order.seller_id;
  const revieweeId = isBuyer ? order.seller_id : order.buyer_id;
  const revieweeName = isBuyer 
    ? (order.seller_profile?.full_name || order.seller_profile?.company_name || "Seller")
    : (order.buyer_profile?.full_name || order.buyer_profile?.company_name || "Buyer");

  const status = statusConfig[order.status];
  const otherParty = isBuyer ? order.seller_profile : order.buyer_profile;

  const handleSchedulePickup = async () => {
    if (!pickupDate || !pickupTime || !pickupAddress) {
      toast.error("Please fill in all pickup details");
      return;
    }

    setIsLoading(true);
    try {
      await schedulePickup(order.id, pickupDate, pickupTime, pickupAddress, pickupNotes);
      toast.success("Pickup scheduled!");
      setShowScheduleDialog(false);
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to schedule pickup");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    setIsLoading(true);
    try {
      await updateStatus(order.id, newStatus, statusNotes);
      toast.success("Order status updated!");
      setShowStatusDialog(false);
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    setIsLoading(true);
    try {
      await confirmDelivery(order.id, isBuyer);
      toast.success("Delivery confirmed!");
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to confirm delivery");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessage = async () => {
    try {
      await getOrCreateConversation(
        order.listing_id,
        isBuyer ? order.seller_id : order.buyer_id,
        order.offer_id
      );
      navigate("/messages");
    } catch (error) {
      toast.error("Failed to open conversation");
    }
  };

  const canSchedulePickup = order.status === "pending_pickup" && isSeller;
  const canMarkInTransit = order.status === "pickup_scheduled" && (isBuyer || isSeller);
  const canMarkDelivered = order.status === "in_transit" && (isBuyer || isSeller);
  const canConfirmCompletion = order.status === "delivered" && 
    ((isBuyer && !order.buyer_confirmed_at) || (isSeller && !order.seller_confirmed_at));

  return (
    <>
      <div className="bg-card rounded-2xl shadow-soft border border-border overflow-hidden">
        {/* Listing Info */}
        {order.listing && (
          <Link 
            to={`/listing/${order.listing.id}`} 
            className="flex items-center gap-4 p-4 bg-muted/30 border-b border-border hover:bg-muted/50 transition-colors"
          >
            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-2xl flex-shrink-0">
              {order.listing.images?.[0] ? (
                <img src={order.listing.images[0]} alt="" className="w-full h-full object-cover rounded-xl" />
              ) : (
                wasteTypeEmojis[order.listing.waste_type] || "📦"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground line-clamp-1">{order.listing.title}</p>
              <p className="text-sm text-muted-foreground">
                {order.listing.quantity} {order.listing.quantity_unit}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </Link>
        )}

        <div className="p-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between mb-4">
            <Badge className={`${status.className} flex items-center gap-1`}>
              {status.icon}
              {status.label}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Order #{order.id.slice(0, 8)}
            </span>
          </div>

          {/* Amount */}
          <div className="bg-muted/50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Deal Amount</span>
              <span className="font-display text-2xl font-bold text-foreground flex items-center">
                <DollarSign className="w-5 h-5" />
                {order.amount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Other Party Info */}
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl mb-4">
            <Link 
              to={`/user/${isBuyer ? order.seller_id : order.buyer_id}`}
              className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            >
              <User className="w-5 h-5 text-muted-foreground" />
            </Link>
            <Link 
              to={`/user/${isBuyer ? order.seller_id : order.buyer_id}`}
              className="flex-1 min-w-0 hover:opacity-80 transition-opacity"
            >
              <p className="text-sm text-muted-foreground">
                {isBuyer ? "Seller" : "Buyer"}
              </p>
              <p className="font-medium text-foreground truncate hover:text-primary transition-colors">
                {otherParty?.full_name || otherParty?.company_name || "User"}
              </p>
              {otherParty?.company_name && otherParty?.full_name && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {otherParty.company_name}
                </p>
              )}
            </Link>
            {otherParty?.phone && (
              <a href={`tel:${otherParty.phone}`} className="p-2 hover:bg-muted rounded-lg">
                <Phone className="w-4 h-4 text-muted-foreground" />
              </a>
            )}
          </div>

          {/* Pickup Details */}
          {order.pickup_date && (
            <div className="space-y-2 p-3 bg-primary/5 rounded-xl mb-4 border border-primary/10">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-medium">{format(new Date(order.pickup_date), "PPP")}</span>
                {order.pickup_time && (
                  <>
                    <Clock className="w-4 h-4 text-primary ml-2" />
                    <span>{order.pickup_time}</span>
                  </>
                )}
              </div>
              {order.pickup_address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary mt-0.5" />
                  <span className="text-muted-foreground">{order.pickup_address}</span>
                </div>
              )}
              {order.pickup_notes && (
                <p className="text-xs text-muted-foreground pl-6">{order.pickup_notes}</p>
              )}
            </div>
          )}

          {/* Confirmation Status for delivered orders */}
          {order.status === "delivered" && (
            <div className="p-3 bg-muted/30 rounded-xl mb-4 space-y-2">
              <p className="text-sm font-medium">Delivery Confirmations</p>
              <div className="flex items-center gap-2">
                {order.seller_confirmed_at ? (
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Seller confirmed
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-muted text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1" /> Seller pending
                  </Badge>
                )}
                {order.buyer_confirmed_at ? (
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Buyer confirmed
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-muted text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1" /> Buyer pending
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            {canSchedulePickup && (
              <Button
                variant="hero"
                className="w-full"
                onClick={() => setShowScheduleDialog(true)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Pickup
              </Button>
            )}

            {canMarkInTransit && (
              <Button
                variant="hero"
                className="w-full"
                onClick={() => {
                  setNewStatus("in_transit");
                  setShowStatusDialog(true);
                }}
              >
                <Truck className="w-4 h-4 mr-2" />
                Mark In Transit
              </Button>
            )}

            {canMarkDelivered && (
              <Button
                variant="hero"
                className="w-full"
                onClick={() => {
                  setNewStatus("delivered");
                  setShowStatusDialog(true);
                }}
              >
                <Package className="w-4 h-4 mr-2" />
                Mark Delivered
              </Button>
            )}

            {canConfirmCompletion && (
              <Button
                variant="hero"
                className="w-full"
                onClick={handleConfirmDelivery}
                disabled={isLoading}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Confirm Delivery
              </Button>
            )}

            {order.status === "completed" && (
              <div className="space-y-2">
                <div className="text-center py-2 text-primary font-medium">
                  ✅ Transaction Completed
                </div>
                {canReview && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowReviewDialog(true)}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Leave a Review
                  </Button>
                )}
              </div>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={handleMessage}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Message {isBuyer ? "Seller" : "Buyer"}
            </Button>

            {/* Dispute Section */}
            {dispute ? (
              <Button
                variant="outline"
                className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                onClick={() => setShowDisputeDetails(true)}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                View Dispute
              </Button>
            ) : canRaiseDispute && (
              <Button
                variant="ghost"
                className="w-full text-muted-foreground hover:text-destructive"
                onClick={() => setShowDisputeDialog(true)}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Raise Dispute
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Pickup Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Schedule Pickup</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd")}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Time</label>
                <Input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Pickup Address</label>
              <Textarea
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Enter pickup location..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                value={pickupNotes}
                onChange={(e) => setPickupNotes(e.target.value)}
                placeholder="Any special instructions..."
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowScheduleDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="hero"
                className="flex-1"
                onClick={handleSchedulePickup}
                disabled={isLoading}
              >
                {isLoading ? "Scheduling..." : "Confirm Pickup"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Update Order Status</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Status</label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as OrderStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Add any notes..."
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowStatusDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="hero"
                className="flex-1"
                onClick={handleUpdateStatus}
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update Status"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <ReviewDialog
        open={showReviewDialog}
        onOpenChange={setShowReviewDialog}
        orderId={order.id}
        revieweeId={revieweeId}
        revieweeName={revieweeName}
        onSuccess={onUpdate}
      />

      {/* Raise Dispute Dialog */}
      <RaiseDisputeDialog
        open={showDisputeDialog}
        onOpenChange={setShowDisputeDialog}
        orderId={order.id}
        onSuccess={onUpdate}
      />

      {/* Dispute Details Dialog */}
      <Dialog open={showDisputeDetails} onOpenChange={setShowDisputeDetails}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Dispute Status</DialogTitle>
          </DialogHeader>
          {dispute && <DisputeDetails dispute={dispute} />}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrderCard;
