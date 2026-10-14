"use client";
import { Suspense } from "react";
import Link from "next/link";
import {getActiveLocalLeague} from "@/lib/localLeagueClient";
import APAHeader from "./APAHeader";
import APAFooter from "./APAFooter";
import BienvenidaAPA from "./BienvenidaAPA";
import IntroAPA from "./IntroAPA";
import CookieConsent from "./CookieConsent";
import SiteEditorRuntime from "./site-editor/SiteEditorRuntime";
export default function LegacyLeagueShell({children}: {children: React.ReactNode}) {
  if(getActiveLocalLeague())return <><APAHeader />{children}<APAFooter /></>;
  if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)return <main style={{minHeight:"100vh",background:"#f6f5f1",color:"#222",padding:"100px 8%"}}><h1 style={{fontSize:42}}>Elegí una liga para continuar.</h1><p style={{marginTop:20}}>Abrí una de tus ligas para ver su web y administrarla.</p><Link href="/mis-ligas" style={{display:"inline-block",marginTop:30,textDecoration:"underline"}}>Ir a Mis ligas</Link></main>;
  return <><IntroAPA /><BienvenidaAPA /><APAHeader />{children}<APAFooter /><CookieConsent /><Suspense fallback={null}><SiteEditorRuntime /></Suspense></>;
}
