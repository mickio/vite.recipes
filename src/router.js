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
    this.pageStack = JSON.parse(sessionStorage.getItem('pageStack')) || [window.location.url];

    // Fängt Klicks auf "data-link" Elemente ab
    document.body.addEventListener("click", e => {
      if (e.target.matches("[data-link]")) {
        e.preventDefault();
        this.navigateTo(e.target.getAttribute("href"));
      }
    });

    // Reagiert auf die Back/Forward Buttons des Browsers
    window.addEventListener("popstate", () => {
      const aktuelleUrl = window.location.href;
      const letzterIndex = pageStack.lastIndexOf(aktuelleUrl);

      // Wenn die URL im Stack existiert UND sie nicht schon die ganz aktuelle ist
      if (letzterIndex !== -1 && letzterIndex < pageStack.length - 1) {
        // Der User ist zurückgegangen (entweder 1 Schritt oder mehrere via jumpBackToPattern)
        // Wir schneiden alles ab, was nach diesem Index kam
        this.pageStack = this.pageStack.slice(0, letzterIndex + 1);
        this.saveStack();
        if (history.state) {
          history.replaceState({ ...history.state, $BACK: true }, "");
        }
      } else if (letzterIndex === this.pageStack.length - 1) {
        // Keine Änderung (User ist auf derselben Seite)
      } else {
        // Schritt nach vorne,die URL muss wieder rein
        this.pageStack.push(aktuelleUrl);
        this.saveStack();
        if (history.state) {
          history.replaceState({ ...history.state, $BACK: false }, "");
        }
      }
      this.route();
    })
  }
  
  saveStack() {
    // Synchronisiert die Instanzvariable mit dem Speicher
    sessionStorage.setItem('pageStack', JSON.stringify(this.pageStack));
  }
  
  navigateBack() {
    window.history.back();
    // Seitenwechsel
    if (history.state) {
      history.replaceState({ ...history.state, $BACK: true }, "");
    }
    this.route();
    console.log('[router][navigateBack] navigate to',window.location.pathname)
  }
  
  navigateBackTo(pathPattern) {
    // Für den Back Button, wenn's zurück zur Einstiegsseite gehen soll
    for (let i = this.pageStack.length - 2; i >= 0; i--) {
        if (pathPattern.test(this.pageStack[i])) {

            let schritte = i - (stack.length - 1);
            
            console.log(`[router][navigateBackTo] Springe ${schritte} Schritte zurück.`);
            
            window.history.go(schritte); 
            break;
        }
    }
    
    // Seitenwechsel
    if (history.state) {
      history.replaceState({ ...history.state, $BACK: true }, "");
    }
    this.route();
    console.log('[router][navigateBackTo] navigate to',window.location.pathname)
  }

  navigateTo(url) {
    // page stack synchron mitführen
    this.pageStack.push(url);
    this.saveStack(); 

    // Vor dem Verlassen die aktuelle Scrollposition im History-State speichern
    if (history.state) {
      history.replaceState({ ...history.state, scrollTop: this.background().scrollTop }, "");
    }
    history.pushState({ scrollTop: 0 }, "", url);
    
    // Seitenwechsel
    this.route();
    console.log('[router][navigateTo] navigate to',url)
  }

  async route() {
    const path = window.location.pathname;
    const state = history.state || {};
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
