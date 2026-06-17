import HomeView from "./views/HomeView.js";
import SearchView from "./views/SearchView.js";
import DetailView from "./views/DetailView.js";

const routes = [
  {
    path:/^\/(index.html|randomRecipe)?$/,
    viewCls: HomeView,
    enter: 'slide-left',
    leave: 'fade'
  },
  {
    path:/^\/search/,
    viewCls: SearchView,
    enter: 'zoom',
    leave: 'enlarge'
  },
  {
    path:/^\/details/,
    viewCls: DetailView,
    enter: 'slide-left',
    leave: 'fade'
  }
];

class Router {
  constructor() {
    this.main = document.querySelector('main');
    this.background = () => this.main.firstElementChild;
    this.front = () => this.main.lastElementChild;
    this.currentViewInstance = null;

    // Fängt Klicks auf "data-link" Elemente ab
    document.body.addEventListener("click", e => {
      if (e.target.matches("[data-link]")) {
        e.preventDefault();
        this.navigateTo(e.target.getAttribute("href"));
      }
    });

    // Reagiert auf die Back/Forward Buttons des Browsers
    window.addEventListener("popstate", () => this.route({...history.state,$BACK:true}));
  }

  navigateTo(url) {
    // Vor dem Verlassen die aktuelle Scrollposition im History-State speichern
    if (history.state) {
      history.replaceState({ ...history.state, scrollTop: this.background().scrollTop }, "");
    }
    history.pushState({ scrollTop: 0 }, "", url);
    this.route();
    console.log('[router][navigateTo] navigate to',url)
  }

  async route(state={}) {
    const path = window.location.pathname;
    const currentRoute = routes.find((route) => path.match(route.path));
    console.log(`[router][route] current view for path ${path} is ${currentRoute?.viewCls.name}`,state);
    const ViewClass = currentRoute?.viewCls || HomeView;
    
    // Instanziiere die neue View (übergibt Suchparameter aus der URL)
    const urlParams = new URLSearchParams(window.location.search);
    const params = {...Object.fromEntries(urlParams.entries()),state};
    this.currentViewInstance = new ViewClass(params);

    // Inhalt einfügen und alten node entfernen
    const prevPage = this.background();
    const currentPage = document.createElement('div');
    currentPage.classList.add('floating');
    if (state.$BACK)
      this.main.prepend(currentPage);
    else
      this.main.append(currentPage);
    currentPage.innerHTML = await this.currentViewInstance.getHtml();
    console.log('[router][route] removing previous page',prevPage.tagName);
    const tc = prevPage.querySelector('transition-container');
    if (tc)
      tc.remove().then(() => prevPage?.remove()).then(() => console.log('[router][route] removed previous page',prevPage.tagName));
    else prevPage.remove()?.then(() => console.log('[router][route] removed previous page',prevPage.tagName));
    // Nachträgliche Logik der View (z.B. Event-Listener binden) ausführen
    if (this.currentViewInstance.afterRender) 
      this.currentViewInstance.afterRender(currentPage);
  };

}

export const router = new Router();
