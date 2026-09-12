export type TypographyRole = {
  family: string;
  weight: number;
  lineHeight: string;
  letterSpacing: string;
};

export type TypographyTheme = {
  id: string;
  name: string;
  intent: string;
  headingLabel: string;
  bodyLabel: string;
  heading: TypographyRole;
  body: TypographyRole;
};

export const TYPOGRAPHY_STORAGE_KEY = "apa-font-theme-v1";
export const DEFAULT_TYPOGRAPHY_THEME = "apa-moderno";

const FONT = {
  inter: 'var(--font-inter), Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  manrope: 'var(--font-manrope), Manrope, ui-sans-serif, system-ui, sans-serif',
  space: 'var(--font-space-grotesk), "Space Grotesk", ui-sans-serif, system-ui, sans-serif',
  archivo: 'var(--font-archivo), Archivo, ui-sans-serif, system-ui, sans-serif',
  montserrat: 'var(--font-montserrat), Montserrat, ui-sans-serif, system-ui, sans-serif',
  rajdhani: 'var(--font-rajdhani), Rajdhani, "Arial Narrow", Arial, sans-serif',
  lora: 'var(--font-lora), Lora, Georgia, "Times New Roman", serif',
  orbitron: 'var(--font-orbitron), Orbitron, ui-sans-serif, system-ui, sans-serif',
  system: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif',
  arial: 'Arial, Helvetica, sans-serif',
};

/**
 * 20 combinaciones tipográficas globales para APA.
 *
 * Cada tema controla H1-H3 y texto de lectura (P/LI) mediante variables CSS.
 * El selector global solo cambia `data-font-theme` en <html>, por lo que no
 * necesita recorrer el DOM ni recalcular estilos elemento por elemento.
 */
export const TYPOGRAPHY_THEMES: TypographyTheme[] = [
  {
    id: "apa-moderno",
    name: "APA Moderno",
    intent: "Deportivo, limpio y actual",
    headingLabel: "Space Grotesk",
    bodyLabel: "Inter",
    heading: { family: FONT.space, weight: 800, lineHeight: "0.98", letterSpacing: "-0.035em" },
    body: { family: FONT.inter, weight: 450, lineHeight: "1.62", letterSpacing: "0.004em" },
  },
  {
    id: "liga-editorial",
    name: "Liga Editorial",
    intent: "Estilo de competición oficial",
    headingLabel: "Archivo",
    bodyLabel: "Inter",
    heading: { family: FONT.archivo, weight: 800, lineHeight: "1", letterSpacing: "-0.03em" },
    body: { family: FONT.inter, weight: 450, lineHeight: "1.6", letterSpacing: "0.003em" },
  },
  {
    id: "minimal-claro",
    name: "Minimal Claro",
    intent: "Muy legible y neutral",
    headingLabel: "Manrope",
    bodyLabel: "Inter",
    heading: { family: FONT.manrope, weight: 800, lineHeight: "1.02", letterSpacing: "-0.032em" },
    body: { family: FONT.inter, weight: 400, lineHeight: "1.64", letterSpacing: "0.005em" },
  },
  {
    id: "corporativo",
    name: "Corporativo",
    intent: "Serio, estable y profesional",
    headingLabel: "Montserrat",
    bodyLabel: "Manrope",
    heading: { family: FONT.montserrat, weight: 800, lineHeight: "1.04", letterSpacing: "-0.022em" },
    body: { family: FONT.manrope, weight: 450, lineHeight: "1.62", letterSpacing: "0.002em" },
  },
  {
    id: "broadcast",
    name: "Broadcast Deportivo",
    intent: "Compacto y televisivo",
    headingLabel: "Rajdhani",
    bodyLabel: "Inter",
    heading: { family: FONT.rajdhani, weight: 700, lineHeight: "0.96", letterSpacing: "0.015em" },
    body: { family: FONT.inter, weight: 450, lineHeight: "1.58", letterSpacing: "0.004em" },
  },
  {
    id: "data-first",
    name: "Data First",
    intent: "Ideal para tablas y estadísticas",
    headingLabel: "Inter",
    bodyLabel: "Inter",
    heading: { family: FONT.inter, weight: 850, lineHeight: "1", letterSpacing: "-0.035em" },
    body: { family: FONT.inter, weight: 450, lineHeight: "1.56", letterSpacing: "0.002em" },
  },
  {
    id: "arena-bold",
    name: "Arena Bold",
    intent: "Titulares fuertes sin neón",
    headingLabel: "Archivo",
    bodyLabel: "Manrope",
    heading: { family: FONT.archivo, weight: 900, lineHeight: "0.94", letterSpacing: "-0.038em" },
    body: { family: FONT.manrope, weight: 450, lineHeight: "1.62", letterSpacing: "0.003em" },
  },
  {
    id: "geometrico",
    name: "Geométrico",
    intent: "Preciso y contemporáneo",
    headingLabel: "Montserrat",
    bodyLabel: "Inter",
    heading: { family: FONT.montserrat, weight: 750, lineHeight: "1", letterSpacing: "-0.025em" },
    body: { family: FONT.inter, weight: 425, lineHeight: "1.64", letterSpacing: "0.006em" },
  },
  {
    id: "premium",
    name: "Premium",
    intent: "Suave, amplio y elegante",
    headingLabel: "Manrope",
    bodyLabel: "Manrope",
    heading: { family: FONT.manrope, weight: 750, lineHeight: "1.02", letterSpacing: "-0.03em" },
    body: { family: FONT.manrope, weight: 425, lineHeight: "1.68", letterSpacing: "0.006em" },
  },
  {
    id: "compacto",
    name: "Compacto",
    intent: "Más información en menos espacio",
    headingLabel: "Rajdhani",
    bodyLabel: "Manrope",
    heading: { family: FONT.rajdhani, weight: 700, lineHeight: "0.95", letterSpacing: "0.02em" },
    body: { family: FONT.manrope, weight: 450, lineHeight: "1.52", letterSpacing: "0" },
  },
  {
    id: "editorial-clasico",
    name: "Editorial Clásico",
    intent: "Contraste entre historia y datos",
    headingLabel: "Lora",
    bodyLabel: "Inter",
    heading: { family: FONT.lora, weight: 700, lineHeight: "1.04", letterSpacing: "-0.018em" },
    body: { family: FONT.inter, weight: 425, lineHeight: "1.68", letterSpacing: "0.005em" },
  },
  {
    id: "archivo-moderno",
    name: "Archivo Moderno",
    intent: "Editorial y técnico",
    headingLabel: "Space Grotesk",
    bodyLabel: "Manrope",
    heading: { family: FONT.space, weight: 750, lineHeight: "0.99", letterSpacing: "-0.028em" },
    body: { family: FONT.manrope, weight: 425, lineHeight: "1.64", letterSpacing: "0.004em" },
  },
  {
    id: "institucional",
    name: "Institucional",
    intent: "Formal sin sentirse antiguo",
    headingLabel: "Archivo",
    bodyLabel: "Montserrat",
    heading: { family: FONT.archivo, weight: 800, lineHeight: "1.01", letterSpacing: "-0.022em" },
    body: { family: FONT.montserrat, weight: 450, lineHeight: "1.64", letterSpacing: "0.003em" },
  },
  {
    id: "high-contrast",
    name: "Alto Contraste",
    intent: "Títulos muy marcados y texto calmo",
    headingLabel: "Rajdhani",
    bodyLabel: "Manrope",
    heading: { family: FONT.rajdhani, weight: 700, lineHeight: "0.92", letterSpacing: "0.035em" },
    body: { family: FONT.manrope, weight: 425, lineHeight: "1.68", letterSpacing: "0.004em" },
  },
  {
    id: "moderno-clasico",
    name: "Moderno Clásico",
    intent: "Serif en títulos, interfaz moderna",
    headingLabel: "Lora",
    bodyLabel: "Manrope",
    heading: { family: FONT.lora, weight: 700, lineHeight: "1.05", letterSpacing: "-0.012em" },
    body: { family: FONT.manrope, weight: 425, lineHeight: "1.64", letterSpacing: "0.003em" },
  },
  {
    id: "tech-clean",
    name: "Tech Clean",
    intent: "Tecnológico sin estética gamer",
    headingLabel: "Space Grotesk",
    bodyLabel: "Montserrat",
    heading: { family: FONT.space, weight: 800, lineHeight: "0.98", letterSpacing: "-0.025em" },
    body: { family: FONT.montserrat, weight: 425, lineHeight: "1.6", letterSpacing: "0.002em" },
  },
  {
    id: "friendly",
    name: "Friendly",
    intent: "Cercano y fácil de leer",
    headingLabel: "Manrope",
    bodyLabel: "Inter",
    heading: { family: FONT.manrope, weight: 700, lineHeight: "1.06", letterSpacing: "-0.022em" },
    body: { family: FONT.inter, weight: 400, lineHeight: "1.7", letterSpacing: "0.007em" },
  },
  {
    id: "legacy-pso",
    name: "PSO Legacy",
    intent: "Conserva el ADN futurista anterior",
    headingLabel: "Orbitron",
    bodyLabel: "Inter",
    heading: { family: FONT.orbitron, weight: 700, lineHeight: "1.08", letterSpacing: "0.005em" },
    body: { family: FONT.inter, weight: 425, lineHeight: "1.62", letterSpacing: "0.004em" },
  },
  {
    id: "sistema",
    name: "Sistema",
    intent: "Máximo rendimiento y compatibilidad",
    headingLabel: "System UI",
    bodyLabel: "System UI",
    heading: { family: FONT.system, weight: 800, lineHeight: "1", letterSpacing: "-0.03em" },
    body: { family: FONT.system, weight: 400, lineHeight: "1.62", letterSpacing: "0.004em" },
  },
  {
    id: "web-safe",
    name: "Web-safe",
    intent: "Fallback universal sin fuentes externas",
    headingLabel: "Arial",
    bodyLabel: "Arial",
    heading: { family: FONT.arial, weight: 800, lineHeight: "1", letterSpacing: "-0.025em" },
    body: { family: FONT.arial, weight: 400, lineHeight: "1.6", letterSpacing: "0.005em" },
  },
];

export function getTypographyTheme(id?: string | null) {
  return TYPOGRAPHY_THEMES.find((theme) => theme.id === id) || TYPOGRAPHY_THEMES[0];
}

export function buildTypographyThemeCss() {
  return TYPOGRAPHY_THEMES.map((theme) => `
html[data-font-theme="${theme.id}"] {
  --apa-font-heading: ${theme.heading.family};
  --apa-font-body: ${theme.body.family};
  --apa-heading-weight: ${theme.heading.weight};
  --apa-heading-line-height: ${theme.heading.lineHeight};
  --apa-heading-letter-spacing: ${theme.heading.letterSpacing};
  --apa-body-weight: ${theme.body.weight};
  --apa-body-line-height: ${theme.body.lineHeight};
  --apa-body-letter-spacing: ${theme.body.letterSpacing};
}`).join("\n");
}
