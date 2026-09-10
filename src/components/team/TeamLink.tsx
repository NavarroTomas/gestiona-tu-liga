import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";
import { teamHref } from "@/lib/teams/teamRoutes";

type TeamLinkProps = {
  name: string;
  slug?: string | null;
  children?: ReactNode;
  className?: string;
  title?: string;
  ariaLabel?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  prefetch?: boolean;
};

/**
 * Enlace universal a la ficha/estadísticas de un equipo.
 *
 * Este componente NO consulta Supabase: recibe la identidad que la vista ya
 * tiene. Así podemos renderizar decenas de equipos en tablas, fixtures y
 * widgets sin sumar consultas ni trabajo extra por cada enlace.
 *
 * También desactivamos el prefetch masivo por defecto. En pantallas con muchos
 * clubes evita que Next intente precargar decenas de perfiles que quizá el
 * usuario nunca abra.
 */
export default function TeamLink({
  name,
  slug,
  children,
  className = "",
  title,
  ariaLabel,
  onClick,
  prefetch = false,
}: TeamLinkProps) {
  const href = teamHref({ name, slug });

  if (!href) {
    return <span className={className}>{children ?? name}</span>;
  }

  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={`cursor-pointer rounded-sm no-underline outline-none transition-colors hover:text-[#258fcf] focus-visible:ring-2 focus-visible:ring-[#56afe2] focus-visible:ring-offset-2 ${className}`}
      aria-label={ariaLabel ?? `Ver estadísticas de ${name}`}
      title={title ?? `Ver estadísticas de ${name}`}
      onClick={onClick}
    >
      {children ?? name}
    </Link>
  );
}
