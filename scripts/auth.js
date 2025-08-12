import { CONFIG } from "./config.js";

class Auth {
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

  static setUser(userId, token) {
    const sessionData = JSON.stringify({
      userId,
      token,
    });
    sessionStorage.setItem("auth", sessionData);
  }

  static isConnected() {
    return this.getUser() !== null;
  }

  static getUser() {
    const data = sessionStorage.getItem("auth");
    return data ? JSON.parse(data) : null;
  }

  static disconnect() {
    if (this.isConnected()) {
      sessionStorage.removeItem("auth");
    }
  }
}

export { Auth };
