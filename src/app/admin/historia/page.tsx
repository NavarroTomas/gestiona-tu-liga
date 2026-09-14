import AdminToolHub from "@/components/admin/AdminToolHub";

const tools = [
  {
    href: "/admin/titulos",
    eyebrow: "Historia de clubes",
    title: "Palmarés",
    description: "Registrá campeones oficiales por competición, temporada y categoría.",
    permission: "titles.manage",
    recommended: true,
  },
  {
    href: "/admin/premios",
    eyebrow: "Reconocimientos individuales",
    title: "Premios APA",
    description: "Calculá y asigná premios individuales usando las estadísticas oficiales de la temporada.",
    permission: "titles.manage",
  },
];

export default function AdminHistoriaPage() {
  return (
    <AdminToolHub
      eyebrow="Archivo institucional"
      title="Historia y premios"
      description="Campeones colectivos y premios individuales siguen separados a nivel de datos, pero viven dentro de una misma área administrativa."
      tools={tools}
    />
  );
}
