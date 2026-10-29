'use strict';
// Dati di gioco: personaggi, battute, missioni.

const OUT = '#1d1a22';

const CHARS = [
    {
        id: 'estice', name: 'Estice', role: 'Il Demolitore', img: 'assets/1000081068.jpg',
        look: { skin: '#e2a982', shirt: '#2f9a55', jacket: '#8a5a2b', pants: '#7a6a48', shoes: '#4a3424', hat: 'miner', hair: '#3a2a1e', beard: '#4a3526', beardKind: 'short', mouth: 'grin', prop: 'pickaxe' },
        ab: [
            { name: 'Dinamite', icon: '🧨', range: 6, cd: 12, target: true, desc: 'Lancia un candelotto: spacca le barricate, stordisce chi è vicino, ma fa un gran fracasso.' },
            { name: 'Peto letale', icon: '💨', range: 0, cd: 16, target: false, desc: 'Una nube verde tossica avvolge Estice: chi gli è accanto sviene. Chi è più lontano viene a controllare.' },
        ],
        quips: ['Stamattina fagioli e cipolle. Statemi lontani.', 'Un buco nel muro risolve tutto.', 'Scavo, scoppio, scappo.', 'Prrr... scusate. Era la miccia. Giuro.', 'Il mio stomaco è un\'arma non convenzionale.'],
        castLines: [['BOOM in arrivo!', 'Tappatevi le orecchie!'], ['Arma chimica in arrivo!', 'Scusate in anticipo.', 'Respirate con la bocca!']],
    },
    {
        id: 'alcan', name: 'Alcan', role: "L'Infiltrato", img: 'assets/1000081064.jpg',
        look: { skin: '#f0c4a0', shirt: '#1f2f6b', pants: '#3b5f9a', shoes: '#333', hat: 'none', hair: '#4a3020', mouth: 'angry', brows: 'angry', prop: 'whisky', badge: true, small: true },
        ab: [
            { name: 'Whisky 12', icon: '🥃', range: 7, cd: 10, target: true, desc: 'Esca di Macallan 12: le guardie corrono a bere. Il suo badge apre le porte STAFF.' },
            { name: 'Furia tascabile', icon: '👊', range: 1.9, cd: 9, target: false, desc: 'Piccolo ma furioso: si scaglia sulla guardia più vicina e la stende.' },
        ],
        quips: ['Chi mi ha chiamato piccolo?!', 'Non sono basso, sono compatto!', 'Il badge ce l\'ho io. Quindi comando io.', 'Un metro e sessanta di pura rabbia!', 'Tenetemi... no, non tenetemi!'],
        castLines: [['Macallan 12. Che spreco...', 'Ecco, bevi e taci.'], ['RIPETILO SE HAI CORAGGIO!', 'CHI È PICCOLO?!', 'AAAARGH!']],
    },
    {
        id: 'muglo', name: 'Muglo', role: 'Il Grigliatore Pazzo', img: 'assets/1000081050.jpg',
        look: { skin: '#d79c74', shirt: '#f4f4f4', pants: '#1f2430', shoes: '#7a5a3a', hat: 'cowboy', hair: '#2a1d14', beard: '#2a1d14', beardKind: 'full', mouth: 'crazy', prop: 'tongs', eyes: 'crazy' },
        ab: [
            { name: 'Griglia fumogena', icon: '🔥', range: 6, cd: 14, target: true, desc: 'Piazza una griglia: il fumo blocca la vista e il profumo attira i curiosi.' },
            { name: 'Brace a mani nude', icon: '✋', range: 6, cd: 11, target: true, desc: 'Afferra i carboni ardenti senza guanti e li lancia: le guardie scappano urlando.' },
        ],
        quips: ['I guanti sono per i deboli.', 'Ho le mani di amianto.', 'Sento odore di arrosticini... o sono io?', 'Il fuoco è sempre amico.', 'Brace viva, cuore felice!'],
        castLines: [['Fumo e profumo!', 'Chi vuole una salsiccia?'], ['Tieni, è caldo! Hihihi!', 'Prendi al volo!', 'Senza guanti, come papà!']],
    },
    {
        id: 'unicorn', name: 'Unicorn', role: 'Mastro Birraio e Comico', img: 'assets/1000081046.jpg',
        look: { skin: '#c98d68', shirt: '#f2a7c8', pants: '#c8b48a', shoes: '#eee', hat: 'cap', capCol: '#2a62d1', hair: '#1d140e', beard: '#1d140e', beardKind: 'full', mouth: 'tongue', prop: 'mug', horn: true },
        ab: [
            { name: 'Pozione al luppolo', icon: '🍺', range: 5, cd: 12, target: true, desc: 'Lancia una provetta di birra speciale: chi è nel raggio crolla addormentato. Funziona anche sul Ministro.' },
            { name: 'Barzelletta', icon: '🤣', range: 4.2, cd: 13, target: false, desc: 'Racconta una barzelletta tremenda: le guardie vicine si piegano dal ridere e non vedono niente.' },
        ],
        quips: ['Il luppolo è una verdura. Quindi è dieta.', 'Io non sono pazzo, sono fermentato.', 'Hiiiiih! *nitrisce*', 'Sapete quella dell\'astemio? No? Meglio così.', 'Una birra al giorno toglie il Ministro di torno.'],
        castLines: [['Nanna al luppolo!', 'Doppio malto, doppio sonno!'], []],
        jokes: ['Un astemio entra in un bar... e sbatte la testa!', 'Perché il Ministro beve acqua? Perché il vino lo capisce!', 'Cosa fa una birra in palestra? La pinta!', 'Un ispettore dice all\'altro: "Sei sobrio?" "No, sono Gino!"'],
    },
    {
        id: 'proboscis', name: 'Proboscis', role: 'Il Negoziatore', img: 'assets/1000081042.jpg',
        look: { skin: '#dcaa84', shirt: '#1f2f5c', pants: '#c8b48a', shoes: '#7a4a2a', hat: 'none', hair: '#1d1612', beard: '#2a1f18', beardKind: 'full', mouth: 'smirk', prop: 'skewer', glasses: true },
        ab: [
            { name: 'Completo da agente', icon: '👔', range: 0, cd: 15, target: false, desc: 'Giacca, cravatta e cartellina VENDESI: da lontano le guardie lo ignorano e passa le porte STAFF.' },
            { name: 'Fuori misura', icon: '😳', range: 3.4, cd: 14, target: false, desc: 'Si "sistema i pantaloni" con nonchalance: le guardie vicine restano a bocca aperta, paralizzate.' },
        ],
        quips: ['Questa casa? Un affare. Come me.', 'Ho un\'offerta che non potete rifiutare.', 'Le dimensioni contano. Chiedete in giro.', 'Due punti, sempre. Anche a canestro.', 'Arrosticino? Ne ho uno bello lungo.'],
        castLines: [['Buongiorno, ha mai pensato di vendere?', 'Ottimo affare, firmi qui!'], ['Scusate, mi sistemo un attimo...', 'Occhi in alto, ragazzi.', 'Sì, è tutto vero.']],
    },
];

const GUARD_LOOK = { skin: '#efc39b', shirt: '#8cc4ec', pants: '#2d4a6b', shoes: '#222', hat: 'police', capCol: '#1f3b66', hair: '#5a4030', mustache: '#5a4030', mouth: 'flat', prop: 'clipboard' };
const BOSS_LOOK = { skin: '#f3c6a5', shirt: '#2a2a33', pants: '#222', shoes: '#111', hat: 'none', hair: '#ddd', bald: true, mustache: '#cfcfcf', mouth: 'flat', prop: 'water', fat: true, sash: true, brows: 'angry' };

const GUARD_LINES = {
    patrol: ['Acqua liscia o gassata?', 'Sobrietà è libertà.', 'Nessun brindisi durante il mio turno.', 'Ho sete... di giustizia.', 'Mi manca la camomilla.'],
    gas: ['Che tanfo!!', 'ARIA! ARIA!', 'Cos\'ha mangiato?!', 'Mamma... sto svenendo...'],
    punch: ['Ahia! Un chihuahua!', 'Era alto così!', 'Chi mi ha colpito?!'],
    flee: ['SCOTTA! SCOTTA!', 'Ha le mani di fuoco!', 'Mammaaaa!'],
    laugh: ['AHAHAH! Basta!', 'Mi fa male la pancia!', 'Ahahah... il luppolo!', 'Pfff... HAHAHA!'],
    stunned: ['Ma... è legale?!', 'Mi sento inadeguato...', 'Non ho visto niente. NIENTE.', 'Santo cielo...'],
    sleep: ['Zzz... luppolo...', 'Zzz... ancora un giro...', 'Ronf...'],
    wake: ['Eh? Mi sono appisolato?', 'Che mal di testa...', 'Non è successo niente!'],
    lure: ['?', 'Cos\'è?', 'Hm?'],
    boss: ['Solo acqua, grazie!', 'Il sedano è il futuro!', 'Brindare è reato!'],
};

const FAIL_LINES = [
    '"Alcol?! Acqua per tutti!" Il Ministro vi ha scoperti.',
    'Un Ispettore Acqua vi ha beccati e vi ha offerto una camomilla. Che umiliazione.',
    '"Sobrietà obbligatoria!" Vi trascinano via a bere tisane al finocchio.',
    'Condannati a sei mesi di analcolico. Tiepido.',
];


// ---------- costruttore di mappe ----------
// Legenda: # muro · , . p pavimenti · T albero · C oggetto del tema · D tavolo · E barile
// B muro crepato (solo dinamite) · K porta STAFF (badge/travestimento) · V condotto (solo Alcan)
// g cancello chiuso (si apre con uno step) · O postazione di uno step
function buildMap(W, H, fn) {
    const g = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => (x === 0 || y === 0 || x === W - 1 || y === H - 1) ? '#' : ','));
    const api = {
        fill(x0, y0, x1, y1, c) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = c; },
        room(x0, y0, x1, y1, f) { this.fill(x0, y0, x1, y1, '#'); this.fill(x0 + 1, y0 + 1, x1 - 1, y1 - 1, f); },
        set(c, ...pts) { pts.forEach(([x, y]) => { g[y][x] = c; }); },
    };
    fn(api);
    return g.map(r => r.join(''));
}

const IMMUNE_ALL = ['sleep', 'punch', 'laugh', 'stun', 'flee', 'lure'];
const asleep = tag => G => G.guards.some(g => g.tag === tag && g.mode === 'sleep');
const tileOpen = (x, y) => G => G.map[y][x] !== 'B';

// Ogni step: who = personaggio richiesto (null = chiunque), after = step da completare prima,
// x/y = postazione 'O' da raggiungere (premere E), oppure cond = condizione verificata da sola.
const MISSIONS = [
    {
        name: 'Missione 1: Salva il Ludwig Pub',
        hint: 'Muglo distrae l\'Ispettore Goloso, Estice sfonda il retro, Alcan striscia in cantina, Proboscis rinegozia il contratto e Unicorn spilla.',
        theme: { sky: ['#8fd0f5', '#d9f1ff'], a: '#8e8c88', b: '#86847f', c: '#cfcfcf', p: '#b98552', wT: '#2f6b44', wL: '#c2553d', wR: '#9a412e', timber: true, prop: 'car', obj: 'tap', mat: { ',': 'asphalt', '.': 'paving', p: 'wood' }, plate: 'Ludwig Pub · Roseto' },
        map: buildMap(38, 28, m => {
            m.room(6, 2, 26, 13, 'p');                  // pub
            m.fill(12, 3, 12, 12, '#');                 // retro | sala
            m.fill(7, 6, 11, 6, '#'); m.set('V', [9, 6]); // cantina con condotto
            m.set('B', [6, 8], [6, 9]);                 // muro crepato sul retro
            m.set('g', [19, 13], [20, 13]);             // ingresso sigillato
            m.set('O', [9, 4], [19, 4]);
            m.set('D', [15, 6], [15, 10], [23, 6], [23, 10]);
            m.set('E', [10, 11], [11, 11], [7, 12]);
            m.room(28, 3, 35, 10, 'p'); m.set('K', [31, 10]); m.set('O', [31, 6]); m.set('D', [33, 8]); // ufficio
            m.set('C', [8, 17], [9, 17], [13, 17], [14, 17], [24, 17], [25, 17], [29, 17], [30, 17],
                [8, 21], [9, 21], [17, 21], [18, 21], [27, 21], [28, 21], [32, 21], [33, 21]);
            m.set('T', [2, 3], [2, 4], [36, 3], [36, 4], [36, 13], [2, 25], [3, 25], [35, 25], [36, 25]);
        }),
        starts: [[15, 25], [17, 25], [19, 25], [21, 25], [23, 25]],
        guards: [
            { p: [[4, 10]], base: Math.PI / 2, sweep: .5, tag: 'goloso', foodie: true, fat: true, immune: IMMUNE_ALL, label: 'Ispettore Goloso' },
            { p: [[2, 19], [35, 19]] },
            { p: [[34, 15], [3, 15]] },
            { p: [[27, 12], [36, 12]] },
            { p: [[19, 8]], base: Math.PI / 2, sweep: 1 },
            { p: [[14, 11], [25, 11]] },
            { p: [[34, 5]], base: Math.PI, sweep: .7 },
        ],
        steps: [
            { id: 'distrai', who: 'muglo', text: 'Distrai l\'Ispettore Goloso con la griglia', cond: G => G.guards.some(g => g.tag === 'goloso' && g.mode === 'eat'), msg: 'L\'Ispettore Goloso molla il posto per le salsicce di Muglo!' },
            { id: 'muro', who: 'estice', text: 'Fai saltare il muro crepato del retro', cond: tileOpen(6, 8), msg: 'BOOM! Il retro del Ludwig è aperto.' },
            { id: 'co2', who: 'alcan', after: ['muro'], x: 9, y: 4, kind: 'valve', text: 'Striscia nel condotto e riapri la bombola del CO2', pop: 'FSSSS!', msg: 'Alcan è passato dove nessun altro entra: CO2 riaperto!' },
            { id: 'contratto', who: 'proboscis', disguise: true, x: 31, y: 6, kind: 'contract', opens: 'g', text: 'Rinegozia il contratto del pub (col completo)', pop: 'AFFARE FATTO!', msg: 'Proboscis firma un affitto a vita. L\'ingresso del Ludwig si riapre!' },
            { id: 'spina', who: 'unicorn', after: ['co2', 'contratto'], x: 19, y: 4, kind: 'tap', text: 'Spilla la prima birra', pop: 'PSSSHHH!', msg: 'La schiuma torna a scorrere: il Ludwig è salvo!' },
        ],
        signs: [{ x: 23.5, y: 14.5, title: 'Ludwig', sub: 'Pub', tag: 'LIVE MUSIC' }],
        intro: [
            { img: 'assets/ludwig.jpg', who: 'Roseto degli Abruzzi', line: 'Il Ludwig Pub è sotto sequestro. Niente birra, niente live music. Solo... acqua.' },
            { boss: true, who: 'Ministro Sobrio Astemi', line: 'Da oggi in Italia si brinda solo con acqua minerale. Naturale. A temperatura ambiente.' },
            { char: 'muglo', line: 'Sul retro c\'è l\'Ispettore Goloso. Non si sposta per niente al mondo... tranne che per le mie salsicce.' },
            { char: 'estice', line: 'Appena se ne va, quel muro crepato lo apro io. Con la dinamite. O con la cena di ieri.' },
            { char: 'alcan', line: 'Il CO2 è in cantina e ci si arriva solo dal condotto. Sì, lo so che ci passo solo io. NON DITELO.' },
            { char: 'proboscis', line: 'Io mi metto il completo e vado in ufficio a rinegoziare il contratto. Nessuno resiste al mio... potere contrattuale.' },
            { char: 'unicorn', line: 'E alla fine spillo io. Il Mastro Birraio sono io. Hiiiih!' },
        ],
        outro: [{ char: 'alcan', line: 'La spina è riaccesa! Chi offre il primo giro? Non io, ho le mani piccole.' }],
    },
    {
        name: 'Missione 2: Il Birrificio Sigillato',
        hint: 'Proboscis apre il cancello dalla reception, Unicorn fa ridere gli ispettori della caldaia mentre Muglo la accende, Estice sfonda il magazzino, Alcan spegne i sigilli.',
        theme: { sky: ['#3a3f52', '#6b7085'], a: '#a3acb1', b: '#98a1a6', c: '#a3acb1', p: '#c9a874', wT: '#5a3b30', wL: '#b0593e', wR: '#8a4430', timber: false, prop: 'barrel', obj: 'tank', steam: true, mat: { ',': 'concrete', '.': 'paving', p: 'wood' }, plate: 'Birrificio E-TEAM' },
        map: buildMap(40, 28, m => {
            m.room(2, 2, 13, 11, 'p'); m.set(',', [8, 11]); m.set('O', [5, 4]);              // sala cottura
            m.room(15, 2, 24, 11, 'p'); m.set('B', [19, 11], [20, 11]); m.set('O', [19, 5]);  // magazzino
            m.set('E', [16, 3], [17, 3], [23, 9]);
            m.room(27, 2, 37, 11, 'p'); m.fill(28, 6, 36, 6, '#'); m.set('V', [32, 6]);       // fermentazione + sala controllo
            m.set(',', [32, 11]); m.set('O', [32, 3], [30, 8]); m.set('E', [34, 8], [35, 8]);
            m.fill(1, 14, 38, 14, '#'); m.set('g', [20, 14], [21, 14]);                        // recinzione
            m.room(2, 16, 12, 22, 'p'); m.set(',', [7, 22]); m.set('O', [7, 18]);             // reception
            m.set('C', [16, 18], [17, 18], [25, 18], [26, 18], [31, 21], [32, 21], [16, 22], [35, 17]);
            m.set('T', [37, 24], [37, 25], [14, 25], [30, 25]);
        }),
        starts: [[18, 25], [20, 25], [22, 25], [24, 25], [26, 25]],
        guards: [
            { p: [[4, 7]], base: -Math.PI / 2, sweep: .4, tag: 'cottura', immune: ['sleep', 'stun', 'punch'], label: 'Ispettore al caffè' },
            { p: [[7, 7]], base: -Math.PI / 2, sweep: .4, tag: 'cottura', immune: ['sleep', 'stun', 'punch'], label: 'Ispettore al caffè' },
            { p: [[22, 5]], base: Math.PI, sweep: .8 },
            { p: [[3, 13], [37, 13]] },
            { p: [[28, 9], [36, 9]] },
            { p: [[14, 17], [37, 17]] },
            { p: [[37, 20], [14, 20]] },
            { p: [[10, 19]], base: Math.PI, sweep: .6 },
        ],
        steps: [
            { id: 'reception', who: 'proboscis', disguise: true, x: 7, y: 18, kind: 'reception', opens: 'g', text: 'Registrati alla reception (col completo)', pop: 'BENVENUTO!', msg: '"Prego, dottore!" Il cancello del birrificio si apre.' },
            { id: 'ridi', who: 'unicorn', text: 'Fai ridere gli ispettori della caldaia (insonni: pozioni inutili)', cond: G => G.guards.some(g => g.tag === 'cottura' && g.mode === 'laugh'), msg: 'Gli ispettori si piegano dal ridere: la caldaia è libera!' },
            { id: 'caldaia', who: 'muglo', after: ['ridi'], x: 5, y: 4, kind: 'boiler', text: 'Accendi la caldaia a mani nude', pop: 'FWOOSH!', msg: 'Muglo infila le mani nel fuoco. La caldaia ruggisce!' },
            { id: 'muro', who: 'estice', text: 'Sfonda la parete del magazzino', cond: tileOpen(19, 11), msg: 'BOOM! Il magazzino del luppolo è aperto.' },
            { id: 'luppolo', who: null, after: ['muro'], x: 19, y: 5, kind: 'sacks', text: 'Recupera i sacchi di luppolo', pop: 'LUPPOLO!', msg: 'Sacchi di luppolo fresco recuperati!' },
            { id: 'sigilli', who: 'alcan', x: 32, y: 3, kind: 'panel', text: 'Entra nel condotto e spegni i sigilli elettronici', pop: 'CLICK!', msg: 'Alcan prende a pugni il quadro elettrico. Sigilli disattivati!' },
            { id: 'fermentatori', who: 'unicorn', after: ['caldaia', 'luppolo', 'sigilli'], x: 30, y: 8, kind: 'tank', text: 'Riavvia i fermentatori', pop: 'GLUGLUGLU!', msg: 'Unicorn accarezza il fermentatore: "Brava, piccola." La birra è salva!' },
        ],
        signs: [],
        intro: [
            { char: 'unicorn', line: 'Hanno sigillato il MIO birrificio. I fermentatori piangono. Li sento.' },
            { boss: true, who: 'Ministro Sobrio Astemi', line: 'Il luppolo verrà riconvertito in tisana rilassante. Per decreto!' },
            { char: 'proboscis', line: 'Il cancello si apre solo dalla reception. Lasciate fare all\'agente immobiliare.' },
            { char: 'muglo', line: 'Per riavviare tutto serve la caldaia accesa. Ma ci sono due ispettori che bevono solo caffè: non dormono MAI.' },
            { char: 'unicorn', line: 'Non dormono? Allora li faccio ridere. Tu intanto corri alla caldaia.' },
            { char: 'alcan', line: 'I sigilli elettronici sono in sala controllo. C\'è un condotto... ok, ho capito, vado io.' },
        ],
        outro: [{ char: 'unicorn', line: 'Senti come gorgogliano! Il suono più bello del mondo... dopo la mia risata. Hiiiih!' }],
    },
    {
        name: 'Missione 3: La Sagra degli Arrosticini',
        hint: 'Estice apre il capanno, Muglo accende la griglia e attira tutti, Proboscis prenota il palco, Alcan ruba il timbro, Unicorn addormenta il Ministro.',
        theme: { sky: ['#ffb36b', '#ffe3b0'], a: '#8cc65a', b: '#7fbb4d', c: '#e6d6b4', p: '#b8323a', wT: '#f6f0e0', wL: '#d9534f', wR: '#b94441', timber: false, prop: 'table', obj: 'desk', stripes: true, mat: { ',': 'grass', '.': 'paving', p: 'carpet' }, plate: 'Sagra degli Arrosticini' },
        map: buildMap(40, 30, m => {
            m.room(12, 1, 31, 9, 'p'); m.set('K', [21, 9]); m.set('O', [21, 3]); m.set('D', [15, 4], [27, 4]); // tendone del Ministro
            m.room(31, 1, 38, 9, 'p'); m.set('V', [35, 9]); m.set('O', [35, 3]);                               // retropalco
            m.fill(1, 12, 38, 12, '#'); m.set('g', [20, 12], [21, 12]);                                       // recinzione VIP
            m.room(2, 14, 9, 20, 'p'); m.set('B', [9, 17], [9, 18]); m.set('O', [5, 16]);                       // capanno
            m.set('O', [20, 20]);                                                                                // griglia gigante
            m.room(30, 15, 37, 21, 'p'); m.set(',', [33, 21]); m.set('O', [33, 17]);                           // gazebo organizzatori
            m.set('C', [16, 18], [17, 18], [23, 18], [24, 18], [16, 23], [17, 23], [23, 23], [24, 23]);
            m.set('T', [2, 22], [3, 22], [37, 24], [37, 25], [36, 27], [2, 10], [38, 10]);
        }),
        starts: [[14, 27], [16, 27], [18, 27], [20, 27], [22, 27]],
        guards: [
            { p: [[21, 5]], base: Math.PI / 2, sweep: .9, boss: true, label: 'Ministro Sobrio Astemi' },
            { p: [[13, 10], [30, 10]] },
            { p: [[19, 14]], base: Math.PI / 2, sweep: .5 },
            { p: [[22, 14]], base: Math.PI / 2, sweep: .5 },
            { p: [[3, 25], [36, 25]] },
            { p: [[11, 14], [11, 24]] },
            { p: [[28, 22], [28, 14]] },
            { p: [[36, 18]], base: Math.PI, sweep: .6 },
        ],
        steps: [
            { id: 'capanno', who: 'estice', text: 'Sfonda il capanno della carbonella', cond: tileOpen(9, 17), msg: 'BOOM! Il capanno è aperto.' },
            { id: 'carbonella', who: null, after: ['capanno'], x: 5, y: 16, kind: 'crate', text: 'Prendi la carbonella', pop: 'CARBONELLA!', msg: 'Sacchi di carbonella pronti per la griglia!' },
            { id: 'griglia', who: 'muglo', after: ['carbonella'], x: 20, y: 20, kind: 'grill', feast: true, text: 'Accendi la griglia gigante (attira tutte le guardie)', pop: 'FWOOSH!', msg: 'Profumo di arrosticini: tutti gli ispettori corrono a mangiare!' },
            { id: 'palco', who: 'proboscis', disguise: true, x: 33, y: 17, kind: 'reception', opens: 'g', text: 'Prenota il palco dagli organizzatori (col completo)', pop: 'PRENOTATO!', msg: 'Proboscis vende il palco due volte. Il cancello VIP si apre!' },
            { id: 'timbro', who: 'alcan', after: ['palco'], x: 35, y: 3, kind: 'safe', text: 'Entra dal condotto e ruba il timbro ufficiale', pop: 'PRESO!', msg: 'Alcan ha il timbro del Ministero. Piccolo, ma letale.' },
            { id: 'ministro', who: 'unicorn', text: 'Addormenta il Ministro con la pozione al luppolo', cond: asleep('boss'), msg: 'Il Ministro russa come un trombone!' },
            { id: 'firma', who: null, asleep: 'boss', after: ['timbro', 'ministro'], x: 21, y: 3, kind: 'desk', text: 'Timbra il decreto "Arrosticini liberi" mentre dorme', lock: 'Il Ministro è sveglio e ti fissa: "Solo acqua, grazie!"', pop: 'FIRMATO!', msg: 'Timbrato nel sonno! L\'Italia torna a brindare. Salute!' },
        ],
        signs: [],
        intro: [
            { boss: true, who: 'Ministro Sobrio Astemi', line: 'La Sagra degli Arrosticini è ABOLITA! Al suo posto: Festa del Sedano Bollito!' },
            { char: 'estice', line: 'La carbonella è chiusa nel capanno. Ci penso io: tappatevi il naso, o le orecchie.' },
            { char: 'muglo', line: 'Con la carbonella accendo la griglia gigante. Al profumo degli arrosticini non resiste nessun ispettore.' },
            { char: 'proboscis', line: 'Io prenoto il palco e mi faccio aprire il cancello VIP.' },
            { char: 'alcan', line: 'Il timbro è nel retropalco. Condotto. Lo so. LO SO.' },
            { char: 'unicorn', line: 'E io faccio fare la nanna al Ministro. Una pozione e via.' },
        ],
        outro: [
            { char: 'muglo', line: 'Arrosticini per tutti! Anche per il Ministro, quando si sveglia.' },
            { boss: true, who: 'Ministro Sobrio Astemi', line: '*sbadiglio* Mmm... che profumo... e questa birra... è BUONISSIMA! Decreto abolito!' },
        ],
    },
];
