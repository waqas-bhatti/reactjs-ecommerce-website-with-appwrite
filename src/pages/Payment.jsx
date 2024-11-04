import React from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";

function Payment() {
  const cartItems = useSelector((state) => state.cart.cartItems);

  // Calculate total price
  const totalPrice = cartItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  // Example calculations for savings, store pickup, and tax
  const savings = 5; // Example savings
  const storePickup = 0; // Example store pickup
  const tax = totalPrice * 0.1; // Example tax calculation (10%)

  // Check if there are items in the cart
  const hasItems = cartItems.length > 0;

  return (
    <main className="mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-full">
      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
        <p className="text-xl font-semibold text-gray-900 dark:text-white">
          Order summary
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                Original price
              </dt>
              <dd className="text-base font-medium text-gray-900 dark:text-white">
                ${totalPrice.toFixed(2)}
              </dd>
            </dl>

            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                Savings
              </dt>
              <dd className="text-base font-medium text-green-600">
                -${savings.toFixed(2)}
              </dd>
            </dl>

            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                Store Pickup
              </dt>
              <dd className="text-base font-medium text-gray-900 dark:text-white">
                ${storePickup.toFixed(2)}
              </dd>
            </dl>

            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                Tax
              </dt>
              <dd className="text-base font-medium text-gray-900 dark:text-white">
                ${(totalPrice - savings + tax).toFixed(2)}
              </dd>
            </dl>
          </div>

          <dl className="flex items-center justify-between gap-4 border-t border-gray-200 pt-2 dark:border-gray-700">
            <dt className="text-base font-bold text-gray-900 dark:text-white">
              Total
            </dt>
            <dd className="text-base font-bold text-gray-900 dark:text-white">
              ${totalPrice - savings.toFixed(2)}
            </dd>
          </dl>
        </div>

        {hasItems ? (
          <NavLink to="/checkout-form">
            <div className="flex items-center justify-center gap-2">
              <div className="mt-5 flex justify-end pt-4">
                <button
                  type="submit"
                  className="rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                >
                  Checkout
                </button>
              </div>
            </div>
          </NavLink>
        ) : (
          <p className="text-center text-red-500">
            Please select a product to proceed to checkout.
          </p>
        )}
      </div>
    </main>
  );
}

export default Payment;
