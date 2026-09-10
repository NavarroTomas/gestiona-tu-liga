import Link from "next/link";
import { getEnabledCompetitions } from "@/config/competitions";
import estilos from "./competicion.module.css";

export default function SelectorCompeticiones() {
  const competiciones = getEnabledCompetitions();

  return (
    <ul className={estilos.menu} role="list">
      {competiciones.map((competicion) => (
        <li key={competicion.id} className={estilos.item}>
          <Link
            className={estilos.botonCompeticion}
            href={competicion.href}
            aria-label={`Ir a ${competicion.titulo}`}
          >
            <span className={estilos.nombreCompeticion}>{competicion.titulo}</span>
            <span className={estilos.estadoCompeticion}>{competicion.subtitulo}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
