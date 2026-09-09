"use client";

import { useState } from "react";
import estilos from "./competicion.module.css";

const competiciones = [
  { titulo: "Torneo de Liga", subtitulo: "Primera y Segunda" },
  { titulo: "Clasificación a Copas", subtitulo: "Fase de grupos" },
  { titulo: "Copa Argentina", subtitulo: "Cuartos de final" },
  { titulo: "Copa APA", subtitulo: "En juego" },
  { titulo: "Playoffs de Ascenso", subtitulo: "Próximamente" },
  { titulo: "Copa de Campeones", subtitulo: "Próximamente" },
];

export default function SelectorCompeticiones() {
  const [seleccionada, setSeleccionada] = useState(0);

  return (
    <ul className={estilos.menu} role="list">
      {competiciones.map((competicion, indice) => {
        const activa = indice === seleccionada;

        return (
          <li
            key={competicion.titulo}
            className={`${estilos.item} ${activa ? estilos.itemActivo : ""}`}
          >
            <button
              className={estilos.botonCompeticion}
              type="button"
              aria-pressed={activa}
              onClick={() => setSeleccionada(indice)}
            >
              <span className={estilos.nombreCompeticion}>{competicion.titulo}</span>
              <span className={estilos.estadoCompeticion}>{competicion.subtitulo}</span>
              {activa && <span className={estilos.indicadorActivo} aria-hidden="true" />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
