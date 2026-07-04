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
    await this.afterRender(fragment);
    return fragment;
  }
  $ (id) {
    if (this.view)
      return this.view.getElementById(id);
    // fallback document
    return document.getElementById(id);
  }
}

const viewClasses = {};

export const registerViewClass = (name,cls) => viewClasses[name] = cls;

export const getViewClass = (name) => name in viewClasses ? viewClasses[name] : null