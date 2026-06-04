import AbstractView from "./AbstractView.js";
import { proxy } from "../app.js";
import { router } from "../router.js";
import { recipeTeaser } from '../templates/recipeTeaser.js';
import { getRandomColor, getRandomTypeface } from '../DetailView.js';

export default class SearchView extends AbstractView {
  constructor(params) {
    super(params);
    this.iterator = null;
    this.isLoading = false; // Verhindert doppelte Aufrufe, falls der User sehr schnell scrollt
  }

  async getHtml() {
    const query = this.params.q || "";
    
    // Iterator initialisieren (10er-Schritte sind Standard)
    this.iterator = proxy.searchIterator(query, 10);
    
    // Die ersten 10 Treffer für den initialen Render holen
    const result = await this.iterator.next();
    let listItems = "";

    if (result.value && result.value.result && Array.isArray(result.value.result)) {
      this.searchResult = result.value.result;
      listItems = this._generateResultsListHtml(this.searchResult);
    } else {
      listItems = "<p class='no-results'>Keine Ergebnisse gefunden.</p>";
    }

    return `
      <div class="view-search">
        <button class="back-btn" id="search-back">⬅ Zurück zum Zufallsrezept</button>
        <h3>Suchergebnisse für "${query}"</h3>
        
        <div class="results-list">${listItems}</div>
        
        <div id="infinite-scroll-trigger"></div>
        
        <div id="search-loading" class="hidden">Rezepte werden geladen...</div>
      </div>
    `;
  }

  // Hilfsmethode: Erzeugt die HTML-Strings für die Rezeptlinks
  _generateResultsListHtml(items) {
    return items.map((recipeData, index) => {
      const service = new URL(recipeData.link).host;
      recipeData.typeface || (recipeData.typeface = getRandomTypeface(recipeData
    .title));
      recipeData.color || (recipeData.color = getRandomColor());
      return recipeteaser(item, index).join("")
    });
  }

  // Wird aufgerufen, sobald das HTML im sichtbaren Container (#background) liegt
  afterRender(container) {
    // 1. Back-Button Funktionalität
    const backBtn = container.querySelector("#search-back");
    if (backBtn) {
      backBtn.addEventListener("click", () => router.navigateTo("/"));
    }

    // 2. Endless Scrolling einrichten
    const trigger = container.querySelector("#infinite-scroll-trigger");
    const resultsList = container.querySelector(".results-list");
    const loadingIndicator = container.querySelector("#search-loading");

    if (!trigger || !this.iterator) return;

    // Erstellt den Observer
    const observer = new IntersectionObserver(async observedEntries => {
      const lastElement = observedEntries[0];
      if (lastElement.isIntersecting && !this.isLoading) {
          this.isLoading = true;
          loadingIndicator.classList.remove("hidden"); // Lade-Text anzeigen
          // die nächsten 10 Treffer holen
          const nextResult = await this.iterator.next();
    
          if (nextResult.done) {
            // Keine weiteren Treffer mehr vorhanden -> Observer abschalten
            observer.unobserve(trigger);
            loadingIndicator.innerText = "Keine weiteren Rezepte vorhanden.";
          } else if (nextResult.value && nextResult.value.result && Array.isArray(nextResult.value.result)) {
            // Neue Treffer generieren und ans Ende der Liste anhängen (insertAdjacentHTML)
            const newHtml = this._generateResultsListHtml(nextResult.value.result);
            resultsList.insertAdjacentHTML("beforeend", newHtml);
            loadingIndicator.classList.add("hidden");  
          }
      }
    }, {
      root: document.getElementById("background"), // Das umschließende Scroll-Fenster der SPA
      rootMargin: "10px", // Schon 100px bevor der User ganz unten ankommt, wird nachgeladen (flüssigeres Erlebnis!)
      threshold: 0
    });

    // Wächter aktivieren
    observer.observe(trigger);
        
    this.isLoading = false;
  }
}