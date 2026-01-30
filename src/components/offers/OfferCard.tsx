import { useState } from "react";
import { Offer, useRespondToOffer, useAcceptCounter, useWithdrawOffer } from "@/hooks/useOffers";
import { useGetOrCreateConversation } from "@/hooks/useMessages";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Check, 
  X, 
  MessageSquare, 
  DollarSign,
  Clock,
  ArrowRight,
  User,
  Building2,
  Minus,
  Plus,
  Send
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface OfferCardProps {
  offer: Offer;
  onUpdate?: () => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-accent/20 text-accent-foreground" },
  accepted: { label: "Accepted", className: "bg-primary/10 text-primary" },
  declined: { label: "Declined", className: "bg-destructive/10 text-destructive" },
  countered: { label: "Countered", className: "bg-accent/20 text-accent-foreground" },
  expired: { label: "Expired", className: "bg-muted text-muted-foreground" },
  withdrawn: { label: "Withdrawn", className: "bg-muted text-muted-foreground" }
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

const OfferCard = ({ offer, onUpdate }: OfferCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { respondToOffer } = useRespondToOffer();
  const { acceptCounter } = useAcceptCounter();
  const { withdrawOffer } = useWithdrawOffer();
  const { getOrCreateConversation } = useGetOrCreateConversation();
  const [showCounterDialog, setShowCounterDialog] = useState(false);
  const [counterAmount, setCounterAmount] = useState(offer.amount * 1.1);
  const [counterMessage, setCounterMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isBuyer = user?.id === offer.buyer_id;
  const isSeller = user?.id === offer.seller_id;

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      await respondToOffer(offer.id, "accept");
      toast.success("Offer accepted!");
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to accept offer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    setIsLoading(true);
    try {
      await respondToOffer(offer.id, "decline");
      toast.success("Offer declined");
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to decline offer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCounter = async () => {
    setIsLoading(true);
    try {
      await respondToOffer(offer.id, "counter", counterAmount, counterMessage);
      toast.success("Counter offer sent!");
      setShowCounterDialog(false);
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to send counter offer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptCounter = async () => {
    setIsLoading(true);
    try {
      await acceptCounter(offer);
      toast.success("Counter offer accepted!");
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to accept counter offer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setIsLoading(true);
    try {
      await withdrawOffer(offer.id);
      toast.success("Offer withdrawn");
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to withdraw offer");
    } finally {
    setIsLoading(false);
    }
  };

  const handleMessage = async () => {
    try {
      await getOrCreateConversation(
        offer.listing_id,
        isBuyer ? offer.seller_id : offer.buyer_id,
        offer.id
      );
      navigate("/messages");
    } catch (error) {
      console.error("Error opening conversation:", error);
      toast.error("Failed to open conversation");
    }
  };

  const status = statusConfig[offer.status] || statusConfig.pending;

  return (
    <>
      <div className="bg-card rounded-2xl shadow-soft border border-border overflow-hidden hover:shadow-elevated transition-shadow">
        {/* Listing Info */}
        {offer.listing && (
          <Link to={`/listing/${offer.listing.id}`} className="flex items-center gap-4 p-4 bg-muted/30 border-b border-border hover:bg-muted/50 transition-colors">
            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-2xl flex-shrink-0">
              {offer.listing.images?.[0] ? (
                <img src={offer.listing.images[0]} alt="" className="w-full h-full object-cover rounded-xl" />
              ) : (
                wasteTypeEmojis[offer.listing.waste_type] || "📦"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground line-clamp-1">{offer.listing.title}</p>
              <p className="text-sm text-muted-foreground">
                Asking: ${offer.listing.asking_price.toLocaleString()}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        )}

        {/* Offer Details */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {isBuyer ? "Your offer to" : "Offer from"}{" "}
                  <span className="font-semibold">
                    {isBuyer 
                      ? offer.seller_profile?.full_name || "Seller"
                      : offer.buyer_profile?.full_name || "Buyer"}
                  </span>
                </p>
                {(isBuyer ? offer.seller_profile?.company_name : offer.buyer_profile?.company_name) && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {isBuyer ? offer.seller_profile?.company_name : offer.buyer_profile?.company_name}
                  </p>
                )}
              </div>
            </div>
            <Badge className={status.className}>{status.label}</Badge>
          </div>

          {/* Offer Amount */}
          <div className="bg-muted/50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Offer Amount</span>
              <span className="font-display text-2xl font-bold text-foreground flex items-center">
                <DollarSign className="w-5 h-5" />
                {offer.amount.toLocaleString()}
              </span>
            </div>

            {offer.message && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <p className="text-sm text-muted-foreground">{offer.message}</p>
                </div>
              </div>
            )}
          </div>

          {/* Counter Offer */}
          {offer.status === "countered" && offer.counter_amount && (
            <div className="bg-accent/10 rounded-xl p-4 mb-4 border border-accent/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-accent-foreground">Counter Offer</span>
                <span className="font-display text-xl font-bold text-accent-foreground flex items-center">
                  <DollarSign className="w-4 h-4" />
                  {offer.counter_amount.toLocaleString()}
                </span>
              </div>
              {offer.counter_message && (
                <p className="text-sm text-muted-foreground">{offer.counter_message}</p>
              )}
            </div>
          )}

          {/* Timestamp */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
            <Clock className="w-3 h-3" />
            {timeAgo(offer.created_at)}
          </div>

          {/* Actions */}
          {offer.status === "pending" && isSeller && (
            <div className="flex items-center gap-2">
              <Button
                variant="hero"
                size="sm"
                className="flex-1"
                onClick={handleAccept}
                disabled={isLoading}
              >
                <Check className="w-4 h-4 mr-1" />
                Accept
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCounterDialog(true)}
                disabled={isLoading}
              >
                Counter
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={handleDecline}
                disabled={isLoading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {offer.status === "pending" && isBuyer && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={handleWithdraw}
              disabled={isLoading}
            >
              Withdraw Offer
            </Button>
          )}

          {offer.status === "countered" && isBuyer && (
            <div className="flex items-center gap-2">
              <Button
                variant="hero"
                size="sm"
                className="flex-1"
                onClick={handleAcceptCounter}
                disabled={isLoading}
              >
                <Check className="w-4 h-4 mr-1" />
                Accept Counter
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={handleWithdraw}
                disabled={isLoading}
              >
                Decline
              </Button>
            </div>
          )}

          {offer.status === "accepted" && (
            <div className="space-y-3">
              <div className="text-center py-2 text-primary font-medium">
                🎉 Deal confirmed!
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleMessage}
              >
                <Send className="w-4 h-4 mr-2" />
                Message {isBuyer ? "Seller" : "Buyer"}
              </Button>
            </div>
          )}

          {/* Message button for active negotiations */}
          {(offer.status === "pending" || offer.status === "countered") && (
            <div className="mt-3 pt-3 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={handleMessage}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Message {isBuyer ? "Seller" : "Buyer"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Counter Dialog */}
      <Dialog open={showCounterDialog} onOpenChange={setShowCounterDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Counter Offer</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            <div className="bg-muted/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Original Offer</span>
                <span className="font-display font-bold text-muted-foreground line-through">
                  ${offer.amount.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Your Counter</span>
                <span className="font-display font-bold text-primary text-xl">
                  ${counterAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => setCounterAmount((prev) => Math.max(offer.amount, prev - 1000))}
                  className="w-10 h-10 rounded-xl bg-background border border-border hover:bg-secondary flex items-center justify-center transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <Input
                  type="number"
                  value={counterAmount}
                  onChange={(e) => setCounterAmount(parseInt(e.target.value) || 0)}
                  className="h-10 text-center font-display font-bold"
                />
                <button
                  type="button"
                  onClick={() => setCounterAmount((prev) => prev + 1000)}
                  className="w-10 h-10 rounded-xl bg-background border border-border hover:bg-secondary flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Message (optional)</label>
              <Textarea
                value={counterMessage}
                onChange={(e) => setCounterMessage(e.target.value)}
                placeholder="Explain your counter offer..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCounterDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="hero"
                className="flex-1"
                onClick={handleCounter}
                disabled={isLoading || counterAmount <= offer.amount}
              >
                {isLoading ? "Sending..." : "Send Counter"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OfferCard;
