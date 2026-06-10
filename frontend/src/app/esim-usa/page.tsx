import Image from "next/image";

const providers = [
  {
    name: "Airalo",
    bestFor: "Planes flexibles",
    description: "Buena opcion para elegir una cantidad concreta de datos antes de viajar.",
    website: "https://www.airalo.com/united-states-esim",
  },
  {
    name: "Holafly",
    bestFor: "Uso intensivo",
    description: "Alternativa sencilla para viajeros que priorizan muchos datos durante el viaje.",
    website: "https://esim.holafly.com/es/esim-usa/",
  },
  {
    name: "Nomad",
    bestFor: "Comparar paquetes",
    description: "Planes de datos para Estados Unidos con distintas duraciones y capacidades.",
    website: "https://www.getnomad.app/united-states-eSIM",
  },
  {
    name: "T-Mobile Prepaid",
    bestFor: "Linea estadounidense",
    description: "Opcion de operador local si necesitas llamadas, SMS o una linea prepago de EE. UU.",
    website: "https://prepaid.t-mobile.com/",
  },
];

const steps = [
  ["1. Comprueba tu movil", "Debe aceptar eSIM y estar liberado para utilizar otra operadora."],
  ["2. Compra antes de volar", "Contrata el plan con Wi-Fi y guarda el QR o la instalacion en la app."],
  ["3. Instala sin activar datos", "Anade la eSIM antes del viaje, pero activa sus datos al llegar a Estados Unidos."],
  ["4. Evita cargos de roaming", "Selecciona la eSIM como linea de datos y desactiva el roaming de tu SIM habitual."],
];

const deviceGuides = [
  {
    device: "iPhone",
    compatibility: "Ajustes > General > Informacion. Busca el apartado EID para confirmar que admite eSIM.",
    steps: [
      "Conectate a una red Wi-Fi antes de comenzar.",
      "Abre Ajustes > Datos moviles > Anadir eSIM.",
      "Pulsa Usar codigo QR y escanea el codigo enviado por el proveedor.",
      "Ponle el nombre EE. UU. o Viaje a la nueva linea.",
      "Mantén tu numero habitual como linea de voz y SMS.",
      "Al aterrizar, entra en Datos moviles y selecciona la eSIM como linea de datos.",
      "Desactiva Permitir cambio de datos moviles para evitar usar tu SIM habitual.",
      "Activa Itinerancia de datos solo dentro de la linea eSIM si el proveedor lo indica.",
    ],
  },
  {
    device: "Android",
    compatibility: "Ajustes > Acerca del telefono o Conexiones. Busca EID, SIM Manager o Administrador de SIM.",
    steps: [
      "Conectate a una red Wi-Fi antes de comenzar.",
      "Abre Ajustes > Conexiones > Administrador de SIM. En Google Pixel: Red e Internet > SIM.",
      "Pulsa Anadir eSIM, Descargar SIM o Anadir plan movil.",
      "Escanea el codigo QR enviado por el proveedor.",
      "Ponle el nombre EE. UU. o Viaje a la nueva linea.",
      "Al aterrizar, selecciona la eSIM para Datos moviles.",
      "Mantén tu SIM habitual para llamadas y SMS si necesitas recibir codigos.",
      "Desactiva el cambio automatico de datos y el roaming de tu SIM habitual.",
    ],
  },
];

export default function EsimUsaPage() {
  return (
    <main className="nyc-page-shell page-bg-esim">
      <div className="nyc-content-shell mx-auto max-w-7xl overflow-hidden">
        <section className="grid border-b-2 border-slate-950 bg-[#0A2342] text-white lg:grid-cols-[1fr_0.85fr]">
          <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#D4AF37]">Conectividad en Estados Unidos</p>
            <h1 className="mt-3 font-american-diner text-4xl leading-tight sm:text-6xl">eSIM para EE. UU.</h1>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-white/80">
              Llega a Nueva York con datos desde el primer minuto y evita depender del roaming de tu operadora.
            </p>
          </div>
          <div className="relative min-h-[280px]">
            <Image
              src="https://images.unsplash.com/photo-1523206489230-c012c64b2b48?auto=format&fit=crop&w=1600&q=84"
              alt="Telefono movil preparado para utilizar una eSIM en Estados Unidos"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A2342]/75 to-transparent lg:bg-gradient-to-r" />
          </div>
        </section>

        <section className="px-5 py-10 sm:px-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {providers.map((provider) => (
              <article key={provider.name} className="nyc-hard-card-white flex flex-col rounded-md p-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-red-700">{provider.bestFor}</p>
                <h2 className="mt-2 font-american-diner text-2xl text-slate-950">{provider.name}</h2>
                <p className="mt-3 flex-1 text-sm font-semibold leading-6 text-slate-700">{provider.description}</p>
                <a
                  href={provider.website}
                  target="_blank"
                  rel="noreferrer"
                  className="nyc-action mt-5 rounded-md px-4 py-3 text-center text-xs"
                >
                  Ver planes oficiales
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t-2 border-slate-950 bg-[#fff3d1] px-5 py-10 sm:px-8">
          <h2 className="font-american-diner text-3xl text-slate-950">Instalala sin perder tu numero habitual</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {steps.map(([title, description]) => (
              <article key={title} className="nyc-hard-card-white rounded-md p-5">
                <h3 className="font-black text-slate-950">{title}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{description}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 border-l-4 border-red-700 bg-white p-4 text-sm font-bold leading-6 text-slate-800">
            Los precios, datos incluidos y condiciones pueden cambiar. Comprueba siempre el plan y la compatibilidad de tu telefono en la web oficial antes de comprar.
          </p>
        </section>

        <section className="border-t-2 border-slate-950 bg-white px-5 py-10 sm:px-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-700">Elige tu dispositivo</p>
          <h2 className="mt-2 font-american-diner text-3xl text-slate-950">Pasos para iPhone y Android</h2>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {deviceGuides.map((guide) => (
              <article key={guide.device} className="nyc-hard-card rounded-md p-5 sm:p-6">
                <h3 className="font-american-diner text-3xl text-slate-950">{guide.device}</h3>
                <div className="mt-4 rounded-md border-2 border-slate-950 bg-[#D4AF37] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-950">Comprobar compatibilidad</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-slate-900">{guide.compatibility}</p>
                </div>
                <ol className="mt-5 space-y-3">
                  {guide.steps.map((step, index) => (
                    <li key={step} className="flex gap-3 rounded-md border border-slate-300 bg-white p-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0A2342] text-xs font-black text-white">
                        {index + 1}
                      </span>
                      <span className="text-sm font-semibold leading-6 text-slate-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
          <p className="mt-6 border-l-4 border-[#D4AF37] bg-[#0A2342] p-4 text-sm font-bold leading-6 text-white">
            Los nombres de los menus pueden variar segun la version del sistema y el fabricante. No elimines la eSIM hasta terminar el viaje: algunos proveedores no permiten instalarla una segunda vez.
          </p>
        </section>
      </div>
    </main>
  );
}
