import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LOCATIONS } from "@/lib/types";
import { dummyItems } from "@/lib/dummy-data";
import ItemCard from "@/components/ItemCard";
import Navbar from "@/components/Navbar";

const BrowseItemsPage = () => {
  const [tab, setTab] = useState<"lost" | "found">("lost");
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");

  const filtered = useMemo(() => {
    return dummyItems.filter((item) => {
      if (item.type !== tab) return false;
      if (search && !item.title.toLowerCase().includes(search.toLowerCase()) && !item.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (locationFilter !== "all" && item.location !== locationFilter) return false;
      return true;
    });
  }, [tab, search, locationFilter]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Browse Items</h1>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-lg bg-muted w-fit mb-6">
          <button
            onClick={() => setTab("lost")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === "lost" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Lost Items
          </button>
          <button
            onClick={() => setTab("found")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === "found" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Found Items
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {LOCATIONS.map((loc) => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No items found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BrowseItemsPage;
