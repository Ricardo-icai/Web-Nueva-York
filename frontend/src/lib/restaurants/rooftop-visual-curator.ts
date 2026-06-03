import type { NycRooftopHallOfFamePlace } from "@/types/restaurants";

const ROOFTOP_IMAGES = [
  "https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1541336032412-2048a678540d?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1532960401447-7dd05bef20b0?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1543716091-a840c05249ec?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1534270804882-6b5048b1c1fc?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1400&q=85"
];

function hash(value: string) {
  return Array.from(value).reduce((total, char) => total + char.charCodeAt(0), 0);
}

export function curateRooftopImage(place: NycRooftopHallOfFamePlace) {
  if (place.imageUrl && !place.imageUrl.includes("1518005020951")) return place.imageUrl;
  return ROOFTOP_IMAGES[hash(place.id) % ROOFTOP_IMAGES.length];
}
