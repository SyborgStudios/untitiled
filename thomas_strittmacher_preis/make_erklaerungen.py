#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Erklärungen für den Thomas Strittmatter Preis 2027.

Baut zwei unterschriftsreife Ein-Seiten-PDFs nach
`thomas_strittmacher_preis/` (Satz-Werk aus `make_pdf.py` im
Projektstamm; Courier 12, A4 — passend zu den Drehbuch-PDFs):

  TAU_Erklaerung_Verfilmung.pdf     das Drehbuch ist unverfilmt,
                                    Dreharbeiten haben nicht begonnen
  TAU_Erklaerung_Urheberschaft.pdf  alleinige Urheberschaft am Stoff
                                    und am Drehbuch

Aufruf:  python3 make_erklaerungen.py
Ort/Datum unten (ORT_DATUM) vor dem Druck ggf. anpassen.
"""

import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(ROOT))

import make_pdf as mp

ABSENDER = [
    ("Simon Meyborg", mp.F_BOLD),
    ("Bleickenallee 4", mp.F_REG),
    ("22763 Hamburg", mp.F_REG),
    ("Tel: 0176 70064536", mp.F_REG),
    ("Web: www.syborgstudios.com", mp.F_REG),
    ("E-Mail: meyborg@syborgstudios.com", mp.F_REG),
]

EMPFAENGER = [
    "MFG Medien- und Filmgesellschaft",
    "Baden-Württemberg mbH",
    "Kennwort: Thomas Strittmatter Preis",
    "Breitscheidstraße 4",
    "70174 Stuttgart",
]

ORT_DATUM = "Hamburg, den 10. August 2026"

VERFILMUNG = (
    "ERKLÄRUNG ZUR VERFILMUNG",
    [
        "Hiermit erkläre ich, dass das von mir zum Thomas "
        "Strittmatter Preis 2027 eingereichte Drehbuch „TAU“ "
        "bislang weder ganz noch in Teilen verfilmt worden ist und "
        "dass Dreharbeiten auf Grundlage dieses Drehbuchs nicht "
        "begonnen haben.",

        "Mir ist bekannt, dass das Drehbuch zum Zeitpunkt der "
        "Preisverleihung noch nicht verfilmt sein darf bzw. die "
        "Dreharbeiten zu diesem Zeitpunkt noch nicht begonnen haben "
        "dürfen. Sollte sich an dem oben erklärten Stand vor der "
        "Preisverleihung etwas ändern, werde ich die MFG Medien- und "
        "Filmgesellschaft Baden-Württemberg mbH unverzüglich "
        "informieren.",

        "Die Stoffrechte an dem Drehbuch wurden bisher nicht an eine "
        "Produktionsfirma oder sonstige Dritte vergeben.",
    ],
)

URHEBERSCHAFT = (
    "ERKLÄRUNG ZUR URHEBERSCHAFT",
    [
        "Hiermit erkläre ich, dass ich alleiniger Urheber des zum "
        "Thomas Strittmatter Preis 2027 eingereichten Drehbuchs "
        "„TAU“ sowie des ihm zugrunde liegenden Stoffes bin.",

        "Das Drehbuch wurde originär in deutscher Sprache verfasst "
        "und ist keine Übersetzung eines fremdsprachigen Werks. Das "
        "Werk und seine Einreichung verletzen keine Rechte Dritter.",

        "Die Rechte an dem Stoff und dem Drehbuch liegen vollständig "
        "bei mir; sie wurden weder ganz noch teilweise an eine "
        "Produktionsfirma oder sonstige Dritte übertragen.",
    ],
)


def brief(titel, absaetze, out_path):
    t = mp.Doc()
    for text, font in ABSENDER:
        t.put(mp.ML, text, font)
    t.blank(3)
    for line in EMPFAENGER:
        t.put(mp.ML, line)
    t.blank(3)
    t.put(mp.center_x(titel), titel, mp.F_BOLD)
    t.blank(2)
    for absatz in absaetze:
        for wline in mp.wrap(absatz, mp.ACTION_COLS):
            t.put(mp.ML, wline)
        t.blank(1)
    t.blank(2)
    t.put(mp.ML, ORT_DATUM)
    t.blank(4)
    t.put(mp.ML, "_" * 32)
    t.put(mp.ML, "Simon Meyborg")
    t.flush()
    mp.write_pdf(t.pages, out_path)
    return len(t.pages)


if __name__ == "__main__":
    for (titel, absaetze), dst in (
        (VERFILMUNG, HERE / "TAU_Erklaerung_Verfilmung.pdf"),
        (URHEBERSCHAFT, HERE / "TAU_Erklaerung_Urheberschaft.pdf"),
    ):
        n = brief(titel, absaetze, dst)
        print(f"{dst.name}: {n} Seite(n), {dst.stat().st_size / 1e3:.0f} kB")
