import AdminToolHub from "@/components/admin/AdminToolHub";

const tools = [
  {
    href: "/admin/competicion",
    eyebrow: "Torneos y copas",
    title: "Competición general",
    description: "Administrá clasificación, copas, sanciones, Copa de Campeones y playoffs desde el módulo principal.",
    permission: "competitions.manage",
    recommended: true,
  },
  {
    href: "/admin/fixture",
    eyebrow: "Liga",
    title: "Fixture y programación",
    description: "Generá el round-robin de Primera y Segunda y programá fechas, días y horarios.",
    permission: "fixtures.manage",
  },
];

export default function AdminTorneosPage() {
  return (
    <AdminToolHub
      eyebrow="Organización deportiva"
      title="Competición"
      description="Liga, copas y fases especiales quedan agrupadas bajo una sola responsabilidad. La herramienta antigua de copas queda fuera del flujo normal mientras terminamos su retiro técnico."
      tools={tools}
    />
  );
}
