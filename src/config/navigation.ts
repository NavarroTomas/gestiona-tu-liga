export type HeaderDropdownItem = {
  label: string;
  description: string;
  href: string;
};

/**
 * MENÚ DESPLEGABLE DE COMPETICIÓN
 * -------------------------------
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
 *
 * La sección de estadísticas sigue existiendo y se accede desde equipos,
 * partidos, fixture y otros puntos de la web; simplemente no aparece como
 * acceso independiente en el navbar.
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
    label: "Historia",
    description: "Leyendas y récords",
    href: "/historia",
  },
];

/**
 * MENÚ DESPLEGABLE DE CLUBES
 * --------------------------
 * Agrupa las tres zonas que forman el bloque de clubes y jugadores.
 * Si en el futuro aparece otra sección relacionada, se agrega acá y el
 * header la toma automáticamente.
 */
export const CLUBS_HEADER_MENU: HeaderDropdownItem[] = [
  {
    label: "Clubes",
    description: "Instituciones y perfiles",
    href: "/clubes",
  },
  {
    label: "Plantillas",
    description: "Planteles oficiales",
    href: "/plantillas",
  },
  {
    label: "Jugadores",
    description: "Rankings y estadísticas",
    href: "/jugadores",
  },
];
