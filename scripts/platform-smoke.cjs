/**
 * Integration checks against a development project with an already confirmed QA user.
 * Creates clearly labelled fictional leagues; never deletes existing data or changes Auth settings.
 * CLI: GTL_QA_EMAIL / GTL_QA_PASSWORD + .env.local, then node scripts/platform-smoke.cjs
 * Credentials and sessions are never included in the report.
 */
const assert = require('node:assert/strict');
const { createClient } = require('@supabase/supabase-js');

async function runSmoke({ client }) {
  const steps = [];
  const ok = (label, condition) => { assert.ok(condition, label); steps.push(label); };
  const must = async query => { const result = await query; if(result.error) throw result.error; return result.data; };
  const request = {
    p_request_id: crypto.randomUUID(), p_name: 'QA · Liga del barrio', p_slug: 'qa-liga-del-barrio',
    p_mode: 'teams', p_purpose: 'amateur', p_description: 'Competencia ficticia para pruebas de integración.',
    p_expected: 4, p_format: 'round_robin', p_primary: '#216348', p_secondary: '#dbe99d',
  };
  const league = await must(client.rpc('create_league', request));
  ok('League creation returned a public address', !!league.id && !!league.slug);
  const repeated = await must(client.rpc('create_league', request));
  ok('Repeating a creation request returns the same league', repeated.id === league.id);
  const memberships = await must(client.from('league_members').select('role,league:leagues(id,name)').eq('league_id',league.id));
  ok('Creator has the owner membership', memberships.length === 1 && memberships[0].role === 'owner');
  const teams = await must(client.from('teams').insert(['Los Pinos QA','Barrio Norte QA','La Ribera QA','El Cruce QA'].map(name=>({league_id:league.id,name}))).select());
  ok('Four fictional teams persisted', teams.length === 4);
  const players = await must(client.from('players').insert(teams.flatMap((team,i)=>[0,1].map(j=>({league_id:league.id,team_id:team.id,name:`Jugador QA ${i+1}.${j+1}`,position:j?'Delantero':'Arquero'})))).select());
  ok('Eight fictional players persisted', players.length === 8);
  const amount = await must(client.rpc('generate_league_fixture',{p_league_id:league.id}));
  ok('Four-team round robin creates six matches', amount === 6);
  const matches = await must(client.from('matches').select('*').eq('league_id',league.id));
  ok('Fixture is persisted and contains every pair once', matches.length === 6 && new Set(matches.map(m=>[m.home_team_id,m.away_team_id].sort().join('/'))).size === 6);
  const duplicate = await client.rpc('generate_league_fixture',{p_league_id:league.id});
  ok('Generating the fixture twice is rejected', !!duplicate.error);
  const match = matches[0], home = players.find(p=>p.team_id===match.home_team_id), away = players.find(p=>p.team_id===match.away_team_id);
  const line = (player,side,goals,rating) => ({player_id:player.id,side,goals,assists:0,yellow_cards:0,red_cards:0,rating});
  await must(client.rpc('save_match_result',{p_match_id:match.id,p_home:2,p_away:1,p_players:[line(home,'home',2,8),line(away,'away',1,7)]}));
  let saved = await must(client.from('matches').select('*').eq('id',match.id).single());
  ok('Result is stored as completed', saved.status==='completed' && saved.home_score===2 && saved.away_score===1);
  let stats = await must(client.from('match_players').select('*').eq('match_id',match.id));
  ok('Two player appearances persisted with rating', stats.length===2 && Number(stats.find(s=>s.player_id===home.id).rating)===8);
  await must(client.rpc('save_match_result',{p_match_id:match.id,p_home:0,p_away:0,p_players:[line(home,'home',0,6)]}));
  stats = await must(client.from('match_players').select('*').eq('match_id',match.id));
  ok('Editing replaces statistics without duplication', stats.length===1 && stats[0].goals===0);
  const invalid = await client.rpc('save_match_result',{p_match_id:match.id,p_home:0,p_away:0,p_players:[line(home,'home',1,6)]});
  ok('Impossible individual goals are rejected', !!invalid.error);
  saved = await must(client.from('matches').select('*').eq('id',match.id).single());
  stats = await must(client.from('match_players').select('*').eq('match_id',match.id));
  ok('Rejected result leaves the previous result and statistics unchanged', saved.home_score===0 && stats.length===1 && stats[0].goals===0);
  const direct = await client.from('matches').update({home_score:999}).eq('id',match.id);
  ok('Direct score manipulation is denied', !!direct.error);
  await must(client.from('news').insert([{league_id:league.id,title:'Primera fecha QA',body:'Noticia ficticia publicada.',published:true},{league_id:league.id,title:'Borrador QA',body:'Este borrador no debe ser público.',published:false}]));
  const { data:{session} } = await client.auth.getSession();
  const url = client.supabaseUrl;
  const key = client.supabaseKey;
  const anonymous = createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const publicLeague = await must(anonymous.from('leagues').select('id,slug').eq('slug',league.slug).single());
  ok('Anonymous visitor can open the league by its public address', publicLeague.id===league.id);
  const publicNews = await must(anonymous.from('news').select('title').eq('league_id',league.id));
  ok('Public news excludes unpublished drafts', publicNews.length===1 && publicNews[0].title==='Primera fecha QA');
  const anonymousWrite = await anonymous.from('teams').insert({league_id:league.id,name:'Intruso QA'});
  ok('Anonymous writes are rejected', !!anonymousWrite.error);
  const publicMembers = await anonymous.from('league_members').select('*');
  ok('Memberships remain private', !!publicMembers.error);
  await must(client.from('leagues').update({primary_color:'#234f8c',points_win:5}).eq('id',league.id));
  const configured = await must(client.from('leagues').select('primary_color,points_win').eq('id',league.id).single());
  ok('Identity and scoring settings persist', configured.primary_color==='#234f8c' && configured.points_win===5);
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1cAAAAASUVORK5CYII=','base64');
  const imagePath = `${league.id}/${crypto.randomUUID()}.png`;
  await must(client.storage.from('league-images').upload(imagePath,png,{contentType:'image/png',upsert:false}));
  const publicImage = client.storage.from('league-images').getPublicUrl(imagePath).data.publicUrl;
  const imageResponse = await fetch(publicImage);
  ok('Image upload produces an accessible public image', imageResponse.status===200 && imageResponse.headers.get('content-type')?.includes('image/png'));
  const friends = await must(client.rpc('create_league',{...request,p_request_id:crypto.randomUUID(),p_name:'QA · Amigos del sábado',p_slug:'qa-amigos-del-sabado',p_mode:'players',p_purpose:'friends',p_format:'friendly'}));
  const friendsPlayers = await must(client.from('players').insert(['Amigo QA 1','Amigo QA 2','Amigo QA 3','Amigo QA 4'].map(name=>({league_id:friends.id,name}))).select());
  const friendlyId = await must(client.rpc('create_friendly_match',{p_league_id:friends.id,p_home_label:'Equipo A',p_away_label:'Equipo B',p_home_players:friendsPlayers.slice(0,2).map(p=>p.id),p_away_players:friendsPlayers.slice(2).map(p=>p.id),p_starts_at:null,p_venue:'Cancha QA',p_round:1}));
  const friendlyStats = await must(client.from('match_players').select('*').eq('match_id',friendlyId));
  ok('Changing-team match stores four participants', friendlyStats.length===4);
  const friendRows = friendsPlayers.map((p,i)=>line(p,i<2?'home':'away',i===0?1:0,7));
  await must(client.rpc('save_match_result',{p_match_id:friendlyId,p_home:1,p_away:0,p_players:friendRows}));
  const friendMatch = await must(client.from('matches').select('*').eq('id',friendlyId).single());
  ok('Friends match accepts a result with individual appearances', friendMatch.status==='completed');
  const cross = await client.from('players').insert({league_id:friends.id,team_id:teams[0].id,name:'Relación cruzada QA'});
  ok('Composite keys reject cross-league relationships', !!cross.error);
  const scoped = await must(client.from('teams').select('id').eq('league_id',friends.id));
  ok('Team data stays scoped to its league', scoped.length===0);
  ok('Authenticated session stayed valid during the workflow', !!session);
  return {checked_at:new Date().toISOString(),project_ref:'ilkkqynzvwskpwjgtapi',steps,checks_passed:steps.length,fixtures:{league,friends},note:'Fictional QA data retained, separate from user-created leagues. Browser and email-link checks are separate.'};
}
module.exports = {runSmoke};
if(require.main===module){
  try{process.loadEnvFile('.env.local');}catch{}
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if(!url||!key||!process.env.GTL_QA_EMAIL||!process.env.GTL_QA_PASSWORD)throw new Error('Configure public project settings and QA credentials in environment variables.');
  const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  (async()=>{const {error}=await client.auth.signInWithPassword({email:process.env.GTL_QA_EMAIL,password:process.env.GTL_QA_PASSWORD});if(error)throw error;const report=await runSmoke({client});console.log(JSON.stringify(report,null,2));await client.auth.signOut({scope:'local'});})().catch(error=>{console.error(error.message);process.exitCode=1;});
}
