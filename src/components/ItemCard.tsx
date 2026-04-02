import { Link } from "react-router-dom";
import { MapPin, Clock, Phone } from "lucide-react";
import { Item } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

const statusStyles = {
  lost: "bg-lost/10 text-lost border-lost/20",
  found: "bg-found/10 text-found border-found/20",
  claimed: "bg-claimed/10 text-claimed border-claimed/20",
};

const ItemCard = ({ item }: { item: Item }) => {
  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Link
      to={`/item/${item.id}`}
      className="group block rounded-xl border border-border bg-card overflow-hidden hover:shadow-md hover:border-primary/20 transition-all duration-200"
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide shrink-0 ${statusStyles[item.status]}`}>
            {item.status}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {item.location}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo(item.postedAt)}
          </span>
        </div>
        {item.contactPhone && (
          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {item.contactPhone}
          </div>
        )}
      </div>
    </Link>
  );
};

export default ItemCard;
