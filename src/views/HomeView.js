import AbstractView from "./AbstractView.js";
import { proxy } from "../services/recipeProxy.js";
import FavoritesDB from '../services/recipeCache.js';
import { router } from '../router.js';
import { getRandomTypeface } from '../utils.js';

export default class HomeView extends AbstractView {
  async getHtml() {
    let recipe;
    
    // Falls eine spezifische ID per Back-Button in der URL steht (?id=...)
    if (this.params.url) {
      recipe = proxy.cache.getRecipe(this.params.url);
      recipe.result.typeface || (recipe.result.typeface = getRandomTypeface(recipe.result.name || recipe.result.title));
    }
    
    // Fallback: Falls keines da ist, neues via API holen
    if (!recipe) {
      recipe = await proxy.getRandomRecipe();
      // URL im Browser updaten, damit dieses Rezept einen eigenen Eintrag in der History hat
      // console.log('[Home view] get link from recipe',recipe.result.link);
      history.replaceState({ scrollTop: 0 }, "", `/randomRecipe?url=${recipe.result.link}`);
      router.pageStack[router.pageStack.length-1] = `/randomRecipe?url=${recipe.result.link}`;
      router.saveStack();
      recipe.result.typeface || (recipe.result.typeface = getRandomTypeface(recipe.result.name || recipe.result.title));
    }
    document.title = "Kochbuch | " + (recipe.result.name || recipe.result.title || "");

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
        
      <article class="text-content ${recipe.result?.typeface}" >
          <h1 class="title">${recipe.result?.title || recipe.result.name}</h1>
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
        const div = document.createElement('div');
        div.classList.add('modal');
        btnToggleFavorite.closest('.floating').append(div);
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
    
    // video aktivieren 
    setTimeout(activateVideoContainer, 500);
  }
}

export function activateVideoContainer () {
    const vdoContainer = document.querySelector('div.video-format');
    if (!vdoContainer)
        return; // nix mehr zu tun 
    // binde play an yt...
    const ytContainer = vdoContainer.querySelector('iframe');
    // erst noch origin setzen
    if (ytContainer) {
        const vurl = new URL(ytContainer.src);
        vurl.searchParams.set('origin',location.origin);
        ytContainer.src = vurl.href;
    }
    const ytOverlay = vdoContainer.querySelector('.video-overlay');
    const playButton = vdoContainer.querySelector('.video-play-button');
    function playVideo (evt) {
        evt.preventDefault();
        ytOverlay && ytOverlay.remove();
        ytContainer && ytContainer.contentWindow.postMessage(JSON.stringify({
              event: 'command',
              func: 'playVideo',
              args: []
        }),'https://www.youtube-nocookie.com')
    }
    
    playButton && (playButton.onclick = playVideo);
}