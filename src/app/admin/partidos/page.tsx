import AdminToolHub from "@/components/admin/AdminToolHub";

const tools = [
  {
    href: "/admin/subir-txt",
    eyebrow: "Flujo principal",
    title: "Importar TXT",
    description: "Cargá estadísticas oficiales desde MatchStats y vinculalas con un partido programado.",
    permission: "matches.upload_txt",
    recommended: true,
  },
  {
    href: "/admin/cargar-partido-manual",
    eyebrow: "Alternativa",
    title: "Carga manual",
    description: "Usala para históricos o casos sin archivo TXT. Carga resultado y estadísticas manualmente.",
    permission: "matches.upload_manual",
  },
  {
    href: "/admin/listas",
    eyebrow: "Control y correcciones",
    title: "Partidos cargados",
    description: "Revisá, corregí o eliminá registros existentes sin mezclar esta tarea con la carga inicial.",
    permission: "matches.edit",
  },
];

export default function AdminPartidosPage() {
  return (
    <AdminToolHub
      eyebrow="Operación deportiva"
      title="Partidos y resultados"
      description="Un único lugar para cargar, revisar y corregir partidos oficiales. La importación TXT es el flujo recomendado; la carga manual queda como respaldo."
      tools={tools}
    />
  );
}
