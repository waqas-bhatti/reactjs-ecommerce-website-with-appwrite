const config = {
  appwriteUrl: String(import.meta.env.VITE_APPWRITE_URL),
  appwriteProjecID: String(import.meta.env.VITE_APPWRITE_PROJECT_ID),
  appwriteDatabaseId: String(import.meta.env.VITE_APPWRITE_DATABASE_ID),
  appwriteCollectionId: String(import.meta.env.VITE_APPWRITE_COLLECTION_ID),
  appwriteCollectionSaveAddressId: String(
    import.meta.env.VITE_APPWRITE_COLLECTION_SAVE_ADDRESS_ID
  ),
  appwriteCollectionCheckOutId: String(
    import.meta.env.VITE_APPWRITE_COLLECTION_CHECKOUT_ID
  ),
  appwriteBucketId: String(import.meta.env.VITE_APPWRITE_BUCKET_ID),
};

export default config;
