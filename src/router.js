import HomeView from "./views/HomeView.js";
import SearchView from "./views/SearchView.js";
import DetailView from "./views/DetailView.js";
import Error404View from "./views/Error404View.js"; // Neu hinzugefügt

const SLIDELEFT = { name: 'slide-left' };
const FADE = { name: 'fade' };

const routes = [
  { path: /^\/(index.html|randomRecipe)?$/, viewCls: HomeView, enter: SLIDELEFT, leave: FADE },
  { path: /^\/search/, viewCls: SearchView, enter: SLIDELEFT, leave: FADE },
  { path: /^\/details/, viewCls: DetailView, enter: SLIDELEFT, leave: FADE },
  // Fallback-Route für 404
  { path: /.*/, viewCls: Error404View, enter: FADE, leave: SLIDELEFT }
];

const setTransitionParams = (element, key, value) => {
  if (!element) // Guard-Clause
    return;  
  const params = JSON.parse(element.dataset.params || '{}');
  params[key] = value;
  element.dataset.params = JSON.stringify(params);
};

const createPage = async (route) => {
  try {
    const ViewClass = route.viewCls;
    const state = history.state || {};
    const urlParams = new URLSearchParams(window.location.search);
    const params = { ...Object.fromEntries(urlParams.entries()), state };
    
    const newPage = new ViewClass(params);
    const pageHtml = await newPage.getHtml();
    
    const tc = document.createElement('transition-container');
    tc.classList.add('floating');
    tc.innerHTML = pageHtml;
    
    if (newPage.afterRender) {
      newPage.afterRender(tc);
    }
    return tc;
  } catch (error) {
    console.error("Fehler beim Erstellen der Seite:", error);
    // Minimales Fallback-Element, damit die App nicht komplett einfriert
    const errorEl = document.createElement('div');
    errorEl.textContent = "Inhalt konnte nicht geladen werden.";
    return errorEl;
  }
};

class Router {
  constructor() {
    this.main = document.querySelector('main')
    this.currentPage = () => this.main.firstElementChild;
    this.prevRoute = null;
    // popstate verrät nicht, ob eine vorwärts- oder rückwärts-Navigation war. window.history auch nicht. Also selbst buchführen...
    this.pageStack = JSON.parse(sessionStorage.getItem('pageStack')) || [window.location.pathname+location.search];
    this.saveStack();
    
    this._initEventListeners();
  }

  _initEventListeners() {
    // umleiten href auf router
    document.body.addEventListener("click", e => {
      const link = e.target.closest("[data-link]");
      if (link) {
        e.preventDefault();
        this.navigateTo(link.getAttribute("href"));
      }
    });

    // Popstate (Zurück/Vor) abfangen
    window.addEventListener("popstate", (evt) => this._handlePopState(evt));
  }

  _handlePopState(evt) {
    const aktuelleUrl = location.pathname+location.search;
    const letzterIndex = this.pageStack.slice(0, -1).lastIndexOf(aktuelleUrl);
    console.log(`[handlePopState] aktuelle URL "${aktuelleUrl}"`,this.pageStack)
    // Wenn url im pageStack, einkürzen und state.isBack, sonst url zum pageStack und nicht state.isBack
    if (letzterIndex !== -1 && letzterIndex < this.pageStack.length - 1) { // Schritt zurück 
      this.pageStack = this.pageStack.slice(0, letzterIndex + 1);
      this._updateStateIsBack(true);
    } else { // Schritt vorwärts 
      this.pageStack.push(aktuelleUrl);
      this._updateStateIsBack(false);
    }
    
    this.saveStack();
    this.route();
  }

  _updateStateIsBack(isBack) {
    if (history.state) {
      console.log(`[popstate][updateStateIsBack] stepping back? ${isBack}`)
      history.replaceState({ ...history.state, $BACK: isBack }, "");
    }
  }

  saveStack() {
    sessionStorage.setItem('pageStack', JSON.stringify(this.pageStack));
  }

  navigateTo(url) {
    this.pageStack.push(url);
    this.saveStack(); 

    if (history.state) {
      history.replaceState({ ...history.state, scrollTop: this.currentPage().scrollTop }, "");
    }
    history.pushState({ scrollTop: 0 }, "", url);
    
    this.route();
  }

  navigateBackTo(pathPattern) {
    for (let i = this.pageStack.length - 2; i >= 0; i--) {
      if (pathPattern.test(this.pageStack[i])) {
        let schritte = i - (this.pageStack.length - 1);
        history.go(schritte); // triggert popstate
        return true;
      }
    }
    console.error(`[router] Keinen passenden Pfad für ${pathPattern} gefunden!`);
    return false;
  }

  // Hauptmethode
  async route() {
    const path = window.location.pathname;
    const newRoute = routes.find((route) => path.match(route.path)); 
    
    const prevPage = this.currentPage();
    const currentPage = await createPage(newRoute);
    
    this._animateAndRender(prevPage, currentPage, newRoute);
    
    this.prevRoute = newRoute;
  }

  // DOM-Aktualisierung und Transition-Zuweisung
  _animateAndRender(prevPage, currentPage, newRoute) {
    const state = history.state || {};

    if (state.$BACK) {
      setTransitionParams(prevPage, 'leave', this.prevRoute?.enter || SLIDELEFT);
      setTransitionParams(currentPage, 'enter', newRoute.leave);
      this.main.prepend(currentPage);
    } else {
      setTransitionParams(prevPage, 'leave', this.prevRoute?.leave || FADE);
      setTransitionParams(currentPage, 'enter', newRoute.enter);
      this.main.append(currentPage);
    }
    
    currentPage.scrollTop = state.scrollTop || 0;
    prevPage?.remove();
  }
}

export const router = new Router();
