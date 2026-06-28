export default class AbstractView {
  constructor(params) { this.params = params; }
  async getHtml(params) { return ""; }
  afterRender(container) {}
  async getView() {
    const content = await this.getHtml(this.params);
    const fragment = document.createRange().createContextualFragment(content);
    this.afterRender(fragment);
    return fragment;
  }
  async appendTo(anchor) {
    const fragment = await this.getView();
    anchor.append(fragment);
  }
  async prependTo(anchor) {
    const fragment = await this.getView();
    anchor.prepend(fragment);
  }
}
