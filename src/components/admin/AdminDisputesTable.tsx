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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Search, Eye, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import {
  AdminDispute,
  DisputeStatus,
  disputeStatusLabels,
  disputeReasonLabels,
  useDisputeMessages,
  useSendDisputeMessage,
} from "@/hooks/useDisputes";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AdminDisputesTableProps {
  disputes: AdminDispute[];
  onUpdate: (
    disputeId: string,
    status: DisputeStatus,
    notes?: string,
    resolution?: string
  ) => Promise<boolean>;
  onRefresh: () => void;
}

const statusColors: Record<DisputeStatus, string> = {
  open: "bg-amber-100 text-amber-800",
  under_review: "bg-blue-100 text-blue-800",
  awaiting_response: "bg-purple-100 text-purple-800",
  resolved_buyer_favor: "bg-green-100 text-green-800",
  resolved_seller_favor: "bg-green-100 text-green-800",
  resolved_mutual: "bg-green-100 text-green-800",
  closed: "bg-muted text-muted-foreground",
};

const AdminDisputesTable = ({
  disputes,
  onUpdate,
  onRefresh,
}: AdminDisputesTableProps) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDispute, setSelectedDispute] = useState<AdminDispute | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<DisputeStatus>("under_review");
  const [adminNotes, setAdminNotes] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredDisputes = disputes.filter((d) => {
    const matchesSearch =
      d.listing_title?.toLowerCase().includes(search.toLowerCase()) ||
      d.raiser_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.buyer_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.seller_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdate = async () => {
    if (!selectedDispute) return;
    setLoading(true);
    const success = await onUpdate(
      selectedDispute.id,
      newStatus,
      adminNotes || undefined,
      resolutionNotes || undefined
    );
    if (success) {
      setShowUpdateDialog(false);
      setAdminNotes("");
      setResolutionNotes("");
      onRefresh();
    }
    setLoading(false);
  };

  const openUpdateDialog = (dispute: AdminDispute) => {
    setSelectedDispute(dispute);
    setNewStatus(dispute.status);
    setAdminNotes(dispute.admin_notes || "");
    setResolutionNotes(dispute.resolution_notes || "");
    setShowUpdateDialog(true);
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search disputes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "open", "under_review", "awaiting_response"].map((status) => (
            <Button
              key={status}
              size="sm"
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => setStatusFilter(status)}
            >
              {status === "all" ? "All" : disputeStatusLabels[status as DisputeStatus]}
            </Button>
          ))}
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dispute</TableHead>
              <TableHead>Parties</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDisputes.map((dispute) => (
              <TableRow key={dispute.id}>
                <TableCell>
                  <div className="max-w-[200px]">
                    <div className="font-medium truncate">
                      {dispute.listing_title || "Unknown Listing"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Raised by: {dispute.raiser_name || "Unknown"}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>Buyer: {dispute.buyer_name || "—"}</div>
                    <div>Seller: {dispute.seller_name || "—"}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {disputeReasonLabels[dispute.reason]}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  ${Number(dispute.order_amount).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[dispute.status]}>
                    {disputeStatusLabels[dispute.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(dispute.created_at), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedDispute(dispute);
                        setShowDetailsDialog(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openUpdateDialog(dispute)}
                    >
                      Manage
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredDisputes.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No disputes found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Dispute Details</DialogTitle>
          </DialogHeader>
          {selectedDispute && (
            <DisputeDetailsView dispute={selectedDispute} />
          )}
        </DialogContent>
      </Dialog>

      {/* Update Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Dispute</DialogTitle>
            <DialogDescription>
              Update the status and add notes for this dispute.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as DisputeStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(disputeStatusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Notes (internal)</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal notes..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Resolution Notes (visible to users)</label>
              <Textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Resolution explanation..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={loading}>
              {loading ? "Updating..." : "Update Dispute"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Sub-component for dispute details view
const DisputeDetailsView = ({ dispute }: { dispute: AdminDispute }) => {
  const { messages } = useDisputeMessages(dispute.id);
  const { sendMessage, loading } = useSendDisputeMessage();
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    if (!message.trim()) return;
    const success = await sendMessage(dispute.id, message, true);
    if (success) setMessage("");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Listing:</span>
          <p className="font-medium">{dispute.listing_title || "Unknown"}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Amount:</span>
          <p className="font-medium">${Number(dispute.order_amount).toLocaleString()}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Buyer:</span>
          <p className="font-medium">{dispute.buyer_name || "Unknown"}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Seller:</span>
          <p className="font-medium">{dispute.seller_name || "Unknown"}</p>
        </div>
      </div>

      <div className="p-3 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-1">Description</p>
        <p className="text-sm">{dispute.description}</p>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Messages ({messages.length})</p>
        <ScrollArea className="h-40 border rounded-lg p-3">
          {messages.map((msg) => (
            <div key={msg.id} className="mb-2 text-sm">
              <span className="font-medium">
                {msg.is_admin ? "Admin" : msg.sender_name}:
              </span>{" "}
              <span className="text-muted-foreground">{msg.message}</span>
            </div>
          ))}
        </ScrollArea>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Send admin message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button onClick={handleSend} disabled={loading || !message.trim()}>
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminDisputesTable;
