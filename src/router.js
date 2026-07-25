import { toast } from './utils.js';

export const SLIDELEFT = { name: 'slide-left' };
export const FADE = { name: 'fade' };

const routes = [];
export function registerRoute (route) {
    routes.push(route)
}

const setTransitionParams = (element, key, value) => {
  if (!element) // Guard-Clause
    return;  
  const params = JSON.parse(element.dataset.params || '{}');
  params[key] = value;
  element.dataset.params = JSON.stringify(params);
};

const createPage = async (route) => {
  const ViewClass = route.viewCls;
  const state = history.state || {};
  const urlParams = new URLSearchParams(window.location.search);
  const params = { ...Object.fromEntries(urlParams.entries()), state };
  
  const newPage = new ViewClass(params);
  const pageView = await newPage.getView();
  
  const tc = document.createElement('transition-container');
  tc.classList.add('floating');
  tc.append(pageView)
  return tc;
};

class Router {
  constructor() {
    this.main = document.querySelector('main')
    this.currentPage = () => this.main.firstElementChild;
    this.prevRoute = null;
    // popstate verrät nicht, ob eine vorwärts- oder rückwärts-Navigation war. window.history auch nicht. Also selbst buchführen...
    this.pageStack = JSON.parse(sessionStorage.getItem('pageStack')) || [location.pathname+location.search];
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
        const cbName = link.dataset.callback;
        if (!cbName) {
            console.warn(`[router][clickOnLink] data-callback gesetzt aber keinen Namen angegeben`)
            return
        }
        const callback = callbacks[cbName];
        if (!callback) {
            console.warn(`[router][clickOnLink] kein callback mit Namen ${cbName} gefunden`);
            return 
        }
        callback(e)
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
    // im state steht entweder nix oder ein Objekt
    history.replaceState({ ...history.state, $ISBACK: isBack }, "");
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
    let currentPage = null;
    try {
      currentPage = await createPage(newRoute);
      this._animateAndRender(prevPage, currentPage, newRoute);
      this.prevRoute = newRoute;
    } catch (error) {
      console.error(`[router][route] Fehler beim Erstellen der Seite für ${newRoute.path}:`, error);
      toast("Das hätte nicht passieren dürfen...", error.message,"red");
    }
  }

  // DOM-Aktualisierung und Transition-Zuweisung
  _animateAndRender(prevPage, currentPage, newRoute) {
    const state = history.state || {};

    if (state.$ISBACK) {
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

// zum registrieren von callbacks für life cycle hooks
const callbacks = []
export function registerCallback(fun,name) {
    name = name || fun.name;
    if (!name) {
        console.warn('[router][tegisterCallback] callback hat keinen Namen. Mache nichts');
        return
    }
    if (typeof fun !== "function") {
        console.warn('[router][tegisterCallback] callback ist keine function. Mache nichts');
        return
    }
    callbacks[name] = fun;
}
