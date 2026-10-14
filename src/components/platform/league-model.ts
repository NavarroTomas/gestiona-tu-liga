import {buildStandings} from "../../lib/homePortal";
import type {DemoLeague} from "./demo-storage";

export type Team={id:string;name:string};
export type Player={id:string;name:string;teamId:string};
export type Stat={playerId:string;side:"home"|"away";goals:number;assists:number};
export type Match={id:string;round:number;date:string;home:string;away:string;homeScore:number|null;awayScore:number|null;stats:Stat[]};
export type News={id:string;title:string;body:string;createdAt:string};
export type LeagueData={version:1;season:string;description:string;teams:Team[];players:Player[];matches:Match[];news:News[]};
export const leagueKey=(id:string)=>"gtl:demo:league:"+id+":v1";
export const emptyLeague=():LeagueData=>({version:1,season:"Temporada 1",description:"",teams:[],players:[],matches:[],news:[]});
export function loadLeague(id:string):LeagueData{
 const raw=localStorage.getItem(leagueKey(id));if(!raw)return emptyLeague();
 const d=JSON.parse(raw);
 if(!d||d.version!==1||typeof d.season!=="string"||typeof d.description!=="string"||![d.teams,d.players,d.matches,d.news].every(Array.isArray))throw new Error("Los datos guardados de esta liga no son compatibles.");
 return d;
}
export const isComplete=(m:Match)=>m.homeScore!==null&&m.awayScore!==null;
export function teamStandings(data:LeagueData){
 const names=new Map(data.teams.map(t=>[t.id,t.name]));
 const rows=buildStandings(data.matches.filter(isComplete).map(m=>({id:m.id,local:m.home,visitante:m.away,resultado:m.homeScore+"-"+m.awayScore,division:"Primera",competicion:"liga"})),"Primera");
 const byId=new Map(rows.map(r=>[r.club,r]));
 return data.teams.map(t=>({...byId.get(t.id)??{club:t.id,pts:0,pj:0,g:0,e:0,p:0,dg:0,gf:0},name:names.get(t.id)??t.name})).sort((a,b)=>b.pts-a.pts||b.dg-a.dg||b.gf-a.gf||a.name.localeCompare(b.name));
}
export function playerStandings(data:LeagueData){
 const rows=new Map(data.players.map(p=>[p.id,{id:p.id,name:p.name,teamId:p.teamId,played:0,won:0,drawn:0,lost:0,points:0,goals:0,assists:0}]));
 for(const m of data.matches.filter(isComplete))for(const stat of m.stats){
   const r=rows.get(stat.playerId);if(!r)continue;
   r.played++;r.goals+=stat.goals;r.assists+=stat.assists;
   const own=stat.side==="home"?m.homeScore!:m.awayScore!,other=stat.side==="home"?m.awayScore!:m.homeScore!;
   if(own>other){r.won++;r.points+=3;}else if(own===other){r.drawn++;r.points++;}else r.lost++;
 }
 return [...rows.values()].sort((a,b)=>b.points-a.points||b.goals-a.goals||b.assists-a.assists||a.name.localeCompare(b.name));
}
export function roundRobin(ids:string[],makeId:()=>string):Match[]{
 if(ids.length<2)throw new Error("Agregá al menos dos equipos.");
 const ring:(string|null)[]=[...ids];if(ring.length%2)ring.push(null);
 const result:Match[]=[];
 for(let round=1;round<ring.length;round++){
   for(let i=0;i<ring.length/2;i++){
     const a=ring[i],b=ring[ring.length-1-i];if(!a||!b)continue;
     result.push({id:makeId(),round,date:"",home:round%2?a:b,away:round%2?b:a,homeScore:null,awayScore:null,stats:[]});
   }
   ring.splice(1,0,ring.pop()!);
 }
 return result;
}
export function validateResult(data:LeagueData,league:DemoLeague,match:Match):string|null{
 if(!Number.isInteger(match.homeScore)||!Number.isInteger(match.awayScore)||match.homeScore!<0||match.awayScore!<0)return "Ingresá goles enteros mayores o iguales a cero.";
 if(match.home===match.away)return "Los dos equipos deben ser distintos.";
 const seen=new Set<string>();
 for(const stat of match.stats){
   const player=data.players.find(p=>p.id===stat.playerId);
   if(!player||seen.has(stat.playerId))return "Cada jugador puede participar una sola vez en el partido.";
   if(stat.side!=="home"&&stat.side!=="away")return "Elegí un lado válido para cada jugador.";
   if(league.mode==="teams"&&player.teamId!==(stat.side==="home"?match.home:match.away))return "El jugador no pertenece al equipo seleccionado.";
   if(!Number.isInteger(stat.goals)||!Number.isInteger(stat.assists)||stat.goals<0||stat.assists<0)return "Los goles y las asistencias deben ser enteros mayores o iguales a cero.";
   seen.add(stat.playerId);
 }
 for(const side of ["home","away"] as const){
   const score=side==="home"?match.homeScore!:match.awayScore!;
   if(match.stats.filter(s=>s.side===side).reduce((sum,s)=>sum+s.goals,0)>score)return "Los goles individuales superan el resultado del equipo.";
   if(match.stats.filter(s=>s.side===side).reduce((sum,s)=>sum+s.assists,0)>score)return "Las asistencias superan los goles del equipo.";
 }
 return null;
}
