import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import StarRating from "./StarRating";
import { useSubmitReview } from "@/hooks/useReviews";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  revieweeId: string;
  revieweeName: string;
  onSuccess?: () => void;
}

const ReviewDialog = ({
  open,
  onOpenChange,
  orderId,
  revieweeId,
  revieweeName,
  onSuccess,
}: ReviewDialogProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const { submitReview, loading } = useSubmitReview();

  const handleSubmit = async () => {
    if (rating === 0) return;

    const success = await submitReview(orderId, revieweeId, rating, comment);
    if (success) {
      setRating(0);
      setComment("");
      onOpenChange(false);
      onSuccess?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
          <DialogDescription>
            How was your experience with {revieweeName}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex items-center gap-3">
              <StarRating
                rating={rating}
                size="lg"
                interactive
                onRatingChange={setRating}
              />
              <span className="text-sm text-muted-foreground">
                {rating > 0 ? `${rating} star${rating > 1 ? "s" : ""}` : "Select a rating"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment (optional)</Label>
            <Textarea
              id="comment"
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || rating === 0}>
            {loading ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;
