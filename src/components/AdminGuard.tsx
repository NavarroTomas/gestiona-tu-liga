"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

let permissionsCacheUserId: string | undefined;
let permissionsCache: string[] | undefined;
let permissionsPromiseUserId: string | undefined;
let permissionsPromise: Promise<string[]> | undefined;

function normalizarPermisos(data: unknown): string[] {
  if (!Array.isArray(data)) return [];

  return data
    .map((item) => {
      if (!item || typeof item !== "object" || !("code" in item)) {
        return null;
      }

      const code = (item as { code?: unknown }).code;
      return typeof code === "string" ? code : null;
    })
    .filter((code): code is string => code !== null);
}

function limpiarPermisosCache() {
  permissionsCacheUserId = undefined;
  permissionsCache = undefined;
  permissionsPromiseUserId = undefined;
  permissionsPromise = undefined;
}

function cargarMisPermisos(userId: string): Promise<string[]> {
  if (permissionsCacheUserId === userId && permissionsCache) {
    return Promise.resolve(permissionsCache);
  }

  if (permissionsPromiseUserId === userId && permissionsPromise) {
    return permissionsPromise;
  }

  permissionsPromiseUserId = userId;
  permissionsPromise = (async () => {
    try {
      const { data, error } = await supabase.rpc("get_my_permissions");

      if (error) throw error;

      const permisos = normalizarPermisos(data);
      permissionsCacheUserId = userId;
      permissionsCache = permisos;
      return permisos;
    } finally {
      permissionsPromiseUserId = undefined;
      permissionsPromise = undefined;
    }
  })();

  return permissionsPromise;
}


const permisosPanel = [
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

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [verificando, setVerificando] = useState(true);
  const [permitido, setPermitido] = useState(false);

  useEffect(() => {
    let activo = true;

    async function verificarAcceso() {
      setVerificando(true);
      setPermitido(false);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!activo) return;

      if (!user) {
        limpiarPermisosCache();
        router.push("/login");
        setVerificando(false);
        return;
      }

      try {
        const permisos = await cargarMisPermisos(user.id);

        if (!activo) return;

        const puedeEntrar = permisosPanel.some((permission) =>
          permisos.includes(permission),
        );

        if (!puedeEntrar) {
          router.push("/");
          setVerificando(false);
          return;
        }

        setPermitido(true);
        setVerificando(false);
      } catch (error) {
        console.error("Error verificando permisos:", error);

        if (!activo) return;

        router.push("/");
        setVerificando(false);
      }
    }

    verificarAcceso();

    return () => {
      activo = false;
    };
  }, [router]);

  if (verificando) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center text-white">
        <p className="text-2xl font-black uppercase tracking-[0.18em] text-sky-300">
          Verificando permisos...
        </p>
      </main>
    );
  }

  if (!permitido) return null;

  return <>{children}</>;
}
