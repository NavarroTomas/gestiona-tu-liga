export type SeasonThemeKey = "world_cup" | "champions" | "libertadores" | "default";

export type SeasonTheme = {
  activeSeason: string;
  key: SeasonThemeKey;
  label: string;
  shortLabel: string;
  heroTitle: string;
  heroSubtitle: string;
  badge: string;
  icon: string;
  background: string;
  panel: string;
  card: string;
  border: string;
  glow: string;
  accentText: string;
  softText: string;
  primaryButton: string;
  flags: string[];
  floatingIcons: string[];
};

export const seasonThemes: Record<SeasonThemeKey, SeasonTheme> = {
  world_cup: {
    activeSeason: "Temporada 4",
    key: "world_cup",
    label: "World Cup Edition",
    shortLabel: "T4 World Cup",
    heroTitle: "APA PSO World Cup Edition",
    heroSubtitle: "Una temporada con estética mundialista: gloria, banderas, copa y camino al campeón.",
    badge: "🏆 Temporada 4 · Mundial",
    icon: "🌎",
    background:
      "bg-[radial-gradient(circle_at_top,#123a7a_0%,#07152b_28%,#020714_58%,#000_100%)]",
    panel:
      "relative overflow-hidden rounded-[38px] border border-yellow-400/25 bg-[#020714] shadow-[0_0_55px_rgba(250,204,21,.12)]",
    card:
      "rounded-[28px] border border-yellow-400/20 bg-black/35 shadow-[0_0_28px_rgba(250,204,21,.08)]",
    border: "border-yellow-400/25",
    glow: "shadow-[0_0_45px_rgba(250,204,21,.16)]",
    accentText: "text-yellow-300",
    softText: "text-sky-300",
    primaryButton:
      "rounded-2xl border border-yellow-400/35 bg-yellow-400 px-5 py-3 text-sm font-black uppercase text-black transition hover:bg-white",
    flags: ["🇦🇷", "🇧🇷", "🇪🇸", "🇫🇷", "🇩🇪", "🇺🇾", "🇵🇹", "🇳🇱", "🇯🇵", "🇲🇽"],
    floatingIcons: ["🏆", "⚽", "🌎", "🏟️", "🥇"],
  },

  champions: {
    activeSeason: "Temporada 5",
    key: "champions",
    label: "Champions Edition",
    shortLabel: "T5 Champions",
    heroTitle: "APA PSO Champions Edition",
    heroSubtitle: "Luces europeas, noches grandes y camino a la orejona.",
    badge: "⭐ Temporada 5 · Champions",
    icon: "⭐",
    background:
      "bg-[radial-gradient(circle_at_top,#172554_0%,#090d24_32%,#02040f_62%,#000_100%)]",
    panel:
      "relative overflow-hidden rounded-[38px] border border-blue-400/25 bg-[#020714] shadow-[0_0_55px_rgba(96,165,250,.12)]",
    card:
      "rounded-[28px] border border-blue-400/20 bg-black/35 shadow-[0_0_28px_rgba(96,165,250,.08)]",
    border: "border-blue-400/25",
    glow: "shadow-[0_0_45px_rgba(96,165,250,.16)]",
    accentText: "text-blue-300",
    softText: "text-indigo-300",
    primaryButton:
      "rounded-2xl border border-blue-400/35 bg-blue-400 px-5 py-3 text-sm font-black uppercase text-black transition hover:bg-white",
    flags: ["⭐", "💙", "🏟️", "🌙", "✨"],
    floatingIcons: ["⭐", "🏆", "🌙", "✨", "🏟️"],
  },

  libertadores: {
    activeSeason: "Temporada 6",
    key: "libertadores",
    label: "Libertadores Edition",
    shortLabel: "T6 Libertadores",
    heroTitle: "APA PSO Libertadores Edition",
    heroSubtitle: "Mística sudamericana, noche copera y gloria eterna.",
    badge: "🔥 Temporada 6 · Libertadores",
    icon: "🔥",
    background:
      "bg-[radial-gradient(circle_at_top,#7f1d1d_0%,#1f0b0b_32%,#070202_62%,#000_100%)]",
    panel:
      "relative overflow-hidden rounded-[38px] border border-red-400/25 bg-[#080202] shadow-[0_0_55px_rgba(248,113,113,.12)]",
    card:
      "rounded-[28px] border border-red-400/20 bg-black/35 shadow-[0_0_28px_rgba(248,113,113,.08)]",
    border: "border-red-400/25",
    glow: "shadow-[0_0_45px_rgba(248,113,113,.16)]",
    accentText: "text-red-300",
    softText: "text-orange-300",
    primaryButton:
      "rounded-2xl border border-red-400/35 bg-red-400 px-5 py-3 text-sm font-black uppercase text-black transition hover:bg-white",
    flags: ["🇦🇷", "🇧🇷", "🇺🇾", "🇨🇱", "🇨🇴", "🇵🇾", "🇵🇪", "🇪🇨"],
    floatingIcons: ["🔥", "🏆", "🥁", "🏟️", "⚽"],
  },

  default: {
    activeSeason: "Temporada 4",
    key: "default",
    label: "APA Edition",
    shortLabel: "APA",
    heroTitle: "APA PSO Argentina",
    heroSubtitle: "Competición, estadísticas y comunidad.",
    badge: "APA PSO",
    icon: "⚽",
    background:
      "bg-[radial-gradient(circle_at_top,#123a7a_0%,#081427_24%,#020714_55%,#000_100%)]",
    panel:
      "relative overflow-hidden rounded-[38px] border border-sky-500/25 bg-[#020714] shadow-[0_0_55px_rgba(56,189,248,.12)]",
    card:
      "rounded-[28px] border border-sky-400/20 bg-black/35 shadow-[0_0_28px_rgba(56,189,248,.08)]",
    border: "border-sky-400/25",
    glow: "shadow-[0_0_45px_rgba(56,189,248,.16)]",
    accentText: "text-sky-300",
    softText: "text-yellow-300",
    primaryButton:
      "rounded-2xl border border-sky-400/35 bg-sky-400 px-5 py-3 text-sm font-black uppercase text-black transition hover:bg-white",
    flags: ["⚽", "🏆", "⭐"],
    floatingIcons: ["⚽", "🏆", "⭐"],
  },
};

export const activeSeasonTheme = seasonThemes.world_cup;

export function getSeasonTheme() {
  return activeSeasonTheme;
}
