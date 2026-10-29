'use strict';
// Grafica: sprite PNG opzionali + segnaposto cartoon disegnati via codice.

const SPRITE_DIR = 'assets/sprites/';
const iso = (x, y) => [(x - y) * 32, (x + y) * 16];
let X = null; // contesto di disegno corrente

// ---------- sprite ----------
const SPR = {};
// Cartelle dentro assets/sprites/ (stessa struttura dello zip da scaricare)
const SPRITE_GROUPS = {
    personaggi: CHARS.flatMap(c => ['front', 'back', 'action', 'portrait'].map(k => c.id + '-' + k)),
    nemici: ['guard-front', 'guard-back', 'guard-alert', 'guard-sleep', 'guard-stunned', 'boss-astemi'],
    oggetti: ['prop-car', 'prop-bush', 'prop-barrel', 'prop-barricade', 'prop-table', 'prop-beer-tap', 'brewery-tank', 'grill-big', 'muglo-grill', 'estice-gas'],
    texture: ['tex-asphalt', 'tex-concrete', 'tex-grass', 'tex-wood', 'tex-carpet', 'tex-paving', 'tex-brick', 'tex-canvas'],
};
const SPRITE_FOLDER = {};
Object.entries(SPRITE_GROUPS).forEach(([f, list]) => list.forEach(n => SPRITE_FOLDER[n] = f));
const SPRITE_NAMES = Object.keys(SPRITE_FOLDER);
const spritePath = n => SPRITE_DIR + SPRITE_FOLDER[n] + '/' + n + '.png';

function loadSprites() {
    SPRITE_NAMES.forEach(n => {
        const img = new Image();
        img.onload = () => { SPR[n] = prepSprite(img); };
        img.src = spritePath(n);
    });
}

// Rimuove lo sfondo magenta e ritaglia i bordi vuoti. Con file:// il canvas è "tainted": si usa l'immagine così com'è.
function prepSprite(img) {
    try {
        const c = document.createElement('canvas'), w = img.naturalWidth, h = img.naturalHeight;
        c.width = w; c.height = h;
        const g = c.getContext('2d');
        g.drawImage(img, 0, 0);
        const d = g.getImageData(0, 0, w, h), p = d.data;
        let x0 = w, y0 = h, x1 = 0, y1 = 0;
        for (let i = 0; i < p.length; i += 4) {
            const r = p[i], gg = p[i + 1], b = p[i + 2];
            if (r > 180 && b > 180 && gg < 110) p[i + 3] = 0;
            if (p[i + 3] > 12) {
                const k = i / 4, x = k % w, y = (k / w) | 0;
                if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
            }
        }
        g.putImageData(d, 0, 0);
        if (x1 <= x0 || y1 <= y0) return c;
        const o = document.createElement('canvas');
        o.width = x1 - x0 + 1; o.height = y1 - y0 + 1;
        o.getContext('2d').drawImage(c, -x0, -y0);
        return o;
    } catch (e) { return img; }
}

// Disegna uno sprite con la base al centro di (0,0) e altezza h.
function drawSprite(name, h, flip) {
    const s = SPR[name];
    if (!s) return false;
    const sw = s.width || s.naturalWidth, sh = s.height || s.naturalHeight, w = h * sw / sh;
    X.save(); if (flip) X.scale(-1, 1);
    X.drawImage(s, -w / 2, -h, w, h);
    X.restore();
    return true;
}

// ---------- primitive ----------

// ---------- primitive (niente contorni cartoon: bordi sottili e ombreggiature da plastica) ----------
function hex6(c) {
    if (typeof c !== 'string' || c[0] !== '#') return null;
    return c.length === 4 ? '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3] : c.slice(0, 7);
}
function shade(hex, d) {
    const h = hex6(hex);
    if (!h) return hex;
    const n = parseInt(h.slice(1), 16);
    const f = v => Math.max(0, Math.min(255, v + d));
    return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join('');
}
const edge = fill => hex6(fill) ? shade(fill, -60) + 'aa' : 'rgba(0,0,0,.3)';
function rr(x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    X.beginPath();
    X.moveTo(x + r, y); X.arcTo(x + w, y, x + w, y + h, r); X.arcTo(x + w, y + h, x, y + h, r);
    X.arcTo(x, y + h, x, y, r); X.arcTo(x, y, x + w, y, r); X.closePath();
}
function fs(fill, lw = 1) { X.fillStyle = fill; X.fill(); if (lw > .3) { X.lineWidth = .8; X.strokeStyle = edge(fill); X.stroke(); } }
function circ(x, y, r, fill, lw) { X.beginPath(); X.arc(x, y, r, 0, Math.PI * 2); fs(fill, lw); }
function ellp(x, y, rx, ry, fill, lw) { X.beginPath(); X.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); fs(fill, lw); }
function poly(pts, col, stroke) {
    X.beginPath();
    pts.forEach((p, i) => i ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1]));
    X.closePath(); X.fillStyle = col; X.fill();
    if (stroke) { X.lineWidth = .8; X.strokeStyle = edge(col); X.lineJoin = 'round'; X.stroke(); }
}
function box(x0, y0, x1, y1, h, top, left, right) {
    const a = iso(x0, y1), b = iso(x1, y1), c = iso(x1, y0), d = iso(x0, y0);
    const up = p => [p[0], p[1] - h];
    poly([a, b, up(b), up(a)], left, 1);
    poly([b, c, up(c), up(b)], right, 1);
    poly([up(d), up(c), up(b), up(a)], top, 1);
    X.strokeStyle = 'rgba(255,255,255,.35)'; X.lineWidth = 1;
    X.beginPath(); X.moveTo(...up(a)); X.lineTo(...up(b)); X.lineTo(...up(c)); X.stroke();
}
// Sfera lucida (plastica dipinta)
function sph(x, y, rx, ry, col) {
    const g = X.createRadialGradient(x - rx * .35, y - ry * .4, rx * .08, x, y, Math.max(rx, ry) * 1.1);
    g.addColorStop(0, shade(col, 70)); g.addColorStop(.35, col); g.addColorStop(1, shade(col, -55));
    X.beginPath(); X.ellipse(x, y, rx, ry, 0, 0, 7); X.fillStyle = g; X.fill();
}
// Arto cilindrico da A a B
function limb(ax, ay, bx, by, w, col) {
    const len = Math.hypot(bx - ax, by - ay), a = Math.atan2(by - ay, bx - ax);
    X.save(); X.translate(ax, ay); X.rotate(a);
    const g = X.createLinearGradient(0, -w / 2, 0, w / 2);
    g.addColorStop(0, shade(col, 45)); g.addColorStop(.35, col); g.addColorStop(1, shade(col, -55));
    rr(-w / 2, -w / 2, len + w, w, w / 2); X.fillStyle = g; X.fill();
    X.restore();
}
function joint(x, y, r, col) {
    sph(x, y, r, r, col);
    X.beginPath(); X.arc(x, y, r, 0, 7); X.lineWidth = .5; X.strokeStyle = 'rgba(0,0,0,.22)'; X.stroke();
    X.fillStyle = 'rgba(0,0,0,.35)'; X.fillRect(x - .4, y - .4, .8, .8);
}

// ---------- texture dei materiali (diorama) ----------
const TEX = {};
function rng(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
function texture(kind, base) {
    const key = kind + base;
    if (TEX[key]) return TEX[key];
    const S = 64, c = document.createElement('canvas'), g = c.getContext('2d'), r = rng(key.length * 977 + base.charCodeAt(2) * 31);
    c.width = c.height = S;
    g.fillStyle = base; g.fillRect(0, 0, S, S);
    const dots = (n, cols, size) => { for (let k = 0; k < n; k++) { g.fillStyle = cols[Math.floor(r() * cols.length)]; const s = size * (.5 + r()); g.fillRect(r() * S, r() * S, s, s); } };
    switch (kind) {
        case 'asphalt':
            dots(1400, [shade(base, -22), shade(base, 18), shade(base, -10)], 1.2);
            dots(40, ['#d8d4cc', '#5a5854'], 1.6);
            break;
        case 'concrete':
            dots(900, [shade(base, -12), shade(base, 12)], 1.5);
            g.strokeStyle = shade(base, -30); g.lineWidth = 1; g.strokeRect(.5, .5, S - 1, S - 1);
            break;
        case 'grass':
            dots(1600, [shade(base, -30), shade(base, 22), shade(base, -12), '#9bd36a', '#5d8f35'], 1.4);
            dots(30, ['#e8e070', '#ffffff'], 1.2);
            break;
        case 'wood':
            for (let k = 0; k < 4; k++) {
                const col = shade(base, Math.round((r() - .5) * 26));
                g.fillStyle = col; g.fillRect(0, k * 16, S, 16);
                g.strokeStyle = shade(col, -18); g.lineWidth = .7;
                for (let l = 0; l < 4; l++) { g.beginPath(); const y = k * 16 + 3 + l * 3.4; g.moveTo(0, y); for (let x = 0; x <= S; x += 8) g.lineTo(x, y + Math.sin(x * .2 + r() * 6) * .8); g.stroke(); }
                g.fillStyle = shade(base, -55); g.fillRect(0, k * 16, S, 1);
                g.fillRect(Math.floor(r() * S), k * 16, 1, 16);
            }
            break;
        case 'carpet':
            dots(2200, [shade(base, -20), shade(base, 15)], 1);
            g.strokeStyle = shade(base, 25) + '66'; g.lineWidth = 2; g.strokeRect(6, 6, S - 12, S - 12);
            break;
        case 'paving':
            for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
                g.fillStyle = shade(base, Math.round((r() - .5) * 24)); g.fillRect(x * 16 + 1, y * 16 + 1, 14, 14);
            }
            dots(500, [shade(base, -18), shade(base, 14)], 1);
            break;
        case 'brick':
            g.fillStyle = shade(base, -50); g.fillRect(0, 0, S, S);
            for (let y = 0; y < 8; y++) for (let x = -1; x < 4; x++) {
                g.fillStyle = shade(base, Math.round((r() - .5) * 34));
                g.fillRect(x * 16 + (y % 2) * 8 + 1, y * 8 + 1, 14, 6);
            }
            dots(300, [shade(base, -25), shade(base, 20)], 1);
            break;
        case 'canvas':
            for (let x = 0; x < 4; x++) { g.fillStyle = x % 2 ? '#f4efe2' : base; g.fillRect(x * 16, 0, 16, S); }
            dots(1200, ['rgba(0,0,0,.06)', 'rgba(255,255,255,.08)'], 1);
            break;
        case 'woodside':
            for (let y = 0; y < S; y += 2) { g.fillStyle = shade(base, Math.round(Math.sin(y * .7 + r() * 2) * 10)); g.fillRect(0, y, S, 2); }
            break;
        default:
            dots(600, [shade(base, -15), shade(base, 15)], 1.3);
    }
    return (TEX[key] = c);
}
const PAT = {};
// Usa la texture PNG (texture/tex-<tipo>.png) se presente, altrimenti quella generata.
function pattern(kind, base, m) {
    const src = SPR['tex-' + kind], key = kind + base + m + (src ? '*' : '');
    if (PAT[key]) return PAT[key];
    const img = src || texture(kind, base), k = src ? 64 / (src.width || src.naturalWidth) : 1;
    const M = m === 'floor' ? [.5, .25, -.5, .25] : m === 'L' ? [.5, .25, 0, .66] : m === 'R' ? [.5, -.25, 0, .66] : [1, 0, 0, 1];
    const p = X.createPattern(img, 'repeat');
    p.setTransform(new DOMMatrix([M[0] * k, M[1] * k, M[2] * k, M[3] * k, 0, 0]));
    return (PAT[key] = p);
}

// ---------- personaggi: action figure snodate ----------
function drawProp(kind, P) {
    switch (kind) {
        case 'pickaxe':
            limb(0, 6, 0, -18, 2.6, '#8a5a2b');
            X.beginPath(); X.moveTo(-11, -14); X.quadraticCurveTo(0, -22, 11, -14); X.lineTo(9, -12); X.quadraticCurveTo(0, -18, -9, -12); X.closePath(); fs('#b8c0c8');
            break;
        case 'whisky': {
            const g = X.createLinearGradient(-3.5, 0, 3.5, 0);
            g.addColorStop(0, '#7a4a12'); g.addColorStop(.35, '#e0a040'); g.addColorStop(1, '#6a3a0a');
            rr(-3.5, -10, 7, 12, 2); X.fillStyle = g; X.fill(); rr(-1.5, -15, 3, 6, 1); fs('#3a2410');
            rr(-3, -6, 6, 4, 1); fs('#f4ead0');
            X.fillStyle = 'rgba(255,255,255,.55)'; X.fillRect(-2.4, -9, 1, 9);
            break;
        }
        case 'tongs':
            limb(0, 0, -3, -16, 1.4, '#aaaaaa'); limb(0, 0, 3, -16, 1.4, '#aaaaaa');
            break;
        case 'mug':
            rr(-4.5, -9, 9, 11, 2); fs('rgba(240,180,40,.85)'); ellp(0, -9.5, 5.5, 2.6, '#fffaf0');
            X.beginPath(); X.arc(5.5, -3.5, 3, -1.4, 1.4); X.lineWidth = 1.6; X.strokeStyle = 'rgba(255,255,255,.7)'; X.stroke();
            X.fillStyle = 'rgba(255,255,255,.5)'; X.fillRect(-3.5, -7, 1.2, 8);
            break;
        case 'skewer':
            X.lineWidth = 1.2; X.strokeStyle = '#c8a070'; X.beginPath(); X.moveTo(0, 4); X.lineTo(0, -18); X.stroke();
            for (let k = 0; k < 4; k++) { rr(-2.5, -16 + k * 4.2, 5, 3.6, 1); fs(k % 2 ? '#6a2e14' : '#8a4020'); }
            break;
        case 'clipboard':
            rr(-5, -12, 10, 13, 1.5); fs('#a87a4a'); rr(-3.5, -10, 7, 9, 1); fs('#fdfcf6');
            X.fillStyle = '#999'; X.fillRect(-2.5, -8, 5, .6); X.fillRect(-2.5, -6, 4, .6); X.fillRect(-2.5, -4, 5, .6);
            break;
        case 'water':
            rr(-3.5, -9, 7, 10, 1.5); fs('rgba(200,235,255,.6)'); rr(-2.8, -5, 5.6, 5, 1); X.fillStyle = 'rgba(80,170,255,.7)'; X.fill();
            break;
        case 'dynamite':
            limb(0, 1, 0, -10, 5, '#c62b22');
            X.strokeStyle = '#333'; X.lineWidth = 1; X.beginPath(); X.moveTo(0, -12); X.quadraticCurveTo(3, -15, 1, -17); X.stroke();
            X.save(); X.globalCompositeOperation = 'lighter';
            circ(1, -17.5, 2.4 + Math.sin(P.t * 40), 'rgba(255,200,60,.9)', 0); X.restore();
            break;
        case 'potion':
            rr(-2.5, -13, 5, 14, 2.5); fs('rgba(235,248,255,.55)'); rr(-2, -7, 4, 7.5, 2); X.fillStyle = 'rgba(255,200,40,.85)'; X.fill();
            rr(-3, -15, 6, 3, 1); fs('#a0703a');
            break;
        case 'ember':
            X.save(); X.globalCompositeOperation = 'lighter';
            circ(0, -4, 5.5, 'rgba(255,110,20,.85)', 0); circ(-1, -5, 2.8, 'rgba(255,230,120,.9)', 0); X.restore();
            break;
        case 'folder':
            rr(-7, -12, 14, 11, 1.5); fs('#d6362b');
            X.fillStyle = '#fff'; X.font = 'bold 3.6px sans-serif'; X.textAlign = 'center'; X.fillText('VENDESI', 0, -5.5);
            break;
        case 'ball':
            sph(0, -6, 6, 6, '#e8742a');
            break;
    }
}

const lerp = (a, b, t) => a + (b - a) * Math.max(0, Math.min(1, t));

// Pose a fotogrammi chiave: angoli in radianti da "dritto in basso", positivi = in avanti.
function poseAngles(P) {
    const st = P.moving ? Math.sin(P.phase || 0) : 0, a = P.actP ?? 0;
    const A = { thL: st * .5, thR: -st * .5, knL: Math.max(0, -st) * .7, knR: Math.max(0, st) * .7, shL: -st * .55, shR: st * .55, elL: .3, elR: .3, lean: P.moving ? .06 : 0 };
    if (!P.moving) { A.shL = -.1; A.shR = .1; A.elL = .2; A.elR = .2; }
    switch (P.arm) {
        case 'throw':
            if (a < .35) { A.shR = -2.3; A.elR = 1.1; A.lean = -.12; A.thL = .3; A.thR = -.2; }
            else { A.shR = lerp(-2.3, 1.7, (a - .35) / .25); A.elR = .1; A.lean = .15; A.thL = -.2; A.thR = .35; }
            A.shL = .5; A.elL = .8;
            break;
        case 'punch': A.shR = 1.55; A.elR = 0; A.shL = .7; A.elL = 1.8; A.lean = .2; A.thL = .35; A.thR = -.35; break;
        case 'up': A.shL = 2.8 + Math.sin(P.t * 18) * .25; A.shR = 2.8 - Math.sin(P.t * 18) * .25; A.elL = A.elR = .2; break;
        case 'drink': A.shR = .9; A.elR = 2.5; A.lean = -.15; break;
        case 'belly': A.shL = A.shR = .35; A.elL = A.elR = 1.8; A.lean = Math.sin(P.t * 20) * .12; break;
        case 'adjust': A.shL = A.shR = -.15; A.elL = A.elR = 1.1; A.lean = -.18; A.thL = -.2; A.thR = .2; break;
    }
    return A;
}

function drawFace(L, P, hx, hy) {
    const e = P.expr, mouth = e === 'normal' ? L.mouth : e, f = 1.3; // f: spostamento 3/4
    if (L.beard) {
        X.beginPath();
        X.moveTo(hx - 5.8, hy - 1); X.quadraticCurveTo(hx - 4.5, hy + 7.4, hx + f, hy + (L.beardKind === 'full' ? 8 : 7.2));
        X.quadraticCurveTo(hx + 6.5, hy + 6.8, hx + 6.2, hy - 1); X.quadraticCurveTo(hx + 3, hy + 2.6, hx + f, hy + 2.4);
        X.quadraticCurveTo(hx - 2, hy + 2.6, hx - 5.8, hy - 1); X.closePath();
        X.fillStyle = L.beardKind === 'full' ? L.beard : L.beard + '99'; X.fill();
        X.fillStyle = 'rgba(0,0,0,.25)';
        for (let k = 0; k < 14; k++) X.fillRect(hx - 4 + hash(k, 3) * 9, hy + 2 + hash(k, 7) * 5, .6, .6);
    }
    const ex = [hx - 1.6 + f * .5, hx + 2.8 + f * .5], ey = hy - 1.2;
    X.fillStyle = OUT; X.strokeStyle = OUT; X.lineWidth = .7;
    if (L.glasses && e !== 'sleep') {
        ex.forEach(x => { rr(x - 1.9, ey - 1.3, 3.8, 2.6, 1); X.fillStyle = '#111'; X.fill(); X.fillStyle = 'rgba(255,255,255,.6)'; X.fillRect(x - 1.2, ey - .9, .8, .6); });
        X.beginPath(); X.moveTo(ex[0] + 1.9, ey - .5); X.lineTo(ex[1] - 1.9, ey - .5); X.stroke();
    } else ex.forEach((x, k) => {
        if (e === 'sleep' || P.blink) { X.beginPath(); X.moveTo(x - 1, ey); X.lineTo(x + 1, ey); X.stroke(); return; }
        if (e === 'laugh') { X.beginPath(); X.arc(x, ey + .6, 1, Math.PI + .3, -.3); X.stroke(); return; }
        const big = e === 'shock' || e === 'stunned' || (L.eyes === 'crazy' && k);
        X.beginPath(); X.ellipse(x, ey, big ? 1.6 : 1.1, big ? 1.7 : .9, 0, 0, 7); X.fillStyle = '#f8f4ec'; X.fill();
        X.beginPath(); X.arc(x + .3, ey, big ? .55 : .6, 0, 7); X.fillStyle = '#1a1410'; X.fill();
    });
    X.strokeStyle = shade(L.hair || '#333', -10); X.lineWidth = .9;
    X.beginPath();
    if (L.brows === 'angry' || e === 'angry') { X.moveTo(ex[0] - 1.4, ey - 2.6); X.lineTo(ex[0] + 1.2, ey - 1.6); X.moveTo(ex[1] + 1.4, ey - 2.6); X.lineTo(ex[1] - 1.2, ey - 1.6); }
    else if (e === 'shock' || e === 'stunned') { X.moveTo(ex[0] - 1.2, ey - 3.2); X.lineTo(ex[0] + 1.2, ey - 3.4); X.moveTo(ex[1] - 1.2, ey - 3.4); X.lineTo(ex[1] + 1.2, ey - 3.2); }
    else { X.moveTo(ex[0] - 1.2, ey - 2.3); X.lineTo(ex[0] + 1.2, ey - 2.4); X.moveTo(ex[1] - 1.2, ey - 2.4); X.lineTo(ex[1] + 1.2, ey - 2.3); }
    X.stroke();
    X.fillStyle = shade(L.skin, -30); X.beginPath(); X.ellipse(hx + f + .6, hy + .8, 1, .8, 0, 0, 7); X.fill();
    if (L.mustache) { X.fillStyle = L.mustache; X.beginPath(); X.ellipse(hx + f - 1.2, hy + 2.3, 2, .9, .2, 0, 7); X.ellipse(hx + f + 1.8, hy + 2.3, 2, .9, -.2, 0, 7); X.fill(); }
    const mx = hx + f, my = hy + 3.6;
    X.lineWidth = .8; X.strokeStyle = '#4a1a14';
    const dark = '#3a1010';
    switch (mouth) {
        case 'grin': case 'crazy':
            X.beginPath(); X.moveTo(mx - 2.6, my - .4); X.quadraticCurveTo(mx, my + 3, mx + 2.6, my - .4); X.closePath(); X.fillStyle = '#fbf6ea'; X.fill(); X.stroke(); break;
        case 'angry':
            rr(mx - 2, my - .4, 4, 1.8, .6); X.fillStyle = '#fbf6ea'; X.fill(); X.stroke(); break;
        case 'tongue':
            X.beginPath(); X.moveTo(mx - 2.2, my - .4); X.quadraticCurveTo(mx, my + 2.4, mx + 2.2, my - .4); X.closePath(); X.fillStyle = dark; X.fill();
            X.beginPath(); X.ellipse(mx + .6, my + 1.4, 1.1, 1.3, 0, 0, 7); X.fillStyle = '#e0707e'; X.fill(); break;
        case 'smirk':
            X.beginPath(); X.moveTo(mx - 1.8, my + .4); X.quadraticCurveTo(mx + .5, my + 1.3, mx + 2.3, my - .7); X.stroke(); break;
        case 'open': case 'shock':
            X.beginPath(); X.ellipse(mx, my + .5, 1.3, 1.6, 0, 0, 7); X.fillStyle = dark; X.fill(); break;
        case 'stunned':
            rr(mx - 1.6, my - .4, 3.2, 5.4, 1.6); X.fillStyle = dark; X.fill(); break;
        case 'laugh':
            X.beginPath(); X.moveTo(mx - 2.8, my - .4); X.quadraticCurveTo(mx, my + 4.4, mx + 2.8, my - .4); X.closePath(); X.fillStyle = dark; X.fill(); break;
        case 'sleep':
            X.beginPath(); X.ellipse(mx, my + .4, .8, .6, 0, 0, 7); X.fillStyle = dark; X.fill(); break;
        case 'drunk':
            X.beginPath(); X.moveTo(mx - 1.8, my); X.quadraticCurveTo(mx, my + 1.8, mx + 1.8, my); X.stroke();
            X.fillStyle = 'rgba(255,90,90,.35)'; X.beginPath(); X.ellipse(hx - 3.4, hy + 1.2, 1.5, 1, 0, 0, 7); X.ellipse(hx + 5, hy + 1.2, 1.5, 1, 0, 0, 7); X.fill(); break;
        default:
            X.beginPath(); X.moveTo(mx - 1.6, my); X.lineTo(mx + 1.6, my); X.stroke();
    }
}

function drawHat(L, hx, hy, back) {
    switch (L.hat) {
        case 'miner':
            X.beginPath(); X.arc(hx, hy - 1.2, 7.4, Math.PI, 0); X.closePath();
            { const g = X.createRadialGradient(hx - 2.5, hy - 6, 1, hx, hy - 2, 9); g.addColorStop(0, '#fff3a0'); g.addColorStop(.4, '#f2c200'); g.addColorStop(1, '#a07a00'); X.fillStyle = g; X.fill(); }
            X.beginPath(); X.ellipse(hx, hy - 1.2, 8.6, 1.8, 0, 0, 7); X.fillStyle = '#c99a00'; X.fill();
            if (!back) { sph(hx + 3.5, hy - 5, 1.9, 1.9, '#fffbe0'); X.save(); X.globalCompositeOperation = 'lighter'; X.globalAlpha = .25; circ(hx + 3.5, hy - 5, 5, '#fff2a0', 0); X.restore(); }
            break;
        case 'cap':
            X.beginPath(); X.arc(hx, hy - 1, 7.1, Math.PI, 0); X.closePath();
            { const g = X.createRadialGradient(hx - 2.5, hy - 5, 1, hx, hy - 2, 8); g.addColorStop(0, shade(L.capCol, 60)); g.addColorStop(.5, L.capCol); g.addColorStop(1, shade(L.capCol, -50)); X.fillStyle = g; X.fill(); }
            if (!back) { X.beginPath(); X.ellipse(hx + 5, hy - 1, 5, 1.4, .1, 0, 7); X.fillStyle = shade(L.capCol, -30); X.fill(); }
            break;
        case 'police':
            rr(hx - 7, hy - 8.5, 14, 6, 2);
            { const g = X.createLinearGradient(hx - 7, 0, hx + 7, 0); g.addColorStop(0, shade(L.capCol, -30)); g.addColorStop(.4, shade(L.capCol, 30)); g.addColorStop(1, shade(L.capCol, -40)); X.fillStyle = g; X.fill(); }
            if (!back) { X.beginPath(); X.ellipse(hx + 2, hy - 2.4, 7, 1.6, 0, 0, 7); X.fillStyle = '#111'; X.fill(); sph(hx + 1.5, hy - 6, 1.3, 1.6, '#5ab4ff'); }
            break;
        case 'cowboy':
            X.beginPath(); X.ellipse(hx, hy - 3, 11.5, 2.8, -.05, 0, 7); X.fillStyle = '#6b3e1a'; X.fill();
            rr(hx - 5, hy - 10.5, 10, 8, 3);
            { const g = X.createLinearGradient(hx - 5, 0, hx + 5, 0); g.addColorStop(0, '#5a3414'); g.addColorStop(.4, '#9a6630'); g.addColorStop(1, '#4a2a10'); X.fillStyle = g; X.fill(); }
            X.fillStyle = '#2a1608'; X.fillRect(hx - 5, hy - 5, 10, 1.5);
            break;
    }
    if (L.horn) {
        X.save(); X.translate(hx, hy - 7.5); X.rotate(.25);
        X.beginPath(); X.moveTo(-1.8, 0); X.lineTo(0, -7.5); X.lineTo(1.8, 0); X.closePath();
        const g = X.createLinearGradient(-2, 0, 2, 0); g.addColorStop(0, '#c9a020'); g.addColorStop(.5, '#fff0a0'); g.addColorStop(1, '#b08010');
        X.fillStyle = g; X.fill();
        X.strokeStyle = 'rgba(240,120,180,.8)'; X.lineWidth = .7;
        X.beginPath(); X.moveTo(-1.4, -1.5); X.lineTo(1.4, -2.5); X.moveTo(-.9, -3.8); X.lineTo(.9, -4.6); X.stroke();
        X.restore();
    }
}

// Disegna un'action figure snodata con i piedi in (0,0).
function drawChibi(L, P) {
    const A = poseAngles(P), back = P.back, fat = L.fat ? 1 : 0;
    const shirt = P.disguise ? '#22356e' : L.shirt, jacket = P.disguise ? '#22356e' : L.jacket;
    const pants = P.disguise ? '#1c2a55' : L.pants;
    X.save();
    if (P.flip) X.scale(-1, 1);
    X.lineCap = 'round'; X.lineJoin = 'round';

    const hipY = -28, hw = fat ? 4.6 : 3.4;
    const leg = (side, th, kn) => {
        const hx = side * hw, kx = hx + Math.sin(th) * 13, ky = hipY + Math.cos(th) * 13;
        const sa = th - kn, ax = kx + Math.sin(sa) * 13, ay = ky + Math.cos(sa) * 13;
        limb(hx, hipY, kx, ky, fat ? 6.4 : 5.6, pants);
        limb(kx, ky, ax, ay - 1, fat ? 5.6 : 4.8, pants);
        joint(kx, ky, 1.7, shade(pants, -5));
        X.save(); X.translate(ax + 1.5, ay - .8);
        sph(0, 0, 4, 1.9, L.shoes);
        X.restore();
    };
    const lift = Math.max(0, -A.lean) * 0;
    leg(-1, A.thL, A.knL); leg(1, A.thR, A.knR);

    X.save();
    X.translate(0, hipY - lift); X.rotate(A.lean); X.translate(0, -hipY);
    const shY = -47, sw = fat ? 10 : 7.6;
    const arm = (side, sh, el, prop) => {
        const sx = side * sw, ex = sx + Math.sin(sh) * 10.5, ey = shY + Math.cos(sh) * 10.5;
        const fa = sh + el, wx = ex + Math.sin(fa) * 9.5, wy = ey + Math.cos(fa) * 9.5;
        const sleeve = jacket || shirt, fore = jacket ? jacket : L.skin;
        limb(sx, shY, ex, ey, 4.6, sleeve);
        limb(ex, ey, wx, wy, 3.8, fore);
        joint(sx, shY, 2.4, sleeve);
        joint(ex, ey, 1.5, fore);
        X.fillStyle = 'rgba(0,0,0,.35)'; X.beginPath(); X.arc(wx, wy, 1.9, 0, 7); X.fill();
        sph(wx + Math.sin(fa) * 1.2, wy + Math.cos(fa) * 1.2, 2.1, 2.3, L.skin);
        if (prop) {
            X.save(); X.translate(wx + Math.sin(fa) * 2, wy + Math.cos(fa) * 2); X.rotate(-fa * .25); X.scale(.62, .62); drawProp(prop, P); X.restore();
        }
        if (P.fire && side === 1) {
            X.save(); X.globalCompositeOperation = 'lighter';
            for (let k = 0; k < 3; k++) {
                const fl = Math.sin(P.t * 20 + k * 2) * 1.2;
                X.beginPath(); X.ellipse(wx - 1.5 + k * 1.5, wy - 3 - fl, 1.6, 3.4 + fl, 0, 0, 7);
                X.fillStyle = k === 1 ? 'rgba(255,230,120,.9)' : 'rgba(255,120,30,.75)'; X.fill();
            }
            X.restore();
        }
    };
    let propR = L.prop;
    if (P.prop !== undefined) propR = P.prop;
    const farSide = back ? 1 : -1;
    if (farSide === -1) arm(-1, A.shL, A.elL, null); else arm(1, A.shR, A.elR, propR);

    // busto
    const tw = fat ? 22 : 16, ty = shY - 2, th = hipY - ty + 2;
    const tg = X.createLinearGradient(-tw / 2, 0, tw / 2, 0);
    const tc = jacket || shirt;
    tg.addColorStop(0, shade(tc, -45)); tg.addColorStop(.3, shade(tc, 25)); tg.addColorStop(.6, tc); tg.addColorStop(1, shade(tc, -55));
    X.beginPath();
    X.moveTo(-tw / 2, ty + 2); X.quadraticCurveTo(-tw / 2, ty - 1, -tw / 2 + 3, ty - 1); X.lineTo(tw / 2 - 3, ty - 1); X.quadraticCurveTo(tw / 2, ty - 1, tw / 2, ty + 2);
    X.lineTo(tw / 2 - (fat ? -1 : 2), hipY + 2); X.lineTo(-tw / 2 + (fat ? -1 : 2), hipY + 2); X.closePath();
    X.fillStyle = tg; X.fill();
    // cintura
    X.fillStyle = shade(pants, -35); X.fillRect(-tw / 2 + (fat ? -1 : 2), hipY - .5, tw - (fat ? -2 : 4), 2.2);
    if (!back) {
        if (P.disguise) {
            poly([[-2.4, ty - 1], [2.4, ty - 1], [0, ty + 5]], '#cfe6ff');
            poly([[-.8, ty + 1.5], [.8, ty + 1.5], [1.2, ty + 10], [0, ty + 11.5], [-1.2, ty + 10]], '#c62b22');
        } else if (jacket) {
            X.fillStyle = shirt; X.fillRect(-2.6, ty, 5.2, th - 2);
            X.fillStyle = '#ffd84a'; X.font = 'bold 1.8px sans-serif'; X.textAlign = 'center'; X.fillText('E-TEAM', 0, ty + 5);
        } else if (L.sash) {
            X.save(); X.beginPath(); X.rect(-tw / 2, ty - 1, tw, th + 2); X.clip();
            ['#2e9e4f', '#f4f4f4', '#d6362b'].forEach((c, k) => { X.strokeStyle = c; X.lineWidth = 1.8; X.beginPath(); X.moveTo(-tw / 2 + k * 1.8, ty - 1); X.lineTo(tw / 2 + k * 1.8 - 4, hipY + 2); X.stroke(); });
            X.restore();
        } else if (L.mustache) {
            sph(-3.5, ty + 3, 1, 1, '#ffd84a');
        } else {
            X.fillStyle = shirt === '#f4f4f4' ? '#c99a1e' : '#ffd84a'; X.font = 'bold 2.6px sans-serif'; X.textAlign = 'center'; X.fillText('E-TEAM', 0, ty + 6);
        }
        if (L.badge && !P.disguise) {
            X.strokeStyle = '#2a4aa0'; X.lineWidth = .7; X.beginPath(); X.moveTo(-2.6, ty - 1); X.lineTo(0, ty + 8); X.lineTo(2.6, ty - 1); X.stroke();
            rr(-1.4, ty + 7.6, 2.8, 3.4, .4); fs('#fff');
        }
    }

    // testa
    const hx = 0, hy = -57.5;
    limb(0, shY - 1, 0, hy + 5, 3.6, L.skin);
    sph(hx - 6, hy, 1.4, 1.9, L.skin); sph(hx + 6, hy, 1.4, 1.9, L.skin);
    sph(hx, hy, 6.4, 7.4, back && !L.bald ? L.hair : L.skin);
    if (!back) {
        if (L.hat === 'none' && !L.bald) {
            X.beginPath(); X.ellipse(hx, hy - 1, 6.6, 7.4, 0, Math.PI + .15, -.15);
            X.quadraticCurveTo(hx + 3, hy - 4.6, hx - 1, hy - 5); X.quadraticCurveTo(hx - 4.5, hy - 4.6, hx - 6.4, hy - 2.2); X.closePath();
            const g = X.createLinearGradient(hx, hy - 9, hx, hy - 3); g.addColorStop(0, shade(L.hair, 40)); g.addColorStop(1, L.hair);
            X.fillStyle = g; X.fill();
        }
        if (L.bald) { X.strokeStyle = L.hair; X.lineWidth = .8; X.beginPath(); X.moveTo(hx - 5, hy - 4); X.quadraticCurveTo(hx, hy - 8.5, hx + 5.5, hy - 4); X.stroke(); }
        drawFace(L, P, hx, hy);
    }
    drawHat(L, hx, hy, back);
    X.restore(); // lean

    X.save(); X.translate(0, hipY - lift); X.rotate(A.lean); X.translate(0, -hipY);
    if (farSide === -1) arm(1, A.shR, A.elR, propR); else arm(-1, A.shL, A.elL, null);
    X.restore();
    X.restore();
}

// Basetta trasparente da action figure
function drawStand(sx, sy, s = 1) {
    X.save(); X.translate(sx, sy); X.scale(s, s);
    X.beginPath(); X.ellipse(2, 3, 16, 6.5, 0, 0, 7); X.fillStyle = 'rgba(0,0,0,.28)'; X.fill();
    X.beginPath(); X.ellipse(0, 1.5, 13, 5.2, 0, 0, Math.PI); X.lineTo(-13, 0); X.ellipse(0, 0, 13, 5.2, 0, Math.PI, 0, true); X.closePath();
    X.fillStyle = 'rgba(190,225,255,.35)'; X.fill();
    X.beginPath(); X.ellipse(0, 0, 13, 5.2, 0, 0, 7); X.fillStyle = 'rgba(220,240,255,.28)'; X.fill();
    X.strokeStyle = 'rgba(255,255,255,.75)'; X.lineWidth = 1; X.beginPath(); X.ellipse(0, 0, 13, 5.2, 0, Math.PI * 1.05, Math.PI * 1.7); X.stroke();
    X.restore();
}

// Ritratto da foto di prodotto (usato nelle scene se manca lo sprite).
function makePortrait(L, expr = 'normal', size = 160) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const old = X;
    X = c.getContext('2d');
    const g = X.createRadialGradient(size * .4, size * .35, 10, size / 2, size / 2, size * .75);
    g.addColorStop(0, '#f2efe8'); g.addColorStop(1, '#9aa3ad');
    X.fillStyle = g; X.fillRect(0, 0, size, size);
    const s = size / 30;
    X.translate(size / 2, size * .42 + 57.5 * s); X.scale(s, s);
    drawChibi(L, { t: 1, expr, arm: 'idle' });
    X = old;
    return c.toDataURL();
}

// ---------- particelle: cotone, cellophane, cartoncino ----------
function drawParticle(p) {
    const [sx, sy0] = iso(p.x, p.y), sy = sy0 - p.z, k = p.life / p.max, inv = 1 - k;
    X.save(); X.translate(sx, sy);
    switch (p.kind) {
        case 'puff': {
            const r = p.size * (1 + p.grow * k), base = hex6(p.col) || '#dddddd';
            X.globalAlpha = (p.alpha ?? .7) * (k < .15 ? k / .15 : inv) * 1.2;
            for (let n = 0; n < 3; n++) {
                const ox = Math.cos(p.seed + n * 2.1) * r * .45, oy = Math.sin(p.seed + n * 2.1) * r * .3;
                const g = X.createRadialGradient(ox - r * .2, oy - r * .3, r * .1, ox, oy, r * .8);
                g.addColorStop(0, shade(base, 40)); g.addColorStop(.6, base); g.addColorStop(1, shade(base, -40) + '00');
                X.beginPath(); X.arc(ox, oy, r * .8, 0, 7); X.fillStyle = g; X.fill();
            }
            if (p.face) { X.fillStyle = 'rgba(40,60,20,.55)'; X.font = `${r * .9}px sans-serif`; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(p.face, 0, 0); }
            break;
        }
        case 'fire': {
            const r = p.size * inv + 1;
            X.globalCompositeOperation = 'lighter'; X.globalAlpha = inv * .85;
            X.beginPath(); X.ellipse(0, 0, r * .8, r * 1.2, 0, 0, 7);
            X.fillStyle = k < .3 ? 'rgba(255,240,170,.9)' : k < .6 ? 'rgba(255,160,40,.8)' : 'rgba(230,70,20,.7)'; X.fill();
            break;
        }
        case 'spark':
            X.globalCompositeOperation = 'lighter'; X.globalAlpha = inv; X.fillStyle = p.col; X.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            break;
        case 'debris':
            X.rotate(p.rot); rr(-p.size, -p.size / 2, p.size * 2, p.size, .5); fs(p.col);
            break;
        case 'confetti':
            X.rotate(p.rot); X.scale(Math.cos(p.rot * 3), 1); X.fillStyle = p.col; X.fillRect(-3, -2, 6, 4);
            X.fillStyle = 'rgba(255,255,255,.35)'; X.fillRect(-3, -2, 6, 1);
            break;
        case 'bubble':
            X.globalAlpha = inv; X.beginPath(); X.arc(Math.sin(p.life * 8 + p.seed) * 3, 0, p.size, 0, 7);
            X.fillStyle = p.col; X.fill(); X.strokeStyle = 'rgba(255,255,255,.9)'; X.lineWidth = .8; X.stroke();
            X.fillStyle = 'rgba(255,255,255,.8)'; X.fillRect(-p.size * .4, -p.size * .5, 1.2, 1.2);
            break;
        case 'star': {
            X.globalAlpha = Math.min(1, inv * 2); X.rotate(p.rot);
            X.beginPath();
            for (let i = 0; i < 10; i++) { const r = i % 2 ? p.size * .45 : p.size, a = i * Math.PI / 5; X.lineTo(Math.sin(a) * r, -Math.cos(a) * r); }
            X.closePath(); X.shadowColor = 'rgba(0,0,0,.4)'; X.shadowOffsetX = 1.5; X.shadowOffsetY = 2; X.fillStyle = p.col || '#ffd84a'; X.fill();
            break;
        }
        case 'text': case 'pop': {
            const pop = p.kind === 'pop';
            const s = pop ? (k < .12 ? k / .12 * 1.2 : k < .22 ? 1.2 - (k - .12) * 2 : 1) : 1;
            X.globalAlpha = pop ? (k > .75 ? (1 - k) / .25 : 1) : Math.min(1, inv * 2);
            X.rotate(p.rot || 0); X.scale(s, s);
            const sz = pop ? p.size : p.size * (1 + k * .4);
            X.font = `900 ${sz}px Impact, "Arial Black", sans-serif`; X.textAlign = 'center'; X.textBaseline = 'middle';
            // lettere di cartoncino ritagliate
            X.shadowColor = 'rgba(0,0,0,.45)'; X.shadowOffsetX = 2.5; X.shadowOffsetY = 3.5; X.shadowBlur = 3;
            X.lineJoin = 'round'; X.lineWidth = pop ? 6 : 3; X.strokeStyle = '#f7f1e3'; X.strokeText(p.txt, 0, 0);
            X.shadowColor = 'transparent';
            X.fillStyle = p.col; X.fillText(p.txt, 0, 0);
            X.lineWidth = .8; X.strokeStyle = shade(hex6(p.col) || '#888888', -70); X.strokeText(p.txt, 0, 0);
            break;
        }
    }
    X.restore();
}

function wrapText(txt, maxW) {
    const words = txt.split(' '), lines = [];
    let cur = '';
    for (const w of words) {
        const t = cur ? cur + ' ' + w : w;
        if (X.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
    }
    if (cur) lines.push(cur);
    return lines;
}

// Fumetto di carta ritagliata con ombra portata.
function drawBubble(sx, sy, txt, age, shout) {
    X.save();
    const s = Math.min(1, age * 7);
    X.translate(sx, sy); X.scale(s, s); X.rotate((hash(txt.length, 3) - .5) * .08);
    X.font = (shout ? 'bold 13px ' : 'bold 12px ') + '"Marker Felt", "Chalkboard SE", "Comic Sans MS", sans-serif';
    const lines = wrapText(txt, 150), lh = 15;
    const w = Math.max(...lines.map(l => X.measureText(l).width)) + 18, h = lines.length * lh + 10;
    const x = -w / 2, y = -h - 12;
    X.beginPath();
    X.moveTo(x + 6, y); X.lineTo(x + w - 6, y); X.lineTo(x + w, y + 5); X.lineTo(x + w - 1, y + h - 4); X.lineTo(x + w - 7, y + h);
    X.lineTo(6, y + h); X.lineTo(-1, y + h + 11); X.lineTo(-4, y + h);
    X.lineTo(x + 5, y + h); X.lineTo(x, y + h - 6); X.lineTo(x + 1, y + 4); X.closePath();
    X.shadowColor = 'rgba(0,0,0,.4)'; X.shadowOffsetX = 2.5; X.shadowOffsetY = 3.5; X.shadowBlur = 3;
    X.fillStyle = shout ? '#fff2c8' : '#f7f1e3'; X.fill();
    X.shadowColor = 'transparent';
    X.lineWidth = .8; X.strokeStyle = '#b9a888'; X.stroke();
    X.fillStyle = '#2b2420'; X.textAlign = 'center'; X.textBaseline = 'top';
    lines.forEach((l, i) => X.fillText(l, 0, y + 6 + i * lh));
    X.restore();
}

// ---------- oggetti di scena (modellismo) ----------
const TREES = [];
function treeCanvas(v) {
    if (TREES[v]) return TREES[v];
    const c = document.createElement('canvas'), W = 90, H = 100;
    c.width = W; c.height = H;
    const old = X; X = c.getContext('2d');
    const r = rng(v * 7919 + 13);
    limb(45, 98, 45, 60, 4, '#6a4626');
    limb(45, 72, 36, 58, 2, '#6a4626'); limb(45, 68, 55, 56, 2, '#6a4626');
    const blobs = [[45, 38, 24, 22], [32, 50, 15, 13], [58, 50, 15, 13], [44, 22, 14, 12]];
    const greens = ['#2f6b2a', '#3d8a34', '#4f9e3e', '#66b24c', '#2a5a24'];
    for (let n = 0; n < 1100; n++) {
        const [bx, by, rx, ry] = blobs[Math.floor(r() * blobs.length)];
        const a = r() * 7, d = Math.sqrt(r());
        const x = bx + Math.cos(a) * rx * d, y = by + Math.sin(a) * ry * d;
        const light = (x - 30) * -.6 + (y - 20) * -.9;
        X.fillStyle = shade(greens[Math.floor(r() * greens.length)], Math.round(light * .5 + 10));
        X.beginPath(); X.arc(x, y, 1 + r() * 2.2, 0, 7); X.fill();
    }
    X = old;
    return (TREES[v] = c);
}

function drawTree(i, j) {
    const [sx, sy] = iso(i + .5, j + .5);
    X.beginPath(); X.ellipse(sx + 6, sy + 2, 20, 8, 0, 0, 7); X.fillStyle = 'rgba(0,0,0,.25)'; X.fill();
    if (drawSpriteAt('prop-bush', sx, sy, 64)) return;
    X.drawImage(treeCanvas(Math.floor(hash(i, j) * 3)), sx - 45, sy - 97);
}

function drawSpriteAt(name, sx, sy, h) {
    if (!SPR[name]) return false;
    X.save(); X.translate(sx, sy); drawSprite(name, h); X.restore();
    return true;
}

function hash(i, j) { const n = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return n - Math.floor(n); }

function glossBox(x0, y0, x1, y1, h, c) {
    box(x0, y0, x1, y1, h, shade(c, 30), shade(c, -5), shade(c, -40));
    const a = iso(x0 + .1, y1 - .2), b = iso(x1 - .2, y1 - .2);
    X.strokeStyle = 'rgba(255,255,255,.55)'; X.lineWidth = 1.4; X.beginPath(); X.moveTo(a[0], a[1] - h + 1); X.lineTo(b[0], b[1] - h + 1); X.stroke();
}

function drawProp3D(kind, i, j) {
    const [sx, sy] = iso(i + .5, j + .5);
    switch (kind) {
        case 'car': {
            if (drawSpriteAt('prop-car', sx, sy + 6, 46)) return;
            X.beginPath(); X.ellipse(sx + 3, sy + 3, 26, 11, 0, 0, 7); X.fillStyle = 'rgba(0,0,0,.28)'; X.fill();
            const cols = ['#b8231c', '#1f4fb8', '#e0a01e', '#2a8a48', '#5a2ab0', '#e8e8e8'], c = cols[Math.floor(hash(i, j) * cols.length)];
            [[i + .25, j + .9], [i + .8, j + .9], [i + .9, j + .3]].forEach(([x, y]) => { const [a, b] = iso(x, y); sph(a, b - 3, 4, 3.6, '#222'); sph(a, b - 3, 1.6, 1.4, '#ccc'); });
            glossBox(i + .08, j + .12, i + .92, j + .88, 12, c);
            X.save(); X.translate(0, -12);
            const gw = X.createLinearGradient(0, sy - 10, 0, sy + 10); gw.addColorStop(0, '#cfe4f2'); gw.addColorStop(.5, '#5f7f99'); gw.addColorStop(1, '#2c3e50');
            box(i + .3, j + .28, i + .72, j + .7, 8, shade(c, 35), gw, gw);
            X.restore();
            const [a, b] = iso(i + .32, j + .7);
            X.strokeStyle = 'rgba(255,255,255,.7)'; X.lineWidth = 1.2; X.beginPath(); X.moveTo(a + 3, b - 13); X.lineTo(a + 7, b - 19); X.stroke();
            break;
        }
        case 'barrel': {
            if (drawSpriteAt('prop-barrel', sx, sy + 4, 44)) return;
            X.beginPath(); X.ellipse(sx + 4, sy + 2, 16, 7, 0, 0, 7); X.fillStyle = 'rgba(0,0,0,.28)'; X.fill();
            const g = X.createLinearGradient(sx - 13, 0, sx + 13, 0);
            g.addColorStop(0, '#5a3418'); g.addColorStop(.35, '#b8824a'); g.addColorStop(1, '#4a2a12');
            rr(sx - 13, sy - 30, 26, 30, 9); X.fillStyle = g; X.fill();
            [-26, -16, -6].forEach(o => { const m = X.createLinearGradient(sx - 13, 0, sx + 13, 0); m.addColorStop(0, '#333'); m.addColorStop(.35, '#bbb'); m.addColorStop(1, '#222'); X.fillStyle = m; X.fillRect(sx - 13, sy + o, 26, 2.5); });
            X.beginPath(); X.ellipse(sx, sy - 30, 13, 5, 0, 0, 7); X.fillStyle = '#9a6a3a'; X.fill();
            break;
        }
        case 'table': {
            if (drawSpriteAt('prop-table', sx, sy + 6, 44)) return;
            X.beginPath(); X.ellipse(sx + 3, sy + 2, 24, 10, 0, 0, 7); X.fillStyle = 'rgba(0,0,0,.22)'; X.fill();
            [[i + .15, j + .85], [i + .85, j + .85], [i + .85, j + .15]].forEach(([x, y]) => { const [a, b] = iso(x, y); limb(a, b, a, b - 18, 2.4, '#6e4520'); });
            X.save(); X.translate(0, -18);
            box(i + .1, j + .1, i + .9, j + .9, 3, pattern('wood', '#c8945a', 'floor'), '#8a5a2b', '#6e4520');
            X.restore();
            const [a, b] = iso(i + .4, j + .5);
            X.save(); X.translate(a, b - 21); X.scale(.8, .8); drawProp('mug', {}); X.restore();
            X.save(); X.translate(a + 14, b - 22); X.rotate(1.2); X.scale(.7, .7); drawProp('skewer', {}); X.restore();
            break;
        }
    }
}

function drawBarricade(i, j) {
    const [sx, sy] = iso(i + .5, j + .5);
    if (drawSpriteAt('prop-barricade', sx, sy + 8, 56)) return;
    box(i, j + .3, i + 1, j + .7, 30, pattern('wood', '#a8763f', 'floor'), '#8a5a2b', '#6e4520');
    X.save();
    X.translate(sx - 8, sy - 14); X.rotate(-.12);
    X.shadowColor = 'rgba(0,0,0,.35)'; X.shadowOffsetY = 2;
    rr(-28, -5, 56, 10, 1); X.fillStyle = '#f2c618'; X.fill(); X.shadowColor = 'transparent';
    X.fillStyle = '#1a1a1a';
    for (let k = -26; k < 26; k += 8) { X.beginPath(); X.moveTo(k, -5); X.lineTo(k + 4, -5); X.lineTo(k, 5); X.lineTo(k - 4, 5); X.fill(); }
    rr(-20, -3.5, 40, 7, 1); X.fillStyle = '#f2c618'; X.fill();
    X.fillStyle = '#1a1a1a'; X.font = 'bold 6px sans-serif'; X.textAlign = 'center'; X.fillText('SEQUESTRATO', 0, 2.2);
    X.restore();
}

function drawDoor(i, j, t) {
    box(i, j, i + 1, j + 1, 44, '#5a6c8a', '#3d5a8a', '#2c4470');
    const [sx, sy] = iso(i + .5, j + 1);
    const g = X.createLinearGradient(sx - 8, 0, sx + 5, 0); g.addColorStop(0, '#1a2a4a'); g.addColorStop(.4, '#3a5a8a'); g.addColorStop(1, '#16223a');
    rr(sx - 8, sy - 40, 13, 30, 1.5); X.fillStyle = g; X.fill();
    X.fillStyle = '#e8c84a'; X.font = 'bold 7px sans-serif'; X.textAlign = 'center'; X.fillText('STAFF', sx - 1.5, sy - 31);
    sph(sx + 2, sy - 22, 1.5, 1.5, '#e8c84a');
    const on = Math.sin(t * 3 + i) > 0;
    sph(sx - 2, sy - 44, 2.6, 2.6, on ? '#ff3a3a' : '#601818');
    if (on) { X.save(); X.globalCompositeOperation = 'lighter'; X.globalAlpha = .35; circ(sx - 2, sy - 44, 8, '#ff4040', 0); X.restore(); }
}

function drawObjective(o, i, j, t, theme) {
    const [sx, sy] = iso(i + .5, j + .5), done = o && o.done;
    switch (o ? o.kind : theme.obj) {
        case 'tap': {
            box(i - .4, j + .1, i + 1.4, j + .9, 22, pattern('wood', '#7a4a28', 'floor'), '#5f381d', '#4a2c16');
            if (drawSpriteAt('prop-beer-tap', sx, sy - 18, 44)) break;
            const g = X.createLinearGradient(sx - 5, 0, sx + 5, 0); g.addColorStop(0, '#8a6a1a'); g.addColorStop(.4, '#fff0a0'); g.addColorStop(1, '#7a5a10');
            rr(sx - 5, sy - 52, 10, 30, 3); X.fillStyle = g; X.fill();
            X.save(); X.translate(sx, sy - 52); X.rotate(done ? .6 : -.2); limb(0, 0, 0, -15, 4, done ? '#2a8a48' : '#b8231c'); X.restore();
            limb(sx + 4, sy - 40, sx + 13, sy - 40, 3.5, '#c8a040');
            if (done) { X.fillStyle = 'rgba(240,190,60,.85)'; X.fillRect(sx + 11, sy - 38, 2.5, 12); }
            break;
        }
        case 'tank': {
            if (drawSpriteAt('brewery-tank', sx, sy + 8, 92)) break;
            X.beginPath(); X.ellipse(sx + 5, sy + 2, 26, 10, 0, 0, 7); X.fillStyle = 'rgba(0,0,0,.3)'; X.fill();
            const g = X.createLinearGradient(sx - 20, 0, sx + 20, 0);
            g.addColorStop(0, '#5a646c'); g.addColorStop(.25, '#f4f8fa'); g.addColorStop(.45, '#aab6be'); g.addColorStop(.8, '#d4dde2'); g.addColorStop(1, '#4a545c');
            rr(sx - 20, sy - 74, 40, 70, 12); X.fillStyle = g; X.fill();
            X.beginPath(); X.ellipse(sx, sy - 74, 20, 8, 0, 0, 7); X.fillStyle = '#e8eef2'; X.fill();
            sph(sx + 6, sy - 40, 6, 6, '#eeeeee');
            X.save(); X.translate(sx + 6, sy - 40); X.rotate(done ? Math.sin(t * 4) * .8 : -.8);
            X.strokeStyle = '#c62b22'; X.lineWidth = 1.2; X.beginPath(); X.moveTo(0, 0); X.lineTo(0, -4.5); X.stroke(); X.restore();
            if (!done) {
                X.strokeStyle = 'rgba(242,198,24,.95)'; X.lineWidth = 5;
                X.beginPath(); X.moveTo(sx - 20, sy - 60); X.lineTo(sx + 20, sy - 20); X.moveTo(sx + 20, sy - 60); X.lineTo(sx - 20, sy - 20); X.stroke();
            }
            break;
        }
        case 'grill': {
            if (drawSpriteAt('grill-big', sx, sy + 8, 64)) break;
            box(i - .3, j + .05, i + 1.3, j + .95, 24, '#3a3a3a', '#222', '#111');
            X.strokeStyle = '#999'; X.lineWidth = 1;
            for (let k = 0; k < 6; k++) { const [a, b] = iso(i - .2 + k * .27, j + .1), [c, d] = iso(i - .2 + k * .27, j + .9); X.beginPath(); X.moveTo(a, b - 24); X.lineTo(c, d - 24); X.stroke(); }
            if (done) for (let k = 0; k < 4; k++) {
                const [a, b] = iso(i + .1 + k * .25, j + .5);
                X.strokeStyle = '#c8a070'; X.lineWidth = 1.2; X.beginPath(); X.moveTo(a - 9, b - 27); X.lineTo(a + 9, b - 27); X.stroke();
                rr(a - 6, b - 29, 12, 4, 1.5); fs('#7a3418');
            }
            break;
        }
        case 'valve': case 'contract': case 'reception': case 'boiler': case 'sacks': case 'panel': case 'crate': case 'safe':
            drawStation(o.kind, i, j, sx, sy, t, done);
            break;
        case 'desk':
            box(i - .3, j + .1, i + 1.3, j + .9, 20, pattern('wood', '#8a5a2b', 'floor'), '#6e4520', '#5a381a');
            X.save(); X.shadowColor = 'rgba(0,0,0,.3)'; X.shadowOffsetY = 1.5;
            rr(sx - 9, sy - 26, 16, 10, .5); X.fillStyle = '#fbf8ee'; X.fill(); X.restore();
            if (done) {
                X.save(); X.translate(sx - 1, sy - 21); X.rotate(-.3);
                X.strokeStyle = '#c62b22'; X.lineWidth = 1.2; X.strokeRect(-7, -3.5, 14, 7);
                X.fillStyle = '#c62b22'; X.font = 'bold 4.5px sans-serif'; X.textAlign = 'center'; X.fillText('FIRMATO', 0, 1.5); X.restore();
            } else limb(sx + 6, sy - 22, sx + 14, sy - 36, 1.4, '#222222');
            break;
    }
    if (!done) {
        const ready = !o || typeof stepReady !== 'function' || stepReady(o);
        const b = ready ? Math.sin(t * 5) * 6 : 0, ay = sy - (o && o.kind === 'tank' ? 100 : 76);
        X.save(); X.translate(sx, ay + b);
        X.shadowColor = 'rgba(0,0,0,.4)'; X.shadowOffsetX = 2; X.shadowOffsetY = 3; X.shadowBlur = 2;
        if (ready) poly([[-10, -11], [10, -11], [0, 4]], '#f2c618');
        else { rr(-7, -6, 14, 11, 2); X.fillStyle = '#8a8f96'; X.fill(); X.shadowColor = 'transparent'; X.strokeStyle = '#8a8f96'; X.lineWidth = 2.4; X.beginPath(); X.arc(0, -6, 4.5, Math.PI, 0); X.stroke(); }
        X.restore();
    }
}

function drawSign(s, t) {
    const [sx, sy] = iso(s.x, s.y), sw = Math.sin(t * 1.2) * .03;
    limb(sx, sy, sx, sy - 150, 5, '#777777');
    X.save(); X.translate(sx, sy - 170); X.rotate(sw);
    X.shadowColor = 'rgba(0,0,0,.35)'; X.shadowOffsetX = 3; X.shadowOffsetY = 4; X.shadowBlur = 4;
    rr(-70, -32, 140, 64, 6); X.fillStyle = '#f4ecd8'; X.fill(); X.shadowColor = 'transparent';
    X.lineWidth = 2; X.strokeStyle = '#9b1b30'; X.stroke();
    X.textAlign = 'center'; X.fillStyle = '#9b1b30';
    X.font = 'italic bold 32px Georgia,serif'; X.fillText(s.title, -8, 6);
    X.font = 'italic 15px Georgia,serif'; X.fillText(s.sub, 38, 22);
    const on = Math.sin(t * 6) > -.3;
    rr(-56, 26, 112, 16, 5); X.fillStyle = on ? '#ff3d7f' : '#6a1d3d'; X.fill();
    X.fillStyle = on ? '#fff' : '#caa'; X.font = 'bold 10px sans-serif'; X.fillText('♪ ' + s.tag + ' ♪', 0, 38);
    if (on) { X.save(); X.globalCompositeOperation = 'lighter'; X.globalAlpha = .25; rr(-62, 20, 124, 28, 10); X.fillStyle = '#ff3d7f'; X.fill(); X.restore(); }
    X.restore();
}

// ---------- diorama: base di legno, fondale da studio, post-produzione ----------
function drawDiorama(W, H, th) {
    const D = 36, a = iso(0, H), b = iso(W, H), c = iso(W, 0);
    const down = p => [p[0], p[1] + D];
    X.beginPath(); X.ellipse((a[0] + c[0]) / 2 + 20, (a[1] + c[1]) / 2 + D + 30, (c[0] - a[0]) * .62, (b[1] - c[1]) * .9, 0, 0, 7);
    X.fillStyle = 'rgba(0,0,0,.35)'; X.fill();
    poly([a, b, down(b), down(a)], pattern('woodside', '#6b4a2c', 'L'));
    X.fillStyle = 'rgba(0,0,0,.08)'; X.fill();
    poly([b, c, down(c), down(b)], pattern('woodside', '#5a3c22', 'R'));
    X.fillStyle = 'rgba(0,0,0,.25)'; X.fill();
    X.strokeStyle = 'rgba(255,230,190,.35)'; X.lineWidth = 1.2; X.beginPath(); X.moveTo(...a); X.lineTo(...b); X.lineTo(...c); X.stroke();
    if (th.plate) {
        const m = iso(W / 2, H);
        X.save(); X.translate(m[0] - 40, m[1] - 20 + D / 2); X.transform(1, .5, 0, 1, 0, 0);
        const g = X.createLinearGradient(-60, 0, 60, 0); g.addColorStop(0, '#8a6a20'); g.addColorStop(.4, '#f6e08a'); g.addColorStop(1, '#7a5a10');
        rr(-62, -9, 124, 18, 2); X.fillStyle = g; X.fill();
        X.fillStyle = '#3a2a08'; X.font = 'bold 9px Georgia,serif'; X.textAlign = 'center'; X.fillText('E-TEAM · ' + th.plate, 0, 3.5);
        X.restore();
    }
}

let BOKEH = null;
function drawBackdrop(cw, ch, th) {
    const g = X.createRadialGradient(cw * .5, ch * .35, 50, cw * .5, ch * .5, Math.max(cw, ch) * .8);
    g.addColorStop(0, shade(th.sky[1], -10)); g.addColorStop(.6, shade(th.sky[0], -50)); g.addColorStop(1, '#16141a');
    X.fillStyle = g; X.fillRect(0, 0, cw, ch);
    if (!BOKEH || BOKEH.w !== cw || BOKEH.h !== ch) {
        const r = rng(cw * 7 + ch);
        BOKEH = { w: cw, h: ch, list: Array.from({ length: 22 }, () => [r() * cw, r() * ch * .6, 8 + r() * 30, r()]) };
    }
    X.save(); X.globalCompositeOperation = 'lighter';
    BOKEH.list.forEach(([x, y, r, k]) => { X.beginPath(); X.arc(x, y, r, 0, 7); X.fillStyle = `rgba(255,${200 + k * 40 | 0},${150 + k * 80 | 0},${.04 + k * .05})`; X.fill(); });
    X.restore();
}

let GRAIN = null, BLUR = null, BLUR_OK = null;
function postProcess(cv, ctx, cw, ch, dpr, frame) {
    // tilt-shift: sfoca alto e basso come un obiettivo macro
    if (BLUR_OK === null) { const t = document.createElement('canvas').getContext('2d'); t.filter = 'blur(2px)'; BLUR_OK = t.filter === 'blur(2px)'; }
    if (BLUR_OK) {
        if (!BLUR || BLUR.width !== cv.width || BLUR.height !== cv.height) { BLUR = document.createElement('canvas'); BLUR.width = cv.width; BLUR.height = cv.height; }
        const b = BLUR.getContext('2d');
        b.globalCompositeOperation = 'copy'; b.filter = `blur(${3 * dpr}px)`; b.drawImage(cv, 0, 0); b.filter = 'none';
        b.globalCompositeOperation = 'destination-in';
        const m = b.createLinearGradient(0, 0, 0, cv.height);
        m.addColorStop(0, 'rgba(0,0,0,1)'); m.addColorStop(.28, 'rgba(0,0,0,0)'); m.addColorStop(.72, 'rgba(0,0,0,0)'); m.addColorStop(1, 'rgba(0,0,0,1)');
        b.fillStyle = m; b.fillRect(0, 0, cv.width, cv.height);
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(BLUR, 0, 0);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // luce da set: tono caldo, vignettatura, sfarfallio
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = 'rgba(255,170,90,.18)'; ctx.fillRect(0, 0, cw, ch);
    ctx.globalCompositeOperation = 'source-over';
    const v = ctx.createRadialGradient(cw / 2, ch / 2, Math.min(cw, ch) * .35, cw / 2, ch / 2, Math.max(cw, ch) * .75);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, cw, ch);
    ctx.fillStyle = `rgba(0,0,0,${hash(frame, 1) * .05})`; ctx.fillRect(0, 0, cw, ch);
    // grana della pellicola
    if (!GRAIN) {
        GRAIN = document.createElement('canvas'); GRAIN.width = GRAIN.height = 160;
        const g = GRAIN.getContext('2d'), d = g.createImageData(160, 160);
        for (let i = 0; i < d.data.length; i += 4) { const n = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = n; d.data[i + 3] = 22; }
        g.putImageData(d, 0, 0);
    }
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = ctx.createPattern(GRAIN, 'repeat');
    ctx.translate(-hash(frame, 2) * 160, -hash(frame, 3) * 160);
    ctx.fillRect(0, 0, cw + 160, ch + 160);
    ctx.restore();
}

// ---------- postazioni degli step ----------
function metal(x0, x1, dark) {
    const g = X.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, shade(dark, -30)); g.addColorStop(.3, shade(dark, 60)); g.addColorStop(.6, dark); g.addColorStop(1, shade(dark, -50));
    return g;
}
function drawStation(kind, i, j, sx, sy, t, done) {
    X.beginPath(); X.ellipse(sx + 4, sy + 2, 20, 8, 0, 0, 7); X.fillStyle = 'rgba(0,0,0,.25)'; X.fill();
    switch (kind) {
        case 'valve': // bombola CO2
            [-9, 0, 9].forEach((dx, k) => {
                rr(sx + dx - 5, sy - 46 + k * 3, 10, 44 - k * 3, 5); X.fillStyle = metal(sx + dx - 5, sx + dx + 5, k === 1 ? '#4a7a5a' : '#6a7078'); X.fill();
                ellp(sx + dx, sy - 46 + k * 3, 5, 2, '#9aa0a6');
            });
            X.save(); X.translate(sx, sy - 52); X.rotate(done ? t * 4 : 0);
            X.strokeStyle = done ? '#2a8a48' : '#c62b22'; X.lineWidth = 2.4; X.beginPath(); X.arc(0, 0, 5, 0, 7); X.moveTo(-5, 0); X.lineTo(5, 0); X.moveTo(0, -5); X.lineTo(0, 5); X.stroke();
            X.restore();
            break;
        case 'contract':
        case 'reception':
            box(i - .2, j + .15, i + 1.2, j + .85, 22, pattern('wood', kind === 'reception' ? '#d9c9a8' : '#8a5a2b', 'floor'), kind === 'reception' ? '#b8a684' : '#6e4520', kind === 'reception' ? '#9a8a6a' : '#5a381a');
            X.save(); X.shadowColor = 'rgba(0,0,0,.3)'; X.shadowOffsetY = 1.5;
            rr(sx - 10, sy - 30, 14, 9, .5); X.fillStyle = '#fbf8ee'; X.fill(); X.restore();
            X.fillStyle = '#555'; X.font = 'bold 3px sans-serif'; X.textAlign = 'center';
            X.fillText(kind === 'reception' ? 'REGISTRO' : 'CONTRATTO', sx - 3, sy - 24.5);
            if (kind === 'reception') { sph(sx + 9, sy - 26, 4, 3, '#e8c84a'); sph(sx + 9, sy - 29.5, 1, 1, '#e8c84a'); }
            else limb(sx + 6, sy - 26, sx + 13, sy - 37, 1.3, '#222222');
            if (done) {
                X.save(); X.translate(sx - 3, sy - 26); X.rotate(-.3);
                X.strokeStyle = '#2a8a48'; X.lineWidth = 1; X.strokeRect(-6, -3, 12, 6);
                X.fillStyle = '#2a8a48'; X.font = 'bold 3.6px sans-serif'; X.textAlign = 'center'; X.fillText('APPROVATO', 0, 1.3); X.restore();
            }
            break;
        case 'boiler':
            box(i - .15, j + .1, i + 1.15, j + .95, 40, '#3a3a3a', '#2a2a2a', '#1a1a1a');
            limb(sx + 10, sy - 40, sx + 10, sy - 70, 6, '#555555');
            rr(sx - 12, sy - 26, 12, 12, 2); X.fillStyle = '#111'; X.fill();
            if (done) {
                X.save(); X.globalCompositeOperation = 'lighter';
                const f = 4 + Math.sin(t * 14) * 1.5;
                rr(sx - 11, sy - 25, 10, 10, 2); X.fillStyle = 'rgba(255,120,30,.9)'; X.fill();
                circ(sx - 6, sy - 20, f, 'rgba(255,230,120,.8)', 0);
                X.globalAlpha = .3; circ(sx - 6, sy - 20, 16, '#ff7a1a', 0); X.restore();
            }
            sph(sx + 2, sy - 34, 3.5, 3.5, '#e8e8e8');
            X.strokeStyle = '#c62b22'; X.lineWidth = 1; X.beginPath(); X.moveTo(sx + 2, sy - 34); X.lineTo(sx + 2 + (done ? 2.5 : -2), sy - 36.5); X.stroke();
            break;
        case 'sacks':
            [[-10, 2], [8, 3], [-1, -6]].forEach(([dx, dy], k) => {
                if (done && k === 2) return;
                const x = sx + dx, y = sy + dy;
                sph(x, y - 10, 9, 11, '#b8955a');
                X.fillStyle = 'rgba(70,40,10,.25)'; for (let n = 0; n < 6; n++) X.fillRect(x - 6 + n * 2, y - 18, .6, 14);
                limb(x, y - 21, x, y - 25, 3, '#8a6a3a');
                X.fillStyle = '#3f7a2a'; X.font = 'bold 4px sans-serif'; X.textAlign = 'center'; X.fillText('HOPS', x, y - 9);
            });
            break;
        case 'panel':
            box(i + .15, j + .1, i + .85, j + .6, 46, '#8a9098', '#6a7078', '#4a5058');
            for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
                const on = done ? (r + c) % 2 === 0 : Math.sin(t * 6 + r * 2 + c) > 0;
                sph(sx - 9 + c * 5, sy - 38 + r * 6, 1.6, 1.6, done ? '#3fdc6a' : on ? '#ff3a3a' : '#601818');
            }
            rr(sx + 4, sy - 40, 6, 14, 1); X.fillStyle = '#222'; X.fill();
            X.fillStyle = '#ffd23f'; X.font = 'bold 3.5px sans-serif'; X.textAlign = 'center'; X.fillText(done ? 'OFF' : 'SIGILLI', sx - 4, sy - 16);
            break;
        case 'crate':
            box(i + .1, j + .1, i + .9, j + .9, 18, pattern('wood', '#9a6a3a', 'floor'), '#7a4a22', '#5a3416');
            if (!done) for (let n = 0; n < 9; n++) sph(sx - 9 + (n % 3) * 9 + (n > 2 ? 2 : 0), sy - 20 - Math.floor(n / 3) * 2.5, 3.5, 2.6, '#2a2a2a');
            break;
        case 'safe':
            box(i + .1, j + .15, i + .9, j + .85, 30, '#6a7078', '#4a5058', '#3a3f46');
            sph(sx - 4, sy - 16, 5, 5, '#c8ccd2');
            X.strokeStyle = '#222'; X.lineWidth = 1; X.beginPath(); X.moveTo(sx - 4, sy - 16); X.lineTo(sx - 4 + Math.cos(done ? 1 : t) * 4, sy - 16 + Math.sin(done ? 1 : t) * 4); X.stroke();
            if (done) { rr(sx + 2, sy - 26, 9, 14, 1); X.fillStyle = '#111'; X.fill(); }
            break;
    }
}

function drawVent(i, j) {
    const [sx, sy] = iso(i + .5, j + 1);
    X.save(); X.translate(sx, sy - 12); X.transform(1, -.5, 0, 1, 0, 0);
    rr(-9, -9, 18, 11, 1.5); X.fillStyle = '#1a1a1a'; X.fill();
    X.strokeStyle = '#9aa0a6'; X.lineWidth = 1.4; X.strokeRect(-9, -9, 18, 11);
    for (let k = -6; k <= 6; k += 3) { X.beginPath(); X.moveTo(k, -9); X.lineTo(k, 2); X.stroke(); }
    X.restore();
    X.fillStyle = '#f2c618'; X.font = 'bold 6px sans-serif'; X.textAlign = 'center'; X.fillText('SOLO ALCAN', sx, sy - 26);
}

function drawGate(i, j, t) {
    const a = iso(i, j + .5), b = iso(i + 1, j + .5);
    for (let k = 0; k <= 4; k++) {
        const x = a[0] + (b[0] - a[0]) * k / 4, y = a[1] + (b[1] - a[1]) * k / 4;
        limb(x, y, x, y - 40, 2.4, '#3a3f46');
        sph(x, y - 41, 1.8, 1.8, '#c8a040');
    }
    limb(a[0], a[1] - 34, b[0], b[1] - 34, 2.4, '#3a3f46');
    limb(a[0], a[1] - 10, b[0], b[1] - 10, 2.4, '#3a3f46');
    const m = iso(i + .5, j + .5);
    sph(m[0], m[1] - 22, 3.2, 3.8, '#c8a040');
}
