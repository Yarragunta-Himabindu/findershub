import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Clock, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Item } from "@/lib/types";
import { getItemById } from "@/lib/items-api";
import Navbar from "@/components/Navbar";
import ClaimModal from "@/components/ClaimModal";

const statusStyles = {
  lost: "bg-lost/10 text-lost border-lost/20",
  found: "bg-found/10 text-found border-found/20",
  claimed: "bg-claimed/10 text-claimed border-claimed/20",
};

const ItemDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showClaim, setShowClaim] = useState(false);
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadItem = async () => {
      if (!id) {
        setItem(null);
        setLoading(false);
        return;
      }

      try {
        const result = await getItemById(id);
        setItem(result);
      } catch {
        setItem(null);
      } finally {
        setLoading(false);
      }
    };

    void loadItem();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">Loading item...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">Item not found.</p>
          <Button variant="outline" onClick={() => navigate("/browse")} className="mt-4">Back to Browse</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-3xl py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="animate-fade-in rounded-xl border border-border bg-card overflow-hidden">
          <div className="aspect-video overflow-hidden bg-muted">
            <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-xl font-bold text-foreground">{item.title}</h1>
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide shrink-0 ${statusStyles[item.status]}`}>
                {item.status}
              </span>
            </div>

            <p className="text-muted-foreground mb-6 leading-relaxed">{item.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{item.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{item.postedBy}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{new Date(item.postedAt).toLocaleDateString()}</span>
              </div>
            </div>

            {item.status !== "claimed" && (
              <Button onClick={() => setShowClaim(true)} className="w-full sm:w-auto">
                Claim This Item
              </Button>
            )}
          </div>
        </div>
      </main>

      {showClaim && <ClaimModal itemTitle={item.title} onClose={() => setShowClaim(false)} />}
    </div>
  );
};

export default ItemDetailsPage;
