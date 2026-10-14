import type { Metadata } from "next";
import CookiePreferencesReset from "@/components/CookiePreferencesReset";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description: "Información sobre cookies y tecnologías similares utilizadas por Gestioná tu Liga.",
};

export default function CookiesPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 text-zinc-200">
      <h1 className="text-4xl font-black text-white">Política de Cookies</h1>
      <p className="mt-3 text-sm text-zinc-500">Última actualización: 4 de septiembre de 2026.</p>

      <div className="mt-10 space-y-8 leading-7">
        <section>
          <h2 className="text-xl font-black text-white">1. Qué usamos</h2>
          <p className="mt-3">
            Liga puede utilizar almacenamiento local, cookies y tecnologías equivalentes para mantener funciones necesarias del sitio y, sólo según las preferencias elegidas, para analítica y publicidad.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-white">2. Necesarias</h2>
          <p className="mt-3">
            Las tecnologías necesarias permiten funciones básicas como autenticación, seguridad, conservación de preferencias técnicas y registro de la elección de privacidad. No se desactivan desde el panel de consentimiento cuando son imprescindibles para prestar el servicio solicitado.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-white">3. Analítica</h2>
          <p className="mt-3">
            Si la autorizás, se carga Google Analytics para obtener métricas agregadas sobre el uso del sitio. Liga configura esta categoría sólo después de recibir consentimiento y utiliza anonimización de IP cuando está disponible.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-white">4. Publicidad</h2>
          <p className="mt-3">
            Si la autorizás, se puede cargar Google AdSense. Google puede utilizar cookies u otras tecnologías para mostrar, medir y proteger publicidad conforme a sus políticas. Esta categoría se mantiene desactivada hasta que exista una elección afirmativa.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-white">5. Cambiar o retirar el consentimiento</h2>
          <p className="mt-3">
            Podés retirar o cambiar tu elección en cualquier momento. Al restablecer las preferencias, el panel volverá a mostrarse y las categorías opcionales no se cargarán hasta que vuelvas a elegir.
          </p>
          <div className="mt-4">
            <CookiePreferencesReset />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-black text-white">6. Más información</h2>
          <p className="mt-3">
            El tratamiento general de datos personales se describe en la Política de Privacidad. Para consultas podés usar el soporte oficial de Gestioná tu Liga en Discord.
          </p>
        </section>
      </div>
    </main>
  );
}
