/**
 * Gallery scripts
 */

import { CONFIG } from "./config.js";
import { Auth } from "./auth.js";

const url = CONFIG.API_URL;

/**
 * Function to initialize the gallery for dynamic display
 * Do nothing if it can't reach the API
 */
export async function initializeGallery() {
  const isConnected = Auth.isConnected();
  
  if (isConnected) {
    setupAdminMode()
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
 * Fetch works from the API
 * Send empty array in case of failure
 * @returns {Array<Object>} List of works
 */
async function fetchGalleryWorks() {
  try {
    const response = await fetch(`${url}/works`);

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
 * Clear the gallery content
 */
function clearGallery() {
  const gallery = document.querySelector(CONFIG.SELECTORS.GALLERY);
  gallery.innerHTML = "";
}

/**
 * Function to add works to the gallery
 * @param {Array<Object>} works
 */
function addWorksToGallery(works) {
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
 * Function to set item in localStorage
 * Reset the value if it was previously stored
 * @param {String} entryName
 * @param {*} entryData
 */
function insertInLocalStorage(entryName, entryData) {
  if (localStorage.getItem(entryName) != undefined) {
    localStorage.removeItem(entryName);
  }

  localStorage.setItem(entryName, JSON.stringify(entryData));
}

//--------------STEP 1.2--------------

/**
 * Function to fetch all works categories
 * @returns {Set} Set of categories
 */
async function fetchCategories() {
  try {
    const response = await fetch(`${url}/categories`);

    if (!response.ok) {
      throw new Error(`HTTP error, status : ${response.status}`);
    }

    const categories = await response.json();

    return categories || [];
  } catch (error) {
    //If it's not possible to reach the API or an error occured during process
    //Try to get categories with a fallback function
    return fallbackFetchCategories();
  }
}

/**
 * Fallback function to try to build the category array if existing data is present
 * @returns {Array<Object>} array of categories
 */
function fallbackFetchCategories() {
  try {
    //In case categories were already stored
    if (localStorage.getItem("categories") != undefined) {
      return JSON.parse(localStorage.getItem("categories"));
    }

    //Build categories based on the works stored
    if (localStorage.getItem("works") != undefined) {
      const works = JSON.parse(localStorage.getItem("works"));
      let categories = [];
      works.forEach((work) => {
        //If there is not already an existing category with an existing id
        //Then push it to categories
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
 * Function to add the filters buttons to the webpage
 * based on the given categories
 * @param {Array<Object>} categories
 */
function addFiltersToGallery(categories) {
  const categoriesSet = categoriesToSet(categories);
  const filtersContainer = document.querySelector(CONFIG.SELECTORS.FILTERS);

  let i = 0;
  for (let category of categoriesSet) {
    //Parse the category to make it usable for JS
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
 * Create a Set to avoid duplicate on categories
 * Add an extra entry to have the possibility to filter on all works
 * @param {Array<Object>} categories : List of categories
 * @returns {Set} Set with an extra "Tous" filter category and of every other categories
 */
function categoriesToSet(categories) {
  let categorySet = new Set();
  //Add the "Tous" category
  categorySet.add(JSON.stringify({ id: -1, name: "Tous" }));
  //Stringified to make it unique compared to an object and avoid duplicate
  categories.forEach((category) => categorySet.add(JSON.stringify(category)));
  return categorySet;
}

/**
 * Function to add an event listener to each filter button
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
 * Function to call the necesary functions to filters works
 * @param {String} filterId : number in string format contained in the button dataset
 */
function handleFilter(filterId) {
  updateFilterButtons(filterId);
  const filteredWorks = getFilteredWorks(filterId);
  clearGallery();
  addWorksToGallery(filteredWorks);
}

/**
 * Function to update the class of the active filter
 * @param {String} filterId : Id included in the dataset of the button in string format
 */
function updateFilterButtons(filterId) {
  const filterButtons = document.querySelectorAll(
    `${CONFIG.SELECTORS.FILTERS} button`
  );

  filterButtons.forEach((button) => {
    //Remove the active class if it's not the concerned button
    if (
      button.classList.contains("active-filter") &&
      button.dataset.id != filterId
    ) {
      button.classList.remove("active-filter");
    }
    //Add the active if the id matches
    if (
      !button.classList.contains("active-filter") &&
      button.dataset.id === filterId
    ) {
      button.classList.add("active-filter");
    }
  });
}

/**
 * Return the array of filtered works based on the filter ID
 * @param {String} filterId : Id included in the dataset of the button in string format
 * @returns {Array<Object>} List of filtered works based on provided ID
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

function setupAdminMode() {
  changeLoginLink()
  displayEditMode()
}

function changeLoginLink() {
  const loginLink = document.querySelector(CONFIG.SELECTORS.LOGIN_LOGOUT_LINK)

  loginLink.innerText = "logout"
  loginLink.addEventListener("click", (event) => {
    event.preventDefault()
    Auth.disconnect()
    window.location.href = "index.html"
  })
}

function displayEditMode() {
  const editModeDiv = document.querySelector(CONFIG.SELECTORS.EDIT_MODE_DIV)
  const modifyDiv = document.querySelector(CONFIG.SELECTORS.MODIFY_DIV)

  editModeDiv.classList.remove("hidden")
  modifyDiv.classList.remove("hidden")
}