import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos de Uso",
  description: "Términos de uso de Gestioná tu Liga.",
};

export default function TerminosPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 text-zinc-200">
      <h1 className="text-4xl font-black text-white">Términos de Uso</h1>
      <p className="mt-3 text-sm text-zinc-500">Última actualización: 4 de septiembre de 2026.</p>

      <div className="mt-10 space-y-8 leading-7">
        <section>
          <h2 className="text-xl font-black text-white">1. Servicio</h2>
          <p className="mt-3">
            psoargentina.com es el sitio de la comunidad Gestioná tu Liga y se utiliza para organizar y publicar información relacionada con competiciones de Pro Soccer Online, incluyendo fixture, resultados, estadísticas, clubes, perfiles, mercado, predicciones y otras funciones comunitarias.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-white">2. Cuenta y datos correctos</h2>
          <p className="mt-3">
            Cada usuario es responsable de mantener segura su cuenta y de proporcionar información correcta, especialmente PlayerId, SteamID64 y Discord ID. No está permitido hacerse pasar por otra persona, compartir credenciales para eludir sanciones ni utilizar cuentas múltiples para obtener ventajas o evadir controles de la liga.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-white">3. Reglas de la comunidad</h2>
          <p className="mt-3">
            La participación también está sujeta al reglamento competitivo y a las normas publicadas por Liga en sus canales oficiales. Las decisiones deportivas, sanciones, validaciones de resultados y criterios de elegibilidad se rigen por esas reglas específicas.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-white">4. Uso prohibido</h2>
          <p className="mt-3">
            No se permite intentar vulnerar el sitio, modificar información sin autorización, automatizar solicitudes abusivas, interferir con otros usuarios, manipular resultados o estadísticas, explotar errores, extraer datos privados, evadir controles de acceso ni usar el servicio para actividades ilícitas.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-white">5. Contenido y estadísticas</h2>
          <p className="mt-3">
            Los resultados y estadísticas se construyen a partir de registros de los partidos y de la administración de la liga. Liga puede corregir datos cuando detecte errores, duplicados, partidas invalidadas o información inconsistente. Los perfiles y rankings no constituyen certificaciones oficiales externas al ámbito de Liga.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-white">6. Disponibilidad</h2>
          <p className="mt-3">
            Liga procura mantener el sitio disponible y la información correcta, pero puede realizar mantenimiento, cambiar funciones o interrumpir temporalmente servicios por motivos técnicos, de seguridad o de organización. No se garantiza disponibilidad ininterrumpida.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-white">7. Servicios y marcas de terceros</h2>
          <p className="mt-3">
            Pro Soccer Online, Steam, Discord y demás marcas o servicios de terceros pertenecen a sus respectivos titulares. Gestioná tu Liga es una comunidad independiente y estos términos no implican patrocinio, afiliación o aprobación por parte de dichos terceros salvo que se indique expresamente.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-white">8. Suspensión</h2>
          <p className="mt-3">
            Liga puede restringir o suspender cuentas cuando exista incumplimiento de reglas, fraude, suplantación, abuso del servicio, riesgos de seguridad o sanciones de la competición, respetando los mecanismos internos de revisión que correspondan.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-white">9. Contacto</h2>
          <p className="mt-3">
            Las consultas sobre estos términos pueden realizarse a través del soporte oficial de Gestioná tu Liga en Discord: https://discord.gg/WCyqeJMmCU.
          </p>
        </section>
      </div>
    </main>
  );
}
