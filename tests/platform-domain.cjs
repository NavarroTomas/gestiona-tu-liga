const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,file);
const domain=require('../src/lib/platform/domain.ts');
const {exampleLeague}=require('../src/lib/platform/example.ts');
let checks=0;
function test(name,fn){fn();checks++;console.log('PASS '+name);}
test('fixtures: every pair exactly once, no team twice per date, odd-team byes, return legs',()=>{
 for(const n of [2,3,4,5,6,9,16,32,127,128]){
  const ids=Array.from({length:n},(_,i)=>`t${i}`),single=domain.fixtures(ids),double=domain.fixtures(ids,true);
  assert.equal(single.length,n*(n-1)/2);assert.equal(double.length,n*(n-1));
  assert.equal(new Set(single.map(m=>[m.home,m.away].sort().join('/'))).size,single.length);
  for(const round of new Set(double.map(m=>m.round))){const players=double.filter(m=>m.round===round).flatMap(m=>[m.home,m.away]);assert.equal(new Set(players).size,players.length);}
  for(const m of single)assert.equal(double.filter(x=>x.home===m.away&&x.away===m.home).length,1);
 }
 assert.throws(()=>domain.fixtures(['a','a']));assert.throws(()=>domain.fixtures(['a']));
});
test('standings: score edit replaces previous outcome, custom points, 0-0 is played',()=>{
 const d=exampleLeague();let rows=domain.standings(d);assert.equal(rows.find(r=>r.name==='Los Pinos').points,3);assert.equal(rows.find(r=>r.name==='Barrio Norte').points,0);
 d.matches[0].home_score=0;d.matches[0].away_score=2;rows=domain.standings(d);assert.equal(rows.find(r=>r.name==='Los Pinos').points,0);assert.equal(rows.find(r=>r.name==='Barrio Norte').points,3);
 d.matches[0].home_score=0;d.matches[0].away_score=0;d.league.points_draw=2;rows=domain.standings(d);assert.equal(rows.find(r=>r.name==='Los Pinos').played,1);assert.equal(rows.find(r=>r.name==='Los Pinos').points,2);
 d.matches[0].status='scheduled';d.matches[0].home_score=null;d.matches[0].away_score=null;assert.equal(domain.standings(d).find(r=>r.name==='Los Pinos').played,0);
});
test('individual ranking follows participation side, not current team; pending games do not count',()=>{
 const d=exampleLeague();d.league.mode='players';d.players[0].team_id='t1';let row=domain.playerStandings(d).find(r=>r.id==='p0');assert.equal(row.points,3);assert.equal(row.rating,8);
 d.matches[0].status='scheduled';row=domain.playerStandings(d).find(r=>r.id==='p0');assert.equal(row.played,0);assert.equal(row.rating,null);
});
test('results reject foreign league, duplicate players, impossible goals, cards and ratings',()=>{
 const d=exampleLeague(),m=d.matches[0],stats=d.stats.filter(s=>s.match_id===m.id);
 assert.equal(domain.validateResult(m,2,1,stats,d.players,d.league),null);
 for(const invalid of [[...stats,stats[0]],[{...stats[0],league_id:'another'}],[{...stats[0],goals:3}],[{...stats[0],rating:11}],[{...stats[0],yellow_cards:3}],[{...stats[0],red_cards:-1}],[{...stats[0],side:'away'}]])assert.ok(domain.validateResult(m,2,1,invalid,d.players,d.league));
 assert.ok(domain.validateResult(m,NaN,1,[],d.players,d.league));assert.ok(domain.validateResult(m,1.5,1,[],d.players,d.league));
});
test('random and balanced teams: every player once, sizes differ at most one',()=>{
 const d=exampleLeague(),ratings=new Map(d.players.map((p,i)=>[p.id,i+2]));
 for(const balanced of [true,false])for(let n=2;n<=8;n++){
  const players=d.players.slice(0,n),r=domain.splitPlayers(players,balanced,ratings,()=>.4);
  assert.equal(r.home.length+r.away.length,n);assert.ok(Math.abs(r.home.length-r.away.length)<=1);assert.equal(new Set([...r.home,...r.away].map(p=>p.id)).size,n);
 }
 const r=domain.splitPlayers(d.players,true,ratings,()=>.4),score=players=>players.reduce((sum,p)=>sum+ratings.get(p.id),0);assert.ok(Math.abs(score(r.home)-score(r.away))<=2);
});
test('a transfer preserves eligibility only for the previously recorded match and side',()=>{
 const d=exampleLeague(),m=d.matches[0],previous=d.stats.filter(s=>s.match_id===m.id),p=d.players.find(p=>p.id===previous[0].player_id);
 p.team_id='another-team';
 assert.ok(domain.validateResult(m,2,1,previous,d.players,d.league));
 assert.equal(domain.validateResult(m,2,1,previous,d.players,d.league,previous),null);
 const changedSide=[{...previous[0],side:previous[0].side==='home'?'away':'home',goals:0,assists:0}];
 p.team_id=changedSide[0].side==='home'?m.home_team_id:m.away_team_id;
 assert.ok(domain.validateResult(m,2,1,changedSide,d.players,d.league,previous));
 p.team_id='another-team';
 assert.ok(domain.validateResult(m,2,1,previous,d.players,d.league,previous.map(s=>({...s,match_id:'different-match'}))));
 assert.ok(domain.validateResult(m,2,1,previous,d.players,d.league,previous.map(s=>({...s,league_id:'different-league'}))));
});
test('onboarding validates limits, formats and colors',()=>{
 const draft={version:1,requestId:'a',purpose:'friends',mode:'players',name:'Sábados de fútbol',description:'',expectedParticipants:10,format:'friendly',primaryColor:'#216348',secondaryColor:'#dbe99d'};
 assert.equal(domain.validateDraft(draft),null);assert.equal(domain.slugify(draft.name),'sabados-de-futbol');
 for(const patch of [{name:' '},{expectedParticipants:1},{expectedParticipants:129},{expectedParticipants:2.5},{primaryColor:'red'},{format:'round_robin'}])assert.ok(domain.validateDraft({...draft,...patch}));
 assert.equal(domain.inkFor('#ffffff'),'#172018');assert.equal(domain.inkFor('#000000'),'#ffffff');
});
test('stored drafts reject corrupt types and restore only recognized fields',()=>{
 const defaults={version:1,requestId:'new-request',purpose:'amateur',mode:'teams',name:'',description:'',expectedParticipants:8,format:'round_robin',primaryColor:'#216348',secondaryColor:'#dbe99d'};
 for(const value of [null,7,'old',{version:2}])assert.deepEqual(domain.restoreDraft(value,defaults),defaults);
 const restored=domain.restoreDraft({version:1,name:7,description:null,expectedParticipants:-1,primaryColor:'red',mode:'players',password:'never-store-this'},defaults);
 assert.equal(restored.name,'');assert.equal(restored.description,'');assert.equal(restored.expectedParticipants,8);assert.equal(restored.primaryColor,defaults.primaryColor);assert.equal(restored.format,'friendly');assert.equal('password' in restored,false);
 const saved={...defaults,name:'Liga recuperada',requestId:'6b35834e-752c-42cd-83d3-8a782a80eeea'};
 assert.deepEqual(domain.restoreDraft(saved,defaults),saved);
});
test('SQL boundary: no anon bootstrap/management, scope keys and protected score writes',()=>{
 const sql=fs.readFileSync(path.join(__dirname,'../supabase/schema/platform-v1.sql'),'utf8');
 assert.ok(sql.includes('revoke all on public.leagues, public.league_members from anon,authenticated'));
 assert.ok(sql.includes("execute format('revoke all on public.%I from anon,authenticated',t)"));
 assert.ok(sql.includes('foreign key(player_id,league_id)'));assert.ok(sql.includes('foreign key(match_id,league_id)'));
 assert.ok(sql.includes('revoke insert,update,delete on public.match_players from authenticated'));
 assert.ok(sql.includes('revoke insert,update on public.matches from authenticated'));
 assert.ok(sql.includes('pg_advisory_xact_lock'));assert.ok(!sql.includes('user_metadata'));
});
console.log(`${checks} platform test groups passed.`);
