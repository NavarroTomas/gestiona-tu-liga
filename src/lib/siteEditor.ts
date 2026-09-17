export type HomeSectionId =
  | "hero"
  | "news"
  | "awards"
  | "competitions"
  | "match"
  | "stats"
  | "community";

export type ResponsiveValue<T> = {
  desktop: T;
  tablet?: T;
  mobile?: T;
};

export type SectionState = {
  visible: boolean;
};

export type HomeEditorDocument = {
  schemaVersion: 1;
  pageKey: "home";
  order: HomeSectionId[];
  sections: Record<HomeSectionId, SectionState>;
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryLabel: string;
    secondaryLabel: string;
    background: string;
    textColor: string;
    radius: ResponsiveValue<number>;
    paddingY: ResponsiveValue<number>;
    cardRadius: number;
    cardBackground: string;
  };
  awards: {
    eyebrow: string;
    title: string;
    linkLabel: string;
    background: string;
    textColor: string;
    radius: ResponsiveValue<number>;
    padding: ResponsiveValue<number>;
    cardRadius: number;
    cardPadding: number;
    cardMinHeight: number;
  };
  competitions: {
    eyebrow: string;
    title: string;
    linkLabel: string;
    titleColor: string;
    accentColor: string;
    cardBackground: string;
    cardRadius: number;
    cardPadding: number;
    cardMinHeight: number;
  };
  stats: {
    background: string;
    textColor: string;
    radius: number;
    cardPadding: number;
  };
  community: {
    eyebrow: string;
    title: string;
    buttonLabel: string;
    background: string;
    textColor: string;
    radius: number;
    padding: number;
  };
};

export const DEFAULT_HOME_EDITOR_DOCUMENT: HomeEditorDocument = {
  schemaVersion: 1,
  pageKey: "home",
  order: ["hero", "news", "awards", "competitions", "match", "stats", "community"],
  sections: {
    hero: { visible: true },
    news: { visible: true },
    awards: { visible: true },
    competitions: { visible: true },
    match: { visible: true },
    stats: { visible: true },
    community: { visible: true },
  },
  hero: {
    eyebrow: "Liga APA PSO",
    title: "El fútbol de APA, en un solo lugar",
    subtitle: "Competencias, resultados, clubes, premios y actualidad oficial.",
    primaryLabel: "Ver competición",
    secondaryLabel: "Ver fixture",
    background: "#0b2747",
    textColor: "#ffffff",
    radius: { desktop: 30, tablet: 28, mobile: 22 },
    paddingY: { desktop: 64, tablet: 56, mobile: 44 },
    cardRadius: 16,
    cardBackground: "rgba(255,255,255,0.07)",
  },
  awards: {
    eyebrow: "Temporada actual",
    title: "Premios APA",
    linkLabel: "Ver todos →",
    background: "#0b2747",
    textColor: "#ffffff",
    radius: { desktop: 28, tablet: 26, mobile: 20 },
    padding: { desktop: 24, tablet: 22, mobile: 18 },
    cardRadius: 16,
    cardPadding: 16,
    cardMinHeight: 0,
  },
  competitions: {
    eyebrow: "Temporada",
    title: "Competiciones",
    linkLabel: "Ver todas →",
    titleColor: "#0b2747",
    accentColor: "#245f8e",
    cardBackground: "#ffffff",
    cardRadius: 16,
    cardPadding: 16,
    cardMinHeight: 0,
  },
  stats: {
    background: "#0b2747",
    textColor: "#ffffff",
    radius: 16,
    cardPadding: 20,
  },
  community: {
    eyebrow: "Comunidad APA",
    title: "Unite a la comunidad",
    buttonLabel: "Discord →",
    background: "#102f55",
    textColor: "#ffffff",
    radius: 24,
    padding: 24,
  },
};

function responsiveNumber(value: unknown, fallback: ResponsiveValue<number>): ResponsiveValue<number> {
  if (!value || typeof value !== "object") return fallback;
  const current = value as Partial<ResponsiveValue<number>>;
  return {
    desktop: typeof current.desktop === "number" ? current.desktop : fallback.desktop,
    tablet: typeof current.tablet === "number" ? current.tablet : fallback.tablet,
    mobile: typeof current.mobile === "number" ? current.mobile : fallback.mobile,
  };
}

export function normalizeHomeEditorDocument(value: unknown): HomeEditorDocument {
  if (!value || typeof value !== "object") return structuredClone(DEFAULT_HOME_EDITOR_DOCUMENT);
  const input = value as Partial<HomeEditorDocument>;
  const base = structuredClone(DEFAULT_HOME_EDITOR_DOCUMENT);
  const order = Array.isArray(input.order)
    ? input.order.filter((item): item is HomeSectionId => base.order.includes(item as HomeSectionId))
    : base.order;
  for (const id of base.order) if (!order.includes(id)) order.push(id);

  return {
    ...base,
    ...input,
    schemaVersion: 1,
    pageKey: "home",
    order,
    sections: {
      ...base.sections,
      ...(input.sections || {}),
    },
    hero: {
      ...base.hero,
      ...(input.hero || {}),
      radius: responsiveNumber(input.hero?.radius, base.hero.radius),
      paddingY: responsiveNumber(input.hero?.paddingY, base.hero.paddingY),
    },
    awards: {
      ...base.awards,
      ...(input.awards || {}),
      radius: responsiveNumber(input.awards?.radius, base.awards.radius),
      padding: responsiveNumber(input.awards?.padding, base.awards.padding),
    },
    competitions: { ...base.competitions, ...(input.competitions || {}) },
    stats: { ...base.stats, ...(input.stats || {}) },
    community: { ...base.community, ...(input.community || {}) },
  };
}

export function valueForBreakpoint<T>(value: ResponsiveValue<T>, breakpoint: "desktop" | "tablet" | "mobile") {
  return value[breakpoint] ?? value.tablet ?? value.desktop;
}
