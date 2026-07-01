const VERSION = "Merkzettel version 1";

export default class RecipeCache {
  constructor(storageKey = 'recipe_cache_data') {
    this.storageKey = storageKey;
    this.importFavsFromJSON = this.importFavsFromJSON.bind(this);
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
    return Object.values(this.getAll()).filter((item) => item.isFavorite)
  }
  
  filterAllFavorites (term) {
    const filterFun = (item) => term ? JSON.stringify(item).toLowerCase().includes(term.toLowerCase()) : true;
    const favs = this.getAllFavorites();
    console.log('filter all favorites',favs)
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
  saveRecipe(recipe, customUrl = null) {
    const cache = this.getAll();

    // Falls die ID bereits existiert, überschreiben wir das bestehende Rezept
    if (recipe.id && cache[recipe.id]) {
      cache[recipe.id] = { ...cache[recipe.id], ...recipe };
      this.saveAll(cache);
      return cache[recipe.id];
    }

    // Falls keine ID vorhanden ist, generieren wir eine aus der URL
    const url = recipe.result?.link || customUrl;
    const id = recipe.result?._id || this.generateIdFromUrl(url);
    
    // ID direkt in die Payload injizieren (Top-Level und im result-Objekt)
    recipe.id = id;
    if (recipe.result) {
      recipe.result.id = id;
      recipe.result.link = url; // Sicherstellen, dass der Link im result-Objekt vorhanden ist
    }

    cache[id] = recipe;
    this.saveAll(cache);
    return recipe;
  }
  
  toggleFavorite(idOrUrl) {
    const recipe = this.getRecipe(idOrUrl);
    recipe.isFavorite = !recipe.isFavorite;
    this.saveRecipe(recipe);
    return recipe.isFavorite;
  }
  
  exportFavsAsObjectURL() {
    const data = {version: VERSION, payload: this.getAllFavorites()};
    const blob = new Blob([JSON.stringify(data,null,2)],{type: 'application/json'})
    return URL.createObjectURL(blob)
  }

  importFavsFromJSON(jsonObjectStr, overwrite = false) {
    let jsonObject = null;
    try {
      jsonObject = JSON.parse(jsonObjectStr);
    } catch (e) {
      console.error('[recipeCache][importFavsFromJSON] Leider keine JSON-Datei');
      return
    }
    if (typeof jsonObject !== 'object' || jsonObject.version !== VERSION) {
      console.error("[recipeCache][importFavsFromJSON] Ungültiges JSON-Objekt für den Import.");
      return
    }
    const pl = jsonObject.payload;
    const payload = {};
    pl.forEach(item => payload[item.id??item._id??item.link]=item); 
    if (overwrite) {
      this.saveAll(payload);
    } else {
      const current = this.getAll();
      const merged = { ...current, ...payload };
      this.saveAll(merged);
    }
  }
}
