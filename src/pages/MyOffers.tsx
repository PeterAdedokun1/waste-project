import { useAuth } from "@/contexts/AuthContext";
import { useOffers } from "@/hooks/useOffers";
import { Navigate, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import OfferCard from "@/components/offers/OfferCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, ArrowLeft, Inbox, Send } from "lucide-react";

const MyOffers = () => {
  const { user, loading: authLoading } = useAuth();
  const { offers, loading, refetch } = useOffers();

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

  const receivedOffers = offers.filter(o => o.seller_id === user.id);
  const sentOffers = offers.filter(o => o.buyer_id === user.id);

  const pendingReceived = receivedOffers.filter(o => o.status === "pending").length;
  const pendingSent = sentOffers.filter(o => o.status === "pending" || o.status === "countered").length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" className="mb-6" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              My Offers
            </h1>
            <p className="text-muted-foreground">
              Manage your offers and negotiations
            </p>
          </div>

          <Tabs defaultValue="received" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="received" className="gap-2">
                <Inbox className="w-4 h-4" />
                Received
                {pendingReceived > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                    {pendingReceived}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent" className="gap-2">
                <Send className="w-4 h-4" />
                Sent
                {pendingSent > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-accent text-accent-foreground text-xs rounded-full">
                    {pendingSent}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="received">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-card rounded-2xl p-6 animate-pulse">
                      <div className="h-16 bg-muted rounded-xl mb-4" />
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : receivedOffers.length === 0 ? (
                <div className="text-center py-16">
                  <Inbox className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    No offers received yet
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    When buyers make offers on your listings, they'll appear here.
                  </p>
                  <Button variant="hero" asChild>
                    <Link to="/create-listing">Create a Listing</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {receivedOffers.map((offer) => (
                    <OfferCard key={offer.id} offer={offer} onUpdate={refetch} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="sent">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-card rounded-2xl p-6 animate-pulse">
                      <div className="h-16 bg-muted rounded-xl mb-4" />
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : sentOffers.length === 0 ? (
                <div className="text-center py-16">
                  <Send className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    No offers sent yet
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Browse listings and make offers to start negotiating.
                  </p>
                  <Button variant="hero" asChild>
                    <Link to="/browse">Browse Listings</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentOffers.map((offer) => (
                    <OfferCard key={offer.id} offer={offer} onUpdate={refetch} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default MyOffers;
