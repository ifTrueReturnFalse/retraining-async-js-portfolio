import { CONFIG } from "./config.js";
import { Auth } from "./auth.js";

function initializeLoginPage() {
  if (Auth.isConnected()) {
    window.location.href = "index.html"
  }
  addSubmitEventListener();
}

function addSubmitEventListener() {
  const loginForm = document.querySelector(CONFIG.SELECTORS.LOGIN);
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handleSubmit();
  });
}

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

function verifyInputs(email, password) {
  const regExpression = new RegExp(
    "^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?.([a-zA-Z]{2,})$"
  );
  return regExpression.test(email) && password.length > 2;
}

function displayError(errorMessage) {
  let errorDisplay = document.querySelector(CONFIG.SELECTORS.ERROR);

  if (errorDisplay == null) {
    errorDisplay = createErrorDiv();
  }

  errorDisplay.innerText = errorMessage;
}

function createErrorDiv() {
  const loginForm = document.querySelector(CONFIG.SELECTORS.LOGIN);

  const errorDisplay = document.createElement("div");
  errorDisplay.classList.add("error");
  loginForm.appendChild(errorDisplay);

  return errorDisplay;
}

function handleLoginResult(result) {
  if (result.success === false) {
    displayError(result.error.toString())
  } else {
    window.location.href = "index.html"
  }
}

initializeLoginPage();
