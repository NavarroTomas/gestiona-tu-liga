export default function Hero() {

  return (

    <section
      className="
        rounded-[32px]

        bg-[#11151c]

        border
        border-white/[0.06]

        p-7
        md:p-10
      "
    >

      <div className="max-w-3xl">

        <span
          className="
            text-sky-400
            text-xs
            font-bold
            uppercase
            tracking-[4px]
          "
        >
          APA PSO ARGENTINA
        </span>

        <h1
          className="
            mt-4

            text-4xl
            md:text-6xl

            font-black
            leading-none

            text-white
          "
        >
          La Liga Definitiva
        </h1>

        <p
          className="
            mt-5

            text-zinc-400
            text-base
            md:text-lg

            leading-relaxed
          "
        >
          Fixture, estadísticas, goleadores,
          MVPs y toda la competencia
          profesional de APA PSO ARGENTINA.
        </p>

      </div>

    </section>

  );

}