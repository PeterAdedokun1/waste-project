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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateDispute, DisputeReason, disputeReasonLabels } from "@/hooks/useDisputes";

interface RaiseDisputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  onSuccess?: () => void;
}

const RaiseDisputeDialog = ({
  open,
  onOpenChange,
  orderId,
  onSuccess,
}: RaiseDisputeDialogProps) => {
  const [reason, setReason] = useState<DisputeReason | "">("");
  const [description, setDescription] = useState("");
  const { createDispute, loading } = useCreateDispute();

  const handleSubmit = async () => {
    if (!reason || !description.trim()) return;

    const result = await createDispute(orderId, reason, description);
    if (result) {
      setReason("");
      setDescription("");
      onOpenChange(false);
      onSuccess?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Raise a Dispute</DialogTitle>
          <DialogDescription>
            Describe the issue you're experiencing with this transaction. Our admin team will review and help resolve it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Reason for Dispute</Label>
            <Select value={reason} onValueChange={(v) => setReason(v as DisputeReason)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(disputeReasonLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Please describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={loading || !reason || !description.trim()}
          >
            {loading ? "Submitting..." : "Submit Dispute"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RaiseDisputeDialog;
