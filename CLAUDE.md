# untitled.movie

Ein Filmprojekt von Simon Meyborg — gemeinsam mit der künstlichen
Intelligenz als Co-Autor. Ausgangspunkt ist eine rund zwanzig Jahre
alte Storyline (siehe `story.md`): ein Politthriller, verschränkt mit
einer Coming-of-Age-Geschichte. Ziel ist eine große Erzählung; der Weg
dorthin wird auf untitled.movie öffentlich dokumentiert.

## Ordnerstruktur

- `story.md` — die ursprüngliche Storyline (Rohfassung, Quelle der Wahrheit für den Stoff)
- `referenzen.md` — Arbeitsbibliothek des Co-Autors: Referenzwerke, Handwerksprinzipien, offene Fragen an den Stoff (lebendes Dokument, wird nach jeder Arbeitssitzung nachgepflegt)
- `entwicklung.md` — Stoffentwicklung: gesetzte Weltlogik, Vorschläge des Co-Autors, offene Entscheidungsfragen (internes Dokument, Spoiler erlaubt)
- `autor.md` — Selbstauskunft des Co-Autors: Autortyp, Methode, ehrliche Haltung zum Vorhaben
- `outline.md` — Grob-Outline (Station 2 des Fahrplans): Bauentscheidungen, acht Sequenzen, Zeitleiste; Vorschlag des Co-Autors, Entscheidungen beim Autor (internes Dokument, Spoiler erlaubt)
- `figuren.md` — Figuren-Dossiers (Station 3 des Fahrplans): ein Dossier pro Hauptfigur, nacheinander geliefert; kein Steckbrief-Format, Leben außerhalb der Handlung (internes Dokument, Spoiler erlaubt)
- `treatment-v1.md` — Treatment, Fassung 1 „Ein Blick" (Station 4): ein Strang, POV-Lock auf Anna, Vergangenheit als Sediment; neue Setzungs-Vorschläge im Anhang geflaggt (internes Dokument, Spoiler erlaubt)
- `treatment-v2.md` — Treatment, Fassung 2 „Zwei Stränge" (Station 4): beide Handlungsstränge parallel erzählt (Vergangenheit & Gegenwart), Länge unbeschränkt; Vergleichsraster im Anhang. Der Autor entscheidet zwischen den Erzählweisen am Material (internes Dokument, Spoiler erlaubt)
- `ideen.md` — Ideen-Stapel: Einfälle, die weder gesetzt noch verworfen sind, geparkt auf Wunsch des Autors, mit Herkunft und Datum (internes Dokument, Spoiler erlaubt)
- `audio/` — Audiofassungen von Werkstattdokumenten (per ElevenLabs-API erzeugt; ungeschwärzt, **nicht** für `site/` bestimmt; per `.gitignore` vom Repo ausgenommen). Der API-Key liegt in `.secrets/elevenlabs_api_key.txt` — eingeschränkter Key: nur Text-to-Speech erlaubt, `voices_read`/`user_read` gesperrt. Bisher genutzte Stimme: „Daniel" (`onwK4e9ZLuTAKqWW03F9`), Modell `eleven_multilingual_v2`; Texte >2.400 Zeichen an Absatzgrenzen chunken. Achtung: Das lokale Homebrew-ffmpeg ist defekt (libjxl-Version fehlt) — MP3-Teile stattdessen per Python zusammenfügen (ID3- und Xing/Info-Frames der Teile entfernen, Frames konkatenieren).
- `site/` — die Website untitled.movie (statisch, ohne Build-Schritt)
  - `index.html` — Seite 1 (Titelseite, 11.07.2026, der Autor); Einstieg ist immer diese Seite
  - `session-02.html` — Seite 2 (12.07.2026, der Co-Autor; blaue Seite)
  - `session-03.html` — Seite 3 (13.07.2026, der Autor; Arbeitstagebuch)
  - `session-04.html` — Seite 4 (13.07.2026, der Co-Autor; blaue Seite — der Fahrplan zur ersten Fassung, Original in `entwicklung.md`)
  - `session-05.html` — Seite 5 (14.07.2026, der Co-Autor; blaue Seite — die Grob-Outline als Anlage, Original in `outline.md`; Spoiler-Stellen geschwärzt, `span.redacted`)
  - `session-06.html` — Seite 6 (15.07.2026, der Autor; Arbeitstagebuch — das Dossier Anna als Anlage, Original in `figuren.md`; Spoiler-Stellen geschwärzt)
  - `session-07.html` — Seite 7 (15.07.2026, Autor & Co-Autor; zwei Stimmen auf einer Seite — die Dossiers 2–8 als Anlagen A–E, Original in `figuren.md`; Spoiler-Stellen geschwärzt)
  - `session-08.html` — Seite 8 (17.07.2026, der Autor; beide Treatments als Anlagen, ungeschwärzt, mit Audio-Playern DE/EN; Originale in `treatment-v1.md`/`treatment-v2.md`; Seite wird aus den Markdown-Quellen per Skript gebaut)
  - `audio/` (in `site/`) — Audiofassungen der Treatments für die Website (DE + EN, je Fassung; ~25–30 MB pro Datei; per `.gitignore` vom Repo ausgenommen, müssen beim FTP-Upload mitkopiert werden)
  - `danke.html` — Ziel nach Newsletter-Anmeldung (noindex, keine Drehbuchseite — nicht in `pages.js` eintragen)
  - `impressum.html` / `datenschutz.html` — Rechtsseiten (DE rechtsverbindlich, EN als Service-Übersetzung; keine Drehbuchseiten — nicht in `pages.js` eintragen). Der Fußbereich `footer.legal` mit beiden Links steht auf **jeder** Seite — bei neuen Seiten mitkopieren. `datenschutz.html` nachziehen, wenn sich die Datenverarbeitung ändert (neues Tool = neuer Abschnitt).
  - `css/style.css` — Drehbuch-/Schreibmaschinen-Look (Courier Prime, Papier-Optik)
  - `js/lang.js` — Sprachumschaltung (gespeicherte Wahl > Browsersprache > Deutsch)
  - `js/pages.js` — Seiten-Manifest + Blätter-Navigation (vor/zurück, Sprung zur letzten Seite) + einblendbare Seitenleiste mit Miniaturen (☰, wie in der macOS-Vorschau; Miniaturen sind skalierte Live-iframes, bauen sich aus dem Manifest selbst)
  - `fonts/` — Courier Prime selbst gehostet (woff2, SIL Open Font License, kein Google-CDN)
  - `favicon.svg` / `favicon.ico` / `favicon-16.png` / `favicon-32.png` / `apple-touch-icon.png` — Favicon (Papier, blaues Eselsohr, Cursor-Unterstrich; die PNGs/ICO sind aus dem SVG-Motiv programmatisch erzeugt). Die drei `<link rel="icon/apple-touch-icon">`-Zeilen im `<head>` bei neuen Seiten mitkopieren.

## Deployment

Der komplette Inhalt von `site/` wird per FileZilla (FTP) auf den
Webspace von untitled.movie geschoben — `site/` entspricht dem
Document-Root. Deshalb gilt:

- **Kein Build-Schritt.** Alles in `site/` muss direkt im Browser lauffähig sein.
- **Keine externen CDNs.** Fonts und Assets liegen lokal in `site/`.
  **Ausnahme (Entscheidung des Autors, 13.07.2026):** Google Analytics 4
  (gtag.js, ID `G-F3DR5ZX5H7`) ist auf allen Seiten im `<head>`
  eingebunden — bei jeder neuen Seite mitkopieren. Der Inline-Teil ist
  mit `window.self === window.top` geschützt, damit die
  Miniatur-iframes der Seitenleiste keine Seitenaufrufe zählen.
  Offener Punkt: DSGVO/TTDSG-Einwilligung (Banner) ist noch nicht
  gelöst.
- **Relative Pfade** verwenden, damit die Seite unabhängig vom Server funktioniert.

## Konventionen

- Die Seite ist zweisprachig: Jede inhaltliche Änderung muss **immer in
  beiden Sprachfassungen** (`article[data-lang="de"]` und
  `article[data-lang="en"]` in `index.html`) nachgezogen werden.
- Anmutung: Drehbuch / Schreibmaschine. Courier Prime, Großbuchstaben-
  Überschriften, unterstrichene Filmtitel (statt kursiv), Papierton.
  Neue Elemente sollen sich diesem Look unterordnen.
- Texte auf der Seite sind vom Autor unterschrieben und datiert
  (zuerst: Hamburg, 11.07.2026). Neue Einträge erhalten eigene Daten.
- Die Seite wird sich weiterentwickeln (Arbeitstagebuch, Szenen,
  Fassungen) — Struktur bewusst einfach halten, damit sie per FTP
  kopierbar bleibt.
- Die Website ist ein durchblätterbares Drehbuch: Jede Session wird
  eine neue Seite (`session-NN.html`), die in `js/pages.js` ans Ende
  der Liste eingetragen wird — als Eintrag `{ file, de, en }` mit
  Kurztitel in beiden Sprachen (erscheint in der Seitenleiste unter
  der Miniatur). Mehr ist für das Blättern nicht nötig.
- Seiten, auf denen der Co-Autor spricht, sind **blaue Seiten**
  (`<body class="revision-blue">` + Vermerk „Blaue Fassung" im
  Seitenkopf) — wie farbige Änderungsseiten im alten Kopierverfahren.
  Weiße Seiten gehören dem Autor.
- Arbeitsdokumente (z.B. `autor.md`, `referenzen.md`) erscheinen auf
  Session-Seiten als aufklappbare „Anlagen" (`details.attachment`) —
  als Momentaufnahme mit Stand-Datum, vollständig in DE **und** EN.
  Die Originale leben im Repo weiter.
- Der blinkende Cursor steht immer am Ende der jeweils letzten Seite
  (dort wächst das Dokument weiter) — beim Anlegen einer neuen Seite
  von der vorherigen dorthin verschieben.
- **Spoiler-Schutz (geändert 17.07.2026):** Mit Seite 8 hat der
  Autor entschieden, die Treatments ungeschwärzt zu
  veröffentlichen — die verdeckte Verbindung der beiden Kinder ist
  damit öffentlich. Der alte Schutz (Schwärzungen mit
  `span.redacted`) gilt für die Seiten 5–7 als historischer Stand
  weiter und wird dort nicht rückwirkend entfernt. Neue Seiten
  brauchen keine Schwärzungen mehr; die Anlagen-Warnung („Wer die
  Geschichte lieber im fertigen Film entdecken will …") von Seite 8
  bei spoilerhaltigen Anlagen mitkopieren.

## Marke

Entscheidung des Autors (13.07.2026): Richtung A — „der Cursor".

- **Wortmarke:** `untitled.movie_` in Courier Prime Bold, Kleinschreibung,
  blinkender Unterstrich. Dateien in `logo/`: `wortmarke.svg` (statisch),
  `wortmarke-blinkend.svg` (CSS-Blinken, respektiert
  `prefers-reduced-motion`). Courier Prime Bold ist als Base64
  eingebettet — die SVGs sind eigenständig verwendbar.
- **Bildmarke:** Blatt Papier mit Eselsohr in Revisionsblau und
  Cursor-Unterstrich (`logo/bildmarke.svg`). Das Favicon ist daraus
  abgeleitet.
- **Farben:** Papier `#fbf9f4`, Tinte `#232323`, Rand `#d8d3c8`,
  Revisionsblau `#9cb9d6`.
- Das Logo ist bewusst noch **nicht** auf der Website eingebaut
  (Stand 13.07.2026); das Favicon ist live.

## Newsletter

Buttondown-Konto `untitled-movie` (eingerichtet 13.07.2026). Regeln:

- Der API-Key liegt in `.secrets/buttondown_api_key.txt` — niemals
  nach `site/` kopieren, niemals committen (steht in `.gitignore`).
  Der aktuelle Key kann Abonnenten lesen/verwalten, aber keine
  Newsletter-Einstellungen ändern (403) — Einstellungen macht der
  Autor im Buttondown-Backend.
- Der Anmeldeblock (`section.newsletter`, unter dem Pager) steht auf
  jeder Drehbuchseite — bei neuen Seiten mitkopieren (wie das
  GA-Snippet). Das Formular nutzt den öffentlichen Embed-Endpunkt,
  kein Key nötig.
- Double-Opt-in ist aktiv (verifiziert 13.07.2026: Anmeldungen landen
  als `unactivated`) und muss aktiv bleiben — Pflicht in DE.
- Newsletter-Versand (API oder Backend) nur nach ausdrücklichem Okay
  des Autors, jede Aussendung einzeln.
- Impressum + Datenschutzerklärung sind seit 13.07.2026 online
  (`impressum.html`, `datenschutz.html`). Weiter offen: Ein
  Einwilligungs-Banner für Google Analytics gibt es nicht — GA lädt
  vor jeder Einwilligung (bewusste Entscheidung des Autors, rechtlich
  nicht robust). Redirect nach Anmeldung auf `danke.html` muss der
  Autor im Buttondown-Backend setzen (Settings → Subscribing →
  redirect URL).

## Arbeitsweise mit der KI

Die KI ist Co-Autor, nicht nur Werkzeug: Sie hilft beim Entwickeln der
Erzählung (Figuren, Struktur, Szenen) und beim Dokumentieren des
Prozesses auf der Website. Entscheidungen über den Stoff trifft der
Autor.
