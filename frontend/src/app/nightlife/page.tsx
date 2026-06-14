import NightlifeExperience from "@/components/nightlife/NightlifeExperience";
import { enrichNightlifeVenues } from "@/lib/nightlife/enrich-nightlife-venues";

export default async function NightlifePage() {
  const venues = await enrichNightlifeVenues();

  return (
    <main className="nyc-page-shell page-bg-nightlife">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[34px] border border-[#111827] bg-white shadow-[8px_8px_0_#111827]">
        <NightlifeExperience venues={venues} />
      </div>
    </main>
  );
}
