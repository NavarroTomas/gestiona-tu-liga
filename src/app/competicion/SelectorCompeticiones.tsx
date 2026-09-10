"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
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

type Indicador = {
  left: number;
  top: number;
  width: number;
  visible: boolean;
};

export default function SelectorCompeticiones() {
  const menuRef = useRef<HTMLUListElement | null>(null);
  const enlacesRef = useRef<Array<HTMLAnchorElement | null>>([]);
  const [seleccionada, setSeleccionada] = useState(0);
  const [indicador, setIndicador] = useState<Indicador>({
    left: 0,
    top: 0,
    width: 80,
    visible: false,
  });

  const moverIndicador = useCallback((indice: number) => {
    const menu = menuRef.current;
    const enlace = enlacesRef.current[indice];
    if (!menu || !enlace) return;

    const menuRect = menu.getBoundingClientRect();
    const enlaceRect = enlace.getBoundingClientRect();
    const ancho = Math.min(103, Math.max(58, enlaceRect.width * 0.45));

    setIndicador({
      left: enlaceRect.left - menuRect.left + enlaceRect.width / 2 - ancho / 2,
      top: enlaceRect.top - menuRect.top + enlaceRect.height - Math.max(8, enlaceRect.height * 0.09),
      width: ancho,
      visible: true,
    });
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => moverIndicador(0));

    const alRedimensionar = () => moverIndicador(seleccionada);
    window.addEventListener("resize", alRedimensionar);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", alRedimensionar);
    };
  }, [moverIndicador, seleccionada]);

  function activar(indice: number) {
    setSeleccionada(indice);
    moverIndicador(indice);
  }

  function volverAlInicio() {
    setSeleccionada(0);
    moverIndicador(0);
  }

  return (
    <ul
      ref={menuRef}
      className={estilos.menu}
      role="list"
      onMouseLeave={volverAlInicio}
      style={{ position: "relative" }}
    >
      {competiciones.map((competicion, indice) => {
        const activa = indice === seleccionada;

        return (
          <li
            key={competicion.titulo}
            className={`${estilos.item} ${activa ? estilos.itemActivo : ""}`}
          >
            <Link
              ref={(elemento) => {
                enlacesRef.current[indice] = elemento;
              }}
              className={estilos.botonCompeticion}
              href={competicion.href}
              aria-label={`Ir a ${competicion.titulo}`}
              onMouseEnter={() => activar(indice)}
              onFocus={() => activar(indice)}
            >
              <span className={estilos.nombreCompeticion}>{competicion.titulo}</span>
              <span className={estilos.estadoCompeticion}>{competicion.subtitulo}</span>
            </Link>
          </li>
        );
      })}

      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          zIndex: 5,
          left: `${indicador.left}px`,
          top: `${indicador.top}px`,
          width: `${indicador.width}px`,
          height: "4px",
          borderRadius: "999px",
          background: "#56afe2",
          opacity: indicador.visible ? 1 : 0,
          pointerEvents: "none",
          transition:
            "left 230ms cubic-bezier(.22,.8,.22,1), top 230ms cubic-bezier(.22,.8,.22,1), width 230ms cubic-bezier(.22,.8,.22,1), opacity 140ms ease",
        }}
      />
    </ul>
  );
}
