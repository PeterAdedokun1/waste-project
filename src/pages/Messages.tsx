import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useConversations, Conversation } from "@/hooks/useMessages";
import Header from "@/components/layout/Header";
import ConversationList from "@/components/messages/ConversationList";
import ChatWindow from "@/components/messages/ChatWindow";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const Messages = () => {
  const { user, loading: authLoading } = useAuth();
  const { conversations, loading } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <div className="h-[calc(100vh-4rem)] flex">
          {/* Conversation List - Hidden on mobile when conversation is selected */}
          <div
            className={cn(
              "w-full md:w-80 lg:w-96 border-r border-border bg-card flex flex-col",
              selectedConversation && "hidden md:flex"
            )}
          >
            <div className="p-4 border-b border-border">
              <h1 className="font-display text-xl font-bold text-foreground">Messages</h1>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center text-muted-foreground">
                  Loading conversations...
                </div>
              ) : (
                <ConversationList
                  conversations={conversations}
                  selectedId={selectedConversation?.id || null}
                  onSelect={setSelectedConversation}
                />
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div
            className={cn(
              "flex-1 flex flex-col",
              !selectedConversation && "hidden md:flex"
            )}
          >
            {selectedConversation ? (
              <ChatWindow
                conversation={selectedConversation}
                onBack={() => setSelectedConversation(null)}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-muted/20">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Select a conversation</p>
                  <p className="text-sm mt-1">Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;
