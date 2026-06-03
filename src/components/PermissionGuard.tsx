"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
    verificarPermiso();
  }, []);

  async function verificarPermiso() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase.rpc("has_permission", {
      requested_permission: permission,
    });

    if (error || !data) {
      router.push("/admin");
      return;
    }

    setPermitido(true);
    setVerificando(false);
  }

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