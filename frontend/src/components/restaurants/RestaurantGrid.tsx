import type { Restaurant } from "@/types/restaurants";
import RestaurantCard from "@/components/restaurants/RestaurantCard";

export default function RestaurantGrid({ restaurants }: { restaurants: Restaurant[] }) {
  return (
    <section className="mx-auto mt-8 grid max-w-6xl gap-6 md:grid-cols-2 xl:grid-cols-3">
      {restaurants.map((restaurant) => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
      ))}
    </section>
  );
}

