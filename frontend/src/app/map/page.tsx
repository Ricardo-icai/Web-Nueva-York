import PublicTransitPlanner from "@/components/transport/PublicTransitPlanner";

export default function MapPage() {
  return (
    <main className="nyc-page-shell page-bg-transit">
      <div className="nyc-content-shell mx-auto max-w-7xl p-5 sm:p-8">
        <PublicTransitPlanner />
      </div>
    </main>
  );
}
