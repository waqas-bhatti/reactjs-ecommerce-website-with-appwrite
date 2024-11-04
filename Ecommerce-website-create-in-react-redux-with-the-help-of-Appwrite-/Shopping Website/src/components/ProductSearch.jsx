import React, { useState, useEffect } from "react";
import { addCart } from "../reduxStore/CartSlice";
import { useDispatch } from "react-redux";
import { NavLink } from "react-router-dom";

function ProductSearch() {
  const [searchProduct, setSearchProduct] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const dispatch = useDispatch();

  // Fetch products from the API
  useEffect(() => {
    const fetchData = async () => {
      const ApiUrl = "https://fakestoreapi.com/products";
      try {
        const response = await fetch(ApiUrl);
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data); // Initially show all products
      } catch (error) {
        console.log("Product fetch error", error);
      }
    };
    fetchData();
  }, []);

  // Filter products based on search input
  useEffect(() => {
    if (searchProduct) {
      const filteredProducts = products.filter((product) =>
        product.title.toLowerCase().includes(searchProduct.toLowerCase())
      );
      setFilteredProducts(filteredProducts);
    } else {
      setFilteredProducts(products);
    }
  }, [searchProduct, products]);

  const handleAddCart = (item) => {
    dispatch(addCart({ ...item, quantity: 1 }));
  };

  return (
    <div>
      <form
        onSubmit={(e) => e.preventDefault()} // Prevent default form submission
        className="max-w-lg mx-auto"
      >
        <div className="flex">
          <label
            htmlFor="categories"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          ></label>
          <select
            id="categories"
            className="bg-gray-50 border border-gray-300 rounded-l-lg text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="" disabled>
              Category
            </option>
            <option value="cloth">Cloth</option>
            <option value="fashion">Fashion</option>
            <option value="jewelry">Jewelry</option>
            <option value="other">Other</option>
          </select>

          <div className="relative w-full">
            <input
              type="search"
              id="search-dropdown"
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              className="block p-2.5 w-96 z-20 text-sm text-gray-900 bg-gray-50 rounded-e-lg border-s-gray-50 border-s-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-s-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500"
              placeholder="Search Mockups, Logos, Design Templates..."
              required
            />
            <button
              type="submit"
              className="absolute top-0 end-0 p-2.5 text-sm font-medium h-full text-white bg-blue-700 rounded-e-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              <svg
                className="w-4 h-4"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
              <span className="sr-only">Search</span>
            </button>
          </div>
        </div>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg overflow-hidden shadow-xl flex flex-col"
          >
            <NavLink to={`products/${product.id}`}>
              <div className="relative h-60">
                <img
                  className="w-full p-1 h-full "
                  src={product.image}
                  alt={product.title}
                />
              </div>
            </NavLink>
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="text-lg font-semibold mb-2 line-clamp-1">
                {product.title}
              </h3>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-gray-900 font-bold">
                  ${product.price}
                </span>
                <button
                  onClick={() => handleAddCart(product)}
                  className="px-3 py-1 bg-primary-500 text-black rounded-md hover:bg-primary-600 focus:outline-none focus:bg-primary-600"
                >
                  Add Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductSearch;
