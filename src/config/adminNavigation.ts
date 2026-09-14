export type AdminNavItem = {
  href: string;
  label: string;
  description: string;
  permission?: string;
  legacy?: boolean;
};

export type AdminNavGroup = {
  label: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: "Operación",
    items: [
      {
        href: "/admin",
        label: "Resumen",
        description: "Inicio del panel y accesos rápidos.",
      },
      {
        href: "/admin/subir-txt",
        label: "Subir TXT",
        description: "Importar estadísticas oficiales MatchStats.",
        permission: "matches.upload_txt",
      },
      {
        href: "/admin/cargar-partido-manual",
        label: "Partido manual",
        description: "Cargar resultados y estadísticas manualmente.",
        permission: "matches.upload_manual",
      },
      {
        href: "/admin/listas",
        label: "Partidos cargados",
        description: "Revisar y editar registros existentes.",
        permission: "matches.edit",
      },
    ],
  },
  {
    label: "Competición",
    items: [
      {
        href: "/admin/competicion",
        label: "Competición general",
        description: "Clasificaciones, playoffs y Copa de Campeones.",
        permission: "competitions.manage",
      },
      {
        href: "/admin/fixture",
        label: "Fixture de liga",
        description: "Generar y programar fechas de Primera y Segunda.",
        permission: "fixtures.manage",
      },
      {
        href: "/admin/copas",
        label: "Copas antiguas",
        description: "Herramienta heredada para datos históricos.",
        permission: "competitions.manage",
        legacy: true,
      },
    ],
  },
  {
    label: "Contenido y clubes",
    items: [
      {
        href: "/admin/clubes",
        label: "Clubes",
        description: "Datos, imágenes e inscripción por temporada.",
        permission: "clubs.manage",
      },
      {
        href: "/admin/plantillas",
        label: "Plantillas y mercado",
        description: "Jugadores, planteles y transferencias.",
        permission: "transfers.manage",
      },
      {
        href: "/admin/noticias",
        label: "Noticias",
        description: "Publicaciones y comunicados de APA.",
        permission: "news.manage",
      },
      {
        href: "/admin/titulos",
        label: "Palmarés",
        description: "Campeones y títulos oficiales.",
        permission: "titles.manage",
      },
      {
        href: "/admin/premios",
        label: "Premios APA",
        description: "Premios individuales por temporada.",
        permission: "titles.manage",
      },
    ],
  },
  {
    label: "Usuarios y seguridad",
    items: [
      {
        href: "/admin/usuarios",
        label: "Usuarios",
        description: "Estados, altas, suspensiones y revisión de cuentas.",
        permission: "admin.users.manage",
      },
      {
        href: "/admin/verificaciones",
        label: "Player IDs",
        description: "Solicitudes y verificación de identidad deportiva.",
        permission: "admin.users.manage",
      },
      {
        href: "/admin/permisos",
        label: "Permisos",
        description: "Accesos administrativos por usuario.",
        permission: "admin.permissions.manage",
      },
    ],
  },
];
