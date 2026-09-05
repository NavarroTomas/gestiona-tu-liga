import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Política de privacidad y tratamiento de datos de APA PSO Argentina.",
};

export default function PrivacidadPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 text-zinc-200">
      <h1 className="text-4xl font-black text-white">Política de Privacidad</h1>
      <p className="mt-3 text-sm text-zinc-500">Última actualización: 4 de septiembre de 2026.</p>

      <div className="mt-10 space-y-8 leading-7">
        <section>
          <h2 className="text-xl font-black text-white">1. Responsable y alcance</h2>
          <p className="mt-3">
            APA PSO Argentina es una comunidad dedicada a la organización de competiciones de Pro Soccer Online. Esta política explica cómo se tratan los datos vinculados con las cuentas, la participación competitiva y el uso de psoargentina.com.
          </p>
          <p className="mt-3">
            Para consultas o ejercicio de derechos, podés comunicarte mediante el canal oficial de soporte de APA PSO Argentina en Discord: https://discord.gg/WCyqeJMmCU.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-white">2. Datos tratados</h2>
          <p className="mt-3">
            Según las funciones que utilices, APA puede tratar nombre visible, nombre de usuario, email, PlayerId de Pro Soccer Online, SteamID64, Discord ID, avatar, biografía, estado de verificación, historial de clubes y transferencias, estadísticas de partidos, predicciones, votos, premios y demás actividad competitiva vinculada con tu participación.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-white">3. Finalidades</h2>
          <p className="mt-3">
            Los datos se utilizan para crear y proteger cuentas, verificar identidades de jugadores, prevenir suplantaciones y abuso, organizar competiciones, vincular estadísticas e historial, publicar información deportiva, administrar permisos, resolver incidencias, mantener registros de auditoría y mejorar el funcionamiento del sitio.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-white">4. Servicios de terceros</h2>
          <p className="mt-3">
            APA utiliza proveedores técnicos necesarios para operar el servicio, entre ellos Supabase para autenticación y base de datos, Vercel para alojamiento, Steam para consultas relacionadas con cuentas/juegos y, sólo cuando exista consentimiento cuando corresponda, Google Analytics y Google AdSense. Estos proveedores pueden tratar información técnica conforme a sus propias políticas y ubicaciones de infraestructura.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-white">5. Publicación de información deportiva</h2>
          <p className="mt-3">
            Parte de la información competitiva está destinada a ser pública, por ejemplo nombre o alias de jugador, club, estadísticas, resultados, rankings, premios e historial. No se publica deliberadamente el email de la cuenta, datos internos de verificación ni información administrativa reservada.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-white">6. Conservación y seguridad</h2>
          <p className="mt-3">
            APA conserva la información mientras resulte necesaria para administrar la cuenta, preservar el historial deportivo, cumplir funciones de seguridad o resolver disputas. Se aplican controles de acceso, Row Level Security, permisos por rol, registros de auditoría y otras medidas técnicas. Ningún sistema puede garantizar seguridad absoluta.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-white">7. Tus derechos</h2>
          <p className="mt-3">
            Podés solicitar información, acceso, actualización, rectificación o supresión de tus datos en los términos aplicables de la Ley argentina 25.326 y normativa relacionada. Algunas estadísticas o resultados históricos pueden conservarse de forma disociada o como registro deportivo cuando resulte necesario para preservar la integridad de las competiciones.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-white">8. Menores de edad</h2>
          <p className="mt-3">
            Si una persona menor de edad participa en APA, debe hacerlo conforme a las reglas de la comunidad y con la autorización que corresponda según su situación. APA procura no solicitar datos personales que no sean necesarios para la participación.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-white">9. Cambios</h2>
          <p className="mt-3">
            Esta política puede actualizarse cuando cambien las funciones, proveedores o requisitos legales. La fecha de la versión vigente se indica al inicio de esta página.
          </p>
        </section>
      </div>
    </main>
  );
}
