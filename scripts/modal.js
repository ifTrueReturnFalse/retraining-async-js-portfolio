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
      backdropClose: true,
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
    this.config.preloadTemplates.forEach((templatePath) => {
      console.log(templatePath);
    });
  }

  open() {
    this.isOpen = true;
    this.modalElement.addEventListener("click", this.handleClick);

    if (this.config.defaultTemplate !== null) {
      this.setContent(this.templates[this.config.defaultTemplate]);
    }

    this.modalElement.showModal()
  }

  close() {
    this.isOpen = false;
    this.modalElement.removeEventListener("click", this.handleClick);
    
    this.modalElement.close()
  }

  setContent(templatePath) {
    console.log(templatePath);
  }

  handleClick(event) {
    event.preventDefault()
    if (event.target === this.modalElement) {
      this.close()
    }
    console.log(event);
  }
}

export { Modal };
