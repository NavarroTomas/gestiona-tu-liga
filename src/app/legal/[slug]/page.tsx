import Link from "next/link";
import { notFound } from "next/navigation";

const legalPages = {
  privacidad: {
    title: "Política de privacidad",
    intro: "Cómo APA PSO Argentina trata la información vinculada al uso del sitio y de las cuentas.",
    sections: [
      ["Datos que podemos tratar", "Datos de cuenta, perfil, identificadores deportivos, registros técnicos básicos y la información que el usuario proporciona voluntariamente."],
      ["Para qué se usan", "Para prestar las funciones del sitio, administrar cuentas, mantener la seguridad, operar estadísticas y mejorar la experiencia."],
      ["Terceros", "El sitio puede apoyarse en proveedores de infraestructura, autenticación, analítica o publicidad cuando corresponda y según el consentimiento aplicable."],
      ["Conservación", "Los datos se conservan durante el tiempo necesario para las finalidades operativas, de seguridad o administrativas correspondientes."],
      ["Derechos", "Podés solicitar revisión, corrección o eliminación de información personal cuando corresponda contactando a la administración de APA."],
    ],
  },
  terminos: {
    title: "Términos de uso",
    intro: "Condiciones generales para acceder y utilizar la web oficial de APA PSO Argentina.",
    sections: [
      ["Uso del sitio", "El acceso al sitio implica utilizar sus funciones de buena fe y respetar las reglas de la comunidad y de las competiciones."],
      ["Cuentas", "Cada usuario es responsable de mantener seguras sus credenciales y de la información que carga en su cuenta."],
      ["Contenido", "Los resultados, tablas, estadísticas, noticias y demás contenido oficial pueden ser corregidos cuando exista un error administrativo o deportivo."],
      ["Disponibilidad", "APA puede modificar, suspender o reorganizar secciones del sitio por mantenimiento, seguridad o cambios de formato competitivo."],
      ["Conducta", "No está permitido abusar de la plataforma, intentar alterar datos, automatizar accesos no autorizados o interferir con el funcionamiento del servicio."],
    ],
  },
  cookies: {
    title: "Política de cookies",
    intro: "Información sobre almacenamiento local, analítica y tecnologías similares utilizadas en la web.",
    sections: [
      ["Necesarias", "Se utilizan para funciones esenciales, preferencias y seguridad del sitio."],
      ["Analítica", "Puede utilizarse analítica para comprender el uso del sitio únicamente cuando el usuario lo autoriza desde el panel de consentimiento."],
      ["Publicidad", "Los servicios publicitarios opcionales sólo se cargan si fueron autorizados."],
      ["Preferencias", "La selección de consentimiento se guarda localmente para no solicitarla en cada visita."],
      ["Cambiar elección", "Podés borrar los datos del sitio desde tu navegador para volver a configurar las preferencias de cookies."],
    ],
  },
  "aviso-legal": {
    title: "Aviso legal",
    intro: "Información general sobre la naturaleza y responsabilidad del sitio APA PSO Argentina.",
    sections: [
      ["Naturaleza del proyecto", "APA PSO Argentina es una comunidad competitiva vinculada a Pro Soccer Online y administra su propia actividad deportiva y comunitaria."],
      ["Marcas de terceros", "Las marcas, nombres de juegos y servicios de terceros pertenecen a sus respectivos titulares."],
      ["Exactitud", "Se busca mantener la información actualizada, aunque pueden existir errores temporales que serán corregidos cuando sean detectados."],
      ["Enlaces externos", "Los enlaces a servicios externos se proporcionan como referencia y están sujetos a las condiciones de cada proveedor."],
    ],
  },
  conducta: {
    title: "Reglas de conducta",
    intro: "Principios básicos para participar de forma segura y competitiva dentro de APA.",
    sections: [
      ["Respeto", "No se toleran amenazas, acoso, discriminación ni hostigamiento hacia otros miembros de la comunidad."],
      ["Competencia justa", "Está prohibido manipular resultados, utilizar cuentas indebidas o intentar obtener ventajas mediante fraude."],
      ["Identidad y cuentas", "La información utilizada en competiciones y verificaciones debe ser auténtica y corresponder al participante."],
      ["Sanciones", "Las infracciones pueden derivar en advertencias, restricciones, suspensión o exclusión según la gravedad y las reglas vigentes."],
    ],
  },
  contacto: {
    title: "Contacto",
    intro: "Canales para consultas sobre la web, privacidad, competiciones o administración de APA.",
    sections: [
      ["Comunidad", "Para consultas generales utilizá los canales oficiales de APA y el servidor de Discord de la comunidad."],
      ["Privacidad y cuentas", "Para solicitudes relacionadas con datos personales o cuentas, contactá al staff administrativo indicando claramente el motivo."],
      ["Errores del sitio", "Si encontrás un error en resultados, perfiles o información pública, reportalo al staff con la mayor cantidad de detalle posible."],
    ],
  },
} as const;

type Slug = keyof typeof legalPages;

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = legalPages[slug as Slug];

  if (!page) notFound();

  return (
    <main className="min-h-screen bg-[#f5f6f8] px-4 py-12 text-[#0b2747] md:px-8 md:py-16">
      <article className="mx-auto max-w-4xl overflow-hidden rounded-[28px] border border-[#0b2747]/10 bg-white shadow-[0_16px_50px_rgba(11,39,71,.08)]">
        <header className="bg-[#0b2747] px-6 py-10 text-white md:px-10">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/60">APA PSO Argentina</p>
          <h1 className="mt-3 text-4xl font-black uppercase tracking-[-0.04em] md:text-5xl">{page.title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70 md:text-base">{page.intro}</p>
        </header>

        <div className="space-y-8 px-6 py-8 md:px-10 md:py-10">
          {page.sections.map(([title, text]) => (
            <section key={title}>
              <h2 className="text-lg font-black uppercase">{title}</h2>
              <p className="mt-2 leading-7 text-[#245f8e]">{text}</p>
            </section>
          ))}

          <div className="border-t border-[#0b2747]/10 pt-6 text-sm text-[#245f8e]">
            Última actualización: 16 de septiembre de 2026. <Link href="/" className="font-black text-[#0b2747]">Volver al inicio →</Link>
          </div>
        </div>
      </article>
    </main>
  );
}
