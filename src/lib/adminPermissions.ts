"use client";

import { supabase } from "@/lib/supabase";

export type AdminPermissionCode =
  | "admin.owner"
  | "admin.permissions.manage"
  | "admin.users.manage"
  | "clubs.manage"
  | "competitions.manage"
  | "fixtures.manage"
  | "matches.edit"
  | "matches.upload_manual"
  | "matches.upload_txt"
  | "news.manage"
  | "titles.manage"
  | "transfers.manage";

export type AdminPermissionDefinition = {
  code: AdminPermissionCode;
  name: string;
  description: string;
  group: string;
};

export const ADMIN_PERMISSIONS: AdminPermissionDefinition[] = [
  {
    code: "admin.owner",
    name: "Dueño",
    description: "Control total del panel. Debe tenerlo solo el dueño principal.",
    group: "Seguridad",
  },
  {
    code: "admin.permissions.manage",
    name: "Gestionar permisos",
    description: "Puede dar y quitar permisos administrativos a otros usuarios.",
    group: "Seguridad",
  },
  {
    code: "admin.users.manage",
    name: "Usuarios",
    description: "Puede aprobar usuarios, suspenderlos y administrar roles.",
    group: "Usuarios",
  },
  {
    code: "clubs.manage",
    name: "Clubes",
    description: "Puede editar clubes, logos, banners y datos visuales.",
    group: "Clubes",
  },
  {
    code: "competitions.manage",
    name: "Competición",
    description: "Puede administrar competiciones, copas, fases y torneos.",
    group: "Competición",
  },
  {
    code: "fixtures.manage",
    name: "Fixture",
    description: "Puede generar y editar fixtures.",
    group: "Competición",
  },
  {
    code: "matches.edit",
    name: "Listas / registros",
    description: "Puede editar registros y partidos ya cargados.",
    group: "Partidos",
  },
  {
    code: "matches.upload_manual",
    name: "Partido manual",
    description: "Puede cargar partidos manualmente.",
    group: "Partidos",
  },
  {
    code: "matches.upload_txt",
    name: "Subir TXT",
    description: "Puede cargar estadísticas oficiales mediante TXT.",
    group: "Partidos",
  },
  {
    code: "news.manage",
    name: "Noticias",
    description: "Puede publicar y editar noticias.",
    group: "Contenido",
  },
  {
    code: "titles.manage",
    name: "Historia / Premios",
    description: "Puede administrar palmarés, premios e historia Liga.",
    group: "Historia",
  },
  {
    code: "transfers.manage",
    name: "Plantillas / Mercado",
    description: "Puede administrar plantillas, jugadores y transferencias.",
    group: "Mercado",
  },
];

export const ADMIN_PERMISSION_CODES = ADMIN_PERMISSIONS.map((p) => p.code);

export const ADMIN_PANEL_PERMISSIONS: AdminPermissionCode[] = [
  "admin.owner",
  "admin.permissions.manage",
  "admin.users.manage",
  "clubs.manage",
  "competitions.manage",
  "fixtures.manage",
  "matches.edit",
  "matches.upload_manual",
  "matches.upload_txt",
  "news.manage",
  "titles.manage",
  "transfers.manage",
];

let permissionsCacheUserId: string | undefined;
let permissionsCache: string[] | undefined;
let permissionsPromiseUserId: string | undefined;
let permissionsPromise: Promise<string[]> | undefined;

function normalizarPermisos(data: unknown): string[] {
  if (!Array.isArray(data)) return [];

  return data
    .map((item) => {
      if (typeof item === "string") return item;

      if (!item || typeof item !== "object" || !("code" in item)) {
        return null;
      }

      const code = (item as { code?: unknown }).code;
      return typeof code === "string" ? code : null;
    })
    .filter((code): code is string => Boolean(code));
}

export function clearAdminPermissionsCache() {
  permissionsCacheUserId = undefined;
  permissionsCache = undefined;
  permissionsPromiseUserId = undefined;
  permissionsPromise = undefined;
}

export async function getMyAdminPermissions(userId?: string): Promise<string[]> {
  let resolvedUserId = userId;

  if (!resolvedUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    resolvedUserId = user?.id;
  }

  if (!resolvedUserId) return [];

  if (permissionsCacheUserId === resolvedUserId && permissionsCache) {
    return permissionsCache;
  }

  if (permissionsPromiseUserId === resolvedUserId && permissionsPromise) {
    return permissionsPromise;
  }

  permissionsPromiseUserId = resolvedUserId;
  permissionsPromise = (async () => {
    try {
      const { data, error } = await supabase.rpc("get_my_permissions");

      if (error) throw error;

      const permisos = normalizarPermisos(data);
      permissionsCacheUserId = resolvedUserId;
      permissionsCache = permisos;
      return permisos;
    } finally {
      permissionsPromiseUserId = undefined;
      permissionsPromise = undefined;
    }
  })();

  return permissionsPromise;
}

export function hasPermission(permisos: string[], permission: string) {
  return permisos.includes("admin.owner") || permisos.includes(permission);
}

export function hasAnyAdminPermission(permisos: string[]) {
  return ADMIN_PANEL_PERMISSIONS.some((permission) =>
    hasPermission(permisos, permission),
  );
}
