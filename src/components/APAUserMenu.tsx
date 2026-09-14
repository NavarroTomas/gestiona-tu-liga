"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  clearAdminPermissionsCache,
  getMyAdminPermissions,
  hasAnyAdminPermission,
} from "@/lib/adminPermissions";
import { supabase } from "@/lib/supabase";
import estilos from "./APAUserMenu.module.css";

type HeaderProfile = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  visible_role: string | null;
  status: string | null;
};

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5.5 19c.8-3.35 3.05-5.15 6.5-5.15s5.7 1.8 6.5 5.15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconPublic() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.5 12h15M12 4c2 2.1 3 4.75 3 8s-1 5.9-3 8M12 4c-2 2.1-3 4.75-3 8s1 5.9 3 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconPanel() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M10 5H6.8A1.8 1.8 0 0 0 5 6.8v10.4A1.8 1.8 0 0 0 6.8 19H10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M13.5 8.5 17 12l-3.5 3.5M9.5 12H17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function APAUserMenu() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<HeaderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadAccount() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (!user) {
        clearAdminPermissionsCache();
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const [{ data: profileData }, permissions] = await Promise.all([
        supabase
          .from("profiles")
          .select("id,display_name,username,avatar_url,visible_role,status")
          .eq("id", user.id)
          .maybeSingle(),
        getMyAdminPermissions(user.id).catch(() => []),
      ]);

      if (!active) return;

      setProfile((profileData as HeaderProfile | null) || {
        id: user.id,
        display_name: user.email?.split("@")[0] || "Usuario",
        username: null,
        avatar_url: null,
        visible_role: "usuario",
        status: "active",
      });
      setIsAdmin(hasAnyAdminPermission(permissions));
      setLoading(false);
    }

    loadAccount();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        clearAdminPermissionsCache();
        setProfile(null);
        setIsAdmin(false);
        setOpen(false);
        setLoading(false);
        return;
      }

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        queueMicrotask(() => loadAccount());
      }
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  async function logout() {
    setOpen(false);
    clearAdminPermissionsCache();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return <div className={estilos.loading} aria-label="Cargando cuenta" />;
  }

  if (!profile) {
    return (
      <div className={estilos.guestActions}>
        <Link href="/login" className={estilos.loginLink}>Ingresar</Link>
        <Link href="/registro" className={estilos.joinLink}>Unite a APA <span aria-hidden="true">→</span></Link>
      </div>
    );
  }

  const displayName = profile.display_name || profile.username || "Usuario APA";
  const initial = displayName.slice(0, 1).toUpperCase();
  const role = (profile.visible_role || (isAdmin ? "staff" : "usuario")).toUpperCase();
  const status = (profile.status || "active").toUpperCase();

  return (
    <div className={estilos.root} ref={rootRef}>
      {isAdmin && (
        <Link href="/admin" className={estilos.panelQuickLink}>
          <IconPanel />
          <span>Panel</span>
        </Link>
      )}

      <button
        type="button"
        className={`${estilos.accountButton} ${open ? estilos.accountButtonOpen : ""}`}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className={estilos.avatarSmall}>
          {profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : initial}
        </span>
        <span className={estilos.accountText}>
          <strong>{displayName}</strong>
          <small>{role}</small>
        </span>
        <span className={estilos.chevron} aria-hidden="true">⌄</span>
      </button>

      <div className={`${estilos.menu} ${open ? estilos.menuOpen : ""}`} role="menu">
        <div className={estilos.identity}>
          <span className={estilos.avatarLarge}>
            {profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : initial}
          </span>
          <div className={estilos.identityText}>
            <strong>{displayName}</strong>
            <span>{profile.username ? `@${profile.username}` : "Cuenta APA"}</span>
            <small>{role} · {status}</small>
          </div>
        </div>

        <div className={estilos.menuLinks}>
          <Link href="/perfil" className={estilos.menuLink} role="menuitem" onClick={() => setOpen(false)}>
            <IconUser />
            <span><strong>Mi perfil</strong><small>Editar datos de mi cuenta</small></span>
          </Link>

          {profile.username && (
            <Link href={`/u/${encodeURIComponent(profile.username)}`} className={estilos.menuLink} role="menuitem" onClick={() => setOpen(false)}>
              <IconPublic />
              <span><strong>Perfil público</strong><small>Ver cómo te ve la comunidad</small></span>
            </Link>
          )}

          {isAdmin && (
            <Link href="/admin" className={estilos.menuLink} role="menuitem" onClick={() => setOpen(false)}>
              <IconPanel />
              <span><strong>Panel admin</strong><small>Herramientas de administración</small></span>
            </Link>
          )}
        </div>

        <button type="button" className={estilos.logout} onClick={logout} role="menuitem">
          <IconLogout />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}
