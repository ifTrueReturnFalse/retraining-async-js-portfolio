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
    this.currenTemplate = null;

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
    this.removeUselessListeners();

    this.modalElement.close();
  }

  /**
   * Sets up the HTML content in the modal.
   *
   * @param {string} templatePath Template file name without extension.
   * @returns {void}
   */
  setContent(templatePath) {
    this.removeUselessListeners();
    this.contentElement.innerHTML = this.templates.get(templatePath);
    this.currenTemplate = templatePath;
    this.modalInitialize(templatePath);
  }

  /**
   * Handles all the click on the modal.
   *
   * @param {event} event Event send by the click.
   * @returns {void}
   */
  handleClick(event) {
    if (
      event.target === this.modalElement ||
      event.target === this.closeElement
    ) {
      this.close();
    }

    if (event.target.classList.contains("fa-trash-can")) {
      this.deleteWork(event.target.dataset.id);
    }

    if (event.target.id === "modal-button-goto-work-form") {
      this.setContent("modalAddWork");
    }

    if (event.target.classList.contains("fa-arrow-left")) {
      this.setContent("modalGallery");
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

    if (templatePath === "modalAddWork") {
      this.modalInjectCategories();
      this.modalAddWorkListener();
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
          this.updateAfterDelete(workId);
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
  updateAfterDelete(deletedWork) {
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

  /**
   * Injects categories options in the select element.
   *
   * @returns {void}
   */
  modalInjectCategories() {
    const categories = JSON.parse(localStorage.getItem("categories"));
    const selectElement = document.getElementById(
      CONFIG.SELECTORS.WORK_ADD_SELECT
    );

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.text = category.name;
      selectElement.appendChild(option);
    });
  }

  /**
   * Removes listeners based on a template.
   *
   * @returns {void}
   */
  removeUselessListeners() {
    if (this.currenTemplate === "modalAddWork") {
      const form = document.querySelector(CONFIG.SELECTORS.MODAL_WORK_FORM);
      const workImageInput = document.getElementById(
        CONFIG.SELECTORS.WORK_PHOTO
      );

      form.removeEventListener("submit", (event) => {
        this.handleWorkFormSubmit(event);
      });
      workImageInput.removeEventListener("change", () => {
        this.handleWorkImageInput();
      });
    }
  }

  /**
   * Adds listeners on the add work template.
   *
   * @returns {void}
   */
  modalAddWorkListener() {
    const form = document.querySelector(CONFIG.SELECTORS.MODAL_WORK_FORM);
    const workImageInput = document.getElementById(CONFIG.SELECTORS.WORK_PHOTO);

    form.addEventListener("submit", (event) => {
      this.handleWorkFormSubmit(event);
    });
    workImageInput.addEventListener("change", () => {
      this.handleWorkImageInput();
    });
  }

  /**
   * Handles actions to do on the work form submission.
   *
   * @todo Change JSDdoc when function is functionnal.
   * @param {event} event The submit event.
   * @returns {void}
   */
  handleWorkFormSubmit(event) {
    event.preventDefault();
    if (this.verifyForm()) {
      this.removeError();
      this.handlePostWork();
    } else {
      this.displayError("Les champs ne sont pas tous remplis.");
    }
  }

  /**
   * Verifies the photo file input and the title text input.
   *
   * @returns {boolean} `true` when the file input and the text input are OK, `false` otherwise.
   */
  verifyForm() {
    const photoInput = document.getElementById(CONFIG.SELECTORS.WORK_PHOTO);
    const titleInput = document.getElementById(CONFIG.SELECTORS.WORK_TITLE);

    return photoInput.value !== "" && titleInput.value.length > 2;
  }

  /**
   * Displays an error message to the user.
   *
   * @param {string} message The error message to display.
   */
  displayError(message) {
    let modalError = document.querySelector(CONFIG.SELECTORS.MODAL_ERROR);
    if (modalError === null) {
      modalError = this.createErrorElement();
    }

    modalError.innerText = message;
  }

  /**
   * Creates an error element to display errors in.
   *
   * @returns {HTMLDivElement} The error div.
   */
  createErrorElement() {
    const workForm = document.querySelector(CONFIG.SELECTORS.MODAL_WORK_FORM);

    const errorElement = document.createElement("div");
    errorElement.classList.add("modal-error");
    workForm.appendChild(errorElement);

    return errorElement;
  }

  /**
   * Removes the error div if it is present.
   *
   * @returns {void}
   */
  removeError() {
    let modalError = document.querySelector(CONFIG.SELECTORS.MODAL_ERROR);
    if (modalError !== null) {
      modalError.remove();
    }
  }

  /**
   * Handles the insertion of the new work by creating a FormData and fetching to the API.
   * 
   * @returns {void}
   */
  async handlePostWork() {
    const workImage = document.getElementById(CONFIG.SELECTORS.WORK_PHOTO);
    const workTitle = document.getElementById(CONFIG.SELECTORS.WORK_TITLE);
    const workCategory = document.getElementById(
      CONFIG.SELECTORS.WORK_CATEGORY
    );

    const formData = new FormData();
    formData.append("image", workImage.files[0]);
    formData.append("title", workTitle.value);
    formData.append("category", workCategory.value);

    const token = Auth.getUser().token;

    try {
      const response = await fetch(`${this.config.apiUrl}/works`, {
        body: formData,
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout du projet.");
      }

      const data = await response.json()
      this.updateAfterAdd(data)
    } catch (error) {
      this.displayError(error)
    }
  }

  /**
   * Updates the local storage, the display.
   * 
   * @param {
   *  id: number,
 *    title: string,
 *    imageUrl: string,
 *    categoryId: number,
 *    userId: number,
 *    } workData The work data from the API.
   */
  updateAfterAdd(workData) {
    let works = JSON.parse(localStorage.getItem("works"))
    works.push(workData)
    insertInLocalStorage("works", works)
    clearGallery()
    addWorksToGallery(works)

    this.resetForm()
  }

  /**
   * Resets the work form.
   * 
   * @returns {void}
   */
  resetForm() {
    const workImage = document.getElementById(CONFIG.SELECTORS.WORK_PHOTO);
    const workTitle = document.getElementById(CONFIG.SELECTORS.WORK_TITLE);

    workImage.value = ""
    workTitle.value = ""

    this.handleWorkImageInput()
  }

  /**
   * Handles input change when the user input an image file.
   *
   * @returns {void}
   */
  handleWorkImageInput() {
    const workImageInput = document.getElementById(CONFIG.SELECTORS.WORK_PHOTO);
    const defaultLabel = document.querySelector(
      CONFIG.SELECTORS.CUSTOM_FILE_INPUT_DEFAULT
    );

    this.handleFileInput();

    if (
      workImageInput.value !== "" &&
      !defaultLabel.classList.contains("hidden")
    ) {
      defaultLabel.classList.add("hidden");
    } else if (
      workImageInput.value === "" &&
      defaultLabel.classList.contains("hidden")
    ) {
      defaultLabel.classList.remove("hidden");
    }
  }

  /**
   * Handles the file input to preview on the modal.
   *
   * @returns {void}
   */
  handleFileInput() {
    const workImageInput = document.getElementById(CONFIG.SELECTORS.WORK_PHOTO);
    const imagePreview = document.querySelector(
      CONFIG.SELECTORS.CUSTOM_FILE_INPUT_PREVIEW
    );

    if (workImageInput.files[0]) {
      imagePreview.file = workImageInput.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        imagePreview.src = event.target.result;
      };
      reader.readAsDataURL(workImageInput.files[0]);
    } else {
      imagePreview.src = "";
    }
  }
}

export { Modal };
