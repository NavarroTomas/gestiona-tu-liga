"use client";
import {useState} from "react";
import Link from "next/link";
import {platformClient,messageFor} from "@/lib/platform/client";
import {Header,Notice,usePlatformSession} from "@/components/platform-v1/ui";
import s from "@/components/platform-v1/platform.module.css";
export default function Recovery(){const {user,ready}=usePlatformSession(),[password,setPassword]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false),[done,setDone]=useState(false);
async function save(e:React.FormEvent){e.preventDefault();setBusy(true);try{if(password.length<10)throw new Error("Usá al menos 10 caracteres.");const {error}=await platformClient().auth.updateUser({password});if(error)throw error;setPassword("");setDone(true);}catch(e){setError(messageFor(e));}finally{setBusy(false);}}
return <><Header/><main className={s.page}><div className={s.authBox} style={{maxWidth:500,margin:"auto"}}><h1>Recuperar acceso</h1>{done?<><Notice>Tu contraseña quedó actualizada.</Notice><Link href="/mis-ligas" className={s.button}>Ir a mis ligas</Link></>:ready&&user?<form className={s.form} onSubmit={save}><label className={s.field}>Nueva contraseña<input required minLength={10} type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)}/></label><button className={s.button} disabled={busy}>{busy?"Guardando…":"Guardar contraseña"}</button>{error&&<Notice error>{error}</Notice>}</form>:<p>Abrí esta página desde el enlace de recuperación que recibiste por correo.</p>}</div></main></>;}
