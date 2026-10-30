'use strict';
// Sistemi di gioco: cattura, allarme, battute, pagella, azione coordinata, rumore, indizi, segreti, salvataggi.

// ---------- persistenza ----------
const STORE = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem('eteam-' + k)); return v ?? d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('eteam-' + k, JSON.stringify(v)); } catch (e) { /* storage pieno o disabilitato */ } },
};

// ---------- livelli di difficoltà ----------
const DIFF = {
    facile: { name: 'Facile', icon: '🍼', detect: .6, range: -1, gspeed: .9, alarm: 15, charges: c => -1, desc: 'Abilità infinite, guardie distratte. Per ridere e basta.' },
    normale: { name: 'Normale', icon: '🍺', detect: 1, range: 0, gspeed: 1, alarm: 25, charges: c => c, desc: 'Cariche limitate, guardie attente. L\'esperienza consigliata.' },
    commandos: { name: 'Commandos', icon: '💀', detect: 1.4, range: 1, gspeed: 1.15, alarm: 40, charges: c => Math.max(2, c - 1), desc: 'Poche cariche, guardie con occhi da falco. Solo per veri sobri... ehm, duri.' },
};
const curDiff = () => STORE.get('diff', 'normale');
function setDiff(d) { STORE.set('diff', d); showTitle(); }

function initSystems(m) {
    G.diff = curDiff();
    G.chars.forEach(c => { c.charges = c.ab.map(a => DIFF[G.diff].charges(a.charges)); c.running = false; c.noiseT = 0; });
    G.alarm = 0;
    G.stats = { captures: 0, alarms: 0, hints: 0, knocked: 0, gasMax: 0, jokeMax: 0, punches: 0, fled: 0, wowMax: 0, secrets: 0, syncMax: 0 };
    G.secrets = (m.secrets || []).map(([x, y]) => ({ x: x + .5, y: y + .5, found: false }));
    G.plan = false; G.queue = {}; G.preview = -1;
    G.banterT = 6; G.pairT = rnd(25, 40);
}

function tickSystems(dt) {
    G.alarm = Math.max(0, G.alarm - dt);
    G.banterT -= dt;
    G.pairT -= dt;
    if (G.pairT <= 0) { G.pairT = rnd(35, 55); idlePair(); }
    tickSecrets();
    const max = Math.max(0, ...G.guards.filter(awake).map(g => g.meter));
    setMood(G.alarm > 0 ? 'alarm' : max > .15 ? 'tense' : 'calm');
    const al = $('alarm');
    al.hidden = !(G.alarm > 0);
    if (G.alarm > 0) al.textContent = '🚨 ALLARME ' + Math.ceil(G.alarm) + 's';
    const pb = $('planbar');
    pb.hidden = !G.plan;
    if (G.plan) $('planTxt').textContent = '🎬 Pianificazione: ' + Object.keys(G.queue).length + ' azioni pronte';
}

// ---------- battute contestuali ----------
const freeChars = () => G.chars.filter(c => !c.captured);
function banter(ev, at, name) {
    if (!G || (G.banterT > 0 && ev !== 'capture')) return;
    const list = BANTER[ev];
    if (!list) return;
    const near = c => !at || Math.hypot(c.x - at[0], c.y - at[1]) < 12;
    const ok = list.filter(([who]) => who === '*' || G.chars.some(c => c.id === who && !c.captured && near(c) && c.name !== name));
    if (!ok.length) return;
    const uni = ok.filter(([who]) => who === 'unicorn');
    const [who, line] = uni.length && Math.random() < .5 ? pick(uni) : pick(ok);
    const sp = who === '*' ? pick(freeChars().filter(c => c.name !== name && near(c))) : G.chars.find(c => c.id === who);
    if (!sp) return;
    G.banterT = 5;
    later(.7, () => talk(sp, line.replace('{name}', name || ''), 3.2));
}

function idlePair() {
    if (G.alarm > 0 || G.state !== 'play') return;
    const opts = BANTER_PAIRS.filter(([[a], [b]]) => {
        const A = G.chars.find(c => c.id === a), B = G.chars.find(c => c.id === b);
        return !A.captured && !B.captured && Math.hypot(A.x - B.x, A.y - B.y) < 9;
    });
    if (!opts.length) return;
    const [[a, la], [b, lb]] = pick(opts);
    talk(G.chars.find(c => c.id === a), la, 3);
    later(3.1, () => talk(G.chars.find(c => c.id === b), lb, 3.2));
}

// ---------- cattura e liberazione ----------
function capture(c, g) {
    c.captured = true; c.route = []; c.want = null; c.disguise = 0; c.actKind = null;
    G.stats.captures++;
    g.meter = 0; g.susp = false; g.spot = null; g.alerted = false; g.route = [];
    g.mode = 'look'; g.timer = 4;
    talk(g, pick(['Preso! In cella sobria!', 'Tu vieni con me. Camomilla per un mese.', 'ALT! Controllo sobrietà!']), 2.6, true);
    pop(c.x, c.y, 'BECCATO!', '#ff3a3a', 38);
    shake(6); sfx('alert');
    raiseAlarm(c.x, c.y);
    G.banterT = 0;
    banter('capture', null, c.name);
    if (G.chars.every(x => x.captured)) { fail(g); return; }
    toast(c.name + ' è in cella sobria! Avvicina un altro personaggio e premi E per liberarlo.', 4500);
    if (G.chars[G.sel] === c) select(G.chars.findIndex(x => !x.captured));
    refreshHud();
}

function freeChar(c) {
    c.captured = false;
    pop(c.x, c.y, 'LIBERO!', '#7fff7a', 32);
    sfx('objective'); act(c, 'up', 1);
    G.banterT = 0;
    banter('free', null, c.name);
    toast(c.name + ' è di nuovo in squadra!');
    refreshHud();
}

// ---------- allarme ----------
const gRange = g => g.range + DIFF[G.diff].range + (G.alarm > 0 ? 1.5 : 0);
const gFov = g => g.fov * (G.alarm > 0 ? 1.25 : 1);

function raiseAlarm(x, y) {
    const was = G.alarm > 0;
    G.alarm = DIFF[G.diff].alarm;
    if (was) return;
    G.stats.alarms++;
    sfx('whistle');
    toast('🚨 ALLARME! Per ' + G.alarm + ' secondi le guardie vedono più lontano e si muovono più in fretta.', 3500);
    banter('alarm');
    G.guards.filter(g => !g.boss && g.mode === 'patrol' && Math.hypot(g.x - x, g.y - y) < 16)
        .sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y)).slice(0, 2)
        .forEach(g => {
            const r = bfs(Math.floor(g.x), Math.floor(g.y), Math.floor(x), Math.floor(y), g);
            if (!r) return;
            g.mode = 'goto'; g.route = r; g.after = { mode: 'look', dur: 5, msg: 'Dov\'è l\'intruso?!' };
            talk(g, 'Arrivo!', 1.5, true);
        });
}

// Una guardia sveglia che vede un collega addormentato va a svegliarlo e dà l'allarme.
function spotColleague(g) {
    for (const [i, h] of G.guards.entries()) {
        if (h === g || h.mode !== 'sleep' || h.discovered) continue;
        const dx = h.x - g.x, dy = h.y - g.y, d = Math.hypot(dx, dy);
        if (d > gRange(g)) continue;
        const a = Math.atan2(Math.sin(Math.atan2(dy, dx) - g.dir), Math.cos(Math.atan2(dy, dx) - g.dir));
        if (Math.abs(a) > gFov(g) / 2 || !los(g.x, g.y, h.x, h.y)) continue;
        const r = bfs(Math.floor(g.x), Math.floor(g.y), Math.floor(h.x), Math.floor(h.y), g);
        h.discovered = true;
        g.mode = 'goto'; g.route = r || []; g.susp = false;
        g.after = { mode: 'look', dur: 3, msg: 'Sveglia! Ci sono intrusi!', wake: i };
        talk(g, 'Collega a terra! ALLARME!', 2.2, true);
        part({ kind: 'text', x: g.x, y: g.y, z: 80, vz: 30, txt: '!', col: '#ff3a3a', size: 30, max: .9 });
        raiseAlarm(h.x, h.y);
        return;
    }
}

// ---------- pagella ----------
const MEDALS = [
    ['fantasma', '👻 Fantasma', 'Nessuna cattura e nessun allarme', s => s.captures === 0 && s.alarms === 0],
    ['peto', '💨 Peto Perfetto', 'Il gas di Estice stende 2+ guardie insieme', s => s.gasMax >= 2],
    ['comico', '🎤 Stand-up Assassino', 'Una barzelletta di Unicorn colpisce 2+ guardie', s => s.jokeMax >= 2],
    ['pugno', '👊 Pugno Tascabile', 'Alcan stende 3+ guardie', s => s.punches >= 3],
    ['amianto', '🔥 Mani d\'Amianto', 'La brace di Muglo fa scappare 2+ guardie', s => s.fled >= 2],
    ['wow', '😳 Effetto WOW', 'Proboscis paralizza 2+ guardie insieme', s => s.wowMax >= 2],
    ['regista', '🎬 Regista', 'Azione coordinata con 3+ personaggi', s => s.syncMax >= 3],
    ['fulmine', '⚡ Fulmine', 'Missione sotto il tempo di riferimento', (s, t, par) => t <= par],
    ['testa', '🧠 Senza Aiutini', 'Nessun indizio usato', s => s.hints === 0],
    ['bottiglie', '🍾 Collezionista', 'Tutte le bottiglie segrete', (s, t, par, n) => s.secrets >= n],
    ['commandos', '💀 Commandos Vero', 'Missione completata a difficoltà Commandos', () => G.diff === 'commandos'],
    ['astemio', '🚱 Astemio per Forza', 'Missione finita senza cariche avanzate su un\'abilità', () => G.chars.some(c => c.charges.includes(0))],
];
const UNICORN_GRADE = {
    S: 'Perfetto. Troppo perfetto. Chi ha barato?',
    A: 'Quasi bravi. Quasi.',
    B: 'Sufficiente. Come il vino in cartone.',
    C: 'Avete vinto. Per sbaglio.',
    D: 'Missione compiuta. La dignità invece no.',
};
const fmtTime = x => Math.floor(x / 60) + ':' + String(Math.floor(x % 60)).padStart(2, '0');

function rate() {
    const s = G.stats, t = G.t, par = G.m.par || 400, n = G.secrets.length;
    const bonus = { facile: -15, normale: 0, commandos: 10 }[G.diff];
    const score = clamp(100 + bonus - s.captures * 15 - s.alarms * 8 - s.hints * 5 + s.secrets * 4 - Math.max(0, Math.floor((t - par) / 10)), 0, 120);
    const grade = score >= 100 ? 'S' : score >= 85 ? 'A' : score >= 65 ? 'B' : score >= 40 ? 'C' : 'D';
    const medals = MEDALS.filter(m => m[3](s, t, par, n));
    const order = 'DCBAS', best = STORE.get('best', {});
    if (!best[G.mi] || order.indexOf(grade) > order.indexOf(best[G.mi])) best[G.mi] = grade;
    STORE.set('best', best);
    const med = STORE.get('medals', {});
    medals.forEach(m => { med[m[0]] = true; });
    STORE.set('medals', med);
    return { score, grade, medals, t, par };
}

function reportCard() {
    const r = rate(), s = G.stats;
    const D = DIFF[G.diff];
    return `<div class="report"><div class="grade g${r.grade}">${r.grade}</div><table>` +
        `<tr><td>Difficoltà</td><td>${D.icon} ${D.name}</td></tr>` +
        `<tr><td>Tempo</td><td>${fmtTime(r.t)} <small>(rif. ${fmtTime(r.par)})</small></td></tr>` +
        `<tr><td>Catture</td><td>${s.captures}</td></tr><tr><td>Allarmi</td><td>${s.alarms}</td></tr>` +
        `<tr><td>Indizi usati</td><td>${s.hints}</td></tr><tr><td>Guardie stese</td><td>${s.knocked}</td></tr>` +
        `<tr><td>Bottiglie segrete</td><td>${s.secrets}/${G.secrets.length}</td></tr></table></div>` +
        `<p class="ucom"><b>Unicorn:</b> "${UNICORN_GRADE[r.grade]}"</p>` +
        `<div class="medals">${r.medals.length ? r.medals.map(m => `<span title="${m[2]}">${m[1]}</span>`).join('') : '<i>Nessuna medaglia. Unicorn ride di voi.</i>'}</div>`;
}

function showMedals() {
    const med = STORE.get('medals', {});
    screen('<h2>🏅 Medaglie</h2><div class="medals big">' +
        MEDALS.map(m => `<span class="${med[m[0]] ? '' : 'off'}">${med[m[0]] ? m[1] : '🔒 ???'}<small>${m[2]}</small></span>`).join('') +
        '</div><button class="btn" onclick="showTitle()">Indietro</button>');
}

// ---------- azione coordinata ----------
function togglePlan() {
    if (!G || G.state !== 'play') return;
    G.plan = !G.plan; G.queue = {}; G.targeting = -1;
    toast(G.plan ? '🎬 Scegli un\'abilità (Q/X + bersaglio) per ogni personaggio, poi premi Spazio o "Via!".' : 'Pianificazione annullata.', 4000);
    refreshHud();
}

function queueAction(c, k, wx, wy) {
    G.queue[G.chars.indexOf(c)] = { k, wx, wy };
    G.targeting = -1; sfx('click');
    toast(c.name + ': ' + c.ab[k].icon + ' ' + c.ab[k].name + ' pronta. Seleziona un altro personaggio o premi Spazio.');
    refreshHud();
}

function runPlan() {
    if (!G || !G.plan) return;
    const q = Object.entries(G.queue);
    G.plan = false; G.queue = {};
    let n = 0;
    q.forEach(([i, a]) => {
        const c = G.chars[i];
        if (c.captured || c.cd[a.k] > 0) return;
        castAt(c, a.k, a.wx, a.wy); n++;
    });
    G.stats.syncMax = Math.max(G.stats.syncMax, n);
    if (n >= 2) { const c = G.chars[G.sel]; pop(c.x, c.y, 'AZIONE!', '#ffd23f', 40); G.banterT = 0; banter('sync'); }
    refreshHud();
}

function drawPlan() {
    if (!G.plan) return;
    Object.entries(G.queue).forEach(([i, a]) => {
        const c = G.chars[i], ab = c.ab[a.k];
        const tx = a.wx ?? c.x, ty = a.wy ?? c.y, [sx, sy] = iso(tx, ty), [cx, cy] = iso(c.x, c.y);
        ctx.save(); ctx.setLineDash([5, 5]); ctx.strokeStyle = 'rgba(255,220,80,.9)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx, cy - 20); ctx.lineTo(sx, sy); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(sx, sy, 22, 11, 0, 0, 7); ctx.stroke(); ctx.restore();
        ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = OUT;
        const lbl = (+i + 1) + ' ' + ab.icon;
        ctx.strokeText(lbl, sx, sy - 14); ctx.fillStyle = '#ffd23f'; ctx.fillText(lbl, sx, sy - 14);
    });
}

// ---------- anteprima di effetto e rumore ----------
const NOISE = {
    estice: [{ eff: 2.3, noise: 10 }, { eff: 2.3, noise: 6.5 }],
    alcan: [{ eff: .6, noise: 9 }, { eff: 1.9, noise: 4 }],
    muglo: [{ eff: 2.4, noise: 8, food: true }, { eff: 2.4, noise: 0 }],
    unicorn: [{ eff: 1.9, noise: 0 }, { eff: 4.2, noise: 0 }],
    proboscis: [{ eff: 0, noise: 0 }, { eff: 3.4, noise: 0 }],
};

function drawPreview() {
    const k = G.targeting >= 0 ? G.targeting : G.preview;
    if (k < 0) return;
    const c = G.chars[G.sel], N = NOISE[c.id][k];
    let tx = c.x, ty = c.y;
    if (G.targeting >= 0) {
        const [wx, wy] = toWorld(mouse[0], mouse[1]), d = Math.hypot(wx - c.x, wy - c.y), r = c.ab[k].range, f = d > r ? r / d : 1;
        tx = c.x + (wx - c.x) * f; ty = c.y + (wy - c.y) * f;
    }
    const ring = (r, col, fill, dash) => {
        const [rx, ry] = ringR(r), [sx, sy] = iso(tx, ty);
        ctx.save(); if (dash) ctx.setLineDash(dash);
        ctx.beginPath(); ctx.ellipse(sx, sy, rx, ry, 0, 0, 7);
        if (fill) { ctx.fillStyle = fill; ctx.fill(); }
        ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    };
    if (N.noise) ring(N.noise, 'rgba(255,220,80,.85)', 'rgba(255,220,80,.06)', [12, 8]);
    if (N.eff) ring(N.eff, '#ff5544', 'rgba(255,80,60,.22)');
    if (N.noise) {
        const [rx, ry] = ringR(N.noise), [sx, sy] = iso(tx, ty);
        ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,230,120,.95)';
        ctx.fillText('🔊 rumore', sx, sy + ry + 14);
    }
    G.guards.forEach(g => {
        if (!awake(g)) return;
        const d = Math.hypot(g.x - tx, g.y - ty);
        let mark = null;
        if (N.eff && d < N.eff) mark = ['✖', '#ff5544'];
        else if (N.noise && d < N.noise && !g.boss && (!g.immune.includes('lure') || (N.food && g.foodie))) mark = ['?', '#ffd23f'];
        if (!mark) return;
        const [sx, sy] = iso(g.x, g.y);
        ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = OUT;
        ctx.strokeText(mark[0], sx, sy - 90); ctx.fillStyle = mark[1]; ctx.fillText(mark[0], sx, sy - 90);
    });
}

// ---------- indizi ----------
function useHint() {
    if (!G || G.state !== 'play') return;
    const o = G.objs.find(o => !o.done && stepReady(o) && (!o.hintShown || (o.who && !o.revealed)));
    if (!o) { toast('Nessun altro indizio: completa gli obiettivi già sbloccati.'); return; }
    G.stats.hints++;
    if (!o.hintShown) { o.hintShown = true; toast('💡 ' + o.hint, 6000); }
    else { o.revealed = true; toast('💡 "' + o.text + '": serve ' + charName(o.who) + '.', 5000); }
    sfx('potion');
    refreshHud();
}

// ---------- segreti e papere ----------
function tickSecrets() {
    G.secrets.forEach((s, i) => {
        if (s.found) return;
        if (!G.chars.some(c => !c.captured && Math.hypot(c.x - s.x, c.y - s.y) < .8)) return;
        s.found = true; G.stats.secrets++;
        const finder = G.chars.find(c => !c.captured && Math.hypot(c.x - s.x, c.y - s.y) < .8);
        finder.charges = finder.charges.map(n => n < 0 ? n : n + 1);
        refreshHud();
        const idx = G.mi * 3 + i, got = STORE.get('papere', []);
        if (!got.includes(idx)) { got.push(idx); STORE.set('papere', got); }
        sfx('objective');
        pop(s.x, s.y, 'SEGRETO!', '#ffd23f', 30);
        burst(16, s.x, s.y, () => ({ kind: 'star', z: 30, vx: rnd(-1.5, 1.5), vy: rnd(-1.5, 1.5), vz: rnd(60, 120), g: 200, size: rnd(4, 6), max: 1, rot: rnd(0, 6), vr: rnd(-6, 6) }));
        toast('🍾 Bottiglia segreta ' + G.stats.secrets + '/' + G.secrets.length + '! +1 carica a ogni abilità di ' + finder.name + ' e una papera sbloccata.', 4500);
        G.banterT = 0;
        banter('secret', [s.x, s.y]);
    });
}

function showPapere() {
    const got = STORE.get('papere', []);
    screen('<h2>🎞 Papere dal set (' + got.length + '/' + PAPERE.length + ')</h2><ul class="papere">' +
        PAPERE.map((p, i) => got.includes(i) ? `<li>${p}</li>` : `<li class="off">🔒 Bottiglia segreta n. ${i % 3 + 1} della Missione ${Math.floor(i / 3) + 1}</li>`).join('') +
        '</ul><button class="btn" onclick="showTitle()">Indietro</button>');
}

// ---------- tutorial ----------
const TUTORIAL = [
    ['🖱️', 'Muovi e corri', 'Clic sul terreno: camminata silenziosa. Doppio clic: corsa veloce ma rumorosa, attira le guardie vicine. Cambia personaggio con 1-5.'],
    ['🔋', 'Cariche', 'Ogni abilità ha poche cariche per missione (×N sul pulsante). Le bottiglie segrete le ricaricano. Usale con giudizio!'],
    ['👁️', 'Coni di vista', 'Le guardie vedono nel cono giallo: più sei vicino, prima ti scoprono. Muri e fumo bloccano la vista.'],
    ['🛡️', 'Zona sicura', 'Partite dalla zona verde: lì nessuno vi vede.'],
    ['🧨', 'Abilità e rumore', 'Q e X usano le abilità. Mentre miri vedi l\'effetto (rosso) e il rumore (giallo): le guardie con "?" verranno a controllare.'],
    ['🧩', 'Obiettivi a catena', 'Ogni obiettivo richiede il personaggio giusto: ragiona su personalità e abilità, o chiedi un indizio con H (costa punti).'],
    ['👔', 'Travestimento', 'Proboscis in completo viene notato solo da vicino, ma se corre o resta a lungo nel cono di una guardia lo smascherano.'],
    ['🚨', 'Catture e allarmi', 'Chi viene scoperto finisce in cella: liberalo con un altro personaggio (E). Le guardie che trovano colleghi a terra danno l\'allarme.'],
    ['🎬', 'Azione coordinata', 'P per pianificare: prepara un\'abilità per ogni personaggio, poi Spazio per farle partire insieme.'],
    ['💾', 'Salvataggio rapido', 'F5 salva, F9 carica. Usalo prima delle mosse rischiose.'],
    ['🍾', 'Segreti', 'In ogni missione ci sono 3 bottiglie nascoste: sbloccano le papere dal set.'],
];

function showTutorial(then) {
    screen('<h2>Come si gioca</h2><div class="tut">' +
        TUTORIAL.map(t => `<div><span>${t[0]}</span><b>${t[1]}</b><p>${t[2]}</p></div>`).join('') +
        '</div><button class="btn" id="tutOk">' + (then ? 'Ho capito, si parte!' : 'Chiudi') + '</button>');
    $('tutOk').onclick = () => { STORE.set('tut', true); if (then) then(); else showTitle(); };
}

function startMission(i) {
    if (!STORE.get('tut', false)) showTutorial(() => begin(i));
    else begin(i);
}

// ---------- salvataggio rapido ----------
function snapshot() {
    return {
        mi: G.mi, t: G.t, sel: G.sel, alarm: G.alarm, stats: { ...G.stats },
        map: G.map.map(r => r.join('')),
        secrets: G.secrets.map(s => s.found),
        objs: G.objs.map(o => [o.done, !!o.hintShown, !!o.revealed]),
        diff: G.diff,
        chars: G.chars.map(c => ({ x: c.x, y: c.y, cd: [...c.cd], charges: [...c.charges], disguise: c.disguise, captured: !!c.captured, back: c.back, flip: c.flip })),
        guards: G.guards.map(g => ({ x: g.x, y: g.y, mode: g.mode, timer: g.timer, dir: g.dir, meter: g.meter, pi: g.pi, route: g.route, after: g.after, susp: g.susp, spot: g.spot, discovered: !!g.discovered })),
        baits: G.baits.map(b => ({ ...b })), dyn: G.dyn.map(d => ({ ...d })),
    };
}

function quickSave() {
    if (!G || G.state !== 'play') return;
    const raw = JSON.stringify(snapshot());
    STORE.set('save' + G.mi, raw);
    toast('💾 Partita salvata.');
    sfx('click');
}

function quickLoad(mi) {
    mi = mi ?? (G ? G.mi : 0);
    const raw = STORE.get('save' + mi, null);
    if (!raw) { toast('Nessun salvataggio per questa missione.'); return; }
    const s = JSON.parse(raw);
    begin(s.mi, true);
    if (s.diff) G.diff = s.diff;
    Object.assign(G, { t: s.t, sel: s.sel, alarm: s.alarm, stats: s.stats, baits: s.baits, dyn: s.dyn });
    G.map = s.map.map(r => r.split(''));
    G.secrets.forEach((x, i) => { x.found = s.secrets[i]; });
    G.objs.forEach((o, i) => { [o.done, o.hintShown, o.revealed] = s.objs[i]; });
    G.chars.forEach((c, i) => Object.assign(c, s.chars[i], { route: [], want: null, running: false }));
    G.guards.forEach((g, i) => Object.assign(g, s.guards[i]));
    const c = G.chars[G.sel];
    [G.cam.x, G.cam.y] = iso(c.x, c.y);
    refreshHud();
    toast('⟲ Partita caricata.');
}

// ---------- comandi aggiuntivi ----------
// ---------- HUD compatto ----------
let mapOn = innerWidth > 700;
const small = () => innerWidth <= 700 || innerHeight <= 480;
function hudLayout() {
    $('top').classList.toggle('open', STORE.get('objOpen', !small()));
    document.body.classList.toggle('nomap', !mapOn);
}
$('objToggle').onclick = () => { const o = !$('top').classList.contains('open'); $('top').classList.toggle('open', o); STORE.set('objOpen', o); };
$('bMenu').onclick = e => { e.stopPropagation(); $('menu').hidden = !$('menu').hidden; $('bMenu').classList.toggle('on', !$('menu').hidden); };
$('menu').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (b && !['bMute', 'bFollow', 'bMap'].includes(b.id)) { $('menu').hidden = true; $('bMenu').classList.remove('on'); }
});
$('bMap').onclick = () => { mapOn = !mapOn; hudLayout(); refreshHud(); };
$('bQuit').onclick = () => { if (confirm('Tornare al menu principale? I progressi non salvati andranno persi.')) showTitle(); };
addEventListener('pointerdown', e => { if (!e.target.closest('#menu, #bMenu')) { $('menu').hidden = true; $('bMenu').classList.remove('on'); } });
addEventListener('resize', hudLayout);
hudLayout();

$('bHint').onclick = useHint;
$('bPlan').onclick = togglePlan;
$('bGo').onclick = runPlan;
$('bSave').onclick = quickSave;
$('bLoad').onclick = () => quickLoad();
['bAbil', 'bAbil2'].forEach((id, k) => {
    $(id).addEventListener('mouseenter', () => { if (G) G.preview = k; });
    $(id).addEventListener('mouseleave', () => { if (G) G.preview = -1; });
});
addEventListener('keydown', e => {
    if (!G || G.state !== 'play') return;
    if (e.key === 'h' || e.key === 'H') useHint();
    else if (e.key === 'p' || e.key === 'P') togglePlan();
    else if (e.key === ' ') { e.preventDefault(); runPlan(); }
    else if (e.key === 'F5') { e.preventDefault(); quickSave(); }
    else if (e.key === 'F9') { e.preventDefault(); quickLoad(); }
});

loadSprites();
showTitle();
requestAnimationFrame(loop);

// ---------- manuale ----------
const EFFECTS = {
    estice: ['Stordisce per 8 s chi è nel raggio e sfonda i muri crepati. Rumore molto forte (10 caselle).', 'Nube tossica per 6 s: chi ci entra sviene per 14 s. Chi è più lontano viene a controllare.'],
    alcan: ['Le guardie entro 9 caselle vanno a bere per 6 s.', 'Scatta sulla guardia più vicina (entro 2 caselle) e la stende per 12 s.'],
    muglo: ['Fumo che blocca la vista per 10 s e attira i curiosi. L\'Ispettore Goloso mangia per 20 s.', 'Le guardie nel raggio scappano terrorizzate per 7 s.'],
    unicorn: ['Chi è nel raggio dorme 22 s, il Ministro compreso.', 'Le guardie entro 4 caselle ridono per 12 s e non vedono niente. Funziona anche su chi non dorme mai.'],
    proboscis: ['Travestimento per 14 s: notato solo a metà distanza, e solo dopo alcuni secondi. Passa le porte STAFF. Se corre viene smascherato subito.', 'Le guardie entro 3 caselle restano paralizzate per 10 s.'],
};
const TRAITS = {
    estice: 'L\'unico che può aprire i muri crepati e le barricate.',
    alcan: 'Piccolo: è l\'unico che passa nei condotti (SOLO ALCAN). Ha il badge per le porte STAFF ed è il più veloce.',
    muglo: 'Il fuoco non gli fa paura: accende caldaie e griglie a mani nude.',
    unicorn: 'Mastro birraio: solo lui sa spillare e riavviare i fermentatori.',
    proboscis: 'Negoziatore: le reception e gli uffici trattano solo con lui, ma vestito da professionista.',
};

function showManual(tab = 'regole') {
    const tabs = [['regole', '📜 Regole'], ['personaggi', '🎭 Personaggi'], ['nemici', '👮 Nemici'], ['punteggio', '🏅 Punteggio']];
    const nav = '<div class="mtabs">' + tabs.map(([k, n]) => `<button class="btn ${k === tab ? '' : 'ghost'}" onclick="showManual('${k}')">${n}</button>`).join('') + '</div>';
    let body = '';
    if (tab === 'regole') body = `
<h3>🎯 Obiettivo</h3><p>Il Ministro Sobrio Astemi ha vietato l'alcol. In ogni missione l'E-TEAM deve completare una catena di obiettivi senza farsi beccare. Ogni obiettivo richiede il personaggio giusto, e molti si sbloccano solo dopo altri (🔒). Chi debba fare cosa lo scoprite voi: ragionate su personalità e poteri.</p>
<h3>🖱️ Comandi</h3><table class="keys">
<tr><td>Clic / tocco sul terreno</td><td>Camminata silenziosa</td></tr>
<tr><td>Doppio clic / tocco</td><td>Corsa: veloce ma rumorosa, le guardie vicine vengono a controllare</td></tr>
<tr><td>1-5, Tab, card in basso</td><td>Cambia personaggio</td></tr>
<tr><td>Q / X</td><td>Prima / seconda abilità (poi clic sul bersaglio). Esc annulla</td></tr>
<tr><td>E</td><td>Interagisci con un obiettivo o libera un compagno in cella</td></tr>
<tr><td>H</td><td>Indizio: prima un suggerimento, poi il nome del personaggio giusto (costa punti)</td></tr>
<tr><td>P poi Spazio</td><td>Azione coordinata: prepari un'abilità per ogni personaggio e partono insieme</td></tr>
<tr><td>F</td><td>Gli altri seguono il personaggio selezionato</td></tr>
<tr><td>F5 / F9</td><td>Salvataggio / caricamento rapido</td></tr>
<tr><td>Trascina, WASD, rotella, minimappa</td><td>Sposta e zooma la vista</td></tr>
<tr><td>M · R</td><td>Audio · Riavvia missione</td></tr></table>
<h3>👁️ Vista delle guardie</h3><p>Ogni guardia ha un cono di luce. Nella <b>parte interna</b> ti scoprono quasi subito, in quella <b>esterna</b> si riempie piano la barra sopra la testa. A barra piena scatta la cattura. I colori del cono indicano lo stato: giallo tranquillo, arancione sospettoso (compare "?" e si gira verso di te), rosso in allerta (compare "!" e ti viene incontro). Muri, alberi e fumo bloccano la vista. Le guardie addormentate o distratte non vedono niente.</p>
<h3>🛡️ Zona sicura</h3><p>L'area verde di partenza: lì dentro nessuno vi vede.</p>
<h3>🔊 Rumore</h3><p>Dinamite, peti, pugni, whisky e corsa fanno rumore. Mentre miri un'abilità vedi il raggio d'effetto (rosso) e il raggio del rumore (giallo). Sulle guardie compare ✖ se verranno colpite, ? se verranno a controllare.</p>
<h3>🔋 Abilità e cariche</h3><p>Ogni personaggio ha due abilità, ciascuna con una ricarica (la barra scura sulla card) e un numero di <b>cariche per missione</b> (×N sul pulsante e sulla card). Finite le cariche, l'abilità è a secco. Ogni bottiglia segreta trovata dà +1 carica a tutte le abilità di chi la raccoglie. Alcune guardie sono immuni a certi poteri (vedi Nemici).</p>
<h3>🚨 Catture e allarmi</h3><p>Chi viene scoperto finisce nella <b>cella sobria</b> nel punto della cattura, e la sua card diventa grigia. Avvicina un compagno e premi E per liberarlo. Si perde solo se vengono catturati tutti e cinque. Ogni cattura fa scattare l'<b>allarme</b>: le guardie vedono più lontano e si muovono più in fretta, e le due più vicine accorrono. Lo stesso succede se una guardia trova un collega addormentato: lo sveglia e dà l'allarme.</p>
<h3>🎬 Azione coordinata</h3><p>Premi P, poi per ogni personaggio scegli un'abilità e il suo bersaglio: vedrai le linee tratteggiate del piano. Con Spazio partono tutte nello stesso istante. È il modo migliore per neutralizzare più guardie che si guardano a vicenda.</p>
<h3>⚙️ Difficoltà</h3><table class="keys">${Object.values(DIFF).map(d => `<tr><td>${d.icon} ${d.name}</td><td>${d.desc} Vista ×${d.detect}, allarme ${d.alarm} s.</td></tr>`).join('')}</table>`;
    if (tab === 'personaggi') body = CHARS.map(c => `
<div class="mchar"><img src="${c.box}" alt="${c.name}"><div>
<h3>${c.name} <small>${c.role}</small></h3><p class="trait">⭐ ${TRAITS[c.id]}</p>
${c.ab.map((a, k) => `<div class="mab"><b>${k ? 'X' : 'Q'} · ${a.icon} ${a.name}</b> <span class="tags">${a.target ? 'gittata ' + a.range : 'su di sé / attorno'} · ricarica ${a.cd} s · cariche ${Object.values(DIFF).map(d => { const n = d.charges(a.charges); return d.icon + (n < 0 ? '∞' : n); }).join(' ')}</span><p>${a.desc}</p><p class="eff">➜ ${EFFECTS[c.id][k]}</p></div>`).join('')}
</div></div>`).join('');
    if (tab === 'nemici') body = `
<div class="menemy"><b>👮 Ispettore Acqua</b><p>Pattuglia o fa la guardia. Vulnerabile a tutto: pozione, gas, pugni, barzellette, brace, whisky e fumo. Se trova un collega addormentato lo sveglia e dà l'allarme.</p></div>
<div class="menemy"><b>🍖 Ispettore Goloso</b> <small>(Missione 1)</small><p>Non si muove dal suo posto e non dorme, non ride, non si spaventa. Ha un solo punto debole: il profumo della griglia di Muglo.</p></div>
<div class="menemy"><b>☕ Ispettori al caffè</b> <small>(Missione 2)</small><p>Bevono solo caffè: immuni a sonno, pugni e travestimenti. Qualcuno però dovrebbe farli ridere...</p></div>
<div class="menemy"><b>🛎️ Receptionist e Organizzatori</b><p>Sorvegliano le scrivanie dove si negozia: lasciano avvicinare solo chi sembra un professionista.</p></div>
<div class="menemy"><b>🎩 Ministro Sobrio Astemi</b> <small>(Missione 3)</small><p>Vede lontanissimo e non lascia mai il suo tendone. I pugni lo stordiscono solo per poco, ma una pozione ben piazzata lo fa russare a lungo. Le sue carte si possono timbrare solo mentre dorme.</p></div>`;
    if (tab === 'punteggio') body = `
<h3>📋 Pagella</h3><p>A fine missione ricevi un voto da S a D. Si parte da 100 punti (Facile −15, Commandos +10):</p>
<table class="keys"><tr><td>Cattura</td><td>−15</td></tr><tr><td>Allarme</td><td>−8</td></tr><tr><td>Indizio usato</td><td>−5</td></tr><tr><td>Bottiglia segreta</td><td>+4</td></tr><tr><td>Ogni 10 s oltre il tempo di riferimento</td><td>−1</td></tr></table>
<p>S ≥ 100 · A ≥ 85 · B ≥ 65 · C ≥ 40 · D sotto. Unicorn commenta sempre, e mai con gentilezza.</p>
<h3>🏅 Medaglie</h3><table class="keys">${MEDALS.map(m => `<tr><td>${m[1]}</td><td>${m[2]}</td></tr>`).join('')}</table>
<h3>🍾 Bottiglie segrete e papere</h3><p>In ogni missione sono nascoste 3 bottiglie: brillano ogni tanto, cercale negli angoli. Ognuna ricarica le abilità di chi la trova e sblocca una papera dal set, da leggere nel menu principale.</p>`;
    screen('<h2>📖 Manuale dell\'E-TEAM</h2>' + nav + '<div class="manual">' + body + '</div><button class="btn" onclick="showTitle()">Chiudi</button>');
    $('screen').scrollTop = 0;
}
