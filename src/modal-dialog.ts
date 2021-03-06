import defaultTemplate from "./template/defaultTemplate.html";

interface IConfig {
  baseUrl?: string;
  version?: string;
  name: string;
  component: string;
}

interface IEventDetails {
  type: "connected" | "disconnected" | "data-loaded";
  config?: IConfig;
  data?: unknown;
}

(function () {
  class ModalDialog extends HTMLElement {
    config: IConfig;
    #wasFocused: HTMLElement;

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.close = this.close.bind(this);
    }

    get open() {
      return this.hasAttribute("open");
    }

    set open(isOpen) {
      const { shadowRoot } = this;
      shadowRoot.querySelector(".wrapper").classList.toggle("open", isOpen);
      shadowRoot
        .querySelector(".wrapper")
        .setAttribute("aria-hidden", (!isOpen).toString());

      if (isOpen) {
        // save a reference to the previously-focused element
        this.#wasFocused = document.activeElement as HTMLElement;
        this.setAttribute("open", "");
        document.addEventListener("keydown", this.#watchEscape);
        this.focus();
        shadowRoot.querySelector("button").focus();
      } else {
        // check to make sure the this.#wasFocused property is defined and has a focus method
        // and call that to return the user’s focus back to the regular DOM
        this.#wasFocused && this.#wasFocused.focus && this.#wasFocused.focus();
        this.removeAttribute("open");
        document.removeEventListener("keydown", this.#watchEscape);
        this.close();
      }
    }

    get template() {
      return this.getAttribute("template");
    }

    set template(template) {
      if (template) {
        this.setAttribute("template", template);
      } else {
        this.removeAttribute("template");
      }
      this.render();
    }

    static get observedAttributes() {
      return ["open", "template"];
    }

    attributeChangedCallback(
      attrName: string,
      oldValue: unknown,
      newValue: unknown
    ) {
      if (newValue !== oldValue) {
        switch (attrName) {
          // Boolean attributes
          case "open":
            this[attrName] = this.hasAttribute(attrName);
            break;
          // Value attributes
          case "template":
            this[attrName] = newValue as string;
            break;
        }
      }
    }

    connectedCallback() {
      this.render();
      this.dispatchEvent(
        new CustomEvent("modal-dialog", {
          detail: { type: "connected", config: this.config },
          bubbles: true,
        })
      );
    }

    disconnectedCallback() {
      const { shadowRoot } = this;
      shadowRoot
        .querySelector("button")
        .removeEventListener("click", this.close);
      shadowRoot
        .querySelector(".overlay")
        .removeEventListener("click", this.close);

      this.dispatchEvent(
        new CustomEvent("modal-dialog", {
          detail: { type: "disconnected" },
          bubbles: true,
        })
      );
    }

    render() {
      const { shadowRoot, template } = this;

      const templateNode = document.querySelector(
        `template#${template}`
      ) as HTMLTemplateElement;
      shadowRoot.innerHTML = "";

      if (templateNode) {
        const content = document.importNode(templateNode.content, true);
        shadowRoot.appendChild(content);
      } else {
        shadowRoot.innerHTML = defaultTemplate;
      }

      shadowRoot.querySelector("button").addEventListener("click", this.close);
      shadowRoot
        .querySelector(".overlay")
        .addEventListener("click", this.close);

      this.open = this.open;

      setTimeout(() => {
        fetch("https://baconipsum.com/api/?type=all-meat&paras=1&format=json")
          .then((response) => response.json())
          .then((data) => {
            shadowRoot.getElementById(
              "content"
            ).innerHTML = `<p class="bacon">${data[0]}</p>`;

            this.dispatchEvent(
              new CustomEvent("modal-dialog", {
                detail: { type: "data-loaded", data },
                bubbles: true,
              })
            );
          });
      }, 10000);
    }

    close() {
      if (this.open !== false) {
        this.open = false;
      }

      const closeEvent = new CustomEvent("dialog-closed");
      this.dispatchEvent(closeEvent);
    }

    #watchEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        this.close();
      }
    }
  }

  window.customElements.define("modal-dialog", ModalDialog);
})();
