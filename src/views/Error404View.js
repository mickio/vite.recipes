import AbstractView from "./AbstractView.js";

export default class HomeView extends AbstractView {
  async getHtml() {
    return `
      <div class="initial error">
        <h1>404</h1>
        <p style="padding:20px;">
          Die Seite gibt es leider nicht! Zurück zur <a href="/" data-link>Einstiegsseite</a>.
        </p>
      </div>
    `
  }
}