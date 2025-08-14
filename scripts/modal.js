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
      currentTemplate: null,
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
    this.modalInitialize(templatePath);
    this.currentTemplate = templatePath
  }

  handleClick(event) {
    event.preventDefault();
    
    if (
      event.target === this.modalElement ||
      event.target === this.closeElement
    ) {
      this.close();
    }

    if (event.target.classList.contains("fa-trash-can")) {
      this.deleteWork(event.target.dataset.id)
    }
  }

  modalInitialize(templatePath) {
    if (templatePath === "modalGallery") {
      this.modalGalleryInitialize();
    }
  }

  modalGalleryInitialize() {
    const works = JSON.parse(localStorage.getItem("works"));
    const modalGallery = document.querySelector(CONFIG.SELECTORS.MODAL_GALLERY);
    
    works.forEach((work) => {
      const galleryElement = document.createElement("div");
      const workImage = document.createElement("img");
      const trashcan = document.createElement("i");

      galleryElement.classList.add("gallery-element");
      workImage.src = work.imageUrl;
      workImage.alt = work.title;
      trashcan.classList.add("fa-solid", "fa-trash-can");
      trashcan.dataset.id = work.id;

      galleryElement.appendChild(workImage);
      galleryElement.appendChild(trashcan);

      modalGallery.appendChild(galleryElement);
    });
  }

  deleteWork(workId) {
    console.log(workId)
  }
}

export { Modal };
