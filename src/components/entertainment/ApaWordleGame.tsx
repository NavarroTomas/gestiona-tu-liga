"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  APA_WORDLE_WORDS,
  normalizeWordleWord,
  type ApaWordleEntry,
} from "@/data/wordleWords";

type TileState = "correct" | "present" | "absent";

type StoredGame = {
  guesses: string[];
  status: "playing" | "won" | "lost";
};

const MAX_GUESSES = 6;
const KEYBOARD = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

function dayKey() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

function dayIndex(length: number) {
  const date = new Date();
  const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(utc / 86400000) % Math.max(length, 1);
}

function evaluateGuess(guess: string, answer: string): TileState[] {
  const states: TileState[] = Array(answer.length).fill("absent");
  const remaining = answer.split("");

  guess.split("").forEach((letter, index) => {
    if (letter === answer[index]) {
      states[index] = "correct";
      remaining[index] = "";
    }
  });

  guess.split("").forEach((letter, index) => {
    if (states[index] === "correct") return;
    const foundIndex = remaining.indexOf(letter);
    if (foundIndex >= 0) {
      states[index] = "present";
      remaining[foundIndex] = "";
    }
  });

  return states;
}

function tileClass(state?: TileState) {
  if (state === "correct") return "border-[#168fd4] bg-[#168fd4] text-white";
  if (state === "present") return "border-[#e6b84f] bg-[#e6b84f] text-[#102f55]";
  if (state === "absent") return "border-[#8fa6b5] bg-[#8fa6b5] text-white";
  return "border-[#c6dbe6] bg-white text-[#102f55]";
}

export default function ApaWordleGame() {
  const entries = useMemo(
    () =>
      APA_WORDLE_WORDS.map((entry) => ({
        ...entry,
        normalized: normalizeWordleWord(entry.word),
      })).filter((entry) => entry.normalized.length >= 4 && entry.normalized.length <= 10),
    [],
  );

  const answerEntry = (entries[dayIndex(entries.length)] || entries[0]) as
    | (ApaWordleEntry & { normalized: string })
    | undefined;

  const answer = answerEntry?.normalized || "LIGA";
  const storageKey = "apa-wordle-" + dayKey() + "-" + answer;
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredGame;
        setGuesses(Array.isArray(parsed.guesses) ? parsed.guesses : []);
        setStatus(parsed.status || "playing");
      }
    } catch {
      // Si el navegador bloquea localStorage, el juego sigue funcionando en memoria.
    } finally {
      setLoaded(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ guesses, status } satisfies StoredGame),
      );
    } catch {
      // No interrumpimos la partida por un fallo de almacenamiento local.
    }
  }, [guesses, loaded, status, storageKey]);

  function submitGuess() {
    if (status !== "playing") return;

    const guess = normalizeWordleWord(current);
    if (guess.length !== answer.length) {
      setMessage("La palabra debe tener " + answer.length + " letras.");
      return;
    }

    const next = [...guesses, guess];
    setGuesses(next);
    setCurrent("");

    if (guess === answer) {
      setStatus("won");
      setMessage("¡Correcto! Volvé mañana para una nueva palabra.");
      return;
    }

    if (next.length >= MAX_GUESSES) {
      setStatus("lost");
      setMessage("La palabra era " + answer + ".");
      return;
    }

    setMessage("");
  }

  function pressKey(key: string) {
    if (status !== "playing") return;

    if (key === "ENTER") {
      submitGuess();
      return;
    }

    if (key === "BACKSPACE") {
      setCurrent((value) => value.slice(0, -1));
      return;
    }

    if (/^[A-ZÑ]$/.test(key) && current.length < answer.length) {
      setCurrent((value) => normalizeWordleWord(value + key).slice(0, answer.length));
    }
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const key = event.key.toUpperCase();

      if (key === "ENTER" || key === "BACKSPACE" || /^[A-ZÑ]$/.test(key)) {
        event.preventDefault();
        pressKey(key);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const rows = Array.from({ length: MAX_GUESSES }, (_, rowIndex) => {
    const submitted = guesses[rowIndex];
    const isCurrent = rowIndex === guesses.length && status === "playing";
    const value = submitted || (isCurrent ? current : "");
    const states = submitted ? evaluateGuess(submitted, answer) : [];

    return { value, states };
  });

  const keyboardStates = new Map<string, TileState>();
  guesses.forEach((guess) => {
    evaluateGuess(guess, answer).forEach((state, index) => {
      const letter = guess[index];
      const previous = keyboardStates.get(letter);
      if (state === "correct" || (state === "present" && previous !== "correct") || !previous) {
        keyboardStates.set(letter, state);
      }
    });
  });

  return (
    <main className="min-h-screen bg-[#f3fafe] text-[#102f55]">
      <section className="border-b border-[#c9e3f1] bg-white">
        <div className="mx-auto w-[min(94vw,1760px)] py-10 sm:py-14">
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#168fd4]">
            Entretenimiento Liga
          </p>
          <h1 className="mt-2 text-[clamp(3rem,7vw,6.8rem)] font-black uppercase leading-[.86] tracking-[-.06em]">
            Liga WORDLE
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] font-semibold leading-7 text-[#58788f]">
            Una palabra por día inspirada en la liga, sus clubes, posiciones, torneos y cultura.
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-[min(94vw,1760px)] gap-7 py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-12">
        <div className="rounded-[28px] border border-[#c9e3f1] bg-white p-5 sm:p-8">
          <div className="mx-auto max-w-[760px]">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#168fd4]">
                  Palabra del día
                </p>
                <p className="mt-1 text-[13px] font-bold text-[#6c8799]">
                  {answer.length} letras · {answerEntry?.category || "Liga"}
                </p>
              </div>
              <span className="rounded-full border border-[#cfe2ed] bg-[#f4f9fc] px-4 py-2 text-[10px] font-black uppercase tracking-[.08em] text-[#58788f]">
                {guesses.length}/{MAX_GUESSES} intentos
              </span>
            </div>

            <div className="space-y-2.5">
              {rows.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="mx-auto grid gap-2"
                  style={{ gridTemplateColumns: "repeat(" + answer.length + ", minmax(0, 1fr))" }}
                >
                  {Array.from({ length: answer.length }, (_, index) => {
                    const letter = row.value[index] || "";
                    const state = row.states[index];

                    return (
                      <div
                        key={index}
                        className={
                          "flex aspect-square max-h-[72px] min-h-[42px] items-center justify-center rounded-[12px] border-2 text-[clamp(1rem,3vw,2rem)] font-black transition " +
                          tileClass(state)
                        }
                      >
                        {letter}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="mt-7 space-y-2">
              {KEYBOARD.map((row) => (
                <div key={row} className="flex justify-center gap-1.5">
                  {row.split("").map((letter) => {
                    const state = keyboardStates.get(letter);
                    return (
                      <button
                        key={letter}
                        type="button"
                        onClick={() => pressKey(letter)}
                        className={
                          "min-h-11 min-w-[32px] flex-1 rounded-[8px] px-1 text-[11px] font-black transition sm:min-w-[42px] sm:flex-none sm:px-3 " +
                          tileClass(state)
                        }
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
              ))}

              <div className="flex justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => pressKey("BACKSPACE")}
                  className="min-h-11 rounded-[8px] border border-[#c5dce8] bg-[#eef6fa] px-4 text-[10px] font-black uppercase text-[#102f55]"
                >
                  Borrar
                </button>
                <button
                  type="button"
                  onClick={() => pressKey("ENTER")}
                  className="min-h-11 rounded-[8px] bg-[#102f55] px-5 text-[10px] font-black uppercase text-white"
                >
                  Enviar
                </button>
              </div>
            </div>

            {message ? (
              <div className="mt-6 rounded-[14px] border border-[#c9e3f1] bg-[#f3f9fc] px-4 py-3 text-center text-[12px] font-black text-[#102f55]">
                {message}
              </div>
            ) : null}
          </div>
        </div>

        <aside className="space-y-5">
          <section className="rounded-[24px] border border-[#c9e3f1] bg-white p-6">
            <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#168fd4]">
              Cómo jugar
            </p>
            <div className="mt-5 space-y-4 text-[12px] font-semibold leading-5 text-[#617f93]">
              <p>Tenés seis intentos para descubrir la palabra del día.</p>
              <p><strong className="text-[#168fd4]">Celeste:</strong> letra correcta en la posición correcta.</p>
              <p><strong className="text-[#c08c15]">Dorado:</strong> la letra existe, pero está en otra posición.</p>
              <p><strong className="text-[#667e8e]">Gris:</strong> la letra no forma parte de la palabra.</p>
            </div>
          </section>

          <section className="rounded-[24px] bg-[#102f55] p-6 text-white">
            <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#80d1f4]">
              Pista de hoy
            </p>
            <p className="mt-4 text-[18px] font-black leading-6 text-white">
              {answerEntry?.hint || "Está relacionada con Liga."}
            </p>
          </section>

          <Link
            href="/entretenimiento"
            className="flex min-h-12 items-center justify-center rounded-xl border border-[#bcd9e8] bg-white px-5 text-[11px] font-black uppercase tracking-[.05em] text-[#102f55]"
          >
            Volver a entretenimiento
          </Link>
        </aside>
      </section>
    </main>
  );
}
