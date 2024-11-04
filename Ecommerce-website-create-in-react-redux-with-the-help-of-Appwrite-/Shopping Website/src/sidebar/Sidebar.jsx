import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { HiBars3CenterLeft } from "react-icons/hi2";
import { FaBars } from "react-icons/fa";

function Sidebar({ onChangeCategories, onChangePriceRange }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const ApiUrl = "https://fakestoreapi.com/products/categories";
      try {
        const response = await fetch(ApiUrl);
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    const isChecked = e.target.checked;

    setSelectedCategories((prevCategories) => {
      const updatedCategories = isChecked
        ? [...prevCategories, category]
        : prevCategories.filter((cat) => cat !== category);

      onChangeCategories(updatedCategories);
      return updatedCategories;
    });
  };

  const handlePriceChange = (e) => {
    const newMaxPrice = e.target.value;
    setPriceRange({ min: 0, max: newMaxPrice });
    console.log("Render the Price", { min: 0, max: newMaxPrice });
    onChangePriceRange({ min: 0, max: newMaxPrice });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: 0, max: 1000 });
    onChangeCategories([]);
    onChangePriceRange({ min: 0, max: 1000 });
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-2 z-50 text-xl text-black p-2 rounded"
      >
        {isSidebarOpen ? <IoMdClose size={24} /> : <FaBars size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`lg:block fixed top-2 left-0 w-64 h-[calc(150vh-1rem)] bg-white z-10 overflow-y-auto transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 lg:translate-x-0 lg:relative lg:w-64 lg:h-[calc(90vh-1rem)]`}
      >
        <div className="h-full px-3 py-2 bg-gray-200 rounded-xl">
          <ul className="mt-auto">
            {/* Categories */}
            <li className="sidebar-list-item mt-12">
              <h2 className="text-lg font-medium text-gray-800 px-4 border-gray-200 border-b-2">
                Categories
              </h2>
              <ul className="mt-12 px-4">
                {categories.map((category) => (
                  <li className="mb-2" key={category}>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        value={category}
                        onChange={handleCategoryChange}
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                      <span className="ml-3 text-gray-700 text-xl font-semibold">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </li>

            {/* Brand Section */}
            {/* <li className="sidebar-list-item mt-8">
              <h2 className="text-lg font-medium text-gray-800 px-4">Brand</h2>
              <ul className="mt-2 px-4">
                {["Apple", "Samsung", "Adidas"].map((brand) => (
                  <li className="mb-2" key={brand}>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        value={brand}
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                      <span className="ml-3 text-gray-700 text-xl font-semibold">
                        {brand}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </li> */}

            {/* Price Range */}
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-800 px-4">
                Price Range
              </h2>
              <div className="flex items-center gap-x-1 mt-4 px-4">
                <input
                  type="range"
                  min={0}
                  max={1000}
                  value={priceRange.max}
                  onChange={handlePriceChange}
                  className="cursor-pointer w-full h-2 rounded-lg appearance-none"
                />
                <label className="flex-none">Max: ${priceRange.max}</label>
              </div>
            </div>

            <div>
              <button
                onClick={clearFilters}
                className="w-full p-2 bg-gray-600 text-white rounded-lg mt-4"
              >
                Clear Filter
              </button>
            </div>

            {/* Size Section */}
            {/* <li className="sidebar-list-item mt-8">
              <h2 className="text-lg font-medium text-gray-800 px-4">Size</h2>
              <ul className="mt-2 px-4">
                {["Small", "Medium", "Large"].map((size) => (
                  <li className="mb-2" key={size}>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        value={size}
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                      <span className="ml-3 text-gray-700 text-xl font-semibold">
                        {size}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </li> */}

            {/* Age Range Section */}
            {/* <li className="sidebar-list-item mt-8">
              <h2 className="text-lg font-medium text-gray-800 px-4">Age Range</h2>
              <ul className="mt-2 px-4">
                {["2 to 4 Year", "5 to 7 Year", "8 to 13 Year"].map(
                  (ageRange) => (
                    <li className="mb-2" key={ageRange}>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          value={ageRange}
                          className="form-checkbox h-5 w-5 text-blue-600"
                        />
                        <span className="ml-3 text-gray-700 text-xl font-semibold">
                          {ageRange}
                        </span>
                      </label>
                    </li>
                  )
                )}
              </ul>
            </li> */}
          </ul>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
