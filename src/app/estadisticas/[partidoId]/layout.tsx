import type { ReactNode } from "react";
import "./match-report-redesign.css";
import "./match-report-functionality.css";

export default function MatchReportLayout({ children }: { children: ReactNode }) {
  return <div className="match-report-redesign">{children}</div>;
}
