import Image from "next/image";

export default function RestaurantsLoading() {
  return (
    <main className="min-h-screen bg-stone-50">
      <section className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 text-center">
        <div className="relative h-44 w-44">
          <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border border-stone-300 bg-white">
            <Image src="/images/elcano.svg" alt="Elcano" fill className="object-contain p-2" />
          </div>
          <div className="burger-orbit absolute inset-0 flex items-center justify-center">
            <span className="burger-icon">🍔</span>
          </div>
        </div>
        <h1 className="mt-8 text-3xl font-bold text-slate-900">Tengo Hambre</h1>
        <p className="mt-2 text-sm text-slate-700">Buscando restaurantes...</p>
      </section>
    </main>
  );
}

