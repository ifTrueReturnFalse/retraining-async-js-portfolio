import { CONFIG } from "./config.js";
import { Auth } from "./auth.js";

//--------------STEP 2.2--------------

/**
 * Initializes the login page.
 * Redirects the user to the home page if they are already connected.
 * 
 * @returns {void}
 */
function initializeLoginPage() {
  if (Auth.isConnected()) {
    window.location.href = "index.html"
  }
  addSubmitEventListener();
}

/**
 * Adds an event listener to handle form submission. 
 * 
 * @returns {void}
 */
function addSubmitEventListener() {
  const loginForm = document.querySelector(CONFIG.SELECTORS.LOGIN);
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handleSubmit();
  });
}

/**
 * Handle form submission by validating input and calling authentication API.
 * 
 * @returns {void}
 */
function handleSubmit() {
  const email = document.querySelector(CONFIG.SELECTORS.EMAIL).value;
  const password = document.querySelector(CONFIG.SELECTORS.PASSWORD).value;

  const areCredentialsOk = verifyInputs(email, password);
  if (!areCredentialsOk) {
    displayError("E-mail et / ou mot de passe mal renseigné.");
  } else {
    Auth.login(email, password).then(result => {
      handleLoginResult(result)
    })
  }
}

/**
 * Validates user's email and password inputs. 
 * 
 * @param {string} email User's email address.
 * @param {string} password User's password address.
 * @returns {boolean} : `true` if the inputs are valid, othewise `false`.
 */
function verifyInputs(email, password) {
  const regExpression = new RegExp(
    "^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?.([a-zA-Z]{2,})$"
  );
  return regExpression.test(email) && password.length > 2;
}

/**
 * Display an error message to the user.
 * 
 * @param {string} errorMessage : Error message to display.
 * @returns {void}
 */
function displayError(errorMessage) {
  let errorDisplay = document.querySelector(CONFIG.SELECTORS.ERROR);

  if (errorDisplay == null) {
    errorDisplay = createErrorDiv();
  }

  errorDisplay.innerText = errorMessage;
}

/**
 * Creates and appends a div to displays errors to the user. 
 *  
 * @returns {HTMLDivElement} The created error display element.
 */
function createErrorDiv() {
  const loginForm = document.querySelector(CONFIG.SELECTORS.LOGIN);

  const errorDisplay = document.createElement("div");
  errorDisplay.classList.add("error");
  loginForm.appendChild(errorDisplay);

  return errorDisplay;
}

/**
 * Handles the result of a login attempt.
 * 
 * @param {{success: boolean, error?: Error}} result The login attempt result.
 * @returns {void}
 */
function handleLoginResult(result) {
  if (result.success === false) {
    displayError(result.error.toString())
  } else {
    window.location.href = "index.html"
  }
}

// Entry point
initializeLoginPage();
