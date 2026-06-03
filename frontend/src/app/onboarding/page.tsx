"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { readSession, userScopedStorageKey } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

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
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as SavedTravelProfile;
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
    } catch {
      // Ignore broken local profiles and allow the user to save a fresh one.
    }
  }, [storageKey]);

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

  function validateProfile() {
    const missing: string[] = [];
    if (!tripName.trim()) missing.push("nombre del viaje");
    if (!nationality.trim()) missing.push("nacionalidad principal");
    if (!Number.isFinite(travelers) || travelers < 1) missing.push("numero de viajeros");
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
      const response = await fetch(tripId ? `${API_BASE_URL}/trips/${tripId}` : `${API_BASE_URL}/trips`, {
        method: tripId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const finalResponse =
        response.status === 404 && tripId
          ? await fetch(`${API_BASE_URL}/trips`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : response;

      if (!finalResponse.ok) throw new Error(`No se pudo guardar el perfil del viaje (${finalResponse.status})`);
      const trip = (await finalResponse.json()) as { id: string };
      setTripId(trip.id);
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          tripId: trip.id,
          ...payload,
        }),
      );
      router.push("/");
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
          <p className="text-xs uppercase tracking-[0.24em] text-amber-700">Perfil del viaje</p>
          <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
            Edita los datos base de tu viaje a Nueva York
          </h1>
          <p className="mt-4 text-slate-600">
            Cambia alojamiento, fechas, numero de viajeros y ritmo. Guardaremos este perfil para tu usuario.
          </p>
        </div>
        <div className="relative min-h-[260px] overflow-hidden rounded-2xl">
          <Image src={heroImage} alt="Nueva York premium" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority />
        </div>
      </section>

      <form noValidate onSubmit={handleSubmit} className="mt-8 grid gap-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="font-display text-3xl text-slate-900">Datos del perfil</h2>
        {missingFields.length > 0 ? (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-bold">Completa tu perfil para que la experiencia sea mejor y mas precisa.</p>
            <p className="mt-1">Falta: {missingFields.join(", ")}.</p>
          </div>
        ) : null}

        <input
          required
          name="name"
          value={tripName}
          onChange={(event) => setTripName(event.target.value)}
          placeholder="Nombre del viaje"
          className="rounded-xl border border-stone-300 bg-stone-50 px-4 py-3"
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
              className="rounded-xl border border-stone-300 bg-stone-50 px-4 py-3"
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code}>{country.flag} {country.name}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="travelers" className="text-sm font-medium text-slate-600">Numero de viajeros</label>
            <input
              required
              id="travelers"
              type="number"
              min={1}
              name="travelers"
              value={travelers}
              onChange={(event) => setTravelers(Number(event.target.value))}
              className="rounded-xl border border-stone-300 bg-stone-50 px-4 py-3"
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
            <input
              required
              id="startDate"
              type="date"
              name="startDate"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="rounded-xl border border-stone-300 bg-stone-50 px-4 py-3"
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
              className="rounded-xl border border-stone-300 bg-stone-50 px-4 py-3"
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
            className="rounded-xl border border-stone-300 bg-stone-50 px-4 py-3"
          >
            <option value="relajado">Relajado</option>
            <option value="normal">Normal</option>
            <option value="intenso">Intenso</option>
          </select>
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <button disabled={loading} className="rounded-full bg-slate-900 px-6 py-3 font-semibold text-stone-50 hover:bg-slate-800 disabled:opacity-60">
          {loading ? "Guardando perfil..." : tripId ? "Guardar cambios" : "Guardar perfil del viaje"}
        </button>
      </form>
    </div>
  );
}
