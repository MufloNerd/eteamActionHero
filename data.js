'use strict';
// Dati di gioco: personaggi, battute, missioni.

const OUT = '#1d1a22';

const CHARS = [
    {
        id: 'estice', name: 'Estice', role: 'Il Demolitore', img: 'assets/1000081068.jpg', box: 'assets/scatole/estice.png',
        look: { skin: '#e2a982', shirt: '#2f9a55', jacket: '#8a5a2b', pants: '#7a6a48', shoes: '#4a3424', hat: 'miner', hair: '#3a2a1e', beard: '#4a3526', beardKind: 'short', mouth: 'grin', prop: 'pickaxe' },
        ab: [
            { name: 'Dinamite', icon: '🧨', range: 6, cd: 18, charges: 3, target: true, desc: 'Lancia un candelotto: spacca le barricate, stordisce chi è vicino, ma fa un gran fracasso.' },
            { name: 'Peto letale', icon: '💨', range: 0, cd: 24, charges: 3, target: false, desc: 'Una nube verde tossica avvolge Estice: chi gli è accanto sviene. Chi è più lontano viene a controllare.' },
        ],
        quips: ['Stamattina fagioli e cipolle. Statemi lontani.', 'Un buco nel muro risolve tutto.', 'Scavo, scoppio, scappo.', 'Prrr... scusate. Era la miccia. Giuro.', 'Il mio stomaco è un\'arma non convenzionale.'],
        castLines: [['BOOM in arrivo!', 'Tappatevi le orecchie!'], ['Arma chimica in arrivo!', 'Scusate in anticipo.', 'Respirate con la bocca!']],
    },
    {
        id: 'alcan', name: 'Alcan', role: "L'Infiltrato", img: 'assets/1000081064.jpg', box: 'assets/scatole/alcan.png',
        look: { skin: '#f0c4a0', shirt: '#1f2f6b', pants: '#3b5f9a', shoes: '#333', hat: 'none', hair: '#4a3020', mouth: 'angry', brows: 'angry', prop: 'whisky', badge: true, small: true },
        ab: [
            { name: 'Whisky 12', icon: '🥃', range: 7, cd: 15, charges: 3, target: true, desc: 'Esca di Macallan 12: le guardie corrono a bere. Il suo badge apre le porte STAFF.' },
            { name: 'Furia tascabile', icon: '👊', range: 1.9, cd: 14, charges: 4, target: false, desc: 'Piccolo ma furioso: si scaglia sulla guardia più vicina e la stende.' },
        ],
        quips: ['Chi mi ha chiamato piccolo?!', 'Non sono basso, sono compatto!', 'Il badge ce l\'ho io. Quindi comando io.', 'Un metro e sessanta di pura rabbia!', 'Tenetemi... no, non tenetemi!'],
        castLines: [['Macallan 12. Che spreco...', 'Ecco, bevi e taci.'], ['RIPETILO SE HAI CORAGGIO!', 'CHI È PICCOLO?!', 'AAAARGH!']],
    },
    {
        id: 'muglo', name: 'Muglo', role: 'Il Grigliatore Pazzo', img: 'assets/1000081050.jpg', box: 'assets/scatole/muglo.png',
        look: { skin: '#d79c74', shirt: '#f4f4f4', pants: '#1f2430', shoes: '#7a5a3a', hat: 'cowboy', hair: '#2a1d14', beard: '#2a1d14', beardKind: 'full', mouth: 'crazy', prop: 'tongs', eyes: 'crazy' },
        ab: [
            { name: 'Griglia fumogena', icon: '🔥', range: 6, cd: 20, charges: 3, target: true, desc: 'Piazza una griglia: il fumo blocca la vista e il profumo attira i curiosi.' },
            { name: 'Brace a mani nude', icon: '✋', range: 6, cd: 17, charges: 3, target: true, desc: 'Afferra i carboni ardenti senza guanti e li lancia: le guardie scappano urlando.' },
        ],
        quips: ['I guanti sono per i deboli.', 'Ho le mani di amianto.', 'Sento odore di arrosticini... o sono io?', 'Il fuoco è sempre amico.', 'Brace viva, cuore felice!'],
        castLines: [['Fumo e profumo!', 'Chi vuole una salsiccia?'], ['Tieni, è caldo! Hihihi!', 'Prendi al volo!', 'Senza guanti, come papà!']],
    },
    {
        id: 'unicorn', name: 'Unicorn', role: 'Mastro Birraio e Comico', img: 'assets/1000081046.jpg', box: 'assets/scatole/unicorn.png',
        look: { skin: '#c98d68', shirt: '#f2a7c8', pants: '#c8b48a', shoes: '#eee', hat: 'cap', capCol: '#2a62d1', hair: '#1d140e', beard: '#1d140e', beardKind: 'full', mouth: 'tongue', prop: 'mug', horn: true },
        ab: [
            { name: 'Pozione al luppolo', icon: '🍺', range: 5, cd: 18, charges: 3, target: true, desc: 'Lancia una provetta di birra speciale: chi è nel raggio crolla addormentato. Funziona anche sul Ministro.' },
            { name: 'Barzelletta', icon: '🤣', range: 4.2, cd: 20, charges: 3, target: false, desc: 'Racconta una barzelletta tremenda: le guardie vicine si piegano dal ridere e non vedono niente.' },
        ],
        quips: [
            'Alcan, se ti metti in punta di piedi arrivi quasi al bancone.',
            'Estice, la dinamite non fa paura. Quello che hai mangiato sì.',
            'Muglo prende la brace a mani nude. Il cervello invece l\'ha lasciato nel forno.',
            'Proboscis si vanta delle misure. Peccato che il QI non sia compreso nel pacchetto.',
            'Il Ministro beve acqua da quarant\'anni. E si vede: è insapore pure lui.',
            'Sobrio io? L\'ultima volta è stato al battesimo. E ho pianto.',
            'Queste guardie sono come l\'analcolica: inutili, tiepide e nessuno le ha ordinate.',
        ],
        castLines: [
            ['Bevi, che da sveglio sei pure peggio.', 'Buonanotte, carriera.', 'Prima birra della tua vita. Goditi il coma.'],
            ['Attenti, questa fa male.', 'Ne ho una sul vostro stipendio. Fa piangere.'],
        ],
        jokes: [
            'Sapete perché il Ministro beve solo acqua? Perché nessuno gli ha mai offerto da bere.',
            'Voi ispettori siete come la birra analcolica: nessuno vi ha chiesti, ma tocca sopportarvi.',
            'Il tuo capo dice che sei insostituibile. Nel senso che nessuno vuole il tuo posto.',
            'Sai la differenza tra te e una camomilla? La camomilla qualcuno la sceglie.',
            'Ti hanno messo di guardia perché a casa non ti vuole nessuno, vero?',
            'Il Ministro ha un solo vizio: esistere.',
        ],
    },
    {
        id: 'proboscis', name: 'Proboscis', role: 'Il Negoziatore', img: 'assets/1000081042.jpg', box: 'assets/scatole/proboscis.png',
        look: { skin: '#dcaa84', shirt: '#1f2f5c', pants: '#c8b48a', shoes: '#7a4a2a', hat: 'none', hair: '#1d1612', beard: '#2a1f18', beardKind: 'full', mouth: 'smirk', prop: 'skewer', glasses: true },
        ab: [
            { name: 'Completo da agente', icon: '👔', range: 0, cd: 22, charges: 2, target: false, desc: 'Giacca, cravatta e cartellina VENDESI: le guardie lo notano solo da vicino e passa le porte STAFF. Se corre o resta a lungo sotto gli occhi di una guardia, viene smascherato.' },
            { name: 'Fuori misura', icon: '😳', range: 3.4, cd: 20, charges: 3, target: false, desc: 'Si "sistema i pantaloni" con nonchalance: le guardie vicine restano a bocca aperta, paralizzate.' },
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
        secrets: [[8, 3], [36, 26], [25, 12]], par: 300,
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
            { id: 'distrai', who: 'muglo', text: 'Allontana l\'Ispettore Goloso dal retro', hint: 'Si chiama Goloso per un motivo. Niente lo smuove... tranne il profumo giusto.', cond: G => G.guards.some(g => g.tag === 'goloso' && g.mode === 'eat'), msg: 'L\'Ispettore Goloso molla il posto per le salsicce di Muglo!' },
            { id: 'muro', who: 'estice', text: 'Apri un varco nel muro crepato del retro', hint: 'Serve qualcosa che faccia BOOM. Tanto BOOM.', cond: tileOpen(6, 8), msg: 'BOOM! Il retro del Ludwig è aperto.' },
            { id: 'co2', who: 'alcan', after: ['muro'], x: 9, y: 4, kind: 'valve', text: 'Riapri la bombola del CO2 in cantina', hint: 'In cantina si entra solo da un condotto minuscolo. Serve qualcuno... compatto.', pop: 'FSSSS!', msg: 'Alcan è passato dove nessun altro entra: CO2 riaperto!' },
            { id: 'contratto', who: 'proboscis', disguise: true, x: 31, y: 6, kind: 'contract', opens: 'g', text: 'Riapri l\'ingresso sigillato del pub', hint: 'Il contratto è in ufficio, oltre una porta STAFF. Serve chi sa vendere, vestito da professionista.', pop: 'AFFARE FATTO!', msg: 'Proboscis firma un affitto a vita. L\'ingresso del Ludwig si riapre!' },
            { id: 'spina', who: 'unicorn', after: ['co2', 'contratto'], x: 19, y: 4, kind: 'tap', text: 'Spilla la prima birra', hint: 'Quella spina la può toccare solo il Mastro Birraio.', pop: 'PSSSHHH!', msg: 'La schiuma torna a scorrere: il Ludwig è salvo!' },
        ],
        signs: [{ x: 23.5, y: 14.5, title: 'Ludwig', sub: 'Pub', tag: 'LIVE MUSIC' }],
        intro: [
            { img: 'assets/sprites/ludwig.jpeg', who: 'Roseto degli Abruzzi', line: 'Il Ludwig Pub è sotto sequestro. Niente birra, niente live music. Solo... acqua.' },
            { boss: true, who: 'Ministro Sobrio Astemi', line: 'Da oggi in Italia si brinda solo con acqua minerale. Naturale. A temperatura ambiente.' },
            { char: 'muglo', line: 'Sul retro c\'è l\'Ispettore Goloso. Non si sposta per niente al mondo. O quasi.' },
            { char: 'estice', line: 'Quel muro sul retro è crepato. Mi parla. Mi dice: "fammi esplodere".' },
            { char: 'alcan', line: 'Se qualcuno pronuncia la parola "condotto" guardandomi, giuro che lo mordo.' },
            { char: 'proboscis', line: 'Ogni sigillo ha un contratto. Ogni contratto ha una clausola. E io ho un completo.' },
            { char: 'unicorn', line: 'E alla fine spillo io, perché voi la birra la sapete solo bere. Male.' },
        ],
        outro: [
            { char: 'alcan', line: 'La spina è riaccesa! Chi offre il primo giro? Non io, ho le mani piccole.' },
            { char: 'unicorn', line: 'Tranquillo Alcan, per te c\'è il boccale piccolo. Così ci arrivi.' },
        ],
    },
    {
        name: 'Missione 2: Il Birrificio Sigillato',
        secrets: [[3, 3], [36, 3], [3, 26]], par: 420,
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
            { p: [[10, 17]], base: 2.55, sweep: .35, label: 'Receptionist' },
        ],
        steps: [
            { id: 'reception', who: 'proboscis', disguise: true, x: 7, y: 18, kind: 'reception', opens: 'g', text: 'Fatti aprire il cancello del birrificio', hint: 'Alla reception ricevono solo gente in giacca e cravatta.', pop: 'BENVENUTO!', msg: '"Prego, dottore!" Il cancello del birrificio si apre.' },
            { id: 'ridi', who: 'unicorn', text: 'Distrai gli ispettori della sala cottura', hint: 'Bevono solo caffè: non dormono e non si stupiscono. Ma il senso dell\'umorismo...', cond: G => G.guards.some(g => g.tag === 'cottura' && g.mode === 'laugh'), msg: 'Gli ispettori si piegano dal ridere: la caldaia è libera!' },
            { id: 'caldaia', who: 'muglo', after: ['ridi'], x: 5, y: 4, kind: 'boiler', text: 'Accendi la caldaia', hint: 'Serve qualcuno che non abbia paura di bruciarsi le mani.', pop: 'FWOOSH!', msg: 'Muglo infila le mani nel fuoco. La caldaia ruggisce!' },
            { id: 'muro', who: 'estice', text: 'Entra nel magazzino del luppolo', hint: 'La parete è sottile. Esplosivamente sottile.', cond: tileOpen(19, 11), msg: 'BOOM! Il magazzino del luppolo è aperto.' },
            { id: 'luppolo', who: null, after: ['muro'], x: 19, y: 5, kind: 'sacks', text: 'Recupera i sacchi di luppolo', hint: 'Chiunque può portarli.', pop: 'LUPPOLO!', msg: 'Sacchi di luppolo fresco recuperati!' },
            { id: 'sigilli', who: 'alcan', x: 32, y: 3, kind: 'panel', text: 'Spegni i sigilli elettronici', hint: 'La sala controllo ha solo un condotto d\'aria. Stretto. Molto stretto.', pop: 'CLICK!', msg: 'Alcan prende a pugni il quadro elettrico. Sigilli disattivati!' },
            { id: 'fermentatori', who: 'unicorn', after: ['caldaia', 'luppolo', 'sigilli'], x: 30, y: 8, kind: 'tank', text: 'Riavvia i fermentatori', hint: 'I fermentatori obbediscono solo al loro birraio.', pop: 'GLUGLUGLU!', msg: 'Unicorn accarezza il fermentatore: "Almeno tu non mi deludi." La birra è salva!' },
        ],
        signs: [],
        intro: [
            { char: 'unicorn', line: 'Hanno sigillato il mio birrificio. Pensavo che il Ministro sapesse rovinare solo le feste.' },
            { boss: true, who: 'Ministro Sobrio Astemi', line: 'Il luppolo verrà riconvertito in tisana rilassante. Per decreto!' },
            { char: 'proboscis', line: 'Un cancello chiuso è solo una trattativa che non è ancora iniziata.' },
            { char: 'muglo', line: 'Senza caldaia niente birra. E la sorvegliano due ispettori che bevono solo caffè: non dormono MAI.' },
            { char: 'unicorn', line: 'Gente che beve solo caffè. Hanno già la faccia di chi ha bisogno di una risata. O di uno psicologo.' },
            { char: 'alcan', line: 'Sala controllo, sigilli elettronici... perché mi state guardando tutti? PERCHÉ?' },
        ],
        outro: [{ char: 'unicorn', line: 'Senti come gorgogliano. È il suono di un Ministro che perde.' }],
    },
    {
        name: 'Missione 3: La Sagra degli Arrosticini',
        secrets: [[37, 2], [3, 15], [38, 28]], par: 480,
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
            { p: [[35, 17]], base: 2.4, sweep: .3, label: 'Organizzatore' },
        ],
        steps: [
            { id: 'capanno', who: 'estice', text: 'Entra nel capanno della carbonella', hint: 'Chiave? No. Dinamite.', cond: tileOpen(9, 17), msg: 'BOOM! Il capanno è aperto.' },
            { id: 'carbonella', who: null, after: ['capanno'], x: 5, y: 16, kind: 'crate', text: 'Prendi la carbonella', hint: 'Chiunque può prenderla.', pop: 'CARBONELLA!', msg: 'Sacchi di carbonella pronti per la griglia!' },
            { id: 'griglia', who: 'muglo', after: ['carbonella'], x: 20, y: 20, kind: 'grill', feast: true, text: 'Accendi la griglia gigante', hint: 'Solo un pazzo del barbecue la accende. E quando è accesa, nessuna guardia resiste.', pop: 'FWOOSH!', msg: 'Profumo di arrosticini: tutti gli ispettori corrono a mangiare!' },
            { id: 'palco', who: 'proboscis', disguise: true, x: 33, y: 17, kind: 'reception', opens: 'g', text: 'Fatti aprire il cancello VIP', hint: 'Gli organizzatori ascoltano solo chi sembra un professionista.', pop: 'PRENOTATO!', msg: 'Proboscis vende il palco due volte. Il cancello VIP si apre!' },
            { id: 'timbro', who: 'alcan', after: ['palco'], x: 35, y: 3, kind: 'safe', text: 'Ruba il timbro ufficiale dal retropalco', hint: 'Nel retropalco si entra da un condotto. Ci passa uno solo di voi.', pop: 'PRESO!', msg: 'Alcan ha il timbro del Ministero. Piccolo, ma letale.' },
            { id: 'ministro', who: 'unicorn', text: 'Neutralizza il Ministro', hint: 'Una pozione speciale, lanciata da fuori dal tendone...', cond: asleep('boss'), msg: 'Il Ministro russa come un trombone!' },
            { id: 'firma', who: null, asleep: 'boss', after: ['timbro', 'ministro'], x: 21, y: 3, kind: 'desk', text: 'Timbra il decreto "Arrosticini liberi"', hint: 'Fallo mentre il Ministro dorme. Serve chi passa le porte STAFF.', lock: 'Il Ministro è sveglio e ti fissa: "Solo acqua, grazie!"', pop: 'FIRMATO!', msg: 'Timbrato nel sonno! L\'Italia torna a brindare. Salute!' },
        ],
        signs: [],
        intro: [
            { boss: true, who: 'Ministro Sobrio Astemi', line: 'La Sagra degli Arrosticini è ABOLITA! Al suo posto: Festa del Sedano Bollito!' },
            { char: 'estice', line: 'La carbonella è chiusa nel capanno. Tappatevi il naso, o le orecchie. Dipende da come mi gira.' },
            { char: 'muglo', line: 'Datemi carbone e una griglia, e vi porto mezzo Ministero a cena.' },
            { char: 'proboscis', line: 'Il cancello VIP? Lì dentro c\'è gente che compra. Fidatevi.' },
            { char: 'alcan', line: 'Il timbro è nel retropalco. No. Non lo dite. NON DITE QUELLA PAROLA.' },
            { char: 'unicorn', line: 'E io metto a nanna il Ministro. Sarà la prima cosa utile che fa da anni.' },
        ],
        outro: [
            { char: 'muglo', line: 'Arrosticini per tutti! Anche per il Ministro, quando si sveglia.' },
            { boss: true, who: 'Ministro Sobrio Astemi', line: '*sbadiglio* Mmm... che profumo... e questa birra... è BUONISSIMA! Decreto abolito!' },
        ],
    },
];

// ---------- battute contestuali: [chi parla ('*' = chiunque), frase] ----------
// {name} = personaggio coinvolto nell'evento
const BANTER = {
    gas: [
        ['unicorn', 'Estice, quella non era una scoreggia. Era un\'arma di distruzione di massa.'],
        ['unicorn', 'Complimenti Estice: hai appena violato la Convenzione di Ginevra.'],
        ['alcan', 'Sono basso, Estice! Arriva tutto a me per primo!'],
        ['muglo', 'Profuma di brace... no, aspetta. No. NO.'],
        ['proboscis', 'Questo abbassa il valore dell\'immobile del trenta per cento.'],
    ],
    boom: [
        ['unicorn', 'Discreto come sempre, Estice. Un elefante in cristalleria avrebbe fatto meno casino.'],
        ['alcan', 'Avvisa! Mi è salito il cuore in gola. Che per me è a un metro da terra.'],
        ['muglo', 'Bel fuoco! Ci posso cuocere qualcosa?'],
    ],
    punch: [
        ['unicorn', 'Alcan ha colpito al ginocchio. Ovvio, è lì che arriva.'],
        ['unicorn', 'Steso da uno alto un metro e sessanta. Si sveglierà umiliato.'],
        ['estice', 'Piccolo ma cattivo. Come un peperoncino.'],
    ],
    joke: [
        ['estice', 'Unicorn, le tue battute addormentano più delle tue pozioni.'],
        ['alcan', 'Ridono solo perché hanno pietà di te.'],
        ['proboscis', 'Cattivo. Mi piace.'],
    ],
    potion: [
        ['unicorn', 'Dormi tranquillo. Tanto da sveglio non servivi a niente.'],
        ['muglo', 'Che spreco di birra buona.'],
    ],
    wow: [
        ['unicorn', 'Proboscis, mettilo via. Qui c\'è gente che lavora.'],
        ['unicorn', 'L\'unica cosa grossa di Proboscis è l\'ego. Ah, no. Aspetta.'],
        ['alcan', 'Ok, questo spiega perché le guardie non si muovono.'],
    ],
    disguise: [
        ['unicorn', 'Proboscis in giacca e cravatta: sembra un truffatore. Ah no, è proprio un truffatore.'],
        ['muglo', 'Elegantissimo! Sembri uno che vende pentole.'],
    ],
    ember: [
        ['unicorn', 'Muglo, ti fuma la mano. Lo dico per te.'],
        ['estice', 'Ha preso la brace a mani nude. Di nuovo. Chiamate un medico. O un esorcista.'],
    ],
    whisky: [
        ['unicorn', 'Un Macallan 12 buttato per terra. Alcan, sei un criminale.'],
        ['muglo', 'Spreco! Ci potevo marinare una costata!'],
    ],
    capture: [
        ['unicorn', '{name} si è fatto beccare. Sorpresa zero.'],
        ['unicorn', '{name} in cella sobria. Finalmente un posto adatto a lui.'],
        ['*', 'Tieni duro, {name}! Arriviamo!'],
    ],
    free: [
        ['unicorn', 'Liberato. Ora prova a non farti prendere per almeno trenta secondi. Record personale.'],
        ['*', 'Fuori di lì, si torna a lavorare!'],
    ],
    alarm: [
        ['unicorn', 'Complimenti a tutti: abbiamo svegliato il quartiere.'],
        ['alcan', 'Ci hanno visti! Chi è stato? Non guardate me!'],
        ['proboscis', 'Calma. Sorridete e fingete di essere agenti immobiliari.'],
    ],
    step: [
        ['unicorn', 'Un passo avanti. Incredibile, con questa squadra.'],
        ['unicorn', 'Ogni tanto ne azzeccate una. Statistica pura.'],
        ['muglo', 'Si va! La vittoria sa di salsiccia!'],
        ['estice', 'Ottimo lavoro! Festeggio con un peto. Scherzo. Forse.'],
    ],
    feast: [
        ['unicorn', 'Guardateli. Basta un arrosticino e la legge va in vacanza.'],
        ['muglo', 'MANGIATE, FIGLI MIEI!'],
    ],
    secret: [
        ['unicorn', 'Una bottiglia nascosta. La cosa più intelligente trovata oggi.'],
        ['*', 'Bottiglia segreta! Questa non la dividiamo.'],
    ],
    sync: [
        ['unicorn', 'Un piano coordinato. Chi siete e cosa avete fatto ai miei amici?'],
        ['proboscis', 'Sincronia perfetta. Come una trattativa ben riuscita.'],
    ],
};

// Dialoghi a coppie quando la squadra è ferma
const BANTER_PAIRS = [
    [['alcan', 'Unicorn, smettila di guardarmi dall\'alto.'], ['unicorn', 'Non è colpa mia, è la prospettiva. Tutta quanta.']],
    [['estice', 'Ho fame.'], ['unicorn', 'No. L\'ultima volta che hai mangiato è crollato un muro.']],
    [['proboscis', 'Vi ho mai raccontato di quella volta che...'], ['unicorn', 'Sì. Diciotto volte. Ogni volta più lunga.']],
    [['muglo', 'Secondo voi la brace si può mangiare?'], ['unicorn', 'Muglo, ti voglio bene, ma la risposta è no.']],
    [['unicorn', 'Quando finiamo offro io.'], ['alcan', 'Quando mai hai offerto tu?!']],
    [['estice', 'Sento un rumore...'], ['unicorn', 'È il tuo stomaco, Estice. Lo sentono fino a Pescara.']],
    [['proboscis', 'Sono l\'uomo più affascinante della squadra.'], ['unicorn', 'Con questa squadra è come essere il più alto dei puffi.']],
    [['muglo', 'Unicorn, perché hai un corno in testa?'], ['unicorn', 'Per distinguermi da voi. Serve un segno di intelligenza.']],
];

// Dietro le quinte, sbloccati con le bottiglie segrete
const PAPERE = [
    'Ciak 12: Estice ha fatto saltare il set. Quello vero. Il regista è ancora sotto choc.',
    'Ciak 27: Alcan non arrivava al microfono. Abbiamo usato una cassa di birre come sgabello.',
    'Ciak 33: Muglo ha preso la brace a mani nude. Non era nel copione.',
    'Ciak 41: Unicorn ha fatto una battuta al tecnico delle luci. Il tecnico si è licenziato.',
    'Ciak 48: Proboscis si è "sistemato i pantaloni" davanti alla troupe. Dodici ciak da rifare. Per lo shock.',
    'Ciak 52: Il Ministro Astemi era ubriaco fradicio. "Era succo di mela", giura.',
    'Ciak 60: L\'Ispettore Goloso si è mangiato tutti gli oggetti di scena. Anche quelli di plastica.',
    'Ciak 73: Estice e Unicorn chiusi nella stessa stanza. Studio evacuato.',
    'Ciak 99: Fine delle riprese. Tutti al Ludwig. Paga Alcan.',
];
