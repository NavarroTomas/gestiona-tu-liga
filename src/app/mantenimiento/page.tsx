import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "APA | Sitio temporalmente no disponible",
  description: "El sitio de APA se encuentra temporalmente fuera de servicio.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MantenimientoPage() {
  return (
    <main className="min-h-screen bg-[#07111f] text-white flex items-center justify-center px-6">
      <section className="w-full max-w-2xl text-center">
        <div className="mx-auto mb-8 h-px w-24 bg-white/25" />

        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.38em] text-white/55">
          Asociación Pro Soccer Online
        </p>

        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Sitio temporalmente no disponible
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-white/65 sm:text-lg">
          Estamos realizando cambios en la plataforma. El acceso público se encuentra
          deshabilitado temporalmente.
        </p>

        <div className="mx-auto mt-10 h-px w-24 bg-white/25" />
      </section>
    </main>
  );
}
