import AbstractView from "./AbstractView.js";
import { proxy } from "../services/recipeProxy.js";

export default class HomeView extends AbstractView {
  async getHtml() {
    let recipe;
    
    // Falls eine spezifische ID per Back-Button in der URL steht (?id=...)
    if (this.params.url) {
      recipe = proxy.cache.getRecipe(this.params.url);
    }
    
    // Fallback: Falls keines da ist, neues via API holen
    if (!recipe) {
      recipe = await proxy.getRandomRecipe();
      // URL im Browser updaten, damit dieses Rezept einen eigenen Eintrag in der History hat
      console.log('[Home view] get link from recipe',recipe.result.link);
      history.replaceState({ scrollTop: 0 }, "", `/randomRecipe?url=${recipe.result.link}`);
    }

    return `
<transition-container class="view-home" data-params='{"enter":{"name":"slide-left"},"leave":{"name":"fade"}}'>
    <div class="inspiration">
        
        <figure>
            ${recipe.result.media || ''}
            <figcaption>
    			<a href="${recipe.result.link??''}" target="_blank" rel="noopener noreferrer"><b>${new URL(recipe.result.link).host}</b></a>
    		</figcaption>
        </figure>
        
        <article class="content">
            <h1 class="title">${recipe.result?.name || 'Rezept des Tages'}</h1>
            ${ recipe.result?.content || '<p>Keine Inspiration verfügbar.</p>'}
        </article>
    </div>

</transition-container>
    `;
  }
}
