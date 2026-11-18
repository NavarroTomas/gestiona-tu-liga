import Manager from "@/components/platform-v1/Manager";
export default async function PanelPage({params}:{params:Promise<{leagueId:string}>}){const {leagueId}=await params;return <Manager leagueId={leagueId}/>;}
