import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateOffer } from "@/hooks/useOffers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { DollarSign, Minus, Plus, Send } from "lucide-react";
import { Link } from "react-router-dom";

interface MakeOfferDialogProps {
  listingId: string;
  sellerId: string;
  askingPrice: number;
  listingTitle: string;
  trigger?: React.ReactNode;
}

const MakeOfferDialog = ({
  listingId,
  sellerId,
  askingPrice,
  listingTitle,
  trigger
}: MakeOfferDialogProps) => {
  const { user } = useAuth();
  const { createOffer } = useCreateOffer();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState(Math.round(askingPrice * 0.85));
  const [message, setMessage] = useState("");

  const adjustAmount = (delta: number) => {
    setAmount((prev) => Math.max(1000, prev + delta));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      await createOffer(listingId, sellerId, amount, message);
      toast.success("Offer sent successfully!");
      setOpen(false);
      setMessage("");
    } catch (error: any) {
      toast.error(error.message || "Failed to send offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Button variant="hero" size="lg" className="w-full" asChild>
        <Link to="/login">Sign in to Make Offer</Link>
      </Button>
    );
  }

  if (user.id === sellerId) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="negotiate" size="lg" className="w-full">
            Make Offer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Make an Offer</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">For listing</p>
            <p className="font-semibold text-foreground line-clamp-1">{listingTitle}</p>
          </div>

          <div className="bg-muted/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Asking Price</span>
              <span className="font-display font-bold text-foreground">
                ${askingPrice.toLocaleString()}
              </span>
            </div>
            
            <div className="border-t border-border my-3" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Your Offer</Label>
                <span className="font-display font-bold text-primary text-xl">
                  ${amount.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => adjustAmount(-1000)}
                  className="w-12 h-12 rounded-xl bg-background border border-border hover:bg-secondary flex items-center justify-center transition-colors"
                >
                  <Minus className="w-5 h-5 text-foreground" />
                </button>
                <div className="relative flex-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                    className="pl-8 h-12 text-center font-display font-bold"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => adjustAmount(1000)}
                  className="w-12 h-12 rounded-xl bg-background border border-border hover:bg-secondary flex items-center justify-center transition-colors"
                >
                  <Plus className="w-5 h-5 text-foreground" />
                </button>
              </div>

              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-hero-gradient rounded-full transition-all duration-200"
                  style={{ width: `${Math.min((amount / askingPrice) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {Math.round((amount / askingPrice) * 100)}% of asking price
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message to the seller..."
              rows={3}
            />
          </div>

          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="w-full"
            disabled={isSubmitting || amount <= 0}
          >
            {isSubmitting ? "Sending..." : "Send Offer"}
            <Send className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MakeOfferDialog;
