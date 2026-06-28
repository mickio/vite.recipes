import AbstractView from "./AbstractView.js";
import recipeDetails from '../templates/recipeDetails.js';
import { proxy } from "../services/recipeProxy.js";
import { router } from '../router.js';

export default class DetailView extends AbstractView {
  async getHtml() {
    return `
    <transition-container data-params='{"enter":{"name":"slide-down"},"leave":{"name":"slide-down"}}' data-prevent-default class="navbar is-hidden">  
      <div class="navbar-left">
        <form class="nav-container">
          <input id="btn-refresh-or-back" type="submit" value="refresh">
        </form> 
      </div>
      <div class="navbar-center">
        <form id="search-form" class="search-container">
          <input id="search-input" name="q" type="search" placeholder="Rezeptname oder Zutaten" required>
          <icon class="hidden">close</icon>
          <input type="submit" value="search">
        </form>
      </div>
      <div class="navbar-right">
        <form>
          <input class="blink" type="submit" value="list_alt"/>
        </form>    
      </div>
    </transition-container>
    `
  }
  afterRender(navbar) {
    navbar.classList.remove('is-hidden');
    navbar.show();
    
    // Das Suchfeld in der Kopfzeile kontrollieren
    document.getElementById("search-form").addEventListener("submit", e => {
      e.preventDefault();
      const query = document.getElementById("search-input").value.trim();
      if (query) {
        router.navigateTo(`/search?q=${encodeURIComponent(query)}`);
      }
    });

  }
  
}