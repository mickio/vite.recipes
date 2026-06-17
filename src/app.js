import { router } from "./router.js";
import "./services/transition.js";

const ondocloaded = () => {
  document.removeEventListener("DOMContentLoaded",ondocloaded)
  // 1. Router das erste Mal anwerfen
  console.log('[app.js] DOM content loaded, call for routing')
  router.route();

  // 2. Zufalls-Button (Refresh) oben links fängt Klicks ab
  document.getElementById("btn-refresh").addEventListener("click", () => {
    // Erzwingt das Löschen des Parameters, um ein echtes neues Zufallsrezept zu triggern
    router.navigateTo("/");
  });

  // 3. Das Suchfeld in der Kopfzeile kontrollieren
  document.getElementById("search-form").addEventListener("submit", e => {
    e.preventDefault();
    const query = document.getElementById("search-input").value.trim();
    if (query) {
      router.navigateTo(`/search?q=${encodeURIComponent(query)}`);
    }
  });
};
document.addEventListener("DOMContentLoaded", ondocloaded, { once: true });