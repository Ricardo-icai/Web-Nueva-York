"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Pace = "relajado" | "normal" | "intenso";

type Country = { code: string; name: string; flag: string };
type LocationSuggestion = { label: string; lat: number; lng: number; provider: string };

function toFlag(code: string) {
  return code
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
}

function buildCountries(): Country[] {
  try {
    const intlWithSupported = Intl as unknown as { supportedValuesOf?: (key: string) => string[] };
    const regions = typeof intlWithSupported.supportedValuesOf === "function" ? intlWithSupported.supportedValuesOf("region") : [];
    const display = new Intl.DisplayNames(["es"], { type: "region" });

    return regions
      .filter((code) => code.length === 2)
      .map((code) => ({ code, name: display.of(code) ?? code, flag: toFlag(code) }))
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
  } catch {
    return ["ES", "US", "MX", "AR", "CO", "FR", "IT", "DE"].map((code) => ({
      code,
      name: code,
      flag: toFlag(code),
    }));
  }
}

export default function OnboardingPage() {
  const router = useRouter();
  const countries = useMemo(() => buildCountries(), []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [heroImage, setHeroImage] = useState<string>("/images/hero-nyc.svg");
  const [accommodation, setAccommodation] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);

  useEffect(() => {
    let active = true;
    async function loadHeroImage() {
      try {
        const response = await fetch(`${API_BASE_URL}/media/hero-image`);
        if (!response.ok) return;
        const data = (await response.json()) as { imageUrl?: string };
        if (active && data.imageUrl) setHeroImage(data.imageUrl);
      } catch {}
    }
    loadHeroImage();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const query = accommodation.trim();
    if (query.length < 3) {
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/location/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) return;
        const data = (await response.json()) as LocationSuggestion[];
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [accommodation]);

  function pickSuggestion(item: LocationSuggestion) {
    setAccommodation(item.label);
    setSelectedLocation(item);
    setSuggestions([]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const accommodationPayload = selectedLocation ?? {
      label: accommodation,
      lat: 40.758,
      lng: -73.9855,
      provider: "fallback",
    };

    const payload = {
      name: String(formData.get("name") ?? ""),
      nationality: String(formData.get("nationality") ?? "ES"),
      language: "es",
      startDate: String(formData.get("startDate") ?? ""),
      endDate: String(formData.get("endDate") ?? ""),
      travelers: Number(formData.get("travelers") ?? 1),
      pace: String(formData.get("pace") ?? "normal") as Pace,
      accommodation: {
        address: accommodationPayload.label,
        lat: accommodationPayload.lat,
        lng: accommodationPayload.lng,
      },
    };

    try {
      const response = await fetch(`${API_BASE_URL}/trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`No se pudo crear el viaje (${response.status})`);
      const trip = (await response.json()) as { id: string };
      router.push(`/dashboard/${trip.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <section className="grid gap-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm md:grid-cols-2 md:p-10">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-amber-700">Travel Profile</p>
          <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
            Cuentanos donde te quedas y creamos tu viaje ideal por Nueva York
          </h1>
          <p className="mt-4 text-slate-600">
            Inspirado en plataformas premium, con recomendaciones visuales, mapa y clima para tus fechas reales.
          </p>
        </div>
        <div className="relative min-h-[260px] overflow-hidden rounded-2xl">
          <Image src={heroImage} alt="Nueva York premium" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority />
        </div>
      </section>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="font-display text-3xl text-slate-900">Datos del viaje</h2>

        <input required name="name" placeholder="Nombre del viaje" className="rounded-xl border border-stone-300 bg-stone-50 px-4 py-3" />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label htmlFor="nationality" className="text-sm font-medium text-slate-600">Nacionalidad principal</label>
            <select id="nationality" name="nationality" defaultValue="ES" className="rounded-xl border border-stone-300 bg-stone-50 px-4 py-3">
              {countries.map((country) => (
                <option key={country.code} value={country.code}>{country.flag} {country.name}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="travelers" className="text-sm font-medium text-slate-600">Numero de viajeros</label>
            <input required id="travelers" type="number" min={1} name="travelers" className="rounded-xl border border-stone-300 bg-stone-50 px-4 py-3" />
          </div>
        </div>

        <div className="grid gap-2">
          <label htmlFor="accommodation" className="text-sm font-medium text-slate-600">Donde te vas a quedar a dormir</label>
          <input
            id="accommodation"
            required
            value={accommodation}
            onChange={(event) => {
              setAccommodation(event.target.value);
              setSelectedLocation(null);
              setSuggestions([]);
            }}
            placeholder="Hotel, direccion o zona"
            className="rounded-xl border border-stone-300 bg-stone-50 px-4 py-3"
          />
          {suggestions.length > 0 ? (
            <div className="rounded-xl border border-stone-300 bg-white p-2 shadow-sm">
              {suggestions.map((item) => (
                <button
                  type="button"
                  key={`${item.label}-${item.lat}-${item.lng}`}
                  onClick={() => pickSuggestion(item)}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-stone-100"
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label htmlFor="startDate" className="text-sm font-medium text-slate-600">Fecha de llegada</label>
            <input required id="startDate" type="date" name="startDate" className="rounded-xl border border-stone-300 bg-stone-50 px-4 py-3" />
          </div>
          <div className="grid gap-2">
            <label htmlFor="endDate" className="text-sm font-medium text-slate-600">Fecha de salida</label>
            <input required id="endDate" type="date" name="endDate" className="rounded-xl border border-stone-300 bg-stone-50 px-4 py-3" />
          </div>
        </div>

        <div className="grid gap-2">
          <label htmlFor="pace" className="text-sm font-medium text-slate-600">Ritmo del viaje</label>
          <select id="pace" name="pace" defaultValue="normal" className="rounded-xl border border-stone-300 bg-stone-50 px-4 py-3">
            <option value="relajado">Relajado</option>
            <option value="normal">Normal</option>
            <option value="intenso">Intenso</option>
          </select>
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <button disabled={loading} className="rounded-full bg-slate-900 px-6 py-3 font-semibold text-stone-50 hover:bg-slate-800 disabled:opacity-60">
          {loading ? "Creando viaje..." : "Generar plan"}
        </button>
      </form>
    </div>
  );
}
