export default class AbstractView {
  constructor(params) { this.params = params; }
  async getHtml() { return ""; }
  afterRender(container) {} // Optionale Methode für Klick-Events innerhalb der View
}
