import Panel from "./ui/Panel";

export default function Noticias() {

  const noticias = [

    "🔥 TX continúa líder absoluto de la liga.",
    "⚡ Wolves recorta distancia en la tabla.",
    "🏆 Monzon domina el ranking MVP.",
    "🎯 El torneo entra en su fase decisiva."

  ];

  return (

    <Panel>

      <div className="relative z-10">

        <div className="flex items-center justify-between mb-5">

          <div>

            <p className="
              text-sky-400
              text-xs
              font-black
              tracking-[5px]
              uppercase
              mb-2
            ">
              News Center
            </p>

            <h2 className="
              text-3xl
              font-black
              text-white
            ">
              NOTICIAS
            </h2>

          </div>

          <div className="
            text-[10px]
            uppercase
            font-black
            tracking-widest
            bg-[#0d131d]
            border border-[#243041]
            px-3 py-1
            rounded-xl
            text-sky-300
          ">
            Liga PSO
          </div>

        </div>

        <div className="space-y-3">

          {noticias.map((n, index) => (

            <div
              key={index}
              className="
                rounded-2xl
                bg-gradient-to-b
                from-[#1f2937]
                to-[#111827]
                border-2
                border-[#334155]
                p-5
                text-zinc-300
                font-bold
              "
            >
              {n}
            </div>

          ))}

        </div>

      </div>

    </Panel>

  );

}