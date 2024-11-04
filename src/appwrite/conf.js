import { Client, Databases, Query, ID, Account } from "appwrite";
import { v4 as uuidv4 } from "uuid";
import config from "../config/config";
import authService from "./auth";
export class StorageServices {
  client = new Client();
  databases;
  account;

  constructor() {
    this.client
      .setEndpoint(config.appwriteUrl)
      .setProject(config.appwriteProjecID);
    this.databases = new Databases(this.client);
    this.account = new Account(this.client);
  }

  async addCartItems(collectionId, item) {
    try {
      const userId = await authService.getCurrentUser();
      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Query the collection to check if this productId is already in the cart for this user
      const existingCartItems = await this.databases.listDocuments(
        config.appwriteDatabaseId,
        collectionId,
        [
          Query.equal("userId", userId),
          Query.equal("id", item.id), // Check if productId (item.id) is already in the user's cart
        ]
      );

      // If the product is already in the user's cart, return or handle as needed
      if (existingCartItems.total > 0) {
        throw new Error("This item is already in your cart.");
      }

      // If no existing cart item, add a new one with a unique documentId
      const data = {
        id: item.id, // productId (assuming this is integer 0-255)
        title: item.title,
        price: item.price.toString(),
        image: item.image,
        userId: userId, // Ensure cart item is tied to this user
        quantity: item.quantity.toString(),
      };

      const documentId = ID.unique(); // Generate a unique document ID for each entry

      const response = await this.databases.createDocument(
        config.appwriteDatabaseId,
        collectionId,
        documentId, // Use unique document ID to avoid conflicts
        data
      );

      return response;
    } catch (error) {
      console.error("Error storing cart item:", error);
      throw new Error(`Failed to store cart item: ${error.message}`);
    }
  }

  async removeCartItem(collectionId, documentId) {
    try {
      if (typeof documentId !== "string") {
        throw new Error("Invalid documentId: Must be a string.");
      }
      const response = await this.databases.deleteDocument(
        config.appwriteDatabaseId,
        collectionId,
        documentId
      );
      return response;
    } catch (error) {
      console.log("Error removing cart Items:", error);
      throw new Error("Failed to remove cart item from Appwrite");
    }
  }

  async updateCartItem(collectionId, documentId, updateData) {
    try {
      // Log the incoming data to ensure it's correct
      // console.log("Updating Cart Item:", { documentId, updateData });

      // Check if documentId is valid
      if (!documentId) {
        throw new Error(
          "Invalid document ID. Cannot update without a valid document ID."
        );
      }

      // Attempt to update the document
      const response = await this.databases.updateDocument(
        config.appwriteDatabaseId,
        collectionId,
        documentId,
        updateData
      );

      // Log the response to ensure the update was successful
      // console.log("Cart item updated successfully:", response);

      return response;
    } catch (error) {
      // Log the error for debugging purposes
      console.error("Error updating cart item:", error);
      throw new Error("Failed to update cart item");
    }
  }

  async updateCartAddress(collectionId, documentId, updateData) {
    try {
      // Ensure updateData contains only the fields you want to update
      const validFields = {
        fullname: updateData.fullname,
        email: updateData.email,
        address: updateData.address,
        cardnumber: updateData.cardnumber,
        city: updateData.city,
        province: updateData.province,
        postalcode: updateData.postalcode,
      };

      // Log the data being sent to Appwrite for debugging
      // console.log("Updating Cart Item:", { documentId, validFields });

      const response = await this.databases.updateDocument(
        config.appwriteDatabaseId,
        collectionId,
        documentId,
        validFields // Pass only valid fields here
      );

      // console.log("Cart item updated successfully:", response);
      return response;
    } catch (error) {
      console.error("Error updating cart item:", error);
      throw new Error("Failed to update cart item");
    }
  }

  async saveAddress(collectionId, item) {
    try {
      const userId = await authService.getCurrentUser(); // Fetch current user
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const data = {
        userId: userId,
        fullname: item.fullname,
        email: item.email,
        address: item.address,
        cardnumber: item.cardnumber.toString(),
        city: item.city,
        province: item.province,
        postalcode: item.postalcode,
      };

      const response = await this.databases.createDocument(
        config.appwriteDatabaseId,
        collectionId,
        ID.unique(), // Generate unique document ID
        data
      );

      return response; // Return the response
    } catch (error) {
      console.error("You data can't be saved in appwrite:", error);
      throw new Error("Failed to save address data");
    }
  }

  // async saveCheckOut(collectionId, items) {
  //   try {
  //     if (!items.every((item) => item.userId)) {
  //       throw new Error("Please make sure to confirm order");
  //     }

  //     const promises = items.map((item) => {
  //       const data = {
  //         orderId: String(orderId),
  //         title: item.title,
  //         price: item.price.toString(),
  //         userId: item.userId,
  //         quantity: item.quantity.toString(),
  //         subtotal: item.subtotal.toString(),
  //         // user_periority: !!item.User_periority,
  //       };
  //       const documentId = uuidv4();
  //       return this.databases.createDocument(
  //         config.appwriteDatabaseId,
  //         collectionId,
  //         documentId,
  //         data
  //       );
  //     });

  //     const responses = await Promise.all(promises);
  //     return responses;
  //   } catch (error) {
  //     console.log("Error saving data in Appwrite:", error);
  //   }
  // }

  async saveCheckout(collectionId, item, documentId = ID.unique()) {
    try {
      // Generate a 15-digit orderId
      const orderId = String(
        Math.floor(100000000000000 + Math.random() * 900000000000000)
      );

      const data = {
        orderId: orderId, // Ensure orderId is exactly 15 digits
        title: item.title,
        price: item.price.toString(),
        userId: item.userId,
        quantity: item.quantity.toString(),
        subtotal: item.subtotal.toString(),
      };

      return await this.databases.createDocument(
        config.appwriteDatabaseId,
        collectionId,
        documentId, // Use the provided or generated documentId
        data
      );
    } catch (error) {
      console.error("Error saving checkout data:", error); // Add error logging
      throw new Error("Failed to save checkout data");
    }
  }

  async fetchCartItems(collectionId) {
    try {
      const userId = await authService.getCurrentUser(); // Ensure you're getting the correct user
      const response = await this.databases.listDocuments(
        config.appwriteDatabaseId,
        collectionId,
        [Query.equal("userId", userId)] // Query by userId
      );

      return response.documents; // Return the documents fetched
    } catch (error) {
      console.error("Error fetching cart items:", error);
      throw new Error("Failed to fetch cart items");
    }
  }

  // Check if user email is registered by attempting a password recovery
  // async isEmailRegistered(email) {
  //   try {
  //     // Attempt to create a recovery process to check if the email is registered
  //     await this.account.createRecovery(
  //       email,
  //       "http://localhost:5173/reset-password/{userId}/{secret}"
  //     );

  //     // If successful, return true indicating the email exists
  //     return true;
  //   } catch (error) {
  //     if (error.code === 404) {
  //       // The email does not exist in Appwrite's auth system
  //       return false;
  //     }

  //     // Log any other errors for debugging
  //     console.error("Error during email registration check:", error);

  //     // Provide a general error message to avoid exposing internal details
  //     throw new Error(
  //       "An unexpected error occurred during email verification."
  //     );
  //   }
  // }

  // async updatePassword(userId, secret, newPassword) {
  //   try {
  //     await this.account.updateRecovery(userId, secret, newPassword);
  //     return true; // Indicate success
  //   } catch (error) {
  //     console.error("Error updating password:", error); // Add logging for debugging
  //     throw new Error(
  //       "Failed to update password. Please ensure the link is valid and try again."
  //     );
  //   }
  // }
}

const storageService = new StorageServices();
export default storageService;
