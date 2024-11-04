import React, { useState, useEffect } from "react";
import { useParams, NavLink } from "react-router-dom";
import storageService from "../appwrite/conf";
import config from "../config/config";

function OrderDetails() {
  const { orderId } = useParams(); // Get orderId from the URL
  const [orderData, setOrderData] = useState(null); // To store specific order details
  const [addressData, setAddressData] = useState(null); // To store user's address details
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    const fetchOrderAndAddressDetails = async () => {
      try {
        // Fetch all cart items for the current user
        const cartResponse = await storageService.fetchCartItems(
          config.appwriteCollectionCheckOutId // Collection ID for cart items
        );

        // Find the specific order based on orderId
        const specificOrder = cartResponse.find(
          (item) => item.orderId === orderId
        );

        if (!specificOrder) {
          throw new Error("Order not found.");
        }

        setOrderData(specificOrder); // Set the specific order data

        // Fetch the user's address (assuming address is saved in a different collection)
        const addressResponse = await storageService.fetchCartItems(
          config.appwriteCollectionSaveAddressId // Collection ID for address
        );

        // Assuming only one address exists per user; if multiple addresses exist, adapt as needed
        if (addressResponse.length > 0) {
          setAddressData(addressResponse[0]); // Set the first address found
        }

        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error("Error fetching order and address details:", error);
        setError(
          "Failed to fetch order and address details. Please try again."
        );
        setLoading(false); // Stop loading in case of error
      }
    };

    fetchOrderAndAddressDetails(); // Call the function to fetch data
  }, [orderId]); // Run effect when orderId changes

  if (loading) {
    return <p className="text-lg text-gray-500">Loading...</p>; // Show a loading message while fetching data
  }

  if (error) {
    return <p className="text-lg text-red-500">{error}</p>; // Show error message if something goes wrong
  }

  if (!orderData) {
    return <p className="text-lg text-gray-500">No order details found.</p>; // Show this if no data is fetched
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        {/* Store and Product Information */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex space-x-4  ">
            {/* Product Image */}

            <h3 className="hover:text-red-600 font-bold">{orderData.title}</h3>

            <div>
              <p className="text-sm">{orderData.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">${orderData.subtotal}</p>
            <p className="text-sm text-gray-500">Qty: {orderData.quantity}</p>
          </div>
        </div>

        {/* Order Information */}
        <div className="bg-gray-50 p-3 rounded-lg mb-4">
          <p className="text-sm text-gray-600">
            Order ID : {orderId}
            <br />
            Placed on 12 Sep 2024 23:02:05
            <br />
            Paid by Cash On Delivery
          </p>
        </div>

        {addressData ? (
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <p className="font-semibold text-lg">
              User Name: {addressData.fullname}
            </p>
            <p className="flex items-center">
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full mr-2">
                HOME
              </span>
              {addressData.address}, {addressData.city}, {addressData.province},{" "}
              {addressData.postalcode}, {addressData.country}
            </p>
          </div>
        ) : (
          <p className="text-lg text-gray-500">
            No address information available.
          </p>
        )}

        {/* Total Summary */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 flex justify-center items-center mt-6">
            <NavLink to="/">
              <button className="bg-red-500 text-white rounded-lg font-normal p-3">
                Continue Shopping
              </button>
            </NavLink>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow-lg w-1/3">
            <h4 className="text-lg font-semibold mb-4">Total Summary</h4>
            <div className="flex justify-between mb-2">
              <p>Subtotal ({orderData.quantity})</p>
              <p>Rs. {orderData.subtotal}</p>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between mb-4">
              <p className="font-semibold">Total</p>
              <p className="font-semibold">Rs. {orderData.subtotal}</p>
            </div>
            <p className="text-sm text-gray-600">Paid by Cash on Delivery</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
