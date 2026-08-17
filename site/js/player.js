/* untitled.movie — Der Player: die aktuelle Lesefassung, auf jeder Seite.
 *
 * Baut sich selbst (kein Markup in den Seiten nötig): unten rechts eine
 * kleine Karte im Papierton der jeweiligen Seite, auf schmalen Schirmen
 * eine feste Leiste am unteren Rand. Beides lässt sich zur Seite
 * einklappen — dann bleibt nur ein Reiter stehen.
 *
 * Weil die Website ein durchblätterbares Drehbuch ist, merkt sich der
 * Player die Hörposition (localStorage) und nimmt sie auf der nächsten
 * Seite wieder auf; ob dabei weitergespielt wird, steht im
 * sessionStorage — wer Tage später zurückkommt, bekommt keinen Ton
 * ins Gesicht, sondern seine Stelle.
 *
 * Die Sprache der Spur folgt der Seite: englische Seite, englische
 * Lesefassung. Wer mitten im Hören umschaltet, landet an derselben
 * Stelle der anderen Fassung (anteilig — es ist derselbe Text).
 *
 * Zwei Meldungen gehen an Google Analytics: einmal, wenn jemand von
 * Hand auf Abspielen drückt, und danach je gehörter Minute eine —
 * daran sieht man, ob jemand wirklich zuhört oder nur antippt.
 *
 * Neue Lesefassung = Dateiname/Dauer in TRACKS anpassen.
 */
(function () {
  /* Nicht in den Miniatur-iframes der Seitenleiste aufbauen. */
  if (window.self !== window.top) return;

  var TRACKS = {
    de: { src: "audio/drehbuch-v1-lesefassung-de.mp3", secs: 4787 },
    en: { src: "audio/drehbuch-v1-lesefassung-en.mp3", secs: 5262 }
  };

  var POS_KEY   = "untitled-movie-player-pos";    /* {track, t} — bleibt */
  var UI_KEY    = "untitled-movie-player-ui";     /* "open" | "mini"     */
  var RUN_KEY   = "untitled-movie-player-run";    /* nur diese Sitzung   */
  var HEARD_KEY = "untitled-movie-player-heard";  /* gehörte Sekunden    */

  var STR = {
    de: {
      title: "Die Lesefassung",
      lang: { de: "Deutsch", en: "Englisch" },
      sub: "Erste Fassung",
      play: "Abspielen", pause: "Pause",
      back: "30 Sekunden zurück", fwd: "30 Sekunden vor",
      mini: "Player einklappen", open: "Lesefassung anhören",
      tab: "Hören", pos: "Hörposition"
    },
    en: {
      title: "The reading version",
      lang: { de: "German", en: "English" },
      sub: "First draft",
      play: "Play", pause: "Pause",
      back: "Back 30 seconds", fwd: "Forward 30 seconds",
      mini: "Collapse player", open: "Listen to the reading version",
      tab: "Listen", pos: "Playback position"
    }
  };

  /* --- Speicher (Safari im privaten Modus darf auch nein sagen) ------ */

  function get(store, key) {
    try { return store.getItem(key); } catch (e) { return null; }
  }
  function set(store, key, value) {
    try { store.setItem(key, value); } catch (e) {}
  }

  /* --- Meldung an Google Analytics ------------------------------------ */
  /* gtag steht nur im Hauptfenster und nur, wenn das Snippet geladen hat
   * (Blocker, kein Netz) — deshalb jedes Mal nachsehen. */

  function ga(name, params) {
    if (typeof window.gtag === "function") window.gtag("event", name, params);
  }

  /* --- Zustand ------------------------------------------------------- */

  var page = location.pathname.split("/").pop() || "index.html";
  var ui = document.body.getAttribute("data-lang") === "en" ? "en" : "de";
  var track = ui;        /* die Sprache der Seite bestimmt die Fassung */
  var startAt = 0;
  var touched = false;   /* schon benutzt? dann gibt es was zu merken  */

  var stored = get(localStorage, POS_KEY);
  if (stored) {
    try {
      var p = JSON.parse(stored);
      if (TRACKS[p.track]) {
        startAt = Math.max(0, Number(p.t) || 0);
        touched = startAt > 0;
        /* Stelle aus der anderen Fassung: anteilig übertragen */
        if (p.track !== track) {
          startAt = startAt * TRACKS[track].secs / TRACKS[p.track].secs;
        }
      }
    } catch (e) {}
  }

  /* --- Aufbau -------------------------------------------------------- */

  /* Die Datei wird erst angefasst, wenn jemand den Player benutzt —
   * bis dahin kostet der Player kein einziges Byte. Die gemerkte
   * Stelle steht so lange nur in der Anzeige. */
  var audio = new Audio();
  audio.preload = "none";
  var armed = false;
  var shown = startAt;

  /* Die Stelle hängt als Medien-Fragment am Dateinamen (#t=…) statt sie
   * nach dem Laden zu setzen: Ein frisch gesetztes src verwirft ein
   * direkt zugewiesenes currentTime — der Browser fängt dann von vorn
   * an. Am Fragment kommt er nicht vorbei. */
  function source(at) {
    return TRACKS[track].src + (at >= 1 ? "#t=" + Math.floor(at) : "");
  }

  function arm() {
    if (armed) return;
    armed = true;
    audio.src = source(shown);
  }

  function pos() {
    return armed && audio.readyState > 0 ? (audio.currentTime || 0) : shown;
  }

  var el = document.createElement("div");
  el.className = "player";
  el.setAttribute("data-open", get(localStorage, UI_KEY) === "mini" ? "false" : "true");
  el.innerHTML =
    '<div class="player-card">' +
      '<div class="player-head">' +
        '<p class="player-title"></p>' +
        '<button type="button" class="player-mini">&ndash;</button>' +
      '</div>' +
      '<p class="player-sub"></p>' +
      '<div class="player-scrub" role="slider" tabindex="0"' +
        ' aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' +
        '<span class="player-line"><span class="player-fill"></span></span>' +
      '</div>' +
      '<div class="player-controls">' +
        '<button type="button" class="player-back">&laquo;&#8239;30</button>' +
        '<button type="button" class="player-play"><span class="player-glyph">&#9654;</span></button>' +
        '<button type="button" class="player-fwd">30&#8239;&raquo;</button>' +
        '<span class="player-time"><span class="player-now">0:00</span>' +
        ' / <span class="player-total"></span></span>' +
      '</div>' +
    '</div>' +
    '<button type="button" class="player-tab">' +
      '<span class="player-tab-glyph">&#9654;</span>' +
      '<span class="player-tab-label"></span>' +
      '<span class="cursor" aria-hidden="true">_</span>' +
    '</button>';

  var title   = el.querySelector(".player-title");
  var sub     = el.querySelector(".player-sub");
  var scrub   = el.querySelector(".player-scrub");
  var fill    = el.querySelector(".player-fill");
  var btnMini = el.querySelector(".player-mini");
  var btnTab  = el.querySelector(".player-tab");
  var btnBack = el.querySelector(".player-back");
  var btnPlay = el.querySelector(".player-play");
  var btnFwd  = el.querySelector(".player-fwd");
  var glyph   = el.querySelector(".player-glyph");
  var tabText = el.querySelector(".player-tab-label");
  var elNow   = el.querySelector(".player-now");
  var elTotal = el.querySelector(".player-total");

  document.body.appendChild(el);

  /* --- Beschriftung (Sprache der Oberfläche × Sprache der Spur) ------ */

  function relabel() {
    var s = STR[ui];
    title.textContent = s.title;
    sub.textContent = s.sub + " · " + s.lang[track];
    tabText.textContent = s.tab;
    btnMini.setAttribute("aria-label", s.mini);
    btnTab.setAttribute("aria-label", s.open);
    btnBack.setAttribute("aria-label", s.back);
    btnFwd.setAttribute("aria-label", s.fwd);
    scrub.setAttribute("aria-label", s.pos);
    btnPlay.setAttribute("aria-label", audio.paused ? s.play : s.pause);
  }

  /* --- Anzeige -------------------------------------------------------- */

  function clock(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec % 3600) / 60);
    var s = sec % 60;
    return (h ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  function total() {
    return (audio.duration && isFinite(audio.duration)) ? audio.duration : TRACKS[track].secs;
  }

  function draw() {
    var t = pos();
    var pct = Math.min(100, Math.max(0, (t / total()) * 100));
    fill.style.width = pct + "%";
    elNow.textContent = clock(t);
    elTotal.textContent = clock(total());
    scrub.setAttribute("aria-valuenow", Math.round(pct));
    scrub.setAttribute("aria-valuetext", clock(t));
  }

  /* --- Springen (auch bevor die Datei geladen ist) --------------------- */

  function seek(sec) {
    sec = Math.max(0, Math.min(sec, total() - 1));
    touched = true;
    shown = sec;
    if (!armed) {
      arm();                            /* nimmt die Stelle als Fragment mit */
    } else if (audio.readyState > 0 || !audio.paused) {
      audio.currentTime = sec;
    } else {
      audio.src = source(sec);          /* noch nichts geladen: Fragment neu */
    }
    draw();
    save();
  }

  audio.addEventListener("loadedmetadata", draw);   /* jetzt die echte Länge */

  /* --- Merken ---------------------------------------------------------- */

  var lastSave = 0;

  function save() {
    if (!touched) return;      /* wer nichts angefasst hat, hinterlässt nichts */
    set(localStorage, POS_KEY, JSON.stringify({ track: track, t: Math.floor(pos()) }));
    set(sessionStorage, RUN_KEY, armed && !audio.paused ? "1" : "");
  }

  /* --- Bedienung -------------------------------------------------------- */

  function setOpen(open) {
    el.setAttribute("data-open", String(open));
    document.body.classList.toggle("player-open", open);
    set(localStorage, UI_KEY, open ? "open" : "mini");
  }

  btnMini.addEventListener("click", function () { setOpen(false); btnTab.focus(); });
  btnTab.addEventListener("click", function () { setOpen(true); btnPlay.focus(); });

  btnPlay.addEventListener("click", function () {
    if (audio.paused) {
      arm();
      /* Nur der Druck von Hand wird gemeldet — das Weiterlaufen beim
       * Umblättern nicht, sonst zählt jede Seite als neuer Hörer. */
      ga("lesefassung_play", {
        sprache: track,
        stelle_sek: Math.floor(pos()),
        seite: page
      });
      audio.play().catch(function () {});
    } else {
      audio.pause();
    }
  });
  btnBack.addEventListener("click", function () { seek(pos() - 30); });
  btnFwd.addEventListener("click", function () { seek(pos() + 30); });

  audio.addEventListener("play", function () {
    touched = true;
    el.classList.add("is-playing");
    glyph.innerHTML = "&#10073;&#10073;";
    relabel();
    save();
  });
  audio.addEventListener("pause", function () {
    el.classList.remove("is-playing");
    glyph.innerHTML = "&#9654;";
    relabel();
    save();
  });
  audio.addEventListener("ended", function () {
    seek(0);
    set(sessionStorage, RUN_KEY, "");
  });
  audio.addEventListener("timeupdate", function () {
    shown = audio.currentTime || 0;
    draw();
    if (Math.abs(shown - lastSave) > 3) { lastSave = shown; save(); }
    count();
  });

  /* --- Gehörte Minuten ---------------------------------------------------- */
  /* Gezählt wird gehörter Ton, nicht verstrichene Zeit: aus den Sprüngen
   * der Abspielposition, kleine Schritte nur (Springen zählt nicht mit).
   * Der Stand lebt in der Sitzung weiter, damit über mehrere Seiten
   * hinweg eine Hördauer entsteht und nicht je Seite eine neue. */

  var heard = Math.max(0, Number(get(sessionStorage, HEARD_KEY)) || 0);
  var reported = Math.floor(heard / 60);
  var lastAt = null;

  function count() {
    var t = audio.currentTime || 0;
    if (lastAt !== null) {
      var d = t - lastAt;
      if (d > 0 && d < 2) heard += d;
    }
    lastAt = t;

    var minutes = Math.floor(heard / 60);
    if (minutes > reported) {
      reported = minutes;
      set(sessionStorage, HEARD_KEY, String(Math.floor(heard)));
      ga("lesefassung_minute", {
        sprache: track,
        minuten: minutes,
        stelle_sek: Math.floor(t),
        seite: page
      });
    }
  }

  audio.addEventListener("seeking", function () { lastAt = null; });
  audio.addEventListener("pause", function () {
    lastAt = null;
    set(sessionStorage, HEARD_KEY, String(Math.floor(heard)));
  });

  function keep() {
    save();
    set(sessionStorage, HEARD_KEY, String(Math.floor(heard)));
  }

  window.addEventListener("pagehide", keep);
  window.addEventListener("beforeunload", keep);

  /* Ein anderer Ton auf der Seite (Anlagen-Player) hat Vorrang. */
  document.addEventListener("play", function (e) {
    if (e.target !== audio && !audio.paused) audio.pause();
  }, true);

  /* --- Ziehen und Klicken auf dem Balken --------------------------------- */

  function fromEvent(e) {
    var box = scrub.getBoundingClientRect();
    var x = (e.touches ? e.touches[0].clientX : e.clientX) - box.left;
    return Math.max(0, Math.min(1, x / box.width)) * total();
  }

  var dragging = false;

  scrub.addEventListener("mousedown", function (e) {
    dragging = true;
    seek(fromEvent(e));
    e.preventDefault();
  });
  document.addEventListener("mousemove", function (e) {
    if (dragging) seek(fromEvent(e));
  });
  document.addEventListener("mouseup", function () { dragging = false; });

  scrub.addEventListener("touchstart", function (e) {
    seek(fromEvent(e));
  }, { passive: true });
  scrub.addEventListener("touchmove", function (e) {
    seek(fromEvent(e));
    e.preventDefault();
  });

  scrub.addEventListener("keydown", function (e) {
    var step = e.key === "PageUp" || e.key === "PageDown" ? 300 : 30;
    if (e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "PageUp") {
      seek(pos() + step);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown" || e.key === "PageDown") {
      seek(pos() - step);
    } else if (e.key === "Home") {
      seek(0);
    } else {
      return;
    }
    e.preventDefault();
  });

  /* --- Sprachwechsel ------------------------------------------------------ */
  /* Englische Seite, englische Lesefassung. Wer mitten im Hören
   * umschaltet, kommt an derselben Stelle der anderen Fassung heraus
   * (anteilig gerechnet — es ist derselbe Text) und hört weiter. */

  new MutationObserver(function () {
    var next = document.body.getAttribute("data-lang") === "en" ? "en" : "de";
    if (next === ui) return;
    ui = next;

    if (track !== ui) {
      var ran = armed && !audio.paused;
      var frac = Math.min(1, pos() / total());
      track = ui;
      shown = frac * TRACKS[track].secs;
      if (armed) {
        audio.src = source(shown);
        if (ran) audio.play().catch(function () {});
      }
      save();
      draw();
    }
    relabel();
  }).observe(document.body, { attributes: true, attributeFilter: ["data-lang"] });

  /* --- Start ------------------------------------------------------------- */

  relabel();
  draw();
  if (el.getAttribute("data-open") === "true") document.body.classList.add("player-open");

  /* Weitergeblättert, während es lief: dort weiterhören. Verweigert der
   * Browser den Ton ohne Klick, bleibt wenigstens die Stelle stehen. */
  if (get(sessionStorage, RUN_KEY) === "1") {
    touched = true;
    arm();
    audio.play().catch(function () {});
  }
})();
