import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone } from "lucide-react";
import { LOCATIONS } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Upload, ArrowLeft } from "lucide-react";

const ReportItemPage = () => {
  const { type } = useParams<{ type: "lost" | "found" }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isLost = type === "lost";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: `${isLost ? "Lost" : "Found"} item reported!`,
      description: `Your ${isLost ? "lost" : "found"} item "${title}" has been posted successfully.`,
    });
    navigate("/my-posts");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-xl py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Report {isLost ? "Lost" : "Found"} Item
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            {isLost ? "Describe the item you lost so others can help find it." : "Describe the item you found to help reunite it with its owner."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="e.g., Blue Backpack" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" placeholder="Provide details like color, brand, distinguishing features..." value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[100px]" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="phone" type="tel" placeholder="e.g., 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Location</Label>
              <Select value={location} onValueChange={setLocation} required>
                <SelectTrigger>
                  <SelectValue placeholder="Where was it lost/found?" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Upload Image</Label>
              <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border hover:border-primary/40 bg-muted/30 p-8 cursor-pointer transition-colors">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="max-h-40 rounded-lg object-cover" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Click to upload an image</span>
                    <span className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={!title || !description || !location}>
              Submit Report
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ReportItemPage;
