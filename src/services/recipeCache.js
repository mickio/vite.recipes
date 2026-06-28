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
  
  getAllFavorites () {
    return this.getAll().filter((item) => item.isFavorite)
  }
  
  filterAllFavorites (term) {
    const filterFun = (item) => JSON.stringify(term).toLowerCase().includes(term.toLowerCase());
    const favs = this.getAllFavorites();
    return favs.filter(filterFun)
  }

  saveAll(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  getRecipe(idOrUrl) {
    const cache = this.getAll();
    const id = idOrUrl.startsWith('http') ? this.generateIdFromUrl(idOrUrl) : idOrUrl;
    return cache[id] || null;
  }

  // cached Recipe, identifier ist link in
  saveRecipe(recipePayload, customUrl = null) {
    const cache = this.getAll();
    
    // Holt die URL entweder aus dem 'link'-Attribut oder dem Fallback-Parameter
    const url = recipePayload.link || recipePayload.result.link || customUrl;
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
  
  toggleFavorite(idOrUrl) {
    const recipe = this.getRecipe(idOrUrl);
    recipe.isFavorite = !recipe.isFavorite;
    this.saveRecipe(recipe);
    return recipe.isFavorite;
  }
  
  exportFavsAsObjectURL() {
    const data = {version:1, payload: this.getAllFavorites()};
    const blob = new Blob([JSON.stringify(data,null,2)],{type: 'application/json'})
    return URL.createObjectURL(blob)
  }

  importFavsFromJSON(jsonObjectStr, overwrite = true) {
    let jsonObject = null;
    try {
      jsonObject = JSON.parse(jsonObjectStr);
    } catch (e) {
      console.error('[recipeCache][importFavsFromJSON] Leider keine JSON-Datei');
      return
    }
    if (typeof jsonObject !== 'object' || jsonObject.version !== 1) {
      console.error("[recipeCache][importFavsFromJSON] Ungültiges JSON-Objekt für den Import.");
      return
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
