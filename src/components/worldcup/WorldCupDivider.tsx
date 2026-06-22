type Props = {
  className?: string;
};

export default function WorldCupDivider({ className = "" }: Props) {
  return (
    <div className={`relative h-px w-full overflow-hidden bg-white/10 ${className}`}>
      <div className="absolute inset-y-0 left-1/2 w-44 -translate-x-1/2 bg-gradient-to-r from-transparent via-amber-200/70 to-transparent" />
    </div>
  );
}
