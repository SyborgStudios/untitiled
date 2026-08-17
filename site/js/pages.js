/* untitled.movie — Blättern zwischen den Drehbuchseiten.
 * Der Einstieg ist immer Seite 1 (index.html); von dort kann man
 * vor- und zurückblättern, zur letzten Seite springen oder über
 * die Seitenleiste (Miniaturen, wie in der macOS-Vorschau) direkt
 * eine Seite ansteuern.
 *
 * Neue Session veröffentlichen = Datei anlegen und hier ans Ende
 * der Liste setzen (mit Kurztitel in DE und EN für die
 * Seitenleiste). Navigation und Seitenleiste bauen sich selbst.
 */
(function () {
  var PAGES = [
    /* Seite 1 — 11.07.2026, der Autor */
    { file: "index.html",      de: "Titelseite",      en: "Title page" },
    /* Seite 2 — 12.07.2026, der Co-Autor (blaue Seite) */
    { file: "session-02.html", de: "Der Co-Autor",    en: "The co-author" },
    /* Seite 3 — 13.07.2026, der Autor (Arbeitstagebuch) */
    { file: "session-03.html", de: "Arbeitstagebuch", en: "Work diary" },
    /* Seite 4 — 13.07.2026, der Co-Autor (der Fahrplan, blaue Seite) */
    { file: "session-04.html", de: "Der Fahrplan",    en: "The road map" },
    /* Seite 5 — 14.07.2026, der Co-Autor (die Grob-Outline, blaue Seite) */
    { file: "session-05.html", de: "Die Grob-Outline", en: "The rough outline" },
    /* Seite 6 — 15.07.2026, der Autor (Arbeitstagebuch; Anlage: Dossier Anna) */
    { file: "session-06.html", de: "Anna", en: "Anna" },
    /* Seite 7 — 15.07.2026, Autor & Co-Autor (zwei Stimmen; Anlagen: alle Dossiers) */
    { file: "session-07.html", de: "Zwei Stimmen", en: "Two voices" },
    /* Seite 8 — 17.07.2026, der Autor (beide Treatments, Text + Audio, ungeschwärzt) */
    { file: "session-08.html", de: "Die Treatments", en: "The treatments" },
    /* Seite 9 — 20.07.2026, Autor & Co-Autor (das Schleifen; Anlagen: Treatments + Szenen-Outline) */
    { file: "session-09.html", de: "Die Szenen-Outline", en: "The scene outline" },
    /* Seite 10 — 21.07.2026, Autor & Co-Autor (die erste Fassung; Anlagen: Drehbuch DE/EN + Hörspiele) */
    { file: "session-10.html", de: "Die erste Fassung", en: "The first draft" },
    /* Seite 11 — 24.07.2026, Autor & Co-Autor (der erste Durchgang; Anlage: Drehbuch DE/EN, Stand 24.07.) */
    { file: "session-11.html", de: "Der erste Durchgang", en: "The first pass" },
    /* Seite 12 — 27.07.2026, der Autor (wie wir arbeiten; Anlagen: zwei Gesprächsprotokolle) */
    { file: "session-12.html", de: "Wie wir arbeiten", en: "How we work" },
    /* Seite 13 — 04.08.2026, der Co-Autor (blaue Seite; Anlagen: Drehbuch-PDFs + Lesefassungen DE/EN) */
    { file: "session-13.html", de: "Lesen & Hören", en: "Read & listen" },
    /* Seite 14 — 11.08.2026, der Autor (die Bilanz; Anlagen: Werkstatt-Protokoll + Drehbuch-PDFs) */
    { file: "session-14.html", de: "Was Claude kann", en: "What Claude can do" },
    /* Seite 15 — 14.08.2026, der Autor (Strang 1; Anlage: Szenen-Outline „Die Felder"; neue Lesefassung im Player) */
    { file: "session-15.html", de: "Der erste Strang", en: "The first strand" }
  ];

  var file = location.pathname.split("/").pop() || "index.html";
  var current = -1;
  for (var i = 0; i < PAGES.length; i++) {
    if (PAGES[i].file === file) { current = i; break; }
  }
  if (current === -1) return;

  function label(de, en) {
    return '<span data-lang="de">' + de + "</span>" +
           '<span data-lang="en">' + en + "</span>";
  }

  /* --- Blätter-Navigation (unten auf der Seite) ------------------- */

  var nav = document.querySelector(".pager");
  if (nav) {
    function link(href, html, rel) {
      return '<a href="' + href + '"' + (rel ? ' rel="' + rel + '"' : "") + ">" + html + "</a>";
    }

    var prev = "";
    if (current > 0) {
      prev = link(PAGES[current - 1].file,
        "&lsaquo; " + label("Seite " + current, "Page " + current), "prev");
    }

    var next = "";
    if (current < PAGES.length - 1) {
      next = link(PAGES[current + 1].file,
        label("Seite " + (current + 2), "Page " + (current + 2)) + " &rsaquo;", "next");
      if (current + 1 < PAGES.length - 1) {
        next += " &nbsp;&middot;&nbsp; " +
          link(PAGES[PAGES.length - 1].file, label("letzte Seite", "last page") + " &raquo;");
      }
    }

    nav.innerHTML =
      '<span class="pager-prev">' + prev + "</span>" +
      '<span class="pager-pos">' +
        label("Seite " + (current + 1) + " von " + PAGES.length,
              "Page " + (current + 1) + " of " + PAGES.length) +
      "</span>" +
      '<span class="pager-next">' + next + "</span>";
  }

  /* --- Seitenleiste mit Miniaturen --------------------------------- */
  /* Nicht innerhalb der Miniatur-iframes aufbauen — sonst Rekursion. */

  if (window.self !== window.top) return;

  var KEY = "untitled-movie-thumbs";

  var toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "thumbs-toggle";
  toggle.innerHTML = "&#9776;";
  toggle.setAttribute("aria-label", "Seitenübersicht / Page thumbnails");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", "thumbs");

  var aside = document.createElement("aside");
  aside.className = "thumbs";
  aside.id = "thumbs";
  aside.setAttribute("aria-label", "Seitenübersicht / Page thumbnails");

  var html = "";
  for (var p = 0; p < PAGES.length; p++) {
    html += '<a class="thumb" href="' + PAGES[p].file + '"' +
      (p === current ? ' aria-current="page"' : "") + ">" +
      '<span class="thumb-frame" data-src="' + PAGES[p].file + '"></span>' +
      '<span class="thumb-label">' + (p + 1) + " &middot; " +
        label(PAGES[p].de, PAGES[p].en) +
      "</span></a>";
  }
  aside.innerHTML = html;

  /* Die Miniaturen sind echte, verkleinerte Seiten (iframes) —
   * geladen erst, wenn die Leiste zum ersten Mal geöffnet wird. */
  var loaded = false;
  function loadThumbs() {
    if (loaded) return;
    loaded = true;
    aside.querySelectorAll(".thumb-frame").forEach(function (frame) {
      var ifr = document.createElement("iframe");
      ifr.src = frame.getAttribute("data-src");
      ifr.loading = "lazy";
      ifr.setAttribute("scrolling", "no");
      ifr.setAttribute("tabindex", "-1");
      ifr.setAttribute("aria-hidden", "true");
      frame.appendChild(ifr);
    });
  }

  function setOpen(open, persist) {
    document.body.classList.toggle("thumbs-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    if (open) loadThumbs();
    if (persist) {
      try { localStorage.setItem(KEY, open ? "open" : "closed"); } catch (e) {}
    }
  }

  toggle.addEventListener("click", function () {
    setOpen(!document.body.classList.contains("thumbs-open"), true);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setOpen(false, true);
  });

  /* Mobil: Ein horizontaler Wisch schließt die offene Leiste.
   * Deutlich horizontal (nicht scrollen) und weit genug (kein Tippen). */
  var swipeX = null, swipeY = null;
  document.addEventListener("touchstart", function (e) {
    if (!document.body.classList.contains("thumbs-open")) return;
    swipeX = e.touches[0].clientX;
    swipeY = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener("touchend", function (e) {
    if (swipeX === null) return;
    var dx = e.changedTouches[0].clientX - swipeX;
    var dy = e.changedTouches[0].clientY - swipeY;
    swipeX = swipeY = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      setOpen(false, true);
    }
  }, { passive: true });

  /* Sprachwechsel: Miniaturen neu laden, damit sie der Wahl folgen.
   * (lang.js hat seine Listener zuerst registriert — beim Neuladen
   * steht die neue Sprache also schon im localStorage.) */
  document.querySelectorAll(".lang-switch button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      aside.querySelectorAll("iframe").forEach(function (ifr) {
        ifr.src = ifr.getAttribute("src");
      });
    });
  });

  document.body.appendChild(toggle);
  document.body.appendChild(aside);

  try {
    if (localStorage.getItem(KEY) === "open") setOpen(true, false);
  } catch (e) {}
})();
