import {readSession,readLeagues,type DemoLeague} from "../components/platform/demo-storage";
import {loadLeague} from "../components/platform/league-model";

type Row=Record<string,any>;
type Store={version:1;tables:Record<string,Row[]>};
export const ACTIVE_LEAGUE_KEY="gtl:active-league:v1";
export function getActiveLocalLeague():DemoLeague|null{
 if(typeof window==="undefined")return null;
 try{if(!readSession())return null;const id=localStorage.getItem(ACTIVE_LEAGUE_KEY);return readLeagues().find(l=>l.id===id)??null;}catch{return null;}
}
export function selectLocalLeague(id:string){
 if(!readSession()||!readLeagues().some(l=>l.id===id))throw new Error("La liga no está disponible en esta sesión de prueba.");
 localStorage.setItem(ACTIVE_LEAGUE_KEY,id);getStore(id);
}
const key=(id:string)=>"gtl:apa:league:"+id+":v1";
function persist(id:string,store:Store){localStorage.setItem(key(id),JSON.stringify(store));}
function getStore(id:string):Store{
 const saved=localStorage.getItem(key(id));if(saved){const value=JSON.parse(saved);if(value.version!==1||!value.tables)throw new Error("Formato local no compatible.");for(const table of ["site_editor_drafts","site_public_pages"]){const rows=value.tables[table]??[];const latest=new Map<string,Row>();for(const row of rows){const old=latest.get(row.page_key);if(!old||String(row.updated_at??row.published_at??row.created_at??"")>=String(old.updated_at??old.published_at??old.created_at??""))latest.set(row.page_key,row);}value.tables[table]=[...latest.values()];}return value;}
 const d=loadLeague(id),league=readLeagues().find(l=>l.id===id)!;
 const teamName=(teamId:string)=>d.teams.find(t=>t.id===teamId)?.name??teamId;
 const stats=d.matches.flatMap(m=>m.stats.map((s,i)=>({id:m.id+"-"+i,partido_id:m.id,playerId:s.playerId,nombre:d.players.find(p=>p.id===s.playerId)?.name??s.playerId,equipo:league.mode==="teams"?teamName(s.side==="home"?m.home:m.away):(s.side==="home"?m.home:m.away),temporada:d.season,division:"Primera",fecha:String(m.round),goals:s.goals,assists:s.assists,mvp:0,rating_apa:0,score:0,posicion:"N/D"})));
 const teamRows=d.teams.map(t=>({id:t.id,nombre:t.name,slug:t.name.toLowerCase().replace(/[^a-z0-9]+/g,"-"),logo_url:null,banner_url:null,descripcion:null,color_principal:"#245f8e"}));
 const temporary=league.mode==="players"?[...new Set(d.matches.flatMap(m=>[m.home,m.away]))].map((nombre,i)=>({id:"side-"+i,nombre,slug:nombre.toLowerCase().replace(/[^a-z0-9]+/g,"-"),logo_url:null})):[];
 const clubs=[...teamRows,...temporary];
 const userId="local-demo-"+id;
 const store:Store={version:1,tables:{
 temporadas:[{id:1,nombre:d.season,numero:Number(d.season.match(/\d+/)?.[0]??1),activa:true,estado:"en_curso",configuracion:{}}],
 clubes_info:clubs,clubes_temporada:clubs.map((t,i)=>({id:i+1,club_id:t.id,temporada:d.season,division:"Primera",activo:true})),
 partidos:d.matches.map((m,i)=>({id:i+1,partido_id:m.id,local:league.mode==="teams"?teamName(m.home):m.home,visitante:league.mode==="teams"?teamName(m.away):m.away,resultado:m.homeScore===null||m.awayScore===null?null:m.homeScore+"-"+m.awayScore,fecha:String(m.round),temporada:d.season,division:"Primera",competicion:"liga",dia:m.date?m.date.slice(0,10):null,hora:m.date?m.date.slice(11,16):null,estado:m.homeScore===null?"programado":"cargado",grupo:null,fase:null,ronda:null})),
 plantillas:d.players.map((p,i)=>({id:i+1,jugador:p.name,playerid:p.id,equipo:p.teamId?teamName(p.teamId):null,temporada:d.season,division:"Primera",estado:"activo",posicion:"N/D",profile_id:null,steam_id:null})),
 estadisticas_jugadores:stats,estadisticas_equipos:d.matches.flatMap(m=>[m.home,m.away].map((name,i)=>({id:m.id+"-team-"+i,partido_id:m.id,equipo:league.mode==="teams"?teamName(name):name,temporada:d.season,division:"Primera",fecha:String(m.round),goals:i?m.awayScore:m.homeScore}))),
 noticias:d.news.map(n=>({id:n.id,titulo:n.title,descripcion:n.body,created_at:n.createdAt,updated_at:n.createdAt,temporada:d.season,categoria:"General",publicada:true,destacada:false,imagen_url:null,autor:readSession()?.name??"Organizador"})),
 profiles:[{id:userId,display_name:readSession()?.name??"Invitado",username:"organizador",visible_role:"staff",role:"admin",status:"active",avatar_url:null}],
 site_editor_owners:[{user_id:userId}],competicion_config:[{id:"liga",temporada:d.season,slug:"liga",nombre:"Liga",tipo:"liga",activa:true,orden:1,reglas:{}}]
 }};persist(id,store);return store;
}
function view(store:Store,table:string):Row[]{
 const t=store.tables;
 if(table==="v_clubes_temporada_public")return (t.clubes_temporada??[]).flatMap(a=>{const c=(t.clubes_info??[]).find(c=>c.id===a.club_id);return c?[{...c,...a,id:c.id,club_id:c.id}]:[];});
 if(table==="v_ranking_jugadores"){
   const rows=new Map<string,Row>();
   for(const s of t.estadisticas_jugadores??[]){const id=s.temporada+"/"+s.playerId;const r=rows.get(id)??{temporada:s.temporada,division:s.division,playerId:s.playerId,nombre:s.nombre,equipo:s.equipo,posicion:s.posicion,partidos_jugados:0,goals:0,assists:0,mvp:0,rating_apa_promedio:0,score_total:0};r.partidos_jugados++;for(const field of ["goals","assists","mvp"])r[field]+=Number(s[field]??0);r.score_total+=Number(s.score??0);rows.set(id,r);}return [...rows.values()];
 }
 return t[table]??[];
}
const comparable=(v:unknown)=>v===null||v===undefined?"":String(v);
function splitFilters(value:string){const parts:string[]=[];let depth=0,start=0;for(let i=0;i<value.length;i++){if(value[i]==="(")depth++;if(value[i]===")")depth--;if(value[i]===","&&depth===0){parts.push(value.slice(start,i));start=i+1;}}parts.push(value.slice(start));return parts;}
function expression(row:Row,expr:string):boolean{
 if(expr.startsWith("and("))return splitFilters(expr.slice(4,-1)).every(x=>expression(row,x));
 if(expr.startsWith("or("))return splitFilters(expr.slice(3,-1)).some(x=>expression(row,x));
 const [field,op,...rest]=expr.split(".");const val=rest.join(".");
 if(op==="eq")return comparable(row[field])===val;
 if(op==="neq")return comparable(row[field])!==val;
 if(op==="is")return val==="null"?row[field]==null:comparable(row[field])===val;
 if(op==="in")return val.replace(/^\(|\)$/g,"").split(",").includes(comparable(row[field]));
 if(op==="ilike")return comparable(row[field]).toLowerCase().includes(val.replaceAll("%","").toLowerCase());
 throw new Error("Filtro local no implementado: "+op);
}
class LocalQuery implements PromiseLike<any>{
 private filters:((row:Row)=>boolean)[]=[];private orders:{field:string;asc:boolean}[]=[];private offset=0;private size=Infinity;private singular=false;private strict=false;private head=false;private operation="select";private payload:Row[]=[];private conflicts="id";private returning=false;
 constructor(private leagueId:string,private table:string){}
 select(_columns="*",options?:{head?:boolean}){this.head=options?.head??false;this.returning=true;return this;}
 eq(k:string,v:unknown){this.filters.push(r=>comparable(r[k])===comparable(v));return this;}
 neq(k:string,v:unknown){this.filters.push(r=>comparable(r[k])!==comparable(v));return this;}
 in(k:string,values:unknown[]){this.filters.push(r=>values.some(v=>comparable(r[k])===comparable(v)));return this;}
 is(k:string,v:unknown){this.filters.push(r=>v===null?r[k]==null:r[k]===v);return this;}
 not(k:string,op:string,v:unknown){this.filters.push(r=>!expression(r,k+"."+op+"."+comparable(v)));return this;}
 ilike(k:string,v:string){const str=v.replaceAll("%","").toLowerCase();this.filters.push(r=>v.includes("%")?comparable(r[k]).toLowerCase().includes(str):comparable(r[k]).toLowerCase()===str);return this;}
 like(k:string,v:string){return this.ilike(k,v);}
 gt(k:string,v:any){this.filters.push(r=>r[k]>v);return this;}gte(k:string,v:any){this.filters.push(r=>r[k]>=v);return this;}lt(k:string,v:any){this.filters.push(r=>r[k]<v);return this;}lte(k:string,v:any){this.filters.push(r=>r[k]<=v);return this;}
 or(value:string){this.filters.push(r=>splitFilters(value).some(x=>expression(r,x)));return this;}
 order(field:string,opts?:{ascending?:boolean;nullsFirst?:boolean}){this.orders.push({field,asc:opts?.ascending!==false});return this;}
 limit(n:number){this.size=n;return this;}range(from:number,to:number){this.offset=from;this.size=to-from+1;return this;}
 single(){this.singular=true;this.strict=true;return this;}maybeSingle(){this.singular=true;return this;}
 insert(payload:Row|Row[]){this.operation="insert";this.payload=Array.isArray(payload)?payload:[payload];return this;}
 upsert(payload:Row|Row[],opts?:{onConflict?:string}){this.operation="upsert";this.payload=Array.isArray(payload)?payload:[payload];this.conflicts=opts?.onConflict??(["site_editor_drafts","site_public_pages"].includes(this.table)?"page_key":"id");return this;}
 update(payload:Row){this.operation="update";this.payload=[payload];return this;}
 delete(){this.operation="delete";return this;}
 then<TResult1=any,TResult2=never>(onfulfilled?:((value:any)=>TResult1|PromiseLike<TResult1>)|null,onrejected?:((reason:any)=>TResult2|PromiseLike<TResult2>)|null):PromiseLike<TResult1|TResult2>{return Promise.resolve().then(()=>this.execute()).then(onfulfilled,onrejected);}
 private execute(){try{
   const league=getActiveLocalLeague();if(!league||league.id!==this.leagueId)throw new Error("La liga activa cambió. Recargá esta página.");
   const store=getStore(this.leagueId);let rows=view(store,this.table);const matches=(r:Row)=>this.filters.every(f=>f(r));
   if(this.operation!=="select"){
     if(this.table.startsWith("v_"))throw new Error("Esta vista es de solo lectura.");
     rows=store.tables[this.table]??=[];let changed:Row[]=[];
     if(this.operation==="update"){if(!this.filters.length)throw new Error("La edición necesita un filtro.");changed=rows.filter(matches);for(const r of changed)Object.assign(r,this.payload[0]);}
     else if(this.operation==="delete"){if(!this.filters.length)throw new Error("La eliminación necesita un filtro.");changed=rows.filter(matches);store.tables[this.table]=rows.filter(r=>!matches(r));}
     else for(const payload of this.payload){const fields=this.conflicts.split(",");const old=this.operation==="upsert"?rows.find(r=>fields.every(f=>payload[f]!==undefined&&comparable(r[f])===comparable(payload[f]))):null;if(old){Object.assign(old,payload);changed.push(old);}else{const next={id:payload.id??(Math.max(0,...rows.map(r=>Number(r.id)||0))+1),created_at:new Date().toISOString(),...payload};rows.push(next);changed.push(next);}}
     persist(this.leagueId,store);rows=changed;
   }else rows=rows.filter(matches);
   const count=rows.length;
   rows=[...rows].sort((a,b)=>{for(const o of this.orders){const va=a[o.field],vb=b[o.field];const c=typeof va==="number"&&typeof vb==="number"?va-vb:comparable(va).localeCompare(comparable(vb),"es",{numeric:true});if(c)return o.asc?c:-c;}return 0;}).slice(this.offset,this.offset+this.size);
   if(this.singular&&(rows.length>1||(this.strict&&rows.length===0)))throw new Error("No se encontró un único registro.");
   return {data:this.head?null:this.singular?rows[0]??null:this.operation!=="select"&&!this.returning?null:rows,error:null,count};
 }catch(e){return {data:null,error:{message:e instanceof Error?e.message:"Error de almacenamiento local",code:"LOCAL_DEMO"},count:0};}}
}
export function localLeagueClient(leagueId:string){
 const user={id:"local-demo-"+leagueId,email:undefined,user_metadata:{},app_metadata:{},aud:"local-demo",created_at:new Date(0).toISOString()};
 const error=(message:string)=>({data:null,error:{message,code:"LOCAL_DEMO"}});
 return {
  from:(table:string)=>new LocalQuery(leagueId,table),
  auth:{getUser:async()=>({data:{user},error:null}),getSession:async()=>({data:{session:{user,access_token:"local-demo-only"}},error:null}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),signOut:async()=>{localStorage.removeItem("gtl:demo:session:v1");localStorage.removeItem(ACTIVE_LEAGUE_KEY);sessionStorage.removeItem(ACTIVE_LEAGUE_KEY);return {error:null};}},
  rpc:async(name:string,args:Row={})=>{try{
    if(getActiveLocalLeague()?.id!==leagueId)return error("La liga activa cambió.");
    if(name==="get_my_permissions")return {data:["admin.owner"],error:null};
    const store=getStore(leagueId);
    if(name==="publish_site_page"){
      const key=args.p_page_key??"home";
      const draft=(store.tables.site_editor_drafts??[]).find(d=>d.page_key===key);
      if(!draft?.document)return error("Guardá un borrador antes de publicar.");
      const versions=store.tables.site_editor_versions??=[];
      const version=Math.max(0,...versions.filter(v=>v.page_key===key).map(v=>Number(v.version_number)||0))+1;
      const now=new Date().toISOString(),document=structuredClone(draft.document);
      versions.push({id:crypto.randomUUID(),page_key:key,version_number:version,document,created_at:now});
      store.tables.site_public_pages=[...(store.tables.site_public_pages??[]).filter(p=>p.page_key!==key),{page_key:key,document,version_number:version,published_at:now}];
      persist(leagueId,store);return {data:version,error:null};
    }
    if(["commit_match_data","commit_match_data_v2","void_match_data","update_match_schedule"].includes(name)){
      const match=(store.tables.partidos??[]).find(m=>Number(m.id)===Number(args.p_match_row_id));if(!match)return error("El partido no existe en esta liga.");
      const before=JSON.parse(JSON.stringify(match));
      if(name==="update_match_schedule")Object.assign(match,{fecha:args.p_fecha,dia:args.p_dia,hora:args.p_hora});
      else{
        Object.assign(match,name==="void_match_data"?{resultado:null,estado:"programado"}:args.p_match_patch);
        for(const [table,rows] of [["estadisticas_jugadores",args.p_player_stats??[]],["estadisticas_equipos",args.p_team_stats??[]]] as [string,Row[]][]){store.tables[table]=(store.tables[table]??[]).filter(s=>s.partido_id!==before.partido_id&&s.partido_id!==match.partido_id);if(name!=="void_match_data")store.tables[table].push(...rows);}
        if(args.p_clear_segments)store.tables.partido_txt_segmentos=(store.tables.partido_txt_segmentos??[]).filter(s=>s.partido_row_id!==String(match.id));
        if(args.p_segments)store.tables.partido_txt_segmentos=(store.tables.partido_txt_segmentos??[]).concat(args.p_segments);
      }
      const revisions=store.tables.match_revisions??=[];const revision=revisions.filter(r=>r.partido_row_id===match.id).length+1;
      revisions.push({id:crypto.randomUUID(),partido_row_id:match.id,partido_id:match.partido_id,revision_number:revision,source:args.p_source??name,reason:args.p_reason,snapshot_before:before,snapshot_after:{...match},created_at:new Date().toISOString()});
      persist(leagueId,store);return {data:{ok:true,partido_row_id:match.id,partido_id:match.partido_id,revision},error:null};
    }
    return error("Esta operación todavía no está adaptada al modo local: "+name);
  }catch(e){return error(e instanceof Error?e.message:"No se pudo guardar.");}},
  storage:{from:(bucket:string)=>({upload:async(path:string,file:File)=>{try{if(!["image/jpeg","image/png","image/webp"].includes(file.type))return error("Formato de imagen no admitido.");const data=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsDataURL(file);});localStorage.setItem(key(leagueId)+":file:"+bucket+":"+path,data);return {data:{path},error:null};}catch{return error("No hay espacio para guardar la imagen local.");}},getPublicUrl:(path:string)=>({data:{publicUrl:localStorage.getItem(key(leagueId)+":file:"+bucket+":"+path)??""}})})},
  channel:()=>{const channel:any={on:()=>channel,subscribe:()=>channel,unsubscribe:async()=>"ok"};return channel;},removeChannel:async()=>"ok"
 };
}

export type LocalLeagueSummary={season:string;teams:number;players:number;played:number;pending:number;news:number;nextMatch:string|null;lastResult:string|null};
export function getLocalLeagueSummary(id:string):LocalLeagueSummary{
 const store=getStore(id);const t=store.tables;const matches=t.partidos??[];
 const completed=matches.filter(m=>/^\d+\s*[-:]\s*\d+$/.test(String(m.resultado??"")));
 const pending=matches.filter(m=>!completed.includes(m));
 const upcoming=[...pending].sort((a,b)=>String(a.dia??"9999").localeCompare(String(b.dia??"9999"))||String(a.hora??"").localeCompare(String(b.hora??"")))[0];
 const last=completed.at(-1);
 return {season:(t.temporadas??[]).find(s=>s.activa)?.nombre??t.temporadas?.[0]?.nombre??"Sin torneo",teams:(t.clubes_info??[]).length,players:(t.plantillas??[]).filter(p=>p.estado!=="baja").length,played:completed.length,pending:pending.length,news:(t.noticias??[]).filter(n=>n.publicada).length,nextMatch:upcoming?[upcoming.local+" — "+upcoming.visitante,upcoming.dia?new Date(upcoming.dia+"T12:00:00").toLocaleDateString("es-AR",{day:"numeric",month:"short"}):"Fecha a confirmar",upcoming.hora??""].filter(Boolean).join(" · "):null,lastResult:last?last.local+" "+last.resultado+" "+last.visitante:null};
}
