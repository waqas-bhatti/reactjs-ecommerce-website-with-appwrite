import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import Search from "./Search";
import { CiShoppingCart } from "react-icons/ci";
import { GrUserManager } from "react-icons/gr";
import { FaHome } from "react-icons/fa";
import { FcManager } from "react-icons/fc";
import { logout } from "../reduxStore/CartSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import authService from "../appwrite/auth";
import ClipLoader from "react-spinners/ClipLoader";

function Header({ onSearch }) {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.cart.isAuthenticated);
  const items = useSelector((state) => state.cart.cartItems);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Close the dropdown when clicking outside of it
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // When the component mounts or the authentication state changes, ensure proper UI updates
    if (!auth) {
      setDropdownOpen(false);
    }
  }, [auth]);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.logout(); // Ensure the logout request succeeds
      dispatch(logout()); // Clear authentication state in Redux
      console.log("Successful Logout");
      setLoading(false);

      // // Navigate to the home page after successful logout
      navigate("/", { replace: true }); // Use "replace" to avoid adding to history
    } catch (error) {
      console.error("Logout failed:", error);
      setLoading(false);
    }
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogin = () => {
    setLoading(true); // Start loading
    setTimeout(() => {
      setLoading(false); // Stop loading after 3 seconds (simulating login load)
      navigate("/login"); // Navigate to login after the loading period
    }, 300);
  };

  const handleDropdownOptionClick = () => {
    // Close the dropdown when any option is clicked
    setDropdownOpen(false);
  };

  return (
    <header className="shadow sticky z-50 top-0 bg-white border-b">
      <nav className="px-4 lg:px-6 py-2">
        <div className="flex justify-between items-center mx-auto max-w-screen-xl">
          {/* Logo */}
          <Link to="/" className="flex mx-8">
            <img
              src="https://img.freepik.com/free-vector/shopping-cart-realistic_1284-6011.jpg?t=st=1722341575~exp=1722345175~hmac=12bf7eef2c40e2d996c7e320a93145a9bdd569aac209d97bb3dc927ae1bf001a&w=740"
              className="h-12 lg:h-16 xl:h-20"
              alt="Logo"
            />
          </Link>

          {/* Search Bar (Visible on larger screens) */}
          <div className="hidden lg:block lg:w-1/2 xl:w-1/3">
            <Search
              onSearch={handleSearchChange}
              className="w-full pl-4 pr-4 py-2 text-sm text-gray-700"
            />
          </div>

          <div>
            {loading && (
              <ClipLoader color="#36d7b7" loading={loading} size={25} />
            )}
          </div>

          {/* Icons: Home, Cart, Login/Profile */}
          <div className="flex items-center space-x-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                ` ${
                  isActive ? "text-orange-700" : "text-gray-700"
                } hover:text-orange-700`
              }
            >
              <FaHome className="text-2xl text-gray-700" />
            </NavLink>

            <NavLink
              to="/cart"
              className={({ isActive }) =>
                `block text-base ${
                  isActive
                    ? "text-orange-700 border-b-2 border-orange-700"
                    : "text-gray-700"
                } hover:text-orange-700`
              }
            >
              <div className="relative w-10 h-10 flex items-center">
                <CiShoppingCart className="text-2xl text-gray-700" />
                <div className="absolute top-0 right-0 bg-yellow-400 rounded-full w-6 h-6 flex items-center justify-center">
                  <span className="text-black font-bold text-xs">
                    {items.length}
                  </span>
                </div>
              </div>
            </NavLink>

            {!auth ? (
              <button
                className="flex items-center text-base text-gray-700 hover:text-orange-700"
                onClick={handleLogin}
              >
                {loading ? (
                  <ClipLoader color="#36d7b7" loading={loading} size={25} />
                ) : (
                  <GrUserManager className="text-2xl text-gray-700" />
                )}
              </button>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  className="flex items-center text-gray-700 hover:text-orange-700"
                  onClick={toggleDropdown}
                >
                  <ClipLoader color="#36d7b7" loading={loading} size={25} />
                  <FcManager className="text-3xl text-gray-700" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 shadow-lg rounded-lg z-50">
                    <ul>
                      {/* <li>
                        <Link
                          to="/profile"
                          onClick={handleDropdownOptionClick}
                          className="block px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-100"
                        >
                          Profile
                        </Link>
                      </li> */}
                      <li>
                        <NavLink
                          to="/cart"
                          onClick={handleDropdownOptionClick}
                          className="block px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-100"
                        >
                          Product Cart
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/checkout-form"
                          onClick={handleDropdownOptionClick}
                          className="block px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-100"
                        >
                          Checkout Form
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/order-page"
                          onClick={handleDropdownOptionClick}
                          className="block px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-100"
                        >
                          Order
                        </NavLink>
                      </li>
                      <li>
                        <button
                          onClick={handleLogout}
                          className="block px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-100 w-full text-left"
                        >
                          {loading ? (
                            <ClipLoader
                              color="#36d7b7"
                              loading={loading}
                              size={25}
                            />
                          ) : (
                            "Logout"
                          )}
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-2 w-full lg:hidden">
          <Search
            onSearch={handleSearchChange}
            className="w-full pl-4 pr-4 py-2 text-sm text-gray-700"
          />
          {auth && (
            <div className="absolute">
              <button
                className="flex items-center text-gray-700 hover:text-orange-700"
                onClick={toggleDropdown}
              >
                {/* <span className="mr-2">{userName}</span> */}
                {/* <FcManager className="text-xl text-gray-700" /> */}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 shadow-lg rounded-lg z-50">
                  <ul>
                    <li>
                      <Link
                        to="/profile"
                        onClick={handleDropdownOptionClick}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Profile
                      </Link>
                    </li>
                    <li>
                      <NavLink
                        to="/cart"
                        onClick={handleDropdownOptionClick}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Product Cart
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/checkout-form"
                        onClick={handleDropdownOptionClick}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Checkout Form
                      </NavLink>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
