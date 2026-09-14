import AdminToolHub from "@/components/admin/AdminToolHub";

const tools = [
  {
    href: "/admin/usuarios",
    eyebrow: "Estado de cuenta",
    title: "Usuarios",
    description: "Revisá cuentas, aprobaciones, suspensiones y estados generales de la comunidad.",
    permission: "admin.users.manage",
    recommended: true,
  },
  {
    href: "/admin/verificaciones",
    eyebrow: "Identidad deportiva",
    title: "Verificaciones",
    description: "Gestioná Player ID, Steam, Discord, duplicados, disputas y aprobaciones de identidad.",
    permission: "admin.users.manage",
  },
];

export default function AdminCuentasPage() {
  return (
    <AdminToolHub
      eyebrow="Comunidad APA"
      title="Usuarios"
      description="La cuenta y su identidad deportiva forman parte del mismo proceso administrativo. Los permisos de staff se mantienen aislados por seguridad."
      tools={tools}
    />
  );
}
