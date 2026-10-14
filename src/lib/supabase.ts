import {createClient,type SupabaseClient} from "@supabase/supabase-js";
import {getActiveLocalLeague,localLeagueClient} from "./localLeagueClient";
let realClient:SupabaseClient|undefined;
function currentClient():SupabaseClient{
 const league=getActiveLocalLeague();
 if(league)return localLeagueClient(league.id) as unknown as SupabaseClient;
 if(!realClient){const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;if(!url||!key)throw new Error("Seleccioná una liga desde Mis ligas para usar la demostración local. La conexión real aún no está configurada.");realClient=createClient(url,key);}
 return realClient;
}
export const supabase=new Proxy({} as SupabaseClient,{get(_target,property){const client=currentClient();const value=Reflect.get(client,property);return typeof value==="function"?value.bind(client):value;}});
