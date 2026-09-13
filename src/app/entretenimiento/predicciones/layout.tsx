import "./predicciones-redesign.css";

export default function PrediccionesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="predicciones-redesign">{children}</div>;
}
