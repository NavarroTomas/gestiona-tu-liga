import PublicLeague from "@/components/platform-v1/PublicLeague";
export default async function LeaguePage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <PublicLeague slug={slug}/>;}
