import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, PackageSearch, PackageCheck, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { getItems } from "@/lib/items-api";
import { Item } from "@/lib/types";
import ItemCard from "@/components/ItemCard";
import Navbar from "@/components/Navbar";

const Dashboard = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const result = await getItems();
        setItems(result);
      } catch {
        setItems([]);
      }
    };

    void loadItems();
  }, []);

  const lostCount = useMemo(() => items.filter((i) => i.type === "lost").length, [items]);
  const foundCount = useMemo(() => items.filter((i) => i.type === "found").length, [items]);
  const recentItems = useMemo(() => items.slice(0, 4), [items]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        {/* Welcome */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.name?.split(" ")[0] || "Student"} 👋
          </h1>
          <p className="text-muted-foreground mt-1">Here's what's happening on campus today.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lost/10 text-lost">
              <PackageSearch className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{lostCount}</p>
              <p className="text-sm text-muted-foreground">Lost Items</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-found/10 text-found">
              <PackageCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{foundCount}</p>
              <p className="text-sm text-muted-foreground">Found Items</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{items.length}</p>
              <p className="text-sm text-muted-foreground">Total Posts</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <Link to="/report/lost">
            <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 hover:border-lost/30 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lost/10 text-lost group-hover:bg-lost group-hover:text-lost-foreground transition-colors">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Report Lost Item</p>
                <p className="text-sm text-muted-foreground">Lost something? Let the campus know.</p>
              </div>
            </div>
          </Link>
          <Link to="/report/found">
            <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 hover:border-found/30 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-found/10 text-found group-hover:bg-found group-hover:text-found-foreground transition-colors">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Report Found Item</p>
                <p className="text-sm text-muted-foreground">Found something? Help return it.</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Posts</h2>
            <Link to="/browse" className="text-sm font-medium text-primary hover:underline">View all</Link>
          </div>
          {recentItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No posts yet. Be the first to report an item.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
