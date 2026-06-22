import HomeView from "./views/HomeView.js";
import SearchView from "./views/SearchView.js";
import DetailView from "./views/DetailView.js";

const SLIDELEFT = {name: 'slide-left'};
const FADE = {name: 'fade'};
const routes = [
  {
    path:/^\/(index.html|randomRecipe)?$/,
    viewCls: HomeView,
    enter: SLIDELEFT,
    leave: FADE
  },
  {
    path:/^\/search/,
    viewCls: SearchView,
    enter: SLIDELEFT,
    leave: FADE
  },
  {
    path:/^\/details/,
    viewCls: DetailView,
    enter: SLIDELEFT,
    leave: FADE
  }
];

const setTransitionParams = (tc,key,value) => {
  const params = JSON.parse(tc.dataset.params || '{}');
  params[key] = value;
  tc.dataset.params = JSON.stringify(params);
}

const createPage = async (route) => {
  //TODO: Error404View statt HomeView
  const ViewClass = route?.viewCls || HomeView;
  const state = history.state || {};
  const urlParams = new URLSearchParams(window.location.search);
  const params = {...Object.fromEntries(urlParams.entries()),state};
  const newPage = new ViewClass(params);
  const pageHtml = await newPage.getHtml();
  const tc = document.createElement('transition-container');
  tc.classList.add('floating');
  tc.innerHTML = pageHtml;
  if (newPage.afterRender) 
    newPage.afterRender(newPage);
  return tc;
}

class Router {
  constructor() {
    this.main = document.querySelector('main');
    this.currentPage = () => this.main.firstElementChild;
    this.prevRoute = null;
    this.pageStack = JSON.parse(sessionStorage.getItem('pageStack')) || [window.location.url];
    this.saveStack();

    // Fängt Klicks auf "data-link" Elemente ab
    document.body.addEventListener("click", e => {
      if (e.target.matches("[data-link]")) {
        e.preventDefault();
        this.navigateTo(e.target.getAttribute("href"));
      }
    });

    // Reagiert auf die Back/Forward Buttons des Browsers
    window.addEventListener("popstate", (evt) => {
      const aktuelleUrl = location.pathname+location.search;
      const letzterIndex = this.pageStack.slice(0,-1).lastIndexOf(aktuelleUrl);
      // console.log(`[popstate] received at ${aktuelleUrl},p0sition is ${letzterIndex}`,this.pageStack);

      // Wenn die URL im Stack existiert UND sie nicht schon die ganz aktuelle ist
      if (letzterIndex !== -1 && letzterIndex < this.pageStack.length - 1) {
        // Der User ist zurückgegangen (entweder 1 Schritt oder mehrere via jumpBackToPattern)
        // Wir schneiden alles ab, was nach diesem Index kam
        this.pageStack = this.pageStack.slice(0, letzterIndex + 1);
        this.saveStack();
        // console.log('[popstate] kehre zurück zu',aktuelleUrl);
        if (history.state) {
          history.replaceState({ ...history.state, $BACK: true }, "");
        }
      } else {
        // Schritt nach vorne,die URL muss wieder rein
        this.pageStack.push(aktuelleUrl);
        this.saveStack();
        // console.log('[popstate] gehe vor zu',aktuelleUrl);
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
  
  navigateBackTo(pathPattern) {
    // Für den Back Button, wenn's zurück zur Einstiegs- oder Suchseite gehen soll
    for (let i = this.pageStack.length - 2; i >= 0; i--) {
      console.log(`[router][navigateBackTo] teste ${this.pageStack[i]}`);
        if (pathPattern.test(this.pageStack[i])) {

            let schritte = i - (this.pageStack.length - 1);
            
            console.log(`[router][navigateBackTo] Springe ${schritte} Schritte zurück.`);
            
            window.history.go(schritte); 
            // Seitenwechsel
            if (history.state) {
              history.replaceState({ ...history.state, $BACK: true }, "");
            }
            // this.route();
            console.log('[router][navigateBackTo] navigate to', this.pageStack[i]);
            return true
        }
    }
    console.error(`[router][navigateBackTo] keinen passenden pfad für ${pathPattern} gefunden!`)
  }

  navigateTo(url) {
    // page stack synchron mitführen
    this.pageStack.push(url);
    this.saveStack(); 

    // Vor dem Verlassen die aktuelle Scrollposition im History-State speichern
    if (history.state) {
      history.replaceState({ ...history.state, scrollTop: this.main.scrollTop }, "");
    }
    history.pushState({ scrollTop: 0 }, "", url);
    
    // Seitenwechsel
    this.route();
    console.log('[router][navigateTo] navigate to',url)
  }

  async route() {
    const path = window.location.pathname;
    const state = history.state || {};
    const newRoute = routes.find((route) => path.match(route.path));
    // console.log(`[router][route] current view for path ${path} is ${newRoute?.viewCls.name} with state`,state);

    // neue page einfügen und alte entfernen
    const prevPage = this.currentPage();
    const currentPage = await createPage(newRoute);
    
    // Falls history.back(),neue Seite vor der alten einfügen
    if (state.$BACK) {
      state.scrollTop && (this.main.scrollTop = state.scrollTop);
      setTransitionParams(prevPage,'leave',this.prevRoute?.enter || SLIDELEFT);
      setTransitionParams(currentPage,'enter', newRoute.leave);
      this.main.prepend(currentPage);
    }
    else {
      this.main.scrollTop = 0;
      setTransitionParams(prevPage,'leave',this.prevRoute?.leave || FADE);
      setTransitionParams(currentPage,'enter', newRoute.enter);
      this.main.append(currentPage);
    }
      
    // console.log('[router][route] removing previous page',prevPage.tagName);
    // Route merken für nächsten Aufruf
    this.prevRoute = newRoute;
    prevPage.remove();
  };

}

export const router = new Router();
