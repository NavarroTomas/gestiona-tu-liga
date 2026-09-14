"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AvatarCropper from "./AvatarCropper";

const MAX_SOURCE_SIZE_MB = 12;

export default function ProfileAvatarCropManager() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);

  useEffect(() => {
    function interceptAvatarSelection(event: Event) {
      const input = event.target;
      if (!(input instanceof HTMLInputElement)) return;
      if (input.type !== "file" || !input.accept.includes("image")) return;

      const file = input.files?.[0];
      if (!file) return;

      // Evita que el handler viejo suba la imagen sin recortarla.
      event.preventDefault();
      event.stopPropagation();
      if ("stopImmediatePropagation" in event) event.stopImmediatePropagation();

      if (!file.type.startsWith("image/")) {
        window.alert("El archivo debe ser una imagen JPG, PNG o WEBP.");
        input.value = "";
        return;
      }

      if (file.size > MAX_SOURCE_SIZE_MB * 1024 * 1024) {
        window.alert(`La imagen original no puede pesar más de ${MAX_SOURCE_SIZE_MB}MB.`);
        input.value = "";
        return;
      }

      setSourceFile(file);
      input.value = "";
    }

    document.addEventListener("change", interceptAvatarSelection, true);
    return () => document.removeEventListener("change", interceptAvatarSelection, true);
  }, []);

  async function saveCroppedAvatar(croppedFile: File) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      window.alert("Tu sesión ya no está disponible. Volvé a iniciar sesión.");
      return;
    }

    const path = `${user.id}/avatar.webp`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, croppedFile, {
        cacheControl: "3600",
        contentType: "image/webp",
        upsert: true,
      });

    if (uploadError) {
      console.error(uploadError);
      window.alert("No pude subir la foto. Intentá nuevamente.");
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatarUrl = `${data.publicUrl}?v=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error(updateError);
      window.alert("La imagen se subió, pero no pude actualizar tu perfil.");
      return;
    }

    setSourceFile(null);
    // Recarga para que header, perfil privado y cualquier preview usen el nuevo URL cache-busteado.
    window.location.reload();
  }

  if (!sourceFile) return null;

  return (
    <AvatarCropper
      file={sourceFile}
      onCancel={() => setSourceFile(null)}
      onConfirm={saveCroppedAvatar}
    />
  );
}
