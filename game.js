'use strict';
// E-TEAM: Operazione Sobrietà Zero. Tattico/stealth isometrico in stile action figure, Canvas puro.

const $ = id => document.getElementById(id);
const cv = $('c'), ctx = cv.getContext('2d');
X = ctx;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const STOP = 12; // fps delle pose: effetto stop-motion
const BLIND = ['sleep', 'drink', 'eat', 'laugh', 'stunned', 'flee'];

let G = null, mouse = [0, 0], cw = 0, ch = 0, dpr = 1, zoom = 1, zoomMul = 1;
const keys = {};

function resize() {
    dpr = Math.min(2, devicePixelRatio || 1);
    cw = innerWidth; ch = innerHeight;
    cv.width = cw * dpr; cv.height = ch * dpr;
    cv.style.width = cw + 'px'; cv.style.height = ch + 'px';
    zoom = clamp(Math.min(cw / 820, ch / 560), 0.6, 1.5) * zoomMul;
}
addEventListener('resize', resize);
resize();

const PORT = {};
function portraitOf(kind) {
    if (kind === 'boss' && SPR['boss-astemi']) return spritePath('boss-astemi');
    if (kind === 'guard' && SPR['guard-alert']) return spritePath('guard-alert');
    return PORT[kind] || (PORT[kind] = makePortrait(kind === 'boss' ? BOSS_LOOK : GUARD_LOOK, kind === 'boss' ? 'angry' : 'shock'));
}

// ---------- missione ----------
function loadMission(i) {
    const m = MISSIONS[i];
    const map = m.map.map(r => r.split(''));
    const guards = m.guards.map((g, k) => ({
        kind: 'guard', path: g.p, boss: !!g.boss, label: g.label || (g.tag ? 'Ispettore' : ''), look: g.boss ? BOSS_LOOK : g.fat ? { ...GUARD_LOOK, fat: true } : GUARD_LOOK,
        tag: g.tag || (g.boss ? 'boss' : null), immune: g.immune || [], foodie: !!g.foodie,
        x: g.p[0][0] + .5, y: g.p[0][1] + .5, pi: 0, route: [], mode: 'patrol', timer: 0,
        dir: g.base || 0, base: g.base || 0, sweep: g.sweep || 1,
        speed: g.boss ? 0 : 1.6, fov: g.boss ? 1.5 : 1.25, range: g.boss ? 8.5 : 6.5,
        meter: 0, after: null, say: null, phase: 0, back: false, flip: false, seed: k * 1.7, alerted: false,
        chatT: rnd(8, 25), hitT: 0, fxT: 0, susp: false, spot: null, repath: 0,
    }));
    G = {
        mi: i, m, map, W: map[0].length, H: map.length, t: 0, state: 'play', sel: 0, follow: false,
        targeting: -1, free: false, cam: { x: 0, y: 0 }, guards, baits: [], dyn: [], proj: [], parts: [], later: [],
        shake: 0, marker: null, ambT: 0,
        chars: CHARS.map((c, k) => ({
            ...c, kind: 'char', x: m.starts[k][0] + .5, y: m.starts[k][1] + .5,
            route: [], cd: [0, 0], disguise: 0, want: null, say: null, phase: 0, back: true, flip: false,
            actT: 0, actDur: 0, actKind: null, actProp: undefined, fireT: 0, hitT: 0, seed: k * 2.3, quipT: rnd(8, 20) + k * 4,
        })),
        objs: m.steps.map(o => ({ ...o, done: false })),
    };
    const xs = m.starts.map(p => p[0]), ys = m.starts.map(p => p[1]);
    G.safe = { x0: Math.max(1, Math.min(...xs) - 1), x1: Math.min(G.W - 1, Math.max(...xs) + 2), y0: Math.max(1, Math.min(...ys) - 1), y1: Math.min(G.H - 1, Math.max(...ys) + 2) };
    const c = G.chars[0];
    [G.cam.x, G.cam.y] = iso(c.x, c.y);
}

const inSafe = e => e.x >= G.safe.x0 && e.x < G.safe.x1 && e.y >= G.safe.y0 && e.y < G.safe.y1;

// ---------- mappa / percorsi ----------
function tileAt(x, y) {
    if (!G || x < 0 || y < 0 || x >= G.W || y >= G.H) return '#';
    return G.map[y][x];
}
const canDoor = c => c.kind === 'guard' || c.id === 'alcan' || (c.id === 'proboscis' && c.disguise > 0);
function walk(x, y, who) {
    const t = tileAt(x, y);
    if (t === 'K') return !!who && canDoor(who);
    if (t === 'V') return !!who && who.id === 'alcan';
    return !'#TBOCDEg'.includes(t);
}
const opaqueTile = t => '#TBKV'.includes(t);
function inSmoke(x, y) { return G.baits.some(b => b.kind === 'smoke' && Math.hypot(b.x - x, b.y - y) < b.r); }
function opaque(x, y) { return opaqueTile(tileAt(Math.floor(x), Math.floor(y))) || inSmoke(x, y); }
function los(x0, y0, x1, y1) {
    const d = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(d / .2);
    for (let k = 1; k < n; k++) {
        const f = k / n;
        if (opaque(x0 + (x1 - x0) * f, y0 + (y1 - y0) * f)) return false;
    }
    return true;
}

function bfs(sx, sy, tx, ty, who) {
    if (!walk(tx, ty, who)) {
        let best = null, bd = 1e9;
        for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
            if (!walk(tx + dx, ty + dy, who)) continue;
            const d = Math.hypot(tx + dx - sx, ty + dy - sy);
            if (d < bd) { bd = d; best = [tx + dx, ty + dy]; }
        }
        if (!best) return null;
        [tx, ty] = best;
    }
    const W = G.W, H = G.H, prev = new Int32Array(W * H).fill(-1), start = sy * W + sx;
    const q = [start];
    prev[start] = start;
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    for (let h = 0; h < q.length; h++) {
        const c = q[h], cx = c % W, cy = (c / W) | 0;
        if (cx === tx && cy === ty) break;
        for (const [dx, dy] of dirs) {
            const nx = cx + dx, ny = cy + dy;
            if (nx < 0 || ny < 0 || nx >= W || ny >= H || prev[ny * W + nx] >= 0 || !walk(nx, ny, who)) continue;
            if (dx && dy && (!walk(cx + dx, cy, who) || !walk(cx, cy + dy, who))) continue;
            prev[ny * W + nx] = c;
            q.push(ny * W + nx);
        }
    }
    if (prev[ty * W + tx] < 0) return null;
    const path = [];
    for (let c = ty * W + tx; c !== start; c = prev[c]) path.push([c % W + .5, ((c / W) | 0) + .5]);
    return path.reverse();
}

function face(e, dx, dy) {
    const sx = dx - dy, sy = dx + dy;
    if (Math.abs(sx) > .01) e.flip = sx < 0;
    if (Math.abs(sy) > .01) e.back = sy < 0;
}

function follow(e, speed, dt) {
    if (!e.route.length) return false;
    const [tx, ty] = e.route[0], dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy), s = speed * dt;
    if (e.kind === 'char') face(e, dx, dy);
    if (d <= s) { e.x = tx; e.y = ty; e.route.shift(); } else { e.x += dx / d * s; e.y += dy / d * s; }
    e.phase += dt * speed * 3.2;
    return true;
}

// ---------- effetti ----------
function part(o) {
    if (G.parts.length > 700) return;
    G.parts.push(Object.assign({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, g: 0, life: 0, max: 1, size: 4, grow: 0, col: '#fff', kind: 'puff', rot: 0, vr: 0, seed: Math.random() * 9 }, o));
}
function burst(n, x, y, f) { for (let k = 0; k < n; k++) part(Object.assign({ x, y }, f(k))); }
function pop(x, y, txt, col = '#ffd23f', size = 34) { part({ kind: 'pop', x, y, z: 80, txt, col, size, max: 1.4, rot: rnd(-.15, .15), vz: 14 }); }
function shake(v) { G.shake = Math.max(G.shake, v); }
function later(t, f) { G.later.push({ t, f }); }

function smokeAt(x, y, r, col, face) {
    const a = rnd(0, 7), d = Math.sqrt(Math.random()) * r;
    part({ kind: 'puff', x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, z: rnd(0, 20), vz: rnd(8, 22), size: rnd(10, 18), grow: 1, max: rnd(1.6, 2.6), col, alpha: .55, face });
}
function explosionFx(x, y) {
    burst(28, x, y, () => ({ kind: 'fire', z: 10, vx: rnd(-2.5, 2.5), vy: rnd(-2.5, 2.5), vz: rnd(30, 140), size: rnd(8, 16), max: rnd(.4, .8) }));
    burst(14, x, y, () => ({ kind: 'puff', z: 10, vx: rnd(-1, 1), vy: rnd(-1, 1), vz: rnd(20, 60), size: rnd(14, 22), grow: 1.2, max: rnd(1.4, 2.2), col: '#6a6a6a' }));
    burst(18, x, y, () => ({ kind: 'debris', z: 10, vx: rnd(-3, 3), vy: rnd(-3, 3), vz: rnd(120, 260), g: 520, size: rnd(2, 4), max: 1.6, col: pick(['#8a5a2b', '#a8763f', '#555']), rot: rnd(0, 6), vr: rnd(-12, 12) }));
    burst(16, x, y, () => ({ kind: 'spark', z: 20, vx: rnd(-4, 4), vy: rnd(-4, 4), vz: rnd(80, 200), g: 300, size: 3, max: .7, col: '#ffe14a' }));
}

// ---------- messaggi ----------
let toastTimer = 0;
function toast(txt, ms = 2800) {
    const t = $('toast');
    t.textContent = txt; t.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('on'), ms);
}
function talk(e, txt, dur = 2.6, shout = false) { e.say = { txt, t: 0, dur, shout }; sfx('talk'); }

// ---------- abilità ----------
function startAbility(k) {
    if (!G || G.state !== 'play') return;
    const c = G.chars[G.sel], ab = c.ab[k];
    if (c.cd[k] > 0) { toast(ab.name + ' in ricarica (' + Math.ceil(c.cd[k]) + 's)'); return; }
    if (!ab.target) { castAt(c, k); return; }
    G.targeting = G.targeting === k ? -1 : k;
    if (G.targeting >= 0) toast(ab.icon + ' ' + ab.name + ': tocca/clicca dove usarla (Esc per annullare)');
    refreshHud();
}

function act(c, kind, dur = .6, prop) { c.actKind = kind; c.actT = 0; c.actDur = dur; c.actProp = prop; }

function throwProj(c, wx, wy, kind, onLand) {
    const d = Math.hypot(wx - c.x, wy - c.y);
    G.proj.push({ x0: c.x, y0: c.y, x1: wx, y1: wy, x: c.x, y: c.y, z: 30, t: 0, dur: .35 + d * .08, h: 40 + d * 10, kind, onLand, delay: .18 });
    later(.15, () => sfx('throw'));
}

function castAt(c, k, wx, wy) {
    const ab = c.ab[k];
    if (ab.target) {
        const d = Math.hypot(wx - c.x, wy - c.y);
        if (d > ab.range) { wx = c.x + (wx - c.x) / d * ab.range; wy = c.y + (wy - c.y) / d * ab.range; }
        face(c, wx - c.x, wy - c.y);
    }
    G.targeting = -1;
    let ok = true;
    switch (c.id + k) {
        case 'estice0':
            act(c, 'throw', .6, 'dynamite');
            throwProj(c, wx, wy, 'dynamite', () => G.dyn.push({ x: wx, y: wy, t: 2.2 }));
            break;
        case 'estice1': esticeGas(c); break;
        case 'alcan0':
            act(c, 'throw', .6, 'whisky');
            throwProj(c, wx, wy, 'whisky', () => {
                sfx('glass');
                G.baits.push({ kind: 'whisky', x: wx, y: wy, t: 10, r: 0 });
                burst(8, wx, wy, () => ({ kind: 'spark', z: 6, vx: rnd(-1.5, 1.5), vy: rnd(-1.5, 1.5), vz: rnd(40, 90), g: 260, size: 2.5, max: .5, col: '#ffd27a' }));
                lure(wx, wy, 9, 'drink', 6, 'Glu glu... Macallan 12!');
            });
            break;
        case 'alcan1': ok = alcanPunch(c); break;
        case 'muglo0':
            act(c, 'throw', .6, 'tongs');
            throwProj(c, wx, wy, 'grill', () => {
                sfx('sizzle');
                G.baits.push({ kind: 'smoke', x: wx, y: wy, t: 10, r: 2.4, fx: 0 });
                lure(wx, wy, 8, 'look', 4, 'Che profumo di brace!', 'food');
                pop(wx, wy, 'SFRIIII!', '#ffb02a', 26);
            });
            break;
        case 'muglo1':
            act(c, 'throw', .7, 'ember'); c.fireT = 1.4; sfx('sizzle');
            throwProj(c, wx, wy, 'ember', () => emberLand(wx, wy));
            break;
        case 'unicorn0':
            act(c, 'throw', .6, 'potion');
            throwProj(c, wx, wy, 'potion', () => potionLand(wx, wy));
            break;
        case 'unicorn1': unicornJoke(c); break;
        case 'proboscis0':
            c.disguise = 14; sfx('poof'); act(c, 'up', .5);
            burst(14, c.x, c.y, () => ({ kind: 'puff', z: rnd(10, 50), vx: rnd(-1, 1), vy: rnd(-1, 1), vz: rnd(10, 30), size: rnd(10, 16), grow: .8, max: .9, col: '#f4f4f4' }));
            pop(c.x, c.y, 'TA-DAN!', '#7ec0ee', 28);
            break;
        case 'proboscis1': proboscisWow(c); break;
    }
    if (!ok) return;
    const line = pick(c.castLines[k] || []);
    if (line && !(c.say && c.say.t < .5)) talk(c, line, 2.2, true);
    c.cd[k] = ab.cd;
    refreshHud();
}

function awake(g) { return !BLIND.includes(g.mode); }
const IMMUNE_LINES = {
    sleep: ['Ho bevuto quattro caffè, non dormo!', 'Sonno? Mai sentito.'],
    punch: ['Mi hai fatto il solletico.', 'Troppo piccolo, amico.'],
    laugh: ['Non fa ridere.', 'Ho zero senso dell\'umorismo.'],
    stun: ['Ho visto di meglio.', 'Niente di che.'],
    flee: ['Il fuoco non mi spaventa.'],
    lure: ['Non mi muovo da qui.', 'Resto al mio posto.'],
};
function immune(g, kind) {
    if (!g.immune.includes(kind)) return false;
    if (!(g.say && g.say.t < 1)) talk(g, pick(IMMUNE_LINES[kind]), 2);
    return true;
}
function inReach(c, r, needLos = true) {
    return G.guards.filter(g => awake(g) && Math.hypot(g.x - c.x, g.y - c.y) < r && (!needLos || los(c.x, c.y, g.x, g.y)));
}

function esticeGas(c) {
    act(c, 'adjust', 1.1); sfx('fart'); shake(4);
    pop(c.x, c.y, 'PRRRRT!', '#8fdc4a', 40);
    G.baits.push({ kind: 'gas', x: c.x, y: c.y, t: 6, r: 2.3, fx: 0 });
    for (let k = 0; k < 22; k++) smokeAt(c.x, c.y, 1.6, '#9ad84a', k % 6 ? null : '☠');
    lure(c.x, c.y, 6.5, 'look', 3, 'Che puzza... da dove viene?');
}

function alcanPunch(c) {
    const g = inReach(c, c.ab[1].range).sort((a, b) => Math.hypot(a.x - c.x, a.y - c.y) - Math.hypot(b.x - c.x, b.y - c.y))[0];
    if (!g) { toast('Nessuno a portata... per sua fortuna!'); talk(c, 'Dove siete, codardi?!', 1.8, true); return false; }
    if (immune(g, 'punch')) { act(c, 'punch', .5); sfx('punch'); toast(g.label + ': immune ai pugni.'); return true; }
    const d = Math.hypot(g.x - c.x, g.y - c.y);
    if (d > .7) { c.x = g.x - (g.x - c.x) / d * .7; c.y = g.y - (g.y - c.y) / d * .7; }
    c.route = []; face(c, g.x - c.x, g.y - c.y);
    act(c, 'punch', .5); sfx('punch'); shake(6);
    pop(g.x, g.y, 'POW!', '#ff4a3a', 40);
    burst(8, g.x, g.y, () => ({ kind: 'star', z: rnd(40, 60), vx: rnd(-2, 2), vy: rnd(-2, 2), vz: rnd(40, 100), g: 200, size: rnd(5, 8), max: .9, rot: rnd(0, 6), vr: rnd(-6, 6) }));
    g.hitT = .4;
    sleepGuard(g, g.boss ? 4 : 7, pick(GUARD_LINES.punch));
    lure(c.x, c.y, 4, 'look', 3, 'Cos\'è stato?!');
    return true;
}

function emberLand(x, y) {
    sfx('sizzle'); pop(x, y, 'FSSSH!', '#ff7a1a', 32);
    burst(20, x, y, () => ({ kind: 'fire', z: 4, vx: rnd(-1.5, 1.5), vy: rnd(-1.5, 1.5), vz: rnd(30, 90), size: rnd(6, 12), max: rnd(.5, 1) }));
    G.guards.forEach(g => {
        if (!awake(g) || Math.hypot(g.x - x, g.y - y) > 2.4) return;
        if (g.boss) { talk(g, 'Brace?! Che maleducazione!', 2.4, true); return; }
        if (immune(g, 'flee')) return;
        flee(g, x, y);
    });
}

function flee(g, sx, sy) {
    const dx = g.x - sx, dy = g.y - sy, d = Math.hypot(dx, dy) || 1;
    let route = null;
    for (let r = 6; r >= 2 && !route; r--) {
        const tx = Math.floor(g.x + dx / d * r), ty = Math.floor(g.y + dy / d * r);
        if (walk(tx, ty, g)) route = bfs(Math.floor(g.x), Math.floor(g.y), tx, ty, g);
    }
    g.mode = 'flee'; g.timer = 5; g.route = route || []; g.meter = 0;
    talk(g, pick(GUARD_LINES.flee), 2, true);
}

function potionLand(x, y) {
    sfx('glass'); sfx('potion'); pop(x, y, 'SLURP!', '#ffc928', 32);
    burst(22, x, y, () => ({ kind: 'bubble', z: rnd(0, 20), vx: rnd(-1.2, 1.2), vy: rnd(-1.2, 1.2), vz: rnd(20, 60), size: rnd(3, 7), max: rnd(.8, 1.5), col: 'rgba(255,200,40,.6)' }));
    let n = 0;
    G.guards.forEach(g => {
        if (Math.hypot(g.x - x, g.y - y) < 1.9 && g.mode !== 'sleep' && !immune(g, 'sleep')) { sleepGuard(g, g.boss ? 16 : 14, pick(GUARD_LINES.sleep)); n++; }
    });
    toast(n ? 'Pozione al luppolo: nanna!' : 'Pozione sprecata... nessuno nel raggio.');
}

function unicornJoke(c) {
    act(c, 'up', 1.4);
    talk(c, pick(c.jokes), 3.2, true);
    later(1.3, () => {
        const hit = inReach(c, c.ab[1].range);
        if (!hit.length) { toast('Nessuno ha riso. Silenzio imbarazzante.'); sfx('lose'); return; }
        sfx('laugh');
        pop(c.x, c.y, 'AHAHAH!', '#f07ab8', 36);
        hit.forEach(g => { if (immune(g, 'laugh')) return; g.mode = 'laugh'; g.timer = 8; g.route = []; g.meter = 0; talk(g, pick(GUARD_LINES.laugh), 2.4, true); });
    });
}

function proboscisWow(c) {
    act(c, 'adjust', 1.2);
    later(.5, () => {
        sfx('whistle');
        pop(c.x, c.y, 'WOW!', '#ff7ab8', 42);
        const hit = inReach(c, c.ab[1].range);
        if (!hit.length) toast('Nessuno ha visto. Peccato.');
        hit.forEach(g => {
            if (immune(g, 'stun')) return;
            g.mode = 'stunned'; g.timer = 7; g.route = []; g.meter = 0;
            face(g, c.x - g.x, c.y - g.y);
            g.dir = Math.atan2(c.y - g.y, c.x - g.x);
            talk(g, pick(GUARD_LINES.stunned), 2.6);
            part({ kind: 'text', x: g.x, y: g.y, z: 70, vz: 30, txt: '!!', col: '#ff7ab8', size: 18, max: 1.2 });
        });
    });
}

function sleepGuard(g, t, txt) { g.mode = 'sleep'; g.timer = t; g.route = []; g.meter = 0; talk(g, txt); sfx('sleep'); }

function lure(x, y, range, mode, dur, msg, kind = 'lure') {
    G.guards.forEach(g => {
        if (g.boss || !['patrol', 'look', 'goto'].includes(g.mode)) return;
        if (Math.hypot(g.x - x, g.y - y) > range) return;
        let after = { mode, dur, msg };
        if (kind === 'food' && g.foodie) after = { mode: 'eat', dur: 14, msg: 'Salsicce! Le mie preferite!' };
        else if (g.immune.includes('lure')) return;
        const r = bfs(Math.floor(g.x), Math.floor(g.y), Math.floor(x), Math.floor(y), g);
        if (!r) return;
        g.mode = 'goto'; g.route = r; g.after = after;
        talk(g, pick(GUARD_LINES.lure), 1.2);
        part({ kind: 'text', x: g.x, y: g.y, z: 75, vz: 25, txt: '?', col: '#ffd23f', size: 22, max: 1 });
    });
}

function explode(d) {
    const R = 2.3;
    for (let j = Math.floor(d.y - R); j <= Math.ceil(d.y + R); j++) for (let i = Math.floor(d.x - R); i <= Math.ceil(d.x + R); i++) {
        if (tileAt(i, j) === 'B' && Math.hypot(i + .5 - d.x, j + .5 - d.y) <= R + .5) {
            G.map[j][i] = ',';
            burst(14, i + .5, j + .5, () => ({ kind: 'debris', z: 20, vx: rnd(-3, 3), vy: rnd(-3, 3), vz: rnd(150, 280), g: 520, size: rnd(3, 5), max: 1.8, col: pick(['#a8763f', '#ffd23f', '#8a5a2b']), rot: rnd(0, 6), vr: rnd(-12, 12) }));
        }
    }
    G.guards.forEach(g => { if (!g.boss && Math.hypot(g.x - d.x, g.y - d.y) < 1.8) { g.hitT = .5; if (!g.immune.includes('sleep')) sleepGuard(g, 5, 'Bzzzz... stordito'); } });
    G.chars.forEach(c => { if (Math.hypot(c.x - d.x, c.y - d.y) < 2.5) c.hitT = .5; });
    explosionFx(d.x, d.y);
    pop(d.x, d.y, 'BOOM!', '#ff8a1a', 52);
    shake(16); sfx('boom');
    lure(d.x, d.y, 10, 'look', 5, 'Cos\'è stato?!');
}

// ---------- interazione e step ----------
const charName = id => CHARS.find(c => c.id === id).name;
const stepReady = o => (o.after || []).every(id => G.objs.find(x => x.id === id).done);
const bossGuard = () => G.guards.find(g => g.boss);

function interact(c) {
    const o = G.objs.find(o => !o.done && o.x != null && Math.hypot(c.x - (o.x + .5), c.y - (o.y + .5)) < 1.9);
    if (!o) { toast('Qui non c\'è niente da fare.'); return false; }
    if (!stepReady(o)) {
        const miss = o.after.map(id => G.objs.find(x => x.id === id)).filter(x => !x.done);
        toast('Prima: ' + miss.map(x => x.text).join(' · '), 3500);
        return false;
    }
    if (o.who && c.id !== o.who) { toast('Serve ' + charName(o.who) + ': ' + o.text, 3200); talk(c, 'Non sono capace... chiamate ' + charName(o.who) + '!'); return false; }
    if (o.disguise && !(c.disguise > 0)) { toast('Proboscis deve prima indossare il completo da agente (Q).', 3200); talk(c, 'Così in maglietta non mi prendono sul serio.'); return false; }
    if (o.asleep === 'boss' && bossGuard().mode !== 'sleep') { toast(o.lock); talk(bossGuard(), pick(GUARD_LINES.boss), 2.4, true); return false; }
    completeStep(o, c);
    return true;
}

function completeStep(o, c) {
    o.done = true;
    toast('✔ ' + o.msg, 4000);
    sfx('objective');
    const [ox, oy] = o.x != null ? [o.x + .5, o.y + .5] : c ? [c.x, c.y] : [G.chars[G.sel].x, G.chars[G.sel].y];
    pop(ox, oy, o.pop || 'FATTO!', '#7fff7a', 36);
    if (c) { act(c, 'up', 1.4); talk(c, pick(['EVVAI!', 'Sììì!', 'Siamo leggenda!', 'Fatto!']), 2, true); }
    burst(30, ox, oy, () => ({ kind: 'confetti', z: 60, vx: rnd(-2.5, 2.5), vy: rnd(-2.5, 2.5), vz: rnd(80, 220), g: 240, max: 2.2, col: pick(['#ff4a6a', '#ffd23f', '#4ad0ff', '#7fff7a', '#c07aff']), rot: rnd(0, 6), vr: rnd(-8, 8) }));
    if (o.kind === 'grill' && c) { c.fireT = 2; burst(24, ox, oy, () => ({ kind: 'fire', z: 24, vx: rnd(-1, 1), vy: rnd(-1, 1), vz: rnd(40, 120), size: rnd(8, 14), max: rnd(.6, 1.1) })); }
    if (o.opens) openGates(o.opens);
    if (o.feast) feast(ox, oy);
    refreshHud();
    if (G.objs.every(x => x.done)) {
        G.state = 'won';
        later(1.2, () => sfx('win'));
        setTimeout(showOutro, 2600);
    }
}

function openGates(ch) {
    G.map.forEach((r, j) => r.forEach((t, i) => {
        if (t !== ch) return;
        r[i] = ',';
        burst(10, i + .5, j + .5, () => ({ kind: 'spark', z: 20, vx: rnd(-1.5, 1.5), vy: rnd(-1.5, 1.5), vz: rnd(60, 140), g: 300, size: 3, max: .8, col: '#ffe14a' }));
        pop(i + .5, j + .5, 'CLANK!', '#c8d0d8', 26);
    }));
    sfx('whoosh');
}

// La griglia gigante attira tutte le guardie raggiungibili.
function feast(x, y) {
    G.guards.forEach(g => {
        if (g.boss || g.mode === 'sleep') return;
        const r = bfs(Math.floor(g.x), Math.floor(g.y), Math.floor(x), Math.floor(y), g);
        if (!r) return;
        g.mode = 'goto'; g.route = r; g.susp = false; g.meter = 0;
        g.after = { mode: 'eat', dur: 35, msg: pick(['ARROSTICINI!!', 'Uno solo... dai...', 'Che profumo!']) };
        talk(g, 'Arrosticini?!', 1.5, true);
    });
}

function checkSteps() {
    G.objs.forEach(o => { if (!o.done && o.cond && stepReady(o) && o.cond(G)) completeStep(o, o.who ? G.chars.find(c => c.id === o.who) : null); });
}

function select(i) {
    if (G.sel !== i) {
        sfx('select', i);
        if (Math.random() < .5) talk(G.chars[i], pick(['Agli ordini!', 'Eccomi!', 'Dimmi tutto.', 'Pronto!', 'Era ora!']), 1.4);
    }
    G.sel = i; G.targeting = -1; G.free = false;
    refreshHud();
}

function tap(px, py) {
    const c = G.chars[G.sel];
    const [wx, wy] = toWorld(px, py);
    if (G.targeting >= 0) { castAt(c, G.targeting, wx, wy); return; }
    const [hx, hy] = toWorld(px, py + 26);
    const hit = G.chars.findIndex(o => Math.hypot(o.x - hx, o.y - hy) < .9);
    if (hit >= 0) { select(hit); return; }
    const ti = Math.floor(wx), tj = Math.floor(wy);
    c.want = tileAt(ti, tj) === 'O' ? true : null;
    c.route = bfs(Math.floor(c.x), Math.floor(c.y), ti, tj, c) || [];
    G.marker = { x: ti + .5, y: tj + .5, t: 0, ok: c.route.length > 0 };
    sfx('click');
}

function toWorld(px, py) {
    const u = (px - cw / 2) / zoom + G.cam.x, v = (py - ch / 2) / zoom + G.cam.y;
    return [(v / 16 + u / 32) / 2, (v / 16 - u / 32) / 2];
}

// ---------- guardie ----------
function turn(g, a, dt) {
    const d = Math.atan2(Math.sin(a - g.dir), Math.cos(a - g.dir));
    g.dir += clamp(d, -4 * dt, 4 * dt);
}
function walkGuard(g, sp, dt) {
    if (!g.route.length) return;
    const [tx, ty] = g.route[0];
    turn(g, Math.atan2(ty - g.y, tx - g.x), dt);
    follow(g, sp, dt);
}

function updateGuard(g, dt) {
    g.hitT = Math.max(0, g.hitT - dt);
    g.moving = false;
    g.fxT -= dt;
    if (g.mode === 'sleep') {
        g.timer -= dt;
        if (g.fxT <= 0) { g.fxT = .9; part({ kind: 'text', x: g.x, y: g.y, z: 30, vx: .3, vz: 22, txt: 'Z', col: '#fff', size: 14, max: 1.6 }); }
        if (g.timer <= 0) { g.mode = 'patrol'; g.route = []; talk(g, pick(GUARD_LINES.wake)); }
        return;
    }
    if (['drink', 'eat', 'look', 'laugh', 'stunned', 'flee'].includes(g.mode)) {
        g.timer -= dt;
        if (g.mode === 'look') g.dir += Math.sin(G.t * 2.5) * dt * 1.2;
        if (g.mode === 'flee' && g.route.length) { walkGuard(g, 3.4, dt); g.moving = true; }
        if (g.mode === 'laugh' && g.fxT <= 0) { g.fxT = .35; part({ kind: 'text', x: g.x + rnd(-.3, .3), y: g.y, z: 60, vz: 40, txt: pick(['HA', 'AH', 'HAHA']), col: '#ffd23f', size: 12, max: .8 }); }
        if (g.mode === 'eat' && g.fxT <= 0) { g.fxT = .6; part({ kind: 'text', x: g.x, y: g.y, z: 60, vz: 30, txt: pick(['GNAM', 'SLURP', 'CRUNCH']), col: '#ffb02a', size: 11, max: .9 }); }
        if (g.mode === 'drink' && g.fxT <= 0) { g.fxT = .5; part({ kind: 'bubble', x: g.x, y: g.y, z: 55, vz: 20, size: 3, max: 1, col: 'rgba(255,200,90,.6)' }); }
        if (g.mode === 'flee' && g.fxT <= 0) { g.fxT = .25; part({ kind: 'spark', x: g.x, y: g.y, z: 60, vx: rnd(-1, 1), vz: 40, g: 200, size: 3, max: .6, col: '#7ec0ee' }); }
        if (g.timer <= 0) { g.mode = 'patrol'; g.route = []; }
        return;
    }
    if (g.susp && g.spot) {
        turn(g, Math.atan2(g.spot[1] - g.y, g.spot[0] - g.x), dt * 1.5);
        if (g.meter > .55 && !g.boss) {
            g.repath -= dt;
            if (g.repath <= 0) { g.repath = .5; g.route = bfs(Math.floor(g.x), Math.floor(g.y), Math.floor(g.spot[0]), Math.floor(g.spot[1]), g) || []; }
            if (Math.hypot(g.spot[0] - g.x, g.spot[1] - g.y) > 1.2) { walkGuard(g, 1.3, dt); g.moving = true; }
        }
        return;
    }
    if (g.mode === 'goto') {
        if (!g.route.length) { g.mode = g.after.mode; g.timer = g.after.dur; talk(g, g.after.msg); return; }
        walkGuard(g, g.speed * 1.5, dt); g.moving = true;
        return;
    }
    g.chatT -= dt;
    if (g.chatT <= 0) { g.chatT = rnd(14, 30); talk(g, pick(g.boss ? GUARD_LINES.boss : GUARD_LINES.patrol), 2.4); }
    if (g.path.length === 1) {
        const p = g.path[0];
        if (Math.hypot(g.x - (p[0] + .5), g.y - (p[1] + .5)) > .15) {
            if (!g.route.length) g.route = bfs(Math.floor(g.x), Math.floor(g.y), p[0], p[1], g) || [];
            walkGuard(g, g.speed || 1.6, dt); g.moving = true;
        } else turn(g, g.base + Math.sin(G.t * .7) * g.sweep, dt);
        return;
    }
    if (!g.route.length) {
        g.pi = (g.pi + 1) % g.path.length;
        g.route = bfs(Math.floor(g.x), Math.floor(g.y), g.path[g.pi][0], g.path[g.pi][1], g) || [];
    }
    walkGuard(g, g.speed, dt); g.moving = true;
}

function detect(dt) {
    for (const g of G.guards) {
        if (!awake(g)) { g.meter = Math.max(0, g.meter - dt); g.susp = false; g.spot = null; continue; }
        let seen = 0, spot = null;
        for (const c of G.chars) {
            if (inSafe(c)) continue;
            const dx = c.x - g.x, dy = c.y - g.y, d = Math.hypot(dx, dy);
            if (d > g.range || (c.disguise > 0 && d > 2)) continue;
            const a = Math.atan2(Math.sin(Math.atan2(dy, dx) - g.dir), Math.cos(Math.atan2(dy, dx) - g.dir));
            if (Math.abs(a) > g.fov / 2 && d > 1) continue;
            if (!los(g.x, g.y, c.x, c.y)) continue;
            const rate = d < g.range * .45 ? 2.5 : .6 + (g.range - d) * .1;
            if (rate > seen) { seen = rate; spot = [c.x, c.y]; }
        }
        if (spot) g.spot = spot;
        g.meter = clamp(g.meter + (seen ? seen * dt : -.35 * dt), 0, 1);
        if (g.meter > .15 && !g.susp) {
            g.susp = true; g.route = [];
            talk(g, pick(['Eh? Chi va là?', 'Hm? Ho visto qualcosa...', 'C\'è qualcuno?', 'Puzza di luppolo...']), 1.8);
            part({ kind: 'text', x: g.x, y: g.y, z: 80, vz: 25, txt: '?', col: '#ffd23f', size: 26, max: 1 });
        }
        if (g.meter <= .02 && g.susp) { g.susp = false; g.spot = null; g.route = []; talk(g, 'Mah... sarà stato il vento.', 1.6); }
        if (g.meter > .6 && !g.alerted) {
            g.alerted = true; sfx('alert');
            part({ kind: 'text', x: g.x, y: g.y, z: 80, vz: 30, txt: '!', col: '#ff3a3a', size: 30, max: .9 });
        }
        if (g.meter < .3) g.alerted = false;
        if (g.meter >= 1) { fail(g); return; }
    }
}

function fail(g) {
    G.state = 'lost';
    talk(g, 'ALT! Controllo sobrietà!', 3, true);
    g.hitT = .6; shake(8); sfx('lose');
    pop(g.x, g.y, 'BECCATI!', '#ff3a3a', 40);
    setTimeout(() => {
        if (!G || G.state !== 'lost') return;
        screen('<div class="cut"><div class="pimg"><img src="' + portraitOf('guard') + '" alt=""></div><div class="pbub"><b>Ispettore Acqua</b><p>ALT! Controllo sobrietà!</p></div></div>' +
            '<h2>Beccati!</h2><p>' + pick(FAIL_LINES) + '</p><button class="btn" onclick="begin(' + G.mi + ')">Riprova</button><button class="btn ghost" onclick="showTitle()">Menu</button>');
    }, 1600);
}

// ---------- aggiornamento ----------
function update(dt) {
    G.t += dt;
    const pan = 520 * dt / zoom;
    const px = (keys.ArrowRight || keys.d ? 1 : 0) - (keys.ArrowLeft || keys.a ? 1 : 0);
    const py = (keys.ArrowDown || keys.s ? 1 : 0) - (keys.ArrowUp || keys.w ? 1 : 0);
    if (px || py) { G.cam.x += px * pan; G.cam.y += py * pan; G.free = true; }

    G.later.forEach(l => { l.t -= dt; if (l.t <= 0) l.f(); });
    G.later = G.later.filter(l => l.t > 0);

    const all = [...G.chars, ...G.guards];
    all.forEach(e => { if (e.say) { e.say.t += dt; if (e.say.t > e.say.dur) e.say = null; } });

    if (G.state === 'play') {
        G.chars.forEach((c, i) => {
            c.cd = c.cd.map(v => Math.max(0, v - dt));
            c.disguise = Math.max(0, c.disguise - dt);
            c.fireT = Math.max(0, c.fireT - dt);
            c.hitT = Math.max(0, c.hitT - dt);
            if (c.actKind) { c.actT += dt; if (c.actT >= c.actDur) { c.actKind = null; c.actProp = undefined; } }
            if (i !== G.sel && G.follow && !c.route.length) {
                const l = G.chars[G.sel];
                if (Math.hypot(l.x - c.x, l.y - c.y) > 2.4) c.route = bfs(Math.floor(c.x), Math.floor(c.y), Math.floor(l.x), Math.floor(l.y), c) || [];
            }
            c.moving = !c.actKind && follow(c, c.id === 'alcan' ? 3.6 : 3.3, dt);
            if (c.want && !c.route.length) { c.want = null; interact(c); }
            if (c.fireT > 0 && Math.random() < .5) part({ kind: 'fire', x: c.x + (c.flip ? -.25 : .25), y: c.y - .25, z: 30, vz: rnd(30, 60), size: rnd(4, 7), max: .5 });
            c.quipT -= dt;
            if (c.quipT <= 0 && !c.moving && !c.say) { c.quipT = rnd(16, 30); talk(c, pick(c.quips), 3); }
        });
        G.guards.forEach(g => updateGuard(g, dt));
        for (const d of G.dyn) {
            d.t -= dt;
            if (Math.random() < .6) part({ kind: 'spark', x: d.x, y: d.y, z: 22, vx: rnd(-.8, .8), vy: rnd(-.8, .8), vz: rnd(30, 80), g: 200, size: 2.5, max: .4, col: pick(['#ffe14a', '#ff7a1a']) });
            if (Math.random() < .1) sfx('fuse');
            if (d.t <= 0) explode(d);
        }
        G.dyn = G.dyn.filter(d => d.t > 0);
        G.baits.forEach(b => {
            b.t -= dt;
            if (b.kind === 'smoke' || b.kind === 'gas') {
                b.fx -= dt;
                if (b.fx <= 0 && b.t > 1) { b.fx = b.kind === 'gas' ? .12 : .09; smokeAt(b.x, b.y, b.r * .8, b.kind === 'gas' ? '#9ad84a' : '#d8d8d8', b.kind === 'gas' && Math.random() < .15 ? '☠' : null); }
            }
            if (b.kind === 'gas') G.guards.forEach(g => {
                if (g.mode !== 'sleep' && Math.hypot(g.x - b.x, g.y - b.y) < b.r && !g.immune.includes('sleep')) { sleepGuard(g, g.boss ? 10 : 8, pick(GUARD_LINES.gas)); g.hitT = .3; }
            });
        });
        G.baits = G.baits.filter(b => b.t > 0);
        checkSteps();
        if (G.t > 4) detect(dt);
    } else {
        G.chars.forEach(c => { if (c.actKind) { c.actT += dt; if (c.actT >= c.actDur) c.actKind = null; } });
    }

    G.proj.forEach(p => {
        if (p.delay > 0) { p.delay -= dt; return; }
        p.t += dt;
        const f = Math.min(1, p.t / p.dur);
        p.x = p.x0 + (p.x1 - p.x0) * f; p.y = p.y0 + (p.y1 - p.y0) * f;
        p.z = 4 * p.h * f * (1 - f) + 30 * (1 - f);
        if (p.kind === 'ember' || p.kind === 'dynamite') part({ kind: p.kind === 'ember' ? 'fire' : 'spark', x: p.x, y: p.y, z: p.z, size: 5, max: .35, col: '#ffe14a' });
        if (f >= 1) { p.done = true; p.onLand(); }
    });
    G.proj = G.proj.filter(p => !p.done);

    G.parts.forEach(p => {
        p.life += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.rot += p.vr * dt;
        if (p.g) {
            p.vz -= p.g * dt;
            if (p.z < 0) { p.z = 0; p.vz *= -.35; p.vx *= .6; p.vy *= .6; p.vr *= .5; }
        }
    });
    G.parts = G.parts.filter(p => p.life < p.max);

    ambient(dt);
    if (G.marker) { G.marker.t += dt; if (G.marker.t > .7) G.marker = null; }
    G.shake = Math.max(0, G.shake - dt * 30);

    if (!G.free) {
        const [tx, ty] = iso(G.chars[G.sel].x, G.chars[G.sel].y);
        G.cam.x += (tx - G.cam.x) * Math.min(1, dt * 5);
        G.cam.y += (ty - G.cam.y) * Math.min(1, dt * 5);
    }
    document.querySelectorAll('.ch').forEach((e, i) => {
        const c = G.chars[i];
        e.querySelectorAll('.cd').forEach((b, k) => b.style.height = (c.cd[k] / c.ab[k].cd * 100) + '%');
    });
}

function ambient(dt) {
    G.ambT -= dt;
    if (G.ambT > 0) return;
    G.ambT = .25;
    const th = G.m.theme;
    if (th.steam) G.objs.filter(o => o.kind === 'tank').forEach(o => part({ kind: 'puff', x: o.x + .5, y: o.y + .5, z: 90, vz: rnd(15, 30), vx: rnd(-.2, .2), size: rnd(6, 10), grow: 1.5, max: 2, col: '#ffffff', alpha: o.done ? .6 : .25 }));
    if (th.prop === 'table' && Math.random() < .6) {
        const cs = [];
        G.map.forEach((r, j) => r.forEach((t, i) => t === 'C' && cs.push([i, j])));
        const [i, j] = pick(cs);
        part({ kind: 'puff', x: i + .5, y: j + .5, z: 30, vz: rnd(10, 25), size: rnd(5, 9), grow: 1.5, max: 2, col: '#e8e8e8', alpha: .35 });
    }
    (G.m.signs || []).forEach(s => { if (Math.random() < .25) part({ kind: 'text', x: s.x + rnd(-.5, .5), y: s.y, z: 140, vz: 25, vx: rnd(-.4, .4), txt: pick(['♪', '♫']), col: '#ff9abf', size: 16, max: 2 }); });
    G.objs.forEach(o => {
        if (!o.done || o.x == null) return;
        if (o.kind === 'tap') part({ kind: 'bubble', x: o.x + .7, y: o.y + .5, z: 45, vz: rnd(10, 30), size: rnd(2, 4), max: 1.2, col: 'rgba(255,240,200,.7)' });
        if (o.kind === 'grill') for (let k = 0; k < 3; k++) part({ kind: 'fire', x: o.x + rnd(0, 1), y: o.y + rnd(.2, .8), z: 26, vz: rnd(20, 50), size: rnd(4, 8), max: .6 });
    });
}

// ---------- disegno ----------
function ell(x, y, rx, ry, fill, stroke, lw = 2) {
    const [sx, sy] = iso(x, y);
    ctx.beginPath(); ctx.ellipse(sx, sy, rx, ry, 0, 0, 7);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
const ringR = r => [r * 32 * 1.4142, r * 16 * 1.4142];

function floorUnder(i, j) {
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const t = tileAt(i + dx, j + dy); if (',.p'.includes(t)) return t; }
    return 'p';
}
function floorFill(t, th) {
    const kind = th.mat[t] || 'concrete', base = t === 'p' ? th.p : t === '.' ? th.c : th.a;
    return pattern(kind, base, 'floor');
}

function drawWall(i, j, th) {
    const H = j === G.H - 1 || i === G.W - 1 ? 10 : 42, w = (a, b) => '#V'.includes(tileAt(a, b));
    const a = iso(i, j + 1), b = iso(i + 1, j + 1), c = iso(i + 1, j), d = iso(i, j), up = p => [p[0], p[1] - H];
    const mat = th.stripes ? 'canvas' : 'brick';
    const sV = !w(i, j + 1), eV = !w(i + 1, j);
    if (sV) poly([a, b, up(b), up(a)], pattern(mat, th.wL, 'L'));
    if (eV) { poly([b, c, up(c), up(b)], pattern(mat, th.wL, 'R')); ctx.fillStyle = 'rgba(20,10,0,.28)'; ctx.fill(); }
    poly([up(d), up(c), up(b), up(a)], pattern('plain', th.wT, 'floor'));
    if (th.timber) {
        ctx.strokeStyle = 'rgba(70,40,20,.85)'; ctx.lineWidth = 2.2; ctx.beginPath();
        if (sV) { ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1] - H); ctx.moveTo(b[0], b[1]); ctx.lineTo(a[0], a[1] - H); }
        if (eV) { ctx.moveTo(b[0], b[1]); ctx.lineTo(c[0], c[1] - H); ctx.moveTo(c[0], c[1]); ctx.lineTo(b[0], b[1] - H); }
        ctx.stroke();
    }
    if (sV && hash(i, j) < .25 && j > 0 && j < G.H - 1) {
        const m = iso(i + .5, j + 1);
        const gl = ctx.createLinearGradient(m[0] - 9, m[1] - 34, m[0] + 9, m[1] - 14);
        gl.addColorStop(0, '#dff3ff'); gl.addColorStop(.45, '#7fa8c8'); gl.addColorStop(1, '#2a4058');
        poly([[m[0] - 9, m[1] - 30 + 4.5], [m[0] + 9, m[1] - 30 - 4.5], [m[0] + 9, m[1] - 14 - 4.5], [m[0] - 9, m[1] - 14 + 4.5]], gl, 1);
    }
    const seg = (p, q) => { ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); };
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(255,245,225,.4)'; ctx.lineWidth = 1.2; ctx.beginPath();
    if (eV) seg(up(c), up(b));
    if (sV) seg(up(b), up(a));
    ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1; ctx.beginPath();
    if (eV) seg(b, c);
    if (sV) seg(a, b);
    if (sV && eV) seg(b, up(b));
    if (sV && !w(i - 1, j)) seg(a, up(a));
    if (eV && !w(i, j - 1)) seg(c, up(c));
    ctx.stroke();
}

function drawBlock(i, j, t, th) {
    switch (t) {
        case '#': drawWall(i, j, th); break;
        case 'T': drawTree(i, j, Math.floor(G.t * STOP) / STOP); break;
        case 'C': drawProp3D(th.prop, i, j, G.t); break;
        case 'D': drawProp3D('table', i, j, G.t); break;
        case 'E': drawProp3D('barrel', i, j, G.t); break;
        case 'V': drawWall(i, j, th); drawVent(i, j); break;
        case 'g': drawGate(i, j, G.t); break;
        case 'B': drawBarricade(i, j, G.t); break;
        case 'K': drawDoor(i, j, G.t); break;
        case 'O': drawObjective(G.objs.find(o => o.x === i && o.y === j), i, j, G.t, th); break;
    }
}

// Pose a scatti (stop-motion) + saltelli rigidi da giocattolo.
function drawEntity(e) {
    const isG = e.kind === 'guard', [sx, sy] = iso(e.x, e.y);
    const ts = Math.floor(G.t * STOP) / STOP, sel = !isG && G.chars[G.sel] === e;
    const base = isG && e.boss ? 1.3 : 1;
    drawStand(sx, sy, base);
    if (sel) {
        ctx.save(); ctx.setLineDash([6, 5]); ctx.lineDashOffset = -ts * 30;
        ell(e.x, e.y, 24, 12, null, '#f2b705', 3); ctx.restore();
    }

    let hop = 0, tilt = 0, jx = 0;
    const mode = isG ? e.mode : null;
    if (e.moving) {
        const ph = Math.floor(e.phase * 2) / 2;
        hop = Math.abs(Math.sin(ph)) * 7;
        tilt = Math.sin(ph) * .12;
    } else if (mode === 'laugh') { hop = Math.abs(Math.sin(ts * 14)) * 4; tilt = Math.sin(ts * 9) * .15; }
    else if (mode === 'flee') { hop = Math.abs(Math.sin(ts * 20)) * 8; tilt = Math.sin(ts * 20) * .2; }
    else if (mode === 'drink') tilt = Math.sin(ts * 2) * .18;
    else if (!isG && e.actKind === 'up') hop = Math.abs(Math.sin(e.actT * 10)) * 10;
    else if (!isG && e.actKind === 'adjust') { tilt = Math.sin(ts * 16) * .08; jx = Math.sin(ts * 25) * 1.5; }
    if (e.hitT > 0) { jx += Math.sin(ts * 60) * 4; tilt += .25 * e.hitT; }
    if (!isG && e.actKind === 'throw') tilt += e.actT / e.actDur < .35 ? -.15 : .12;
    if (!isG && e.actKind === 'punch') jx += (e.flip ? -1 : 1) * 6 * (1 - e.actT / e.actDur);
    const fr = Math.floor(G.t * STOP);
    jx += (hash(fr, e.seed * 10 + 1) - .5) * 1.2; tilt += (hash(e.seed + 3, fr) - .5) * .03;

    ctx.save();
    ctx.translate(sx + jx, sy - hop);
    ctx.rotate(tilt);
    const sm = e.look && e.look.small ? .88 : 1;
    ctx.scale(base * sm, base * sm);
    if (isG ? drawGuardSprite(e) : drawCharSprite(e)) { /* sprite PNG */ }
    else {
        if (mode === 'sleep') { ctx.translate(0, -4); ctx.rotate(e.flip ? 1.45 : -1.45); ctx.translate(0, 14); }
        drawChibi(e.look, poseOf(e, ts));
    }
    ctx.restore();

    if (isG) {
        const top = sy - 80 * base;
        if (e.meter > .03 && awake(e)) {
            ctx.fillStyle = '#000a'; ctx.fillRect(sx - 19, top, 38, 6);
            ctx.fillStyle = e.meter > .6 ? '#e22' : '#fc0'; ctx.fillRect(sx - 18, top + 1, 36 * e.meter, 4);
        }
        if (e.boss) {
            ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = OUT;
            ctx.strokeText(e.label, sx, sy + 20); ctx.fillStyle = '#ffd23f'; ctx.fillText(e.label, sx, sy + 20);
        }
    } else if (sel || e.disguise > 0) {
        ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = OUT;
        const lbl = e.name + (e.disguise > 0 ? ' 👔' : '');
        ctx.strokeText(lbl, sx, sy + 20); ctx.fillStyle = sel ? '#f2b705' : '#fff'; ctx.fillText(lbl, sx, sy + 20);
    }
}

function drawCharSprite(c) {
    let n = c.id + (c.back ? '-back' : '-front');
    if ((c.actKind && c.actKind !== 'adjust') || (c.id === 'proboscis' && c.disguise > 0)) n = c.id + '-action';
    if (!SPR[n]) return false;
    return drawSprite(n, 76, c.flip);
}

function drawGuardSprite(g) {
    if (g.boss) {
        if (!SPR['boss-astemi']) return false;
        if (g.mode === 'sleep') { ctx.translate(0, -6); ctx.rotate(-1.45); ctx.translate(0, 20); }
        return drawSprite('boss-astemi', 80, g.flip);
    }
    let n = g.back ? 'guard-back' : 'guard-front';
    if (g.mode === 'sleep') n = 'guard-sleep';
    else if (g.mode === 'stunned' || g.mode === 'laugh') n = 'guard-stunned';
    else if (g.mode === 'flee' || g.meter > .6 || G.state === 'lost') n = 'guard-alert';
    if (!SPR[n]) return false;
    return drawSprite(n, n === 'guard-sleep' ? 40 : 76, g.flip);
}

function poseOf(e, ts) {
    const P = { back: e.back, flip: e.flip, phase: Math.floor(e.phase * 2) / 2, moving: e.moving, t: ts, expr: 'normal', arm: 'idle', blink: ((G.t + e.seed) % 3.4) < .12 };
    if (e.kind === 'guard') {
        face(e, Math.cos(e.dir), Math.sin(e.dir)); P.back = e.back; P.flip = e.flip;
        const m = { sleep: ['sleep', 'idle'], laugh: ['laugh', 'belly'], stunned: ['stunned', 'idle'], flee: ['shock', 'up'], drink: ['drunk', 'drink'], eat: ['grin', 'drink'] }[e.mode];
        if (e.mode === 'eat') P.prop = 'skewer';
        if (m) [P.expr, P.arm] = m;
        if (e.mode === 'drink') P.prop = 'whisky';
        if (e.mode === 'stunned' || e.mode === 'flee') P.prop = null;
        if (e.meter > .6 || G.state === 'lost') P.expr = 'shock';
        return P;
    }
    P.disguise = e.id === 'proboscis' && e.disguise > 0;
    if (P.disguise) P.prop = 'folder';
    P.fire = e.fireT > 0;
    if (e.actKind) {
        P.arm = e.actKind; P.actP = e.actT / e.actDur;
        if (e.actProp !== undefined) P.prop = e.actProp;
        P.expr = { throw: 'open', punch: 'angry', up: 'laugh', adjust: e.id === 'estice' ? 'grin' : 'smirk' }[e.actKind] || 'normal';
    }
    if (e.hitT > 0) P.expr = 'shock';
    return P;
}

function drawProj(p) {
    const [sx, sy] = iso(p.x, p.y);
    ctx.beginPath(); ctx.ellipse(sx, sy, 6, 3, 0, 0, 7); ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fill();
    ctx.save(); ctx.translate(sx, sy - p.z); ctx.rotate(p.t * 14); ctx.scale(1.3, 1.3);
    if (p.kind === 'grill') { rr(-7, -4, 14, 7, 2); fs('#333', 1.6); }
    else drawProp(p.kind, { t: G.t });
    ctx.restore();
}

function drawBait(b) {
    const [sx, sy] = iso(b.x, b.y);
    ctx.save(); ctx.translate(sx, sy);
    if (b.kind === 'whisky') { ctx.scale(1.3, 1.3); drawProp('whisky', { t: G.t }); }
    else if (b.kind === 'gas') { ctx.globalAlpha = Math.min(1, b.t / 1.5) * .85; drawSprite('estice-gas', 90); }
    else if (b.kind === 'smoke' && !drawSprite('muglo-grill', 34)) {
        rr(-11, -12, 22, 9, 2); fs('#333', 1.6);
        ctx.fillStyle = '#ff7a1a'; ctx.fillRect(-9, -13, 18, 2);
        ctx.strokeStyle = OUT; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-8, -3); ctx.lineTo(-10, 4); ctx.moveTo(8, -3); ctx.lineTo(10, 4); ctx.stroke();
    }
    ctx.restore();
}

function render() {
    const th = G.m.theme;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawBackdrop(cw, ch, th);
    ctx.save();
    ctx.translate(cw / 2 + rnd(-1, 1) * G.shake, ch / 2 + rnd(-1, 1) * G.shake);
    ctx.scale(zoom, zoom); ctx.translate(-G.cam.x, -G.cam.y);

    drawDiorama(G.W, G.H, th);
    for (let j = 0; j < G.H; j++) for (let i = 0; i < G.W; i++) {
        const t = G.map[j][i];
        const pts = [iso(i, j), iso(i + 1, j), iso(i + 1, j + 1), iso(i, j + 1)];
        poly(pts, floorFill(t === 'O' || t === 'D' || t === 'E' ? floorUnder(i, j) : '#TCBKVg'.includes(t) ? ',' : t, th));
        ctx.fillStyle = `rgba(0,0,0,${hash(i, j) * .07})`; ctx.fill();
    }
    if (G.marker) {
        const k = G.marker.t / .7, [rx, ry] = ringR(.15 + k * .4);
        ell(G.marker.x, G.marker.y, rx, ry, null, G.marker.ok ? `rgba(120,255,120,${1 - k})` : `rgba(255,80,80,${1 - k})`, 3);
    }
    drawSafe();
    G.guards.forEach(drawCone);

    const c = G.chars[G.sel];
    if (G.targeting >= 0) {
        const ab = c.ab[G.targeting], [rx, ry] = ringR(ab.range);
        ctx.save(); ctx.setLineDash([8, 6]); ctx.lineDashOffset = -G.t * 20;
        ell(c.x, c.y, rx, ry, 'rgba(255,255,255,.07)', '#fff'); ctx.restore();
        const [wx, wy] = toWorld(mouse[0], mouse[1]), d = Math.hypot(wx - c.x, wy - c.y), k = d > ab.range ? ab.range / d : 1;
        const tx = c.x + (wx - c.x) * k, ty = c.y + (wy - c.y) * k;
        const rad = { estice: 2.3, unicorn: 1.9, muglo: 2.4, alcan: .6 }[c.id] || 1;
        const [ax, ay] = ringR(rad);
        ell(tx, ty, ax, ay, 'rgba(255,80,60,.25)', '#f55', 2);
        const [sx0, sy0] = iso(c.x, c.y), [sx1, sy1] = iso(tx, ty);
        ctx.save(); ctx.setLineDash([4, 6]); ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(sx0, sy0 - 30); ctx.quadraticCurveTo((sx0 + sx1) / 2, Math.min(sy0, sy1) - 90, sx1, sy1); ctx.stroke(); ctx.restore();
    }

    const list = [];
    for (let j = 0; j < G.H; j++) for (let i = 0; i < G.W; i++) {
        const t = G.map[j][i];
        if ('#TCBKODEVg'.includes(t)) list.push({ d: i + j + 1, f: () => drawBlock(i, j, t, th) });
    }
    G.chars.forEach(ch => list.push({ d: ch.x + ch.y, f: () => drawEntity(ch) }));
    G.guards.forEach(g => list.push({ d: g.x + g.y, f: () => drawEntity(g) }));
    G.dyn.forEach(d => list.push({
        d: d.x + d.y, f: () => {
            const [sx, sy] = iso(d.x, d.y);
            ctx.save(); ctx.translate(sx, sy); ctx.scale(1.4, 1.4); drawProp('dynamite', { t: G.t }); ctx.restore();
            ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = OUT;
            ctx.strokeText(Math.ceil(d.t), sx, sy - 34); ctx.fillStyle = '#ff5a3a'; ctx.fillText(Math.ceil(d.t), sx, sy - 34);
        }
    }));
    G.baits.forEach(b => list.push({ d: b.x + b.y, f: () => drawBait(b) }));
    G.proj.forEach(p => list.push({ d: p.x + p.y + .5, f: () => drawProj(p) }));
    (G.m.signs || []).forEach(s => list.push({ d: s.x + s.y, f: () => drawSign(s, Math.floor(G.t * STOP) / STOP) }));
    list.sort((a, b) => a.d - b.d).forEach(o => o.f());
    // Sagome visibili attraverso i muri
    ctx.save(); ctx.globalAlpha = .35;
    [...G.chars, ...G.guards].forEach(drawEntity);
    ctx.restore();

    G.parts.filter(p => p.kind !== 'pop').forEach(drawParticle);
    [...G.chars, ...G.guards].forEach(e => {
        if (!e.say) return;
        const [sx, sy] = iso(e.x, e.y), h = e.kind === 'guard' && e.boss ? 100 : e.mode === 'sleep' ? 40 : 82;
        drawBubble(sx, sy - h, e.say.txt, e.say.t, e.say.shout);
    });
    G.parts.filter(p => p.kind === 'pop').forEach(drawParticle);
    ctx.restore();
}

// ---------- minimappa ----------
const mini = $('mini'), mctx = mini.getContext('2d');
let miniK = 1, miniOX = 0;
function drawMini() {
    const MW = 190, k = MW / ((G.W + G.H) * 32), MH = Math.ceil((G.W + G.H) * 16 * k) + 8;
    if (mini.width !== MW * dpr || mini.height !== MH * dpr) { mini.width = MW * dpr; mini.height = MH * dpr; mini.style.width = MW + 'px'; mini.style.height = MH + 'px'; }
    miniK = k; miniOX = G.H * 32 * k;
    const c = mctx;
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, MW, MH);
    c.setTransform(dpr * k, 0, 0, dpr * k, dpr * miniOX, dpr * 4);
    const dia = (i, j, col) => { c.fillStyle = col; c.beginPath(); const p = [iso(i, j), iso(i + 1, j), iso(i + 1, j + 1), iso(i, j + 1)]; p.forEach((q, n) => n ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.fill(); };
    for (let j = 0; j < G.H; j++) for (let i = 0; i < G.W; i++) {
        const t = G.map[j][i];
        dia(i, j, t === '#' ? '#3a2a1e' : t === 'V' ? '#f2c618' : t === 'K' ? '#3d5a8a' : t === 'g' ? '#9aa0a6' : t === 'B' ? '#c2553d' : 'TCDE'.includes(t) ? '#5f6a4a' : t === 'p' ? '#a07850' : '#b8b2a4');
    }
    const z = G.safe; c.fillStyle = 'rgba(70,220,110,.45)';
    c.beginPath(); [iso(z.x0, z.y0), iso(z.x1, z.y0), iso(z.x1, z.y1), iso(z.x0, z.y1)].forEach((q, n) => n ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.fill();
    const dot = (x, y, r, col) => { const [a, b] = iso(x, y); c.beginPath(); c.arc(a, b, r / k, 0, 7); c.fillStyle = col; c.fill(); };
    G.objs.forEach(o => { if (o.x != null) dot(o.x + .5, o.y + .5, 3.5, o.done ? '#3fdc6a' : stepReady(o) ? '#ffd23f' : '#8a8f96'); });
    G.guards.forEach(g => dot(g.x, g.y, 2.4, awake(g) ? (g.meter > .15 ? '#ff7a1a' : '#ff3a3a') : '#7ec0ee'));
    G.chars.forEach((ch, i) => dot(ch.x, ch.y, i === G.sel ? 3.2 : 2.4, i === G.sel ? '#ffffff' : '#7fff9a'));
    c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 1.5 / k;
    c.strokeRect(G.cam.x - cw / 2 / zoom, G.cam.y - ch / 2 / zoom, cw / zoom, ch / zoom);
}
mini.addEventListener('pointerdown', e => {
    if (!G) return;
    const r = mini.getBoundingClientRect();
    G.cam.x = (e.clientX - r.left - miniOX) / miniK; G.cam.y = (e.clientY - r.top - 4) / miniK; G.free = true;
});

function drawCone(g) {
    if (!awake(g)) return;
    const o = iso(g.x, g.y), far = [o], near = [o], n = 24, nr = g.range * .45;
    for (let k = 0; k <= n; k++) {
        const a = g.dir - g.fov / 2 + g.fov * k / n, cx = Math.cos(a), cy = Math.sin(a);
        let d = .3;
        while (d < g.range && !opaque(g.x + cx * d, g.y + cy * d)) d += .2;
        far.push(iso(g.x + cx * d, g.y + cy * d));
        const dn = Math.min(d, nr);
        near.push(iso(g.x + cx * dn, g.y + cy * dn));
    }
    const m = g.meter, col = m > .6 ? '255,60,40' : m > .15 ? '255,160,40' : '255,235,150';
    const pulse = m > .15 ? .1 * Math.sin(G.t * 12) : 0;
    const lg = ctx.createRadialGradient(o[0], o[1], 4, o[0], o[1], g.range * 42);
    lg.addColorStop(0, `rgba(${col},${.55 + pulse})`); lg.addColorStop(.45, `rgba(${col},${.32 + pulse})`); lg.addColorStop(1, `rgba(${col},.06)`);
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    poly(far, lg);
    ctx.setLineDash([6, 5]); ctx.strokeStyle = `rgba(${col},.75)`; ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([]);
    poly(near, `rgba(${col},${.18 + pulse})`);
    ctx.restore();
}

function drawSafe() {
    const z = G.safe, pts = [iso(z.x0, z.y0), iso(z.x1, z.y0), iso(z.x1, z.y1), iso(z.x0, z.y1)];
    poly(pts, 'rgba(70,220,110,.22)');
    ctx.save(); ctx.setLineDash([10, 6]); ctx.lineDashOffset = -G.t * 15;
    ctx.strokeStyle = 'rgba(40,170,80,.95)'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
    const [lx, ly] = iso((z.x0 + z.x1) / 2, z.y0);
    ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = OUT;
    ctx.strokeText('🛡 ZONA SICURA', lx, ly - 8); ctx.fillStyle = '#7dff9a'; ctx.fillText('🛡 ZONA SICURA', lx, ly - 8);
}

// ---------- HUD e schermate ----------
function screen(html) { const s = $('screen'); s.innerHTML = '<div class="card">' + html + '</div>'; s.hidden = false; }
function hideScreen() { $('screen').hidden = true; }

function showTitle() {
    G = null; $('hud').hidden = true;
    const boxes = CHARS.map((c, i) => `<img src="${c.img}" alt="${c.name}" style="--i:${i - 2}">`).join('');
    screen('<div class="boxes">' + boxes + '</div>' +
        '<h1 class="logo">E-TEAM<small>Operazione Sobrietà Zero</small></h1>' +
        '<p>Un ministro astemio ha messo al bando ogni bevanda alcolica. Cinque action hero da collezione, dieci abilità discutibili, zero intenzione di restare a secco.</p>' +
        '<p class="warn">Gioco comico per adulti (18+): alcol e umorismo da caserma. Nessuna violenza vera: le guardie si addormentano, ridono o scappano.</p>' +
        '<p class="small">Click/tocco: muovi · 1-5 o Tab: cambia personaggio · Q / X: abilità · E: interagisci · F: segui · trascina/WASD: vista · rotella: zoom · M: audio · R: riavvia</p>' +
        MISSIONS.map((m, i) => '<button class="btn" onclick="showBrief(' + i + ')">' + m.name + '</button>').join('<br>'));
}

function panelImg(p) {
    if (p.char) return CHARS.find(c => c.id === p.char).img;
    if (p.boss) return portraitOf('boss');
    return p.img;
}

let cutTimer = 0;
function cutscene(panels, done) {
    let i = 0;
    const show = () => {
        const p = panels[i], c = p.char && CHARS.find(x => x.id === p.char);
        const who = c ? c.name + ' · ' + c.role : p.who;
        screen(`<div class="cut ${i % 2 ? 'alt' : ''}"><div class="pimg"><img src="${panelImg(p)}" alt=""></div>` +
            `<div class="pbub"><b>${who}</b><p class="ptxt"></p></div></div>` +
            `<div class="dots">${panels.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div>` +
            `<button class="btn" id="cNext">${i < panels.length - 1 ? 'Avanti ▶' : 'Via! ▶'}</button><button class="btn ghost" id="cSkip">Salta</button>`);
        const el = $('screen').querySelector('.ptxt');
        let n = 0;
        clearInterval(cutTimer);
        cutTimer = setInterval(() => {
            n += 2; el.textContent = p.line.slice(0, n);
            if (n % 6 === 0) sfx('talk');
            if (n >= p.line.length) clearInterval(cutTimer);
        }, 28);
        $('cNext').onclick = () => {
            if (n < p.line.length) { n = p.line.length; el.textContent = p.line; clearInterval(cutTimer); return; }
            sfx('click');
            if (++i < panels.length) show(); else { clearInterval(cutTimer); done(); }
        };
        $('cSkip').onclick = () => { clearInterval(cutTimer); done(); };
    };
    show();
}

function showBrief(i) {
    auInit();
    cutscene(MISSIONS[i].intro, () => {
        const m = MISSIONS[i];
        screen('<h2>' + m.name + '</h2><p>Ognuno ha un compito che solo lui può svolgere. Alcuni compiti si sbloccano solo dopo altri.</p><ul class="objl">' +
            m.steps.map(o => '<li><b>' + (o.who ? charName(o.who) : 'Chiunque') + '</b>: ' + o.text + '</li>').join('') + '</ul>' +
            '<p class="small">Suggerimento: ' + m.hint + '</p>' +
            '<button class="btn" onclick="begin(' + i + ')">Inizia missione</button><button class="btn ghost" onclick="showTitle()">Indietro</button>');
    });
}

function begin(i) {
    auInit();
    loadMission(i); hideScreen();
    $('hud').hidden = false;
    $('mtitle').textContent = MISSIONS[i].name;
    $('team').innerHTML = CHARS.map((c, k) => `<button class="ch" data-i="${k}" title="${c.role}: ${c.ab.map(a => a.name).join(' / ')}"><i>${k + 1}</i>` +
        `<img src="${SPR[c.id + '-portrait'] ? spritePath(c.id + '-portrait') : c.img}" alt="${c.name}"><span>${c.name}</span><div class="cd q"></div><div class="cd x"></div></button>`).join('');
    $('team').querySelectorAll('.ch').forEach(b => b.onclick = () => select(+b.dataset.i));
    refreshHud();
    toast('Partite dalla ZONA SICURA verde: lì nessuno vi vede. ' + MISSIONS[i].hint, 6000);
}

function refreshHud() {
    if (!G) return;
    $('objs').innerHTML = G.objs.map(o => {
        const st = o.done ? 'done' : stepReady(o) ? 'ready' : 'locked';
        const who = o.who ? `<b>${charName(o.who)}</b>` : '<b>Chiunque</b>';
        return `<li class="${st}">${o.done ? '✔' : st === 'locked' ? '🔒' : '▶'} ${who}: ${o.text}</li>`;
    }).join('');
    document.querySelectorAll('.ch').forEach((b, i) => b.classList.toggle('sel', i === G.sel));
    const c = G.chars[G.sel];
    ['bAbil', 'bAbil2'].forEach((id, k) => {
        const ab = c.ab[k];
        $(id).innerHTML = `<kbd>${k ? 'X' : 'Q'}</kbd> ${ab.icon} ${ab.name}`;
        $(id).title = ab.desc;
        $(id).classList.toggle('on', G.targeting === k);
    });
    $('bFollow').textContent = 'Segui: ' + (G.follow ? 'SÌ' : 'NO') + ' (F)';
    $('bMute').textContent = AU.on ? '🔊 Audio (M)' : '🔇 Audio (M)';
}

function showOutro() {
    if (!G || G.state !== 'won') return;
    const mi = G.mi, next = mi + 1 < MISSIONS.length;
    cutscene(MISSIONS[mi].outro, () => {
        screen('<h2>Missione compiuta! 🍻</h2><p>' + G.objs[G.objs.length - 1].msg + '</p>' +
            (next ? '<button class="btn" onclick="showBrief(' + (mi + 1) + ')">Prossima missione</button>'
                : '<p><b>L\'Italia è salva. L\'E-TEAM brinda. Salute!</b></p>') +
            '<button class="btn ghost" onclick="showTitle()">Menu</button>');
    });
}

// ---------- input ----------
let ptr = null;
cv.addEventListener('pointerdown', e => { auInit(); ptr = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, moved: false }; cv.setPointerCapture(e.pointerId); });
cv.addEventListener('pointermove', e => {
    mouse = [e.clientX, e.clientY];
    if (!ptr || !G) return;
    if (Math.hypot(e.clientX - ptr.x, e.clientY - ptr.y) > 10) ptr.moved = true;
    if (ptr.moved) { G.cam.x -= (e.clientX - ptr.lx) / zoom; G.cam.y -= (e.clientY - ptr.ly) / zoom; G.free = true; }
    ptr.lx = e.clientX; ptr.ly = e.clientY;
});
cv.addEventListener('pointerup', e => {
    if (ptr && !ptr.moved && G && G.state === 'play') tap(e.clientX, e.clientY);
    ptr = null;
});
cv.addEventListener('wheel', e => { e.preventDefault(); zoomMul = clamp(zoomMul * (e.deltaY > 0 ? .9 : 1.1), .6, 1.8); resize(); }, { passive: false });
addEventListener('pointerdown', () => auInit(), { once: true });
addEventListener('keydown', e => {
    keys[e.key] = true;
    if (e.key === 'm' || e.key === 'M') { auInit(); auToggle(); refreshHud(); return; }
    if (!G || G.state !== 'play') return;
    if (e.key >= '1' && e.key <= '5') select(+e.key - 1);
    else if (e.key === 'Tab') { e.preventDefault(); select((G.sel + 1) % 5); }
    else if (e.key === 'q' || e.key === 'Q') startAbility(0);
    else if (e.key === 'x' || e.key === 'X') startAbility(1);
    else if (e.key === 'e' || e.key === 'E') interact(G.chars[G.sel]);
    else if (e.key === 'f' || e.key === 'F') { G.follow = !G.follow; refreshHud(); }
    else if (e.key === 'r' || e.key === 'R') begin(G.mi);
    else if (e.key === 'Escape') { G.targeting = -1; refreshHud(); }
});
addEventListener('keyup', e => { keys[e.key] = false; });
$('bAbil').onclick = () => startAbility(0);
$('bAbil2').onclick = () => startAbility(1);
$('bAct').onclick = () => G && G.state === 'play' && interact(G.chars[G.sel]);
$('bFollow').onclick = () => { if (G) { G.follow = !G.follow; refreshHud(); } };
$('bMute').onclick = () => { auInit(); auToggle(); refreshHud(); };
$('bRestart').onclick = () => G && begin(G.mi);

let last = 0, lastF = -1;
function loop(ts) {
    const dt = Math.min(.05, (ts - last) / 1000 || 0);
    last = ts;
    if (G) {
        update(dt);
        const f = Math.floor(ts / 1000 * STOP);
        if (f !== lastF) { lastF = f; render(); postProcess(cv, ctx, cw, ch, dpr, f); drawMini(); }
    } else { ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = '#111'; ctx.fillRect(0, 0, cw, ch); }
    requestAnimationFrame(loop);
}
loadSprites();
showTitle();
requestAnimationFrame(loop);
