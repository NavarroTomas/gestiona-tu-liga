"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
    verificarAcceso();
  }, []);

  async function verificarAcceso() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const resultados = await Promise.all(
      permisosPanel.map(async (permission) => {
        const res = await supabase.rpc("has_permission", {
          requested_permission: permission,
        });

        console.log("PERMISO:", permission, res.data, res.error);

        return res;
      }),
    );

    const puedeEntrar = resultados.some((res) => {
      if (res.error) {
        console.log(res.error);
        return false;
      }

      return !!res.data;
    });

    if (!puedeEntrar) {
      router.push("/");
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
