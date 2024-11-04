import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import storageService from "../appwrite/conf";
import config from "../config/config";
import authService from "../appwrite/auth";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
function Order() {
  const [fetchedOrderData, setFetchedOrderData] = useState([]); // State to hold fetched order data

  useEffect(() => {
    const fetchData = async () => {
      try {
        await authService.getCurrentUser();

        const response = await storageService.fetchCartItems(
          config.appwriteCollectionCheckOutId
        );
        // console.log(response);

        // Assuming response contains the order data, update the state
        setFetchedOrderData(response); // Set the fetched data to state
      } catch (error) {
        console.log("Display error");
      }
    };
    fetchData();
  }, []);

  // Use fetchedOrderData to display the order summary
  return (
    <>
      <div className="bg-gray-100 px-5 py-6 md:px-8">
        <div className="bg-slate-300 p-6 rounded-xl shadow mt-3">
          {fetchedOrderData && fetchedOrderData.length > 0 ? (
            <>
              <h3 className="text-lg font-semibold text-gray-900">
                Order Summary
              </h3>
              <p className="text-gray-700 mb-4"></p>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                        Product Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                        Total Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                        Status
                      </th>
                      {/* <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                        Action
                      </th> */}
                      <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                        Order Detail
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {fetchedOrderData.map((item) => (
                      <tr key={item.orderId || item.id}>
                        <td>#{item.orderId}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="hover:text-red-600 font-bold">
                            {item.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-sm text-gray-900">
                          ${item.subtotal}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-green-800">Pending...</span>
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap">
                          <button className="bg-red-500 p-2 text-white font-mono rounded-sm">
                            Cancelled
                          </button>
                        </td> */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <NavLink to={`/order-detail/${item.orderId}`}>
                            <button className="bg-red-500 p-2 text-white font-mono rounded-sm">
                              Detail
                            </button>
                          </NavLink>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No items in the cart.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default Order;
