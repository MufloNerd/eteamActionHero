'use strict';
// E-TEAM: Operazione Sobrietà Zero — tattico/stealth isometrico, Canvas puro.

const $ = id => document.getElementById(id);
const cv = $('c'), ctx = cv.getContext('2d');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const iso = (x, y) => [(x - y) * 32, (x + y) * 16];

// Verifica l'abbinamento foto -> personaggio modificando solo il campo img.
const CHARS = [
    {
        id: 'estice', name: 'Estice', role: 'Il Demolitore', img: 'assets/1000081042.jpg', abil: 'Dinamite', range: 6, cd: 12, target: true,
        desc: 'Lancia una dinamite: spacca le barricate ma fa un gran fracasso.'
    },
    {
        id: 'alcan', name: 'Alcan', role: "L'Infiltrato", img: 'assets/1000081046.jpg', abil: 'Whisky 12', range: 7, cd: 10, target: true,
        desc: 'Esca di whisky: le guardie corrono a bere. Il badge apre le porte riservate.'
    },
    {
        id: 'muglo', name: 'Muglo', role: 'Maestro del Grill', img: 'assets/1000081050.jpg', abil: 'Griglia fumogena', range: 6, cd: 14, target: true,
        desc: 'Griglia con fumo profumato: blocca la vista e attira i curiosi.'
    },
    {
        id: 'unicorn', name: 'Unicorn', role: 'Mastro Birraio', img: 'assets/1000081064.jpg', abil: 'Pozione al luppolo', range: 5, cd: 12, target: true,
        desc: 'Lancia una pozione: le guardie vicine crollano addormentate.'
    },
    {
        id: 'proboscis', name: 'Proboscis', role: 'Il Negoziatore', img: 'assets/1000081068.jpg', abil: 'Completo da agente', range: 0, cd: 15, target: false,
        desc: 'Si cambia in giacca e cravatta: le guardie lo ignorano da lontano e passa le porte riservate.'
    },
];

const MISSIONS = [
    {
        name: 'Missione 1 — Salva il Ludwig Pub',
        intro: "Roseto degli Abruzzi. Il Ministro Sobrio Astemi ha fatto sigillare il Ludwig Pub: niente Live Music, spillatrici sequestrate. È il primo pub da salvare! Raggiungi la spina della birra e riaccendila, evitando gli Ispettori Acqua.",
        hint: "Due ingressi: la barricata (Estice) o la porta riservata (Alcan col badge). Dentro c'è un ispettore: distrailo!",
        theme: { bg: '#bcd9ee', a: '#8b8d92', b: '#85878d', c: '#8b8d92', p: '#a8743f', wT: '#3c4552', wL: '#b2503a', wR: '#8d3d2c', timber: true },
        map: [
            '##########################',
            '#,,,,,,#########,,,,,,,,,#',
            '#,,,,,,#ppppppp#,,,,,,,,,#',
            '#,,TT,,#pppOppp#,,,TT,,,,#',
            '#,,TT,,#ppppppp#,,,TT,,,,#',
            '#,,,,,,###BK####,,,,,,,,,#',
            '#,,,,,,,,,,,,,,,,,,,,,,,,#',
            '#,,,,,CC,,,,,,,,,,CC,,,,,#',
            '#,,TT,,,,,,,,,,,,,,,,TT,,#',
            '#,,,,,,,,,,,,,,,,,,,,,,,,#',
            '#,,,,,,,,,CCC,,,,,,,,,,,,#',
            '#,,,,,,,,,,,,,,,,,,,,,,,,#',
            '#,TT,,,,,,,,,,,,,,,,,,TT,#',
            '#,,,,,,,,,,,,,,,,,,,,,,,,#',
            '#,,,,,CC,,,,,,,,,,,CC,,,,#',
            '#,,,,,,,,,,,,,,,,,,,,,,,,#',
            '#,,,,,,,,,,,,,,,,,,,,,,,,#',
            '##########################',
        ],
        starts: [[9, 16], [11, 16], [13, 16], [15, 16], [17, 16]],
        guards: [
            { p: [[4, 9], [21, 9]] },
            { p: [[13, 7], [13, 12]] },
            { p: [[3, 13], [22, 13]] },
            { p: [[13, 3]], base: Math.PI, sweep: 1.1 },
        ],
        objectives: [{ x: 11, y: 3, text: 'Riaccendi la spina del Ludwig', msg: 'Pssshhh! La schiuma torna a scorrere: il Ludwig è salvo!' }],
        signs: [{ x: 6.5, y: 5.5, title: 'Ludwig', sub: 'Pub', tag: 'LIVE MUSIC' }],
    },
    {
        name: 'Missione 2 — La Distilleria Clandestina',
        intro: "Il Ministero ha sigillato la distilleria: le botti di grappa non devono arrivare a nessuno. Due botti da sbloccare, due stanze, ingressi diversi. Il rumore attira gli ispettori: pensa prima di far saltare tutto.",
        hint: "Sinistra: porta riservata. Destra: barricata. Muglo e il suo fumo coprono i movimenti.",
        theme: { bg: '#2b2a33', a: '#6e6a5e', b: '#686457', c: '#6e6a5e', p: '#8a7a55', wT: '#4a2c2a', wL: '#8e4a3a', wR: '#6f382c', timber: false },
        map: [],
        starts: [[3, 16], [5, 16], [7, 16], [9, 16], [11, 16]],
        guards: [
            { p: [[3, 9], [26, 9]] },
            { p: [[5, 13], [27, 13]] },
            { p: [[14, 7], [14, 15]] },
            { p: [[14, 3]], base: Math.PI, sweep: 1.1 },
            { p: [[19, 3], [25, 3]] },
        ],
        objectives: [
            { x: 12, y: 2, text: 'Spezza i sigilli della botte A', msg: 'Crack! La botte A rilascia un profumo divino.' },
            { x: 24, y: 2, text: 'Spezza i sigilli della botte B', msg: 'Crack! Anche la botte B è libera!' },
        ],
        signs: [],
    },
    {
        name: 'Missione 3 — Il Ministero della Sobrietà',
        intro: "Il covo del Ministro Sobrio Astemi. Il suo decreto è nell'ufficio blindato in fondo. Finché il Ministro è sveglio nessuno può toccarlo: serve una pozione ben piazzata e qualcuno col badge.",
        hint: "Unicorn lancia la pozione dal corridoio (portata 5), Alcan entra con il badge e firma.",
        theme: { bg: '#20242c', a: '#3f4650', b: '#3a414a', c: '#c9c9c2', p: '#6d1f2b', wT: '#e6e0cc', wL: '#bdb7a2', wR: '#a39d89', timber: false },
        map: [],
        starts: [[10, 16], [12, 16], [14, 16], [16, 16], [18, 16]],
        guards: [],
        objectives: [{ x: 16, y: 2, needAsleep: 'boss', lock: 'Il Ministro è sveglio e ti fissa: "Solo acqua, grazie!"', text: 'Fai firmare il decreto "Aperitivo libero"', msg: 'Firmato! L\'Italia torna a brindare. Salute!' }],
        signs: [],
    },
];

// Missioni 2 e 3 composte da funzioni per evitare errori di conteggio.
(function buildMaps() {
    const rep = (c, n) => c.repeat(n);
    const m2 = MISSIONS[1];
    m2.map = [
        rep('#', 30),
        '#,,,,,,,#ppppppp##pppppppp#,,#',
        '#,,,,,,,#pppOppp##ppppppOp#,,#',
        '#,,TT,,,#ppppppp##pppppppp#,,#',
        '#,,TT,,,#ppppppp##pppppppp#,,#',
        '#,,,,,,,#' + '###K###' + '##' + '###B####' + '#,,#',
        '#' + rep(',', 28) + '#',
        '#,,,,,CC' + rep(',', 14) + 'CC,,,,,#',
        '#,TT' + rep(',', 22) + 'TT,#',
        '#' + rep(',', 28) + '#',
        '#' + rep(',', 10) + 'CCC,,,,,CCC' + rep(',', 7) + '#',
        '#' + rep(',', 28) + '#',
        '#,,TT' + rep(',', 20) + 'TT,,#',
        '#' + rep(',', 28) + '#',
        '#,,,,,CC' + rep(',', 14) + 'CC,,,,,#',
        '#' + rep(',', 28) + '#',
        '#' + rep(',', 28) + '#',
        rep('#', 30),
    ].map(r => r.slice(0, 30).padEnd(30, '#'));

    const m3 = MISSIONS[2];
    const boss = rep('#', 8) + rep('p', 16) + rep('#', 8);
    m3.map = [
        rep('#', 32),
        boss,
        rep('#', 8) + rep('p', 8) + 'O' + rep('p', 7) + rep('#', 8),
        boss,
        boss,
        rep('#', 15) + 'KK' + rep('#', 15),
        '#' + rep('.', 30) + '#',
        '#...CC' + rep('.', 11) + 'CC' + rep('.', 12) + '#',
        '#' + rep('.', 30) + '#',
        '#...CC' + rep('.', 11) + 'CC' + rep('.', 12) + '#',
        rep('#', 5) + 'B' + rep('#', 19) + 'K' + rep('#', 6),
        '#' + rep(',', 30) + '#',
        '#,,TT' + rep(',', 22) + 'TT,,#',
        '#' + rep(',', 30) + '#',
        '#' + rep(',', 6) + 'CC' + rep(',', 12) + 'CC' + rep(',', 8) + '#',
        '#' + rep(',', 30) + '#',
        '#' + rep(',', 30) + '#',
        rep('#', 32),
    ];
    m3.guards = [
        { p: [[6, 12], [25, 12]] },
        { p: [[28, 15], [3, 15]] },
        { p: [[15, 11], [15, 16]] },
        { p: [[3, 7], [28, 7]] },
        { p: [[28, 9], [3, 9]] },
        { p: [[13, 2]], base: 0, sweep: 1.0, boss: true, label: 'Ministro Sobrio Astemi' },
    ];
})();

// ---------- stato ----------
let G = null, mouse = [0, 0], cw = 0, ch = 0, dpr = 1, zoom = 1;
const keys = {};

function resize() {
    dpr = Math.min(2, devicePixelRatio || 1);
    cw = innerWidth; ch = innerHeight;
    cv.width = cw * dpr; cv.height = ch * dpr;
    cv.style.width = cw + 'px'; cv.style.height = ch + 'px';
    zoom = clamp(cw / 1100, 0.55, 1.15);
}
addEventListener('resize', resize);
resize();

function loadMission(i) {
    const m = MISSIONS[i];
    const map = m.map.map(r => r.split(''));
    const guards = m.guards.map(g => ({
        kind: 'guard', path: g.p, boss: !!g.boss, label: g.label || 'Ispettore Acqua',
        x: g.p[0][0] + .5, y: g.p[0][1] + .5, pi: 0, route: [], mode: 'patrol', timer: 0,
        dir: g.base || 0, base: g.base || 0, sweep: g.sweep || 1,
        speed: g.boss ? 0 : 1.6, fov: g.boss ? 1.5 : 1.25, range: g.boss ? 8.5 : 6.5,
        meter: 0, sayT: 0, sayTxt: '', after: null,
    }));
    G = {
        mi: i, m, map, W: map[0].length, H: map.length, t: 0, state: 'play', sel: 0, follow: false,
        targeting: false, free: false, cam: { x: 0, y: 0 }, guards, baits: [], dyn: [], fx: [],
        chars: CHARS.map((c, k) => ({
            ...c, kind: 'char', x: m.starts[k][0] + .5, y: m.starts[k][1] + .5,
            route: [], cdT: 0, disguise: 0, want: null
        })),
        objs: m.objectives.map(o => ({
            ...o, done: false,
            needAsleep: o.needAsleep === 'boss' ? guards.findIndex(g => g.boss) : null
        })),
    };
    const c = G.chars[0];
    [G.cam.x, G.cam.y] = iso(c.x, c.y);
}

// ---------- mappa / percorsi ----------
function tileAt(x, y) {
    if (x < 0 || y < 0 || x >= G.W || y >= G.H) return '#';
    return G.map[y][x];
}
const canDoor = c => c.kind === 'guard' || c.id === 'alcan' || (c.id === 'proboscis' && c.disguise > 0);
function walk(x, y, who) {
    const t = tileAt(x, y);
    if (t === 'K') return !!who && canDoor(who);
    return !'#TBOC'.includes(t);
}
const opaqueTile = t => '#TBK'.includes(t);
function inSmoke(x, y) {
    return G.baits.some(b => b.kind === 'smoke' && Math.hypot(b.x - x, b.y - y) < b.r);
}
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

function follow(e, speed, dt) {
    if (!e.route.length) return false;
    const [tx, ty] = e.route[0], dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy), s = speed * dt;
    if (d <= s) { e.x = tx; e.y = ty; e.route.shift(); } else { e.x += dx / d * s; e.y += dy / d * s; }
    return true;
}

// ---------- messaggi ----------
let toastTimer = 0;
function say(txt, ms = 2800) {
    const t = $('toast');
    t.textContent = txt; t.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('on'), ms);
}
function gsay(g, txt) { g.sayTxt = txt; g.sayT = 2; }

// ---------- abilità ----------
function startAbility() {
    if (!G || G.state !== 'play') return;
    const c = G.chars[G.sel];
    if (c.cdT > 0) { say(c.abil + ' in ricarica (' + Math.ceil(c.cdT) + 's)'); return; }
    if (!c.target) { castAt(c); return; }
    G.targeting = !G.targeting;
    if (G.targeting) say(c.abil + ': tocca/clicca dove usarla (Esc per annullare)');
    refreshHud();
}

function castAt(c, wx, wy) {
    if (c.target) {
        const d = Math.hypot(wx - c.x, wy - c.y);
        if (d > c.range) { wx = c.x + (wx - c.x) / d * c.range; wy = c.y + (wy - c.y) / d * c.range; }
    }
    G.targeting = false;
    switch (c.id) {
        case 'estice': G.dyn.push({ x: wx, y: wy, t: 2.5 }); say('Dinamite innescata! Allontanatevi!'); break;
        case 'alcan':
            G.baits.push({ kind: 'whisky', x: wx, y: wy, t: 10, r: 0 });
            lure(wx, wy, 9, 'drink', 6, 'Glu glu... Macallan 12!');
            say('Bottiglia piazzata: le guardie arrivano.'); break;
        case 'muglo':
            G.baits.push({ kind: 'smoke', x: wx, y: wy, t: 10, r: 2.4 });
            lure(wx, wy, 8, 'look', 4, 'Che profumo di brace!');
            say('Fumo e profumo di arrosto!'); break;
        case 'unicorn': {
            let n = 0;
            G.guards.forEach(g => {
                if (Math.hypot(g.x - wx, g.y - wy) < 1.9 && g.mode !== 'sleep') { sleepGuard(g, g.boss ? 16 : 14, 'Zzz... luppolo...'); n++; }
            });
            G.fx.push({ x: wx, y: wy, t: 0, max: .8, r: 1.9, col: '240,190,40' });
            say(n ? 'Pozione al luppolo: nanna!' : 'Pozione sprecata... nessuno nel raggio.');
            break;
        }
        case 'proboscis': c.disguise = 10; say('Completo da agente immobiliare: "Ho un affare per lei!"'); break;
    }
    c.cdT = c.cd;
    refreshHud();
}

function sleepGuard(g, t, txt) { g.mode = 'sleep'; g.timer = t; g.route = []; g.meter = 0; gsay(g, txt); }

function lure(x, y, range, mode, dur, msg) {
    G.guards.forEach(g => {
        if (g.boss || g.mode === 'sleep' || g.mode === 'drink') return;
        if (Math.hypot(g.x - x, g.y - y) > range) return;
        const r = bfs(Math.floor(g.x), Math.floor(g.y), Math.floor(x), Math.floor(y), g);
        if (!r) return;
        g.mode = 'goto'; g.route = r; g.after = { mode, dur, msg }; gsay(g, '?');
    });
}

function explode(d) {
    const R = 2.3;
    for (let j = Math.floor(d.y - R); j <= Math.ceil(d.y + R); j++) for (let i = Math.floor(d.x - R); i <= Math.ceil(d.x + R); i++) {
        if (tileAt(i, j) === 'B' && Math.hypot(i + .5 - d.x, j + .5 - d.y) <= R + .5) G.map[j][i] = ',';
    }
    G.guards.forEach(g => { if (!g.boss && Math.hypot(g.x - d.x, g.y - d.y) < 1.8) sleepGuard(g, 5, 'Bzzzz... stordito'); });
    G.fx.push({ x: d.x, y: d.y, t: 0, max: .6, r: R, col: '255,140,30' });
    lure(d.x, d.y, 10, 'look', 5, 'Cos\'è stato?!');
    say('BOOM!');
}

// ---------- interazione ----------
function interact(c) {
    const o = G.objs.find(o => !o.done && Math.hypot(c.x - (o.x + .5), c.y - (o.y + .5)) < 1.9);
    if (!o) { say('Qui non c\'è niente da fare.'); return false; }
    if (o.needAsleep != null && G.guards[o.needAsleep].mode !== 'sleep') { say(o.lock); return false; }
    o.done = true;
    say(o.msg, 4000);
    G.fx.push({ x: o.x + .5, y: o.y + .5, t: 0, max: 1, r: 2.5, col: '90,220,120' });
    refreshHud();
    if (G.objs.every(x => x.done)) { G.state = 'won'; setTimeout(showWin, 1500); }
    return true;
}

function select(i) {
    G.sel = i; G.targeting = false; G.free = false;
    refreshHud();
}

function tap(px, py) {
    const c = G.chars[G.sel];
    const [wx, wy] = toWorld(px, py);
    if (G.targeting) { castAt(c, wx, wy); return; }
    const [hx, hy] = toWorld(px, py + 22);
    const hit = G.chars.findIndex(o => Math.hypot(o.x - hx, o.y - hy) < .9);
    if (hit >= 0) { select(hit); return; }
    const ti = Math.floor(wx), tj = Math.floor(wy);
    c.want = tileAt(ti, tj) === 'O' ? true : null;
    c.route = bfs(Math.floor(c.x), Math.floor(c.y), ti, tj, c) || [];
}

function toWorld(px, py) {
    const u = (px - cw / 2) / zoom + G.cam.x, v = (py - ch / 2) / zoom + G.cam.y;
    return [(v / 16 + u / 32) / 2, (v / 16 - u / 32) / 2];
}

// ---------- aggiornamento ----------
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
    g.sayT = Math.max(0, g.sayT - dt);
    if (g.mode === 'sleep') {
        g.timer -= dt;
        if (g.timer <= 0) { g.mode = 'patrol'; g.route = []; gsay(g, 'Eh? Mi sono appisolato...'); }
        return;
    }
    if (g.mode === 'drink' || g.mode === 'look') {
        g.timer -= dt;
        if (g.mode === 'look') g.dir += Math.sin(G.t * 2.5) * dt * 1.2;
        if (g.timer <= 0) { g.mode = 'patrol'; g.route = []; }
        return;
    }
    if (g.mode === 'goto') {
        if (!g.route.length) { g.mode = g.after.mode; g.timer = g.after.dur; gsay(g, g.after.msg); return; }
        walkGuard(g, g.speed * 1.5, dt);
        return;
    }
    if (g.path.length === 1) {
        const p = g.path[0];
        if (Math.hypot(g.x - (p[0] + .5), g.y - (p[1] + .5)) > .15) {
            if (!g.route.length) g.route = bfs(Math.floor(g.x), Math.floor(g.y), p[0], p[1], g) || [];
            walkGuard(g, g.speed || 1.6, dt);
        } else turn(g, g.base + Math.sin(G.t * .7) * g.sweep, dt);
        return;
    }
    if (!g.route.length) {
        g.pi = (g.pi + 1) % g.path.length;
        g.route = bfs(Math.floor(g.x), Math.floor(g.y), g.path[g.pi][0], g.path[g.pi][1], g) || [];
    }
    walkGuard(g, g.speed, dt);
}

function detect(dt) {
    for (const g of G.guards) {
        if (g.mode === 'sleep' || g.mode === 'drink') { g.meter = Math.max(0, g.meter - dt); continue; }
        let seen = 0;
        for (const c of G.chars) {
            const dx = c.x - g.x, dy = c.y - g.y, d = Math.hypot(dx, dy);
            if (d > g.range || (c.disguise > 0 && d > 2)) continue;
            const a = Math.atan2(Math.sin(Math.atan2(dy, dx) - g.dir), Math.cos(Math.atan2(dy, dx) - g.dir));
            if (Math.abs(a) > g.fov / 2 && d > 1) continue;
            if (!los(g.x, g.y, c.x, c.y)) continue;
            seen = Math.max(seen, 1.2 + (g.range - d) * .25);
        }
        g.meter = clamp(g.meter + (seen ? seen * dt * .9 : -.5 * dt), 0, 1);
        if (g.meter >= 1) { fail(g); return; }
    }
}

const FAIL_LINES = [
    '"Alcol?! Acqua per tutti!" — il Ministro vi ha scoperti.',
    'Un Ispettore Acqua vi ha beccati e vi ha offerto una camomilla. Che umiliazione.',
    '"Sobrietà obbligatoria!" Vi trascinano via a bere tisane.',
];
function fail(g) {
    G.state = 'lost';
    gsay(g, 'ALT! Controllo sobrietà!');
    setTimeout(() => {
        screen('<h2>Beccati!</h2><p>' + FAIL_LINES[Math.floor(Math.random() * FAIL_LINES.length)] +
            '</p><button class="btn" onclick="begin(' + G.mi + ')">Riprova</button><button class="btn" onclick="showTitle()">Menu</button>');
    }, 900);
}

function update(dt) {
    G.t += dt;
    const pan = 520 * dt / zoom;
    const px = (keys.ArrowRight || keys.d ? 1 : 0) - (keys.ArrowLeft || keys.a ? 1 : 0);
    const py = (keys.ArrowDown || keys.s ? 1 : 0) - (keys.ArrowUp || keys.w ? 1 : 0);
    if (px || py) { G.cam.x += px * pan; G.cam.y += py * pan; G.free = true; }

    if (G.state === 'play') {
        G.chars.forEach((c, i) => {
            c.cdT = Math.max(0, c.cdT - dt);
            c.disguise = Math.max(0, c.disguise - dt);
            if (i !== G.sel && G.follow && !c.route.length) {
                const l = G.chars[G.sel];
                if (Math.hypot(l.x - c.x, l.y - c.y) > 2.4) c.route = bfs(Math.floor(c.x), Math.floor(c.y), Math.floor(l.x), Math.floor(l.y), c) || [];
            }
            c.moving = follow(c, 3.3, dt);
            if (c.want && !c.route.length) { c.want = null; interact(c); }
        });
        G.guards.forEach(g => updateGuard(g, dt));
        for (const d of G.dyn) { d.t -= dt; if (d.t <= 0) explode(d); }
        G.dyn = G.dyn.filter(d => d.t > 0);
        G.baits.forEach(b => b.t -= dt);
        G.baits = G.baits.filter(b => b.t > 0);
        if (G.t > 4) detect(dt);
    }
    G.fx.forEach(f => f.t += dt);
    G.fx = G.fx.filter(f => f.t < f.max);

    if (!G.free) {
        const [tx, ty] = iso(G.chars[G.sel].x, G.chars[G.sel].y);
        G.cam.x += (tx - G.cam.x) * Math.min(1, dt * 5);
        G.cam.y += (ty - G.cam.y) * Math.min(1, dt * 5);
    }
    document.querySelectorAll('.ch .cd').forEach((e, i) => {
        const c = G.chars[i];
        e.style.height = (c.cdT / c.cd * 100) + '%';
    });
}

// ---------- disegno ----------
function poly(pts, col) {
    ctx.fillStyle = col;
    ctx.beginPath();
    pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
    ctx.closePath(); ctx.fill();
}
function box(x0, y0, x1, y1, h, top, left, right, timber) {
    const a = iso(x0, y1), b = iso(x1, y1), c = iso(x1, y0), d = iso(x0, y0);
    const up = p => [p[0], p[1] - h];
    poly([a, b, up(b), up(a)], left);
    poly([b, c, up(c), up(b)], right);
    poly([up(d), up(c), up(b), up(a)], top);
    if (timber) {
        ctx.strokeStyle = 'rgba(245,235,215,.75)'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1] - h);
        ctx.moveTo(b[0], b[1]); ctx.lineTo(a[0], a[1] - h);
        ctx.moveTo(b[0], b[1]); ctx.lineTo(c[0], c[1] - h);
        ctx.moveTo(c[0], c[1]); ctx.lineTo(b[0], b[1] - h);
        ctx.stroke();
    }
}
function ell(x, y, rx, ry, fill, stroke) {
    const [sx, sy] = iso(x, y);
    ctx.beginPath(); ctx.ellipse(sx, sy, rx, ry, 0, 0, 7);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
}
const ringR = r => [r * 32 * 1.4142, r * 16 * 1.4142];

function floorColor(t, i, j, th) {
    const k = (i + j) & 1;
    if (t === 'p') return k ? th.p : shade(th.p, -10);
    if (t === '.') return k ? th.c : shade(th.c, -12);
    return k ? th.a : th.b;
}
function shade(hex, d) {
    const n = parseInt(hex.slice(1), 16);
    const f = v => clamp(v + d, 0, 255);
    return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join('');
}

function px(spec, sx, sy, u) {
    for (const [x, y, w, h, col] of spec) { ctx.fillStyle = col; ctx.fillRect(sx + x * u, sy + y * u, w * u, h * u); }
}
function base(shirt, pants, skin) {
    return [[-3, -5, 2.5, 5, pants], [.5, -5, 2.5, 5, pants], [-4, -12, 8, 7, shirt],
    [-6, -12, 2, 6, shirt], [4, -12, 2, 6, shirt], [-6, -6, 2, 2, skin], [4, -6, 2, 2, skin], [-3.5, -18, 7, 6, skin]];
}
function charSpec(c) {
    const skin = '#e8b78a';
    switch (c.id) {
        case 'estice': return [...base('#7a5a35', '#3a3a3a', skin), [-4.5, -21, 9, 4, '#f2c200'], [-1, -20.5, 2, 2, '#fff6a0'],
        [7, -16, 1.5, 14, '#6b4a2a'], [5, -17, 6, 1.5, '#9aa0a6'], [-8, -6, 2, 4, '#c0392b']];
        case 'alcan': return [...base('#1f2f5c', '#2b2b3a', skin), [-3.5, -19, 7, 2, '#2b1b12'], [-3, -16, 6, 1.5, '#111'],
        [6, -9, 2, 5, '#c98a2b'], [-3, -9, 6, 2, '#ddd']];
        case 'muglo': return [...base('#f2f2f2', '#3b4f7a', skin), [-6.5, -19, 13, 1.5, '#7b4a22'], [-3.5, -23, 7, 4, '#8b5a2b'],
        [7, -14, 1.2, 8, '#bbb'], [6.3, -17, 3, 3, '#999']];
        case 'unicorn': return [...base('#e68ab8', '#555', skin), [-4, -21, 8, 3, '#2a62d1'], [2, -19, 6, 1.5, '#2a62d1'],
        [6, -10, 3, 4, '#f0b429'], [6, -11, 3, 1, '#fff']];
        default: return [...base(c.disguise > 0 ? '#1f3f8f' : '#444', '#2b2b3a', skin), [-3.5, -14, 7, 3, '#2a1b14'], [-3, -16, 6, 1.5, '#111'],
        ...(c.disguise > 0 ? [[-.5, -12, 1, 5, '#c0392b']] : [[6, -9, 4, 4, '#e07b22']])];
    }
}

function drawChar(c, selected) {
    const [sx, sy] = iso(c.x, c.y), u = 2.6;
    if (selected) ell(c.x, c.y, 24, 12, null, '#f2b705');
    ell(c.x, c.y, 14, 6, '#0005');
    const bob = c.moving ? Math.sin(G.t * 14) * 1.5 : 0;
    px(charSpec(c), sx, sy + bob, u);
    if (c.disguise > 0) { ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('travestito', sx, sy - 70); }
    if (selected) { ctx.fillStyle = '#f2b705'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(c.name, sx, sy - 56); }
}

function drawGuard(g) {
    const [sx, sy] = iso(g.x, g.y), s = g.boss ? 1.35 : 1, u = 2.6 * s;
    ell(g.x, g.y, 14 * s, 6 * s, '#0005');
    const body = g.boss ? ['#222', '#1a1a1a'] : ['#8d949c', '#2d2d33'];
    const spec = [...base(body[0], body[1], '#e0ad84'), [-.5, -12, 1, 5, g.boss ? '#2ecc71' : '#c0392b'],
    g.boss ? [-4.5, -21, 9, 3, '#f5f5f5'] : [-4, -20, 8, 3, '#2f7d6d'], [6, -10, 2, 4, '#9fd8ff'], [-6, -10, 2, 2, '#4aa3ff']];
    if (g.mode === 'sleep') {
        ctx.save(); ctx.translate(sx, sy); ctx.rotate(-1.4); px(spec, 0, 0, u); ctx.restore();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('Zzz', sx, sy - 30 - Math.sin(G.t * 3) * 4);
    } else px(spec, sx, sy, u);
    const top = sy - 62 * s;
    if (g.meter > .03) {
        ctx.fillStyle = '#000a'; ctx.fillRect(sx - 18, top, 36, 5);
        ctx.fillStyle = g.meter > .6 ? '#e22' : '#fc0'; ctx.fillRect(sx - 18, top, 36 * g.meter, 5);
        if (g.meter > .6) { ctx.fillStyle = '#e22'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('!', sx, top - 4); }
    }
    if (g.sayT > 0) {
        ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
        const w = ctx.measureText(g.sayTxt).width + 12;
        ctx.fillStyle = '#fff'; ctx.fillRect(sx - w / 2, top - 30, w, 20);
        ctx.fillStyle = '#222'; ctx.fillText(g.sayTxt, sx, top - 16);
    }
}

function drawCone(g) {
    if (g.mode === 'sleep' || g.mode === 'drink') return;
    const pts = [iso(g.x, g.y)], n = 20;
    for (let k = 0; k <= n; k++) {
        const a = g.dir - g.fov / 2 + g.fov * k / n;
        let d = .3;
        while (d < g.range && !opaque(g.x + Math.cos(a) * d, g.y + Math.sin(a) * d)) d += .25;
        pts.push(iso(g.x + Math.cos(a) * d, g.y + Math.sin(a) * d));
    }
    poly(pts, `rgba(255,${Math.round(220 - g.meter * 190)},60,${.16 + g.meter * .3})`);
}

function drawBlock(i, j, t, th) {
    const x0 = i, y0 = j, x1 = i + 1, y1 = j + 1;
    switch (t) {
        case '#': box(x0, y0, x1, y1, 46, th.wT, th.wL, th.wR, th.timber); break;
        case 'T': {
            const [sx, sy] = iso(i + .5, j + .5);
            ctx.fillStyle = '#6b4a2a'; ctx.fillRect(sx - 3, sy - 14, 6, 14);
            [['#2f7d32', 0, -34, 22], ['#3fa143', -8, -26, 16], ['#4bb24f', 8, -26, 15]].forEach(([c, dx, dy, r]) => {
                ctx.fillStyle = c; ctx.beginPath(); ctx.arc(sx + dx, sy + dy, r, 0, 7); ctx.fill();
            });
            break;
        }
        case 'C': box(i + .1, j + .1, i + .9, j + .9, 24, '#c89a5a', '#a67a3e', '#8a6230', false); break;
        case 'B': {
            box(x0, y0, x1, y1, 28, '#e8e8e8', '#d94a3a', '#b53a2c', false);
            const [sx, sy] = iso(i + 1, j + 1);
            ctx.fillStyle = '#fff'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText('VIETATO', sx - 16, sy - 12);
            break;
        }
        case 'K': box(x0, y0, x1, y1, 44, '#5a6c8a', '#3d5a8a', '#2c4470', false); {
            const [sx, sy] = iso(i + 1, j + 1);
            ctx.fillStyle = '#ffd54a'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText('STAFF', sx - 16, sy - 18);
        } break;
        case 'O': {
            const o = G.objs.find(o => o.x === i && o.y === j), done = o && o.done;
            if (G.mi === 2) box(i - .5, j + .1, i + 1.5, j + .9, 18, '#7a4a28', '#5f381d', '#4a2c16', false);
            box(i + .2, j + .2, i + .8, j + .8, 26, done ? '#7fbf7f' : '#e8a735', done ? '#5a9a5a' : '#b97a1c', done ? '#437a43' : '#8a5a12', false);
            if (!done) {
                const [sx, sy] = iso(i + .5, j + .5), b = Math.sin(G.t * 4) * 5;
                poly([[sx - 9, sy - 62 + b], [sx + 9, sy - 62 + b], [sx, sy - 48 + b]], '#ffd23f');
            }
            break;
        }
    }
}

function drawSign(s) {
    const [sx, sy] = iso(s.x, s.y);
    ctx.fillStyle = '#444'; ctx.fillRect(sx - 3, sy - 150, 6, 150);
    ctx.fillStyle = '#f4ecd8'; ctx.fillRect(sx - 68, sy - 200, 136, 62);
    ctx.strokeStyle = '#8b1a3a'; ctx.lineWidth = 3; ctx.strokeRect(sx - 68, sy - 200, 136, 62);
    ctx.textAlign = 'center'; ctx.fillStyle = '#8b1a3a';
    ctx.font = 'italic bold 30px Georgia,serif'; ctx.fillText(s.title, sx - 8, sy - 168);
    ctx.font = 'italic 15px Georgia,serif'; ctx.fillText(s.sub, sx + 34, sy - 152);
    ctx.fillRect(sx - 68, sy - 146, 136, 8);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 9px sans-serif'; ctx.fillText(s.tag, sx, sy - 139);
}

function render() {
    const th = G.m.theme;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = th.bg; ctx.fillRect(0, 0, cw, ch);
    ctx.save();
    ctx.translate(cw / 2, ch / 2); ctx.scale(zoom, zoom); ctx.translate(-G.cam.x, -G.cam.y);

    for (let j = 0; j < G.H; j++) for (let i = 0; i < G.W; i++) {
        const t = G.map[j][i];
        if (t === '#') continue;
        poly([iso(i, j), iso(i + 1, j), iso(i + 1, j + 1), iso(i, j + 1)], floorColor(t === 'O' ? 'p' : t, i, j, th));
    }
    G.guards.forEach(drawCone);

    const c = G.chars[G.sel];
    if (G.targeting) {
        const [rx, ry] = ringR(c.range);
        ell(c.x, c.y, rx, ry, 'rgba(255,255,255,.08)', '#fff');
        const [wx, wy] = toWorld(mouse[0], mouse[1]), d = Math.hypot(wx - c.x, wy - c.y), k = d > c.range ? c.range / d : 1;
        ell(c.x + (wx - c.x) * k, c.y + (wy - c.y) * k, 18, 9, 'rgba(255,80,60,.35)', '#f55');
    }
    G.fx.forEach(f => {
        const p = f.t / f.max, [rx, ry] = ringR(f.r * p);
        ell(f.x, f.y, rx, ry, `rgba(${f.col},${.4 * (1 - p)})`, `rgba(${f.col},${1 - p})`);
    });

    const list = [];
    for (let j = 0; j < G.H; j++) for (let i = 0; i < G.W; i++) {
        const t = G.map[j][i];
        if ('#TCBKO'.includes(t)) list.push({ d: i + j + 1, f: () => drawBlock(i, j, t, th) });
    }
    G.chars.forEach((ch, i) => list.push({ d: ch.x + ch.y, f: () => drawChar(ch, i === G.sel) }));
    G.guards.forEach(g => list.push({ d: g.x + g.y, f: () => drawGuard(g) }));
    G.dyn.forEach(d => list.push({
        d: d.x + d.y, f: () => {
            const [sx, sy] = iso(d.x, d.y);
            ctx.fillStyle = '#c0392b'; ctx.fillRect(sx - 3, sy - 14, 6, 14);
            ctx.fillStyle = Math.sin(G.t * 30) > 0 ? '#ffd23f' : '#ff6a00'; ctx.fillRect(sx - 2, sy - 20, 4, 6);
        }
    }));
    G.baits.forEach(b => list.push({
        d: b.x + b.y, f: () => {
            const [sx, sy] = iso(b.x, b.y);
            if (b.kind === 'whisky') { ctx.fillStyle = '#c98a2b'; ctx.fillRect(sx - 4, sy - 16, 8, 16); ctx.fillRect(sx - 2, sy - 22, 4, 6); }
            else { ctx.fillStyle = '#222'; ctx.fillRect(sx - 9, sy - 10, 18, 10); ctx.fillStyle = '#ff7a1a'; ctx.fillRect(sx - 7, sy - 12, 14, 3); }
        }
    }));
    (G.m.signs || []).forEach(s => list.push({ d: s.x + s.y, f: () => drawSign(s) }));
    list.sort((a, b) => a.d - b.d).forEach(o => o.f());

    G.baits.filter(b => b.kind === 'smoke').forEach(b => {
        const [sx, sy] = iso(b.x, b.y), a = Math.min(1, b.t / 2) * .55;
        for (let k = 0; k < 7; k++) {
            const ang = k * 2.4 + G.t * .6, r = 18 + (k % 3) * 14;
            ctx.fillStyle = `rgba(215,215,215,${a})`;
            ctx.beginPath(); ctx.arc(sx + Math.cos(ang) * r * 1.4, sy - 14 - (G.t * 12 + k * 9) % 30 + Math.sin(ang) * r * .5, 22 + k % 3 * 5, 0, 7); ctx.fill();
        }
    });
    ctx.restore();
}

// ---------- HUD e schermate ----------
function screen(html) { const s = $('screen'); s.innerHTML = '<div class="card">' + html + '</div>'; s.hidden = false; }
function hideScreen() { $('screen').hidden = true; }

function showTitle() {
    G = null; $('hud').hidden = true;
    screen('<h1>E-TEAM: Operazione Sobrietà Zero</h1>' +
        '<p>Un politicante astemio ha fatto sparire ogni bevanda alcolica dall\'Italia. Cinque amici inseparabili, cinque abilità, nessuna intenzione di restare a secco.</p>' +
        '<p class="warn">Gioco comico per adulti (18+): tema alcol. Nessuna violenza, solo guardie che si addormentano.</p>' +
        '<p class="small">Click/tocco: muovi il personaggio · 1-5: cambia personaggio · Q: abilità · E: interagisci · F: segui · trascina/WASD: sposta la vista · R: riavvia</p>' +
        MISSIONS.map((m, i) => '<button class="btn" onclick="showBrief(' + i + ')">' + m.name + '</button>').join('<br>'));
}

function showBrief(i) {
    const m = MISSIONS[i];
    screen((i === 0 ? '<img class="br" src="assets/ludwig.jpg" alt="Ludwig Pub" onerror="this.remove()">' : '') +
        '<h2>' + m.name + '</h2><p>' + m.intro + '</p><p class="small">Suggerimento: ' + m.hint + '</p>' +
        '<button class="btn" onclick="begin(' + i + ')">Via!</button><button class="btn" onclick="showTitle()">Indietro</button>');
}

function begin(i) {
    loadMission(i); hideScreen();
    $('hud').hidden = false;
    $('mtitle').textContent = MISSIONS[i].name;
    $('team').innerHTML = CHARS.map((c, k) => `<button class="ch" data-i="${k}" title="${c.role}: ${c.abil}"><i>${k + 1}</i>` +
        `<img src="${c.img}" alt="${c.name}"><span>${c.name}</span><div class="cd"></div></button>`).join('');
    $('team').querySelectorAll('.ch').forEach(b => b.onclick = () => select(+b.dataset.i));
    refreshHud();
    say(MISSIONS[i].hint, 5000);
}

function refreshHud() {
    if (!G) return;
    $('objs').innerHTML = G.objs.map(o => `<li class="${o.done ? 'done' : ''}">${o.text}</li>`).join('');
    document.querySelectorAll('.ch').forEach((b, i) => b.classList.toggle('sel', i === G.sel));
    const c = G.chars[G.sel];
    $('bAbil').textContent = 'Q: ' + c.abil;
    $('bAbil').title = c.desc;
    $('bAbil').classList.toggle('on', G.targeting);
    $('bFollow').textContent = 'Segui: ' + (G.follow ? 'SÌ' : 'NO') + ' (F)';
}

function showWin() {
    if (!G || G.state !== 'won') return;
    const next = G.mi + 1 < MISSIONS.length;
    screen('<h2>Missione compiuta!</h2><p>' + G.objs[G.objs.length - 1].msg + '</p>' +
        (next ? '<button class="btn" onclick="showBrief(' + (G.mi + 1) + ')">Prossima missione</button>'
            : '<p>Il Ministro si risveglia, assaggia un sorso e... brinda con voi. L\'Italia è salva. Salute!</p>') +
        '<button class="btn" onclick="showTitle()">Menu</button>');
}

// ---------- input ----------
let ptr = null;
cv.addEventListener('pointerdown', e => { ptr = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, moved: false }; cv.setPointerCapture(e.pointerId); });
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
addEventListener('keydown', e => {
    keys[e.key] = true;
    if (!G || G.state !== 'play') return;
    if (e.key >= '1' && e.key <= '5') select(+e.key - 1);
    else if (e.key === 'Tab') { e.preventDefault(); select((G.sel + 1) % 5); }
    else if (e.key === 'q' || e.key === 'Q') startAbility();
    else if (e.key === 'e' || e.key === 'E') interact(G.chars[G.sel]);
    else if (e.key === 'f' || e.key === 'F') { G.follow = !G.follow; refreshHud(); }
    else if (e.key === 'r' || e.key === 'R') begin(G.mi);
    else if (e.key === 'Escape') { G.targeting = false; refreshHud(); }
});
addEventListener('keyup', e => { keys[e.key] = false; });
$('bAbil').onclick = startAbility;
$('bAct').onclick = () => G && G.state === 'play' && interact(G.chars[G.sel]);
$('bFollow').onclick = () => { if (G) { G.follow = !G.follow; refreshHud(); } };
$('bRestart').onclick = () => G && begin(G.mi);

let last = 0;
function loop(ts) {
    const dt = Math.min(.05, (ts - last) / 1000 || 0);
    last = ts;
    if (G) { update(dt); render(); } else { ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = '#111'; ctx.fillRect(0, 0, cw, ch); }
    requestAnimationFrame(loop);
}
showTitle();
requestAnimationFrame(loop);
