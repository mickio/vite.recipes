import { router, registerRoute, SLIDELEFT, FADE } from "./router.js";
import NavbarView from './views/NavbarView.js';
import ToastView from './views/ToastView.js';
import SidebarView from './views/AsideFavoritesView.js';
import HomeView from "./views/HomeView.js";
import SearchView from "./views/SearchView.js";
import DetailView from "./views/DetailView.js";
import Error404View from "./views/Error404View.js";
import "./services/transition.js";

const createPageComponent = async (anchorId,viewCls) => {
  const pageComponent = new viewCls();
  const pageEl = await pageComponent.getView();
  document.getElementById(anchorId).append(pageEl);
}

const ondocloaded = async () => {
  // Seitenelemente einbauen
  await Promise.all([
    createPageComponent('navbar',NavbarView),
    createPageComponent('toast',ToastView),
    createPageComponent('sidebar',SidebarView)
  ]);
  
  // route!
  console.log('[app.js] DOM content loaded, call for routing');
  
  registerRoute({ path: /^\/(index.html|randomRecipe)?$/, viewCls: HomeView, enter: SLIDELEFT, leave: FADE });
  registerRoute({ path: /^\/search/, viewCls: SearchView, enter: SLIDELEFT, leave: FADE });
  registerRoute({ path: /^\/details/, viewCls: DetailView, enter: SLIDELEFT, leave: FADE });
  // Fallback-Route für 404
  registerRoute({ path: /.*/, viewCls: Error404View, enter: FADE, leave: SLIDELEFT });
  
  router.route();
};
  
document.addEventListener("DOMContentLoaded", ondocloaded, { once: true });
/*document.querySelector('main').addEventListener('scrollend',(evt) => {
  console.log(`[XXX] scrolltop of target ${evt.target.tagName} is ${evt.target.scrollTop}`)
},true)*/