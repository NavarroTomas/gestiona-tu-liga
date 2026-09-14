import "./profile-redesign.css";

export default function PerfilLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="apa-profile-redesign">{children}</div>;
}
