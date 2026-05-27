"use client";

import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [autorizado, setAutorizado] = useState(false);
  const [password, setPassword] = useState("");
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    const acceso = localStorage.getItem("admin_access");

    if (acceso === "true") {
      setAutorizado(true);
    }

    setCargado(true);
  }, []);

  function ingresar() {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      localStorage.setItem("admin_access", "true");
      setAutorizado(true);
    } else {
      alert("Contraseña incorrecta");
    }
  }

  function salir() {
    localStorage.removeItem("admin_access");
    setAutorizado(false);
  }

  if (!cargado) return null;

  if (!autorizado) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full max-w-md">
          <h1 className="text-4xl font-black mb-3">Admin</h1>

          <p className="text-zinc-400 mb-6">
            Ingresá la contraseña para acceder al panel.
          </p>

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") ingresar();
            }}
            className="w-full p-4 rounded-xl bg-black border border-zinc-700 mb-4"
          />

          <button
            onClick={ingresar}
            className="w-full bg-blue-600 hover:bg-blue-500 transition p-4 rounded-xl font-black"
          >
            Entrar
          </button>
        </div>
      </main>
    );
  }

  return (
    <div>
      <div className="bg-zinc-950 border-b border-zinc-800 px-6 py-3 flex justify-end">
        <button
          onClick={salir}
          className="bg-red-600 px-4 py-2 rounded-xl font-black"
        >
          Cerrar admin
        </button>
      </div>

      {children}
    </div>
  );
}