#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Einreichungs-PDFs für den Thomas Strittmatter Preis 2027.

Baut aus `Untitled.fountain` zwei Fassungen nach
`thomas_strittmacher_preis/` (nutzt das Satz-Werk aus `make_pdf.py`
im Projektstamm, ohne die Site-Fassungen anzufassen):

  TAU_Drehbuch_Simon_Meyborg.pdf   Titel TAU, Autor Simon Meyborg
  TAU_Drehbuch_anonymisiert.pdf    Titel TAU, keine Autorenangabe
                                   (Pflicht: die Jury liest anonym)

Beide ohne untitled.movie-Fußzeile. Der Drehbuchtext selbst enthält
keine identifizierenden Angaben (geprüft: Autorname, Claude,
untitled.movie stehen nur im Metablock der Fountain-Datei).

Aufruf:  python3 make_tsp_pdf.py
Das Stand-Datum unten bei neuen Textständen mitziehen.
"""

import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(ROOT))

import make_pdf as mp

STAND = "Stand: 10. August 2026"

KONTAKT = [
    "Simon Meyborg",
    "Bleickenallee 4",
    "22763 Hamburg",
    "Tel: 0176 70064536",
    "Web: www.syborgstudios.com",
    "E-Mail: meyborg@syborgstudios.com",
]

if __name__ == "__main__":
    meta, blocks = mp.parse(ROOT / "Untitled.fountain")

    fassungen = (
        ({"Title": "TAU", "Credit": "Drehbuch von",
          "Author": "Simon Meyborg"},
         HERE / "TAU_Drehbuch_Simon_Meyborg.pdf", KONTAKT),
        ({"Title": "TAU"},
         HERE / "TAU_Drehbuch_anonymisiert.pdf", None),
    )
    for m, dst, kontakt in fassungen:
        n = mp.render(m, blocks, dst, STAND, footer=None, contact=kontakt)
        print(f"{dst.name}: {n} Seiten (Titel + {n - 1} Inhalt), "
              f"{dst.stat().st_size / 1e3:.0f} kB")
