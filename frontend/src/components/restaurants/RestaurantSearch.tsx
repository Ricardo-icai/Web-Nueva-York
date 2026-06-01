export default function RestaurantSearch({ value }: { value: string }) {
  return (
    <input
      type="search"
      name="q"
      defaultValue={value}
      placeholder="Buscar restaurante o barrio"
      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900"
    />
  );
}

