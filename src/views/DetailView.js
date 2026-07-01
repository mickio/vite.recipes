import AbstractView from "./AbstractView.js";
import recipeDetails from '../templates/recipeDetails.js';
import { proxy } from "../services/recipeProxy.js";
import { router } from '../router.js';
import FavoritesDB from '../services/recipeCache.js';

export default class DetailView extends AbstractView {
  async getHtml() {
    const title = this.params.title;
    const url = this.params.url;
    const fullRecipe = await proxy.getDetails(title, url);
    const recipe = {...this.params,...fullRecipe.result};
    return `
      <div class="recipe-details">
        ${recipeDetails(recipe,fullRecipe.isFavorite)}
      </div>
    `;
  }

  afterRender(container) {
    // Back-Button Funktionalität
    const refreshOrBack = document.getElementById("btn-refresh-or-back");
    refreshOrBack.value = 'west';
    refreshOrBack.closest('form').onsubmit = (evt) => {
      evt.preventDefault();
      router.navigateBackTo(/^\/search/);
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
        console.log('[DetailView][afterRender] toggle favorite for',btnToggleFavorite.dataset.id,isFav)
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
