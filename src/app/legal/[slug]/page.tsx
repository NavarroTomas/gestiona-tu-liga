import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CookiePreferencesReset from "@/components/CookiePreferencesReset";

type LegalSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

type LegalPageConfig = {
  title: string;
  intro: string;
  sections: LegalSection[];
};

const LAST_UPDATED = "18 de septiembre de 2026";

const legalPages: Record<string, LegalPageConfig> = {
  privacidad: {
    title: "Política de privacidad",
    intro:
      "Esta política explica qué información puede tratar APA PSO Argentina, para qué se utiliza, qué parte puede hacerse pública dentro de la competición y qué opciones tienen los usuarios sobre sus datos.",
    sections: [
      {
        title: "1. Alcance y responsable",
        paragraphs: [
          "APA PSO Argentina administra psoargentina.com como plataforma comunitaria y competitiva vinculada a Pro Soccer Online. Esta política se aplica a las funciones públicas y privadas del sitio, a las cuentas registradas y a los datos utilizados para organizar la competición.",
          "La plataforma puede incluir áreas públicas, perfiles, estadísticas, rankings, clubes, plantillas, noticias, entretenimiento, predicciones, premios y zonas administrativas reservadas al staff.",
        ],
      },
      {
        title: "2. Información que puede tratarse",
        paragraphs: [
          "La información tratada depende de las funciones que cada persona utilice. No todos los usuarios aportan ni generan los mismos datos.",
        ],
        bullets: [
          "Datos de cuenta y perfil: email, nombre visible, username, avatar, biografía y estado de la cuenta.",
          "Identificadores vinculados a la competición: PlayerId, profile ID y otros identificadores necesarios para relacionar correctamente estadísticas y perfiles.",
          "Datos de verificación cuando corresponda: SteamID64, Discord ID, estado de verificación, observaciones y referencias necesarias para prevenir suplantaciones o cuentas múltiples.",
          "Información deportiva: club, plantilla, transferencias, partidos, goles, asistencias, MVP, estadísticas, rankings, sanciones deportivas y premios.",
          "Actividad dentro de funciones interactivas: predicciones, votos, selecciones de Dream Team y otras participaciones similares.",
          "Datos técnicos y de seguridad: registros de acceso, eventos administrativos, auditoría, errores y señales necesarias para proteger cuentas y zonas restringidas.",
        ],
      },
      {
        title: "3. Finalidades del tratamiento",
        paragraphs: [
          "APA utiliza la información para operar y proteger la plataforma y para mantener la integridad de las competiciones.",
        ],
        bullets: [
          "Crear, autenticar y administrar cuentas.",
          "Relacionar a cada jugador con su identidad competitiva y sus estadísticas.",
          "Organizar clubes, plantillas, fixtures, resultados, rankings, premios y temporadas.",
          "Evitar suplantaciones, abuso, manipulación, evasión de sanciones y accesos no autorizados.",
          "Gestionar permisos del staff, registros de auditoría e incidencias.",
          "Permitir funciones de entretenimiento como predicciones, votaciones o Dream Team.",
          "Mejorar rendimiento, estabilidad, accesibilidad y experiencia de uso.",
        ],
      },
      {
        title: "4. Información pública y privada",
        paragraphs: [
          "Por la naturaleza de una competición deportiva, parte de la información está destinada a ser pública. Puede mostrarse el alias o nombre competitivo, club, avatar, PlayerId público cuando corresponda, historial, estadísticas, resultados, rankings y premios.",
          "No se publica deliberadamente el email de acceso, credenciales, tokens, información administrativa reservada, notas internas de verificación ni registros de auditoría destinados exclusivamente al staff.",
        ],
      },
      {
        title: "5. Proveedores y servicios de terceros",
        paragraphs: [
          "APA utiliza servicios externos necesarios para mantener la web y algunas de sus funciones. Cada proveedor puede tratar información técnica conforme a sus propias condiciones y políticas.",
        ],
        bullets: [
          "Supabase: autenticación, base de datos, almacenamiento y servicios asociados.",
          "Vercel: alojamiento, entrega de la aplicación y funciones de infraestructura web.",
          "Google Analytics: medición de uso únicamente cuando el usuario autoriza la categoría de analítica.",
          "Google AdSense: publicidad únicamente cuando el usuario autoriza la categoría correspondiente.",
          "Discord y Steam: pueden utilizarse como referencias externas de comunidad o verificación cuando una función lo requiere.",
        ],
      },
      {
        title: "6. Cookies, almacenamiento local y analítica",
        paragraphs: [
          "El sitio utiliza almacenamiento necesario para funciones técnicas y para recordar preferencias. Analytics y publicidad se cargan únicamente según la elección registrada en el panel de consentimiento.",
          "Podés consultar el detalle y restablecer tu elección desde la Política de Cookies.",
        ],
      },
      {
        title: "7. Conservación",
        paragraphs: [
          "Los datos de cuenta se conservan mientras sean necesarios para prestar el servicio, mantener la seguridad o gestionar una relación activa con la comunidad.",
          "Determinados resultados, estadísticas, rankings, historiales o premios pueden conservarse durante más tiempo como registro deportivo de temporadas ya disputadas. Cuando corresponda, puede reducirse o disociarse la información personal sin alterar la integridad histórica de la competición.",
        ],
      },
      {
        title: "8. Seguridad",
        paragraphs: [
          "APA aplica medidas técnicas y organizativas orientadas a limitar accesos indebidos, entre ellas autenticación, permisos por rol, políticas de acceso a datos, áreas administrativas restringidas y registros de auditoría.",
          "Ningún sistema conectado a Internet puede garantizar riesgo cero. Si detectás una vulnerabilidad o acceso indebido, informalo por los canales de soporte sin publicar datos sensibles.",
        ],
      },
      {
        title: "9. Derechos y solicitudes",
        paragraphs: [
          "Podés solicitar acceso, actualización, rectificación o supresión de datos personales cuando corresponda. Las solicitudes pueden requerir una comprobación razonable de identidad para evitar que otra persona acceda o modifique información ajena.",
          "Las solicitudes se atenderán conforme a la normativa aplicable, incluida la Ley argentina 25.326 de Protección de los Datos Personales y sus normas complementarias cuando resulten aplicables.",
        ],
      },
      {
        title: "10. Menores de edad",
        paragraphs: [
          "APA procura limitar la recopilación de información a lo necesario para la participación. Si una persona menor de edad utiliza la plataforma, debe hacerlo conforme a las reglas de la comunidad y con las autorizaciones que correspondan según su situación.",
        ],
      },
      {
        title: "11. Cambios en esta política",
        paragraphs: [
          "Esta política puede actualizarse cuando cambien las funciones del sitio, la infraestructura, los proveedores o las obligaciones aplicables. La fecha de la versión vigente se muestra al final del documento.",
        ],
      },
    ],
  },

  terminos: {
    title: "Términos de uso",
    intro:
      "Estas condiciones regulan el acceso y uso de psoargentina.com y complementan los reglamentos deportivos y normas comunitarias de APA PSO Argentina.",
    sections: [
      {
        title: "1. Naturaleza del servicio",
        paragraphs: [
          "psoargentina.com es la plataforma de APA PSO Argentina para organizar, visualizar y administrar información vinculada con competiciones de Pro Soccer Online.",
          "El servicio puede incluir fixture, resultados, estadísticas, clubes, plantillas, jugadores, mercado, noticias, historia, premios, predicciones, rankings y herramientas administrativas.",
        ],
      },
      {
        title: "2. Aceptación y uso de la plataforma",
        paragraphs: [
          "Al utilizar el sitio aceptás usarlo de buena fe, respetar estas condiciones y cumplir las reglas específicas de la competición y de la comunidad.",
          "Si una función requiere autenticación, sos responsable de mantener seguras tus credenciales y de cualquier actividad realizada desde tu cuenta salvo que informes oportunamente un acceso no autorizado.",
        ],
      },
      {
        title: "3. Identidad, cuentas y verificación",
        paragraphs: [
          "Los datos competitivos asociados a una cuenta deben ser correctos. No está permitido suplantar jugadores, vincular deliberadamente identidades ajenas, compartir cuentas para evadir controles ni utilizar cuentas alternativas para obtener ventajas o eludir sanciones.",
          "APA puede solicitar verificaciones razonables cuando sea necesario proteger la integridad de una competición o resolver una disputa de identidad.",
        ],
      },
      {
        title: "4. Competencia justa e integridad de datos",
        paragraphs: [
          "Está prohibido manipular resultados, estadísticas, votaciones, predicciones, premios o cualquier otra función destinada a reflejar actividad competitiva real.",
          "También está prohibido aprovechar errores técnicos de forma deliberada para obtener ventajas, alterar información o afectar a otros usuarios.",
        ],
      },
      {
        title: "5. Conductas técnicas prohibidas",
        paragraphs: [
          "No está permitido intentar acceder a zonas o datos sin autorización, vulnerar controles de seguridad, automatizar tráfico abusivo, interferir con el funcionamiento del sitio, introducir código malicioso, extraer información privada ni eludir límites o permisos establecidos por la plataforma.",
        ],
      },
      {
        title: "6. Contenido, perfiles y publicaciones",
        paragraphs: [
          "La información pública puede incluir perfiles, clubes, resultados, rankings, estadísticas, premios e historial deportivo. APA puede corregir, retirar o actualizar contenido cuando existan errores, duplicados, datos inválidos o decisiones administrativas.",
          "El usuario no debe utilizar campos públicos para publicar información ilegal, invasiva, engañosa, ofensiva o ajena a la finalidad del servicio.",
        ],
      },
      {
        title: "7. Predicciones, votos y entretenimiento",
        paragraphs: [
          "Las funciones de predicción, votación o selección comunitaria tienen finalidad recreativa dentro de APA. Salvo que se indique expresamente lo contrario, no constituyen apuestas, no tienen valor monetario y no generan derechos económicos.",
          "APA puede cerrar votaciones en los horarios establecidos, anular participaciones inválidas o corregir resultados cuando exista un error técnico verificable.",
        ],
      },
      {
        title: "8. Sanciones y restricciones",
        paragraphs: [
          "El incumplimiento de estas condiciones o de los reglamentos puede dar lugar a advertencias, restricciones de funciones, suspensión de cuenta, exclusión de competiciones u otras medidas previstas por las reglas internas.",
          "Las medidas deportivas y comunitarias se gestionan mediante los mecanismos internos de APA y pueden ser independientes del acceso técnico al sitio.",
        ],
      },
      {
        title: "9. Disponibilidad y cambios",
        paragraphs: [
          "APA puede modificar, añadir, reorganizar o retirar funciones por mantenimiento, seguridad, cambios reglamentarios o evolución del proyecto. No se garantiza disponibilidad ininterrumpida ni ausencia absoluta de errores.",
        ],
      },
      {
        title: "10. Servicios y marcas de terceros",
        paragraphs: [
          "Pro Soccer Online, Steam, Discord, Google y otras marcas o servicios mencionados pertenecen a sus respectivos titulares. APA PSO Argentina opera como comunidad independiente salvo que se indique expresamente una relación oficial concreta.",
        ],
      },
      {
        title: "11. Limitación razonable de responsabilidad",
        paragraphs: [
          "APA procura que la información sea correcta y que el servicio funcione adecuadamente, pero pueden existir errores temporales, interrupciones, retrasos en actualizaciones o datos sujetos a revisión.",
          "La información competitiva publicada en APA tiene validez dentro del ámbito de la comunidad y no constituye una certificación oficial externa de terceros.",
        ],
      },
      {
        title: "12. Modificaciones de los términos",
        paragraphs: [
          "Estos términos pueden actualizarse cuando cambie el funcionamiento del servicio o las reglas aplicables. El uso continuado del sitio después de una actualización implica la aplicación de la versión vigente para usos posteriores.",
        ],
      },
    ],
  },

  cookies: {
    title: "Política de cookies",
    intro:
      "Esta página explica qué tecnologías de almacenamiento utiliza APA PSO Argentina y cómo podés controlar las categorías opcionales.",
    sections: [
      {
        title: "1. Qué son las cookies y tecnologías similares",
        paragraphs: [
          "Las cookies, localStorage y tecnologías similares permiten recordar información en el navegador. Algunas son necesarias para que el sitio funcione y otras pueden utilizarse para medición o publicidad.",
        ],
      },
      {
        title: "2. Almacenamiento necesario",
        paragraphs: [
          "El sitio puede utilizar almacenamiento estrictamente necesario para autenticación, seguridad, preferencias técnicas y para recordar la elección realizada en el panel de privacidad.",
          "Estas funciones no se utilizan con finalidad publicitaria y pueden ser imprescindibles para prestar una función solicitada por el usuario.",
        ],
      },
      {
        title: "3. Analítica opcional",
        paragraphs: [
          "Si autorizás Analítica, APA carga Google Analytics mediante el identificador configurado para el sitio. Se utiliza para comprender de forma agregada cómo se navega por la web y detectar oportunidades de mejora.",
          "La implementación actual solicita anonimización de IP mediante la configuración disponible de Google Analytics.",
        ],
      },
      {
        title: "4. Publicidad opcional",
        paragraphs: [
          "Si autorizás Publicidad, APA puede cargar Google AdSense. Google puede utilizar cookies u otras tecnologías para mostrar, medir, limitar o proteger anuncios conforme a sus propias políticas.",
          "El script publicitario no se carga desde el panel de consentimiento mientras esta categoría no haya sido autorizada.",
        ],
      },
      {
        title: "5. Cómo se guarda tu elección",
        paragraphs: [
          "La selección del panel de privacidad se guarda localmente en el navegador bajo una preferencia propia del sitio. Esto permite recordar si aceptaste o rechazaste Analítica y Publicidad.",
        ],
      },
      {
        title: "6. Cambiar o retirar el consentimiento",
        paragraphs: [
          "Podés restablecer la preferencia desde esta misma página. Al hacerlo, el panel de privacidad volverá a mostrarse y podrás elegir nuevamente.",
        ],
      },
      {
        title: "7. Cookies de terceros",
        paragraphs: [
          "Cuando autorizás servicios externos como Google Analytics o AdSense, esos proveedores pueden establecer sus propias cookies o identificadores. Su funcionamiento y plazos de conservación se rigen también por las políticas del proveedor correspondiente.",
        ],
      },
      {
        title: "8. Configuración del navegador",
        paragraphs: [
          "También podés eliminar o bloquear cookies desde la configuración del navegador. Si bloqueás almacenamiento necesario, algunas funciones de autenticación o preferencias pueden dejar de funcionar correctamente.",
        ],
      },
    ],
  },

  "aviso-legal": {
    title: "Aviso legal",
    intro:
      "Información sobre la naturaleza del proyecto, la titularidad del contenido y las responsabilidades asociadas al uso de psoargentina.com.",
    sections: [
      {
        title: "1. Identidad del proyecto",
        paragraphs: [
          "APA PSO Argentina es una comunidad competitiva dedicada a organizar y documentar competiciones de Pro Soccer Online. psoargentina.com funciona como su plataforma informativa, estadística y administrativa.",
        ],
      },
      {
        title: "2. Independencia respecto de terceros",
        paragraphs: [
          "Salvo indicación expresa, APA PSO Argentina no representa ni actúa en nombre de los titulares de Pro Soccer Online, Steam, Discord, Google u otros servicios mencionados en la plataforma.",
        ],
      },
      {
        title: "3. Propiedad intelectual",
        paragraphs: [
          "El diseño, estructura, código propio, textos, gráficos originales y elementos creados específicamente para APA están protegidos por las normas aplicables.",
          "Los nombres comerciales, logotipos, imágenes, avatares y marcas de terceros pertenecen a sus respectivos titulares y se utilizan únicamente en el contexto permitido por la competición, identificación de clubes, jugadores o referencias externas.",
        ],
      },
      {
        title: "4. Información deportiva",
        paragraphs: [
          "Resultados, estadísticas, rankings, plantillas, premios e historial se publican con finalidad informativa y competitiva dentro de APA. Pueden modificarse si se detectan errores, inconsistencias, sanciones o decisiones administrativas posteriores.",
        ],
      },
      {
        title: "5. Enlaces externos",
        paragraphs: [
          "El sitio puede contener enlaces a Discord, Steam u otros servicios. APA no controla el funcionamiento, disponibilidad, seguridad ni políticas de privacidad de sitios externos.",
        ],
      },
      {
        title: "6. Disponibilidad y mantenimiento",
        paragraphs: [
          "La plataforma puede experimentar mantenimiento, interrupciones, fallos de terceros o cambios técnicos. APA puede modificar la estructura del sitio sin obligación de mantener indefinidamente una función concreta.",
        ],
      },
      {
        title: "7. Uso de la información",
        paragraphs: [
          "No está permitido reutilizar información obtenida desde áreas privadas, administrativas o restringidas para acosar, perjudicar o identificar indebidamente a otros miembros.",
          "La información pública puede consultarse para fines legítimos relacionados con la comunidad, respetando las reglas de uso y los derechos de terceros.",
        ],
      },
      {
        title: "8. Contacto por errores o derechos",
        paragraphs: [
          "Si detectás contenido incorrecto, una posible infracción de derechos o un problema relacionado con información publicada, utilizá los canales oficiales de contacto de APA para solicitar revisión.",
        ],
      },
    ],
  },

  conducta: {
    title: "Reglas de conducta",
    intro:
      "Estas reglas establecen el estándar mínimo de comportamiento esperado en las funciones web y espacios vinculados a APA PSO Argentina.",
    sections: [
      {
        title: "1. Respeto entre miembros",
        paragraphs: [
          "No se permiten amenazas, hostigamiento, acoso persistente, discriminación, doxxing, exposición de datos privados ni conductas destinadas a intimidar a otros usuarios.",
        ],
      },
      {
        title: "2. Competencia justa",
        paragraphs: [
          "Toda participación debe respetar las reglas deportivas. Quedan prohibidos la manipulación de partidos, acuerdos fraudulentos, falsificación de resultados, abuso de errores y cualquier práctica destinada a obtener una ventaja ilegítima.",
        ],
      },
      {
        title: "3. Cuentas e identidad",
        paragraphs: [
          "Cada participante debe utilizar la identidad competitiva que le corresponda. No está permitido prestar cuentas, suplantar jugadores, falsear verificaciones ni utilizar multicuentas para evadir sanciones o restricciones.",
        ],
      },
      {
        title: "4. Uso de votaciones y predicciones",
        paragraphs: [
          "Las votaciones, Dream Team, predicciones y funciones similares deben utilizarse de forma genuina. No se permite automatizar votos, coordinar manipulación masiva, aprovechar cuentas alternativas ni interferir con el cierre normal de una votación.",
        ],
      },
      {
        title: "5. Conducta en perfiles y contenido",
        paragraphs: [
          "Los nombres, biografías, imágenes y demás contenido visible deben ser apropiados para la comunidad. APA puede retirar contenido ofensivo, ilegal, engañoso, sexualmente explícito, invasivo o destinado a acosar.",
        ],
      },
      {
        title: "6. Seguridad de la plataforma",
        paragraphs: [
          "No se permite probar vulnerabilidades sin autorización, intentar acceder a paneles restringidos, manipular solicitudes, atacar servicios, distribuir malware ni interferir con mecanismos de seguridad.",
        ],
      },
      {
        title: "7. Relación con el staff",
        paragraphs: [
          "Los miembros deben respetar los canales establecidos para reclamos y apelaciones. Criticar una decisión no constituye por sí mismo una infracción, pero el abuso, las amenazas o el hostigamiento al staff pueden ser sancionados.",
        ],
      },
      {
        title: "8. Evidencia y reportes",
        paragraphs: [
          "Los reportes deben realizarse de buena fe. Fabricar evidencia, editar material de forma engañosa o presentar acusaciones falsas deliberadamente puede generar medidas disciplinarias.",
        ],
      },
      {
        title: "9. Medidas disciplinarias",
        paragraphs: [
          "Según la gravedad y reincidencia, APA puede aplicar advertencias, eliminación de contenido, restricciones de funciones, suspensión temporal, sanciones deportivas o exclusión de la comunidad.",
          "Las reglas específicas de cada competición pueden establecer sanciones adicionales y procedimientos de revisión.",
        ],
      },
      {
        title: "10. Cambios y casos no previstos",
        paragraphs: [
          "APA puede actualizar estas reglas cuando aparezcan nuevas funciones o modalidades de abuso. Los casos no previstos pueden resolverse aplicando los principios de integridad competitiva, seguridad y respeto a la comunidad.",
        ],
      },
    ],
  },

  contacto: {
    title: "Contacto",
    intro:
      "Canales y recomendaciones para contactar al staff de APA PSO Argentina por soporte, privacidad, seguridad o correcciones de información.",
    sections: [
      {
        title: "1. Soporte general",
        paragraphs: [
          "El canal principal de atención de APA se encuentra en el servidor oficial de Discord. Utilizá los canales de soporte definidos allí para consultas sobre cuentas, competiciones, plantillas, estadísticas o funcionamiento de la web.",
        ],
      },
      {
        title: "2. Privacidad y datos personales",
        paragraphs: [
          "Si querés solicitar acceso, corrección, actualización o supresión de datos asociados a tu cuenta, indicá claramente que se trata de una solicitud de privacidad y proporcioná solamente la información necesaria para identificar tu cuenta.",
        ],
      },
      {
        title: "3. Correcciones deportivas",
        paragraphs: [
          "Para errores en resultados, estadísticas, premios, clubes, perfiles o historial, incluí la temporada, competición, partido o jugador afectado y una descripción precisa del problema.",
        ],
      },
      {
        title: "4. Seguridad",
        paragraphs: [
          "Si detectás una vulnerabilidad, una cuenta comprometida o acceso indebido, contactá al staff de forma privada. No publiques tokens, contraseñas, datos personales ni detalles explotables en canales públicos.",
        ],
      },
      {
        title: "5. Qué no enviar",
        paragraphs: [
          "Nunca envíes contraseñas, códigos de autenticación, tokens de sesión, claves privadas ni información financiera. El staff no necesita esos datos para verificar una cuenta o responder una consulta.",
        ],
      },
      {
        title: "6. Discord oficial",
        paragraphs: [
          "Podés acceder al Discord oficial de APA PSO Argentina desde el enlace de contacto disponible a continuación.",
        ],
      },
    ],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = legalPages[slug];
  if (!page) return {};
  return {
    title: page.title,
    description: page.intro,
  };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = legalPages[slug];

  if (!page) notFound();

  return (
    <main className="min-h-screen bg-[#f3f8fc] px-4 py-10 text-[#102f55] md:px-8 md:py-14">
      <article className="mx-auto max-w-5xl overflow-hidden rounded-[18px] border border-[#cfe2ee] bg-white shadow-[0_16px_50px_rgba(11,39,71,.07)]">
        <header className="border-b border-[#1d5b87]/20 bg-[#103d66] px-6 py-9 text-white md:px-10 md:py-11">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8ed2f3]">
            APA PSO Argentina · Legal
          </p>
          <h1 className="mt-3 text-[clamp(32px,5vw,54px)] font-black uppercase leading-[.95] tracking-[-0.04em]">
            {page.title}
          </h1>
          <p className="mt-4 max-w-3xl text-[14px] font-medium leading-6 text-white/78 md:text-[15px]">
            {page.intro}
          </p>
        </header>

        <div className="grid gap-8 px-6 py-8 md:px-10 md:py-10 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="self-start lg:sticky lg:top-24">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#2d98d4]">
              Documentos legales
            </p>
            <nav className="mt-3 grid gap-1.5 text-[13px] font-bold text-[#456b88]">
              <Link href="/legal/privacidad" className="rounded-md px-2 py-1.5 hover:bg-[#edf7fc] hover:text-[#102f55]">Privacidad</Link>
              <Link href="/legal/terminos" className="rounded-md px-2 py-1.5 hover:bg-[#edf7fc] hover:text-[#102f55]">Términos de uso</Link>
              <Link href="/legal/cookies" className="rounded-md px-2 py-1.5 hover:bg-[#edf7fc] hover:text-[#102f55]">Cookies</Link>
              <Link href="/legal/aviso-legal" className="rounded-md px-2 py-1.5 hover:bg-[#edf7fc] hover:text-[#102f55]">Aviso legal</Link>
              <Link href="/legal/conducta" className="rounded-md px-2 py-1.5 hover:bg-[#edf7fc] hover:text-[#102f55]">Conducta</Link>
              <Link href="/legal/contacto" className="rounded-md px-2 py-1.5 hover:bg-[#edf7fc] hover:text-[#102f55]">Contacto</Link>
            </nav>
          </aside>

          <div className="min-w-0">
            <div className="space-y-9">
              {page.sections.map((section) => (
                <section key={section.title} className="border-b border-[#dbe9f2] pb-8 last:border-0">
                  <h2 className="text-[20px] font-black tracking-[-0.025em] text-[#102f55] md:text-[22px]">
                    {section.title}
                  </h2>

                  <div className="mt-3 space-y-3 text-[14px] font-medium leading-7 text-[#496d88] md:text-[15px]">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>

                  {section.bullets?.length ? (
                    <ul className="mt-4 grid gap-2.5 text-[14px] font-medium leading-6 text-[#496d88] md:text-[15px]">
                      {section.bullets.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#2d98d4]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>

            {slug === "cookies" ? (
              <section className="mt-8 rounded-xl border border-[#bcddec] bg-[#eef8fd] p-5">
                <h2 className="text-[16px] font-black">Administrar preferencias</h2>
                <p className="mt-2 text-[13px] font-medium leading-6 text-[#496d88]">
                  Restablecé tu elección para que el panel de privacidad vuelva a aparecer.
                </p>
                <div className="mt-4">
                  <CookiePreferencesReset />
                </div>
              </section>
            ) : null}

            {slug === "contacto" ? (
              <section className="mt-8 rounded-xl border border-[#bcddec] bg-[#eef8fd] p-5">
                <h2 className="text-[16px] font-black">Discord oficial</h2>
                <p className="mt-2 text-[13px] font-medium leading-6 text-[#496d88]">
                  Canal principal de soporte y contacto de APA PSO Argentina.
                </p>
                <a
                  href="https://discord.gg/WCyqeJMmCU"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex rounded-lg bg-[#102f55] px-4 py-2.5 text-[12px] font-black text-white transition hover:bg-[#174b7b]"
                >
                  Abrir Discord oficial
                </a>
              </section>
            ) : null}

            <footer className="mt-9 flex flex-col gap-3 border-t border-[#dbe9f2] pt-6 text-[12px] font-semibold text-[#7890a7] sm:flex-row sm:items-center sm:justify-between">
              <span>Última actualización: {LAST_UPDATED}.</span>
              <Link href="/" className="font-black text-[#245f8e]">
                Volver al inicio →
              </Link>
            </footer>
          </div>
        </div>
      </article>
    </main>
  );
}
