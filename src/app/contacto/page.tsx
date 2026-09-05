import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto y Privacidad",
  description: "Canales de contacto y solicitudes de datos de APA PSO Argentina.",
};

export default function ContactoPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 text-zinc-200">
      <h1 className="text-4xl font-black text-white">Contacto y solicitudes de datos</h1>
      <p className="mt-3 text-sm text-zinc-500">APA PSO Argentina</p>

      <div className="mt-10 space-y-8 leading-7">
        <section>
          <h2 className="text-xl font-black text-white">Soporte oficial</h2>
          <p className="mt-3">
            El canal oficial disponible actualmente para soporte de cuentas, competiciones y consultas de privacidad es el Discord de APA PSO Argentina.
          </p>
          <a
            href="https://discord.gg/WCyqeJMmCU"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block underline underline-offset-4"
          >
            Abrir Discord oficial de APA PSO Argentina
          </a>
        </section>

        <section>
          <h2 className="text-xl font-black text-white">Solicitudes sobre datos personales</h2>
          <p className="mt-3">
            Podés solicitar acceso, información, actualización, rectificación o supresión de los datos asociados a tu cuenta. Para proteger a los usuarios, APA puede pedir elementos razonables que permitan comprobar que la solicitud corresponde a la persona titular de la cuenta.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-white">Qué incluir</h2>
          <p className="mt-3">
            Indicá tu usuario de APA y explicá con claridad la solicitud. No envíes contraseñas, códigos de sesión ni información financiera. Si la consulta se relaciona con Steam o Discord, compartí únicamente los identificadores necesarios para localizar tu cuenta.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-black text-white">Incidentes de seguridad</h2>
          <p className="mt-3">
            Si creés que una cuenta fue comprometida o detectaste acceso indebido a información, informalo al staff por el mismo canal de soporte y evitá publicar datos privados en canales públicos.
          </p>
        </section>
      </div>
    </main>
  );
}
