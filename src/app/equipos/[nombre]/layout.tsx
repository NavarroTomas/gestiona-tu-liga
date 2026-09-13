import "./club-profile-redesign.css";

/**
 * Layout visual para todas las fichas públicas de club.
 *
 * La ruta es dinámica (/equipos/[nombre]), por lo que cualquier cambio
 * realizado acá se aplica automáticamente a todos los clubes.
 */
export default function ClubProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="club-profile-redesign">{children}</div>;
}
