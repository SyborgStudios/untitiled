#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Inhaltsangabe für den Thomas Strittmatter Preis 2027.

Baut `TAU_Inhaltsangabe.pdf`: eine Seite, nur Titel und Text —
keine Autorennennung, kein Copyright-Vermerk, keine PDF-Metadaten
(anonym wie das Jury-Drehbuch). Text: die Synopsis aus
`expose-v1.md` (Abschnitt 4, ganzer Film inklusive Ende).

Courier 11 mit symmetrischen Rändern, damit die volle Synopsis
auf eine Seite geht (der Drehbuchsatz mit Courier 12 sprengt sie).

Aufruf:  python3 make_inhaltsangabe.py
"""

import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(ROOT))

import make_pdf as mp

mp.SIZE = 11.0
CW, LEAD = 6.6, 11.5      # Courier-Laufweite/Zeilenabstand bei 11 pt
COLS = 68
X = (mp.PAGE_W - COLS * CW) / 2

ABSAETZE = [
    "Eine Stadt, zehn Jahre nach der Katastrophe. Das Kraftwerk am "
    "Fluss ist explodiert und hat den größten Teil der Stadt "
    "mitgenommen; die amtliche Wahrheit nennt es den Terroranschlag "
    "des Verräters Jahn, der auf der Flucht ums Leben kam. Die Region "
    "ist Sperrgebiet. Die Welt draußen wirft Kisten an Fallschirmen "
    "ab und schaut nicht mehr her. Die Erwachsenen sterben langsam an "
    "Malen auf der Haut und tragen darum lange Ärmel; die Stadt "
    "gehört den Kindern.",

    "ANNA, vierzehn, wächst in einem Heim auf. Sie war vier, als ihre "
    "Eltern erschossen wurden — sie lag unter einem Tisch und hat vom "
    "Täter nichts gesehen als einen Arm im Lampenlicht und darauf ein "
    "Zeichen. Seither führt sie ein Heft: Seiten über Seiten "
    "gezeichneter, durchgestrichener Male. Ein Archiv des "
    "Nicht-Findens. Als das Heim in einer Revolte zerfällt, geht sie "
    "nicht aus der Stadt hinaus, sondern tiefer hinein.",

    "Sie lernt die Regeln der Stadt, verliert einen Hund als Zoll an "
    "eine Kinderbande und trifft JAKOB, der Dinge repariert und nie "
    "fragt. Er bringt sie in eine Werkstattwohnung, in der seine "
    "Mutter RUTH stirbt, und in der ein Feldbett steht, auf dem sein "
    "Vater nicht liegt. Anna sucht Unterarme; Jakob verbirgt, wessen "
    "Sohn er ist. Zwei Kinder, die das Nichtfragen als Muttersprache "
    "gelernt haben.",

    "Nach Ruths Tod sitzt in der Werkstatt ein hagerer Mann mit "
    "langen Ärmeln: LENZ. Er redet, weil er stirbt, und Anna hört zu, "
    "wie sie allen zuhört — als Quelle. Aus seinen Nummern und aus "
    "dem Tratsch der Sterbenden setzt sich eine zweite Geschichte "
    "zusammen: Der Verräter Jahn hatte eine Frau, eine Lehrerin, und "
    "die war schwanger, als beide verschwanden. Und Lenz erzählt seit "
    "Wochen von einem Freund, dessen Namen er nie sagt. Im Heimarchiv "
    "gibt ihr ein alter Erzieher das Bündel, das bei ihr lag, als sie "
    "kam: ein hölzernes Pferdchen, die Mähne fast abgeliebt — das "
    "Liebste, was das Kind einmal besessen hat. Und da begreift Anna, "
    "was wir eine Sekunde vor ihr begreifen: Das Mal auf dem Arm des "
    "Mörders, so wie sie es erinnert, hat genau die Form dieses "
    "Pferdchens. Vielleicht hat ihr Gedächtnis in jener Nacht das "
    "geliebte Ding mit in das Bild gelegt. Von da an zweifelt sie an "
    "ihrer eigenen Erinnerung — und wir zweifeln mit.",

    "Dann trägt Lenz sich in die Kreideliste ein — wer dort steht, "
    "wird gewaschen und läuft in die Felder, wie alle Sterbenden "
    "dieser Stadt. Jakob bittet Anna zum ersten Mal um etwas: Hilf "
    "mir, ihn da runterzuholen. Anna zögert eine Sekunde zu lang. Der "
    "Streit, der folgt, handelt von allem außer der Wahrheit.",

    "Am Morgen des Laufs sieht sie Lenz zum ersten Mal ohne Ärmel: "
    "viele Male, alte und neue, eine ganze Schrift. Und darunter, "
    "zwei Sekunden lang, im Dampf, eines, das aussieht wie — "
    "vielleicht. Anna schließt die Augen. Sie legt das Pferdchen zu "
    "den abgelegten Dingen der Läufer, ohne dass jemand es sieht. "
    "Lenz läuft, und im Laufen richtet er sich auf, und kurz bevor "
    "das Blühen ihn nimmt, dreht er das Gesicht in den Geruch und "
    "lacht.",

    "Danach steigen die beiden Kinder auf den Hügel über der Stadt. "
    "Anna sagt zum ersten Mal laut die Geschichte auf, die ihre "
    "Mutter ihr hinterlassen hat — von einem Ort hoch über allem, wo "
    "alles Kaputte von oben aussieht wie heil. An einer Stelle fehlt "
    "ihr ein Wort; sie findet es nicht, und Jakob fragt nicht danach. "
    "Die Lücke bleibt stehen. Dann gehen sie hinunter, auf die "
    "Absperrung zu, hinter der die Welt einfach weitergeht. Ob sie "
    "durchkommen, sehen wir nicht.",
]

if __name__ == "__main__":
    page = []
    y = mp.PAGE_H - 64.0
    page.append(((mp.PAGE_W - 3 * CW) / 2, y, mp.F_BOLD, "TAU"))
    y -= 3 * LEAD
    zeilen = 0
    for absatz in ABSAETZE:
        for line in mp.wrap(absatz, COLS):
            page.append((X, y, mp.F_REG, line))
            y -= LEAD
            zeilen += 1
        y -= LEAD
    assert y + LEAD > 40, "Text läuft aus der Seite — kürzen!"

    dst = HERE / "TAU_Inhaltsangabe.pdf"
    mp.write_pdf([page], dst)
    print(f"{dst.name}: 1 Seite, {zeilen} Textzeilen, "
          f"Unterkante bei y={y + LEAD:.0f} pt, "
          f"{dst.stat().st_size / 1e3:.1f} kB")
