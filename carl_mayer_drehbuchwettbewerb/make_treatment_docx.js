#!/usr/bin/env node
/*
 * Baut TAU_Treatment.docx für den Carl-Mayer-Drehbuchwettbewerb 2027
 * aus treatment-cmd.md (Quelle der Wahrheit, im selben Ordner).
 *
 * Vorgaben der Ausschreibung: Word-Datei, anonym (keine persönlichen
 * Angaben, auch nicht in den Datei-Metadaten), DIN A4, 12 Punkt,
 * max. 56 Zeilen/Seite. Satz: Courier New 12, einzeilig — passend
 * zum Schreibmaschinen-Look des Projekts.
 *
 * Markdown-Konventionen der Quelle:
 *   # …               Titel (Titelseite)
 *   TITELSEITE: …     Zeilen bis ENDE-TITELSEITE zentriert auf Seite 1
 *   ## …              Abschnitt (neue Seite)
 *   ### …             Unterabschnitt
 *   SLUG: …           Szenenüberschrift (fett, Versalien)
 *   VORBEMERKUNG: …   kursiv
 *   @NAME             Sprecher; Folgezeilen im Block: (…) = Parenthese,
 *                     sonst Dialog
 *   alles andere      Fließtext-Absatz
 *
 * Aufruf:  node make_treatment_docx.js
 */

const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak,
} = require("docx");

const HERE = __dirname;
const SRC = path.join(HERE, "treatment-cmd.md");
const DST = path.join(HERE, "TAU_Treatment.docx");

const FONT = "Courier New";
const SIZE = 24; // 12 pt in Halbpunkten

const run = (text, opts = {}) =>
  new TextRun({ text, font: FONT, size: SIZE, ...opts });

const para = (children, opts = {}) => new Paragraph({ children, ...opts });

const SPACE_AFTER = { after: 200 }; // 10 pt Abstand nach Absätzen

function blocksOf(src) {
  return src
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
}

function build() {
  const src = fs.readFileSync(SRC, "utf8");
  const blocks = blocksOf(src);

  const children = [];
  let title = "TAU";
  let firstSection = true;

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim());

    if (lines[0].startsWith("# ")) {
      title = lines[0].slice(2).trim();
      continue;
    }

    if (lines[0] === "TITELSEITE:") {
      // Titelseite: Leerraum, Titel groß, dann die Zeilen zentriert.
      for (let i = 0; i < 10; i++) children.push(para([run("")]));
      children.push(
        para([run(title, { bold: true, size: 56 })], {
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
        })
      );
      for (const l of lines.slice(1)) {
        if (l === "ENDE-TITELSEITE") break;
        children.push(
          para([run(l)], { alignment: AlignmentType.CENTER, spacing: { after: 200 } })
        );
      }
      children.push(para([new PageBreak()]));
      firstSection = true;
      continue;
    }

    if (lines[0].startsWith("## ")) {
      const text = lines[0].slice(3).trim().toUpperCase();
      const p = para([run(text, { bold: true })], {
        spacing: { before: 240, after: 360 },
        pageBreakBefore: !firstSection,
      });
      firstSection = false;
      children.push(p);
      continue;
    }

    if (lines[0].startsWith("### ")) {
      children.push(
        para([run(lines[0].slice(4).trim(), { bold: true })], {
          spacing: { before: 360, after: 240 },
        })
      );
      continue;
    }

    if (lines[0].startsWith("SLUG: ")) {
      children.push(
        para([run(lines[0].slice(6).trim().toUpperCase(), { bold: true })], {
          spacing: { before: 240, after: 240 },
        })
      );
      continue;
    }

    if (lines[0].startsWith("VORBEMERKUNG:")) {
      children.push(
        para([run(lines.join(" "), { italics: true })], {
          spacing: SPACE_AFTER,
        })
      );
      continue;
    }

    if (lines[0].startsWith("@")) {
      // Dialogblock: Sprecher, dann Parenthesen/Dialogzeilen.
      children.push(
        para([run(lines[0].slice(1).trim().toUpperCase())], {
          indent: { left: 2880 },
          spacing: { before: 120 },
        })
      );
      for (const l of lines.slice(1)) {
        if (l.startsWith("(")) {
          children.push(para([run(l)], { indent: { left: 2304, right: 1152 } }));
        } else {
          children.push(para([run(l)], { indent: { left: 1728, right: 1152 } }));
        }
      }
      children.push(para([run("")], { spacing: { after: 60 } }));
      continue;
    }

    // Fließtext: Zeilen eines Blocks zu einem Absatz verbinden.
    children.push(para([run(lines.join(" "))], { spacing: SPACE_AFTER }));
  }

  const doc = new Document({
    creator: "", // anonym — keine persönlichen Angaben, auch nicht hier
    lastModifiedBy: "",
    title: "TAU — Treatment",
    description: "",
    sections: [{ properties: {}, children }], // A4 ist docx-Standard
  });

  return Packer.toBuffer(doc);
}

build().then((buf) => {
  fs.writeFileSync(DST, buf);
  console.log(`${path.basename(DST)}: ${(buf.length / 1e3).toFixed(1)} kB`);
});
