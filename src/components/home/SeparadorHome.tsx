export default function SeparadorHome({ label }: { label: string }) {
  return (
    <div className="relative py-4">
      <div className="apa-section-divider absolute inset-x-0 top-1/2 -translate-y-1/2" />
      <div className="relative flex justify-center">
        <span className="apa-mural-badge rounded-full px-6 py-2 text-[10px] font-black uppercase tracking-[0.34em] shadow-[0_0_28px_rgba(255,210,45,.25)]">
          {label}
        </span>
      </div>
    </div>
  );
}
