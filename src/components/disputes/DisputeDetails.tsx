import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Send, Shield, User } from "lucide-react";
import {
  Dispute,
  DisputeMessage,
  useDisputeMessages,
  useSendDisputeMessage,
  disputeReasonLabels,
  disputeStatusLabels,
  DisputeStatus,
} from "@/hooks/useDisputes";
import { useAuth } from "@/contexts/AuthContext";

interface DisputeDetailsProps {
  dispute: Dispute;
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

const DisputeDetails = ({ dispute }: DisputeDetailsProps) => {
  const { user } = useAuth();
  const { messages, loading: messagesLoading } = useDisputeMessages(dispute.id);
  const { sendMessage, loading: sendingMessage } = useSendDisputeMessage();
  const [newMessage, setNewMessage] = useState("");

  const isResolved = [
    "resolved_buyer_favor",
    "resolved_seller_favor",
    "resolved_mutual",
    "closed",
  ].includes(dispute.status);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    const success = await sendMessage(dispute.id, newMessage);
    if (success) {
      setNewMessage("");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Dispute Details</CardTitle>
          <Badge className={statusColors[dispute.status]}>
            {disputeStatusLabels[dispute.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Reason:</span>
            <span className="font-medium">{disputeReasonLabels[dispute.reason]}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Opened:</span>
            <span>{format(new Date(dispute.created_at), "PPp")}</span>
          </div>
          {dispute.resolved_at && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Resolved:</span>
              <span>{format(new Date(dispute.resolved_at), "PPp")}</span>
            </div>
          )}
        </div>

        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium mb-1">Description</p>
          <p className="text-sm text-muted-foreground">{dispute.description}</p>
        </div>

        {dispute.resolution_notes && (
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
            <p className="text-sm font-medium mb-1 text-primary">Resolution</p>
            <p className="text-sm text-muted-foreground">{dispute.resolution_notes}</p>
          </div>
        )}

        {/* Messages Section */}
        <div className="border-t pt-4">
          <p className="text-sm font-medium mb-3">Messages</p>
          <ScrollArea className="h-48 border rounded-lg p-3">
            {messagesLoading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Loading...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No messages yet
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${
                      msg.sender_id === user?.id ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.is_admin ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      {msg.is_admin ? (
                        <Shield className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    <div
                      className={`flex-1 max-w-[80%] ${
                        msg.sender_id === user?.id ? "text-right" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">
                          {msg.sender_id === user?.id ? "You" : msg.sender_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(msg.created_at), "p")}
                        </span>
                      </div>
                      <div
                        className={`p-2 rounded-lg text-sm ${
                          msg.is_admin
                            ? "bg-primary/10"
                            : msg.sender_id === user?.id
                            ? "bg-muted"
                            : "bg-muted/50"
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {!isResolved && (
            <div className="flex gap-2 mt-3">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={sendingMessage || !newMessage.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DisputeDetails;
