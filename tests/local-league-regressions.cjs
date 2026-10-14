const assert=require('node:assert/strict');const fs=require('fs');
const root=require('node:path').resolve(__dirname,'..')+'/';const ts=require(root+'node_modules/typescript');
require.extensions['.ts']=(mod,file)=>{const source=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;mod._compile(source,file);};
const {roundRobin,teamStandings,playerStandings,emptyLeague,validateResult,loadLeague,leagueKey}=require(root+'src/components/platform/league-model.ts');
let next=0;
for(const n of [2,3,4,5,6,7]){
 const ids=Array.from({length:n},(_,i)=>'t'+i),fixture=roundRobin(ids,()=>String(++next));
 assert.equal(fixture.length,n*(n-1)/2);
 assert.equal(new Set(fixture.map(m=>[m.home,m.away].sort().join(':'))).size,fixture.length);
 for(const round of new Set(fixture.map(m=>m.round))){const teams=fixture.filter(m=>m.round===round).flatMap(m=>[m.home,m.away]);assert.equal(new Set(teams).size,teams.length);}
}
const data=emptyLeague();data.teams=[{id:'a',name:'Local'},{id:'b',name:'Visita'},{id:'c',name:'Sin jugar'}];data.players=[{id:'p1',name:'Ana',teamId:'a'},{id:'p2',name:'Luz',teamId:'b'}];
const match={id:'m1',home:'a',away:'b',round:1,date:'',homeScore:2,awayScore:1,stats:[{playerId:'p1',side:'home',goals:2,assists:0},{playerId:'p2',side:'away',goals:1,assists:0}]};
data.matches=[match];const league={id:'l',name:'Demo',mode:'teams'};
assert.equal(validateResult(data,league,match),null);
assert.equal(teamStandings(data)[0].pts,3);assert.equal(teamStandings(data).find(r=>r.club==='c').pj,0);
assert.equal(playerStandings(data).find(r=>r.id==='p1').goals,2);
data.matches=[{...match,homeScore:0,awayScore:1,stats:[{...match.stats[0],goals:0},match.stats[1]]}];
assert.equal(teamStandings(data)[0].club,'b');assert.equal(playerStandings(data).find(r=>r.id==='p1').goals,0);
assert.ok(validateResult(data,league,{...match,homeScore:1}));
assert.ok(validateResult(data,league,{...match,stats:[match.stats[0],match.stats[0]]}));
assert.ok(validateResult(data,league,{...match,stats:[{...match.stats[0],side:'away'}]}));
assert.ok(validateResult(data,league,{...match,homeScore:null}));
const friends={...league,mode:'players'};
data.matches=[{...match,home:'Rojos',away:'Azules'}, {...match,id:'m2',home:'Rojos',away:'Azules',homeScore:0,awayScore:0,stats:[{playerId:'p1',side:'away',goals:0,assists:0}]}];
assert.equal(playerStandings(data).find(r=>r.id==='p1').points,4);assert.equal(playerStandings(data).find(r=>r.id==='p1').played,2);
assert.equal(validateResult(data,friends,data.matches[1]),null);
const store=new Map();global.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
store.set(leagueKey('one'),JSON.stringify(data));assert.equal(loadLeague('one').matches.length,2);assert.equal(loadLeague('two').matches.length,0);
console.log('PASS: fixtures 2–7 teams; no repeated pairs or concurrent fixtures; APA standings; result replacement; goals and participation validation; changing sides; league isolation.');
