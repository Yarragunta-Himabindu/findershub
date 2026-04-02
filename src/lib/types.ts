export type ItemStatus = "lost" | "found" | "claimed";

export interface Item {
  id: string;
  title: string;
  description: string;
  location: string;
  status: ItemStatus;
  type: "lost" | "found";
  imageUrl: string;
  postedBy: string;
  postedAt: string;
  contactEmail: string;
  contactPhone?: string;
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  itemId?: string;
}

export interface User {
  name: string;
  email: string;
}

export const LOCATIONS = [
  "Library",
  "Canteen",
  "Hostel A",
  "Hostel B",
  "Block A",
  "Block B",
  "Block C",
  "Auditorium",
  "Sports Complex",
  "Parking Lot",
  "Main Gate",
  "Computer Lab",
] as const;
