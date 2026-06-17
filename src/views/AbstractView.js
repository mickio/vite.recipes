export default class AbstractView {
  constructor(params) { this.params = params; }
  async getHtml(params) { return ""; }
  afterRender(container) {} // Optionale Methode für Klick-Events innerhalb der View
  async appendTo(anchor) {
    const content = await this.getHtml(params);
    anchor.insertAdjacentHTML('beforeend',content);
  }
  async prependTo(anchor) {
    const content = await this.getHtml(params);
    anchor.insertAdjacentHTML('afterbegin',content);
  }
}
