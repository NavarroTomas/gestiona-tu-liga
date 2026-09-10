import Link from "next/link";
import estilos from "./competicion.module.css";

const competiciones = [
  {
    titulo: "Torneo de Liga",
    subtitulo: "Primera y Segunda",
    href: "/divisiones",
  },
  {
    titulo: "Clasificación a Copas",
    subtitulo: "Fase de grupos",
    href: "/competicion/copas",
  },
  {
    titulo: "Copa Argentina",
    subtitulo: "Cuartos de final",
    href: "/competicion/copa-argentina",
  },
  {
    titulo: "Copa APA",
    subtitulo: "En juego",
    href: "/competicion/copa-apa",
  },
  {
    titulo: "Playoffs de Ascenso",
    subtitulo: "Próximamente",
    href: "/competicion/playoffs",
  },
  {
    titulo: "Copa de Campeones",
    subtitulo: "Próximamente",
    href: "/competicion/copa-campeones",
  },
];

export default function SelectorCompeticiones() {
  return (
    <ul className={estilos.menu} role="list">
      {competiciones.map((competicion, indice) => (
        <li
          key={competicion.titulo}
          className={`${estilos.item} ${indice === 0 ? estilos.itemActivo : ""}`}
        >
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
