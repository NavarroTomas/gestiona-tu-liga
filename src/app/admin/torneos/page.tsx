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
  {
    href: "/admin/copas",
    eyebrow: "Compatibilidad histórica",
    title: "Copas antiguas",
    description: "Herramienta heredada. Se mantiene temporalmente solo para comparar funciones pendientes antes de retirarla.",
    permission: "competitions.manage",
    legacy: true,
  },
];

export default function AdminTorneosPage() {
  return (
    <AdminToolHub
      eyebrow="Organización deportiva"
      title="Competición"
      description="Liga, copas y fases especiales quedan agrupadas bajo una sola responsabilidad. El panel antiguo de copas ya no es una herramienta principal."
      tools={tools}
    />
  );
}
