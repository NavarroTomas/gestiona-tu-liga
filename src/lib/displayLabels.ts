/** Presentation only: stored identifiers and query values remain unchanged. */
export function displayLabel<T>(value: T): T {
  return (typeof value === "string" ? value.replace(/Copa APA/gi, "Copa de la Liga").replace(/\bAPA\b/g, "Liga").replace(/\bTemporadas\b/gi, "Torneos").replace(/\bTemporada\b/gi, "Torneo") : value) as T;
}
