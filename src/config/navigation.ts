export type HeaderDropdownItem = {
  label: string;
  description: string;
  href: string;
};

/**
 * MENÚ DESPLEGABLE DEL HEADER
 * ---------------------------
 * Acá podés cambiar los accesos que aparecen al pasar por "Competición"
 * sin tocar el componente visual del header.
 *
 * Para agregar una opción:
 * {
 *   label: "Nueva sección",
 *   description: "Texto corto explicativo",
 *   href: "/ruta",
 * }
 *
 * No usamos íconos dentro del desplegable para mantener el diseño limpio.
 */
export const COMPETITION_HEADER_MENU: HeaderDropdownItem[] = [
  {
    label: "Torneos",
    description: "Liga, copas y eventos",
    href: "/competicion",
  },
  {
    label: "Fixture",
    description: "Calendario oficial",
    href: "/fixture",
  },
  {
    label: "Stats",
    description: "Estadísticas oficiales",
    href: "/estadisticas",
  },
  {
    label: "Historia",
    description: "Leyendas y récords",
    href: "/historia",
  },
];
