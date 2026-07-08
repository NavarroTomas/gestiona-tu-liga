"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearAdminPermissionsCache,
  getMyAdminPermissions,
  hasAnyAdminPermission,
} from "@/lib/adminPermissions";
import { supabase } from "@/lib/supabase";

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
        clearAdminPermissionsCache();
        router.push("/login");
        setVerificando(false);
        return;
      }

      try {
        const permisos = await getMyAdminPermissions(user.id);

        if (!activo) return;

        if (!hasAnyAdminPermission(permisos)) {
          router.push("/");
          setVerificando(false);
          return;
        }

        setPermitido(true);
        setVerificando(false);
      } catch (error) {
        console.error("Error verificando permisos:", error);

        if (!activo) return;

        clearAdminPermissionsCache();
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
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-2xl font-black uppercase tracking-[0.18em] text-sky-300">
          Verificando permisos...
        </p>
      </main>
    );
  }

  if (!permitido) return null;

  return <>{children}</>;
}
