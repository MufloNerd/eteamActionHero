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
    AU.mus = AU.ac.createGain(); AU.mus.gain.value = .16; AU.mus.connect(AU.master);
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

// Loop musicale stile "spy" in chiptune.
const BASS = [40, 40, 47, 40, 43, 40, 42, 41, 40, 40, 47, 40, 46, 45, 43, 42];
const LEAD = [64, 0, 67, 0, 71, 70, 0, 67, 64, 0, 0, 0, 62, 63, 64, 0, 64, 0, 67, 0, 72, 71, 0, 67, 66, 0, 64, 0, 0, 0, 0, 0];
const midi = n => 440 * Math.pow(2, (n - 69) / 12);

function musicTick() {
    if (!AU.ac || AU.ac.state !== 'running') return;
    const spb = 60 / 138 / 2;
    while (AU.next < AU.ac.currentTime + .2) {
        const s = AU.step, at = AU.next - AU.ac.currentTime;
        tone(midi(BASS[s % 16]), spb * .9, { type: 'triangle', vol: .5, at, out: AU.mus });
        const l = LEAD[s % 32];
        if (l && (s >> 5) % 2 === 1) tone(midi(l), spb * 1.6, { type: 'square', vol: .16, at, out: AU.mus });
        if (s % 2 === 0) noise(.04, { vol: .12, f: 7000, kind: 'highpass', at, out: AU.mus });
        if (s % 8 === 4) noise(.1, { vol: .2, f: 1800, kind: 'bandpass', at, out: AU.mus });
        AU.step++; AU.next += spb;
    }
}
