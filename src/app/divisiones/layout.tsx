import APAHeader from "@/components/APAHeader";

export default function DivisionesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <style>{`
        body:has([data-zona="divisiones-redesign"]) > nav {
          display: none !important;
        }
      `}</style>

      <div data-zona="divisiones-redesign">
        <APAHeader />
        {children}
      </div>
    </>
  );
}
