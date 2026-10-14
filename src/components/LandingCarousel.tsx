"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "@/app/landing.module.css";

// Reemplazá cada texto e imagen para personalizar el carrusel.
const slides = [
  { image: "/themes/worldcup-real/photos/stadium-wide.jpg", text: "Ejemplo" },
  { image: "/themes/worldcup-real/photos/pitch-lights.jpg", text: "Ejemplo" },
  { image: "/themes/worldcup-real/photos/stadium-night.jpg", text: "Ejemplo" },
];

export default function LandingCarousel() {
  const [active, setActive] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(true);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(preference.matches);
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive(current => (current + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);
  return <section className={styles.hero} aria-label="Presentación" aria-roledescription="carrusel">
    {slides.map((slide,index) => <div key={slide.image} className={styles.slide} data-active={index === active} aria-hidden={index !== active}>
      <Image src={slide.image} alt="" fill sizes="100vw" priority={index === 0} className={styles.heroImage} />
      <div className={styles.shade} />
    </div>)}
    <div className={styles.heroContent}><h1 key={active} className={styles.heroTitle}>{slides[active].text}</h1></div>
  </section>;
}
