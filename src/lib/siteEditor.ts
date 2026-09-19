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
  | "news.content"
  | "awards.heading"
  | "awards.cards"
  | "competitions.heading"
  | "competitions.cards"
  | "match.content"
  | "stats.cards"
  | "community.heading"
  | "community.button";

export type ElementStyle = {
  visible: boolean;
  background: string;
  color: string;
  width: ResponsiveValue<number>;
  maxWidth: ResponsiveValue<number>;
  paddingX: ResponsiveValue<number>;
  paddingY: ResponsiveValue<number>;
  marginTop: ResponsiveValue<number>;
  marginBottom: ResponsiveValue<number>;
  translateX: ResponsiveValue<number>;
  translateY: ResponsiveValue<number>;
  scale: ResponsiveValue<number>;
  rotate: ResponsiveValue<number>;
  radius: ResponsiveValue<number>;
  borderWidth: number;
  borderColor: string;
  shadow: string;
  opacity: number;
  fontSize: ResponsiveValue<number>;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
  textAlign: "left" | "center" | "right";
};

export type HomeEditorDocument = {
  schemaVersion: 3;
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
  elements: Record<HomeEditorElementId, ElementStyle>;
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

export const HOME_SECTION_ELEMENTS: Record<HomeSectionId, HomeEditorElementId[]> = {
  hero: ["hero.title"],
  news: ["news.content"],
  awards: ["awards.heading", "awards.cards"],
  competitions: ["competitions.heading", "competitions.cards"],
  match: ["match.content"],
  stats: [],
  community: [],
};

export const HOME_ELEMENT_LABELS: Record<HomeEditorElementId, string> = {
  "hero.eyebrow": "Etiqueta",
  "hero.title": "Título principal",
  "hero.subtitle": "Subtítulo",
  "hero.primaryButton": "Botón principal",
  "hero.secondaryButton": "Botón secundario",
  "hero.cards": "Tarjetas del Hero",
  "news.content": "Noticias y tabla",
  "awards.heading": "Encabezado de premios",
  "awards.cards": "Tarjetas de premios",
  "competitions.heading": "Encabezado de competiciones",
  "competitions.cards": "Contenido de competiciones",
  "match.content": "Lista de próximos partidos",
  "stats.cards": "Tarjetas de estadísticas",
  "community.heading": "Texto de comunidad",
  "community.button": "Botón de comunidad",
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

const defaultElement = (): ElementStyle => ({
  visible: true,
  background: "transparent",
  color: "inherit",
  width: responsive(100),
  maxWidth: responsive(9999),
  paddingX: responsive(0),
  paddingY: responsive(0),
  marginTop: responsive(0),
  marginBottom: responsive(0),
  translateX: responsive(0),
  translateY: responsive(0),
  scale: responsive(1),
  rotate: responsive(0),
  radius: responsive(0),
  borderWidth: 0,
  borderColor: "transparent",
  shadow: "none",
  opacity: 1,
  fontSize: responsive(0),
  fontWeight: 0,
  lineHeight: 0,
  letterSpacing: 0,
  textTransform: "none",
  textAlign: "left",
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

const elementDefaults = Object.fromEntries(
  (Object.values(HOME_SECTION_ELEMENTS).flat() as HomeEditorElementId[]).map((id) => [id, defaultElement()]),
) as Record<HomeEditorElementId, ElementStyle>;

elementDefaults["hero.title"].fontSize = responsive(72, 58, 42);
elementDefaults["hero.title"].fontWeight = 900;
elementDefaults["hero.title"].lineHeight = 0.9;
elementDefaults["hero.title"].letterSpacing = -0.05;
elementDefaults["hero.subtitle"].fontSize = responsive(18, 17, 15);
elementDefaults["hero.subtitle"].fontWeight = 500;
elementDefaults["hero.subtitle"].lineHeight = 1.55;
elementDefaults["hero.eyebrow"].fontSize = responsive(10, 10, 9);
elementDefaults["hero.eyebrow"].fontWeight = 900;
elementDefaults["hero.eyebrow"].letterSpacing = 0.2;
elementDefaults["hero.cards"].maxWidth = responsive(420, 9999, 9999);
elementDefaults["community.button"].width = responsive(100, 100, 100);

export const DEFAULT_HOME_EDITOR_DOCUMENT: HomeEditorDocument = {
  schemaVersion: 3,
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
  elements: elementDefaults,
  hero: {
    eyebrow: "Liga APA PSO",
    title: "APA PSO ARGENTINA",
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

function normalizeElement(value: unknown, fallback: ElementStyle): ElementStyle {
  const current = value && typeof value === "object" ? (value as Partial<ElementStyle>) : {};
  return {
    ...fallback,
    ...current,
    width: responsiveNumber(current.width, fallback.width),
    maxWidth: responsiveNumber(current.maxWidth, fallback.maxWidth),
    paddingX: responsiveNumber(current.paddingX, fallback.paddingX),
    paddingY: responsiveNumber(current.paddingY, fallback.paddingY),
    marginTop: responsiveNumber(current.marginTop, fallback.marginTop),
    marginBottom: responsiveNumber(current.marginBottom, fallback.marginBottom),
    translateX: responsiveNumber(current.translateX, fallback.translateX),
    translateY: responsiveNumber(current.translateY, fallback.translateY),
    scale: responsiveNumber(current.scale, fallback.scale),
    rotate: responsiveNumber(current.rotate, fallback.rotate),
    radius: responsiveNumber(current.radius, fallback.radius),
    fontSize: responsiveNumber(current.fontSize, fallback.fontSize),
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

  const elements = { ...base.elements };
  for (const id of Object.keys(base.elements) as HomeEditorElementId[]) {
    elements[id] = normalizeElement(input.elements?.[id], base.elements[id]);
  }

  if (input.hero?.title === "El fútbol de APA, en un solo lugar") {
    input.hero = { ...input.hero, title: "APA PSO ARGENTINA" };
  }

  return {
    ...base,
    ...input,
    schemaVersion: 3,
    pageKey: "home",
    order,
    global: {
      ...base.global,
      ...(input.global || {}),
      sectionGap: responsiveNumber(input.global?.sectionGap, base.global.sectionGap),
    },
    sections,
    elements,
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

export function elementInlineStyle(style: ElementStyle, breakpoint: EditorBreakpoint) {
  const fontSize = valueForBreakpoint(style.fontSize, breakpoint);
  return {
    display: style.visible ? undefined : "none",
    background: style.background === "transparent" ? undefined : style.background,
    color: style.color === "inherit" ? undefined : style.color,
    width: `${Math.max(1, Math.min(100, valueForBreakpoint(style.width, breakpoint)))}%`,
    maxWidth: `${valueForBreakpoint(style.maxWidth, breakpoint)}px`,
    paddingLeft: valueForBreakpoint(style.paddingX, breakpoint),
    paddingRight: valueForBreakpoint(style.paddingX, breakpoint),
    paddingTop: valueForBreakpoint(style.paddingY, breakpoint),
    paddingBottom: valueForBreakpoint(style.paddingY, breakpoint),
    marginTop: valueForBreakpoint(style.marginTop, breakpoint),
    marginBottom: valueForBreakpoint(style.marginBottom, breakpoint),
    borderRadius: valueForBreakpoint(style.radius, breakpoint),
    border: style.borderWidth ? `${style.borderWidth}px solid ${style.borderColor}` : undefined,
    boxShadow: style.shadow === "none" ? undefined : style.shadow,
    opacity: style.opacity,
    transform: `translate(${valueForBreakpoint(style.translateX, breakpoint)}px, ${valueForBreakpoint(style.translateY, breakpoint)}px) scale(${valueForBreakpoint(style.scale, breakpoint)}) rotate(${valueForBreakpoint(style.rotate, breakpoint)}deg)`,
    transformOrigin: "center",
    fontSize: fontSize > 0 ? `${fontSize}px` : undefined,
    fontWeight: style.fontWeight > 0 ? style.fontWeight : undefined,
    lineHeight: style.lineHeight > 0 ? style.lineHeight : undefined,
    letterSpacing: style.letterSpacing !== 0 ? `${style.letterSpacing}em` : undefined,
    textTransform: style.textTransform,
    textAlign: style.textAlign,
  } as const;
}
