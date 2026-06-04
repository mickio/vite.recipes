import HomeView from "./views/HomeView.js";
import SearchView from "./views/SearchView.js";
import DetailView from "./views/DetailView.js";

const routes = {
  "/": HomeView,
  "/search": SearchView,
  "/details": DetailView
};

class Router {
  constructor() {
    this.background = document.getElementById("background");
    this.front = document.getElementById("front");
    this.currentViewInstance = null;

    // Fängt Klicks auf "data-link" Elemente ab
    document.body.addEventListener("click", e => {
      if (e.target.matches("[data-link]")) {
        e.preventDefault();
        this.navigateTo(e.target.getAttribute("href"));
      }
    });

    // Reagiert auf die Back/Forward Buttons des Browsers
    window.addEventListener("popstate", () => this.route());
  }

  navigateTo(url) {
    // Vor dem Verlassen die aktuelle Scrollposition im History-State speichern
    if (history.state) {
      history.replaceState({ ...history.state, scrollTop: this.background.scrollTop }, "");
    }
    history.pushState({ scrollTop: 0 }, "", url);
    this.route();
  }

  async route() {
    const path = window.location.pathname;
    const ViewClass = routes[path] || HomeView;
    
    // Instanziiere die neue View (übergibt Suchparameter aus der URL)
    const urlParams = new URLSearchParams(window.location.search);
    this.currentViewInstance = new ViewClass(Object.fromEntries(urlParams.entries()));

    // 1. Inhalt unsichtbar im Front-Div rendern
    this.front.innerHTML = await this.currentViewInstance.getHtml();
    
    // Nachträgliche Logik der View (z.B. Event-Listener binden) ausführen
    if (this.currentViewInstance.afterRender) {
      this.currentViewInstance.afterRender(this.front);
    }

    // 2. Schiebe-Animation starten
    this.front.classList.add("slide-in");

    const handleTransitionEnd = (event) => {
      if (event.propertyName === "transform") {
        this.front.removeEventListener("transitionend", handleTransitionEnd);

        // 3. Inhalt umhängen
        this.background.innerHTML = this.front.innerHTML;
        this.background.classList.remove("initial");

        // Event-Listener für das frisch umgehängte Background-Div reaktivieren
        if (this.currentViewInstance.afterRender) {
          this.currentViewInstance.afterRender(this.background);
        }

        // 4. Scroll-Position wiederherstellen (falls wir "zurück" gegangen sind)
        const savedScroll = history.state?.scrollTop || 0;
        this.background.scrollTop = savedScroll;

        // 5. Front-Div heimlich zurücksetzen
        this.front.style.transition = "none";
        this.front.classList.remove("slide-in");
        this.front.innerHTML = "";
        this.front.offsetHeight; // Reflow
        this.front.style.transition = "";
      }
    };

    this.front.addEventListener("transitionend", handleTransitionEnd);
  }
}

export const router = new Router();
