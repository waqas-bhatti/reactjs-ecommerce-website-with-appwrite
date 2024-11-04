import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCart, removeCart, storedCartItems } from "../reduxStore/CartSlice";
import { NavLink } from "react-router-dom";
import RiseLoader from "react-spinners/RiseLoader";
import { FaCartPlus } from "react-icons/fa6";
import { FiMinus } from "react-icons/fi";
import storageService from "../appwrite/conf";
import config from "../config/config";

function ImageCard({ search, categories, priceRange }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  // const [cartItems, setCartItems] = useState([]);
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cartItems);
  const isAuthenticated = useSelector((state) => state.cart.isAuthenticated);

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      const ApiUrl = "https://fakestoreapi.com/products";
      setLoading(true);
      try {
        const response = await fetch(ApiUrl);
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.log("Product fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ============Handle search, categories, and price range filtering=========
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    setSearching(true);

    const timeout = setTimeout(() => {
      let updatedProducts = [...products];

      if (search) {
        updatedProducts = updatedProducts.filter((product) =>
          product.title.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (categories && categories.length > 0) {
        updatedProducts = updatedProducts.filter((product) =>
          categories.includes(product.category)
        );
      }

      if (priceRange) {
        updatedProducts = updatedProducts.filter(
          (product) =>
            product.price >= priceRange.min && product.price <= priceRange.max
        );
      }

      setFilteredProducts(updatedProducts);
      setSearching(false);
    }, 500);

    setSearchTimeout(timeout);

    return () => clearTimeout(timeout);
  }, [search, categories, priceRange, products]);

  // ----------------------------Add product to cart----------------
  const handleAddCart = async (item) => {
    if (!isAuthenticated) {
      alert("Please login to add items to cart");
      return;
    }

    try {
      const itemWithQuantity = {
        ...item,
        price: item.price.toString(),
        quantity: 1,
      };

      const response = await storageService.addCartItems(
        config.appwriteCollectionId,
        itemWithQuantity
      );

      dispatch(addCart({ ...item, quantity: 1, documentId: response.$id }));
      console.log(`${item.title} has been added to your cart!`); // User feedback
    } catch (error) {
      console.error("Error adding item to cart:", error);
      alert(`Failed to add ${item.title} to cart: ${error.message}`);
    }
  };

  // ---------------------------Remove product from cart------------------
  const handleRemoveCart = async (item) => {
    try {
      const cartItem = cartItems.find((cartItem) => cartItem.id === item.id);
      if (!cartItem) {
        throw new Error("Cart item not found");
      }
      const documentId = cartItem.documentId;
      await storageService.removeCartItem(
        config.appwriteCollectionId,
        documentId
      );
      dispatch(removeCart(item.id));
      // setCartItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (error) {
      console.error("Error removing cart item:", error);
    }
  };

  // ------------------fetch cart after login ------------------
  // Fetch cart after login
  useEffect(() => {
    const fetchCartAfterLogin = async () => {
      if (isAuthenticated) {
        try {
          const cartItemsAppwrite = await storageService.fetchCartItems(
            config.appwriteCollectionId
          );

          // Check if we have the right items
          if (cartItemsAppwrite) {
            const formattedCartItems = cartItemsAppwrite.map((item) => ({
              id: item.id,
              title: item.title,
              image: item.image,
              price: item.price.toString(),
              quantity: item.quantity.toString(),
              documentId: item.$id,
            }));
            dispatch(storedCartItems(formattedCartItems)); // Dispatching formatted items
          }
        } catch (error) {
          console.error("Fetching cart items error:", error);
        }
      }
    };

    fetchCartAfterLogin();
  }, [isAuthenticated, dispatch]);

  return (
    <div className="relative">
      <div>
        {search && filteredProducts.length > 0 && (
          <p className="mb-4 text-lg font-semibold">
            {filteredProducts.length} item(s) found ::{" "}
            <span className="text-blue-800">Search results for : </span>
            <span className="text-blue-800">"{search}"</span>
          </p>
        )}
      </div>
      {loading || searching ? (
        <div className="flex items-center justify-center h-64">
          <RiseLoader
            color={"blue"}
            loading={loading || searching}
            size={30}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => {
              const isInCart = cartItems.some((item) => item.id === product.id);
              const rating = product.rating?.rate || 0;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-lg overflow-hidden shadow-xl flex flex-col"
                >
                  <NavLink to={`products/${product.id}`}>
                    <div className="relative h-60">
                      <img
                        className="w-full p-1 h-full"
                        src={product.image}
                        alt={product.title}
                      />
                    </div>
                  </NavLink>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold mb-2 border-b border-blue-100 line-clamp-1">
                      {product.title}
                    </h3>
                    <div className="flex items-center mt-2">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={`text-yellow-500 ${
                            rating > i ? "fill-yellow-500" : "fill-none"
                          }`}
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      ))}
                      <span className="ml-3 text-sm font-medium">
                        {rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-gray-900 font-bold">
                        ${product.price}
                      </span>
                      <button
                        onClick={() =>
                          isInCart
                            ? handleRemoveCart(product)
                            : handleAddCart(product)
                        }
                        className={`px-3 py-1 rounded-md ${
                          isInCart
                            ? " text-yellow bg-yellow-300"
                            : " text-yellow hover:bg-primary-600"
                        } focus:outline-none focus:bg-primary-600`}
                      >
                        {isInCart ? (
                          <FiMinus color="blue" size={24} />
                        ) : (
                          <FaCartPlus size={24} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p>No products found</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ImageCard;
