import React, { useEffect } from "react";
import storageService from "../appwrite/conf";
import { useDispatch } from "react-redux";
import { setCartItems } from "../reduxStore/CartSlice";
import config from "../config/config";

export function LoadUserCart(userId) {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const cartItems = await storageService.fetchCartItems(
          config.appwriteCollectionId,
          userId
        );

        dispatch(setCartItems(cartItems));
      } catch (error) {
        console.log("Error Loading Cart :: error", error);
      }
    };
    if (userId) {
      fetchCartItems();
    }
  }, [userId, dispatch]);
}
