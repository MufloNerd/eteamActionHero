'use strict';
// Audio sintetizzato con Web Audio: nessun file esterno.

const AU = { ac: null, on: true, master: null, sfx: null, mus: null, step: 0, next: 0, timer: 0 };

function auInit() {
    if (AU.ac) { if (AU.ac.state === 'suspended') AU.ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    AU.ac = new AC();
    AU.master = AU.ac.createGain(); AU.master.gain.value = AU.on ? .8 : 0; AU.master.connect(AU.ac.destination);
    AU.sfx = AU.ac.createGain(); AU.sfx.gain.value = .7; AU.sfx.connect(AU.master);
    AU.mus = AU.ac.createGain(); AU.mus.gain.value = .34; AU.mus.connect(AU.master);
    AU.next = AU.ac.currentTime + .1;
    AU.timer = setInterval(musicTick, 50);
}

function auToggle() {
    AU.on = !AU.on;
    if (AU.master) AU.master.gain.setTargetAtTime(AU.on ? .8 : 0, AU.ac.currentTime, .05);
    return AU.on;
}

function tone(f, dur, { type = 'square', vol = .3, to = null, at = 0, out = null, vib = 0 } = {}) {
    if (!AU.ac) return;
    const t = AU.ac.currentTime + at, o = AU.ac.createOscillator(), g = AU.ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    if (vib) {
        const l = AU.ac.createOscillator(), lg = AU.ac.createGain();
        l.frequency.value = vib; lg.gain.value = f * .06; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur);
    }
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
    o.connect(g); g.connect(out || AU.sfx); o.start(t); o.stop(t + dur + .02);
}

let noiseBuf = null;
function noise(dur, { vol = .4, f = 1200, to = null, kind = 'lowpass', at = 0, q = 1, out = null } = {}) {
    if (!AU.ac) return;
    if (!noiseBuf) {
        noiseBuf = AU.ac.createBuffer(1, AU.ac.sampleRate * 2, AU.ac.sampleRate);
        const d = noiseBuf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const t = AU.ac.currentTime + at, s = AU.ac.createBufferSource(), fl = AU.ac.createBiquadFilter(), g = AU.ac.createGain();
    s.buffer = noiseBuf; fl.type = kind; fl.Q.value = q; fl.frequency.setValueAtTime(f, t);
    if (to) fl.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(out || AU.sfx); s.start(t); s.stop(t + dur);
}

const SFX = {
    click: () => tone(660, .06, { vol: .15 }),
    select: i => { tone(440 + i * 90, .07, { vol: .15 }); tone(660 + i * 90, .08, { vol: .12, at: .06 }); },
    throw: () => noise(.25, { vol: .25, f: 600, to: 2400, kind: 'bandpass', q: 3 }),
    boom: () => { noise(1.1, { vol: .9, f: 1400, to: 60 }); tone(90, .7, { type: 'sine', vol: .7, to: 30 }); },
    fuse: () => noise(.12, { vol: .08, f: 5000, kind: 'highpass' }),
    fart: () => {
        tone(95, .75, { type: 'sawtooth', vol: .35, to: 60, vib: 22 });
        tone(140, .35, { type: 'square', vol: .12, to: 80, vib: 30, at: .05 });
        noise(.7, { vol: .25, f: 400, to: 150 });
    },
    glass: () => { tone(2200, .25, { type: 'sine', vol: .2 }); tone(3100, .2, { type: 'sine', vol: .12, at: .03 }); },
    glug: () => { for (let k = 0; k < 4; k++) tone(300 + k * 60, .09, { type: 'sine', vol: .25, to: 600 + k * 80, at: k * .11 }); },
    punch: () => { noise(.15, { vol: .6, f: 900, to: 200 }); tone(160, .15, { type: 'sine', vol: .5, to: 60 }); },
    sizzle: () => noise(1.2, { vol: .22, f: 3500, kind: 'highpass' }),
    whoosh: () => noise(.5, { vol: .3, f: 300, to: 3000, kind: 'bandpass', q: 2 }),
    potion: () => { for (let k = 0; k < 6; k++) tone(500 + Math.random() * 700, .07, { type: 'sine', vol: .18, at: k * .05 }); },
    laugh: () => { for (let k = 0; k < 6; k++) tone(420 - k * 18, .11, { type: 'triangle', vol: .25, to: 300 - k * 15, at: k * .14 }); },
    whistle: () => { tone(900, .25, { type: 'sine', vol: .25, to: 1800 }); tone(900, .5, { type: 'sine', vol: .25, to: 650, at: .32 }); },
    alert: () => { tone(880, .09, { vol: .25 }); tone(1320, .18, { vol: .25, at: .09 }); },
    sleep: () => tone(600, .7, { type: 'sine', vol: .2, to: 180 }),
    poof: () => noise(.35, { vol: .3, f: 2000, to: 300 }),
    objective: () => [523, 659, 784, 1047].forEach((f, k) => tone(f, .18, { vol: .18, at: k * .09 })),
    win: () => [523, 659, 784, 659, 784, 1047].forEach((f, k) => tone(f, .25, { vol: .2, at: k * .14 })),
    lose: () => [392, 370, 349, 330].forEach((f, k) => tone(f, k === 3 ? 1 : .35, { type: 'sawtooth', vol: .18, at: k * .38, vib: k === 3 ? 6 : 0 })),
    talk: () => tone(300 + Math.random() * 200, .05, { type: 'square', vol: .06 }),
};
function sfx(name, ...a) { try { SFX[name] && SFX[name](...a); } catch (e) { /* audio non disponibile */ } }

// ---------- Musica: marcia militare demenziale ----------
// Grande cassa, rullante con rulli, tuba "um-pa", melodia al kazoo (con fumo: ottavino furtivo; in allarme: tromba e kazoo).
const midi = n => 440 * Math.pow(2, (n - 69) / 12);
const CHORDS = {
    C: [36, [60, 64, 67]], F: [41, [60, 65, 69]], G7: [43, [59, 62, 65]],
    C7: [36, [58, 64, 67]], Bb: [46, [58, 62, 65]],
};
// Battute da 16 sedicesimi: [nota MIDI o 0 = pausa, durata in sedicesimi]
const THEME_A = [
    ['C', [[67, 3], [67, 1], [72, 4], [72, 2], [74, 2], [76, 4]]],
    ['C', [[72, 4], [67, 4], [64, 4], [67, 4]]],
    ['F', [[65, 3], [65, 1], [69, 4], [72, 4], [69, 4]]],
    ['G7', [[67, 4], [71, 2], [74, 2], [77, 4], [74, 4]]],
    ['C', [[76, 3], [76, 1], [74, 2], [72, 2], [74, 4], [67, 4]]],
    ['C', [[72, 2], [71, 2], [69, 2], [71, 2], [72, 4], [76, 4]]],
    ['G7', [[74, 3], [74, 1], [77, 4], [76, 2], [74, 2], [72, 2], [71, 2]]],
    ['C', [[72, 4], [67, 2], [64, 2], [60, 4], [0, 4]]],
];
const THEME_B = [
    ['F', [[69, 2], [69, 2], [69, 2], [65, 2], [72, 8]]],
    ['C7', [[70, 2], [69, 2], [67, 2], [65, 2], [67, 8]]],
    ['C7', [[67, 2], [67, 2], [67, 2], [64, 2], [70, 8]]],
    ['F', [[69, 2], [67, 2], [65, 2], [64, 2], [65, 8]]],
    ['F', [[72, 2], [72, 2], [74, 2], [72, 2], [69, 4], [65, 4]]],
    ['Bb', [[70, 2], [70, 2], [72, 2], [70, 2], [67, 8]]],
    ['C7', [[69, 3], [69, 1], [67, 2], [65, 2], [64, 2], [67, 2], [72, 4]]],
    ['F', [[65, 4], [60, 4], [65, 4], [0, 4]]],
];
const SONG = [...THEME_A, ...THEME_A, ...THEME_B, ...THEME_A].map(([ch, notes], i) => {
    const at = {};
    let p = 0;
    notes.forEach(([n, l]) => { if (n) at[p] = [n, l]; p += l; });
    return { ch, at, last: i % 8 === 7 };
});

// Voce generica: oscillatori → filtro → inviluppo
function voice(f, dur, at, { type = 'sawtooth', vol = .2, lp = 3000, bp = null, q = 1, vib = 0, vibD = .02, scoop = 0, att = .015, det = 0, to = null } = {}) {
    const ac = AU.ac, t = ac.currentTime + at, g = ac.createGain();
    let node = g;
    const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = lp; fl.connect(g);
    let inp = fl;
    if (bp) { const b = ac.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = bp; b.Q.value = q; b.connect(fl); inp = b; }
    [0, det].filter((d, i) => i === 0 || d).forEach(d => {
        const o = ac.createOscillator(); o.type = type;
        o.frequency.setValueAtTime(f * (1 - scoop) * (1 + d), t);
        if (scoop) o.frequency.exponentialRampToValueAtTime(f * (1 + d), t + .06);
        if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
        if (vib) {
            const l = ac.createOscillator(), lg = ac.createGain();
            l.frequency.value = vib; lg.gain.value = f * vibD; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur + .05);
        }
        o.connect(inp); o.start(t); o.stop(t + dur + .05);
    });
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + att);
    g.gain.setValueAtTime(vol, t + Math.max(att, dur * .7));
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    node.connect(AU.mus);
}

const INST = {
    kazoo: (n, d, at, v = 1) => voice(midi(n), d, at, { type: 'sawtooth', vol: .17 * v, bp: 1100, q: 1.4, lp: 3800, vib: 6.5, vibD: .018, scoop: .06, det: .008 }),
    fife: (n, d, at, v = 1) => voice(midi(n + 12), Math.min(d, .16), at, { type: 'triangle', vol: .16 * v, lp: 6000, att: .005 }),
    bugle: (n, d, at, v = 1) => voice(midi(n), d, at, { type: 'square', vol: .11 * v, lp: 2600, vib: 5, vibD: .006, att: .02 }),
    tuba: (n, d, at, v = 1) => voice(midi(n), d, at, { type: 'sawtooth', vol: .32 * v, lp: 380, q: 3, att: .03, scoop: .04 }),
    stab: (notes, d, at, v = 1) => notes.forEach(n => voice(midi(n), d, at, { type: 'square', vol: .045 * v, lp: 1700, att: .005 })),
    kick: (at, v = 1) => tone(110, .22, { type: 'sine', vol: .5 * v, to: 42, at, out: AU.mus }),
    snare: (at, v = 1) => { noise(.11, { vol: .28 * v, f: 2200, kind: 'bandpass', q: .8, at, out: AU.mus }); tone(190, .06, { type: 'triangle', vol: .12 * v, at, out: AU.mus }); },
    crash: (at, v = 1) => noise(1.1, { vol: .16 * v, f: 6000, kind: 'highpass', at, out: AU.mus }),
};

// Gag sonore tra una frase e l'altra
const GAGS = [
    at => voice(700, .45, at, { type: 'sine', vol: .14, lp: 8000, to: 2200, att: .02 }),                         // fischietto a coulisse su
    at => voice(2000, .5, at, { type: 'sine', vol: .14, lp: 8000, to: 500, att: .02 }),                          // ...e giù
    at => { voice(330, .14, at, { type: 'square', vol: .1, lp: 1400, det: .02 }); voice(262, .2, at + .17, { type: 'square', vol: .1, lp: 1400, det: .02 }); }, // clacson da bici
    at => voice(85, .45, at, { type: 'sawtooth', vol: .22, lp: 420, vib: 22, vibD: .12, to: 65 }),             // rutto
    at => { voice(520, .07, at, { type: 'sine', vol: .14, to: 900 }); voice(560, .07, at + .32, { type: 'sine', vol: .12, to: 980 }); }, // singhiozzo
    at => [0, .11, .22].forEach(d => voice(800, .08, at + d, { type: 'square', vol: .06, bp: 800, q: 6, lp: 4000, att: .002 })), // campanaccio
];

AU.mood = 'calm';
AU.bpm = 112;
function setMood(m) {
    if (AU.mood === m) return;
    if (AU.ac && m === 'alarm') [[67, 0], [72, .1], [76, .2], [79, .3]].forEach(([n, d], i) => INST.bugle(n + 12, i === 3 ? .7 : .12, d, 1.3));
    if (AU.ac && AU.mood === 'alarm' && m !== 'alarm') GAGS[1](0);
    AU.mood = m;
}

function musicTick() {
    if (!AU.ac || AU.ac.state !== 'running') return;
    const target = { calm: 108, tense: 124, alarm: 148 }[AU.mood];
    while (AU.next < AU.ac.currentTime + .2) {
        AU.bpm += (target - AU.bpm) * .08;
        const spb = 60 / AU.bpm / 4, st = AU.step, s = st % 16, bar = SONG[Math.floor(st / 16) % SONG.length];
        const at = Math.max(0, AU.next - AU.ac.currentTime), mood = AU.mood, key = mood === 'alarm' ? 2 : 0;
        const [root, chord] = CHORDS[bar.ch], ch = chord.map(n => n + key);
        // Batteria
        if (s === 0 || s === 8) INST.kick(at, mood === 'calm' ? .8 : 1);
        if (mood === 'calm') { if (s === 4 || s === 12) INST.snare(at, .5); if (s === 14 && st % 32 === 30) INST.snare(at, .3); }
        else if (mood === 'tense') { if ([4, 12].includes(s)) INST.snare(at, 1); if ([6, 7, 14, 15].includes(s)) INST.snare(at, .45); }
        else { INST.snare(at, [4, 12].includes(s) ? 1 : .32); if (s === 0 && st % 64 === 0) INST.crash(at); }
        // Tuba e accordi "um-pa"
        if (s === 0) INST.tuba(root + key, spb * 3.2, at);
        if (s === 8) INST.tuba(root + key + 7 - 12 * (root + 7 > 48 ? 1 : 0), spb * 3.2, at);
        if (s === 4 || s === 12) INST.stab(ch, spb * 1.2, at, mood === 'calm' ? .6 : 1);
        if (mood === 'alarm' && (s === 6 || s === 14)) INST.stab(ch, spb * .8, at, .7);
        // Melodia
        const n = bar.at[s];
        if (n) {
            const [note, len] = n, d = len * spb * .92, nn = note + key;
            if (mood === 'calm') INST.fife(nn, d, at, .9);
            else if (mood === 'tense') INST.kazoo(nn, d, at);
            else { INST.kazoo(nn, d, at, .9); INST.bugle(nn - 12, d, at, .9); }
        }
        // Gag di fine frase
        if (bar.last && s === 12 && mood !== 'alarm' && Math.random() < .75) pick(GAGS)(at);
        AU.step++; AU.next += spb;
    }
}
