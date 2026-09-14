import Link from "next/link";
import type { PartidoInfo } from "./types";

export default function MatchNavigation({
  previous,
  next,
}: {
  previous: PartidoInfo | null;
  next: PartidoInfo | null;
}) {
  return (
    <div className="match-report-navigation grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
      <div>
        {previous ? (
          <Link
            href={`/estadisticas/${encodeURIComponent(previous.partido_id)}`}
            className="match-report-nav-link inline-flex flex-col"
          >
            <span>← Partido anterior</span>
            <strong>{previous.local} vs {previous.visitante}</strong>
          </Link>
        ) : null}
      </div>

      <Link href="/estadisticas" className="match-report-back-link">
        Match Center
      </Link>

      <div className="sm:text-right">
        {next ? (
          <Link
            href={`/estadisticas/${encodeURIComponent(next.partido_id)}`}
            className="match-report-nav-link inline-flex flex-col sm:items-end"
          >
            <span>Partido siguiente →</span>
            <strong>{next.local} vs {next.visitante}</strong>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
