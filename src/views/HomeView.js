import AbstractView from "./AbstractView.js";
import { proxy } from "../services/recipeProxy.js";
import FavoritesDB from '../services/recipeCache.js';
import { router } from '../router.js';

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
      router.pageStack[router.pageStack.length-1] = `/randomRecipe?url=${recipe.result.link}`;
      router.saveStack();
    }

    return `
    <div class="inspiration">    
      <figure>
        ${recipe.result.media || ''}
        <figcaption>
          <a href="${recipe.result.link??''}" target="_blank" rel="noopener noreferrer"><b>${new URL(recipe.result.link).host}</b></a>
        </figcaption>
        <div id="fab">
          <form>
            <input id="toggle-favorite" data-id="${recipe.id}" type="submit" value="${recipe.isFavorite?'favorite':'favorite_outlined'}">            
          </form>
        </div>        
      </figure>
        
      <article class="text-content">
          <h1 class="title">${recipe.result?.name || 'Rezept des Tages'}</h1>
          <div class="content">
            ${ recipe.result?.content || '<p>Keine Inspiration verfügbar.</p>'}
          </div>
      </article>
    </div>
    `;
  }
  afterRender(container) {
    // console.log('[HomeView][afterRender] container is',container);
    const favDB = new FavoritesDB();
    const refreshOrBack = document.getElementById("btn-refresh-or-back");
    const btnToggleFavorite = container.querySelector('#toggle-favorite');
    // Den linken nav button mit refresh verknüpfen
    refreshOrBack && (refreshOrBack.value = 'refresh');
    refreshOrBack && (refreshOrBack.closest('form').onsubmit = (evt) => {
        evt.preventDefault();
        router.navigateTo("/");
    });
    
    // toggle favorite
    btnToggleFavorite.closest('form').onsubmit = (evt) => {
        evt.preventDefault();
        const isFav = favDB.toggleFavorite(btnToggleFavorite.dataset.id);
        btnToggleFavorite.value = isFav?'favorite':'favorite_outlined';
        const favListChanged = new CustomEvent('favlistchanged');
        document.body.dispatchEvent(favListChanged);
    }
  }
}
