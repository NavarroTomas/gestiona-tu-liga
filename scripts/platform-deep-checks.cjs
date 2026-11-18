/** Development-only checks. Creates isolated QA fixtures; never touches existing leagues.
 * Credentials are provided by the caller, never written to reports.
 * Deletions only target rows created by this run. Other fixtures are retained.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const {createClient} = require('@supabase/supabase-js');

function loadPlatform(client) {
  const cache = new Map();
  function load(name) {
    if (name === 'client') return {platformClient: () => client};
    if (cache.has(name)) return cache.get(name).exports;
    const filename = path.join(__dirname, '../src/lib/platform', name + '.ts');
    const mod = new Module(filename, module);
    cache.set(name, mod);
    mod.filename = filename;
    mod.paths = module.paths;
    mod.require = id => id.startsWith('./') ? load(id.slice(2)) : require(id);
    mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText, filename);
    return mod.exports;
  }
  return {api: load('api'), domain: load('domain')};
}

async function runDeepChecks({client,onProgress = () => {}}) {
  if(new URL(client.supabaseUrl).hostname!=='ilkkqynzvwskpwjgtapi.supabase.co')
    throw Error('Refusing to run fixture mutations outside the authorized development project.');
  const results = [], started = new Date().toISOString();
  const {api, domain} = loadPlatform(client);
  const must = async query => { const r = await query; if (r.error) throw Object.assign(new Error(r.error.message), {code:r.error.code}); return r.data; };
  async function check(id, description, test) {
    onProgress({id,description,status:'running'});
    try { await test(); results.push({id,description,status:'passed'}); }
    catch(e) { results.push({id,description,status:'failed',error:e.message,code:e.code}); }
    onProgress(results.at(-1));
  }
  const reject = async (query, code) => { const r = await query; assert.ok(r.error, 'Expected server rejection'); if(code) assert.equal(r.error.code,code); };
  const label = 'QA detalle ' + started.replace(/[^0-9]/g,'').slice(0,14);
  const draft = {version:1,requestId:crypto.randomUUID(),purpose:'amateur',mode:'teams',name:label,description:'Datos ficticios de pruebas CRUD y permisos.',expectedParticipants:4,format:'round_robin',primaryColor:'#216348',secondaryColor:'#dbe99d'};
  const league = await api.createLeague(draft);
  const other = await api.createLeague({...draft,requestId:crypto.randomUUID(),name:label+' secundaria'});
  const lid=league.id;
  const teams = await must(client.from('teams').insert(['Pinos','Norte','Cruce','Ribera'].map(name=>({league_id:lid,name}))).select());
  const [home,away,third]=teams;
  let player = await must(client.from('players').insert({league_id:lid,team_id:home.id,name:'Jugador historial QA',position:'Delantero'}).select().single());
  const awayPlayer = await must(client.from('players').insert({league_id:lid,team_id:away.id,name:'Jugador rival QA'}).select().single());
  const foreignTeam = await must(client.from('teams').insert({league_id:other.id,name:'Equipo externo QA'}).select().single());
  const foreignPlayer = await must(client.from('players').insert({league_id:other.id,team_id:foreignTeam.id,name:'Jugador externo QA'}).select().single());

  await check('C01','Create/list league and owner access',async()=>{assert.ok((await api.myLeagues()).some(l=>l.id===lid));assert.equal(await api.canManage(lid),true);});
  await check('C02','Rename team, abbreviation and public readback',async()=>{await api.saveEntity('teams',{...home,name:'Pinos editado',short_name:'PE'},'update');const bundle=await api.loadLeague(league.slug,true);assert.equal(bundle.teams.find(t=>t.id===home.id).short_name,'PE');});
  await check('C03','Reject duplicate team names regardless of case and spaces',()=>reject(client.from('teams').insert({league_id:lid,name:' pINOS EDITADO '}),'23505'));
  for(const [id,patch] of [['C04',{name:' '}],['C05',{name:'x'.repeat(81)}],['C06',{name:'Abreviatura',short_name:'TOOLONG123'}]]) await check(id,'Reject invalid team '+id,()=>reject(client.from('teams').insert({league_id:lid,...patch}),'23514'));
  await check('C07','Create and delete unused team through shared API',async()=>{const id=crypto.randomUUID();await api.saveEntity('teams',{id,league_id:lid,name:'Equipo descartable'});await api.removeEntity('teams',id,lid);assert.equal((await must(client.from('teams').select('id').eq('id',id))).length,0);});
  await check('C08','Player rename and position update',async()=>{await api.saveEntity('players',{...player,name:'Jugador corregido QA',position:'Mediocampista'},'update');player=await must(client.from('players').select('*').eq('id',player.id).single());assert.equal(player.position,'Mediocampista');});
  await check('C09','Unassign and transfer player before playing',async()=>{await must(client.from('players').update({team_id:null}).eq('id',player.id));assert.equal((await must(client.from('players').select('*').eq('id',player.id).single())).team_id,null);await must(client.from('players').update({team_id:home.id}).eq('id',player.id));});
  await check('C10','Cross-league team assignment rejected by composite FK',()=>reject(client.from('players').update({team_id:foreignTeam.id}).eq('id',player.id),'23503'));
  await check('C11','Delete unused player through shared API',async()=>{const id=crypto.randomUUID();await api.saveEntity('players',{id,league_id:lid,name:'Jugador descartable'});await api.removeEntity('players',id,lid);assert.equal((await must(client.from('players').select('id').eq('id',id))).length,0);});
  await check('C12','A missing deletion must not report success',async()=>{await assert.rejects(api.removeEntity('players',crypto.randomUUID(),lid));});
  await check('C13','Deleting a team with an assigned roster is rejected',()=>reject(client.from('teams').delete().eq('id',home.id),'23503'));
  for(const table of ['teams','players','news']) await check('C-stale-'+table,'Editing a deleted '+table+' row cannot recreate it',async()=>{
    const row={id:crypto.randomUUID(),league_id:lid,...(table==='news'?{title:'QA noticia descartable',body:'Contenido ficticio',published:false}:{name:'QA registro descartable'})};
    await api.saveEntity(table,row);await api.removeEntity(table,row.id,lid);
    await assert.rejects(api.saveEntity(table,row,'update'));
    assert.equal((await must(client.from(table).select('id').eq('id',row.id))).length,0);
  });
  await check('C-scope-delete','Wrong league filter cannot report deletion success or delete the row',async()=>{await assert.rejects(api.removeEntity('players',player.id,other.id));assert.equal((await must(client.from('players').select('id').eq('id',player.id))).length,1);});

  const competition=await must(client.from('competitions').select('*').eq('league_id',lid).single());
  const mid=crypto.randomUUID();
  await api.saveEntity('matches',{id:mid,league_id:lid,competition_id:competition.id,home_team_id:home.id,away_team_id:away.id,round:1,venue:'Cancha inicial'});
  await check('M01','Edit match schedule, date, venue and round',async()=>{await must(client.from('matches').update({starts_at:'2026-11-28T21:00:00Z',venue:'Cancha corregida',round:2}).eq('id',mid));const m=await must(client.from('matches').select('*').eq('id',mid).single());assert.equal(m.venue,'Cancha corregida');assert.equal(m.round,2);assert.equal(new Date(m.starts_at).toISOString(),'2026-11-28T21:00:00.000Z');});
  const stat=(id,side,goals=0)=>({match_id:mid,league_id:lid,player_id:id,side,goals,assists:0,yellow_cards:0,red_cards:0,rating:null});
  let rows=[{...stat(player.id,'home',2),assists:1,yellow_cards:1,rating:8}, {...stat(awayPlayer.id,'away',1),red_cards:1,rating:6}];
  await api.saveResult(mid,2,1,rows);
  async function bundle(){return api.loadLeague(lid);}
  async function snapshot(){const d=await bundle();return JSON.stringify({match:d.matches.find(m=>m.id===mid),stats:d.stats.filter(s=>s.match_id===mid).sort((a,b)=>a.player_id.localeCompare(b.player_id))});}
  await check('M02','Result stores appearances, goals, assists, cards and rating',async()=>{const d=await bundle(),r=domain.playerStandings(d).find(p=>p.id===player.id);assert.equal(r.played,1);assert.equal(r.points,3);assert.equal(r.goals,2);assert.equal(r.assists,1);assert.equal(r.yellow,1);assert.equal(r.rating,8);assert.equal(domain.standings(d).find(t=>t.id===home.id).points,3);});
  await check('M03','Transfer does not rewrite past points or appearances',async()=>{await must(client.from('players').update({team_id:third.id}).eq('id',player.id));const d=await bundle();assert.equal(domain.playerStandings(d).find(p=>p.id===player.id).points,3);assert.equal(domain.standings(d).find(t=>t.id===home.id).points,3);});
  await check('M04','Correct a past result after transferring a participant',async()=>{await api.saveResult(mid,1,1,[{...rows[0],goals:1,rating:7},rows[1]]);const d=await bundle();assert.equal(domain.playerStandings(d).find(p=>p.id===player.id).points,1);assert.equal(domain.playerStandings(d).find(p=>p.id===player.id).rating,7);});
  await check('M05','Client validates historical participation after transfer',async()=>{const d=await bundle();assert.equal(domain.validateResult(d.matches.find(m=>m.id===mid),1,1,[{...rows[0],goals:1},rows[1]],d.players,d.league,d.stats),null);});
  await check('M-history-side','Transfer to opposing team cannot rewrite an existing historical side',async()=>{
    await must(client.from('players').update({team_id:away.id}).eq('id',player.id));
    try{const before=await snapshot();await reject(client.rpc('save_match_result',{p_match_id:mid,p_home:1,p_away:1,p_players:[stat(player.id,'away')]}));assert.equal(await snapshot(),before);}
    finally{await must(client.from('players').update({team_id:third.id}).eq('id',player.id));}
  });
  await check('M-scope-schedule','Wrong league filter cannot report schedule update success',async()=>{await assert.rejects(api.updateMatchSchedule(mid,other.id,{starts_at:null,venue:'Intruso',round:9,home_label:'A',away_label:'B'}));assert.equal((await must(client.from('matches').select('venue').eq('id',mid).single())).venue,'Cancha corregida');});
  // Restore current membership for independent invalid-input tests, even before the history fix.
  await must(client.from('players').update({team_id:home.id}).eq('id',player.id));
  await api.saveResult(mid,2,1,rows);
  const invalidCases=[
    ['M06',{p_home:-1,p_away:1,p_players:rows}],
    ['M07',{p_home:1.5,p_away:1,p_players:rows}],
    ['M08',{p_home:1000,p_away:1,p_players:rows}],
    ['M09',{p_home:null,p_away:1,p_players:rows}],
    ['M10',{p_home:2,p_away:1,p_players:[rows[0],rows[0]]}],
    ['M11',{p_home:2,p_away:1,p_players:[{...rows[0],goals:3}]}],
    ['M12',{p_home:2,p_away:1,p_players:[{...rows[0],assists:3}]}],
    ['M13',{p_home:2,p_away:1,p_players:[{...rows[0],rating:11}]}],
    ['M14',{p_home:2,p_away:1,p_players:[{...rows[0],rating:0}]}],
    ['M15',{p_home:2,p_away:1,p_players:[{...rows[0],yellow_cards:3}]}],
    ['M16',{p_home:2,p_away:1,p_players:[{...rows[0],red_cards:2}]}],
    ['M17',{p_home:2,p_away:1,p_players:[stat(foreignPlayer.id,'home')]}],
    ['M18',{p_home:2,p_away:1,p_players:[stat(player.id,'away')]}],
    ['M19',{p_home:2,p_away:1,p_players:null}],
    ['M20',{p_home:2,p_away:1,p_players:{}}],
  ];
  for(const [id,params] of invalidCases) await check(id,'Reject invalid result and preserve previous state: '+id,async()=>{const before=await snapshot();await reject(client.rpc('save_match_result',{p_match_id:mid,...params}));assert.equal(await snapshot(),before);});
  await check('M21','Cannot delete a player with recorded appearances',()=>reject(client.from('players').delete().eq('id',player.id),'23503'));
  await check('M22','Editing replaces totals rather than adding to previous result',async()=>{await api.saveResult(mid,0,0,[stat(player.id,'home')]);const d=await bundle(),r=domain.playerStandings(d).find(p=>p.id===player.id);assert.equal(r.goals,0);assert.equal(r.assists,0);assert.equal(r.yellow,0);assert.equal(r.rating,null);assert.equal(r.played,1);assert.equal(r.points,1);assert.equal(d.stats.length,1);});
  await check('M23','Configurable draw points recalculate existing standings',async()=>{await must(client.from('leagues').update({points_draw:4}).eq('id',lid));const d=await bundle();assert.equal(domain.standings(d).find(t=>t.id===home.id).points,4);assert.equal(domain.playerStandings(d).find(p=>p.id===player.id).points,4);});
  await check('M24','Annul removes statistics and makes zero appearances/points',async()=>{await api.saveResult(mid,null,null,[]);const d=await bundle();assert.equal(d.matches.find(m=>m.id===mid).status,'scheduled');assert.equal(d.stats.length,0);assert.equal(domain.playerStandings(d).find(p=>p.id===player.id).played,0);assert.equal(domain.standings(d).find(t=>t.id===home.id).points,0);});
  await check('M25','Deleting a match cascades its stats and recalculates rankings',async()=>{await api.saveResult(mid,2,1,rows);await api.removeEntity('matches',mid,lid);const d=await bundle();assert.equal(d.stats.length,0);assert.equal(d.matches.length,0);assert.equal(domain.playerStandings(d).find(p=>p.id===player.id).played,0);});
  await check('M26','Fixture generation uses actual teams and refuses repetition',async()=>{await api.generateFixture(lid);assert.equal((await bundle()).matches.length,6);await assert.rejects(api.generateFixture(lid));assert.equal((await bundle()).matches.length,6);});

  const newsId=crypto.randomUUID();
  await check('N01','Create and update unpublished news',async()=>{await api.saveEntity('news',{id:newsId,league_id:lid,title:'Borrador inicial QA',body:'Texto ficticio',published:false});await api.saveEntity('news',{id:newsId,league_id:lid,title:'Borrador corregido QA',body:'Contenido corregido',published:false},'update');assert.equal((await bundle()).news.find(n=>n.id===newsId).title,'Borrador corregido QA');});
  const anon=createClient(client.supabaseUrl,client.supabaseKey,{auth:{persistSession:false,autoRefreshToken:false}});
  await check('A01','Visitor can read league, teams, players, fixture and published results',async()=>{for(const table of ['leagues','teams','players','matches','match_players','seasons','divisions','competitions'])await must(anon.from(table).select('*').eq(table==='leagues'?'id':'league_id',lid));});
  await check('A02','Visitor cannot read unpublished news by guessing its UUID',async()=>{assert.equal((await must(anon.from('news').select('*').eq('id',newsId))).length,0);});
  for(const table of ['teams','players','matches','news','leagues'])for(const operation of ['insert','update','delete']) await check('A-'+table+'-'+operation,'Visitor cannot '+operation+' '+table,async()=>{const defaults={teams:{name:'Intruso'},players:{name:'Intruso'},matches:{competition_id:competition.id,home_team_id:home.id,away_team_id:away.id},news:{title:'Intruso',body:'No autorizado'},leagues:{name:'Intruso',slug:'qa-anon-'+crypto.randomUUID(),purpose:'amateur',mode:'teams',expected_participants:2,format:'round_robin'}}[table];let query=anon.from(table);query=operation==='insert'?query.insert(table==='leagues'?defaults:{league_id:lid,...defaults}):operation==='update'?query.update(table==='news'?{title:'Intruso'}:table==='matches'?{venue:'Intruso'}:{name:'Intruso'}).eq(table==='leagues'?'id':'league_id',lid):query.delete().eq(table==='leagues'?'id':'league_id',lid);await reject(query,'42501');});
  await check('A03','Visitor cannot enumerate memberships',()=>reject(anon.from('league_members').select('*')));
  await check('A04','Private schema is not exposed by REST',()=>reject(anon.schema('private').from('league_creation_requests').select('*')));
  await check('A-auth-schema','Auth users and credential tables are not exposed by REST',()=>reject(anon.schema('auth').from('users').select('*')));
  for(const [name,params] of [['generate_league_fixture',{p_league_id:lid}],['add_league_admin',{p_league_id:lid,p_email:'nobody@example.com'}],['save_match_result',{p_match_id:(await bundle()).matches[0].id,p_home:99,p_away:0,p_players:[]}]]) await check('A-rpc-'+name,'Visitor cannot call '+name,()=>reject(anon.rpc(name,params)));
  await check('A05','Publishing makes news visible and unpublishing hides it again',async()=>{await must(client.from('news').update({published:true}).eq('id',newsId));assert.equal((await must(anon.from('news').select('*').eq('id',newsId))).length,1);await must(client.from('news').update({published:false}).eq('id',newsId));assert.equal((await must(anon.from('news').select('*').eq('id',newsId))).length,0);});
  await check('N02','Delete news and verify readback',async()=>{await api.removeEntity('news',newsId,lid);assert.equal((await bundle()).news.length,0);});
  const resultMatch=(await bundle()).matches[0];
  for(const column of ['home_score','away_score','status','league_id','competition_id','home_team_id']) await check('S-'+column,'Direct mutation of protected match column '+column+' rejected',()=>reject(client.from('matches').update({[column]:column==='status'?'completed':column.endsWith('_score')?99:crypto.randomUUID()}).eq('id',resultMatch.id),'42501'));
  await check('S-stat-insert','Direct insert of statistics denied',()=>reject(client.from('match_players').insert({...stat(player.id,'home'),match_id:resultMatch.id}),'42501'));
  await check('S-stat-update','Direct update of statistics denied',()=>reject(client.from('match_players').update({goals:99}).eq('match_id',resultMatch.id),'42501'));
  await check('S-stat-delete','Direct deletion of statistics denied',()=>reject(client.from('match_players').delete().eq('match_id',resultMatch.id),'42501'));
  await check('S-membership','Cannot insert own administrator membership directly',()=>reject(client.from('league_members').insert({league_id:lid,user_id:crypto.randomUUID(),role:'owner'}),'42501'));
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1cAAAAASUVORK5CYII=','base64');
  await check('S-storage-anon','Storage HTTP rejects unauthenticated upload',async()=>{const r=await anon.storage.from('league-images').upload(`${lid}/${crypto.randomUUID()}.png`,png,{contentType:'image/png'});assert.ok(r.error);});
  const friends=await api.createLeague({...draft,requestId:crypto.randomUUID(),name:label+' amigos',mode:'players',purpose:'friends',format:'friendly',expectedParticipants:5});
  const fp=await must(client.from('players').insert(Array.from({length:5},(_,i)=>({league_id:friends.id,name:'Amigo QA '+(i+1)}))).select());
  const split=domain.splitPlayers(fp,false,new Map(),()=>.4);
  const fid=await must(client.rpc('create_friendly_match',{p_league_id:friends.id,p_home_label:'A',p_away_label:'B',p_home_players:split.home.map(p=>p.id),p_away_players:split.away.map(p=>p.id),p_starts_at:null,p_venue:'Cancha QA',p_round:1}));
  const frows=[...split.home.map(p=>({...stat(p.id,'home'),match_id:fid,league_id:friends.id})),...split.away.map(p=>({...stat(p.id,'away'),match_id:fid,league_id:friends.id}))];
  await check('F01','Odd friends group records every participant once in 3/2 teams',async()=>{assert.equal(split.home.length,3);assert.equal(split.away.length,2);const r=await must(client.from('match_players').select('*').eq('match_id',fid));assert.equal(r.length,5);assert.equal(new Set(r.map(p=>p.player_id)).size,5);});
  await check('F02','Friends result awards points only to the participating side',async()=>{await api.saveResult(fid,1,0,frows);const d=await api.loadLeague(friends.id),ranking=domain.playerStandings(d);assert.equal(ranking.find(p=>p.id===split.home[0].id).points,3);assert.equal(ranking.find(p=>p.id===split.away[0].id).points,0);assert.ok(ranking.every(p=>p.played===1));});
  await check('F03','Correcting friendly participation removes omitted player appearance',async()=>{await api.saveResult(fid,0,0,frows.slice(1));const d=await api.loadLeague(friends.id),ranking=domain.playerStandings(d);assert.equal(ranking.find(p=>p.id===frows[0].player_id).played,0);assert.equal(d.stats.length,4);assert.equal(ranking.filter(p=>p.points===1).length,4);});
  await check('F04','Friends match rejects duplicate participants without creating a match',async()=>{const before=(await api.loadLeague(friends.id)).matches.length;await reject(client.rpc('create_friendly_match',{p_league_id:friends.id,p_home_label:'A',p_away_label:'B',p_home_players:[fp[0].id],p_away_players:[fp[0].id],p_starts_at:null,p_venue:'',p_round:2}));assert.equal((await api.loadLeague(friends.id)).matches.length,before);});
  await check('F05','Friends match rejects participant from another league',()=>reject(client.rpc('create_friendly_match',{p_league_id:friends.id,p_home_label:'A',p_away_label:'B',p_home_players:[fp[0].id],p_away_players:[player.id],p_starts_at:null,p_venue:'',p_round:2})));
  const report={started_at:started,finished_at:new Date().toISOString(),project_ref:'ilkkqynzvwskpwjgtapi',fixtures:{league,other,friends},passed:results.filter(r=>r.status==='passed').length,failed:results.filter(r=>r.status==='failed').length,results,limits:['Other-organizer and delegated-admin RLS are tested separately in transactional SQL; this HTTP run uses one confirmed QA organizer and an anonymous client.','Only disposable rows created in this run were deleted; the QA leagues and main fixture remain for inspection.']};
  return report;
}
module.exports={runDeepChecks,loadPlatform};
if(require.main===module){
  try{process.loadEnvFile('.env.local');}catch{}
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if(!url||!key||!process.env.GTL_QA_EMAIL||!process.env.GTL_QA_PASSWORD)throw Error('Configure public project settings and QA credentials in environment variables.');
  if(!/^qa-[^@]+@example\.com$/.test(process.env.GTL_QA_EMAIL))throw Error('Use a dedicated fictional QA account.');
  const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  (async()=>{
    const {error}=await client.auth.signInWithPassword({email:process.env.GTL_QA_EMAIL,password:process.env.GTL_QA_PASSWORD});
    if(error)throw error;
    const report=await runDeepChecks({client,onProgress:row=>console.log(JSON.stringify({progress:row}))});
    const output=process.env.GTL_QA_REPORT || 'docs/testing/platform-deep-report.json';
    if(!/^docs\/testing\/[a-z0-9-]+\.json$/.test(output))throw Error('Report must stay in docs/testing');
    fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify({report:output,passed:report.passed,failed:report.failed}));
    await client.auth.signOut({scope:'local'});
    process.exitCode=report.failed?1:0;
  })().catch(error=>{console.error(error.message);process.exitCode=1;});
}
