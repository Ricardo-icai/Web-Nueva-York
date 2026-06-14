import { getNightlifeVenues } from "@/lib/nightlife/catalog";
import type { NightlifeVenue } from "@/types/nightlife";

export async function enrichNightlifeVenues(): Promise<NightlifeVenue[]> {
  return getNightlifeVenues();
}
