import AbstractView from "./AbstractView";
import { router } from "../router";

export default class ToastView extends AbstractView {
  constructor() {
    super();
  }

  async getHtml() {
    return `
<transition-container id="msg-container" data-params='{"enter":{"name":"slide-right","duration":".3s"},"leave":{"name":"fade","duration":"2s"}}' data-prevent-default>
    <div class="overlay">
        <div class="message">
            <h1>Toast</h1>
            <p>Dies ist die Toast-Seite.</p>
        </div>
    </div>
</transition-container>
    `;
  }

  afterRender(container) {
    const msgContainer = this.$("msg-container");
    const msgBox = msgContainer.querySelector(".message");
    document.body.addEventListener("toast", ({ detail }) => {
      const { color, title, text } = detail;
      // msgBox.classList.add(className);
      msgBox.style.setProperty("--message-color",color)
      msgBox.innerHTML = `<h1>${title}</h1><p>${text}</p>`;
      msgContainer.show();
      setTimeout( msgContainer.hide , 3000);
    });
  }
}