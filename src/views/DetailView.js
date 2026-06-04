import AbstractView from "./AbstractView.js";
import { proxy } from "../app.js";

export default class DetailView extends AbstractView {
  async getHtml() {
    const title = this.params.title;
    const url = this.params.url;
    const recipe = await proxy.getDetails(title, url);

    return `
      <div class="view-detail">
        <button class="back-btn" id="detail-back">⬅ Zurück zur Suche</button>
        <h2>${recipe.details.title}</h2>
        <div>${recipe.details.content}</div>
      </div>
    `;
  }

  afterRender(container) {
    const backBtn = container.querySelector("#detail-back");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        // Nutzt den echten Browser-Verlauf, um die Suchergebnisse + Scroll-Stand zu reaktivieren
        history.back();
      });
    }
  }
}
const colors = ['purple','orange','green','yellow','silver-blue','brick-red'];
const typefacesLarge = ['corben-nobile','droid','arvo-pt-sans','alerta-crimson','ubuntu-vollkorn','molengo-lekton','lobster-cabin'];
const typefacesSmall = ['allan-cardo','dancing-script-josefin','raleway-goudy-bookletter']

export function getRandomColor() {
    const index = Math.round(Math.random()*5);
    return colors[index]
}

export function getRandomTypeface(title) {
    let index;
    if (title.length > 30) {
        index = Math.round(Math.random()*2)
        return typefacesSmall[index]
    } else {
        index = Math.round(Math.random()*6)
        return typefacesLarge[index]
      }
}
