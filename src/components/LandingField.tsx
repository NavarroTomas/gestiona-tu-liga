"use client";
import { useEffect, useRef } from "react";
import styles from "@/app/landing.module.css";

export default function LandingField() {
  const stage = useRef<HTMLDivElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let active = true;
    let cleanup: (() => void) | undefined;
    import("./football-scene").then(({mountFootballScene}) => {
      if (!active || !canvasHost.current) return;
      try { cleanup = mountFootballScene(canvasHost.current); canvasHost.current.dataset.ready = "true"; } catch { canvasHost.current.dataset.failed = "true"; }
    }).catch(() => { if(canvasHost.current) canvasHost.current.dataset.failed = "true"; });
    return () => { active = false; cleanup?.(); };
  }, []);
  useEffect(() => {
    const node = stage.current;
    if (!node) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      const total = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const p = Math.min(1, Math.max(0, scrollY / total));
      const t = preference.matches ? 0.55 : p;
      node.style.setProperty("--zoom", String(1 + t * 1.8));
      node.style.setProperty("--tilt", (61 - t * 24) + "deg");
      node.style.setProperty("--advance", (-9 + t * 24) + "%");
      node.style.setProperty("--fence-scale", String(1 + t * 4));
      node.style.setProperty("--fence-opacity", String(Math.max(0, 1 - t * 4.8)));
      node.style.setProperty("--horizon-y", (-t * 150) + "px");
      node.style.setProperty("--ball-opacity", String(Math.max(0, (p - .76) / .24)));
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, {passive:true});
    window.addEventListener("resize", schedule);
    preference.addEventListener("change", schedule);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); preference.removeEventListener("change", schedule); };
  }, []);
  return <div ref={stage} className={styles.fieldStage} aria-hidden="true">
    <div className={styles.sky} />
    <svg className={styles.neighborhood} viewBox="0 0 1600 400" preserveAspectRatio="xMidYMax slice">
      <path fill="#21352c" d="M0 280 60 260 130 270 220 220 320 240 420 180 540 220 670 165 780 210 900 170 1020 215 1160 175 1320 225 1430 195 1600 250V400H0Z" />
      <g fill="#303d31"><path d="M0 310V255H80V220H150V280H235V245H320V310H430V265H500V320H650V285H730V330H850V275H935V315H1080V245H1155V290H1260V230H1350V295H1460V255H1600V400H0Z" /></g>
      <g stroke="#738070" strokeWidth="2" opacity=".5"><path d="M80 255V160M500 265V140M1155 290V150M1460 255V165M0 195Q300 250 500 170Q850 245 1155 180Q1400 220 1600 180" /></g>
      <g fill="#9eac85" opacity=".45"><path d="M98 245h13v17H98zM119 245h13v17h-13zM265 266h19v17h-19zM450 289h16v20h-16zM1100 267h18v17h-18zM1290 252h13v19h-13zM1312 252h13v19h-13z" /></g>
    </svg>
    <div className={styles.pitchCamera}><div className={styles.pitch}>
      <svg viewBox="0 0 1000 1500" className={styles.pitchDrawing}>
        <defs>
          <pattern id="grass" width="1000" height="240" patternUnits="userSpaceOnUse"><path fill="#466744" d="M0 0H1000V120H0Z"/><path fill="#4e7049" d="M0 120H1000V240H0Z"/></pattern>
          <filter id="grassGrain"><feTurbulence type="fractalNoise" baseFrequency=".17" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".2"/></feComponentTransfer><feBlend in="SourceGraphic" mode="soft-light"/></filter>
          <radialGradient id="worn"><stop stopColor="#b99c66" stopOpacity=".6"/><stop offset="1" stopColor="#b99c66" stopOpacity="0"/></radialGradient>
        </defs>
        <path fill="url(#grass)" filter="url(#grassGrain)" d="M0 0H1000V1500H0Z" />
        <ellipse cx="500" cy="750" rx="165" ry="190" fill="url(#worn)"/><ellipse cx="500" cy="125" rx="155" ry="130" fill="url(#worn)"/><ellipse cx="500" cy="1375" rx="160" ry="130" fill="url(#worn)"/>
        <g fill="none" stroke="#efeed9" strokeWidth="4" opacity=".78"><path d="M70 70H930V1430H70ZM70 750H930"/><circle cx="500" cy="750" r="125"/><path d="M285 70V285H715V70M385 70V155H615V70M285 1430V1215H715V1430M385 1430V1345H615V1430"/><path d="M417 285Q500 390 583 285M417 1215Q500 1110 583 1215"/></g>
        <g fill="#efeed9"><circle cx="500" cy="750" r="5"/><circle cx="500" cy="230" r="4"/><circle cx="500" cy="1270" r="4"/></g>
        <g fill="none" stroke="#dedfcd" strokeWidth="5"><path d="M415 70V12H585V70M415 1430V1488H585V1430"/></g>
        <g stroke="#dedfcd" opacity=".3"><path d="M430 12V70M450 12V70M470 12V70M490 12V70M510 12V70M530 12V70M550 12V70M570 12V70M415 32H585M415 52H585"/></g>
      </svg>
    </div></div>
    <div className={styles.fence}><div /><div /></div>
    <div ref={canvasHost} className={styles.webglHost} />
    <div className={styles.sceneShade} />
    <svg className={styles.ball} viewBox="0 0 120 120"><defs><radialGradient id="ballLight" cx="35%" cy="25%"><stop stopColor="#f4f0da"/><stop offset="1" stopColor="#c1bfa6"/></radialGradient></defs><circle cx="60" cy="60" r="53" fill="url(#ballLight)"/><g fill="#303b32"><path d="m60 38 23 17-9 26H46l-9-26ZM17 33l19-18 4 18-16 20ZM84 15l20 20-9 18-17-20ZM9 69l18 7 7 26-17-11ZM91 77l20-7-9 22-17 11ZM45 109l15-15 17 15Z"/></g><g fill="none" stroke="#485348" opacity=".5"><path d="M40 33 60 38 78 33M24 53 37 55 27 76M83 55 95 53 91 77M46 81 34 102M74 81 85 103M60 94V81"/></g></svg>
    <div className={styles.sceneGrain} />
  </div>;
}
