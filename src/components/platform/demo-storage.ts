export const SESSION_KEY="gtl:demo:session:v1";
export const LEAGUES_KEY="gtl:demo:leagues:v1";
export type DemoSession={name:string};
export type DemoLeague={id:string;name:string;mode:"teams"|"players"};
export function readSession(): DemoSession|null {
  const value=JSON.parse(localStorage.getItem(SESSION_KEY)??"null");
  return value && typeof value.name==="string" ? {name:value.name} : null;
}
export function readLeagues():DemoLeague[]{
  const value=JSON.parse(localStorage.getItem(LEAGUES_KEY)??"[]");
  if(!Array.isArray(value))return [];
  return value.filter((v):v is DemoLeague=>!!v && typeof v.id==="string" && typeof v.name==="string" && (v.mode==="teams"||v.mode==="players"));
}
