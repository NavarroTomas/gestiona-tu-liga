export type HomeSectionId =
  | "hero"
  | "news"
  | "awards"
  | "competitions"
  | "match"
  | "stats"
  | "community";

export type EditorBreakpoint = "desktop" | "tablet" | "mobile";
export type ResponsiveValue<T> = { desktop: T; tablet?: T; mobile?: T };

export type SectionState = {
  visible: boolean;
  background: string;
  textColor: string;
  radius: ResponsiveValue<number>;
  paddingY: ResponsiveValue<number>;
  paddingX: ResponsiveValue<number>;
  marginTop: ResponsiveValue<number>;
  marginBottom: ResponsiveValue<number>;
  borderWidth: number;
  borderColor: string;
  shadow: string;
};

export type TypographyStyle = {
  fontSize: ResponsiveValue<number>;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
  align: "left" | "center" | "right";
  color: string;
  maxWidth: ResponsiveValue<number>;
};

export type HomeEditorElementId =
  | "hero.eyebrow"
  | "hero.title"
  | "hero.subtitle"
  | "hero.primaryButton"
  | "hero.secondaryButton"
  | "hero.cards"
  | "awards.heading"
  | "competitions.heading"
  | "stats.cards"
  | "community.heading"
  | "community.button";

export type HomeEditorDocument = {
  schemaVersion: 2;
  pageKey: "home";
  order: HomeSectionId[];
  global: {
    pageBackground: string;
    contentMaxWidth: number;
    sectionGap: ResponsiveValue<number>;
    accentColor: string;
    fontFamily: string;
    animationEnabled: boolean;
  };
  sections: Record<HomeSectionId, SectionState>;
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryLabel: string;
    secondaryLabel: string;
    primaryHref: string;
    secondaryHref: string;
    background: string;
    backgroundImage: string;
    backgroundSize: "cover" | "contain" | "auto";
    backgroundPosition: string;
    overlayOpacity: number;
    textColor: string;
    radius: ResponsiveValue<number>;
    paddingY: ResponsiveValue<number>;
    cardRadius: number;
    cardBackground: string;
    cardBorderColor: string;
    cardGap: ResponsiveValue<number>;
    contentColumns: ResponsiveValue<number>;
    titleStyle: TypographyStyle;
    subtitleStyle: TypographyStyle;
    eyebrowStyle: TypographyStyle;
    buttonRadius: number;
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
    cardGap: number;
  };
  community: {
    eyebrow: string;
    title: string;
    buttonLabel: string;
    buttonHref: string;
    background: string;
    textColor: string;
    radius: number;
    padding: number;
  };
};

const responsive = (desktop: number, tablet = desktop, mobile = tablet): ResponsiveValue<number> => ({ desktop, tablet, mobile });

const defaultSection = (): SectionState => ({
  visible: true,
  background: "transparent",
  textColor: "inherit",
  radius: responsive(0),
  paddingY: responsive(0),
  paddingX: responsive(0),
  marginTop: responsive(0),
  marginBottom: responsive(0),
  borderWidth: 0,
  borderColor: "transparent",
  shadow: "none",
});

const typography = (
  size: ResponsiveValue<number>,
  weight: number,
  lineHeight: number,
  letterSpacing: number,
  color: string,
  maxWidth = responsive(900, 760, 360),
): TypographyStyle => ({
  fontSize: size,
  fontWeight: weight,
  lineHeight,
  letterSpacing,
  textTransform: "none",
  align: "left",
  color,
  maxWidth,
});

export const DEFAULT_HOME_EDITOR_DOCUMENT: HomeEditorDocument = {
  schemaVersion: 2,
  pageKey: "home",
  order: ["hero", "news", "awards", "competitions", "match", "stats", "community"],
  global: {
    pageBackground: "#f5f6f8",
    contentMaxWidth: 1500,
    sectionGap: responsive(24, 22, 18),
    accentColor: "#3ea6e8",
    fontFamily: "inherit",
    animationEnabled: true,
  },
  sections: {
    hero: defaultSection(),
    news: defaultSection(),
    awards: defaultSection(),
    competitions: defaultSection(),
    match: defaultSection(),
    stats: defaultSection(),
    community: defaultSection(),
  },
  hero: {
    eyebrow: "Liga APA PSO",
    title: "El fútbol de APA, en un solo lugar",
    subtitle: "Competencias, resultados, clubes, premios y actualidad oficial.",
    primaryLabel: "Ver competición",
    secondaryLabel: "Ver fixture",
    primaryHref: "/competicion",
    secondaryHref: "/fixture",
    background: "#0b2747",
    backgroundImage: "",
    backgroundSize: "cover",
    backgroundPosition: "center",
    overlayOpacity: 0.18,
    textColor: "#ffffff",
    radius: responsive(30, 28, 22),
    paddingY: responsive(64, 56, 44),
    cardRadius: 16,
    cardBackground: "rgba(255,255,255,0.07)",
    cardBorderColor: "rgba(255,255,255,0.10)",
    cardGap: responsive(12, 10, 8),
    contentColumns: responsive(2, 1, 1),
    titleStyle: typography(responsive(72, 58, 42), 900, 0.9, -0.05, "#ffffff"),
    subtitleStyle: typography(responsive(18, 17, 15), 500, 1.55, 0, "rgba(255,255,255,.72)", responsive(680, 640, 340)),
    eyebrowStyle: typography(responsive(10, 10, 9), 900, 1.2, 0.2, "#ffffff", responsive(400, 360, 320)),
    buttonRadius: 12,
  },
  awards: {
    eyebrow: "Temporada actual",
    title: "Premios APA",
    linkLabel: "Ver todos →",
    background: "#0b2747",
    textColor: "#ffffff",
    radius: responsive(28, 26, 20),
    padding: responsive(24, 22, 18),
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
    cardGap: 12,
  },
  community: {
    eyebrow: "Comunidad APA",
    title: "Unite a la comunidad",
    buttonLabel: "Discord →",
    buttonHref: "https://discord.com",
    background: "#102f55",
    textColor: "#ffffff",
    radius: 24,
    padding: 24,
  },
};

function responsiveNumber(value: unknown, fallback: ResponsiveValue<number>): ResponsiveValue<number> {
  if (!value || typeof value !== "object") return { ...fallback };
  const current = value as Partial<ResponsiveValue<number>>;
  return {
    desktop: typeof current.desktop === "number" ? current.desktop : fallback.desktop,
    tablet: typeof current.tablet === "number" ? current.tablet : fallback.tablet,
    mobile: typeof current.mobile === "number" ? current.mobile : fallback.mobile,
  };
}

function normalizeTypography(value: unknown, fallback: TypographyStyle): TypographyStyle {
  const current = value && typeof value === "object" ? (value as Partial<TypographyStyle>) : {};
  return {
    ...fallback,
    ...current,
    fontSize: responsiveNumber(current.fontSize, fallback.fontSize),
    maxWidth: responsiveNumber(current.maxWidth, fallback.maxWidth),
  };
}

function normalizeSection(value: unknown, fallback: SectionState): SectionState {
  const current = value && typeof value === "object" ? (value as Partial<SectionState>) : {};
  return {
    ...fallback,
    ...current,
    radius: responsiveNumber(current.radius, fallback.radius),
    paddingY: responsiveNumber(current.paddingY, fallback.paddingY),
    paddingX: responsiveNumber(current.paddingX, fallback.paddingX),
    marginTop: responsiveNumber(current.marginTop, fallback.marginTop),
    marginBottom: responsiveNumber(current.marginBottom, fallback.marginBottom),
  };
}

export function normalizeHomeEditorDocument(value: unknown): HomeEditorDocument {
  if (!value || typeof value !== "object") return structuredClone(DEFAULT_HOME_EDITOR_DOCUMENT);
  const input = value as Partial<HomeEditorDocument> & { schemaVersion?: number };
  const base = structuredClone(DEFAULT_HOME_EDITOR_DOCUMENT);
  const order = Array.isArray(input.order)
    ? input.order.filter((item): item is HomeSectionId => base.order.includes(item as HomeSectionId))
    : [...base.order];
  for (const id of base.order) if (!order.includes(id)) order.push(id);

  const sections = { ...base.sections };
  for (const id of base.order) sections[id] = normalizeSection(input.sections?.[id], base.sections[id]);

  return {
    ...base,
    ...input,
    schemaVersion: 2,
    pageKey: "home",
    order,
    global: {
      ...base.global,
      ...(input.global || {}),
      sectionGap: responsiveNumber(input.global?.sectionGap, base.global.sectionGap),
    },
    sections,
    hero: {
      ...base.hero,
      ...(input.hero || {}),
      radius: responsiveNumber(input.hero?.radius, base.hero.radius),
      paddingY: responsiveNumber(input.hero?.paddingY, base.hero.paddingY),
      cardGap: responsiveNumber(input.hero?.cardGap, base.hero.cardGap),
      contentColumns: responsiveNumber(input.hero?.contentColumns, base.hero.contentColumns),
      titleStyle: normalizeTypography(input.hero?.titleStyle, base.hero.titleStyle),
      subtitleStyle: normalizeTypography(input.hero?.subtitleStyle, base.hero.subtitleStyle),
      eyebrowStyle: normalizeTypography(input.hero?.eyebrowStyle, base.hero.eyebrowStyle),
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

export function valueForBreakpoint<T>(value: ResponsiveValue<T>, breakpoint: EditorBreakpoint): T {
  if (breakpoint === "mobile") return value.mobile ?? value.tablet ?? value.desktop;
  if (breakpoint === "tablet") return value.tablet ?? value.desktop;
  return value.desktop;
}

export function setResponsiveValue<T>(value: ResponsiveValue<T>, breakpoint: EditorBreakpoint, next: T): ResponsiveValue<T> {
  return { ...value, [breakpoint]: next };
}
