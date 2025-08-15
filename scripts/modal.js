import { CONFIG } from "./config.js";
import { Auth } from "./auth.js";
import {
  clearGallery,
  addWorksToGallery,
  insertInLocalStorage,
} from "./gallery.js";

/**
 * Handles every interaction for the admin modal window.
 *
 * @class Modal
 * @author Timothe Duquesne
 */
class Modal {
  /**
   * Creates a new Modal instance to handle admin modal interactions,
   * including template preloading, opening/closing, and dynamic content updates.
   *
   * @param {Object} [config={}]  Custom configuration overrides.
   * @param {string} [config.modalSelector="#modal"] CSS selector for the modal element.
   * @param {string} [config.contentSelector="#modal .modal-content"] CSS selector for the modal content container.
   * @param {string} [config.closeSelector="#modal .modal-close"] CSS selector for the close button inside the modal.
   * @param {string[]} [config.preloadTemplates=[]] List of template file names (without extension) to preload.
   * @param {string|null} [config.defaultTemplate=null] Template to display by default when the modals open.
   * @param {string} [config.apiUrl=CONFIG.API_URL] Base API URL for fetching, deleting or adding works.
   *
   */
  constructor(config = {}) {
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

    this.currentTemplate = null;
    this.handleClick = this.handleClick.bind(this);

    this.preloadTemplates();
  }

  /**
   * Preloads the templates on load.
   *
   * @returns {void}
   */
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

  /**
   * Opens the modal. If a default template is configured, set the content by default.
   *
   * @returns {void}
   */
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

  /**
   * Closes the modal.
   *
   * @returns {void}
   */
  close() {
    this.isOpen = false;
    this.modalElement.removeEventListener("click", this.handleClick);

    this.modalElement.close();
  }

  /**
   * Sets up the HTML content in the modal.
   *
   * @param {string} templatePath Template file name without extension.
   * @returns {void}
   */
  setContent(templatePath) {
    this.contentElement.innerHTML = this.templates.get(templatePath);
    this.modalInitialize(templatePath);
    this.currentTemplate = templatePath;
  }

  /**
   * Handles all the click on the modal.
   *
   * @param {event} event Event send by the click.
   * @returns {void}
   */
  handleClick(event) {
    event.preventDefault();

    if (
      event.target === this.modalElement ||
      event.target === this.closeElement
    ) {
      this.close();
    }

    if (event.target.classList.contains("fa-trash-can")) {
      this.deleteWork(event.target.dataset.id);
    }
  }

  /**
   * Initializes the dynamic content in the modal.
   *
   * @param {string} templatePath Template file name without extension.
   * @returns {void}
   */
  modalInitialize(templatePath) {
    if (templatePath === "modalGallery") {
      this.modalGalleryClear();
      this.modalGalleryDisplay();
    }
  }

  /**
   * Clears the modal gallery.
   *
   * @returns {void}
   */
  modalGalleryClear() {
    const modalGallery = document.querySelector(CONFIG.SELECTORS.MODAL_GALLERY);
    modalGallery.innerHTML = "";
  }

  /**
   * Fetches through the works stored in local storage and display them.
   *
   * @returns {void}
   */
  modalGalleryDisplay() {
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

  /**
   * Deletes a work.
   *
   * @param {number} workId Unique work ID to delete.
   * @returns {void}
   */
  async deleteWork(workId) {
    if (Auth.isConnected()) {
      const token = Auth.getUser().token;
      try {
        const response = await fetch(`${this.config.apiUrl}/works/${workId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          this.updateWorks(workId);
        } else {
          throw new Error(`Impossible de supprimer le projet : ${workId}.`);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  /**
   * Updates the display and the local storage of the works.
   *
   * @param {Array<{
   *    id: number,
   *    title: string,
   *    imageUrl: string,
   *    categoryId: number,
   *    userId: number,
   *    category: {
   *      id: number,
   *      name: string
   *    }
   * }>} deletedWork Array of works.
   *@returns {void}
   */
  updateWorks(deletedWork) {
    const works = JSON.parse(localStorage.getItem("works"));
    const notDeletedWorks = works.filter((work) => {
      return work.id !== parseInt(deletedWork);
    });
    insertInLocalStorage("works", notDeletedWorks);
    this.modalGalleryClear();
    this.modalGalleryDisplay();
    clearGallery();
    addWorksToGallery(notDeletedWorks);
  }
}

export { Modal };
