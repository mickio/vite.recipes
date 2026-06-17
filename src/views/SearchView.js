import AbstractView from "./AbstractView.js";
import { proxy } from "../services/recipeProxy.js";
import { router } from "../router.js";
import recipeTeaser from '../templates/recipeTeaser.js';
import { getRandomColor, getRandomTypeface } from './DetailView.js';

export default class SearchView extends AbstractView {
  constructor(params) {
    super(params);
    this.iterator = null;
    this.isLoading = true; // Verhindert doppelte Aufrufe, falls der User sehr schnell scrollt
  }

  async getHtml() {
    const query = this.params.q || "";
    console.log('[SearchView][getHtml] query is:',query)
    
    // Iterator initialisieren (10er-Schritte sind Standard)
    this.iterator = proxy.searchIterator(query);
    
    // Die ersten 10 Treffer für den initialen Render holen
    const result = await this.iterator.next();
    console.log('[SearchView][getHtml] searchResult',result)
    let listItems = "";

    if (result.value && result.value.result && Array.isArray(result.value.result)) {
      this.searchResult = result.value.result;
      listItems = this._generateResultsListHtml(this.searchResult);
    } else {
      listItems = "<p class='no-results'>Keine Ergebnisse gefunden.</p>";
    }

    return `
      <transition-container data-params={"enter":{"name":"slide-right"},"leave":{"name":"slide-left"}} class="view-search">
        <button class="back-btn" id="search-back">⬅ Zurück zum Zufallsrezept</button>
        <h3>Suchergebnisse für "${query}"</h3>
        
        <div class="gallery">${listItems}</div>
        
        <div id="infinite-scroll-trigger"></div>
        
        <div id="search-loading" class="hidden">Rezepte werden geladen...</div>
      </transition-container>
    `;
  }

  // Hilfsmethode: Erzeugt die HTML-Strings für die Rezeptlinks
  _generateResultsListHtml(items) {
    return items.map((recipeData, index) => {
      // const recipeHost = new URL(recipeData.link).host;
      recipeData.typeface || (recipeData.typeface = getRandomTypeface(recipeData
    .title));
      recipeData.color || (recipeData.color = getRandomColor());
      recipeData.image && (recipeData.teaserImage = recipeData.image);
      return `
      <div class="gallery-item">${recipeTeaser(recipeData, index)}</div>`
    }).join("");
  }

  // Wird aufgerufen, sobald das HTML im sichtbaren Container (#background) liegt
  afterRender(container) {
    // 0. inits
    this.isLoading = false; // damit IntersectionObserver agieren kann
    // 1. Back-Button Funktionalität
    const backBtn = container.querySelector("#search-back");
    if (backBtn) {
      backBtn.addEventListener("click", () => router.navigateTo("/"));
    }
    
    /*/ 2. Bilder zeigen
    let images = document.querySelectorAll('img');
    Array.from(images).forEach((img) => img.decode()
      .then ((_) => img.closest('transition-container').show())
      .catch ((e) => console.error(`[SearchView][afterRender] Da hat was mit dem img ${img.src} nicht geklappt`,e.message)))*/

    // 3. Endless Scrolling einrichten
    const trigger = container.querySelector("#infinite-scroll-trigger");
    const resultsList = container.querySelector(".gallery");
    const loadingIndicator = container.querySelector("#search-loading");

    if (!trigger || !this.iterator) 
      return;

    // Erstellt den Observer
    const observer = new IntersectionObserver(async observedEntries => {
      const lastElement = observedEntries[0];
      console.log('[observerCallback] has been called and isLoading',this.isLoading);
      if (lastElement.isIntersecting && !this.isLoading) {
          this.isLoading = true;
          console.log('[observerCallback] lade weitere');
          loadingIndicator.classList.remove("hidden"); // Lade-Text anzeigen
          // die nächsten 10 Treffer holen
          const nextResult = await this.iterator.next();
          
          /*/ Die Bilder nicht vergessen
          images = document.querySelectorAll('img');
          Array.from(images).forEach((img) => img.decode()
            .then ((_) => {
                const cont = img.closest('transition-container');
                cont.isStart && cont.show()
            })
            .catch ((e) => console.error(`[SearchView][afterRender] Da hat was mit dem img ${img.src} nicht geklappt`,e.message))
          )*/
    
          if (nextResult.done) {
            // Keine weiteren Treffer mehr vorhanden -> Observer abschalten
            observer.unobserve(trigger);
            loadingIndicator.innerText = "Keine weiteren Rezepte vorhanden.";
          } else if (nextResult.value && nextResult.value.result && Array.isArray(nextResult.value.result)) {
            // Neue Treffer generieren und ans Ende der Liste anhängen (insertAdjacentHTML)
            const newHtml = this._generateResultsListHtml(nextResult.value.result);
            resultsList.insertAdjacentHTML("beforeend", newHtml);
            loadingIndicator.classList.add("hidden");
            this.isLoading = false;
          }
      }
    }, {
      root: document.body,
      rootMargin: "10px",
      threshold: 0
    });

    // Wächter aktivieren
    observer.observe(trigger);
  }
}