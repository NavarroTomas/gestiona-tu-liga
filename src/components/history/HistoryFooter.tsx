export default function HistoryFooter() {
  return (
    <footer className="border-t border-[#cfe5f1] bg-[#f8fcff]">
      <div className="mx-auto flex max-w-[1680px] flex-col gap-3 px-5 py-6 text-[11px] font-bold text-[#52738d] sm:px-8 sm:text-xs md:flex-row md:items-center md:justify-between lg:px-10">
        <div className="flex items-center gap-4">
          <strong className="text-base font-black tracking-wider text-[#102f55]">Liga ARGENTINA</strong>
          <span>El fútbol virtual también nos une.</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <span>Contacto</span>
          <span>Términos</span>
          <span>Privacidad</span>
          <span>Redes</span>
        </div>
      </div>
    </footer>
  );
}
