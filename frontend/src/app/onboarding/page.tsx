"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { readSession, userScopedStorageKey } from "@/lib/auth";
import { loadTravelProfile, saveTravelProfile } from "@/lib/user-data";

type Pace = "relajado" | "normal" | "intenso";

type Country = { code: string; name: string; flag: string };
type LocationSuggestion = { label: string; lat: number; lng: number; provider: string };
type SavedTravelProfile = {
  tripId?: string;
  name: string;
  nationality: string;
  startDate: string;
  endDate: string;
  travelers: number;
  pace: Pace;
  accommodation: {
    address: string;
    lat: number;
    lng: number;
  };
};

const TRAVEL_PROFILE_KEY = "nyc_travel_profile_v1";
const POPULAR_NYC_LOCATIONS: LocationSuggestion[] = [
  { label: "Times Square, Manhattan, New York", lat: 40.758, lng: -73.9855, provider: "popular" },
  { label: "Central Park, Manhattan, New York", lat: 40.7812, lng: -73.9665, provider: "popular" },
  { label: "Grand Central Terminal, Manhattan, New York", lat: 40.7527, lng: -73.9772, provider: "popular" },
  { label: "Penn Station, Manhattan, New York", lat: 40.7506, lng: -73.9935, provider: "popular" },
  { label: "SoHo, Manhattan, New York", lat: 40.7233, lng: -74.003, provider: "popular" },
  { label: "Chelsea, Manhattan, New York", lat: 40.7465, lng: -74.0014, provider: "popular" },
  { label: "Upper West Side, Manhattan, New York", lat: 40.787, lng: -73.9754, provider: "popular" },
  { label: "Upper East Side, Manhattan, New York", lat: 40.7736, lng: -73.9566, provider: "popular" },
  { label: "Williamsburg, Brooklyn, New York", lat: 40.7081, lng: -73.9571, provider: "popular" },
  { label: "DUMBO, Brooklyn, New York", lat: 40.7033, lng: -73.9881, provider: "popular" },
  { label: "Long Island City, Queens, New York", lat: 40.7447, lng: -73.9485, provider: "popular" },
];

function popularLocationMatches(query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase("es");
  if (normalizedQuery.length < 2) return [];
  return POPULAR_NYC_LOCATIONS.filter((item) =>
    item.label.toLocaleLowerCase("es").includes(normalizedQuery),
  ).slice(0, 5);
}

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
  const storageKey = useMemo(() => {
    if (typeof window === "undefined") return userScopedStorageKey(TRAVEL_PROFILE_KEY);
    return userScopedStorageKey(TRAVEL_PROFILE_KEY, readSession()?.email);
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [heroImage, setHeroImage] = useState<string>("/images/hero-nyc.svg");
  const [tripId, setTripId] = useState<string | null>(null);
  const [tripName, setTripName] = useState("");
  const [nationality, setNationality] = useState("ES");
  const [travelers, setTravelers] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pace, setPace] = useState<Pace>("normal");
  const [accommodation, setAccommodation] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);

  useEffect(() => {
    async function loadSavedProfile() {
      const saved = (await loadTravelProfile(TRAVEL_PROFILE_KEY)) as SavedTravelProfile | null;
      if (!saved) return;
      setTripId(saved.tripId ?? null);
      setTripName(saved.name ?? "");
      setNationality(saved.nationality ?? "ES");
      setTravelers(saved.travelers ?? 1);
      setStartDate(saved.startDate ?? "");
      setEndDate(saved.endDate ?? "");
      setPace(saved.pace ?? "normal");
      setAccommodation(saved.accommodation?.address ?? "");
      if (saved.accommodation?.address) {
        setSelectedLocation({
          label: saved.accommodation.address,
          lat: saved.accommodation.lat,
          lng: saved.accommodation.lng,
          provider: "saved",
        });
      }
    }
    void loadSavedProfile();
  }, [storageKey]);

  useEffect(() => {
    let active = true;
    async function loadHeroImage() {
      try {
        const response = await fetch("/api/media/hero-image");
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
    if (query.length < 2) {
      return;
    }

    const popularMatches = popularLocationMatches(query);

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(`/api/location/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data = (await response.json()) as LocationSuggestion[];
        const unique = new Map<string, LocationSuggestion>();
        [...popularMatches, ...data].forEach((item) => unique.set(item.label.toLocaleLowerCase("es"), item));
        setSuggestions([...unique.values()].slice(0, 7));
      } catch {
        if (!controller.signal.aborted) setSuggestions(popularMatches);
      }
    }, 220);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [accommodation]);

  function pickSuggestion(item: LocationSuggestion) {
    setAccommodation(item.label);
    setSelectedLocation(item);
    setSuggestions([]);
  }

  function validateProfile() {
    const missing: string[] = [];
    if (!tripName.trim()) missing.push("nombre del viaje");
    if (!nationality.trim()) missing.push("nacionalidad principal");
    if (!Number.isFinite(travelers) || travelers < 1) missing.push("número de viajeros");
    if (!accommodation.trim()) missing.push("alojamiento");
    if (!startDate) missing.push("fecha de llegada");
    if (!endDate) missing.push("fecha de salida");
    if (!pace) missing.push("ritmo del viaje");

    if (startDate && endDate && endDate < startDate) {
      missing.push("fecha de salida posterior a la llegada");
    }

    return missing;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const missing = validateProfile();
    setMissingFields(missing);

    if (missing.length > 0) {
      setError("Completa todos los datos del perfil para que la experiencia se ajuste mejor a tu viaje.");
      return;
    }

    setLoading(true);

    const accommodationPayload = selectedLocation ?? {
      label: accommodation,
      lat: 40.758,
      lng: -73.9855,
      provider: "fallback",
    };

    const payload = {
      name: tripName.trim(),
      nationality,
      language: "es",
      startDate,
      endDate,
      travelers,
      pace,
      accommodation: {
        address: accommodationPayload.label.trim(),
        lat: accommodationPayload.lat,
        lng: accommodationPayload.lng,
      },
    };

    try {
      const response = await fetch(tripId ? `/api/trips/${tripId}` : "/api/trips", {
        method: tripId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const finalResponse =
        response.status === 404 && tripId
          ? await fetch("/api/trips", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : response;

      if (!finalResponse.ok) {
        const details = await finalResponse.text();
        throw new Error(details || `No se pudo guardar el perfil del viaje (${finalResponse.status})`);
      }
      const trip = (await finalResponse.json()) as { id: string };
      setTripId(trip.id);
      await saveTravelProfile(TRAVEL_PROFILE_KEY, { tripId: trip.id, ...payload });
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="nyc-page-shell page-bg-profile">
    <div className="nyc-content-shell mx-auto max-w-6xl px-6 py-10">
      <section className="grid gap-8 overflow-hidden rounded-md border-2 border-slate-950 bg-[#fff3d1] p-6 shadow-[6px_6px_0_#111827] md:grid-cols-2 md:p-10">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-red-700">Perfil del viaje</p>
          <h1 className="mt-3 font-american-diner text-4xl leading-tight text-slate-950 md:text-5xl">
            Edita los datos base de tu viaje a Nueva York
          </h1>
          <p className="mt-4 text-sm font-semibold leading-6 text-slate-700">
            Cambia alojamiento, fechas, número de viajeros y ritmo. Guardaremos este perfil para tu usuario.
          </p>
        </div>
        <div className="relative min-h-[260px] overflow-hidden rounded-md border-2 border-slate-950">
          <Image src={heroImage} alt="Nueva York premium" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority />
        </div>
      </section>

      <form noValidate onSubmit={handleSubmit} className="mt-8 grid gap-4 rounded-md border-2 border-slate-950 bg-white p-6 shadow-[6px_6px_0_#111827] md:p-8">
        <h2 className="font-american-diner text-3xl text-slate-900">Datos del perfil</h2>
        {missingFields.length > 0 ? (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-bold">Completa tu perfil para que la experiencia sea mejor y más precisa.</p>
            <p className="mt-1">Falta: {missingFields.join(", ")}.</p>
          </div>
        ) : null}

        <input
          required
          name="name"
          value={tripName}
          onChange={(event) => setTripName(event.target.value)}
          placeholder="Nombre del viaje"
          className="rounded-md border-2 border-slate-950 bg-[#fffdf4] px-4 py-3 font-bold"
        />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label htmlFor="nationality" className="text-sm font-medium text-slate-600">Nacionalidad principal</label>
            <select
              id="nationality"
              name="nationality"
              required
              value={nationality}
              onChange={(event) => setNationality(event.target.value)}
              className="rounded-md border-2 border-slate-950 bg-[#fffdf4] px-4 py-3 font-bold"
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code}>{country.flag} {country.name}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="travelers" className="text-sm font-medium text-slate-600">Número de viajeros</label>
            <input
              required
              id="travelers"
              type="number"
              min={1}
              name="travelers"
              value={travelers}
              onChange={(event) => setTravelers(Number(event.target.value))}
              className="rounded-md border-2 border-slate-950 bg-[#fffdf4] px-4 py-3 font-bold"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <label htmlFor="accommodation" className="text-sm font-medium text-slate-600">Donde te vas a quedar a dormir</label>
          <input
            id="accommodation"
            required
            value={accommodation}
            onChange={(event) => {
              const value = event.target.value;
              setAccommodation(value);
              setSelectedLocation(null);
              setSuggestions(popularLocationMatches(value));
            }}
            placeholder="Hotel, dirección o zona"
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={suggestions.length > 0}
            aria-controls="accommodation-suggestions"
            className="rounded-md border-2 border-slate-950 bg-[#fffdf4] px-4 py-3 font-bold"
          />
          {suggestions.length > 0 ? (
            <div id="accommodation-suggestions" role="listbox" className="rounded-md border-2 border-slate-950 bg-white p-2 shadow-[4px_4px_0_#111827]">
              {suggestions.map((item) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
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
            <input
              required
              id="startDate"
              type="date"
              name="startDate"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="rounded-md border-2 border-slate-950 bg-[#fffdf4] px-4 py-3 font-bold"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="endDate" className="text-sm font-medium text-slate-600">Fecha de salida</label>
            <input
              required
              id="endDate"
              type="date"
              name="endDate"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="rounded-md border-2 border-slate-950 bg-[#fffdf4] px-4 py-3 font-bold"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <label htmlFor="pace" className="text-sm font-medium text-slate-600">Ritmo del viaje</label>
          <select
            id="pace"
            name="pace"
            required
            value={pace}
            onChange={(event) => setPace(event.target.value as Pace)}
            className="rounded-md border-2 border-slate-950 bg-[#fffdf4] px-4 py-3 font-bold"
          >
            <option value="relajado">Relajado</option>
            <option value="normal">Normal</option>
            <option value="intenso">Intenso</option>
          </select>
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <button disabled={loading} className="nyc-action rounded-md px-6 py-3 text-sm disabled:opacity-60">
          {loading ? "Guardando perfil..." : tripId ? "Guardar cambios" : "Guardar perfil del viaje"}
        </button>
      </form>
    </div>
    </main>
  );
}
