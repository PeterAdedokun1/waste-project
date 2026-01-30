import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Public review data (from reviews_public view - excludes order_id, reviewer_id)
interface PublicReview {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewee_id: string;
}

// Full review data (only accessible to authenticated users involved in the order)
interface Review {
  id: string;
  order_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer?: {
    full_name: string | null;
    company_name: string | null;
  };
}

interface UserRating {
  average_rating: number | null;
  total_reviews: number;
}

export const useUserRating = (userId: string | undefined) => {
  const [rating, setRating] = useState<UserRating>({ average_rating: null, total_reviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRating = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc("get_user_rating", {
        target_user_id: userId,
      });

      if (!error && data && data.length > 0) {
        setRating({
          average_rating: data[0].average_rating,
          total_reviews: Number(data[0].total_reviews),
        });
      }
      setLoading(false);
    };

    fetchRating();
  }, [userId]);

  return { rating, loading };
};

export const useUserReviews = (userId: string | undefined) => {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      // Get reviews using the public view to protect order relationships
      // This view excludes order_id and reviewer_id for privacy
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews_public")
        .select("id, rating, comment, created_at, reviewee_id")
        .eq("reviewee_id", userId)
        .order("created_at", { ascending: false });

      if (reviewsError || !reviewsData) {
        setLoading(false);
        return;
      }

      setReviews(reviewsData);
      setLoading(false);
    };

    fetchReviews();
  }, [userId]);

  return { reviews, loading };
};

export const useCanReviewOrder = (orderId: string | undefined) => {
  const { user } = useAuth();
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkCanReview = async () => {
      if (!user || !orderId) {
        setCanReview(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc("can_review_order", {
        target_order_id: orderId,
      });

      if (!error) {
        setCanReview(data === true);
      }
      setLoading(false);
    };

    checkCanReview();
  }, [user, orderId]);

  return { canReview, loading };
};

export const useSubmitReview = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const submitReview = async (
    orderId: string,
    revieweeId: string,
    rating: number,
    comment?: string
  ) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a review",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    const { error } = await supabase.from("reviews").insert({
      order_id: orderId,
      reviewer_id: user.id,
      reviewee_id: revieweeId,
      rating,
      comment: comment || null,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Review Submitted",
      description: "Thank you for your feedback!",
    });
    return true;
  };

  return { submitReview, loading };
};
