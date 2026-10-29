#!/usr/bin/env python3
"""Prepara gli sprite generati con l'AI per il gioco.

Uso:  tools/.venv/bin/python tools/prepara_sprite.py           (nuove immagini)
      tools/.venv/bin/python tools/prepara_sprite.py --rifai   (rielabora tutto da _originali/)

Prima installazione (una volta sola):
      python3 -m venv tools/.venv && tools/.venv/bin/pip install "rembg[cpu]" pillow numpy
Senza rembg funziona lo stesso con un metodo più semplice basato sui colori del bordo.

Scansiona assets/sprites/ (anche le sottocartelle) e per ogni immagine:
- converte JPG/JPEG/WEBP in PNG;
- rimuove lo sfondo (bianco, magenta, finta scacchiera, vetrine...) con il modello AI rembg;
- corregge i nomi più comuni (es. -profile -> -portrait);
- sposta il file nella cartella giusta (personaggi/nemici/oggetti/texture);
- conserva gli originali in assets/sprites/_originali/.
"""
import shutil
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / 'assets' / 'sprites'
ORIG = ROOT / '_originali'

CHARS = ['estice', 'alcan', 'muglo', 'unicorn', 'proboscis']
GROUPS = {  # tenere allineato con SPRITE_GROUPS in art.js
    'personaggi': [f'{c}-{k}' for c in CHARS for k in ('front', 'back', 'action', 'portrait')],
    'nemici': ['guard-front', 'guard-back', 'guard-alert', 'guard-sleep', 'guard-stunned', 'boss-astemi'],
    'oggetti': ['prop-car', 'prop-bush', 'prop-barrel', 'prop-barricade', 'prop-table', 'prop-beer-tap',
                'brewery-tank', 'grill-big', 'muglo-grill', 'estice-gas'],
    'texture': ['tex-asphalt', 'tex-concrete', 'tex-grass', 'tex-wood', 'tex-carpet', 'tex-paving',
                'tex-brick', 'tex-canvas'],
}
FOLDER = {n: f for f, names in GROUPS.items() for n in names}
ALIASES = {'-item': '-grill', '-profile': '-portrait', '-profilo': '-portrait', '-ritratto': '-portrait', '-busto': '-portrait',
           '-fronte': '-front', '-retro': '-back', '-spalle': '-back', '-azione': '-action'}
EXTS = {'.png', '.jpg', '.jpeg', '.webp'}

try:
    from rembg import new_session, remove as rembg_remove
    SESSION = new_session('isnet-general-use')
except Exception:  # rembg non installato: si usa il metodo a colori
    SESSION = None


def canonical(stem):
    s = stem.lower().strip().replace(' ', '-').replace('_', '-')
    for a, b in ALIASES.items():
        if s.endswith(a):
            s = s[: -len(a)] + b
    return s


def background_mask(rgb):
    """Pixel che possono essere sfondo: chiari e poco saturi (bianco/scacchiera), magenta,
    oppure vicini ai colori dominanti del bordo (scacchiere più scure, fondi grigi uniformi)."""
    r, g, b = (rgb[..., i].astype(int) for i in range(3))
    mx, mn = np.maximum(np.maximum(r, g), b), np.minimum(np.minimum(r, g), b)
    light = (mn > 185) & (mx - mn < 28)
    magenta = (r > 170) & (b > 170) & (g < 120)
    mask = light | magenta
    edge = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]]).astype(int)
    q = (edge // 12) * 12
    cols, counts = np.unique(q, axis=0, return_counts=True)
    for c in cols[counts > len(edge) * .08]:
        c = c + 6
        if c.max() - c.min() < 30:  # solo colori neutri, per non mangiare la figura
            mask |= (np.abs(rgb.astype(int) - c).max(axis=2) < 22) & (mx - mn < 30)
    return mask


def dilate(m):
    out = m.copy()
    out[1:, :] |= m[:-1, :]
    out[:-1, :] |= m[1:, :]
    out[:, 1:] |= m[:, :-1]
    out[:, :-1] |= m[:, 1:]
    return out


def flood_from_border(cand):
    """Regioni candidate collegate al bordo (riempimento per dilatazioni successive)."""
    seen = np.zeros_like(cand)
    seen[0, :], seen[-1, :], seen[:, 0], seen[:, -1] = cand[0, :], cand[-1, :], cand[:, 0], cand[:, -1]
    while True:
        grown = dilate(seen) & cand
        if (grown == seen).all():
            return seen
        seen = grown


def remove_background(img):
    rgba = np.array(img.convert('RGBA'))
    alpha = rgba[..., 3]
    border = np.concatenate([alpha[0], alpha[-1], alpha[:, 0], alpha[:, -1]])
    if (border < 20).mean() > .7:
        return img.convert('RGBA'), 'già trasparente'
    if SESSION:
        return rembg_remove(img.convert('RGB'), session=SESSION), 'sfondo rimosso (AI)'
    cand = background_mask(rgba[..., :3])
    edge = np.concatenate([cand[0], cand[-1], cand[:, 0], cand[:, -1]])
    if edge.mean() < .6:
        return img.convert('RGBA'), "sfondo non uniforme: lasciato com'è"
    bg = flood_from_border(cand)
    # Due pixel in più per togliere l'alone chiaro attorno alla figura
    soft = cand | (rgba[..., :3].min(axis=2) > 150)
    for _ in range(2):
        bg |= dilate(bg) & soft
    rgba[..., 3] = np.where(bg, 0, alpha)
    return Image.fromarray(rgba), f'sfondo rimosso ({bg.mean() * 100:.0f}%)'


def main():
    if '--rifai' in sys.argv:
        files = [p for p in ORIG.glob('*') if p.suffix.lower() in EXTS]
    else:
        files = [p for p in ROOT.rglob('*') if p.suffix.lower() in EXTS and ORIG not in p.parents]
    if not files:
        print('Nessuna immagine in', ROOT)
        return
    ORIG.mkdir(parents=True, exist_ok=True)
    for p in sorted(files):
        name = canonical(p.stem)
        folder = FOLDER.get(name)
        if not folder:
            print(f'?  {p.relative_to(ROOT)}: nome sconosciuto "{name}", ignorato')
            continue
        dest = ROOT / folder / f'{name}.png'
        if p.resolve() == dest.resolve() and Image.open(p).mode == 'RGBA':
            continue  # già pronto
        from_orig = ORIG in p.parents
        img = Image.open(p)
        img.load()
        if folder == 'texture':
            out, note = img.convert('RGB').resize((512, 512), Image.LANCZOS), 'texture 512x512'
        else:
            out, note = remove_background(img)
        if not from_orig:
            shutil.copy2(str(p), str(ORIG / p.name))
            if p.resolve() != dest.resolve():
                p.unlink()
        dest.parent.mkdir(parents=True, exist_ok=True)
        out.save(dest, optimize=True)
        print(f'OK {p.name:28s} -> {dest.relative_to(ROOT)}  [{note}]')
    missing = [n for n in FOLDER if not (ROOT / FOLDER[n] / f'{n}.png').exists()]
    if not SESSION:
        print('\nNota: rembg non installato, usato il metodo a colori (vedi istruzioni in testa al file).')
    print(f'\nPresenti {len(FOLDER) - len(missing)}/{len(FOLDER)}. Mancano: {", ".join(missing) or "nessuno"}')


if __name__ == '__main__':
    sys.exit(main())
