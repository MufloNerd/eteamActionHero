# Sprite per E-TEAM Commandos: elenco, prompt e consegna

Servono **44 immagini PNG**, divise in 4 cartelle. Il gioco le carica da solo: ogni file presente sostituisce la grafica disegnata via codice, quelli mancanti restano disegnati. Puoi quindi consegnarle anche a blocchi (vedi [Priorità](#priorità)).

---

## 1. Come consegnarle: struttura dello zip

Crea un file **`eteam-sprites.zip`** con questa struttura esatta:

```text
eteam-sprites.zip
└── sprites/
    ├── personaggi/   20 file
    ├── nemici/        6 file
    ├── oggetti/      10 file
    └── texture/       8 file
```

Per installarlo, scompatta lo zip dentro `assets/`, così da ottenere `assets/sprites/personaggi/...` e così via. Poi ricarica la pagina.

**Regole sui file**
- Formato **PNG** (non JPG o WEBP), nomi **esattamente** come nelle tabelle: minuscolo, trattini, estensione `.png`.
- Le immagini di `personaggi/`, `nemici/` e `oggetti/` devono avere sfondo **trasparente**. Se il generatore non lo supporta, usa un **magenta pieno #FF00FF**: lo rimuove il gioco.
- **Non aggiungere** basette, piedistalli od ombre a terra: la basetta trasparente e l'ombra le disegna il gioco.
- **Margini:** non servono. Il gioco ritaglia da solo i bordi vuoti.

---

## 2. Regole di stile

- **Formato:** quadrato 1024×1024 (texture: 512×512, vedi sezione 6).
- **Un soggetto per immagine**, intero e senza tagli.
- **Coerenza:** fai tutto nella stessa chat. Genera prima `muglo-front.png`, approvalo, poi per tutti gli altri aggiungi *"Same exact style, scale, lighting and camera angle as the previous figure"*.
- **Riferimenti:** allega sempre la foto della confezione del personaggio (in `assets/`).
- **Orientamento:** è importante, perché il gioco specchia l'immagine per ottenere le altre direzioni.
  - `-front`: figura girata in **3/4 verso il basso a destra** (guarda chi osserva, leggermente verso destra).
  - `-back`: figura di **3/4 di spalle**, che cammina **verso l'alto a destra**.
- **Camera:** vista dall'alto a circa 30°, come in Commandos.

### Stile base (incollalo all'inizio di ogni prompt di personaggi e nemici)

> Photorealistic 1:6 scale collectible action figure, like the E-TEAM boxes in the reference photo: sculpted face with a faithful likeness of the person in the reference, painted vinyl skin with a slight plastic sheen, real fabric clothes with visible stitching, visible articulation joints at shoulders, elbows, wrists and knees, realistic proportions. Ridiculous over-the-top comedic pose and facial expression, like a toy posed by a kid for a joke. Studio product-photo lighting from top-left, soft highlights, sharp focus. Camera looking down at about 30 degrees, isometric game view like Commandos. Full body, no base, no stand, no box, no packaging, no text, no ground shadow, isolated on transparent background (or flat #FF00FF magenta).

---

## 3. `personaggi/`: 20 file (5 personaggi × 4)

| File | Uso nel gioco | Posa |
|---|---|---|
| `<id>-front.png` | camminata e attesa, verso il basso | in piedi, 3/4 frontale verso destra, posa idle buffa |
| `<id>-back.png` | camminata verso l'alto | in piedi, 3/4 di spalle verso destra |
| `<id>-action.png` | quando usa un'abilità (lanci, pugni, esultanza) | posa d'azione descritta sotto |
| `<id>-portrait.png` | card dei personaggi in basso | busto frontale, espressione tipica, sfondo trasparente |

### Estice (`estice`): il Demolitore. Rif. `1000081068.jpg`
> [STILE BASE] A cheerful bearded miner with a yellow mining helmet with headlamp, brown worn work jacket over green "E-TEAM" t-shirt, cargo pants, boots, holding a pickaxe.

- `estice-front.png`: piccone in spalla, sorriso soddisfatto, pancia in fuori.
- `estice-back.png`: di spalle, piccone in spalla.
- `estice-action.png`: braccio alzato che lancia un candelotto di dinamite rossa con la miccia accesa, l'altra mano sul sedere, faccia soddisfatta.
- `estice-portrait.png`: ghigno da combinaguai, casco con lampada accesa.

### Alcan (`alcan`): l'Infiltrato, piccolo e furioso. Rif. `1000081064.jpg`
> [STILE BASE] A short, angry young man with short brown hair, navy "E-TEAM" t-shirt with round yellow logo, blue jeans, sneakers, lanyard badge around neck. Tiny but furious: clenched fists, red face.

- `alcan-front.png`: pugni stretti, sguardo furioso, bottiglia di whisky in mano.
- `alcan-back.png`: di spalle, pugni stretti, badge che spunta di lato.
- `alcan-action.png`: scatto in avanti con pugno teso e bottiglia di whisky 12 anni nell'altra mano, bocca spalancata che urla.
- `alcan-portrait.png`: urla con le vene sulla fronte, piccolo ma minaccioso.

### Muglo (`muglo`): il Grigliatore Pazzo. Rif. `1000081050.jpg`
> [STILE BASE] A bearded man with brown cowboy hat, white "E-TEAM" t-shirt, black shorts, sandals, wild crazy grin, one eye wider than the other.

- `muglo-front.png`: pinze da barbecue in mano, sorriso da pazzo.
- `muglo-back.png`: di spalle, cappello da cowboy, pinze in mano.
- `muglo-action.png`: lancia un carbone ardente tenuto **a mani nude**, piccole fiamme sulle dita, occhi spiritati.
- `muglo-portrait.png`: sorriso folle, fumo che sale dal cappello.

### Unicorn (`unicorn`): Mastro Birraio e comico. Rif. `1000081046.jpg`
> [STILE BASE] A bearded man with blue baseball cap with a small golden cardboard unicorn horn on top, pink "E-TEAM" t-shirt, khaki pants, holding a beer glass, goofy comedian face.

- `unicorn-front.png`: boccale in mano, occhiolino.
- `unicorn-back.png`: di spalle, boccale in mano, corno sul cappellino.
- `unicorn-action.png`: braccia in alto che ride a crepapelle mentre lancia una provetta di birra schiumosa.
- `unicorn-portrait.png`: smorfia buffa, lingua di fuori, occhiolino.

### Proboscis (`proboscis`): il Negoziatore. Rif. `1000081042.jpg`
> [STILE BASE] A bearded man with sunglasses, navy "E-TEAM" t-shirt, khaki pants, brown shoes, eating arrosticini skewers, overconfident smirk.

- `proboscis-front.png`: arrosticino in bocca, sorrisetto sicuro.
- `proboscis-back.png`: di spalle, arrosticini in mano.
- `proboscis-action.png`: **travestimento da agente immobiliare**. Completo blu, camicia azzurra, cravatta rossa, cartellina rossa "VENDESI", sorriso da venditore. Questo sprite si usa per tutto il tempo del travestimento.
- `proboscis-portrait.png`: occhiali da sole, sopracciglio alzato, sorrisetto da piacione.

---

## 4. `nemici/`: 6 file

> [STILE BASE] A stern government inspector of the "Ministry of Sobriety": light blue uniform shirt with water-drop badge, dark blue trousers, dark blue peaked cap, clipboard, water bottle at the belt, thick mustache.

| File | Posa |
|---|---|
| `guard-front.png` | pattuglia, 3/4 frontale verso destra, cartellina in mano, aria severa |
| `guard-back.png` | pattuglia, 3/4 di spalle verso destra |
| `guard-alert.png` | spaventato: salta all'indietro, braccia in alto, occhi fuori dalle orbite (si usa anche quando scappa e quando ti scopre) |
| `guard-sleep.png` | **sdraiato in orizzontale** sul fianco che russa, testa a sinistra, boccale vuoto accanto |
| `guard-stunned.png` | a bocca spalancata e mascella a terra, incredulo (reazione a Proboscis e alle barzellette) |
| `boss-astemi.png` | il **Ministro Sobrio Astemi**: grasso, pelato col riporto, baffi bianchi, completo scuro, fascia tricolore, bicchiere d'acqua alzato, aria pomposa. 3/4 frontale verso destra. Si usa anche come ritratto nelle scene. |

---

## 5. `oggetti/`: 10 file

> Realistic miniature diorama prop for 1:6 action figures, toy playset quality (painted resin and plastic, small handmade details), 2:1 isometric view from above, studio lighting from top-left, isolated on transparent background (or flat #FF00FF magenta), no base, no text, no ground shadow.

| File | Descrizione | Dove compare |
|---|---|---|
| `prop-car.png` | auto compatta die-cast parcheggiata, di lato in isometrico | parcheggio del Ludwig |
| `prop-bush.png` | albero da plastico ferroviario (chioma in spugna, tronco sottile) | tutte le missioni |
| `prop-barrel.png` | barile di birra in legno con cerchi di metallo | birrificio |
| `prop-table.png` | tavolo da sagra con boccale e arrosticini | sagra |
| `prop-barricade.png` | barricata di assi di legno con nastro giallo-nero "SEQUESTRATO" | tutte |
| `prop-beer-tap.png` | spillatrice di birra in ottone sopra un piccolo bancone (obiettivo) | Ludwig |
| `brewery-tank.png` | fermentatore d'acciaio alto con manometro, sigillato con nastro giallo (obiettivo) | birrificio |
| `grill-big.png` | barbecue gigante da sagra con griglia e brace (obiettivo) | sagra |
| `muglo-grill.png` | piccola griglia portatile fumante con salsicce (la lancia Muglo) | abilità di Muglo |
| `estice-gas.png` | nuvola di **ovatta verde** semitrasparente con piccole faccine a teschio buffe (scoreggia di Estice) | abilità di Estice |

---

## 6. `texture/`: 8 file

Sono i materiali del pavimento e dei muri. Le regole sono diverse dagli altri file:
- PNG **512×512**, **vista perfettamente dall'alto** e senza prospettiva (la prospettiva la aggiunge il gioco).
- **Seamless e ripetibile**: i bordi devono combaciare.
- Luce piatta e uniforme, nessun oggetto, nessuna ombra.
- Scala: l'immagine intera corrisponde a **una piastrella** del gioco, circa 30 cm di diorama.

> Seamless tileable top-down texture, 512x512, perfectly flat orthographic view, even flat lighting, miniature diorama material for 1:6 scale action figures, no objects, no shadows, no perspective.

| File | Materiale | Dove |
|---|---|---|
| `tex-asphalt.png` | asfalto grigio da plastico con granelli chiari | parcheggio del Ludwig |
| `tex-concrete.png` | cemento industriale con giunti | birrificio |
| `tex-grass.png` | prato in flock statico (erba da modellismo) con fiorellini | sagra |
| `tex-wood.png` | pavimento in assi di legno da pub | interni |
| `tex-carpet.png` | moquette rossa con bordo dorato | palco del Ministro |
| `tex-paving.png` | lastricato di pietra chiara | piazza della sagra |
| `tex-brick.png` | mattoni rossi visti di fronte (muro) | muri di Ludwig e birrificio |
| `tex-canvas.png` | tela da tendone a righe verticali rosse e bianche (muro) | tendoni della sagra |

---

## Priorità

Per vedere subito la differenza, consegna in tre blocchi:

1. **Essenziali (19 file):** tutti i `-front`, `-back`, `-action` dei 5 personaggi + `guard-front`, `guard-back`, `guard-sleep`, `boss-astemi`.
2. **Dettagli (17 file):** i 5 `-portrait`, `guard-alert`, `guard-stunned` e i 10 file di `oggetti/`.
3. **Materiali (8 file):** la cartella `texture/`.

## Lista di controllo

```text
sprites/personaggi/  estice-front  estice-back  estice-action  estice-portrait
                     alcan-front   alcan-back   alcan-action   alcan-portrait
                     muglo-front   muglo-back   muglo-action   muglo-portrait
                     unicorn-front unicorn-back unicorn-action unicorn-portrait
                     proboscis-front proboscis-back proboscis-action proboscis-portrait
sprites/nemici/      guard-front guard-back guard-alert guard-sleep guard-stunned boss-astemi
sprites/oggetti/     prop-car prop-bush prop-barrel prop-table prop-barricade prop-beer-tap
                     brewery-tank grill-big muglo-grill estice-gas
sprites/texture/     tex-asphalt tex-concrete tex-grass tex-wood tex-carpet tex-paving tex-brick tex-canvas
```

Suoni e musica non vanno generati: li sintetizza il gioco.

---

## 🎃 Speciale Halloween: Assalto a Mount Hawk (17 file)

Stessa consegna di sempre: metti i file in `assets/sprites/` e lancia `tools/.venv/bin/python tools/prepara_sprite.py`.
Finché mancano, il gioco usa versioni disegnate via codice.

### `nemici/` (8 file)

**Scheletri di guardia.** Usa lo stile base dei personaggi, poi:
> A skeleton security guard action figure: real-looking plastic bones, skull with hollow black eye sockets and a tiny red glow inside, the same dark blue peaked cap and Ministry of Sobriety badge as the inspectors, ragged black uniform hanging on the bones, holding an old oil lantern. Spooky but funny.

| File | Posa |
|---|---|
| `skel-front.png` | pattuglia, 3/4 frontale verso destra, lanterna alzata |
| `skel-back.png` | di spalle, 3/4 verso l'alto a destra |
| `skel-alert.png` | spaventato: la mandibola cade, braccia in alto |
| `skel-sleep.png` | **crollato a terra**: mucchio di ossa con il cappello sopra, in orizzontale |
| `skel-stunned.png` | piegato in due dalle risate, si tiene le costole |

**Simon Storm, l'acerrimo nemico.** Allega una sua foto se ce l'hai, così la figura gli somiglia.
> [STILE BASE] Simon Storm, a theatrical villain: long black coat, dark red shirt, slicked-back black hair, pointed goatee, arrogant smirk, a big antique iron key hanging from his belt.

| File | Posa |
|---|---|
| `simon-front.png` | 3/4 frontale verso destra, mani giunte da cattivo, sorriso perfido (si usa anche nei dialoghi) |
| `simon-back.png` | di spalle, mantello svolazzante |
| `simon-eat.png` | addenta una salsiccia con il tovagliolo al collo, beato |

### `oggetti/` (6 file)

Usa lo stile base degli oggetti, con atmosfera notturna e luce fredda di luna.

| File | Descrizione |
|---|---|
| `prop-tomb.png` | lapide di pietra muschiosa con scritto "R.I.P." (usata anche per l'epitaffio di Nonno Hawk) |
| `prop-pumpkin.png` | zucca di Halloween intagliata con candela accesa dentro |
| `prop-deadtree.png` | albero secco e contorto da plastico, senza foglie |
| `station-fireplace.png` | grande camino in pietra di un castello, con griglia e legna (obiettivo finale) |
| `station-generator.png` | vecchio generatore elettrico da cantina con leva e spie |
| `station-woodpile.png` | catasta di legna con un'ascia piantata sopra |

### `texture/` (2 file)

Stesse regole delle altre texture: vista dall'alto, seamless, luce piatta.

| File | Materiale |
|---|---|
| `tex-stone.png` | blocchi di pietra grigia vecchia con muschio (mura di Mount Hawk) |
| `tex-deadgrass.png` | prato secco e fangoso, foglie morte (giardino e cimitero) |
