import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addCart } from "../reduxStore/CartSlice";
import config from "../config/config";
import storageService from "../appwrite/conf";
import authService from "../appwrite/auth";

function CardDetail() {
  const [selectProduct, setSelectProduct] = useState(null);
  const { id } = useParams();
  const dispatch = useDispatch();
  const authenticate = useSelector((auth) => auth.cart.isAuthenticated);
  const cartItems = useSelector((state) => state.cart.cartItems);

  useEffect(() => {
    const fetchProductDetail = async () => {
      if (id) {
        const ApiUrl = `https://fakestoreapi.com/products/${id}`;

        try {
          const response = await fetch(ApiUrl);
          if (!response.ok) {
            throw new Error("Network response was not ok.");
          }
          const data = await response.json();
          setSelectProduct(data);
        } catch (error) {
          setSelectProduct({ error: error.message });
        }
      }
    };
    fetchProductDetail();
  }, [id]);

  const handleAddCart = async (product) => {
    if (authenticate) {
      try {
        const userId = await authService.getCurrentUser();

        if (!userId) {
          throw new Error("User must be  login to add cart item");
        }

        const itemWithUserId = {
          ...product,
          userId,
          price: product.price.toString(),
          quantity: 1,
        };

        const response = await storageService.addCartItems(
          config.appwriteCollectionId,
          itemWithUserId
        );
        dispatch(
          addCart({ ...product, quantity: 1, documentId: response.$id })
        );
      } catch (error) {
        console.log("Can't be add Cart :: error", error);
      }
    } else {
      alert("Please Login");
    }
  };

  const isProductInCart = cartItems.some(
    (item) => item.id === selectProduct?.id
  );

  if (!selectProduct) return <p>Loading...</p>;

  return (
    <section className="overflow-hidden">
      <div className="mx-auto max-w-7xl px-2 py-10 lg:px-0">
        <div className="flex flex-col lg:flex-row lg:space-x-8">
          {/* Image Section */}
          <div className="mb-6 flex-shrink-0 overflow-hidden md:mb-8 lg:mb-0 w-full lg:w-1/2">
            <div className="relative h-64 lg:h-auto">
              <img
                alt={selectProduct.title}
                src={selectProduct.image}
                className="object-contain w-full h-full"
              />
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col w-full lg:w-1/2">
            <div className="pb-5">
              <h2 className="text-lg font-semibold md:text-xl xl:text-2xl">
                {selectProduct.title}
              </h2>
              <div className="mt-6">
                <p className="text-sm">{selectProduct.description}</p>
                <p className="mt-4 text-2xl font-semibold">
                  Price: ${selectProduct.price}
                </p>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-semibold">Ratings:</h3>
                <div className="flex items-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`text-yellow-500 ${
                        selectProduct.rating?.rate > i
                          ? "fill-yellow-500"
                          : "fill-none"
                      }`}
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  ))}
                  <span className="ml-3 text-sm font-medium">
                    {selectProduct.rating?.count} Reviews
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-2 pt-0.5">
              <h4 className="text-15px mb-3 font-normal capitalize text-opacity-70">
                Available in:
              </h4>
              <ul className="flex flex-wrap space-x-2">
                {["8 UK", "9 UK", "10 UK"].map((size) => (
                  <li
                    key={size}
                    className="md:text-15px mb-2 flex h-9 cursor-pointer items-center justify-center rounded border p-1 px-3 text-sm font-medium transition duration-200 ease-in-out md:mb-3 md:h-10"
                  >
                    {size}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2.5 pt-1.5 md:space-y-3.5 lg:pt-3 xl:pt-4">
              {isProductInCart ? (
                <button
                  type="button"
                  className="w-full rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                  disabled
                >
                  Already in Cart
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAddCart(selectProduct)}
                  className="w-full rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                >
                  Add to Cart
                </button>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-3"
                  >
                    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
                  </svg>
                  <span className="block">Wishlist</span>
                </button>
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-3"
                  >
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                    <polyline points="16 6 12 2 8 6"></polyline>
                    <line x1="12" y1="2" x2="12" y2="15"></line>
                  </svg>
                  <span className="block">Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CardDetail;
