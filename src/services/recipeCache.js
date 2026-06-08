export default class RecipeCache {
  constructor(storageKey = 'recipe_cache_data') {
    this.storageKey = storageKey;
  }

  // Hilfsmethode: Generiert eine ID aus einer URL
  generateIdFromUrl(url) {
    if (!url) return 'rand_' + Math.random().toString(36).substr(2, 9);
    // Erzeugt einen einfachen, sicheren Base64-String aus der URL
    return btoa(unescape(encodeURIComponent(url)))
      .replace(/=/g, '')
      .substr(-12); // Die letzten 12 Zeichen reichen
  }

  getAll() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : {};
  }

  saveAll(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  getRecipe(idOrUrl) {
    const cache = this.getAll();
    const id = idOrUrl.startsWith('http') ? this.generateIdFromUrl(idOrUrl) : idOrUrl;
    return cache[id] || null;
  }

  // KORREKTUR: Nutzt jetzt primär recipePayload.link
  saveRecipe(recipePayload, customUrl = null) {
    const cache = this.getAll();
    
    // Holt die URL entweder aus dem 'link'-Attribut oder dem Fallback-Parameter
    const url = recipePayload.link || customUrl;
    const id = this.generateIdFromUrl(url);

    // ID direkt in die Payload injizieren (Top-Level und im result-Objekt)
    recipePayload.id = id;
    if (recipePayload.result) {
      recipePayload.result.id = id;
    }

    cache[id] = recipePayload;
    this.saveAll(cache);
    return recipePayload;
  }

  exportCacheAsJSON() {
    return JSON.stringify(this.getAll(), null, 2);
  }

  importCacheFromJSON(jsonObject, overwrite = true) {
    if (typeof jsonObject !== 'object' || jsonObject === null) {
      throw new Error("Ungültiges JSON-Objekt für den Import.");
    }
    if (overwrite) {
      this.saveAll(jsonObject);
    } else {
      const current = this.getAll();
      const merged = { ...current, ...jsonObject };
      this.saveAll(merged);
    }
  }
}
