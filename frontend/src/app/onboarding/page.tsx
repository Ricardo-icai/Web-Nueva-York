"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Pace = "relajado" | "normal" | "intenso";

type Country = {
  code: string;
  name: string;
  flag: string;
};

function toFlag(code: string) {
  return code
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
}

function buildCountries(): Country[] {
  try {
    const intlWithSupported = Intl as unknown as {
      supportedValuesOf?: (key: string) => string[];
    };
    const regions = typeof intlWithSupported.supportedValuesOf === "function" ? intlWithSupported.supportedValuesOf("region") : [];
    const display = new Intl.DisplayNames(["es"], { type: "region" });

    return regions
      .filter((code) => code.length === 2)
      .map((code) => ({
        code,
        name: display.of(code) ?? code,
        flag: toFlag(code),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
  } catch {
    return [
      { code: "ES", name: "Espana", flag: "????" },
      { code: "US", name: "Estados Unidos", flag: "????" },
      { code: "MX", name: "Mexico", flag: "????" },
      { code: "AR", name: "Argentina", flag: "????" },
      { code: "CO", name: "Colombia", flag: "????" },
      { code: "FR", name: "Francia", flag: "????" },
      { code: "IT", name: "Italia", flag: "????" },
      { code: "DE", name: "Alemania", flag: "????" },
    ];
  }
}

export default function OnboardingPage() {
  const router = useRouter();
  const countries = useMemo(() => buildCountries(), []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [heroImage, setHeroImage] = useState<string>("/images/hero-nyc.svg");

  useEffect(() => {
    let active = true;

    async function loadHeroImage() {
      try {
        const response = await fetch(`${API_BASE_URL}/media/hero-image`);
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as { imageUrl?: string };
        if (active && data.imageUrl) {
          setHeroImage(data.imageUrl);
        }
      } catch {
        // Keep local fallback image.
      }
    }

    loadHeroImage();
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      nationality: String(formData.get("nationality") ?? "ES"),
      language: "es",
      startDate: String(formData.get("startDate") ?? ""),
      endDate: String(formData.get("endDate") ?? ""),
      travelers: Number(formData.get("travelers") ?? 1),
      pace: String(formData.get("pace") ?? "normal") as Pace,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`No se pudo crear el viaje (${response.status})`);
      }

      const trip = (await response.json()) as { id: string };
      router.push(`/itinerary/${trip.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
        <div className="grid md:grid-cols-2">
          <div className="p-8 md:p-10">
            <p className="text-xs uppercase tracking-[0.24em] text-sky-300">NYC Family Planner</p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-white md:text-5xl">
              Construye tu viaje a Nueva York con estilo y precision
            </h1>
            <p className="mt-4 max-w-xl text-slate-300">
              Cuentanos lo esencial y generamos una base de itinerario limpia, realista y lista para evolucionar.
            </p>
          </div>
          <div className="relative min-h-[260px]">
            <Image
              src={heroImage}
              alt="Nueva York cinematica"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8"
      >
        <h2 className="text-2xl font-bold text-white">Perfil del viaje</h2>

        <input
          required
          name="name"
          placeholder="Nombre del viaje (ej: Familia Garcia NYC)"
          className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
        />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label htmlFor="nationality" className="text-sm font-medium text-slate-300">
              Nacionalidad principal
            </label>
            <select
              id="nationality"
              name="nationality"
              defaultValue="ES"
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="travelers" className="text-sm font-medium text-slate-300">
              Numero de viajeros
            </label>
            <input
              required
              id="travelers"
              type="number"
              min={1}
              name="travelers"
              placeholder="Ej: 4"
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label htmlFor="startDate" className="text-sm font-medium text-slate-300">
              Fecha de llegada
            </label>
            <input
              required
              id="startDate"
              type="date"
              name="startDate"
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="endDate" className="text-sm font-medium text-slate-300">
              Fecha de salida
            </label>
            <input
              required
              id="endDate"
              type="date"
              name="endDate"
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <label htmlFor="pace" className="text-sm font-medium text-slate-300">
            Ritmo del viaje
          </label>
          <select
            id="pace"
            name="pace"
            defaultValue="normal"
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
          >
            <option value="relajado">Relajado</option>
            <option value="normal">Normal</option>
            <option value="intenso">Intenso</option>
          </select>
        </div>

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}

        <button
          disabled={loading}
          className="rounded-full bg-sky-400 px-6 py-3 font-semibold text-slate-900 transition hover:bg-sky-300 disabled:opacity-60"
        >
          {loading ? "Creando viaje..." : "Generar itinerario"}
        </button>
      </form>
    </div>
  );
}
