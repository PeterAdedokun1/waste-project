import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  User, 
  Building2, 
  Phone, 
  MapPin, 
  Save,
  Factory,
  Truck,
  RefreshCw
} from "lucide-react";
import AvatarUpload from "@/components/profile/AvatarUpload";

const userTypes = [
  { id: "generator", label: "Generator", icon: Factory },
  { id: "middleman", label: "Middleman", icon: Truck },
  { id: "recycler", label: "Recycler", icon: RefreshCw },
];

interface FormData {
  full_name: string;
  company_name: string;
  phone: string;
  location: string;
  bio: string;
  user_type: "generator" | "middleman" | "recycler";
  avatar_url: string | null;
}

const Profile = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    company_name: "",
    phone: "",
    location: "",
    bio: "",
    user_type: "generator",
    avatar_url: null,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        company_name: profile.company_name || "",
        phone: profile.phone || "",
        location: profile.location || "",
        bio: profile.bio || "",
        user_type: profile.user_type || "generator",
        avatar_url: profile.avatar_url || null,
      });
    }
  }, [profile]);

  const handleAvatarChange = (url: string | null) => {
    setFormData({ ...formData, avatar_url: url });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: formData.full_name,
        company_name: formData.company_name,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        user_type: formData.user_type,
      })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } else {
      toast.success("Profile updated successfully!");
      await refreshProfile();
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Edit Profile
          </h1>
          <p className="text-muted-foreground mb-8">
            Update your profile information to build trust with other traders.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Avatar Upload */}
            <div className="flex justify-center">
              <AvatarUpload
                userId={user.id}
                currentAvatarUrl={formData.avatar_url}
                displayName={formData.full_name || formData.company_name || "User"}
                onAvatarChange={handleAvatarChange}
              />
            </div>

            {/* User Type Selection */}
            <div className="space-y-3">
              <Label>Account Type</Label>
              <div className="grid grid-cols-3 gap-3">
                {userTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, user_type: type.id as "generator" | "middleman" | "recycler" })}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      formData.user_type === type.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <type.icon className={`w-6 h-6 mx-auto mb-2 ${
                      formData.user_type === type.id ? "text-primary" : "text-muted-foreground"
                    }`} />
                    <span className={`block text-sm font-semibold ${
                      formData.user_type === type.id ? "text-primary" : "text-foreground"
                    }`}>
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="fullName"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="pl-10 h-12"
                  placeholder="Your full name"
                />
              </div>
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="companyName"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="pl-10 h-12"
                  placeholder="Your company or business name"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="pl-10 h-12"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="pl-10 h-12"
                  placeholder="City, State"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">About Your Business</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell others about your business, what materials you handle, and your experience..."
                rows={4}
              />
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                value={profile?.email || ""}
                disabled
                className="h-12 bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Profile;
