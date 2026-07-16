/* untitled.movie — Sprachumschaltung DE/EN
 * Reihenfolge: gespeicherte Wahl > Browsersprache > Deutsch.
 */
(function () {
  var KEY = "untitled-movie-lang";

  function setLang(lang) {
    if (lang !== "de" && lang !== "en") lang = "de";
    document.body.setAttribute("data-lang", lang);
    document.documentElement.setAttribute("lang", lang);
    document.querySelectorAll(".lang-switch button").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.dataset.setLang === lang));
    });
    try {
      localStorage.setItem(KEY, lang);
    } catch (e) {
      /* z. B. Safari im privaten Modus — dann eben ohne Speichern */
    }
  }

  var stored = null;
  try {
    stored = localStorage.getItem(KEY);
  } catch (e) {}

  if (stored === "de" || stored === "en") {
    setLang(stored);
  } else if (!(navigator.language || "").toLowerCase().startsWith("de")) {
    setLang("en");
  }

  document.querySelectorAll(".lang-switch button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setLang(btn.dataset.setLang);
    });
  });
})();
