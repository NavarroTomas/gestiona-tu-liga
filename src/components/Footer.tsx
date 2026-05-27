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
            APA PSO ARGENTINA
          </h3>

          <p className="
            text-zinc-500
            mt-2
          ">
            Liga oficial de Pro Soccer Online.
          </p>

        </div>

        <div className="
          text-zinc-500
          text-sm
        ">
          © 2026 APA PSO ARGENTINA
        </div>

      </div>

    </footer>

  );
}