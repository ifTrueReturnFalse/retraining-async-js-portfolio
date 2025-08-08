/**
 * Gallery scripts
 */

import {CONFIG} from "./config.js"

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
