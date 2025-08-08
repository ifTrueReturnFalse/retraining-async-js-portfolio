/**
 * Gallery scripts
 */

import { CONFIG } from "./config.js";

const url = CONFIG.API_URL;

/**
 * Function to initialize the gallery for dynamic display
 * Do nothing if it can't reach the API
 */
export async function initializeGallery() {
  let works = await fetchGalleryWorks();
  if (works.length > 0) {
    clearGallery();
    addWorksToGallery(works);
    insertInLocalStorage("works", works);
  }

  let categories = await fetchCategories();
  if (categories.length > 0) {
    insertInLocalStorage("categories", categories);
  }
}

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
