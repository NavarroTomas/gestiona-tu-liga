"use client";

import { supabase } from "@/lib/supabase";

export default function SetPassword() {
  async function crearPassword() {
    const { error } = await supabase.auth.updateUser({
      password: "Cui0434n",
    });

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    alert("Contraseña creada correctamente");
  }

  return (
    <button onClick={crearPassword}>
      Crear contraseña
    </button>
  );
}