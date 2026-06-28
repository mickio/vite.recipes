import { router } from "./router.js";
import NavbarView from './views/NavbarView.js';
import "./services/transition.js";

const createPageComponent = async (name,viewCls) => {
  const pageComponent = new viewCls();
  document.querySelector(`body > ${name}`).innerHTML = await pageComponent.getHtml();
  const tc = document.querySelector('nav > transition-container');
  pageComponent.afterRender(tc);
}

const ondocloaded = async () => {
  // Seitenelemente einbauen
  createPageComponent('nav',NavbarView);
  
  // route!
  console.log('[app.js] DOM content loaded, call for routing');
  router.route();
};
  
document.addEventListener("DOMContentLoaded", ondocloaded, { once: true });
/*document.querySelector('main').addEventListener('scrollend',(evt) => {
  console.log(`[XXX] scrolltop of target ${evt.target.tagName} is ${evt.target.scrollTop}`)
},true)*/