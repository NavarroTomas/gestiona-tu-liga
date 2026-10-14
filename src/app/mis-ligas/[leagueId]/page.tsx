"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {useParams} from "next/navigation";
import {selectLocalLeague} from "@/lib/localLeagueClient";
export default function LeagueRedirect(){const {leagueId}=useParams<{leagueId:string}>();const [error,setError]=useState("");useEffect(()=>{try{selectLocalLeague(leagueId);window.location.replace("/liga");}catch(e){setError(e instanceof Error?e.message:"No se pudo abrir la liga.");}},[leagueId]);return <main style={{padding:70,background:"#f6f5f1",color:"#222",minHeight:"100vh"}}><p>{error||"Abriendo la web de tu liga…"}</p>{error&&<Link href="/mis-ligas">Volver a Mis ligas</Link>}</main>;}
