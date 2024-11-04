import React, { useState } from "react";
import Sidebar from "../sidebar/Sidebar";
import ImageCard from "./ImageCard";
import Slider from "../slider/Slider";
import { useOutletContext } from "react-router-dom";

function Home() {
  const { searchQuery } = useOutletContext();
  const [selectGategories, setSelectGetegories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });

  const handleCategoriesChange = (categories) => {
    setSelectGetegories(categories);
    // console.log("Selected Categories:", categories);
  };

  const handlePriceRange = (price) => {
    setPriceRange(price);
  };

  return (
    <div>
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="relative">
          <Slider />
        </div>

        <div className="flex lg:flex-row flex-col mt-6">
          {/* Sidebar section */}
          <div className="lg:w-1/4 mt-3 lg:mb-0">
            <Sidebar
              onChangeCategories={handleCategoriesChange}
              onChangePriceRange={handlePriceRange}
            />
          </div>

          {/* Content section */}
          <div className=" lg:w-3/4 lg:flex-row">
            {/* ImageCard component */}
            <ImageCard
              search={searchQuery}
              categories={selectGategories}
              priceRange={priceRange}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
