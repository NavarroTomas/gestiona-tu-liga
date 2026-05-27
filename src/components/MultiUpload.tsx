"use client";

import { useState } from "react";

export default function MultiUpload() {

  const [files, setFiles] = useState<FileList | null>(null);

  async function handleUpload() {

    if (!files) return;

    for (let i = 0; i < files.length; i++) {

      const text = await files[i].text();

      // podés reutilizar la función procesarJSON si querés después
      console.log("Procesando:", files[i].name);

    }

    alert("🔥 Archivos procesados");
  }

  return (

    <div className="bg-zinc-900 p-6 rounded-3xl">

      <h3 className="text-xl font-bold mb-4">
        Multi Upload
      </h3>

      <input
        type="file"
        multiple
        onChange={(e) => setFiles(e.target.files)}
        className="mb-4"
      />

      <button
        onClick={handleUpload}
        className="bg-white text-black px-4 py-2 rounded"
      >
        Subir varios
      </button>

    </div>
  );
}