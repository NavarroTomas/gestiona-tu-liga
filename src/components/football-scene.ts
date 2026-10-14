import * as THREE from "three";

export function mountFootballScene(host: HTMLDivElement) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  host.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#b1b5a1");
  scene.fog = new THREE.Fog("#b1b5a1", 75, 230);
  const camera = new THREE.PerspectiveCamera(58, 1, .1, 300);
  scene.add(new THREE.HemisphereLight(0xe3ead8, 0x4e523a, 2.2));
  const sun = new THREE.DirectionalLight(0xffe1b2, 3);
  sun.position.set(-35, 48, 30); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, {left:-65,right:65,top:65,bottom:-65,near:1,far:150});
  sun.shadow.bias = -.001; sun.shadow.normalBias = .08;
  scene.add(sun);
  const material = (color: string) => new THREE.MeshStandardMaterial({ color, roughness:.9 });
  const chalk = material("#e8e6d3"), steel = material("#707970"), wood = material("#806a49");
  function box(x:number,y:number,z:number,w:number,h:number,d:number,mat:THREE.Material,shadow=true) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
    mesh.position.set(x,y,z); mesh.castShadow=shadow; mesh.receiveShadow=true; scene.add(mesh); return mesh;
  }
  function pole(a:THREE.Vector3,b:THREE.Vector3,r:number,mat:THREE.Material) {
    const delta=b.clone().sub(a);
    const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,delta.length(),8),mat);
    mesh.position.copy(a).add(b).multiplyScalar(.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
    mesh.castShadow=true; scene.add(mesh); return mesh;
  }
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(600,600), material("#797955"));
  ground.rotation.x=-Math.PI/2;ground.position.y=-.05;ground.receiveShadow=true;scene.add(ground);
  let seed=71; const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const canvas=document.createElement("canvas");canvas.width=1024;canvas.height=1536;
  const ctx=canvas.getContext("2d")!;
  ctx.fillStyle="#53764b";ctx.fillRect(0,0,1024,1536);
  for(let y=0;y<1536;y+=128){ctx.fillStyle=y%256===0?"#567b4c":"#4d7046";ctx.fillRect(0,y,1024,128);}
  for(let i=0;i<110000;i++){const x=random()*1024,y=random()*1536;ctx.fillStyle=random()>.5?"#c8c28b25":"#153c242a";ctx.fillRect(x,y,1+random()*3,1+random()*4);}
  for(const [x,y,r] of [[512,768,130],[512,140,110],[512,1396,110]]){
    const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,"#b7a27390");g.addColorStop(1,"#b7a27300");ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
  }
  ctx.strokeStyle="#eeebd4d9";ctx.lineWidth=3;
  ctx.strokeRect(46,46,932,1444);ctx.beginPath();ctx.moveTo(46,768);ctx.lineTo(978,768);ctx.stroke();
  ctx.beginPath();ctx.arc(512,768,137,0,Math.PI*2);ctx.stroke();
  ctx.strokeRect(250,46,524,245);ctx.strokeRect(382,46,260,98);ctx.strokeRect(250,1245,524,245);ctx.strokeRect(382,1392,260,98);
  for(const y of [246,768,1290]){ctx.beginPath();ctx.arc(512,y,4,0,Math.PI*2);ctx.fillStyle="#eee9d4";ctx.fill();}
  const grass=new THREE.CanvasTexture(canvas);grass.colorSpace=THREE.SRGBColorSpace;grass.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const pitch=new THREE.Mesh(new THREE.PlaneGeometry(64,96),new THREE.MeshStandardMaterial({map:grass,roughness:1}));
  pitch.rotation.x=-Math.PI/2;pitch.receiveShadow=true;scene.add(pitch);
  const netMaterial = new THREE.LineBasicMaterial({color:0xe1e3d0,transparent:true,opacity:.52});
  function goal(z:number, direction:number) {
    const back=z+direction*2.3;
    pole(new THREE.Vector3(-4,0,z),new THREE.Vector3(-4,2.7,z),.08,chalk);
    pole(new THREE.Vector3(4,0,z),new THREE.Vector3(4,2.7,z),.08,chalk);
    pole(new THREE.Vector3(-4,2.7,z),new THREE.Vector3(4,2.7,z),.08,chalk);
    pole(new THREE.Vector3(-4,0,back),new THREE.Vector3(-4,2.4,back),.045,steel);
    pole(new THREE.Vector3(4,0,back),new THREE.Vector3(4,2.4,back),.045,steel);
    const points:number[]=[];
    const line=(x:number,y:number,z1:number,x2:number,y2:number,z2:number)=>points.push(x,y,z1,x2,y2,z2);
    for(let x=-4;x<=4;x+=.28){line(x,0,back,x,2.4,back);line(x,2.4,back,x,2.7,z);}
    for(let y=0;y<=2.7;y+=.27){line(-4,Math.min(y,2.4),back,4,Math.min(y,2.4),back);line(-4,y,z,-4,Math.min(y,2.4),back);line(4,y,z,4,Math.min(y,2.4),back);}
    const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.Float32BufferAttribute(points,3));scene.add(new THREE.LineSegments(geo,netMaterial));
  }
  goal(45,1);goal(-45,-1);
  const fenceMaterial=new THREE.LineBasicMaterial({color:0x6b776c,transparent:true,opacity:.5});
  function fence(x1:number,z1:number,x2:number,z2:number){
    const len=Math.hypot(x2-x1,z2-z1),segments=Math.ceil(len/4),points:number[]=[];
    for(let i=0;i<=segments;i++){const t=i/segments;pole(new THREE.Vector3(x1+(x2-x1)*t,0,z1+(z2-z1)*t),new THREE.Vector3(x1+(x2-x1)*t,3.3,z1+(z2-z1)*t),.055,steel);}
    const pos=(t:number,y:number)=>[x1+(x2-x1)*t,y,z1+(z2-z1)*t];
    for(let d=0;d<len;d+=.45){for(let y=0;y<3.2;y+=.45){const t=d/len,t2=Math.min(1,(d+.45)/len);points.push(...pos(t,y),...pos(t2,y+.45),...pos(t,y+.45),...pos(t2,y));}}
    const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.Float32BufferAttribute(points,3));scene.add(new THREE.LineSegments(geo,fenceMaterial));
  }
  fence(-36,-52,-36,52);fence(36,-52,36,52);fence(-36,-52,36,-52);fence(-36,52,-3,52);fence(3,52,36,52);
  for(const x of [-29,29])for(const z of [-45,45]){
    pole(new THREE.Vector3(x,0,z),new THREE.Vector3(x,1.8,z),.035,chalk);
    const flagGeo=new THREE.BufferGeometry();flagGeo.setAttribute("position",new THREE.Float32BufferAttribute([0,0,0,.8,-.1,.12,0,-.5,0],3));flagGeo.computeVertexNormals();
    const flag=new THREE.Mesh(flagGeo,new THREE.MeshStandardMaterial({color:0xe1b756,side:THREE.DoubleSide,roughness:1}));flag.position.set(x,1.8,z);scene.add(flag);
  }
  for(const z of [-9,7]){box(-33,.55,z,1.2,.18,5,wood);box(-33,1.2,z,.12,.65,5,wood);for(const end of [-1.9,1.9])box(-33,.28,z+end,.7,.55,.15,steel);}
  const coneMat=material("#d38d42");for(let i=0;i<5;i++){const c=new THREE.Mesh(new THREE.ConeGeometry(.15,.45,10),coneMat);c.position.set(32,.23,8+i*1.4);c.castShadow=true;scene.add(c);}
  const ballCanvas=document.createElement("canvas");ballCanvas.width=512;ballCanvas.height=256;const bc=ballCanvas.getContext("2d")!;
  bc.fillStyle="#e9e5d6";bc.fillRect(0,0,512,256);bc.fillStyle="#303a32";
  for(let row=0;row<3;row++)for(let col=0;col<6;col++){const x=col*90+(row%2)*45,y=row*100+15;bc.beginPath();for(let i=0;i<5;i++){const a=i*Math.PI*2/5-Math.PI/2;const px=x+22*Math.cos(a),py=y+22*Math.sin(a);if(i===0)bc.moveTo(px,py);else bc.lineTo(px,py);}bc.closePath();bc.fill();}
  const ballMap=new THREE.CanvasTexture(ballCanvas);ballMap.colorSpace=THREE.SRGBColorSpace;
  const ball=new THREE.Mesh(new THREE.SphereGeometry(.36,28,20),new THREE.MeshStandardMaterial({map:ballMap,roughness:.8}));ball.position.set(2,.36,1);ball.castShadow=true;scene.add(ball);
  const skin=material("#aa8266"),shorts=material("#25352d");
  for(const [x,z,team] of [[-17,-23,0],[14,-19,1],[-9,-8,1],[19,9,0],[-18,15,0],[4,-31,1]]){
    const shirt=material(team?"#e4dfc0":"#769fbe");
    box(x,1.1,z,.58,.75,.35,shirt);box(x,.63,z,.52,.3,.32,shorts);
    for(const dx of [-.17,.17])box(x+dx,.26,z,.13,.55,.15,chalk);
    const head=new THREE.Mesh(new THREE.SphereGeometry(.18,10,8),skin);head.position.set(x,1.68,z);head.castShadow=true;scene.add(head);
  }
  const buildingColors=["#a8987e","#8e9688","#b4a48a","#7e887d"];
  for(let i=0;i<22;i++){const x=-110+i*10,h=4+random()*7;box(x,h/2,-70-random()*10,8,h,7,material(buildingColors[i%4]),false);box(x,h+.15,-70,8.5,.3,8,material("#6a715f"),false);}
  for(const x of [-41,41])for(const z of [-38,32]){pole(new THREE.Vector3(x,0,z),new THREE.Vector3(x,13,z),.12,steel);box(x,13,z,2,.5,.4,chalk);}
  const preference=matchMedia("(prefers-reduced-motion: reduce)");
  let target=0,current=0,frame=0,disposed=false;
  const position=()=>{
    const p=preference.matches?.55:current;
    camera.position.set(-5+Math.sin(p*Math.PI)*8,6-p*2.8,64-p*55);
    camera.lookAt(1,1,-12-p*3);
  };
  const draw=()=>{if(disposed)return;current+=(target-current)*.085;if(Math.abs(target-current)<.0002)current=target;position();renderer.render(scene,camera);if(current!==target)frame=requestAnimationFrame(draw);};
  const update=()=>{target=Math.min(1,Math.max(0,scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)));cancelAnimationFrame(frame);frame=requestAnimationFrame(draw);};
  const resize=()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();update();};
  resize();window.addEventListener("scroll",update,{passive:true});window.addEventListener("resize",resize);preference.addEventListener("change",update);
  const contextLost=(event:Event)=>{event.preventDefault();host.dataset.failed="true";};renderer.domElement.addEventListener("webglcontextlost",contextLost);
  return ()=>{disposed=true;cancelAnimationFrame(frame);window.removeEventListener("scroll",update);window.removeEventListener("resize",resize);preference.removeEventListener("change",update);renderer.domElement.removeEventListener("webglcontextlost",contextLost);const materials=new Set<THREE.Material>();scene.traverse(object=>{if(object instanceof THREE.Mesh||object instanceof THREE.LineSegments){object.geometry.dispose();const ms=Array.isArray(object.material)?object.material:[object.material];ms.forEach(m=>materials.add(m));}});materials.forEach(m=>m.dispose());grass.dispose();ballMap.dispose();renderer.dispose();renderer.domElement.remove();};
}
