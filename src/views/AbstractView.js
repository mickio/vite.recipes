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
  $ (id) {
    if (this.view && this.view.childElementCount > 0)
      return this.view.getElementById(id);
    // wenn es nicht mehr im fragment ist, muss es im DOM sein
    return document.getElementById(id);
  }
}

const viewClasses = {};

export const registerViewClass = (name,cls) => viewClasses[name] = cls;

export const getViewClass = (name) => name in viewClasses ? viewClasses[name] : null