/**
 * Gallery scripts
 */

const url = "http://localhost:5678/api";

export function initializeGallery() {
    fetchGalleryWorks();
}

/**
 * Fetch works from the API
 * Do nothing if no work found
 */
async function fetchGalleryWorks() {
  try {
    const works = await fetch(`${url}/works`).then((works) => works.json());

    if (works !== null) {
      clearGallery();
      addWorksToGallery(works);
    }
  } catch (error) {
    console.error("Something went wrong : ", error);
  }
}

/**
 * Clear the gallery content
 */
function clearGallery() {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = "";
}

/**
 * Function to add works to the gallery
 * @param {Array<Object>} works
 */
function addWorksToGallery(works) {
  const gallery = document.querySelector(".gallery");
  for (let work of works) {
    let figure = document.createElement("figure")
    let image = document.createElement("img")
    let figcaption = document.createElement("figcaption")
    
    image.src = work.imageUrl
    image.alt = work.title
    figcaption.innerText = work.title

    figure.appendChild(image)
    figure.appendChild(figcaption)
    gallery.appendChild(figure)
  }
}
