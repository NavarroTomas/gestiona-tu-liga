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

  const currentGroup = useMemo(() => {
    return (
      groups.find((group) => group.items.some((item) => isActive(pathname, item.href))) ||
      groups[0]
    );
  }, [groups, pathname]);

  const currentItem = useMemo(() => {
    return groups
      .flatMap((group) => group.items)
      .find((item) => isActive(pathname, item.href));
  }, [groups, pathname]);

  const label = identity?.display_name || identity?.username || "Administrador APA";
  const initial = label.slice(0, 1).toUpperCase();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.topRow}>
          <div className={styles.brandWrap}>
            <Link href="/admin" className={styles.brand}>
              <span className={styles.brandMark}>APA</span>
              <span className={styles.brandCopy}>
                <strong>Panel Admin</strong>
                <small>PSO Argentina</small>
              </span>
            </Link>

            <button
              className={styles.menuButton}
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              aria-label="Abrir navegación administrativa"
              aria-expanded={mobileOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>

          <nav
            className={`${styles.categoryNav} ${mobileOpen ? styles.categoryNavOpen : ""}`}
            aria-label="Categorías administrativas"
          >
            {loading ? (
              <span className={styles.loading}>Cargando accesos...</span>
            ) : (
              groups.map((group) => {
                const active = currentGroup?.label === group.label;
                const target = group.items[0]?.href || "/admin";

                return (
                  <Link
                    key={group.label}
                    href={target}
                    className={`${styles.categoryLink} ${active ? styles.categoryLinkActive : ""}`}
                  >
                    {group.label}
                  </Link>
                );
              })
            )}
          </nav>

          <div className={styles.accountZone}>
            <Link className={styles.siteShortcut} href="/">
              Sitio público
            </Link>

            <div className={styles.identity}>
              <div className={styles.avatar}>
                {identity?.avatar_url ? <img src={identity.avatar_url} alt={label} /> : initial}
              </div>
              <div className={styles.identityCopy}>
                <strong>{label}</strong>
                <span>{identity?.visible_role || "Staff APA"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.subnavRow}>
          <div className={styles.context}>
            <span>{currentGroup?.label || "Administración"}</span>
            <strong>{currentItem?.label || "Panel APA"}</strong>
          </div>

          <nav className={styles.subnav} aria-label="Herramientas de la categoría">
            {(currentGroup?.items || []).map((item) => {
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.subnavLink} ${active ? styles.subnavLinkActive : ""}`}
                >
                  <span>{item.label}</span>
                  {item.legacy && <small>Heredado</small>}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className={styles.content}>{children}</main>
    </div>
  );
}
