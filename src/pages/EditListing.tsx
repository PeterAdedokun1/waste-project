import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Package, 
  MapPin, 
  DollarSign, 
  Upload, 
  X, 
  ArrowLeft,
  ImagePlus,
  Save
} from "lucide-react";

const wasteTypes = [
  { value: "plastic", label: "Plastic" },
  { value: "paper", label: "Paper & Cardboard" },
  { value: "metal", label: "Metal & Alloys" },
  { value: "electronics", label: "E-Waste" },
  { value: "organic", label: "Organic" },
  { value: "textile", label: "Textile" },
  { value: "glass", label: "Glass" },
  { value: "rubber", label: "Rubber" },
  { value: "wood", label: "Wood" },
  { value: "other", label: "Other" },
];

const quantityUnits = [
  { value: "kg", label: "Kilograms (kg)" },
  { value: "tons", label: "Tons" },
  { value: "pieces", label: "Pieces" },
  { value: "liters", label: "Liters" },
];

const EditListing = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    waste_type: "",
    quantity: "",
    quantity_unit: "kg",
    asking_price: "",
    location: "",
    city: "",
    state: "",
  });

  useEffect(() => {
    if (user && id) {
      fetchListing();
    }
  }, [user, id]);

  const fetchListing = async () => {
    const { data, error } = await supabase
      .from("waste_listings")
      .select("*")
      .eq("id", id)
      .eq("user_id", user?.id)
      .maybeSingle();

    if (error || !data) {
      toast.error("Listing not found");
      navigate("/my-listings");
      return;
    }

    setFormData({
      title: data.title || "",
      description: data.description || "",
      waste_type: data.waste_type || "",
      quantity: data.quantity?.toString() || "",
      quantity_unit: data.quantity_unit || "kg",
      asking_price: data.asking_price?.toString() || "",
      location: data.location || "",
      city: data.city || "",
      state: data.state || "",
    });
    setImages(data.images || []);
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const newImages: string[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        continue;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error, data } = await supabase.storage
        .from("listing-images")
        .upload(fileName, file);

      if (error) {
        toast.error(`Failed to upload ${file.name}`);
        console.error(error);
      } else if (data) {
        const { data: publicUrl } = supabase.storage
          .from("listing-images")
          .getPublicUrl(data.path);
        newImages.push(publicUrl.publicUrl);
      }
    }

    setImages([...images, ...newImages]);
    setUploadingImages(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = async (imageUrl: string) => {
    const path = imageUrl.split("/listing-images/")[1];
    if (path) {
      await supabase.storage.from("listing-images").remove([path]);
    }
    setImages(images.filter((img) => img !== imageUrl));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase
      .from("waste_listings")
      .update({
        title: formData.title,
        description: formData.description,
        waste_type: formData.waste_type as any,
        quantity: parseFloat(formData.quantity),
        quantity_unit: formData.quantity_unit,
        asking_price: parseFloat(formData.asking_price),
        location: formData.location,
        city: formData.city,
        state: formData.state,
        images: images,
      })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update listing");
      console.error(error);
    } else {
      toast.success("Listing updated successfully!");
      navigate("/my-listings");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Edit Listing
          </h1>
          <p className="text-muted-foreground mb-8">
            Update your listing details.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Listing Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Industrial Plastic Waste"
                className="h-12"
                required
              />
            </div>

            {/* Waste Type */}
            <div className="space-y-2">
              <Label>Waste Type *</Label>
              <Select
                value={formData.waste_type}
                onValueChange={(value) => setFormData({ ...formData, waste_type: value })}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select waste type" />
                </SelectTrigger>
                <SelectContent>
                  {wasteTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="e.g., 500"
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Unit *</Label>
                <Select
                  value={formData.quantity_unit}
                  onValueChange={(value) => setFormData({ ...formData, quantity_unit: value })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {quantityUnits.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Asking Price */}
            <div className="space-y-2">
              <Label htmlFor="askingPrice">Asking Price ($) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="askingPrice"
                  type="number"
                  step="0.01"
                  value={formData.asking_price}
                  onChange={(e) => setFormData({ ...formData, asking_price: e.target.value })}
                  placeholder="e.g., 25000"
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Full Address *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Textarea
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter pickup location address"
                  className="pl-10 min-h-[80px]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g., Mumbai"
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="e.g., Maharashtra"
                  className="h-12"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the waste materials, condition, and any other relevant details..."
                rows={4}
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Photos</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(img)}
                          className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImages}
                  className="w-full flex flex-col items-center gap-2 py-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {uploadingImages ? (
                    <Upload className="w-8 h-8 animate-pulse" />
                  ) : (
                    <ImagePlus className="w-8 h-8" />
                  )}
                  <span className="text-sm font-medium">
                    {uploadingImages ? "Uploading..." : "Click to upload images"}
                  </span>
                  <span className="text-xs">PNG, JPG up to 5MB each</span>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isSubmitting || !formData.waste_type}
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

export default EditListing;
