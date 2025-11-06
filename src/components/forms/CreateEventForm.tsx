import { useState, useRef } from "react";
import { Calendar, MapPin, DollarSign, Users, FileText, Image as ImageIcon, Upload, Link as LinkIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useCreateEvent } from "@/hooks/useEvents";
import { uploadEventImage } from "@/lib/storage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CreateEventFormProps {
  open: boolean;
  onClose: () => void;
}

export function CreateEventForm({ open, onClose }: CreateEventFormProps) {
  const { user } = useAuth();
  const { createEvent, loading: creating } = useCreateEvent();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    price: "",
    capacity: "",
    category: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    // Validate URL format
    if (url && !url.match(/^https?:\/\/.+/)) {
      // Don't show error immediately, let user finish typing
      return;
    }
    // Set preview if valid URL
    if (url && url.match(/^https?:\/\/.+/)) {
      setImagePreview(url);
    } else if (!url) {
      setImagePreview(null);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImageUrl("");
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("You must be logged in to create an event");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      // Combine date and time into datetime string
      const dateTime = `${formData.date}T${formData.time}:00.000Z`;

      let finalImageUrl = "";

      // Handle image upload or URL
      if (imageMode === "upload" && imageFile) {
        try {
          // Generate a temporary event ID for the upload path
          const tempEventId = `temp-${Date.now()}`;
          const uploadResult = await uploadEventImage(
            imageFile,
            tempEventId,
            (progress) => setUploadProgress(progress)
          );
          finalImageUrl = uploadResult.url;
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          alert("Failed to upload image. Please try again or use an image URL instead.");
          setLoading(false);
          return;
        }
      } else if (imageMode === "url" && imageUrl) {
        // Validate URL format
        if (!imageUrl.match(/^https?:\/\/.+/)) {
          alert("Please enter a valid image URL (must start with http:// or https://)");
          setLoading(false);
          return;
        }
        finalImageUrl = imageUrl.trim();
      }

      // Create event with organizerID set to current user's sub (Cognito user ID)
      const eventInput: any = {
        title: formData.title,
        description: formData.description,
        date: dateTime,
        location: formData.location,
        price: parseFloat(formData.price) || 0,
        capacity: parseInt(formData.capacity) || 0,
        category: formData.category,
        organizerID: user.userId, // Cognito sub
        organizerName: user.name || user.email || user.username,
        status: "published",
        publishedAt: new Date().toISOString(),
      };

      // Only include imageUrl if it's provided
      if (finalImageUrl) {
        eventInput.imageUrl = finalImageUrl;
      }

      console.log("Creating event with data:", eventInput);

      const newEvent = await createEvent(eventInput);

      if (newEvent) {
        alert("Event created successfully!");
        onClose();

        // Reset form
        setFormData({
          title: "",
          description: "",
          date: "",
          time: "",
          location: "",
          price: "",
          capacity: "",
          category: "",
        });
        clearImage();
        setImageMode("upload");
        setUploadProgress(0);
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event. Please try again.");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        price: "",
        capacity: "",
        category: "",
      });
      clearImage();
      setImageMode("upload");
      setUploadProgress(0);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create New Event</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new event
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Event Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Event Title
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter event title"
              required
              disabled={loading}
            />
          </div>

          {/* Event Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your event..."
              rows={4}
              required
              disabled={loading}
            />
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Event venue or address"
              required
              disabled={loading}
            />
          </div>

          {/* Price and Capacity Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Price (Leave 0 for free)
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Capacity
              </Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={handleInputChange}
                placeholder="Maximum attendees"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              placeholder="e.g., Music, Sports, Conference"
              required
              disabled={loading}
            />
          </div>

          {/* Event Image Upload or URL (Optional) */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Event Image (Optional)
            </Label>
            
            <Tabs value={imageMode} onValueChange={(v) => setImageMode(v as "upload" | "url")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload File
                </TabsTrigger>
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Image URL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-3">
                <div className="space-y-2">
                  <Input
                    ref={fileInputRef}
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    disabled={loading}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Supported formats: JPEG, PNG, WebP. Max size: 5MB
                  </p>
                </div>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Uploading...</span>
                      <span className="text-muted-foreground">{uploadProgress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="url" className="space-y-3">
                <div className="space-y-2">
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    type="url"
                    value={imageUrl}
                    onChange={handleImageUrlChange}
                    placeholder="https://example.com/image.jpg"
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a direct link to an image (must start with http:// or https://)
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative border rounded-lg overflow-hidden bg-muted">
                <img
                  src={imagePreview}
                  alt="Event preview"
                  className="w-full h-48 object-cover"
                  onError={() => {
                    setImagePreview(null);
                    if (imageMode === "url") {
                      alert("Failed to load image from URL. Please check the URL and try again.");
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={clearImage}
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || creating}>
              {loading || creating ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
