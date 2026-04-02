import { useEffect, useState } from "react";
import { MapPin, Clock, MoreVertical, CheckCircle, Trash2, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Item } from "@/lib/types";
import { deleteItem, getMyItems, updateItemStatus } from "@/lib/items-api";

const statusStyles = {
  lost: "bg-lost/10 text-lost border-lost/20",
  found: "bg-found/10 text-found border-found/20",
  claimed: "bg-claimed/10 text-claimed border-claimed/20",
};

const MyPostsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    const loadMyItems = async () => {
      try {
        const result = await getMyItems();
        setPosts(result);
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    void loadMyItems();
  }, []);

  const displayPosts = posts;

  const handleMarkClaimed = async (id: string) => {
    try {
      const updated = await updateItemStatus(id, "claimed");
      setPosts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      toast({ title: "Item marked as claimed" });
    } catch (error) {
      toast({
        title: "Could not update item",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
    setOpenMenu(null);
  };

  const handleMarkFound = async (id: string) => {
    try {
      const updated = await updateItemStatus(id, "found");
      setPosts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      toast({ title: "Item marked as found" });
    } catch (error) {
      toast({
        title: "Could not update item",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
    setOpenMenu(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Post deleted", variant: "destructive" });
    } catch (error) {
      toast({
        title: "Could not delete post",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
    setOpenMenu(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-3xl py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">My Posts</h1>

        {loading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading your posts...</p>
          </div>
        ) : displayPosts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">You haven't posted anything yet.</p>
            <div className="flex gap-3 justify-center">
              <Link to="/report/lost"><Button variant="outline">Report Lost</Button></Link>
              <Link to="/report/found"><Button>Report Found</Button></Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {displayPosts.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-xl border border-border bg-card p-4 animate-fade-in">
                <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted shrink-0">
                  <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{item.location}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(item.postedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusStyles[item.status]}`}>
                        {item.status}
                      </span>
                      <div className="relative">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpenMenu(openMenu === item.id ? null : item.id)}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                        {openMenu === item.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
                            <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-lg border border-border bg-card shadow-lg py-1 animate-fade-in">
                              <Link to={`/item/${item.id}`} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors" onClick={() => setOpenMenu(null)}>
                                <Eye className="h-4 w-4" /> View Details
                              </Link>
                              {item.status === "lost" && (
                                <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors" onClick={() => handleMarkFound(item.id)}>
                                  <CheckCircle className="h-4 w-4" /> Mark as Found
                                </button>
                              )}
                              {item.status !== "claimed" && (
                                <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors" onClick={() => handleMarkClaimed(item.id)}>
                                  <CheckCircle className="h-4 w-4" /> Mark as Claimed
                                </button>
                              )}
                              <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors" onClick={() => handleDelete(item.id)}>
                                <Trash2 className="h-4 w-4" /> Delete Post
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyPostsPage;
