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
            { name: 'Barzelletta', icon: '🤣', range: 3.6, cd: 13, target: false, desc: 'Racconta una barzelletta tremenda: le guardie vicine si piegano dal ridere e non vedono niente.' },
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

const MISSIONS = [
    {
        name: 'Missione 1: Salva il Ludwig Pub',
        hint: 'Due ingressi: la barricata (Estice) o la porta STAFF (Alcan col badge). Dentro c\'è un ispettore: distrailo!',
        theme: { sky: ['#8fd0f5', '#d9f1ff'], a: '#8e8c88', b: '#86847f', c: '#cfcfcf', p: '#b98552', wT: '#2f6b44', wL: '#c2553d', wR: '#9a412e', timber: true, prop: 'car', obj: 'tap', mat: { ',': 'asphalt', '.': 'paving', p: 'wood' }, plate: 'Ludwig Pub · Roseto' },
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
        objectives: [{ x: 11, y: 3, kind: 'tap', text: 'Riaccendi la spina del Ludwig', pop: 'PSSSHHH!', msg: 'La schiuma torna a scorrere: il Ludwig è salvo!' }],
        signs: [{ x: 6.5, y: 5.5, title: 'Ludwig', sub: 'Pub', tag: 'LIVE MUSIC' }],
        intro: [
            { img: 'assets/ludwig.jpg', who: 'Roseto degli Abruzzi', line: 'Il Ludwig Pub è sotto sequestro. Niente birra, niente live music. Solo... acqua.' },
            { boss: true, who: 'Ministro Sobrio Astemi', line: 'Da oggi in Italia si brinda solo con acqua minerale. Naturale. A temperatura ambiente.' },
            { char: 'alcan', line: 'Chi ha toccato il MIO pub?! Tenetemi che lo mordo!' },
            { char: 'estice', line: 'Calma. Ho dinamite, piccone e una cena a base di fagioli. Siamo pronti.' },
            { char: 'unicorn', line: 'La spina è là dentro. Io porto le pozioni... e le barzellette! Hiiih!' },
        ],
        outro: [{ char: 'alcan', line: 'La spina è riaccesa! Chi offre il primo giro? Non io, ho le mani piccole.' }],
    },
    {
        name: 'Missione 2: Il Birrificio Sigillato',
        hint: 'Sinistra: porta STAFF. Destra: barricata. Il fermentatore B lo sa riavviare solo Unicorn!',
        theme: { sky: ['#3a3f52', '#6b7085'], a: '#a3acb1', b: '#98a1a6', c: '#a3acb1', p: '#c9a874', wT: '#5a3b30', wL: '#b0593e', wR: '#8a4430', timber: false, prop: 'barrel', obj: 'tank', steam: true, mat: { ',': 'concrete', '.': 'paving', p: 'wood' }, plate: 'Birrificio E-TEAM' },
        map: [],
        starts: [[3, 16], [5, 16], [7, 16], [9, 16], [11, 16]],
        guards: [
            { p: [[3, 9], [26, 9]] },
            { p: [[5, 13], [27, 13]] },
            { p: [[14, 7], [14, 13]] },
            { p: [[14, 3]], base: Math.PI, sweep: 1.1 },
            { p: [[19, 3], [25, 3]] },
        ],
        objectives: [
            { x: 12, y: 2, kind: 'tank', text: 'Togli i sigilli al fermentatore A', pop: 'BLUB BLUB!', msg: 'Il fermentatore A ricomincia a gorgogliare!' },
            { x: 24, y: 2, kind: 'tank', needChar: 'unicorn', lock: 'Serve Unicorn: solo il Mastro Birraio sa riavviarlo!', text: 'Riavvia il fermentatore B (Unicorn)', pop: 'GLUGLUGLU!', msg: 'Unicorn accarezza il fermentatore: "Brava, piccola." La birra è salva!' },
        ],
        signs: [],
        intro: [
            { char: 'unicorn', line: 'Hanno sigillato il MIO birrificio. I fermentatori piangono. Li sento.' },
            { boss: true, who: 'Ministro Sobrio Astemi', line: 'Il luppolo verrà riconvertito in tisana rilassante. Per decreto!' },
            { char: 'muglo', line: 'Ci penso io: un po\' di fumo di brace e nessuno vedrà più niente.' },
            { char: 'proboscis', line: 'Io metto il completo. Nessuno dice di no a un agente immobiliare.' },
        ],
        outro: [{ char: 'unicorn', line: 'Senti come gorgogliano! Il suono più bello del mondo... dopo la mia risata. Hiiiih!' }],
    },
    {
        name: 'Missione 3: La Sagra degli Arrosticini',
        hint: 'Muglo deve accendere la griglia gigante. Poi addormenta il Ministro (Unicorn, portata 5) e fagli firmare il decreto: Alcan entra col badge.',
        theme: { sky: ['#ffb36b', '#ffe3b0'], a: '#8cc65a', b: '#7fbb4d', c: '#e6d6b4', p: '#b8323a', wT: '#f6f0e0', wL: '#d9534f', wR: '#b94441', timber: false, prop: 'table', obj: 'desk', stripes: true, mat: { ',': 'grass', '.': 'paving', p: 'carpet' }, plate: 'Sagra degli Arrosticini' },
        map: [],
        starts: [[10, 16], [12, 16], [14, 16], [16, 16], [18, 16]],
        guards: [],
        objectives: [
            { x: 16, y: 8, kind: 'grill', needChar: 'muglo', lock: 'Serve Muglo: solo lui accende la brace a mani nude!', text: 'Accendi la griglia gigante (Muglo)', pop: 'FWOOSH!', msg: 'Muglo afferra la brace a mani nude. Profumo di arrosticini ovunque!' },
            { x: 16, y: 2, kind: 'desk', needAsleep: 'boss', lock: 'Il Ministro è sveglio e ti fissa: "Solo acqua, grazie!"', text: 'Fai firmare il decreto "Arrosticini liberi"', pop: 'FIRMATO!', msg: 'Firmato nel sonno! L\'Italia torna a brindare. Salute!' },
        ],
        signs: [],
        intro: [
            { boss: true, who: 'Ministro Sobrio Astemi', line: 'La Sagra degli Arrosticini è ABOLITA! Al suo posto: Festa del Sedano Bollito!' },
            { char: 'muglo', line: 'Sopra il mio cadavere. La griglia la accendo io. A mani nude.' },
            { char: 'proboscis', line: 'Alle guardie ci penso io. Diciamo che... le lascio senza parole.' },
            { char: 'estice', line: 'E se serve un varco, lo apro. In un modo... o nell\'altro.' },
        ],
        outro: [
            { char: 'muglo', line: 'Arrosticini per tutti! Anche per il Ministro, quando si sveglia.' },
            { boss: true, who: 'Ministro Sobrio Astemi', line: '*sbadiglio* Mmm... che profumo... e questa birra... è BUONISSIMA! Decreto abolito!' },
        ],
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
        '#' + rep('.', 15) + 'O' + rep('.', 14) + '#',
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
        { p: [[28, 13], [3, 13]] },
        { p: [[15, 11], [15, 13]] },
        { p: [[3, 7], [28, 7]] },
        { p: [[28, 9], [3, 9]] },
        { p: [[13, 2]], base: 0, sweep: 1.0, boss: true, label: 'Ministro Sobrio Astemi' },
    ];
})();
