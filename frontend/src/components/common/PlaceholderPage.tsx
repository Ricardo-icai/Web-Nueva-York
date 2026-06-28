import Link from "next/link";

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <main className="nyc-page-shell page-bg-home">
      <div className="nyc-content-shell mx-auto max-w-5xl px-6 py-12">
        <section className="nyc-hard-card-white mx-auto max-w-3xl p-8 sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-700">Próximamente</p>
          <h1 className="mt-3 font-american-diner text-4xl text-slate-900 sm:text-5xl">{title}</h1>
          <p className="nyc-muted-copy mt-4 text-base">{description}</p>
          <Link href="/onboarding" className="nyc-action mt-6 inline-block px-5 py-3 text-sm">
            Crear plan ahora
          </Link>
        </section>
      </div>
    </main>
  );
}
