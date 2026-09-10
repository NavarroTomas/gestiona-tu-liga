export type TeamRouteInput = {
  name?: string | null;
  nombre?: string | null;
  slug?: string | null;
};

/**
 * Ruta canónica para abrir el perfil/estadísticas de un equipo.
 *
 * Preferimos `slug` cuando está disponible porque es estable y legible.
 * Mientras terminamos de migrar todas las vistas, el nombre funciona como
 * fallback porque `/equipos/[nombre]` ya sabe resolver ambos formatos.
 *
 * IMPORTANTE: centralizar esta lógica evita que cada tabla, fixture o widget
 * construya URLs distintas para el mismo club.
 */
export function teamHref(team: TeamRouteInput): string | null {
  const target =
    team.slug?.trim() || team.nombre?.trim() || team.name?.trim() || "";

  if (!target) return null;

  return `/equipos/${encodeURIComponent(target)}`;
}
