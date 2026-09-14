"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ADMIN_NAV_GROUPS } from "@/config/adminNavigation";
import { getMyAdminPermissions, hasPermission } from "@/lib/adminPermissions";
import { supabase } from "@/lib/supabase";
import styles from "./AdminShell.module.css";

type AdminIdentity = {
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  visible_role: string | null;
};

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [identity, setIdentity] = useState<AdminIdentity | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !active) {
        setLoading(false);
        return;
      }

      const [permissionCodes, profileResult] = await Promise.all([
        getMyAdminPermissions(user.id).catch(() => []),
        supabase
          .from("profiles")
          .select("display_name,username,avatar_url,visible_role")
          .eq("id", user.id)
          .maybeSingle(),
      ]);

      if (!active) return;

      setPermissions(permissionCodes);
      if (!profileResult.error && profileResult.data) {
        setIdentity(profileResult.data as AdminIdentity);
      }
      setLoading(false);
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const groups = useMemo(() => {
    return ADMIN_NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.permission || hasPermission(permissions, item.permission),
      ),
    })).filter((group) => group.items.length > 0);
  }, [permissions]);

  const currentItem = useMemo(() => {
    return groups
      .flatMap((group) => group.items)
      .find((item) => isActive(pathname, item.href));
  }, [groups, pathname]);

  const label =
    identity?.display_name || identity?.username || "Administrador APA";
  const initial = label.slice(0, 1).toUpperCase();

  return (
    <div className={styles.shell}>
      <div
        className={`${styles.backdrop} ${mobileOpen ? styles.backdropOpen : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>APA</div>
          <div>
            <strong>Panel Admin</strong>
            <span>PSO Argentina</span>
          </div>
        </div>

        <nav className={styles.nav} aria-label="Navegación administrativa">
          {loading ? (
            <div className={styles.navLoading}>Cargando accesos...</div>
          ) : (
            groups.map((group) => (
              <section key={group.label} className={styles.navGroup}>
                <p className={styles.groupLabel}>{group.label}</p>
                <div className={styles.groupItems}>
                  {group.items.map((item) => {
                    const active = isActive(pathname, item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
                      >
                        <span className={styles.navIndicator} />
                        <span className={styles.navCopy}>
                          <strong>{item.label}</strong>
                          {item.legacy && <small>Heredado</small>}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.identity}>
            <div className={styles.avatar}>
              {identity?.avatar_url ? (
                <img src={identity.avatar_url} alt={label} />
              ) : (
                initial
              )}
            </div>
            <div className={styles.identityCopy}>
              <strong>{label}</strong>
              <span>{identity?.visible_role || "Staff APA"}</span>
            </div>
          </div>

          <Link className={styles.backToSite} href="/">
            Volver al sitio
          </Link>
        </div>
      </aside>

      <div className={styles.workspace}>
        <div className={styles.topbar}>
          <button
            className={styles.menuButton}
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label="Abrir navegación administrativa"
          >
            <span />
            <span />
            <span />
          </button>

          <div className={styles.context}>
            <span>Administración</span>
            <strong>{currentItem?.label || "Panel APA"}</strong>
          </div>

          <Link className={styles.siteShortcut} href="/">
            Sitio público
          </Link>
        </div>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
