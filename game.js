import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';

const $ = (id) => document.getElementById(id);
const canvas = $('game-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111b18);
scene.fog = new THREE.FogExp2(0x111b18, 0.012);
const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.1, 180);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

scene.add(new THREE.HemisphereLight(0xb9dbcf, 0x18231d, 1.6));
const keyLight = new THREE.DirectionalLight(0xd0e9c2, 2.7);
keyLight.position.set(-16, 24, 9); keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024); keyLight.shadow.camera.left = -35; keyLight.shadow.camera.right = 35; keyLight.shadow.camera.top = 35; keyLight.shadow.camera.bottom = -35;
scene.add(keyLight);
const rimLight = new THREE.PointLight(0x82c4a4, 55, 60); rimLight.position.set(13, 9, -18); scene.add(rimLight);
const arena = new THREE.Group(); scene.add(arena);
const solids = [];
const mat = (color, roughness = .78, metalness = .1, emissive = 0x000000, intensity = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive, emissiveIntensity: intensity });
const groundMat = mat(0x364039, .96);
const concrete = mat(0x566057, .88, .15);
const darkMetal = mat(0x17221e, .46, .62);
const acidMat = mat(0xc8f451, .3, .25, 0x91d52b, 1.2);
const orangeMat = mat(0xff6645, .4, .18, 0x9e2418, 1.4);
let builtMap = '';
function addBox(x, y, z, sx, sy, sz, material, solid = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);
  mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; arena.add(mesh);
  if (solid) solids.push({ x, z, sx, sz }); return mesh;
}
function addCylinder(x, y, z, radius, height, material, solid = false, sides = 12) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, sides), material);
  mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; arena.add(mesh);
  if (solid) solids.push({ x, z, sx: radius * 2, sz: radius * 2 }); return mesh;
}
function buildMap(mapId) {
  if (builtMap === mapId) return;
  while (arena.children.length) { const item = arena.children[0]; arena.remove(item); item.geometry?.dispose(); }
  solids.length = 0; builtMap = mapId;
  const maps = {
    industrial: { sky: 0x111b18, fog: 0x111b18, ground: 0x364039, cover: 0x566057, edge: 0x17221e, accent: 0xc8f451, grid: 0x91b279 },
    desert: { sky: 0x493522, fog: 0xa97745, ground: 0xc49a5d, cover: 0x8c5936, edge: 0x63442e, accent: 0xf3cb67, grid: 0xe7c27e },
    chocolate: { sky: 0x30202c, fog: 0x694052, ground: 0x7d492f, cover: 0x95583f, edge: 0x442732, accent: 0xffb5c8, grid: 0xe5a09a }
  };
  const theme = maps[mapId] || maps.industrial;
  scene.background.setHex(theme.sky); scene.fog.color.setHex(theme.fog);
  groundMat.color.setHex(theme.ground); concrete.color.setHex(theme.cover); darkMetal.color.setHex(theme.edge); acidMat.color.setHex(theme.accent);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(110, 110), groundMat);
  floor.rotation.x = -Math.PI / 2; floor.position.y = -.07; floor.receiveShadow = true; arena.add(floor);
  const grid = new THREE.GridHelper(100, 50, theme.grid, theme.grid); grid.position.y = -.045; grid.material.transparent = true; grid.material.opacity = mapId === 'industrial' ? .22 : .12; arena.add(grid);
  if (mapId === 'chocolate') {
    const water = new THREE.Mesh(new THREE.CircleGeometry(48, 64), mat(0x477f9b, .28, .15, 0x15344a, .4)); water.rotation.x = -Math.PI / 2; water.position.y = -.12; arena.add(water);
    const island = new THREE.Mesh(new THREE.CylinderGeometry(33, 37, .7, 48), mat(0x96623b, .95)); island.position.y = -.33; arena.add(island);
    for (let i = 0; i < 14; i++) { const a = i * Math.PI * 2 / 14; const x = Math.cos(a) * 29, z = Math.sin(a) * 27; addCylinder(x, 2.2, z, .28, 4.4, mat(0x4d713a), false, 7); const canopy = new THREE.Mesh(new THREE.SphereGeometry(1.4, 8, 6), mat(i % 2 ? 0x48a66a : 0x78b84e)); canopy.position.set(x, 4.4, z); arena.add(canopy); }
    for (let i = 0; i < 12; i++) { const x = (i % 4 - 1.5) * 14, z = i < 6 ? -13 : 15; addBox(x, .65, z, 3.5, 1.3, 2.7, mat(i % 2 ? 0x754332 : 0xb46a46)); const icing = new THREE.Mesh(new THREE.BoxGeometry(3.55, .18, 2.74), mat(i % 2 ? 0xffa5bb : 0xf1cf85)); icing.position.set(x, 1.32, z); arena.add(icing); }
  } else {
    addBox(0, 3, -33, 72, 6, 2.2, darkMetal); addBox(0, 3, 33, 72, 6, 2.2, darkMetal);
    addBox(-36, 3, 0, 2.2, 6, 68, darkMetal); addBox(36, 3, 0, 2.2, 6, 68, darkMetal);
    for (let i = 0; i < 10; i++) {
      const x = (i % 5 - 2) * 13 + (i > 4 ? 3 : 0), z = i < 5 ? -15 : 14, h = 2.3 + (i % 3) * .5;
      addBox(x, h / 2, z, 3.2, h, 2.5, i % 2 ? concrete : darkMetal);
      if (mapId === 'industrial') { const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.5, .12, .06), acidMat); stripe.position.set(x, h - .35, z + 1.29); arena.add(stripe); }
    }
    for (let i = 0; i < 8; i++) { const x = i % 2 ? -31 : 31, z = -27 + i * 7.5; addBox(x, 4, z, 1.6, 8, 1.6, concrete); if (mapId === 'industrial') { const band = new THREE.Mesh(new THREE.BoxGeometry(1.7, .2, 1.7), i % 2 ? acidMat : orangeMat); band.position.set(x, 6.7, z); arena.add(band); } }
    if (mapId === 'desert') {
      for (let i = 0; i < 18; i++) { const x = (i % 6 - 2.5) * 11, z = i < 9 ? -25 : 25; addCylinder(x, .65, z, 1.1 + (i % 3) * .25, 1.3, mat(0x8f603c), false, 7); }
      for (let i = 0; i < 5; i++) addBox(-25 + i * 12, 1.1, -3 + (i % 2) * 7, 4, 2.2, 3, mat(0xa97b4e));
    }
  }
  const centerMat = mapId === 'chocolate' ? mat(0x5d332a, .8) : mat(mapId === 'desert' ? 0xa87945 : 0x29352e, .8);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(5.4, .11, 8, 64), acidMat); ring.rotation.x = Math.PI / 2; ring.position.y = .03; arena.add(ring);
  const centerDisc = new THREE.Mesh(new THREE.CircleGeometry(5.1, 64), centerMat); centerDisc.rotation.x = -Math.PI / 2; centerDisc.position.y = -.02; arena.add(centerDisc);
  for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, x = Math.cos(a) * 30, z = Math.sin(a) * 28; const orb = new THREE.Mesh(new THREE.SphereGeometry(.14, 8, 8), i % 2 ? acidMat : orangeMat); orb.position.set(x, 2.5, z); arena.add(orb); }
}
buildMap('industrial');
const skyDust = new THREE.Group(); scene.add(skyDust);
for (let i = 0; i < 180; i++) {
  const dot = new THREE.Mesh(new THREE.SphereGeometry(.035 + Math.random() * .035, 5, 5), mat(i % 5 ? 0x98ac96 : 0xd5f985, .6, 0, i % 5 ? 0x263e2d : 0x9ad34d, .7));
  dot.position.set((Math.random() - .5) * 100, 5 + Math.random() * 35, (Math.random() - .5) * 100); skyDust.add(dot);
}

const names = ['THE WARDEN','IRON JACKAL','ASH TITAN','REDLINE','THE EXECUTOR','BONE MACHINE','NIGHTFALL','WARBRINGER','THE COLOSSUS','LAST LIGHT'];
const weapons = {
  ak: { name: 'AK-47', fireDelay: 155, damage: 48, magazine: 30, reserve: 180, reload: 1050, shotColor: 0xd9ff7c },
  machine: { name: 'MACHINE GUN', fireDelay: 72, damage: 16, magazine: 60, reserve: 360, reload: 1450, shotColor: 0xffdf78 },
  rpg: { name: 'RPG', fireDelay: 820, damage: 285, magazine: 1, reserve: 18, reload: 1650, shotColor: 0xff7849 }
};
const game = { mode: 'solo', map: 'industrial', weapon: 'ak', active: false, paused: false, over: false, kills: 0, hp: 1000, ammo: 30, reserve: 180, score: 0, reloading: false, fireAt: 0, toastAt: 0, lastDamage: 0, pointerLocked: false };
const weapon = () => weapons[game.weapon];
const keys = new Set(), moveTouch = new Set();
const player = { pos: new THREE.Vector3(0, 1.7, 25), yaw: 0, pitch: 0 };
camera.position.copy(player.pos); camera.rotation.order = 'YXZ';
let boss = null, projectiles = [], allies = [], particles = [];
const gun = new THREE.Group();
let muzzleFlash;
function buildGun() {
  while (gun.children.length) { const item = gun.children[0]; gun.remove(item); item.geometry?.dispose(); }
  const gunColor = game.weapon === 'rpg' ? mat(0x53604d, .55, .4) : darkMetal;
  const bodyWidth = game.weapon === 'machine' ? .3 : game.weapon === 'rpg' ? .28 : .22;
  const bodyLength = game.weapon === 'rpg' ? 1.05 : .75;
  const gunBody = new THREE.Mesh(new THREE.BoxGeometry(bodyWidth, game.weapon === 'rpg' ? .27 : .2, bodyLength), gunColor); gunBody.position.set(.35, -.27, -.58); gun.add(gunBody);
  const top = new THREE.Mesh(new THREE.BoxGeometry(.12, .08, game.weapon === 'rpg' ? .64 : .5), game.weapon === 'rpg' ? orangeMat : acidMat); top.position.set(.35, -.15, -.64); gun.add(top);
  if (game.weapon === 'rpg') {
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, 1.12, 12), gunColor); tube.rotation.x = Math.PI / 2; tube.position.set(.35, -.26, -.88); gun.add(tube);
    const nose = new THREE.Mesh(new THREE.CylinderGeometry(.18, .12, .2, 12), orangeMat); nose.rotation.x = Math.PI / 2; nose.position.set(.35, -.26, -1.52); gun.add(nose);
  } else {
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(.055, .065, game.weapon === 'machine' ? .5 : .42, 12), mat(0x101715, .32, .75)); barrel.rotation.x = Math.PI / 2; barrel.position.set(.35, -.25, -.98); gun.add(barrel);
    if (game.weapon === 'ak') { const stock = new THREE.Mesh(new THREE.BoxGeometry(.14,.18,.32), mat(0x76513a)); stock.position.set(.35,-.28,-.22); gun.add(stock); }
    if (game.weapon === 'machine') { const magazine = new THREE.Mesh(new THREE.BoxGeometry(.14,.32,.2), concrete); magazine.position.set(.35,-.48,-.62); gun.add(magazine); }
  }
  const grip = new THREE.Mesh(new THREE.BoxGeometry(.11, .26, .16), concrete); grip.position.set(.35, -.46, -.39); grip.rotation.x = -.18; gun.add(grip);
  muzzleFlash = new THREE.Mesh(new THREE.SphereGeometry(game.weapon === 'rpg' ? .2 : .13, 8, 8), mat(0xffec94, .2, 0, 0xff8a3d, 4)); muzzleFlash.position.set(.35, -.25, game.weapon === 'rpg' ? -1.68 : -1.2); muzzleFlash.visible = false; gun.add(muzzleFlash);
}
buildGun(); camera.add(gun); scene.add(camera);
function updateWeaponHud() { $('weapon-label').textContent = `${weapon().name} • ${game.weapon === 'rpg' ? 'EXPLOSIVE' : 'AUTO'}`; $('ammo-value').textContent = game.ammo; document.querySelector('.ammo-reserve').textContent = `/ ${game.reserve}`; }

function makeBoss() {
  const stage = Math.floor(game.kills / 10) + 1, index = game.kills % 10;
  const root = new THREE.Group(); root.position.set((Math.random() < .5 ? -1 : 1) * (8.5 + Math.random() * 2), 0, -12 - Math.random() * 2); root.scale.setScalar(1.28); scene.add(root);
  const armor = new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(.37 - stage * .018, .22, .22 + (index % 3) * .035), roughness: .48, metalness: .56, emissive: 0x17231b, emissiveIntensity: .55 });
  const black = darkMetal;
  function part(geometry, material, x, y, z, scale) { const mesh = new THREE.Mesh(geometry, material); mesh.position.set(x,y,z); if (scale) mesh.scale.set(...scale); mesh.castShadow = true; mesh.receiveShadow = true; root.add(mesh); return mesh; }
  const body = part(new THREE.CylinderGeometry(.48,.62,1.35,8), armor, 0, 1.45, 0, [1,1,1]);
  body.rotation.z = .04;
  part(new THREE.BoxGeometry(1.3,.42,.55), armor, 0, 1.92, 0);
  part(new THREE.SphereGeometry(.38,10,8), black, 0, 2.48, -.04, [1,1.12,.9]);
  const eye = part(new THREE.BoxGeometry(.44,.1,.09), orangeMat, 0, 2.52, -.4); eye.userData.isEye = true;
  for (const side of [-1,1]) {
    part(new THREE.CylinderGeometry(.18,.22,.85,7), armor, side*.77, 1.47, 0, [1,1,.9]).rotation.z = side*.16;
    part(new THREE.CylinderGeometry(.24,.2,.76,7), black, side*.37, .52, 0, [1,1,.9]);
    part(new THREE.BoxGeometry(.3,.56,.32), armor, side*.48, 1.57, -.17);
    part(new THREE.BoxGeometry(.08,.35,.1), acidMat, side*.78, 1.45, -.22);
  }
  const hp = 140 + stage * 48 + index * 9;
  boss = { root, hp, maxHp: hp, speed: 1.1 + stage * .045, nextShot: performance.now() + 1800, name: names[index], parts: root.children };
  $('stage-value').textContent = String(stage).padStart(2,'0');
  $('boss-name').textContent = boss.name; $('boss-number').textContent = `BOSS ${String(index+1).padStart(2,'0')}`;
  $('kills-count').textContent = String(game.kills).padStart(2,'0'); updateBossHud();
  toast(`${boss.name} // INCOMING`);
}
function updateBossHud() { if (!boss) return; const pct = Math.max(0, boss.hp / boss.maxHp * 100); $('boss-health-fill').style.width = `${pct}%`; $('boss-hp-text').textContent = `${Math.ceil(pct)}%`; }

function addAlly(slot) {
  const group = new THREE.Group(); const allyMat = mat(slot ? 0x71879a : 0x8e9b75, .58, .38);
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(.28,.34,.92,7), allyMat); torso.position.y = 1.18; group.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.23,8,7), darkMetal); head.position.y = 1.82; group.add(head);
  const visor = new THREE.Mesh(new THREE.BoxGeometry(.27,.07,.07), acidMat); visor.position.set(0,1.84,-.19); group.add(visor);
  const rifle = new THREE.Mesh(new THREE.BoxGeometry(.12,.12,.58), darkMetal); rifle.position.set(.31,1.3,-.24); group.add(rifle);
  group.position.set(slot ? 2.2 : -2.2, 0, 26); scene.add(group);
  allies.push({ group, slot, nextShot: performance.now() + 800 + slot * 450 });
}

function startRun() {
  game.mode = document.querySelector('.mode-card.selected')?.dataset.mode || 'solo';
  game.map = $('map-select').value; game.weapon = $('weapon-select').value;
  buildMap(game.map); buildGun();
  game.active = true; game.paused = false; game.over = false; game.kills = 0; game.hp = 1000; game.ammo = weapon().magazine; game.reserve = weapon().reserve; game.reloading = false;
  player.pos.set(0,1.7,25); player.yaw = 0; player.pitch = 0; camera.position.copy(player.pos); camera.rotation.set(0,0,0);
  if (boss) { scene.remove(boss.root); boss = null; } projectiles.forEach(p=>scene.remove(p.mesh)); projectiles=[]; allies.forEach(a=>scene.remove(a.group)); allies=[];
  $('menu-screen').classList.add('hidden'); $('pause-screen').classList.add('hidden'); $('end-screen').classList.add('hidden'); $('hud').classList.remove('hidden');
  $('player-health-fill').style.width='100%'; $('hp-value').textContent='1000'; updateWeaponHud();
  $('status-label').textContent = `${$('map-select').selectedOptions[0].textContent} // ARENA PROTOCOL`;
  $('squad-status').classList.toggle('hidden', game.mode !== 'team');
  if (game.mode === 'team') { addAlly(0); addAlly(1); }
  makeBoss(); canvas.requestPointerLock?.();
}

function toast(text) { const el=$('toast'); el.textContent=text; el.classList.add('show'); game.toastAt=performance.now()+1900; }
function setHp(value) { game.hp=Math.max(0,Math.min(1000,value)); $('hp-value').textContent=String(Math.ceil(game.hp)); $('player-health-fill').style.width=`${game.hp/10}%`; }
function damagePlayer(amount) { if (!game.active || game.paused) return; game.lastDamage=performance.now(); setHp(game.hp-amount); const flash=$('damage-flash'); flash.style.opacity='.8'; setTimeout(()=>flash.style.opacity='0',100); if(game.hp<=0) finishRun(false); }
function finishRun(won) { game.active=false; game.over=true; document.exitPointerLock?.(); $('hud').classList.add('hidden'); $('end-screen').classList.remove('hidden'); $('end-eyebrow').textContent=won?'// RUN COMPLETE':'// SIGNAL LOST'; $('end-title').innerHTML=won?'ARENA<br><span>CONQUERED.</span>':'YOU GOT<br><span>OUTGUNNED.</span>'; $('end-copy').textContent=won?'Every boss down. You own this ground.':`${100-game.kills} bosses still standing. Load up and run it back.`; $('final-kills').textContent=game.kills; $('final-stage').textContent=Math.min(10,Math.ceil(game.kills/10)); }

const raycaster = new THREE.Raycaster();
const forward = new THREE.Vector3();
let lastFrame=performance.now(), fireHeld=false, touchLook=null, soundOn=false, audioCtx=null;
function playShot() { if (!soundOn) return; try { audioCtx ||= new AudioContext(); const osc=audioCtx.createOscillator(), gain=audioCtx.createGain(); osc.type='sawtooth'; osc.frequency.setValueAtTime(115,audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(42,audioCtx.currentTime+.09); gain.gain.setValueAtTime(.055,audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+.12); osc.connect(gain); gain.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime+.12); } catch {} }
function shoot(now) {
  if (!game.active || game.paused || game.reloading || now < game.fireAt) return;
  if (game.ammo <= 0) { reload(); return; }
  const spec = weapon();
  game.fireAt = now + spec.fireDelay; game.ammo--; updateWeaponHud();
  gun.rotation.x = game.weapon === 'rpg' ? -.11 : -.055; muzzleFlash.visible = true; setTimeout(() => { if (muzzleFlash) muzzleFlash.visible = false; }, game.weapon === 'rpg' ? 140 : 55); playShot();
  raycaster.setFromCamera(new THREE.Vector2(0,0), camera);
  const hits = boss ? raycaster.intersectObjects(boss.parts, false) : [];
  const origin = new THREE.Vector3(); camera.getWorldPosition(origin);
  const end = hits.length ? hits[0].point : raycaster.ray.at(32, new THREE.Vector3());
  const traceGeometry = new THREE.BufferGeometry().setFromPoints([origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(.7)), end]);
  const trace = new THREE.Line(traceGeometry, new THREE.LineBasicMaterial({ color: spec.shotColor, transparent: true, opacity: .9 })); scene.add(trace); setTimeout(() => { scene.remove(trace); traceGeometry.dispose(); }, game.weapon === 'rpg' ? 180 : 65);
  if (game.weapon === 'rpg') {
    const blast = new THREE.Mesh(new THREE.SphereGeometry(.65, 12, 8), new THREE.MeshBasicMaterial({ color: 0xff8a45, transparent: true, opacity: .8 })); blast.position.copy(end); scene.add(blast); setTimeout(() => { scene.remove(blast); blast.geometry.dispose(); blast.material.dispose(); }, 180);
  }
  if (hits.length && boss) {
    boss.hp -= spec.damage; updateBossHud(); $('hit-marker').classList.add('show'); setTimeout(() => $('hit-marker').classList.remove('show'), 100); if (boss.hp <= 0) eliminateBoss();
  }
}
function reload() {
  const spec = weapon();
  if (game.reloading || game.ammo === spec.magazine || game.reserve <= 0 || !game.active) return;
  game.reloading = true; toast('RELOADING');
  setTimeout(() => { if (game.active) { const load = Math.min(spec.magazine - game.ammo, game.reserve); game.ammo += load; game.reserve -= load; updateWeaponHud(); } game.reloading = false; }, spec.reload);
}
function eliminateBoss() {
  if(!boss)return; const old=boss; scene.remove(old.root); boss=null; game.kills++; game.score+=100; $('kills-count').textContent=String(game.kills).padStart(2,'0');
  const ammoBonus = game.weapon === 'rpg' ? 2 : game.weapon === 'machine' ? 60 : 24;
  game.reserve = Math.min(999, game.reserve + ammoBonus); updateWeaponHud(); if (game.ammo < (game.weapon === 'rpg' ? 1 : 10)) reload();
  if(game.kills>=100){finishRun(true);return;}
  const stage=Math.floor((game.kills-1)/10)+1;
  if(game.kills%10===0)toast(`STAGE ${String(stage).padStart(2,'0')} CLEARED`); else toast('TARGET ELIMINATED');
  setTimeout(()=>{if(game.active)makeBoss();},1000);
}
function spawnEnemyShot(from, target) {
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(.14,8,8),orangeMat); mesh.position.copy(from); scene.add(mesh);
  const direction=target.clone().sub(from).normalize(); projectiles.push({mesh,velocity:direction.multiplyScalar(10),life:5});
}
function updateGame(dt, now) {
  if(!game.active||game.paused)return;
  // Walk relative to facing; obstacles prevent walking through cover.
  const speed=8.5; let dx=0,dz=0;
  if(keys.has('KeyW')||keys.has('ArrowUp')||moveTouch.has('forward'))dz-=1;
  if(keys.has('KeyS')||keys.has('ArrowDown')||moveTouch.has('back'))dz+=1;
  if(keys.has('KeyA')||keys.has('ArrowLeft')||moveTouch.has('left'))dx-=1;
  if(keys.has('KeyD')||keys.has('ArrowRight')||moveTouch.has('right'))dx+=1;
  const len=Math.hypot(dx,dz)||1; dx/=len; dz/=len;
  const strafeX=Math.cos(player.yaw)*dx+Math.sin(player.yaw)*dz;
  const strafeZ=-Math.sin(player.yaw)*dx+Math.cos(player.yaw)*dz;
  let nx=player.pos.x+strafeX*speed*dt, nz=player.pos.z+strafeZ*speed*dt;
  nx=Math.max(-32,Math.min(32,nx)); nz=Math.max(-29,Math.min(29,nz));
  for(const s of solids){if(Math.abs(nx-s.x)<s.sx/2+.5&&Math.abs(player.pos.z-s.z)<s.sz/2+.45)nx=player.pos.x;if(Math.abs(player.pos.x-s.x)<s.sx/2+.45&&Math.abs(nz-s.z)<s.sz/2+.5)nz=player.pos.z;}
  player.pos.x=nx;player.pos.z=nz; camera.position.copy(player.pos); camera.rotation.set(player.pitch,player.yaw,0,'YXZ');
  if(dx||dz){gun.position.y=Math.sin(now*.012)*.009;gun.position.x=Math.cos(now*.006)*.007;}else{gun.position.y+=(0-gun.position.y)*.13;gun.position.x+=(0-gun.position.x)*.13;}
  gun.rotation.x*=.76;
  if(fireHeld||keys.has('Space'))shoot(now);
  if(boss){
    const targetPos=new THREE.Vector3(player.pos.x,0,player.pos.z), toward=targetPos.clone().sub(boss.root.position); toward.y=0;
    if(toward.length()>7)boss.root.position.add(toward.normalize().multiplyScalar(boss.speed*dt));
    boss.root.lookAt(player.pos.x,1.3,player.pos.z); boss.root.position.y=Math.sin(now*.002)*.07;
    if(now>boss.nextShot){const source=boss.root.position.clone().add(new THREE.Vector3(0,2.1,0));spawnEnemyShot(source,player.pos.clone().add(new THREE.Vector3(0,-.15,0)));boss.nextShot=now+Math.max(950,2300-Math.floor(game.kills/10)*80);}
  }
  for(const ally of allies){
    const side=ally.slot?1:-1; ally.group.position.x+=(player.pos.x+side*2.15-ally.group.position.x)*Math.min(1,dt*2); ally.group.position.z+=(player.pos.z+4.5-ally.group.position.z)*Math.min(1,dt*2); ally.group.position.y=Math.sin(now*.003+ally.slot)*.045;
    if(boss){ally.group.rotation.y=Math.atan2(boss.root.position.x-ally.group.position.x,boss.root.position.z-ally.group.position.z);if(now>ally.nextShot){boss.hp-=12;updateBossHud();ally.nextShot=now+780+ally.slot*150;if(boss.hp<=0)eliminateBoss();}}
  }
  for(let i=projectiles.length-1;i>=0;i--){const p=projectiles[i];p.mesh.position.addScaledVector(p.velocity,dt);p.life-=dt;if(p.mesh.position.distanceTo(player.pos)<.8){damagePlayer(44+Math.floor(game.kills/12)*2);scene.remove(p.mesh);projectiles.splice(i,1);}else if(p.life<=0){scene.remove(p.mesh);projectiles.splice(i,1);}}
  if(now-game.lastDamage>4500&&game.hp<1000&&Math.floor(now/1400)!==Math.floor((now-dt*1000)/1400))setHp(game.hp+9);
  if(now>game.toastAt)$('toast').classList.remove('show');
}
function animate(now){requestAnimationFrame(animate);const dt=Math.min(.04,(now-lastFrame)/1000);lastFrame=now;updateGame(dt,now);renderer.render(scene,camera);}

window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));});
window.addEventListener('keydown',e=>{keys.add(e.code);if(e.code==='KeyR')reload();if(e.code==='Escape'&&game.active&&!game.paused){pauseGame();}if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();});
window.addEventListener('keyup',e=>keys.delete(e.code));
document.addEventListener('pointerlockchange',()=>{game.pointerLocked=document.pointerLockElement===canvas;});
document.addEventListener('mousemove',e=>{if(game.active&&!game.paused&&game.pointerLocked){player.yaw-=e.movementX*.0022;player.pitch=Math.max(-1.1,Math.min(1.05,player.pitch-e.movementY*.0022));}});
canvas.addEventListener('pointerdown',e=>{if(!game.active||game.paused)return;if(e.pointerType==='touch'){try{canvas.setPointerCapture?.(e.pointerId);}catch{}touchLook={x:e.clientX,y:e.clientY,id:e.pointerId};}else{fireHeld=true;shoot(performance.now());}});
canvas.addEventListener('pointermove',e=>{if(touchLook&&touchLook.id===e.pointerId){player.yaw-=(e.clientX-touchLook.x)*.007;player.pitch=Math.max(-1.05,Math.min(1.05,player.pitch-(e.clientY-touchLook.y)*.007));touchLook={x:e.clientX,y:e.clientY,id:e.pointerId};}});
canvas.addEventListener('pointerup',e=>{if(e.pointerType!=='touch')fireHeld=false;if(touchLook?.id===e.pointerId)touchLook=null;});
canvas.addEventListener('pointercancel',()=>{fireHeld=false;touchLook=null;});
function pauseGame(){game.paused=true;document.exitPointerLock?.();$('pause-summary').textContent=`${game.kills} / 100 bosses eliminated • Stage ${Math.floor(game.kills/10)+1}`;$('pause-screen').classList.remove('hidden');}
$('deploy-btn').addEventListener('click',startRun);$('again-btn').addEventListener('click',()=>{$('end-screen').classList.add('hidden');$('menu-screen').classList.remove('hidden');});
$('pause-btn').addEventListener('click',pauseGame);$('resume-btn').addEventListener('click',()=>{game.paused=false;$('pause-screen').classList.add('hidden');canvas.requestPointerLock?.();});
$('quit-btn').addEventListener('click',()=>{game.active=false;game.paused=false;$('pause-screen').classList.add('hidden');$('hud').classList.add('hidden');$('menu-screen').classList.remove('hidden');});
$('reload-btn').addEventListener('click',reload);
$('sound-btn').addEventListener('click',()=>{soundOn=!soundOn;$('sound-btn').innerHTML=`${soundOn?'♫':'♪'} <span>${soundOn?'SOUND ON':'SOUND'}</span>`;if(soundOn){audioCtx ||= new AudioContext();audioCtx.resume();}});
document.querySelectorAll('.mode-card').forEach(card=>card.addEventListener('click',()=>{document.querySelectorAll('.mode-card').forEach(c=>c.classList.remove('selected'));card.classList.add('selected');}));
document.querySelectorAll('[data-move]').forEach(button=>{const name=button.dataset.move;button.addEventListener('pointerdown',e=>{e.preventDefault();moveTouch.add(name);});for(const ev of ['pointerup','pointercancel','pointerleave'])button.addEventListener(ev,()=>moveTouch.delete(name));});
$('mobile-fire').addEventListener('pointerdown',e=>{e.preventDefault();fireHeld=true;shoot(performance.now());});for(const ev of ['pointerup','pointerleave','pointercancel'])$('mobile-fire').addEventListener(ev,()=>fireHeld=false);
$('loader').classList.add('done');setTimeout(()=>$('loader').remove(),600);requestAnimationFrame(animate);
