import Link from "next/link";

export default function Footer() {
  return (
    <footer className="
      border-t border-white/10
      mt-20
      bg-black/20
      backdrop-blur-xl
    ">
      <div className="
        max-w-7xl mx-auto
        px-6 py-10
        flex flex-col md:flex-row
        items-center justify-between
        gap-6
      ">
        <div>
          <h3 className="
            text-3xl
            font-black
            text-white
          ">
            Liga PSO ARGENTINA
          </h3>

          <p className="
            text-zinc-500
            mt-2
          ">
            Liga oficial de Pro Soccer Online.
          </p>

          <nav aria-label="Información legal" className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-500">
            <Link href="/privacidad" className="hover:text-zinc-300">Privacidad</Link>
            <Link href="/terminos" className="hover:text-zinc-300">Términos</Link>
            <Link href="/cookies" className="hover:text-zinc-300">Cookies</Link>
            <Link href="/contacto" className="hover:text-zinc-300">Contacto</Link>
          </nav>
        </div>

        <div className="
          text-zinc-500
          text-sm
        ">
          © 2026 Liga PSO ARGENTINA
        </div>
      </div>
    </footer>
  );
}
