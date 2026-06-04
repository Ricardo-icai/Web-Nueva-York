export default function Loading() {
  return (
    <main className="nyc-page-shell">
      <section className="nyc-content-shell mx-auto flex min-h-[55vh] max-w-7xl items-center justify-center px-5 py-10">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-stone-300 border-t-red-700" />
          <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-red-700">Cargando Nueva York</p>
        </div>
      </section>
    </main>
  );
}
