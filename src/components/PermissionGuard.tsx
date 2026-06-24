"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

let permissionsCache: string[] | undefined;
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

function cargarMisPermisos(): Promise<string[]> {
  if (permissionsCache) {
    return Promise.resolve(permissionsCache);
  }

  if (permissionsPromise) {
    return permissionsPromise;
  }

  permissionsPromise = (async () => {
    try {
      const { data, error } = await supabase.rpc("get_my_permissions");

      if (error) throw error;

      const permisos = normalizarPermisos(data);
      permissionsCache = permisos;
      return permisos;
    } finally {
      permissionsPromise = undefined;
    }
  })();

  return permissionsPromise;
}

export default function PermissionGuard({
  permission,
  children,
}: {
  permission: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [verificando, setVerificando] = useState(true);
  const [permitido, setPermitido] = useState(false);

  useEffect(() => {
    let activo = true;

    async function verificarPermiso() {
      setVerificando(true);
      setPermitido(false);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!activo) return;

      if (!user) {
        router.push("/login");
        setVerificando(false);
        return;
      }

      try {
        const permisos = await cargarMisPermisos();

        if (!activo) return;

        if (!permisos.includes(permission)) {
          router.push("/admin");
          setVerificando(false);
          return;
        }

        setPermitido(true);
        setVerificando(false);
      } catch (error) {
        console.error("Error verificando permisos:", error);

        if (!activo) return;

        router.push("/admin");
        setVerificando(false);
      }
    }

    verificarPermiso();

    return () => {
      activo = false;
    };
  }, [permission, router]);

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
