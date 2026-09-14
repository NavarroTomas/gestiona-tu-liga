"use client";

import AdminGuard from "@/components/AdminGuard";
import "./admin-panel-theme.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="admin-panel-scope">{children}</div>
    </AdminGuard>
  );
}
