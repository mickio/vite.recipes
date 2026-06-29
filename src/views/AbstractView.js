export default class AbstractView {
  constructor(params) { 
    this.params = params;
    this.view = null;
  }
  async getHtml(params) { return ""; }
  afterRender(container) {}
  async getView() {
    if (this.view)
      return this.view;
    const content = await this.getHtml(this.params);
    const fragment = document.createRange().createContextualFragment(content);
    this.view = fragment;
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
  $ (id) {
    if (this.view)
      return this.view.getElementById(id);
    // fallback document
    return document.getElementById(id);
  }
}
