import { Client, Account, ID } from "appwrite";
import config from "../config/config";

export class AuthService {
  client = new Client();
  account;

  constructor() {
    this.client
      .setEndpoint(config.appwriteUrl) // Ensure your Appwrite endpoint is correct
      .setProject(config.appwriteProjecID); // Ensure your project ID is correct
    this.account = new Account(this.client);
  }

  isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  async createAccount({ email, password }) {
    // Validate email before proceeding
    if (!this.isValidEmail(email)) {
      throw new Error(`Invalid email format: ${email}`);
    }

    try {
      // Generate a unique ID using Appwrite's ID module
      const userId = ID.unique();

      // Create the user account
      const userAccount = await this.account.create(
        userId, // Use the generated ID as the user ID
        email,
        password
      );

      return userAccount;
    } catch (error) {
      throw new Error(`Failed to create account: ${error.message}`);
    }
  }

  async login({ email, password }) {
    try {
      return await this.account.createEmailPasswordSession(email, password);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        throw new Error("Invalid email or password");
      } else {
        throw new Error(`Login failed: ${error.message}`);
      }
    }
  }

  async getCurrentUser() {
    try {
      const user = await this.account.get();
      return user.$id; // This is the unique user ID
    } catch (error) {
      console.log("Error fetching current user:", error);
    }
    return null;
  }

  async logout() {
    try {
      return await this.account.deleteSessions();
    } catch (error) {
      console.log("Error logging out:", error);
    }
  }
}

const authService = new AuthService();
export default authService;
