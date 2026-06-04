import RecipeCache from "./services/recipeCache.js";
import RecipeProxy from "./services/recipeProxy.js";
import { router } from "./router.js";

// Global verfügbare Proxy-Instanz aufbauen
const cache = new RecipeCache();
export const proxy = new RecipeProxy("http://127.0.0.1:5000/api", cache);

document.addEventListener("DOMContentLoaded", () => {
  // 1. Router das erste Mal anwerfen
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
});
