/**
 * Config file for the application
 */

export const CONFIG = {
  API_URL: "http://localhost:5678/api",
  SELECTORS: {
    GALLERY: ".gallery",
    FILTERS: ".filters",
    LOGIN: ".login",
    EMAIL: ".login #email",
    PASSWORD: ".login #password",
    ERROR: ".login .error",
    LOGIN_LOGOUT_LINK: ".login-logout-link",
    EDIT_MODE_DIV: ".edit-mode-div",
    MODIFY_DIV: ".modify-div",
    MODAL_GALLERY: ".modal-gallery",
    WORK_ADD_SELECT: "work-category",
    MODAL_WORK_FORM: ".modal-work-form",
    WORK_PHOTO: "work-photo",
    WORK_TITLE: "work-title",
    WORK_CATEGORY: "work-category",
    CUSTOM_FILE_INPUT_DEFAULT: ".custom-file-input-default",
    CUSTOM_FILE_INPUT_PREVIEW: ".custom-file-input-preview",
    MODAL_MESSAGE: ".modal-message",
  },
  FALLBACK_WORKS: [
    {
      id: 1,
      title: "Abajour",
      categoryId: 1,
      imageUrl: "../assets/images/abajour-tahina.png",
      category: {
        id: 1,
        name: "Objets",
      },
    },
    {
      id: 2,
      title: "Appartement Paris V",
      categoryId: 2,
      imageUrl: "../assets/images/appartement-paris-v.png",
      category: {
        id: 2,
        name: "Appartements",
      },
    },
    {
      id: 3,
      title: "Restaurant Sushisen - Londres",
      categoryId: 3,
      imageUrl: "../assets/images/restaurant-sushisen-londres.png",
      category: {
        id: 3,
        name: "Hotels & restaurants",
      },
    },
    {
      id: 4,
      title: "Villa “La Balisiere” - Port Louis",
      categoryId: 2,
      imageUrl: "../assets/images/la-balisiere.png",
      category: {
        id: 2,
        name: "Appartements",
      },
    },
    {
      id: 5,
      title: "Structures Thermopolis",
      categoryId: 1,
      imageUrl: "../assets/images/structures-thermopolis.png",
      category: {
        id: 1,
        name: "Objets",
      },
    },
    {
      id: 6,
      title: "Appartement Paris X",
      categoryId: 2,
      imageUrl: "../assets/images/appartement-paris-x.png",
      category: {
        id: 2,
        name: "Appartements",
      },
    },
    {
      id: 7,
      title: "Pavillon “Le coteau” - Cassis",
      categoryId: 2,
      imageUrl: "../assets/images/le-coteau-cassis.png",
      category: {
        id: 2,
        name: "Appartements",
      },
    },
    {
      id: 8,
      title: "Villa Ferneze - Isola d'Elba",
      categoryId: 2,
      imageUrl: "../assets/images/villa-ferneze.png",
      category: {
        id: 2,
        name: "Appartements",
      },
    },
    {
      id: 9,
      title: "Appartement Paris XVIII",
      categoryId: 2,
      imageUrl: "../assets/images/appartement-paris-xviii.png",
      category: {
        id: 2,
        name: "Appartements",
      },
    },
    {
      id: 10,
      title: "Bar “Lullaby” - Paris",
      categoryId: 3,
      imageUrl: "../assets/images/bar-lullaby-paris.png",
      category: {
        id: 3,
        name: "Hotels & restaurants",
      },
    },
    {
      id: 11,
      title: "Hotel First Arte - New Delhi",
      categoryId: 3,
      imageUrl: "../assets/images/hotel-first-arte-new-delhi.png",
      category: {
        id: 3,
        name: "Hotels & restaurants",
      },
    },
  ],
};
