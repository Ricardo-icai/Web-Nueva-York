import Link from "next/link";

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <section className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="font-display text-4xl text-slate-900">{title}</h1>
        <p className="mt-3 text-slate-600">{description}</p>
        <Link href="/onboarding" className="mt-6 inline-block rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-stone-50">
          Crear plan ahora
        </Link>
      </section>
    </div>
  );
}
