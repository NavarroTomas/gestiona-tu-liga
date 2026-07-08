"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyAdminPermissions, hasPermission } from "@/lib/adminPermissions";
import { supabase } from "@/lib/supabase";

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
        const permisos = await getMyAdminPermissions(user.id);

        if (!activo) return;

        if (!hasPermission(permisos, permission)) {
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
