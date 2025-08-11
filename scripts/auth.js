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
        throw new Error(
          "Erreur lors de la connexion. Vérifiez vos identifiants."
        );
      }

      const data = await response.json();

      this.setUser(data.userId, data.token);

      return { success: true, data: data };
    } catch (error) {
      return { success: false, error: error };
    }
  }

  static setUser(userId, token) {
    const sessionData = JSON.stringify({
      userId: userId,
      token: token,
    });
    sessionStorage.setItem("auth", sessionData);
  }
}

export { Auth };
