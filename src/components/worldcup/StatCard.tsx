type Props = {
  value: string;
  label: string;
  icon?: string;
};

export default function StatCard({ value, label, icon }: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.08)]">
      <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-sky-200/45 to-transparent" />
      {icon ? <p className="text-lg">{icon}</p> : null}
      <p className="mt-2 text-2xl font-black uppercase tracking-[-0.04em] text-white">
        {value}
      </p>
      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
    </div>
  );
}
