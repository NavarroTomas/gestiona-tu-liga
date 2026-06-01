"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DebugUserPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function cargar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      console.log("USER:", user);
    }

    cargar();
  }, []);

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <h1 className="text-3xl font-black">Debug User</h1>

      <pre className="mt-6 overflow-auto rounded-xl bg-zinc-900 p-5 text-sm">
        {JSON.stringify(user, null, 2)}
      </pre>
    </main>
  );
}