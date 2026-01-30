export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      conversations: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          last_message_at: string | null
          listing_id: string
          offer_id: string | null
          seller_id: string
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          listing_id: string
          offer_id?: string | null
          seller_id: string
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          listing_id?: string
          offer_id?: string | null
          seller_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "waste_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: true
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      dispute_messages: {
        Row: {
          created_at: string
          dispute_id: string
          id: string
          is_admin: boolean
          message: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          dispute_id: string
          id?: string
          is_admin?: boolean
          message: string
          sender_id: string
        }
        Update: {
          created_at?: string
          dispute_id?: string
          id?: string
          is_admin?: boolean
          message?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispute_messages_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          admin_id: string | null
          admin_notes: string | null
          created_at: string
          description: string
          evidence_urls: string[] | null
          id: string
          order_id: string
          raised_by: string
          reason: Database["public"]["Enums"]["dispute_reason"]
          resolution_notes: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["dispute_status"]
          updated_at: string
        }
        Insert: {
          admin_id?: string | null
          admin_notes?: string | null
          created_at?: string
          description: string
          evidence_urls?: string[] | null
          id?: string
          order_id: string
          raised_by: string
          reason: Database["public"]["Enums"]["dispute_reason"]
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
          updated_at?: string
        }
        Update: {
          admin_id?: string | null
          admin_notes?: string | null
          created_at?: string
          description?: string
          evidence_urls?: string[] | null
          id?: string
          order_id?: string
          raised_by?: string
          reason?: Database["public"]["Enums"]["dispute_reason"]
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          amount: number
          buyer_id: string
          counter_amount: number | null
          counter_message: string | null
          created_at: string
          id: string
          listing_id: string
          message: string | null
          parent_offer_id: string | null
          responded_at: string | null
          seller_id: string
          status: Database["public"]["Enums"]["offer_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          buyer_id: string
          counter_amount?: number | null
          counter_message?: string | null
          created_at?: string
          id?: string
          listing_id: string
          message?: string | null
          parent_offer_id?: string | null
          responded_at?: string | null
          seller_id: string
          status?: Database["public"]["Enums"]["offer_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          buyer_id?: string
          counter_amount?: number | null
          counter_message?: string | null
          created_at?: string
          id?: string
          listing_id?: string
          message?: string | null
          parent_offer_id?: string | null
          responded_at?: string | null
          seller_id?: string
          status?: Database["public"]["Enums"]["offer_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "waste_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_parent_offer_id_fkey"
            columns: ["parent_offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string
          created_at: string
          id: string
          notes: string | null
          order_id: string
          status: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          changed_by: string
          created_at?: string
          id?: string
          notes?: string | null
          order_id: string
          status: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          changed_by?: string
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          status?: Database["public"]["Enums"]["order_status"]
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          buyer_confirmed_at: string | null
          buyer_id: string
          cancellation_reason: string | null
          cancelled_at: string | null
          completed_at: string | null
          created_at: string
          delivery_confirmed_at: string | null
          id: string
          listing_id: string
          offer_id: string
          pickup_address: string | null
          pickup_date: string | null
          pickup_notes: string | null
          pickup_time: string | null
          seller_confirmed_at: string | null
          seller_id: string
          status: Database["public"]["Enums"]["order_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          buyer_confirmed_at?: string | null
          buyer_id: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          delivery_confirmed_at?: string | null
          id?: string
          listing_id: string
          offer_id: string
          pickup_address?: string | null
          pickup_date?: string | null
          pickup_notes?: string | null
          pickup_time?: string | null
          seller_confirmed_at?: string | null
          seller_id: string
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          buyer_confirmed_at?: string | null
          buyer_id?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          delivery_confirmed_at?: string | null
          id?: string
          listing_id?: string
          offer_id?: string
          pickup_address?: string | null
          pickup_date?: string | null
          pickup_notes?: string | null
          pickup_time?: string | null
          seller_confirmed_at?: string | null
          seller_id?: string
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "waste_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: true
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company_name: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_suspended: boolean
          location: string | null
          phone: string | null
          suspended_at: string | null
          suspended_reason: string | null
          updated_at: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          is_suspended?: boolean
          location?: string | null
          phone?: string | null
          suspended_at?: string | null
          suspended_reason?: string | null
          updated_at?: string
          user_id: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_suspended?: boolean
          location?: string | null
          phone?: string | null
          suspended_at?: string | null
          suspended_reason?: string | null
          updated_at?: string
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          order_id: string
          rating: number
          reviewee_id: string
          reviewer_id: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          order_id: string
          rating: number
          reviewee_id: string
          reviewer_id: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          order_id?: string
          rating?: number
          reviewee_id?: string
          reviewer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waste_listings: {
        Row: {
          asking_price: number
          city: string | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          location: string
          offers_count: number
          quantity: number
          quantity_unit: string
          state: string | null
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at: string
          user_id: string
          views_count: number
          waste_type: Database["public"]["Enums"]["waste_type"]
        }
        Insert: {
          asking_price: number
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          location: string
          offers_count?: number
          quantity: number
          quantity_unit?: string
          state?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at?: string
          user_id: string
          views_count?: number
          waste_type: Database["public"]["Enums"]["waste_type"]
        }
        Update: {
          asking_price?: number
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          location?: string
          offers_count?: number
          quantity?: number
          quantity_unit?: string
          state?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          updated_at?: string
          user_id?: string
          views_count?: number
          waste_type?: Database["public"]["Enums"]["waste_type"]
        }
        Relationships: []
      }
    }
    Views: {
      profiles_public: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company_name: string | null
          created_at: string | null
          full_name: string | null
          location: string | null
          user_id: string | null
          user_type: Database["public"]["Enums"]["user_type"] | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string | null
          full_name?: string | null
          location?: string | null
          user_id?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string | null
          full_name?: string | null
          location?: string | null
          user_id?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Relationships: []
      }
      reviews_public: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string | null
          rating: number | null
          reviewee_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string | null
          rating?: number | null
          reviewee_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string | null
          rating?: number | null
          reviewee_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_remove_listing: {
        Args: { target_listing_id: string }
        Returns: boolean
      }
      admin_update_dispute: {
        Args: {
          dispute_id: string
          new_status: Database["public"]["Enums"]["dispute_status"]
          notes?: string
          resolution?: string
        }
        Returns: boolean
      }
      can_review_order: { Args: { target_order_id: string }; Returns: boolean }
      get_all_disputes_admin: {
        Args: never
        Returns: {
          admin_id: string
          admin_notes: string
          buyer_name: string
          created_at: string
          description: string
          id: string
          listing_title: string
          order_amount: number
          order_id: string
          raised_by: string
          raiser_name: string
          reason: Database["public"]["Enums"]["dispute_reason"]
          resolution_notes: string
          resolved_at: string
          seller_name: string
          status: Database["public"]["Enums"]["dispute_status"]
          updated_at: string
        }[]
      }
      get_all_listings_admin: {
        Args: never
        Returns: {
          asking_price: number
          city: string
          created_at: string
          description: string
          id: string
          location: string
          offers_count: number
          quantity: number
          quantity_unit: string
          seller_email: string
          seller_name: string
          state: string
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at: string
          user_id: string
          views_count: number
          waste_type: Database["public"]["Enums"]["waste_type"]
        }[]
      }
      get_all_orders_admin: {
        Args: never
        Returns: {
          amount: number
          buyer_id: string
          buyer_name: string
          created_at: string
          id: string
          listing_id: string
          listing_title: string
          offer_id: string
          pickup_date: string
          seller_id: string
          seller_name: string
          status: Database["public"]["Enums"]["order_status"]
          updated_at: string
        }[]
      }
      get_all_profiles_admin: {
        Args: never
        Returns: {
          avatar_url: string | null
          bio: string | null
          company_name: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_suspended: boolean
          location: string | null
          phone: string | null
          suspended_at: string | null
          suspended_reason: string | null
          updated_at: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }[]
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_user_rating: {
        Args: { target_user_id: string }
        Returns: {
          average_rating: number
          total_reviews: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      suspend_user: {
        Args: { reason: string; target_user_id: string }
        Returns: boolean
      }
      unsuspend_user: { Args: { target_user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      dispute_reason:
        | "quality_issue"
        | "quantity_mismatch"
        | "wrong_material"
        | "delivery_issue"
        | "payment_issue"
        | "communication_issue"
        | "fraud_suspected"
        | "other"
      dispute_status:
        | "open"
        | "under_review"
        | "awaiting_response"
        | "resolved_buyer_favor"
        | "resolved_seller_favor"
        | "resolved_mutual"
        | "closed"
      listing_status: "active" | "pending" | "sold" | "expired" | "cancelled"
      offer_status:
        | "pending"
        | "accepted"
        | "declined"
        | "countered"
        | "expired"
        | "withdrawn"
      order_status:
        | "pending_pickup"
        | "pickup_scheduled"
        | "in_transit"
        | "delivered"
        | "completed"
        | "cancelled"
        | "disputed"
      user_type: "generator" | "middleman" | "recycler"
      waste_type:
        | "plastic"
        | "paper"
        | "metal"
        | "electronics"
        | "organic"
        | "textile"
        | "glass"
        | "rubber"
        | "wood"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      dispute_reason: [
        "quality_issue",
        "quantity_mismatch",
        "wrong_material",
        "delivery_issue",
        "payment_issue",
        "communication_issue",
        "fraud_suspected",
        "other",
      ],
      dispute_status: [
        "open",
        "under_review",
        "awaiting_response",
        "resolved_buyer_favor",
        "resolved_seller_favor",
        "resolved_mutual",
        "closed",
      ],
      listing_status: ["active", "pending", "sold", "expired", "cancelled"],
      offer_status: [
        "pending",
        "accepted",
        "declined",
        "countered",
        "expired",
        "withdrawn",
      ],
      order_status: [
        "pending_pickup",
        "pickup_scheduled",
        "in_transit",
        "delivered",
        "completed",
        "cancelled",
        "disputed",
      ],
      user_type: ["generator", "middleman", "recycler"],
      waste_type: [
        "plastic",
        "paper",
        "metal",
        "electronics",
        "organic",
        "textile",
        "glass",
        "rubber",
        "wood",
        "other",
      ],
    },
  },
} as const
