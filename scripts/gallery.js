/**
 * Gallery scripts
 */

import { CONFIG } from "./config.js";
import { Auth } from "./auth.js";
import { Modal } from "./modal.js";

const modalSettings = {
  preloadTemplates: ["modalGallery"],
  defaultTemplate: "modalGallery",
};
const modal = new Modal(modalSettings);

/**
 * Initializes the gallery for dynamic display.
 * Skips initialization if the API is unreachable.
 *
 * @returns {void}
 */
export async function initializeGallery() {
  const isConnected = Auth.isConnected();

  if (isConnected) {
    setupAdminMode();
  }

  let works = await fetchGalleryWorks();
  if (works.length > 0) {
    clearGallery();
    addWorksToGallery(works);
    insertInLocalStorage("works", works);
  }

  if (!isConnected) {
    let categories = await fetchCategories();
    if (categories.length > 0) {
      addFiltersToGallery(categories);
      addFilterButtonsListener();
      insertInLocalStorage("categories", categories);
    }
  }
}

//--------------STEP 1.1--------------

/**
 * Fetches works from the API.
 * Sends an empty array in case of failure.
 *
 * @returns {Array<{
 *    id: number,
 *    title: string,
 *    imageUrl: string,
 *    categoryId: number,
 *    userId: number,
 *    category: {
 *      id: number,
 *      name: string
 *    }
 * }>} Array of works.
 */
async function fetchGalleryWorks() {
  try {
    const response = await fetch(`${CONFIG.API_URL}/works`);

    if (!response.ok) {
      throw new Error(`HTTP error, status : ${response.status}`);
    }

    const works = await response.json();
    return works || [];
  } catch (error) {
    console.error("Something went wrong : ", error);
    return [];
  }
}

/**
 * Clears the gallery content.
 * 
 * @returns {void}
 */
export function clearGallery() {
  const gallery = document.querySelector(CONFIG.SELECTORS.GALLERY);
  gallery.innerHTML = "";
}

/**
 * Adds the works to the gallery element.
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
 * }>} works Array of the works to display.
 * @returns {void}
 */
export function addWorksToGallery(works) {
  const gallery = document.querySelector(CONFIG.SELECTORS.GALLERY);
  for (let work of works) {
    let figure = document.createElement("figure");
    let image = document.createElement("img");
    let figcaption = document.createElement("figcaption");

    image.src = work.imageUrl;
    image.alt = work.title;
    figcaption.innerText = work.title;

    figure.appendChild(image);
    figure.appendChild(figcaption);
    gallery.appendChild(figure);
  }
}

/**
 * Sets item in localStorage.
 * Overwrites any existing value.
 * 
 * @param {string} entryName Entry key name.
 * @param {*} entryData Entry data content.
 */
export function insertInLocalStorage(entryName, entryData) {
  if (localStorage.getItem(entryName) != undefined) {
    localStorage.removeItem(entryName);
  }

  localStorage.setItem(entryName, JSON.stringify(entryData));
}

//--------------STEP 1.2--------------

/**
 * Fetches every works categories.
 * 
 * @returns {Array<{id: number, name: string}>} The array of the categories.
 */
async function fetchCategories() {
  try {
    const response = await fetch(`${CONFIG.API_URL}/categories`);

    if (!response.ok) {
      throw new Error(`HTTP error, status : ${response.status}`);
    }

    const categories = await response.json();
    console.log(categories)
    return categories || [];
  } catch (error) {
    // If it's not possible to reach the API or an error occured during process
    // Try to get categories with a fallback function
    return fallbackFetchCategories();
  }
}

/**
 * Tries to build the category array from existing data.
 * 
 * @returns {Array<{id: number, name: string}> | Array<null>} The array of categories or an empty array in case of failure.
 * @throws {Error} If it is impossible to build the categories from existing data.
 */
function fallbackFetchCategories() {
  try {
    // If the categories are already stored.
    if (localStorage.getItem("categories") != undefined) {
      return JSON.parse(localStorage.getItem("categories"));
    }

    // Builds categories based on the works stored
    if (localStorage.getItem("works") != undefined) {
      const works = JSON.parse(localStorage.getItem("works"));
      let categories = [];
      works.forEach((work) => {
        // If there is no existing category with an existing id
        // Then push it to the categories array
        if (!categories.some((category) => category.id === work.category.id)) {
          categories.push(work.category);
        }
      });

      return categories;
    } else {
      throw new Error("Can't build categories from existing data.");
    }
  } catch (error) {
    console.error(`Something went wrong : ${error}`);
    return [];
  }
}

/**
 * Adds the filters buttons to the gallery page.
 * 
 * @param {Array<{id: number, name: string}>} categories The categories array.
 * @returns {void}
 */
function addFiltersToGallery(categories) {
  const categoriesSet = categoriesToSet(categories);
  const filtersContainer = document.querySelector(CONFIG.SELECTORS.FILTERS);

  let i = 0;
  for (let category of categoriesSet) {
    // Parse the category to make it usable for JS
    const parsedCategory = JSON.parse(category);

    const button = document.createElement("button");

    button.innerText = parsedCategory.name;
    button.dataset.id = parsedCategory.id;
    if (i === 0) button.classList.add("active-filter");
    button.classList.add("filter-button");

    filtersContainer.appendChild(button);
    i++;
  }
}

/**
 * Creates a Set to remove duplicates on the categories.
 * Adds an extra entry to have the possibility to filter on all works.
 * 
 * @param {Array<{id: number, name: string}>} categories The categories array.
 * @returns {Set<{id: number, name: string}>} The categories set with an extra "Tous" filter category.
 */
function categoriesToSet(categories) {
  let categorySet = new Set();
  // Add the "Tous" category
  categorySet.add(JSON.stringify({ id: -1, name: "Tous" }));
  // Stringified to make it unique compared to an object and avoid duplicate
  categories.forEach((category) => categorySet.add(JSON.stringify(category)));
  return categorySet;
}

/**
 * Adds an event listener to each filter buttons.
 * 
 * @returns {void}
 */
function addFilterButtonsListener() {
  const filterButtons = document.querySelectorAll(
    `${CONFIG.SELECTORS.FILTERS} button`
  );

  filterButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      handleFilter(event.target.dataset.id);
    });
  });
}

/**
 * Handles filter event by updating the works and buttons display.
 * 
 * @param {string} filterId Unique category ID from the button dataset.
 * @returns {void}
 */
function handleFilter(filterId) {
  updateFilterButtons(filterId);
  const filteredWorks = getFilteredWorks(filterId);
  clearGallery();
  addWorksToGallery(filteredWorks);
}

/**
 * Updates the class of the active filter button.
 * 
 * @param {string} filterId Unique category ID from the button dataset.
 * @returns {void}
 */
function updateFilterButtons(filterId) {
  const filterButtons = document.querySelectorAll(
    `${CONFIG.SELECTORS.FILTERS} button`
  );

  filterButtons.forEach((button) => {
    // Removes the active class if it's not the concerned button
    if (
      button.classList.contains("active-filter") &&
      button.dataset.id != filterId
    ) {
      button.classList.remove("active-filter");
    }
    // Adds the active if the id matches
    if (
      !button.classList.contains("active-filter") &&
      button.dataset.id === filterId
    ) {
      button.classList.add("active-filter");
    }
  });
}

/**
 * Returns the array of filtered works based on the filter ID.
 * 
 * @param {string} filterId Unique category ID from the button dataset.
 * @returns {Array<{
 *    id: number,
 *    title: string,
 *    imageUrl: string,
 *    categoryId: number,
 *    userId: number,
 *    category: {
 *      id: number,
 *      name: string
 *    }
 * }>} The array of filtered works based on the category filter ID.
 */
function getFilteredWorks(filterId) {
  const works = JSON.parse(localStorage.getItem("works"));
  let filteredWorks = [];
  if (parseInt(filterId) === -1) {
    filteredWorks = works;
  } else {
    filteredWorks = works.filter(
      (work) => work.categoryId === parseInt(filterId)
    );
  }

  return filteredWorks;
}

//--------------STEP 2.2--------------

/**
 * Sets up the app for admin mode by changing text and classes.
 * 
 * @returns {void}
 */
function setupAdminMode() {
  changeLoginLink();
  displayEditMode();
  addOpenModalListener();
}

/**
 * Changes login to logout inner text and add the disconnect functionnality.
 * 
 * @returns {void}
 */
function changeLoginLink() {
  const loginLink = document.querySelector(CONFIG.SELECTORS.LOGIN_LOGOUT_LINK);

  loginLink.innerText = "logout";
  loginLink.addEventListener("click", (event) => {
    event.preventDefault();
    Auth.disconnect();
    window.location.href = "index.html";
  });
}

/**
 * Removes the class that hide the hints to alert the admin.
 * 
 * @returns {void}
 */
function displayEditMode() {
  const editModeDiv = document.querySelector(CONFIG.SELECTORS.EDIT_MODE_DIV);
  const modifyDiv = document.querySelector(CONFIG.SELECTORS.MODIFY_DIV);

  editModeDiv.classList.remove("hidden");
  modifyDiv.classList.remove("hidden");
}

//--------------STEP 3.1--------------
/**
 * Adds the event listener to open the modal window.
 * 
 * @returns {void}
 */
function addOpenModalListener() {
  const modifyDiv = document.querySelector(CONFIG.SELECTORS.MODIFY_DIV);
  modifyDiv.addEventListener("click", () => modal.open());
}
