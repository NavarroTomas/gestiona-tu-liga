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
export const DEFAULT_TYPOGRAPHY_THEME = "data-first";

const INTER = 'var(--font-inter), Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export const TYPOGRAPHY_THEMES: TypographyTheme[] = [
  {
    id: "data-first",
    name: "Inter",
    intent: "Tipografía oficial de APA PSO Argentina",
    headingLabel: "Inter",
    bodyLabel: "Inter",
    heading: { family: INTER, weight: 850, lineHeight: "1", letterSpacing: "-0.035em" },
    body: { family: INTER, weight: 450, lineHeight: "1.56", letterSpacing: "0.002em" },
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
