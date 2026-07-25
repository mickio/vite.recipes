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
          <icon id="delete-searchterm" class="hidden">close</icon>
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
    
    // Suchfeld
    const searchForm = this.$('search-form');
    const searchInput = this.$("search-input");
    searchForm.addEventListener("submit", e => {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        router.navigateTo(`/search?q=${encodeURIComponent(query)}`);
      }
    });

    // Löschen des Suchfeldinhalts
    const deleteSearchTermBtn = this.$('delete-searchterm');
    deleteSearchTermBtn.addEventListener('click', () => {
      searchInput.value = '';
      deleteSearchTermBtn.classList.add('hidden');
    });
    searchInput.addEventListener('input', () => {
      if (searchInput.value.trim() === '') {
        deleteSearchTermBtn.classList.add('hidden');
      } else {
        deleteSearchTermBtn.classList.remove('hidden');
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
    // Navbar soll verschwinden, wenn gescrollt wird und mit einer Berührung des oberen Bildschirmrands wieder erscheinen - aber nur, wenn sidebar geschlossen ist. 
    let isScrolling = null;
    const setIsScrolling = ({target}) => {
      if(!isScrolling)
        isScrolling = [new Date(),target.scrollTop];
    };
    const toggleNavbar = ({target}) => {
      const sidebar = document.getElementById('sidebar-container');
      if (sidebar.isHidden && !navbar.isHidden && isScrolling && (new Date() - isScrolling[0]) > 500) 
          target.scrollTop - isScrolling[1] > 0 && navbar.hide();
      else if (sidebar.isHidden && navbar.isHidden && isScrolling && (new Date() - isScrolling[0]) > 500)
          target.scrollTop - isScrolling[1] < 0 && navbar.show();  
      isScrolling = null;
    };
    document.body.addEventListener('scroll', setIsScrolling, true);
    document.body.addEventListener('scrollend', toggleNavbar, true);
    document.body.addEventListener('pointermove', ({clientY}) => {
      const sidebar = document.getElementById('sidebar-container');
      if (sidebar.isHidden && navbar.isHidden && clientY <= 60) navbar.show();
    });
  }
  
}