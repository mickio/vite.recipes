import AbstractView from "./AbstractView.js";
import { proxy } from "../app.js";

export default class HomeView extends AbstractView {
  async getHtml() {
    let recipe;
    
    // Falls eine spezifische ID per Back-Button in der URL steht (?id=...)
    if (this.params.id) {
      recipe = proxy.cache.getRecipe(this.params.id);
    }
    
    // Fallback: Falls keines da ist, neues via API holen
    if (!recipe) {
      recipe = await proxy.getRandomRecipe();
      // URL im Browser updaten, damit dieses Rezept einen eigenen Eintrag in der History hat
      history.replaceState({ scrollTop: 0 }, "", `/?id=${recipe.id}`);
    }

    return `
      <div class="view-home">
        <span class="badge">Zufallsrezept</span>
        <h2>${recipe.result.title || 'Rezept des Tages'}</h2>
        <div>${recipe.result.content}</div>
      </div>
    `;
  }
}
