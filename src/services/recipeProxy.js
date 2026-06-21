import RecipeCache from './recipeCache.js';
const CSE_PAGINATION_START = 0;

class RecipeProxy {
  constructor(baseUrl = 'http://127.0.0.1:5000/api', cacheInstance = new RecipeCache()) {
    this.baseUrl = baseUrl;
    this.cache = cacheInstance;
    this.searchCache = {
      query: "",
      items: []
    };
  }

  // Hilfsmethode zur Validierung der Payload-Struktur
  _isValidResponse(data) {
    console.log('[recipeProxy][_isValidResponse] führe plausi check durch:',data);
    return (
      data && 
      data.result // Sicherstellen, dass es kein Array ist
    );
  }

  // 1. Endpoint: details
  async getDetails(title, url) {
    // Erst im Cache nach der URL suchen
    const cached = this.cache.getRecipe(url);
    if (cached) {
      console.log("🎯 Proxy: Match im Cache gefunden!");
      return cached;
    }

    console.log("🌐 Proxy: Rufe API ab...");
    const apiUrl = `${this.baseUrl}/details/${encodeURIComponent(title)}?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(apiUrl);
    
    // NEU: Nur fortfahren, wenn HTTP-Status OK (200-299) ist
    if (!response.ok) {
      console.warn(`⚠️ Proxy: API-Fehler (Status ${response.status})`);
      return await response.json(); // Gibt die Fehlermeldung des Servers ungecached weiter
    }

    const data = await response.json();

    // NEU: Nur cachen, wenn result existiert und ein Objekt ist
    if (this._isValidResponse(data)) {
      return this.cache.saveRecipe(data, url);
    } else {
      console.warn("⚠️ Proxy: API-Antwort hat ein ungültiges Format und wird nicht gecacht.");
      return data;
    }
  }

  // 2. Endpoint: randomRecipe
  async getRandomRecipe() {
    const response = await fetch(`${this.baseUrl}/randomRecipe`);
    
    // NEU: Nur fortfahren, wenn HTTP-Status OK ist
    if (!response.ok) {
      console.warn(`⚠️ Proxy: API-Fehler (Status ${response.status})`);
      return await response.json();
    }

    const data = await response.json();

    // NEU: Nur cachen, wenn result ein gültiges Objekt ist
    if (this._isValidResponse(data)) {
      return this.cache.saveRecipe(data);
    } else {
      console.warn("⚠️ Proxy: Random-API-Antwort hat ein ungültiges Format und wird nicht gecacht.");
      return data;
    }
  }

  // 3. Endpoint: search
  searchIterator(query, pageSize = 10) {
    const baseUrl = this.baseUrl;
    const proxy = this; // Referenz auf den Proxy
    let currentStart = CSE_PAGINATION_START;
    let currentResultLength = 100;

    // Falls eine NEUE Suche gestartet wird, den Cache zurücksetzen
    console.log(`[RecipeProxy][searchIterator] currentStart = ${currentStart}!, query is "${query}", length items is "${proxy.searchCache.items.length}`)
    if (proxy.searchCache.query !== query) {
      proxy.searchCache.query = query;
      proxy.searchCache.items = [];
      currentStart = CSE_PAGINATION_START;
    }

    return {
      async next() {
        // Fall 1: Sind wir ganz am Anfang (currentStart === CSE_PAGINATION_START) UND haben bereits Daten im Cache?
      if (currentStart === CSE_PAGINATION_START && proxy.searchCache.items.length > CSE_PAGINATION_START) {
        console.log(`🎯 Proxy: Bediene initialen Render komplett aus dem Cache (${proxy.searchCache.items.length} Treffer)`);
        
        // Wir setzen den Zeiger sofort ans Ende des bisherigen Caches
        currentStart = proxy.searchCache.items.length;
        
        // Wir geben ALLE gecachten Items auf einmal zurück!
        return {
          value: { result: proxy.searchCache.items },
          done: currentResultLength <  currentStart
        };
      }

        // Fall 2: Keine Cache-Daten da? API abfragen
        const currentEnd = currentStart + pageSize;
        const apiUrl = `${baseUrl}/search?term=${encodeURIComponent(query)}&start=${currentStart}&end=${currentEnd}`;
        
        try {
          const response = await fetch(apiUrl);
          if (!response.ok) {
            console.error(`[RecipeProxy][searchIterator.next] Server Fehler: ${await response.json()}`);
            return { value: null, done: true };
          }

          const data = await response.json();
          currentResultLength = Math.min(data.resultLength,currentResultLength);
          const hasResults = data && data.result && Array.isArray(data.result) && data.result.length > 0;

          if (!hasResults) {
            return { value: null, done: true };
          }

          // NEU: Die frisch geladenen Items in unseren Proxy-Suchcache schieben
          proxy.searchCache.items.push(...data.result);
          
          currentStart = currentEnd;

          return {
            value: data,
            done:  currentResultLength <=  currentStart
          };
        } catch (error) {
          console.error("[RecipeProxy][searchIterator.next] Fehler im Search-Iterator:", error);
          return { value: null, done: true };
        }
      }
    };
  }
}
export const proxy = new RecipeProxy("http://127.0.0.1:5000/api", new RecipeCache());