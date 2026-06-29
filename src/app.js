import { router } from "./router.js";
import NavbarView from './views/NavbarView.js';
import "./services/transition.js";

const createPageComponent = async (anchorId,viewCls) => {
  const pageComponent = new viewCls();
  const pageEl = await pageComponent.getView();
  document.getElementById(anchorId).append(pageEl);
}

const ondocloaded = async () => {
  // Seitenelemente einbauen
  createPageComponent('navbar',NavbarView);
  
  // route!
  console.log('[app.js] DOM content loaded, call for routing');
  router.route();
};
  
document.addEventListener("DOMContentLoaded", ondocloaded, { once: true });
/*document.querySelector('main').addEventListener('scrollend',(evt) => {
  console.log(`[XXX] scrolltop of target ${evt.target.tagName} is ${evt.target.scrollTop}`)
},true)*/