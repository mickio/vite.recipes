import AbstractView from "./AbstractView.js";
import recipeDetails from '../templates/recipeDetails.js';
import { proxy } from "../services/recipeProxy.js";
import { router } from '../router.js';
import FavoritesDB from '../services/recipeCache.js';
import { toast } from '../utils.js';

export default class DetailView extends AbstractView {
  async getHtml() {
    const recipe = this.params;
    return `
      <div class="recipe-details">
 <article>
    <figure>
        <img id="head-img" src="${recipe.thumbnail || ''}" alt=${recipe.title??'Ohne Titel'}>
        <figcaption>
			<a href="${recipe.url??''}" target="_blank" rel="noopener noreferrer"><b>${new URL(recipe.url).host}</b></a>
		</figcaption>
      	<div id="fab">
          <form>
            <input id="toggle-favorite" data-id="${recipe.id || recipe._id}" type="submit" value="favorite_outlined" >            
          </form>
        </div>
    </figure>
    <section class=${recipe.typeface}>
        <h1 class="is-smaller-mobile">${recipe.title??''}</h1>
        <div id="anchor"></div>
    </section>
</article>  
      </div>
    `;
  }

  async afterRender(container) {
    // Back-Button Funktionalität
    const refreshOrBack = document.getElementById("btn-refresh-or-back");
    refreshOrBack.value = 'west';
    refreshOrBack.closest('form').onsubmit = (evt) => {
      evt.preventDefault();
      router.navigateBackTo(/^\/search/) || router.navigateBackTo(/^\/random/) || navigateTo('/');
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
    const anchor = this.$('anchor');
    const title = this.params.title;
    const url = this.params.url;
    const fullRecipe = await proxy.getDetails(title, url)
    .then(json => {
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
        const thumbnail = this.$('head-img');
        const image = document.createElement('img');
        if (fullRecipe.result.image) {
            image.alt=fullRecipe.result.title??fullRecipe.result.name??'Ohne Titel';
            Object.entries(fullRecipe.result.image)
            .forEach(([key, value]) => image[key] = value);
            await image.decode();
            thumbnail.parentNode.replaceChild(image,thumbnail);
        }
        // id für ❤️ könnte falsch sein
        btnToggleFavorite.dataset.id = fullRecipe.id;
        btnToggleFavorite.value = fullRecipe.isFavorite?'favorite':'favorite_outlined';
    }
    
  }
}
const colors = ['purple','orange','green','yellow','silver-blue','brick-red'];
const typefacesLarge = ['corben-nobile','droid','arvo-pt-sans','alerta-crimson','ubuntu-vollkorn','molengo-lekton','lobster-cabin'];
const typefacesSmall = ['allan-cardo','dancing-script-josefin','raleway-goudy-bookletter']

function colorDice() {
  let lastColorInd = 0, colorInd = 0;
  return function (param) {
    while (lastColorInd === colorInd) {
      colorInd = Math.round(Math.random()*5);
    }
    lastColorInd = colorInd;
    return colors[colorInd] 
  }
}

export const getRandomColor = colorDice ()

function typefaceDice () {
  let lastIndex=0,index=0;
  return function (title) {
    if (title.length > 30) {
      while (lastIndex === index)
        index = Math.round(Math.random()*2)
      lastIndex = index
      return typefacesSmall[index]
    } else {
      while (lastIndex === index)
        index = Math.round(Math.random()*6)
      lastIndex = index
      return typefacesLarge[index]
    }
  }
}

export const getRandomTypeface = typefaceDice ()
