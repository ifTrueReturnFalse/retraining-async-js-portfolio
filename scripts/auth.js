import { CONFIG } from "./config.js";

/**
 * Handles the admin authentication and user information management.
 * @class Auth
 * @author Timothe Duquesne
 */

//--------------STEP 2.2--------------

class Auth {
  /**
   * Logs in a user with the provided email and password.
   *
   * @async
   * @param {string} email User email address.
   * @param {string} password User password.
   * @returns {{success: boolean, error?: Error}} Indicate wheter the authentication is successful
   * @throws {Error} If the login request fails or credantials are invalid.
   */
  static async login(email, password) {
    try {
      const requestBody = { email, password };

      const response = await fetch(`${CONFIG.API_URL}/users/login`, {
        body: JSON.stringify(requestBody),
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Erreur dans l'identifiant ou le mot de passe.");
      }

      const data = await response.json();

      this.setUser(data.userId, data.token);

      return { success: true };
    } catch (error) {
      return { success: false, error: error };
    }
  }

  /**
   * Stores user data in session storage.
   *
   * @param {number} userId User's unique ID.
   * @param {string} token Authentification token.
   * @returns {void}
   */
  static setUser(userId, token) {
    const sessionData = JSON.stringify({
      userId,
      token,
    });
    sessionStorage.setItem("auth", sessionData);
  }

  /**
   * Check is the user is already connected.
   *
   * @returns {boolean} `true` if the user is connected, otherwise `false`
   */
  static isConnected() {
    return this.getUser() !== null;
  }

  /**
   * Retrieves the user data from session storage.
   * 
   * @returns {{userId: number, token: string} | null} User data, or `null` if not connected
   */
  static getUser() {
    const data = sessionStorage.getItem("auth");
    return data ? JSON.parse(data) : null;
  }

  /**
   * Removes the user data from session storage.
   * 
   * @returns {void}
   */
  static disconnect() {
    if (this.isConnected()) {
      sessionStorage.removeItem("auth");
    }
  }
}

export { Auth };
