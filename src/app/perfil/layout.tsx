import ProfileAvatarCropManager from "@/components/profile/ProfileAvatarCropManager";
import "./profile-redesign.css";

export default function PerfilLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="apa-profile-redesign">
      {children}
      <ProfileAvatarCropManager />
    </div>
  );
}
