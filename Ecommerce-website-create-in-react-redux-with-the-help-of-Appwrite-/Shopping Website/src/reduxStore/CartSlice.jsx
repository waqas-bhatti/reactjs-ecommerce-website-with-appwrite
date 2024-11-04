import { createSlice } from "@reduxjs/toolkit";

// Load the initial state from localStorage
const loadInitialState = () => {
  let cartItems = [];
  let confirmedProducts = [];
  let isAuthenticated = false;
  let checkoutAddress = {};
  let orderAddress = {};
  let orderDetail = {};
  let user = null;

  const isValidJSON = (str) => {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  };

  try {
    const storedCartItems = localStorage.getItem("cartItems");
    cartItems =
      storedCartItems && isValidJSON(storedCartItems)
        ? JSON.parse(storedCartItems)
        : [];

    const storedConfirmedProducts = localStorage.getItem("confirmedProducts");
    confirmedProducts =
      storedConfirmedProducts && isValidJSON(storedConfirmedProducts)
        ? JSON.parse(storedConfirmedProducts)
        : [];

    const storedCheckoutAddress = localStorage.getItem("checkoutAddress");
    checkoutAddress =
      storedCheckoutAddress && isValidJSON(storedCheckoutAddress)
        ? JSON.parse(storedCheckoutAddress)
        : {};
    const storedOrderAddress = localStorage.getItem("orderAddress");
    checkoutAddress =
      storedCheckoutAddress && isValidJSON(storedOrderAddress)
        ? JSON.parse(storedOrderAddress)
        : {};

    isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

    const storedUser = localStorage.getItem("user");
    user =
      storedUser && isValidJSON(storedUser) ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Failed to load from localStorage", error);
  }

  return {
    cartItems,
    confirmedProducts,
    checkoutAddress, // Load the checkout address from localStorage
    isAuthenticated,
    user,
  };
};

const initialState = loadInitialState();

// Save data to localStorage
const saveItemsToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage`, error);
  }
};

// Remove data from localStorage
const clearLocalStorage = (keys) => {
  try {
    keys.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error("Failed to clear data from localStorage", error);
  }
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addCart: (state, action) => {
      const { id, ...rest } = action.payload;
      const existingItem = state.cartItems.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity++;
      } else {
        state.cartItems.push({ id, quantity: 1, ...rest });
      }

      saveItemsToLocalStorage("cartItems", state.cartItems);
    },

    removeCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (item) => item.id !== action.payload
      );
      saveItemsToLocalStorage("cartItems", state.cartItems);
    },

    storedCartItems: (state, action) => {
      state.cartItems = action.payload;
      saveItemsToLocalStorage("cartItems", state.cartItems);
    },

    setCheckoutAddress: (state, action) => {
      state.checkoutAddress = action.payload;
      saveItemsToLocalStorage("checkoutAddress", state.checkoutAddress); // Sync with localStorage
    },

    setOrderAddress: (state, action) => {
      state.orderAddress = action.payload;
      saveItemsToLocalStorage("orderAddress", state.orderAddress);
    },

    increaseQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const existingItem = state.cartItems.find((item) => item.id === id);

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity <= 10 && quantity > 0) {
          existingItem.quantity = newQuantity;
        }
      }

      saveItemsToLocalStorage("cartItems", state.cartItems);
    },

    decreaseQuantity: (state, action) => {
      const { id } = action.payload;
      const existingItem = state.cartItems.find((item) => item.id === id);

      if (existingItem && existingItem.quantity > 1) {
        existingItem.quantity--;
      } else if (existingItem && existingItem.quantity === 1) {
        state.cartItems = state.cartItems.filter((item) => item.id !== id); // Remove item if qty = 0
      }

      saveItemsToLocalStorage("cartItems", state.cartItems);
    },

    login: (state, action) => {
      state.isAuthenticated = true;
      state.user = { ...action.payload };

      saveItemsToLocalStorage("isAuthenticated", true);
      saveItemsToLocalStorage("user", action.payload);
    },

    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.cartItems = [];
      state.confirmedProducts = [];
      state.checkoutAddress = {};

      clearLocalStorage([
        "isAuthenticated",
        "user",
        "cartItems",
        "confirmedProducts",
        "orderAddress",
        "checkoutAddress",
      ]);
    },
  },
});

export const {
  addCart,
  removeCart,
  storedCartItems,
  setCheckoutAddress,
  setOrderAddress,
  increaseQuantity,
  decreaseQuantity,
  login,
  logout,
} = cartSlice.actions;

export default cartSlice.reducer;
