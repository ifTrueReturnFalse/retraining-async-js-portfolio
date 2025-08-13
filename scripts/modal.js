import { CONFIG } from "./config.js";

class Modal {
  constructor(config = {}) {
    //Default configuration
    const defaults = {
      modalSelector: "#modal",
      contentSelector: "#modal .modal-content",
      closeSelector: "#modal .modal-close",
      preloadTemplates: [],
      defaultTemplate: null,
      apiUrl: CONFIG.API_URL,
    };

    this.config = { ...defaults, ...config };

    this.modalElement = document.querySelector(this.config.modalSelector);
    this.contentElement = document.querySelector(this.config.contentSelector);
    this.closeElement = document.querySelector(this.config.closeSelector);

    this.templates = new Map();
    this.isOpen = false;

    this.handleClick = this.handleClick.bind(this);

    this.preloadTemplates();
  }

  async preloadTemplates() {
    const promises = this.config.preloadTemplates.map(async (templatePath) => {
      try {
        const response = await fetch(`../templates/${templatePath}.html`);
        const htmlModal = await response.text();
        this.templates.set(templatePath, htmlModal);
      } catch (error) {
        console.warn(
          `Erreur lors de la récupération du template ${templatePath}`,
          error
        );
      }
    });
    await Promise.all(promises);
  }

  open() {
    this.isOpen = true;

    if (
      this.config.defaultTemplate !== null &&
      this.templates.has(this.config.defaultTemplate)
    ) {
      this.setContent(this.config.defaultTemplate);
    }

    this.modalElement.showModal();
    this.modalElement.addEventListener("click", this.handleClick);
  }

  close() {
    this.isOpen = false;
    this.modalElement.removeEventListener("click", this.handleClick);

    this.modalElement.close();
  }

  setContent(templatePath) {
    this.contentElement.innerHTML = this.templates.get(templatePath);
  }

  handleClick(event) {
    event.preventDefault();
    if (
      event.target === this.modalElement ||
      event.target === this.closeElement
    ) {
      this.close();
    }
    console.log(event);
  }
}

export { Modal };
