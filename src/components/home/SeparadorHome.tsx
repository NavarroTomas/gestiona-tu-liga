export default function SeparadorHome({ label }: { label: string }) {
  return (
    <div className="relative py-7">
      <div className="absolute left-1/2 top-1/2 h-px w-[min(760px,90vw)] -translate-x-1/2 bg-gradient-to-r from-transparent via-yellow-200/45 to-transparent" />
      <div className="relative flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-md border border-yellow-200/24 bg-[#07121f]/86 px-5 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-yellow-100 shadow-[0_12px_26px_rgba(0,0,0,.38)] backdrop-blur">
          <img src="/themes/worldcup-real/flags/ar.png" alt="" className="h-4 w-6 rounded-sm object-cover" />
          {label}
          <img src="/themes/worldcup-real/flags/br.png" alt="" className="h-4 w-6 rounded-sm object-cover" />
        </span>
      </div>
    </div>
  );
}
