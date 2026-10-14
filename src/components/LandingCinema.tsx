"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "@/app/landing.module.css";

const scenes = [
  {src:"/cinema/barrio-dusk-v1.jpg", position:"65% 50%"},
  {src:"/themes/worldcup-real/photos/pitch-lights.jpg", position:"55% 55%"},
  {src:"/cinema/barrio-dusk-v1.jpg", position:"85% 55%"},
  {src:"/themes/worldcup-real/photos/pitch-lights.jpg", position:"50% 50%"},
  {src:"/cinema/barrio-dusk-v1.jpg", position:"65% 50%"},
];
export default function LandingCinema() {
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const root=ref.current;
    if(!root)return;
    const layers=Array.from(root.querySelectorAll<HTMLElement>("[data-scene]"));
    const chapters=Array.from(document.querySelectorAll<HTMLElement>("[data-chapter]"));
    const motion=matchMedia("(prefers-reduced-motion: reduce)");
    let frame=0;
    const ease=(x:number)=>{const t=Math.max(0,Math.min(1,x));return t*t*(3-2*t);};
    const update=()=>{
      let current=0;
      for(let i=0;i<chapters.length;i++)if(scrollY>=chapters[i].offsetTop-1)current=i;
      const chapter=chapters[current];if(!chapter)return;
      const local=Math.max(0,Math.min(1,(scrollY-chapter.offsetTop)/chapter.offsetHeight));
      const blend=current<chapters.length-1?ease((local-.52)/.46):0;
      layers.forEach((layer,i)=>{
        const visible=i===current?1:i===current+1?blend:0;
        layer.style.opacity=String(visible);
        layer.style.zIndex=String(i);
        const travel=i===current?local:i===current+1?blend*.15:0;
        layer.style.setProperty("--scale",String(motion.matches?1.04:1.04+travel*.14));
        layer.style.setProperty("--pan",(motion.matches?0:travel*-1.5)+"%");
      });
      chapters.forEach((panel,i)=>{
        const rect=panel.getBoundingClientRect();
        const progress=Math.max(0,Math.min(1,-rect.top/Math.max(1,panel.offsetHeight-innerHeight)));
        const opacity=motion.matches?1:1-ease((progress-.56)/.44);
        panel.style.setProperty("--copy-opacity",String(opacity));
        panel.style.setProperty("--copy-y",(motion.matches?0:progress*-28)+"px");
        if(rect.top<innerHeight*.7)panel.dataset.entered="true";
      });
    };
    const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update);};
    update();window.addEventListener("scroll",schedule,{passive:true});window.addEventListener("resize",schedule);motion.addEventListener("change",schedule);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener("scroll",schedule);window.removeEventListener("resize",schedule);motion.removeEventListener("change",schedule);};
  },[]);
  return <div ref={ref} className={styles.cinema} aria-hidden="true">{scenes.map((scene,i)=><div key={i} data-scene={i} className={styles.scene} style={{opacity:i===0?1:0}}><Image src={scene.src} alt="" fill sizes="100vw" priority={i===0} className={styles.sceneImage} style={{objectPosition:scene.position}} /></div>)}<div className={styles.grade}/><div className={styles.grain}/><div className={styles.vignette}/></div>;
}
