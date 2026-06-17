export default function EscudoEquipo({
  nombre,
  logo,
  size = "md",
}: {
  nombre?: string;
  logo?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "h-9 w-9 rounded-xl text-[10px]",
    md: "h-14 w-14 rounded-2xl text-sm",
    lg: "h-20 w-20 rounded-[24px] text-xl",
  };

  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden border border-sky-300/30 bg-gradient-to-br from-sky-500 to-blue-950 font-black shadow-[0_0_18px_rgba(0,140,255,.45)] ${sizes[size]}`}>
      {logo ? (
        <img src={logo} alt={nombre || "Club"} className="h-full w-full object-contain p-1.5" />
      ) : (
        nombre?.slice(0, 2).toUpperCase() || "CL"
      )}
    </div>
  );
}
