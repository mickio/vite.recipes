import AbstractView from "./AbstractView.js";
import recipeDetails from '../templates/recipeDetails.js';
import { proxy } from "../services/recipeProxy.js";
import { router } from '../router.js';

export default class DetailView extends AbstractView {
  async getHtml() {
    const title = this.params.title;
    const url = this.params.url;
    const fullRecipe = await proxy.getDetails(title, url);
    const recipe = {...this.params,...fullRecipe.result};
    console.log('DetailView gets:',recipe,this.params);
    return `
      <div class="recipe-details">
        ${recipeDetails(recipe)}
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
  }
}
const colors = ['purple','orange','green','yellow','silver-blue','brick-red'];
const typefacesLarge = ['corben-nobile','droid','arvo-pt-sans','alerta-crimson','ubuntu-vollkorn','molengo-lekton','lobster-cabin'];
const typefacesSmall = ['allan-cardo','dancing-script-josefin','raleway-goudy-bookletter']

export function getRandomColor() {
    const index = Math.round(Math.random()*5);
    return colors[index]
}

export function getRandomTypeface(title) {
    let index;
    if (title.length > 30) {
        index = Math.round(Math.random()*2)
        return typefacesSmall[index]
    } else {
        index = Math.round(Math.random()*6)
        return typefacesLarge[index]
      }
}
