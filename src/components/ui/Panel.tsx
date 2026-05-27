export default function Panel({
  children,
}: {
  children: React.ReactNode;
}) {

  return (

    <div
      className="
        w-full
        rounded-3xl

        bg-[#11151c]

        border
        border-white/[0.06]

        p-5
        md:p-6

        overflow-hidden

        shadow-[0_4px_20px_rgba(0,0,0,0.25)]
      "
    >

      {children}

    </div>

  );

}