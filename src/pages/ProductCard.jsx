import React from "react";
import {
  removeCart,
  increaseQuantity,
  decreaseQuantity,
} from "../reduxStore/CartSlice";
import { useSelector, useDispatch } from "react-redux";
import RelatedProuducts from "./RelatedProuducts";
import Payment from "./Payment";
import { NavLink } from "react-router-dom";
import storageService from "../appwrite/conf";
import config from "../config/config";

function ProductCard() {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.cartItems) || [];

  const handleRemoveCart = async (id) => {
    try {
      const cartItem = items.find((item) => item.id == id);
      if (cartItem) {
        await storageService.removeCartItem(
          config.appwriteCollectionId,
          cartItem.documentId
        );
        dispatch(removeCart(id));
      }
    } catch (error) {
      console.error("Error removing cart item:", error);
    }
  };

  const handleIncrease = async (product) => {
    dispatch(increaseQuantity({ id: product.id, quantity: 1 }));
    try {
      await storageService.updateCartItem(
        config.appwriteCollectionId,
        product.documentId,
        { quantity: (parseInt(product.quantity) + 1).toString() }
      );
    } catch (error) {
      console.log("Product items Cannot be :: increase", error);
    }
  };

  const handleDecrease = async (product) => {
    const updateQuantity = parseInt(product.quantity) - 1; // Numerical decrement
    if (updateQuantity < 1) return; // Prevent going below 1
    dispatch(
      decreaseQuantity({ id: product.id, quantity: updateQuantity.toString() })
    );
    try {
      await storageService.updateCartItem(
        config.appwriteCollectionId,
        product.documentId,
        { quantity: updateQuantity.toString() }
      );
    } catch (error) {
      console.log("Error decrease cart Items :: error ", error);
    }
  };

  return (
    <section className="bg-gray-50 py-8 antialiased dark:bg-gray-900 md:py-16 forced-color-adjust-auto">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
          Shopping Cart
        </h2>
        <div className="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
          <div className="mx-auto w-full flex-none lg:max-w-2xl xl:max-w-4xl">
            {items && items.length > 0 ? (
              items.map((item) => (
                <div key={item.id} className="space-y-6">
                  <div className="rounded-lg border mb-2 border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-6">
                    <div className="space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">
                      {/* Wrap the image with NavLink */}
                      <NavLink
                        to={`/products/${item.id}`}
                        className="shrink-0 md:order-1"
                      >
                        <div>
                          <img
                            className="h-20 w-20 dark:hidden"
                            src={item.image}
                            alt={item.title}
                          />
                        </div>
                      </NavLink>

                      <label htmlFor="counter-input" className="sr-only">
                        Choose quantity:
                      </label>
                      <div className="flex items-center justify-between md:order-3 md:justify-end">
                        <div className="flex items-center">
                          <button
                            type="button"
                            id="decrement-button"
                            onClick={() => handleDecrease(item)}
                            data-input-counter-decrement="counter-input"
                            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-gray-300 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700"
                          >
                            <svg
                              className="h-2.5 w-2.5 text-gray-900 dark:text-white"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 18 2"
                            >
                              <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M1 1h16"
                              />
                            </svg>
                          </button>
                          <input
                            type="text"
                            id="counter-input"
                            data-input-counter
                            className="w-10 shrink-0 border-0 bg-transparent text-center text-sm font-medium text-gray-900 focus:outline-none focus:ring-0 dark:text-white"
                            placeholder=""
                            value={item.quantity}
                            readOnly
                          />
                          <button
                            type="button"
                            id="increment-button"
                            onClick={() => handleIncrease(item)}
                            data-input-counter-increment="counter-input"
                            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-gray-300 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700"
                          >
                            <svg
                              className="h-2.5 w-2.5 text-gray-900 dark:text-white"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 18 18"
                            >
                              <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 1v16M1 9h16"
                              />
                            </svg>
                          </button>
                        </div>
                        <div className="text-end md:order-4 md:w-32">
                          <p className="text-base font-bold text-gray-900 dark:text-white">
                            ${item.price}
                          </p>
                        </div>
                      </div>

                      <div className="w-full min-w-0 flex-1 space-y-4 md:order-2 md:max-w-md">
                        {/* Wrap the title with NavLink */}
                        <NavLink to={`/products/${item.id}`}>
                          {" "}
                          {/* Update path here */}
                          <p className="text-base font-medium text-gray-900 hover:underline dark:text-white">
                            {item.title}
                          </p>
                        </NavLink>

                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 hover:underline dark:text-gray-400 dark:hover:text-white"
                          >
                            <svg
                              className="me-1.5 h-5 w-5"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12.01 6.001C6.5 1 1 8 5.782 13.001L12.011 20l6.23-7C23 8 17.5 1 12.01 6.002Z"
                              />
                            </svg>
                            Add to Favorites
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveCart(item.id)}
                            className="inline-flex items-center text-sm font-medium text-red-600 hover:underline dark:text-red-500"
                          >
                            <svg
                              className="me-1.5 h-5 w-5"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18 17.94 6M18 18 6.06 6"
                              />
                            </svg>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">
                No items in the cart.
              </p>
            )}
          </div>

          {/* Order Summary */}
          <div className="flex-shrink-0 w-full lg:w-[320px] lg:ml-8 xl:ml-10">
            <Payment />
          </div>
        </div>

        {/* People also bought */}
        {/* <div className="mt-8">
            <RelatedProuducts />
          </div> */}
      </div>
    </section>
  );
}

export default ProductCard;
