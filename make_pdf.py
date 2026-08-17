#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Drehbuch-PDF für untitled.movie — ohne Fremdbibliotheken.

Setzt die Fountain-Fassungen als klassisches Drehbuch-PDF (Courier 12,
A4): Titelseite, Sequenz-Sections, Szenenüberschriften, Arbeitstitel
kursiv, Dialogblöcke eingerückt, Seitenzahlen. Werkstatt-Notes [[…]]
und Beat-Metadaten werden entfernt. Das griechische τ wird über die
PDF-Basisschrift Symbol gesetzt (alles andere ist cp1252).

Aufruf:
  python3 make_pdf.py            # baut DE + EN nach site/download/
"""

import re
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "site" / "download"

PAGE_W, PAGE_H = 595.28, 841.89          # A4
ML, MR, MT, MB = 108.0, 60.0, 76.0, 64.0
SIZE, LEAD = 12.0, 12.5
CW = 7.2                                  # Courier-Laufweite bei 12 pt
USABLE_W = PAGE_W - ML - MR
ACTION_COLS = int(USABLE_W // CW)         # 59
DIAL_X, DIAL_COLS = ML + 72, 34
PAREN_X, PAREN_COLS = ML + 108, 26
CUE_X = ML + 150
LINES_PER_PAGE = int((PAGE_H - MT - MB) // LEAD)

NOTE_RE = re.compile(r"\[\[.*?\]\]", re.S)
CHAR_RE = re.compile(
    r"^@?[A-ZÄÖÜ][A-ZÄÖÜ0-9 '’\-\.]*"
    r"(\s*\([^()]*\))?$"          # Erweiterung frei: (OFF), (CONT'D), (rufend) …
)
PAREN_LINE_RE = re.compile(r"^\(.*\)$")

F_REG, F_BOLD, F_OBL, F_SYM = "F1", "F2", "F3", "F4"


def esc(b):
    return b.replace(b"\\", b"\\\\").replace(b"(", b"\\(").replace(b")", b"\\)")


def runs_for(text):
    """Text → [(font_override oder None, teilstring)] — τ über Symbol."""
    out = []
    for part in re.split(r"(τ)", text):
        if not part:
            continue
        out.append((F_SYM, "t") if part == "τ" else (None, part))
    return out


def wrap(text, cols):
    words, lines, cur = text.split(), [], ""
    for w in words:
        if cur and len(cur) + 1 + len(w) > cols:
            lines.append(cur)
            cur = w
        else:
            cur = w if not cur else cur + " " + w
    if cur:
        lines.append(cur)
    return lines or [""]


class Doc:
    def __init__(self):
        self.pages = []          # je Seite: Liste von (x, y, font, text)
        self.cur = []
        self.line = 0

    def need(self, n):
        if self.line + n > LINES_PER_PAGE:
            self.flush()

    def flush(self):
        self.pages.append(self.cur)
        self.cur, self.line = [], 0

    def put(self, x, text, font=F_REG, blank_before=0):
        for _ in range(blank_before):
            if self.line < LINES_PER_PAGE:
                self.line += 1
        if self.line >= LINES_PER_PAGE:
            self.flush()
        y = PAGE_H - MT - self.line * LEAD
        self.cur.append((x, y, font, text))
        self.line += 1

    def blank(self, n=1):
        if self.line:                      # keine Leerzeilen am Seitenkopf
            self.line = min(self.line + n, LINES_PER_PAGE)


def center_x(text):
    return ML + max(0.0, (USABLE_W - len(text) * CW) / 2)


def page_center_x(text):
    """Echte Seitenmitte — für die Titelseite (der Satzspiegel ist
    wegen des Bundstegs asymmetrisch, center_x säße 24 pt rechts)."""
    return max(0.0, (PAGE_W - len(text) * CW) / 2)


def parse(path):
    raw = path.read_text(encoding="utf-8")
    raw = raw.split("/* If you're seeing this")[0]
    raw = NOTE_RE.sub("", raw)
    lines = raw.split("\n")

    meta, i = {}, 0
    while i < len(lines):
        l = lines[i]
        if l.strip() == "":
            j = i + 1
            while j < len(lines) and lines[j].strip() == "":
                j += 1
            if j >= len(lines) or (not re.match(r"^\w[\w ]*:", lines[j])
                                   and not lines[j].startswith(("  ", "\t"))):
                i = j
                break
        else:
            m = re.match(r"^(\w[\w ]*):\s*(.*)$", l)
            if m:
                meta[m.group(1)] = m.group(2).strip()
        i += 1

    blocks, cur = [], []
    for line in lines[i:]:
        if line.strip() == "":
            if cur:
                blocks.append(cur)
                cur = []
        else:
            cur.append(line.rstrip())
    if cur:
        blocks.append(cur)
    return meta, blocks


def render(meta, blocks, out_path, stand, footer="untitled.movie",
           contact=None):
    doc = Doc()

    # Titelseite
    t = Doc()
    t.line = 14
    title = meta.get("Title", "[ohne Titel]")
    t.put(page_center_x(title.upper()), title.upper(), F_BOLD)
    t.blank(2)
    for key in ("Credit", "Author", "Source"):
        if meta.get(key):
            t.put(page_center_x(meta[key]), meta[key])
            t.blank(1)
    t.blank(6)
    for extra in (stand, footer):
        if extra:
            t.put(page_center_x(extra), extra)
            t.blank(1)
    t.flush()
    title_page = t.pages[0]
    if contact:                            # Kontaktblock unten links
        for i, line in enumerate(contact):
            y = MB + (len(contact) - 1 - i) * LEAD
            title_page.append((ML, y, F_REG, line))

    for block in blocks:
        first = block[0]

        if first.startswith("#"):
            text = first.lstrip("#").strip()
            doc.blank(2)
            doc.need(3)
            doc.put(center_x(text), text, F_BOLD)
            doc.blank(1)
            continue

        if first.startswith("."):
            text = first[1:].strip()
            doc.blank(1)
            doc.need(3)
            doc.put(ML, text, F_BOLD)
            continue

        if first.startswith("="):
            text = first.lstrip("=").strip()
            doc.need(2)
            doc.put(ML, text, F_OBL)
            doc.blank(1)
            continue

        if first.startswith(">"):
            text = " ".join(b.strip() for b in block)
            if text.rstrip().endswith("<"):
                for b in block:
                    s = b.strip().strip("<>").strip()
                    if s:
                        doc.need(1)
                        doc.put(center_x(s), s, F_BOLD)
                doc.blank(1)
            else:
                s = text.lstrip(">").strip()
                doc.need(1)
                doc.put(ML + USABLE_W - len(s) * CW, s)
                doc.blank(1)
            continue

        if CHAR_RE.match(first.strip()) and len(block) > 1:
            name = first.strip().lstrip("@")
            body = []
            for l in block[1:]:
                s = l.strip()
                if PAREN_LINE_RE.match(s):
                    body.append(("paren", s))
                else:
                    for wline in wrap(s, DIAL_COLS):
                        body.append(("dial", wline))
            doc.need(2 + min(2, len(body)))
            doc.put(CUE_X, name)
            for kind, text in body:
                if kind == "paren":
                    for wline in wrap(text, PAREN_COLS):
                        doc.put(PAREN_X, wline)
                else:
                    doc.put(DIAL_X, text)
            doc.blank(1)
            continue

        for l in block:
            for wline in wrap(l.strip(), ACTION_COLS):
                doc.need(1)
                doc.put(ML, wline)
        doc.blank(1)

    doc.flush()
    pages = [title_page] + doc.pages

    # Seitenzahlen (ab Inhaltseite 1, Titelseite ungezählt)
    for n, page in enumerate(pages[1:], 1):
        label = f"{n}."
        page.append((PAGE_W - MR - len(label) * CW, PAGE_H - 46, F_REG, label))

    write_pdf(pages, out_path)
    return len(pages)


def write_pdf(pages, out_path):
    objs = []

    def add(body):
        objs.append(body)
        return len(objs)          # 1-basiert

    font_ids = {}
    for fkey, base in ((F_REG, "Courier"), (F_BOLD, "Courier-Bold"),
                       (F_OBL, "Courier-Oblique")):
        font_ids[fkey] = add(
            f"<< /Type /Font /Subtype /Type1 /BaseFont /{base} "
            f"/Encoding /WinAnsiEncoding >>".encode())
    font_ids[F_SYM] = add(b"<< /Type /Font /Subtype /Type1 /BaseFont /Symbol >>")

    page_ids, content_ids = [], []
    for page in pages:
        parts = []
        for x, y, font, text in page:
            parts.append(f"BT /{font} {SIZE:g} Tf {x:.2f} {y:.2f} Td ".encode())
            buf = b""
            for f_over, seg in runs_for(text):
                if f_over:
                    if buf:
                        parts.append(b"(" + esc(buf) + b") Tj ")
                        buf = b""
                    parts.append(f"/{f_over} {SIZE:g} Tf ".encode())
                    parts.append(b"(" + esc(seg.encode("cp1252")) + b") Tj ")
                    parts.append(f"/{font} {SIZE:g} Tf ".encode())
                else:
                    buf += seg.encode("cp1252", "replace")
            if buf:
                parts.append(b"(" + esc(buf) + b") Tj ")
            parts.append(b"ET\n")
        stream = zlib.compress(b"".join(parts))
        content_ids.append(add(
            b"<< /Length " + str(len(stream)).encode()
            + b" /Filter /FlateDecode >>\nstream\n" + stream + b"\nendstream"))

    res = ("<< /Font << " + " ".join(
        f"/{k} {v} 0 R" for k, v in font_ids.items()) + " >> >>").encode()
    pages_id = len(objs) + len(pages) + 1
    for cid in content_ids:
        page_ids.append(add(
            f"<< /Type /Page /Parent {pages_id} 0 R "
            f"/MediaBox [0 0 {PAGE_W:g} {PAGE_H:g}] "
            f"/Resources {res.decode()} /Contents {cid} 0 R >>".encode()))
    kids = " ".join(f"{p} 0 R" for p in page_ids)
    assert add(f"<< /Type /Pages /Kids [{kids}] /Count {len(page_ids)} >>"
               .encode()) == pages_id
    cat_id = add(f"<< /Type /Catalog /Pages {pages_id} 0 R >>".encode())

    out = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = [0]
    for n, body in enumerate(objs, 1):
        offsets.append(len(out))
        out += f"{n} 0 obj\n".encode() + body + b"\nendobj\n"
    xref = len(out)
    out += f"xref\n0 {len(objs)+1}\n".encode()
    out += b"0000000000 65535 f \n"
    for off in offsets[1:]:
        out += f"{off:010d} 00000 n \n".encode()
    out += (f"trailer\n<< /Size {len(objs)+1} /Root {cat_id} 0 R >>\n"
            f"startxref\n{xref}\n%%EOF\n").encode()
    out_path.write_bytes(bytes(out))


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for src, dst, stand in (
        (ROOT / "Untitled.fountain", OUT / "drehbuch-v1-de.pdf",
         "Erste Fassung — Stand: 11. August 2026"),
        (ROOT / "drehbuch-v1-en.fountain", OUT / "drehbuch-v1-en.pdf",
         "First draft — as of 11 August 2026"),
    ):
        meta, blocks = parse(src)
        n = render(meta, blocks, dst, stand)
        print(f"{dst.name}: {n} Seiten, {dst.stat().st_size/1e3:.0f} kB")
