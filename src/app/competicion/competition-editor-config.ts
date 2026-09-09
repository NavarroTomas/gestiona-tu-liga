export const COMPETITION_EDITOR_STORAGE_KEY = "apa-competition-layout-v1";

export type CompetitionLayoutConfig = {
  season: {
    x: number;
    y: number;
    fontSize: number;
    opacity: number;
  };
  title: {
    x: number;
    y: number;
    fontSize: number;
    opacity: number;
  };
  line: {
    x: number;
    y: number;
    width: number;
    height: number;
    opacity: number;
  };
  menu: {
    x: number;
    y: number;
    width: number;
    minHeight: number;
    radius: number;
    opacity: number;
  };
  background: {
    x: number;
    y: number;
    scale: number;
    brightness: number;
    overlay: number;
  };
};

export const DEFAULT_COMPETITION_LAYOUT: CompetitionLayoutConfig = {
  season: {
    x: 50,
    y: 9,
    fontSize: 20,
    opacity: 1,
  },
  title: {
    x: 50,
    y: 16.5,
    fontSize: 64,
    opacity: 1,
  },
  line: {
    x: 50,
    y: 28,
    width: 94,
    height: 4,
    opacity: 1,
  },
  menu: {
    x: 50,
    y: 88,
    width: 96,
    minHeight: 116,
    radius: 19,
    opacity: 0.98,
  },
  background: {
    x: 50,
    y: 50,
    scale: 1,
    brightness: 1,
    overlay: 0.24,
  },
};

export function normalizeCompetitionLayout(
  value: Partial<CompetitionLayoutConfig> | null | undefined,
): CompetitionLayoutConfig {
  return {
    season: { ...DEFAULT_COMPETITION_LAYOUT.season, ...(value?.season || {}) },
    title: { ...DEFAULT_COMPETITION_LAYOUT.title, ...(value?.title || {}) },
    line: { ...DEFAULT_COMPETITION_LAYOUT.line, ...(value?.line || {}) },
    menu: { ...DEFAULT_COMPETITION_LAYOUT.menu, ...(value?.menu || {}) },
    background: {
      ...DEFAULT_COMPETITION_LAYOUT.background,
      ...(value?.background || {}),
    },
  };
}
