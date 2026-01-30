import { formatDistanceToNow } from "date-fns";
import { Conversation } from "@/hooks/useMessages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (conversation: Conversation) => void;
}

const ConversationList = ({ conversations, selectedId, onSelect }: ConversationListProps) => {
  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>No conversations yet</p>
        <p className="text-sm mt-1">Start a conversation from an offer</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelect(conversation)}
          className={cn(
            "w-full p-4 text-left hover:bg-muted/50 transition-colors",
            selectedId === conversation.id && "bg-muted"
          )}
        >
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={conversation.other_user?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {conversation.other_user?.full_name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-foreground truncate">
                  {conversation.other_user?.full_name || conversation.other_user?.company_name || "User"}
                </span>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {conversation.listing?.title}
              </p>
              
              {conversation.last_message && (
                <p className="text-sm text-muted-foreground truncate mt-1">
                  {conversation.last_message.content}
                </p>
              )}
            </div>

            {conversation.unread_count && conversation.unread_count > 0 && (
              <Badge variant="default" className="ml-2 flex-shrink-0">
                {conversation.unread_count}
              </Badge>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

export default ConversationList;
