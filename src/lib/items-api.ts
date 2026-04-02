import { Item, ItemStatus } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const TOKEN_KEY = "findershub_auth_token";

const getAuthHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  const data = (await response.json()) as T & { message?: string };
  if (!response.ok) {
    throw new Error((data as { message?: string }).message || "Request failed");
  }
  return data;
};

export const getItems = async (params?: {
  type?: "lost" | "found";
  location?: string;
  search?: string;
}): Promise<Item[]> => {
  const query = new URLSearchParams();
  if (params?.type) query.set("type", params.type);
  if (params?.location && params.location !== "all") query.set("location", params.location);
  if (params?.search) query.set("search", params.search);

  const url = `${API_BASE_URL}/api/items${query.toString() ? `?${query.toString()}` : ""}`;
  const response = await fetch(url);
  const data = await parseResponse<{ items: Item[] }>(response);
  return data.items;
};

export const getItemById = async (id: string): Promise<Item> => {
  const response = await fetch(`${API_BASE_URL}/api/items/${id}`);
  const data = await parseResponse<{ item: Item }>(response);
  return data.item;
};

export const getMyItems = async (): Promise<Item[]> => {
  const response = await fetch(`${API_BASE_URL}/api/my-items`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  const data = await parseResponse<{ items: Item[] }>(response);
  return data.items;
};

export const createItem = async (payload: {
  title: string;
  description: string;
  location: string;
  type: "lost" | "found";
  imageUrl?: string;
  contactPhone?: string;
}): Promise<Item> => {
  const response = await fetch(`${API_BASE_URL}/api/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  const data = await parseResponse<{ item: Item }>(response);
  return data.item;
};

export const updateItemStatus = async (id: string, status: ItemStatus): Promise<Item> => {
  const response = await fetch(`${API_BASE_URL}/api/items/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ status }),
  });

  const data = await parseResponse<{ item: Item }>(response);
  return data.item;
};

export const deleteItem = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });

  await parseResponse<{ success: true }>(response);
};
