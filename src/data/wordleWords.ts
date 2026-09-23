export type ApaWordleEntry = {
  word: string;
  category: string;
  hint?: string;
};

/**
 * Banco inicial de palabras para APA Wordle.
 *
 * Reglas para agregar las ~200 palabras definitivas:
 * - usar una sola palabra, sin espacios;
 * - entre 4 y 10 letras;
 * - se aceptan tildes y ñ: el juego las normaliza para comparar;
 * - category y hint son opcionales a nivel conceptual, pero ayudan a darle identidad APA.
 *
 * Esta lista es provisoria. Se puede reemplazar completa cuando el staff entregue
 * el banco oficial.
 */
export const APA_WORDLE_WORDS: ApaWordleEntry[] = [
  { word: "COPA", category: "Competición", hint: "Trofeo y formato eliminatorio." },
  { word: "LIGA", category: "Competición", hint: "Formato regular por fechas." },
  { word: "CLUB", category: "Comunidad", hint: "La identidad competitiva de cada equipo." },
  { word: "GOL", category: "Partido", hint: "Lo que todos buscan durante los 90 minutos." },
  { word: "PASE", category: "Partido", hint: "Conecta a dos compañeros." },
  { word: "MIX", category: "Comunidad", hint: "Partido armado entre jugadores de la comunidad." },
  { word: "MVP", category: "Premios", hint: "Reconoce a la figura destacada." },
  { word: "FINAL", category: "Competición", hint: "El partido que define un título." },
  { word: "TABLA", category: "Liga", hint: "Ordena a los equipos por rendimiento." },
  { word: "FECHA", category: "Liga", hint: "Cada jornada del calendario." },
  { word: "PLANTEL", category: "Clubes", hint: "Conjunto de jugadores de un club." },
  { word: "CAPITAN", category: "Clubes", hint: "Referente dentro del equipo." },
  { word: "ARQUERO", category: "Posiciones", hint: "Defiende el arco." },
  { word: "DEFENSA", category: "Posiciones", hint: "Protege la zona más cercana al arco." },
  { word: "VOLANTE", category: "Posiciones", hint: "Conecta defensa y ataque." },
  { word: "DELANTERO", category: "Posiciones", hint: "La principal amenaza ofensiva." },
  { word: "ASCENSO", category: "Liga", hint: "Objetivo principal de los mejores de Segunda." },
  { word: "DESCENSO", category: "Liga", hint: "Consecuencia deportiva de terminar abajo." },
  { word: "FIXTURE", category: "Competición", hint: "Calendario oficial de partidos." },
  { word: "TORNEO", category: "Competición", hint: "Estructura organizada de competencia." },
  { word: "PREMIO", category: "Comunidad", hint: "Reconocimiento por rendimiento." },
  { word: "EQUIPO", category: "Clubes", hint: "Ocho jugadores persiguiendo el mismo objetivo." },
  { word: "RIVAL", category: "Partido", hint: "El equipo que está enfrente." },
  { word: "JUGADOR", category: "Comunidad", hint: "La unidad básica de toda la liga." },
];

export function normalizeWordleWord(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/Ñ/g, "N")
    .replace(/ñ/g, "n")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase();
}
