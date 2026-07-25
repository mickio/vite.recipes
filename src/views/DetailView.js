import AbstractView from "./AbstractView.js";
import { activateVideoContainer } from './HomeView.js';
import recipeDetails from '../templates/recipeDetails.js';
import { proxy } from "../services/recipeProxy.js";
import { router } from '../router.js';
import FavoritesDB from '../services/recipeCache.js';
import { toast } from '../utils.js';

export default class DetailView extends AbstractView {
  
  async getHtml() {
    document.title = "Kochbuch | " + (this.params.title || "");
    return `
      <div class="recipe-details">
 <article>
    <figure>
        <img id="head-img" src="${this.params.thumbnail || ''}" alt="${this.params.title??'Ohne Titel'}">
        <figcaption>
			<a href="${this.params.url??''}" target="_blank" rel="noopener noreferrer"><b>${new URL(this.params.url).host}</b></a>
		</figcaption>
      	<div id="fab">
          <form>
            <input id="toggle-favorite" data-id="${this.params.id || this.params._id}" type="submit" value="favorite_outlined" >            
          </form>
        </div>
    </figure>
    <section class=${this.params.typeface}>
        <h1 class="is-smaller-mobile">${this.params.title??''}</h1>
        <div id="anchor"><p>Hole noch die Details vom Anbieter...</p></div>
    </section>
</article>  
      </div>
    `;
  }

  async afterRender(container) {
    const thumbnail = this.$('head-img');
    // Back-Button Funktionalität
    const refreshOrBack = document.getElementById("btn-refresh-or-back");
    refreshOrBack.value = 'west';
    refreshOrBack.closest('form').onsubmit = (evt) => {
      evt.preventDefault();
      router.navigateBackTo(/^\/search/) || router.navigateBackTo(/^\/random/) || router.navigateTo('/');
    };
    
    // toggle favorite
    const favDB = new FavoritesDB();
    const btnToggleFavorite = container.querySelector('#toggle-favorite');
    
    btnToggleFavorite.closest('form').onsubmit = (evt) => {
      evt.preventDefault();
      const isFav = favDB.toggleFavorite(btnToggleFavorite.dataset.id);
      btnToggleFavorite.value = isFav?'favorite':'favorite_outlined';
      const favListChanged = new CustomEvent('favlistchanged');
      document.body.dispatchEvent(favListChanged);
      // console.log('[DetailView][afterRender] toggle favorite for',btnToggleFavorite.dataset.id,isFav)
    }

    // restliche Daten holen und einfügen 
    const waitingRoomMessages = [
        "<p>Die Details lassen noch etwas auf sich warten...</p>",
        "<p>Da scheint es einen Engpass zu geben...</p>",
        "<p>Das dauert ungewöhnlich lang...</p>",
        "<p>Vielleicht ist der Anbieter gerade überlastet...</p>",
        "<p>In 10 Sekeunden breche ich ab.</p>"
    ];
    const anchor = this.$('anchor');
    const title = this.params.title;
    const url = this.params.url;
    const timeoutId = setInterval(() => {
      const nextMessage = waitingRoomMessages.shift();
      if (!nextMessage) {
        clearInterval(timeoutId);
        anchor.innerHTML = `<p>Die Details lassen sich leider nicht abrufen.</p><p>Du musst leider direkt auf die <a href="${url}"> Seite des Anbieters</a></p>`;
        return;
      }
      anchor.innerHTML = nextMessage;
      toast(nextMessage,`Du kannst auch direkt auf die <a href="${url}"> Seite des Anbieters</a> gehen.`,'orange')
    }, 10000);
    const fullRecipe = await proxy.getDetails(title, url)
    .then(json => {
      clearInterval(timeoutId);
      if ((json.status && json.status.toLowerCase() === "ok") || json.result)
          return json
      console.error(`[DetailView][afterRender] Fehler beim Erstellen der Seite für ${url}:`, json);
      toast("Der Anbieter stellt die Rezeptdaten nicht geeignet zur Verfügung.",`Du musst leider direkt auf die <a href="${url}"> Seite des Anbieters</a>`,'red')
    });

    
    if (fullRecipe) { 
      // zusätzlichen text einsetzen
      const fragment = document.createRange().createContextualFragment(recipeDetails(fullRecipe.result));
      anchor.parentNode.replaceChild(fragment,anchor);
      if (!fullRecipe.result.ingredients || !fullRecipe.result.instructions)
          toast("Der Anbieter stellt die Rezeptdaten nur unvollständig zur Verfügung.",`Du musst leider direkt auf die <a href="${url}"> Seite des Anbieters</a>`,'red')
      console.log(fullRecipe)
      
      // thumbnail ersetzen
      
      console.log('[DetailView][afterRender] thumbnail is',thumbnail,fullRecipe.result.image);
      const imgSources = fullRecipe.result.image || fullRecipe.result.images;
      
      if (typeof imgSources === "string" || (typeof imgSources === "object" && (imgSources.src ||  imgSources.srcset))) {
        const image = document.createElement('img');
        image.alt=fullRecipe.result.title??fullRecipe.result.name??'Ohne Titel'
        if (typeof imgSources === "string")
            image.src = imgSources;
        else
            Object.entries(imgSources)
              .forEach(([key, value]) => image[key] = value);
        await image.decode();
        thumbnail?.parentNode.replaceChild(image,thumbnail);
      } else if (fullRecipe.result.media) {
        const media = document.createRange().createContextualFragment(fullRecipe.result.media);
        thumbnail?.parentNode.replaceChild(media,thumbnail);
      }
      // id für ❤️ könnte falsch sein
      btnToggleFavorite.dataset.id = fullRecipe.id;
      btnToggleFavorite.value = fullRecipe.isFavorite?'favorite':'favorite_outlined';
      setTimeout(activateVideoContainer,500)
    } 
  }
}
