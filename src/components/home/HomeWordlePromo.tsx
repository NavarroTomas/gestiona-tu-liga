"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const tiles = [
  { letter: "A", className: "bg-[#102f55] text-white" },
  { letter: "P", className: "bg-[#168fd4] text-white" },
  { letter: "A", className: "bg-[#56afe2] text-white" },
  { letter: "P", className: "bg-white text-[#102f55]" },
  { letter: "S", className: "bg-white text-[#102f55]" },
  { letter: "O", className: "bg-[#102f55] text-white" },
];

export default function HomeWordlePromo() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-[30px] bg-[#185b8d] p-7 text-white sm:p-10 lg:p-12"
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)] lg:items-center">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#bdeaff]">
            Nuevo juego de APA
          </p>

          <h2 className="mt-3 text-[48px] font-black leading-[0.92] tracking-[-0.055em] text-white sm:text-[64px]">
            APA WORDLE
          </h2>

          <p className="mt-5 max-w-[58ch] text-[14px] font-semibold leading-7 text-white/78">
            Poné a prueba cuánto conocés a la comunidad. Cada partida gira alrededor de nombres, clubes y conceptos de APA.
          </p>

          <Link
            href="/entretenimiento/wordle"
            className="apa-home-cta mt-7 inline-flex min-h-12 items-center rounded-xl bg-[#102f55] px-6 text-[10px] font-black uppercase tracking-[0.06em] !text-white [&_*]:!text-white transition hover:-translate-y-0.5 hover:bg-[#0c2745]"
          >
            Jugar Wordle <span className="ml-3">→</span>
          </Link>
        </div>

        <div className="mx-auto grid w-full max-w-[520px] grid-cols-3 gap-3 sm:gap-4">
          {tiles.map((tile, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.82, rotate: -3 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.48, delay: 0.08 * index }}
              className={
                "flex aspect-square items-center justify-center rounded-[20px] border border-white/15 text-[34px] font-black shadow-[0_14px_34px_rgba(0,0,0,.08)] sm:text-[46px] " +
                tile.className
              }
            >
              {tile.letter}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
