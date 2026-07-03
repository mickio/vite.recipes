import AbstractView from "./AbstractView.js";
import { router } from '../router.js';

export default class extends AbstractView {
  async getHtml() {
    return `
    <transition-container id="nav-container" data-params='{"enter":{"name":"slide-down"},"leave":{"name":"slide-down"}}'>  
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
          <input id="btn-open-sidebar" class="blink" type="submit" value="list_alt"/>
        </form>    
      </div>
    </transition-container>
    `
  }
  afterRender(fragment) {
    const navbar = this.$('nav-container');
    // Das Suchfeld in der Kopfzeile kontrollieren
    const searchForm = this.$('search-form');
    const searchInput = this.$("search-input");
    searchForm.addEventListener("submit", e => {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        router.navigateTo(`/search?q=${encodeURIComponent(query)}`);
      }
    });
    
    // sidebar togglen
    const btnToggleSidebar = this.$('btn-open-sidebar');
    btnToggleSidebar.closest('form').onsubmit = evt => {
        evt.preventDefault();
        const sidebar = document.getElementById('sidebar-container');
        navbar.toggle(); // navbar schließen
        sidebar.toggle();
    }
    // Navbar soll verschwinden, wenn gescrollt wird und mit einer Berührung des oberen Bildschirmrands wieder erscheinen. 
    document.body.addEventListener('scroll', navbar.hide, true); 
    document.body.addEventListener('mouseleave', ({clientY}) => {
      if (clientY <= 0) navbar.show();
    });
  }
  
}