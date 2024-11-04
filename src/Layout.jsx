import React, { useState } from "react";
import Header from "./components/Header";
import { Outlet } from "react-router-dom";
import Footer from "./components/Footer";

function Layout() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className=" bg-[#F9F6EE]">
      <Header onSearch={handleSearch} />
      <main>
        <Outlet context={{ searchQuery }} />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
