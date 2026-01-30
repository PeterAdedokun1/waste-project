import { useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Package, History } from "lucide-react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileListings from "@/components/profile/ProfileListings";
import ProfileTransactions from "@/components/profile/ProfileTransactions";
import ReviewsList from "@/components/reviews/ReviewsList";
import { usePublicProfile, useUserListings, useUserTransactions } from "@/hooks/usePublicProfile";
import { useUserRating, useUserReviews } from "@/hooks/useReviews";

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  
  const { profile, loading: profileLoading } = usePublicProfile(id);
  const { rating, loading: ratingLoading } = useUserRating(id);
  const { listings, loading: listingsLoading } = useUserListings(id);
  const { reviews, loading: reviewsLoading } = useUserReviews(id);
  const { transactions, stats, loading: transactionsLoading } = useUserTransactions(id);

  const isLoading = profileLoading || ratingLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl space-y-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              User Not Found
            </h1>
            <p className="text-muted-foreground">
              The profile you're looking for doesn't exist.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl space-y-6">
          <ProfileHeader profile={profile} rating={rating} />

          <Tabs defaultValue="listings" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="listings" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Listings</span>
                <span className="text-xs text-muted-foreground">
                  ({listings.length})
                </span>
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span className="hidden sm:inline">Reviews</span>
                <span className="text-xs text-muted-foreground">
                  ({reviews.length})
                </span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">History</span>
                <span className="text-xs text-muted-foreground">
                  ({stats.totalCompleted})
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="listings" className="mt-6">
              <ProfileListings listings={listings} loading={listingsLoading} />
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <ReviewsList userId={id} />
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <ProfileTransactions 
                transactions={transactions} 
                stats={stats} 
                loading={transactionsLoading} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
