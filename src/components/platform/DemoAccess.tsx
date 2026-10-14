"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SESSION_KEY } from "./demo-storage";
import styles from "./platform.module.css";

export default function DemoAccess({registering=false}:{registering?:boolean}){
  const router=useRouter();const [name,setName]=useState("");const [error,setError]=useState("");const [busy,setBusy]=useState(false);
  function enter(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();setError("");setBusy(true);
    try{localStorage.setItem(SESSION_KEY,JSON.stringify({name:name.trim()||"Invitado"}));router.replace("/mis-ligas");}
    catch{setError("No se pudo guardar la sesión. Habilitá el almacenamiento del navegador y volvé a intentar.");setBusy(false);}
  }
  return <main className={styles.platform}><header className={styles.header}><Link href="/" className={styles.brand}>Gestioná tu Liga</Link><Link href={registering?"/login":"/registro"}>{registering?"Iniciar sesión":"Crear cuenta"}</Link></header><div className={styles.accessGrid}><section className={styles.accessIntro}><h1>{registering?"Tu liga empieza acá.":"Volvé a tu liga."}</h1><p>Partidos, equipos y estadísticas en un mismo lugar.</p></section><section className={styles.accessForm} aria-label="Acceso de demostración"><span className={styles.demo}>Modo de prueba</span><h2>{registering?"Probá la plataforma":"Entrá a la plataforma"}</h2><p>Podés entrar sin una cuenta real. Elegí un nombre o seguí como invitado.</p><form onSubmit={enter}><label htmlFor="demo-name">Nombre o alias (opcional)</label><input id="demo-name" name="name" autoComplete="nickname" maxLength={60} value={name} onChange={e=>setName(e.target.value)} placeholder="Cómo te llamamos"/><button type="submit" className={styles.primary} disabled={busy}>{busy?"Entrando…":"Entrar a la demo"}</button><p role="alert" className={styles.error}>{error}</p></form><p className={styles.note}>Los datos de prueba se guardan solo en este navegador. No se crea una cuenta ni se solicita una contraseña.</p></section></div></main>;
}
