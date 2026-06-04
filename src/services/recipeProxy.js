export default class RecipeProxy {
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
    return (
      data && 
      data.details && 
      typeof data.details === 'object' && 
      !Array.isArray(data.details) // Sicherstellen, dass es kein Array ist
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

    // NEU: Nur cachen, wenn details existiert und ein Objekt ist
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

    // NEU: Nur cachen, wenn details ein gültiges Objekt ist
    if (this._isValidResponse(data)) {
      return this.cache.saveRecipe(data);
    } else {
      console.warn("⚠️ Proxy: Random-API-Antwort hat ein ungültiges Format und wird nicht gecacht.");
      return data;
    }
  }

  // 3. Endpoint: search (unverändert)
  searchIterator(query, pageSize = 10) {
    const baseUrl = this.baseUrl;
    const proxy = this; // Referenz auf den Proxy
    let currentStart = 1;

    // Falls eine NEUE Suche gestartet wird, den Cache zurücksetzen
    if (proxy.searchCache.query !== query) {
      proxy.searchCache.query = query;
      proxy.searchCache.items = [];
      currentStart = 1;
    }

    return {
      async next() {
        // Fall 1: Sind wir ganz am Anfang (currentStart === 0) UND haben bereits Daten im Cache?
      if (currentStart === 0 && proxy.searchCache.items.length > 0) {
        console.log(`🎯 Proxy: Bediene initialen Render komplett aus dem Cache (${proxy.searchCache.items.length} Treffer)`);
        
        // Wir setzen den Zeiger sofort ans Ende des bisherigen Caches
        currentStart = proxy.searchCache.items.length;
        
        // Wir geben ALLE gecachten Items auf einmal zurück!
        return {
          value: { details: { content: proxy.searchCache.items } },
          done: false
        };
      }

        // Fall 2: Keine Cache-Daten da? API abfragen
        const currentEnd = currentStart + pageSize;
        const apiUrl = `${baseUrl}/search?term=${encodeURIComponent(query)}&start=${currentStart}&end=${currentEnd}`;
        
        try {
          const response = await fetch(apiUrl);
          if (!response.ok) 
            return { value: null, done: true };

          const data = await response.json();
          const hasResults = data && data.result && Array.isArray(data.result) && data.result.length > 0;
console.log(data,hasResults)
          if (!hasResults) {
            return { value: null, done: true };
          }

          // NEU: Die frisch geladenen Items in unseren Proxy-Suchcache schieben
          proxy.searchCache.items.push(...data.result);
          
          currentStart = currentEnd;

          return {
            value: data,
            done: false
          };
        } catch (error) {
          console.error("Fehler im Search-Iterator:", error);
          return { value: null, done: true };
        }
      }
    };
  }
}
