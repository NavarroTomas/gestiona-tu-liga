export type UniversalBreakpoint = "desktop" | "tablet" | "mobile";

export type UniversalElementStyle = {
  color?: string;
  background?: string;
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?: "left" | "center" | "right" | "justify";
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  width?: number;
  maxWidth?: number;
  minHeight?: number;
  paddingX?: number;
  paddingY?: number;
  marginTop?: number;
  marginBottom?: number;
  radius?: number;
  borderWidth?: number;
  borderColor?: string;
  opacity?: number;
  translateX?: number;
  translateY?: number;
  scale?: number;
  rotate?: number;
  shadow?: string;
  display?: string;
};

export type UniversalElementRule = {
  selector: string;
  label: string;
  tagName: string;
  text?: string;
  href?: string;
  src?: string;
  removed?: boolean;
  styles: Record<UniversalBreakpoint, UniversalElementStyle>;
};

export type UniversalEditorDocument = {
  kind: "universal";
  version: 1;
  pageKey: string;
  route: string;
  rules: Record<string, UniversalElementRule>;
  page: { background?: string; fontFamily?: string };
};

export type SiteEditorPageDefinition = {
  key: string;
  label: string;
  route: string;
  group: "General" | "Competición" | "Entretenimiento" | "Contenido" | "Plantillas";
  specialized?: boolean;
};

export const SITE_EDITOR_PAGES: SiteEditorPageDefinition[] = [
  { key: "home", label: "Inicio", route: "/", group: "General", specialized: true },
  { key: "clubes", label: "Clubes", route: "/clubes", group: "General" },
  { key: "equipos", label: "Equipos", route: "/equipos", group: "General" },
  { key: "equipo-template", label: "Interior de club", route: "/equipos/Club%20Atl%C3%A9tico%20River%20Plate", group: "Plantillas" },
  { key: "competicion", label: "Competición", route: "/competicion", group: "Competición" },
  { key: "fixture", label: "Fixture", route: "/fixture", group: "Competición" },
  { key: "estadisticas", label: "Estadísticas", route: "/estadisticas", group: "Competición" },
  { key: "divisiones", label: "Divisiones", route: "/divisiones", group: "Competición" },
  { key: "jugadores", label: "Jugadores", route: "/jugadores", group: "General" },
  { key: "mercado", label: "Mercado", route: "/mercado", group: "General" },
  { key: "noticias", label: "Noticias", route: "/noticias", group: "Contenido" },
  { key: "entretenimiento", label: "Entretenimiento", route: "/entretenimiento", group: "Entretenimiento" },
  { key: "dream-team", label: "Dream Team", route: "/entretenimiento/dream-team", group: "Entretenimiento" },
  { key: "predicciones", label: "Predicciones", route: "/entretenimiento/predicciones", group: "Entretenimiento" },
  { key: "predicciones-ranking", label: "Ranking predicciones", route: "/entretenimiento/predicciones/ranking", group: "Entretenimiento" },
  { key: "premios", label: "Premios", route: "/entretenimiento/premios", group: "Entretenimiento" },
  { key: "contacto", label: "Contacto", route: "/contacto", group: "Contenido" },
];

export function getSiteEditorPage(key: string) {
  return SITE_EDITOR_PAGES.find((page) => page.key === key) ?? null;
}

export function createUniversalDocument(pageKey: string, route: string): UniversalEditorDocument {
  return { kind: "universal", version: 1, pageKey, route, rules: {}, page: {} };
}

export function normalizeUniversalDocument(value: unknown, pageKey: string, route: string): UniversalEditorDocument {
  const source = value && typeof value === "object" ? value as Partial<UniversalEditorDocument> : {};
  if (source.kind !== "universal") return createUniversalDocument(pageKey, route);
  return {
    kind: "universal",
    version: 1,
    pageKey,
    route,
    rules: source.rules && typeof source.rules === "object" ? source.rules : {},
    page: source.page && typeof source.page === "object" ? source.page : {},
  };
}

export function pageKeyForPathname(pathname: string): string | null {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/equipos/") && pathname !== "/equipos") return "equipo-template";
  const exact = SITE_EDITOR_PAGES.find((page) => !page.specialized && page.route === pathname);
  return exact?.key ?? null;
}

export function styleForBreakpoint(rule: UniversalElementRule, breakpoint: UniversalBreakpoint): UniversalElementStyle {
  return {
    ...rule.styles.desktop,
    ...(breakpoint === "tablet" ? rule.styles.tablet : {}),
    ...(breakpoint === "mobile" ? rule.styles.tablet : {}),
    ...(breakpoint === "mobile" ? rule.styles.mobile : {}),
  };
}

export function styleToCss(style: UniversalElementStyle): Record<string, string> {
  const css: Record<string, string> = {};
  if (style.color) css.color = style.color;
  if (style.background) css.background = style.background;
  if (style.fontSize !== undefined) css.fontSize = `${style.fontSize}px`;
  if (style.fontWeight !== undefined) css.fontWeight = String(style.fontWeight);
  if (style.lineHeight !== undefined) css.lineHeight = String(style.lineHeight);
  if (style.letterSpacing !== undefined) css.letterSpacing = `${style.letterSpacing}em`;
  if (style.textAlign) css.textAlign = style.textAlign;
  if (style.textTransform) css.textTransform = style.textTransform;
  if (style.width !== undefined) css.width = `${style.width}%`;
  if (style.maxWidth !== undefined) css.maxWidth = `${style.maxWidth}px`;
  if (style.minHeight !== undefined) css.minHeight = `${style.minHeight}px`;
  if (style.paddingX !== undefined) { css.paddingLeft = `${style.paddingX}px`; css.paddingRight = `${style.paddingX}px`; }
  if (style.paddingY !== undefined) { css.paddingTop = `${style.paddingY}px`; css.paddingBottom = `${style.paddingY}px`; }
  if (style.marginTop !== undefined) css.marginTop = `${style.marginTop}px`;
  if (style.marginBottom !== undefined) css.marginBottom = `${style.marginBottom}px`;
  if (style.radius !== undefined) css.borderRadius = `${style.radius}px`;
  if (style.borderWidth !== undefined) { css.borderWidth = `${style.borderWidth}px`; css.borderStyle = "solid"; }
  if (style.borderColor) css.borderColor = style.borderColor;
  if (style.opacity !== undefined) css.opacity = String(style.opacity);
  if (style.shadow) css.boxShadow = style.shadow;
  if (style.display) css.display = style.display;
  const transforms: string[] = [];
  if (style.translateX) transforms.push(`translateX(${style.translateX}px)`);
  if (style.translateY) transforms.push(`translateY(${style.translateY}px)`);
  if (style.scale !== undefined && style.scale !== 1) transforms.push(`scale(${style.scale})`);
  if (style.rotate) transforms.push(`rotate(${style.rotate}deg)`);
  if (transforms.length) css.transform = transforms.join(" ");
  return css;
}
