import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { removeCart, setCheckoutAddress } from "../reduxStore/CartSlice";
import { useDispatch, useSelector } from "react-redux";
import config from "../config/config";
import storageService from "../appwrite/conf";
import authService from "../appwrite/auth";
import ClipLoader from "react-spinners/ClipLoader";
import { v4 as uuidv4 } from "uuid";

function CheckoutForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cartItems || []);
  const [editableAddress, setEditableAddress] = useState(state?.address || {});
  const [isEditing, setIsEditing] = useState(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [documentId, setDocumentId] = useState(null); // For tracking document ID in Appwrite
  const [loading, setLoading] = useState(false);
  const savedAddress = useSelector((state) => state.cart.checkoutAddress || {});

  useEffect(() => {
    // Pre-fill editableAddress with saved address from Redux when the component mounts
    if (Object.keys(savedAddress).length > 0) {
      setEditableAddress(savedAddress);
    }
  }, [savedAddress]);

  useEffect(() => {
    if (isOrderConfirmed) {
      // Set selected items to only those from the cart
      setSelectedItems(cartItems);
      // Clear the cart in the Redux store
      // dispatch(clearCart());
    } else {
      setSelectedItems(cartItems);
    }
  }, [isOrderConfirmed, cartItems, dispatch]);

  // handleChange all input
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle card number length restriction
    if (name === "cardnumber") {
      const numberOnlyValue = value
        .replace(/\D/g, "-")
        .replace(/(\d{4})(?=\d)/g, "$1 ");
      setEditableAddress((prev) => ({
        ...prev,
        [name]: numberOnlyValue.slice(0, 16),
      }));
    }
    // Handle CVV length restriction
    else if (name === "cvv") {
      const cvvOnlyValue = value.replace(/\D/g, "");
      setEditableAddress((prev) => ({
        ...prev,
        [name]: cvvOnlyValue.slice(0, 3),
      }));
    }
    // Handle expiration date format
    else if (name === "expDate") {
      const expDateOnlyValue = value.replace(/\D/g, "").slice(0, 4);
      const formattedValue = expDateOnlyValue.replace(
        /(\d{2})(\d{0,2})/,
        "$1/$2"
      );
      setEditableAddress((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    } else {
      setEditableAddress((prev) => ({
        ...prev,
        [name]: value,
      }));
      setErrorMessage("");
    }
  };

  const handleEditClick = () => {
    if (!isOrderConfirmed) {
      setIsEditing(true);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const userId = await authService.getCurrentUser();
      if (!userId) {
        throw new Error("Please login");
      }

      if (
        !editableAddress.fullname ||
        !editableAddress.email ||
        !editableAddress.address ||
        !editableAddress.city
      ) {
        alert("Please fill out all fields");
        return;
      }

      // Log the editableAddress and documentId for debugging
      console.log("Saving changes for:", { editableAddress, documentId });

      let response;
      if (documentId) {
        // Update existing cart item
        response = await storageService.updateCartAddress(
          config.appwriteCollectionSaveAddressId,
          documentId,
          editableAddress
        );
      } else {
        // Create a new cart item
        response = await storageService.saveAddress(
          config.appwriteCollectionSaveAddressId,
          editableAddress
        );
        setDocumentId(response.$id); // Save the document ID for future updates
      }

      // Dispatch updated address to Redux and save to localStorage
      dispatch(setCheckoutAddress(editableAddress));
      localStorage.setItem("checkoutAddress", JSON.stringify(editableAddress));

      console.log("Address saved successfully:", editableAddress);
      setIsEditing(false);
    } catch (error) {
      console.error("Your data can't be saved in Appwrite:", error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // ------------------------------revomeCart -----------------

  const handleRemoveCart = async (id) => {
    const documentId = cartItems.find((item) => item.id === id)?.documentId;
    if (!documentId || typeof documentId !== "string") {
      console.error("Invalid documentId:", documentId);
      return;
    }
    if (!isOrderConfirmed) {
      try {
        await storageService.removeCartItem(
          config.appwriteCollectionId,
          documentId
        );

        dispatch(removeCart(id)); // Remove item from Redux store
        const updatedCartItems = cartItems.filter((item) => item.id !== id);
        console.log("Cart items after removal:", updatedCartItems);

        if (updatedCartItems.length === 0) {
          navigate("/"); // Redirect if cart is empty
        }
      } catch (error) {
        console.log("Error Remove cart :: appwrite", error);
      }
    }
  };

  // -------------------------confirm Order ----------------

  const handleConfirmOrder = async () => {
    if (cartItems.length === 0) {
      alert("Please select at least one item before confirming the order.");
      return;
    }

    const requiredFields = [
      "fullname",
      "email",
      "address",
      "city",
      "province",
      "postalcode",
      "cardnumber",
      "expDate",
      "cvv",
    ];

    const isAddressValid = requiredFields.every(
      (field) => editableAddress[field] && editableAddress[field].trim() !== ""
    );

    if (!isAddressValid) {
      alert("Please fill out all shipping address and payment fields.");
      return;
    }

    setLoading(true);
    setIsOrderConfirmed(true);

    try {
      const userId = await authService.getCurrentUser();
      if (!userId) {
        alert("Please log in to confirm your order.");
        setLoading(false);
        return;
      }

      const orderId = Math.floor(
        Math.random() * 900000000000000 + 100000000000000
      )
        .toString()
        .slice(0, 15);

      const promises = cartItems.map(async (item) => {
        const orderData = {
          orderId: orderId,
          title: item.title,
          price: item.price.toString(),
          userId: userId,
          quantity: item.quantity.toString(),
          subtotal: (item.price * item.quantity).toFixed(2),
        };
        return await storageService.saveCheckout(
          config.appwriteCollectionCheckOutId,
          orderData
        );
      });

      await Promise.all(promises);

      for (const item of cartItems) {
        await handleRemoveCart(item.id);
      }

      setLoading(false);
      navigate("/order-page", { state: { orderId: orderId } });
    } catch (error) {
      console.error("Error confirming order:", error);
      setErrorMessage("Failed to confirm order. Please try again.");
      setLoading(false);
    }
  };
  // ---------------------fetch all data from backend --------------
  /*
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = await authService.getCurrentUser();

        if (userId) {
          // Check if this user has already confirmed an order
          const localIsOrderConfirmed = localStorage.getItem(
            `isOrderConfirmed_${userId}`
          );

          if (localIsOrderConfirmed === "true") {
            setIsOrderConfirmed(true);
          }

          // Load the shipping address from localStorage or backend
          const localAddress = JSON.parse(
            localStorage.getItem("checkoutAddress")
          );

          if (localAddress) {
            setEditableAddress(localAddress);
          } else {
            const savedAddress = await storageService.fetchCartItems(
              config.appwriteCollectionOrderId,
              userId
            );
            if (savedAddress && savedAddress.length > 0) {
              setEditableAddress(savedAddress[0]);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    fetchData();
  }, []);

  */

  // fetch address
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const userId = await authService.getCurrentUser();
        if (!userId) {
          console.log("User not logged in");
          return;
        }

        // Try to fetch from Appwrite first
        const savedAddresses = await storageService.fetchCartItems(
          config.appwriteCollectionSaveAddressId
        );

        if (savedAddresses.length > 0) {
          const latestAddress = savedAddresses[0]; // Assuming you want the latest address
          setEditableAddress(latestAddress);
          setDocumentId(latestAddress.$id);
          // Dispatch to Redux to update state
          dispatch(setCheckoutAddress(latestAddress));
          // Save to localStorage as backup
          localStorage.setItem(
            "checkoutAddress",
            JSON.stringify(latestAddress)
          );
        } else {
          // If no Appwrite address, check localStorage
          const localAddress = JSON.parse(
            localStorage.getItem("checkoutAddress")
          );
          if (localAddress) {
            setEditableAddress(localAddress);
            dispatch(setCheckoutAddress(localAddress));
          }
        }
      } catch (error) {
        console.log("Error fetching address:", error);
      }
    };

    fetchAddress();
  }, [dispatch]);

  useEffect(() => {
    const resetUserState = async () => {
      const userId = await authService.getCurrentUser();

      if (userId) {
        setEditableAddress(true);
      } else {
        // Clear the order state when no user is logged in
        setIsOrderConfirmed(false);
      }
    };

    resetUserState();
  }, []);

  // -------------------- subtotal ------------------

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  return (
    <>
      {loading && (
        <div className="flex justify-center items-center dark:bg-gray-900">
          <ClipLoader color="#36d7b7" loading={loading} size={50} />
        </div>
      )}
      <div className="bg-gray-100 px-5 py-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shipping Address and Payment Information */}
          <div className="bg-slate-300 p-6 rounded-xl shadow">
            {errorMessage && (
              <div className="text-red-500 text-center mt-4">
                {errorMessage}
              </div>
            )}
            <h3 className="text-lg font-semibold text-gray-900">
              Shipping Address
            </h3>
            <div className="flex justify-end">
              {isEditing ? (
                <button
                  onClick={handleEditClick}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Click Add Address
                </button>
              ) : (
                <button
                  className="bg-red-700 text-white px-4 py-2 rounded"
                  onClick={handleEditClick}
                >
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              // Editable fields
              <>
                <div className="mt-4">
                  <label className="block mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullname"
                    value={editableAddress.fullname || ""}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1"
                    disabled={!isEditing}
                  />
                </div>
                <div className="mt-4">
                  <label className="block mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editableAddress.email || ""}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1"
                    disabled={!isEditing}
                  />
                </div>
                <div className="mt-4">
                  <label className="block mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={editableAddress.address || ""}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1"
                    disabled={!isEditing}
                  />
                </div>
                <div className="mt-4">
                  <label className="block mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={editableAddress.city || ""}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1"
                    disabled={!isEditing}
                  />
                </div>
                <div className="mt-4">
                  <label className="block mb-1">Province</label>
                  <input
                    type="text"
                    name="province"
                    value={editableAddress.province || ""}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1"
                    disabled={!isEditing}
                  />
                </div>
                <div className="mt-4">
                  <label className="block mb-1">Postal Code</label>
                  <input
                    type="text"
                    name="postalcode"
                    value={editableAddress.postalcode || ""}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1"
                    disabled={!isEditing}
                  />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mt-6">
                  Payment Information
                </h3>
                <div className="mt-4">
                  <label className="block mb-1">Card Number</label>
                  <input
                    type="text"
                    name="cardnumber"
                    value={editableAddress.cardnumber || ""}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1"
                    placeholder="1234 5678 9012 3456"
                    disabled={!isEditing}
                  />
                </div>
                <div className="mt-4">
                  <label className="block mb-1">Expiration Date (MM/YY)</label>
                  <input
                    type="text"
                    name="expDate"
                    value={editableAddress.expDate || ""}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1"
                    placeholder="MM/YY"
                    disabled={!isEditing}
                  />
                </div>
                <div className="mt-4">
                  <label className="block mb-1">CVV</label>
                  <input
                    type="text"
                    name="cvv"
                    value={editableAddress.cvv || ""}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1"
                    placeholder="123"
                    disabled={!isEditing}
                  />
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={handleSaveChanges}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="bg-gray-400 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              // Display static address
              <div className="mt-4">
                <p>
                  <strong>Name:</strong> {editableAddress.fullname}
                </p>
                <p>
                  <strong>Email:</strong> {editableAddress.email}
                </p>
                <p>
                  <strong>Address:</strong> {editableAddress.address}
                </p>
                <p>
                  <strong>City:</strong> {editableAddress.city}
                </p>
                <p>
                  <strong>Province:</strong> {editableAddress.province}
                </p>
                <p>
                  <strong>Postal Code:</strong> {editableAddress.postalcode}
                </p>
                <p>
                  <strong>Card Number:</strong> **** **** ****{" "}
                  {editableAddress.cardnumber?.slice(-4)}
                </p>
                <p>
                  <strong>Expiration Date:</strong> {editableAddress.expDate}
                </p>
                <p>
                  <strong>CVV:</strong> ***
                </p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-slate-300 p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold text-gray-900">
              Order Summary
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 mx-auto">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                      Product Name
                    </th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                      Item ID
                    </th> */}
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
            Title
          </th> */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <NavLink
                          to={`/products/${item.id}`}
                          className="shrink-0 md:order-1"
                        >
                          <div className="hover:text-red-600 font-bold">
                            {item.title.split(" ")[0]}
                          </div>
                        </NavLink>
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap font-semibold text-sm text-gray-900">
                        {item.id}
                      </td> */}
                      {/* <td className="px-6 py-4 whitespace-nowrap font-semibold text-sm text-gray-900">
              <NavLink
                to={`/products/${item.id}`}
                className="shrink-0 md:order-1"
              >
                <div className="hover:text-red-600">{item.title}</div>
              </NavLink>
            </td> */}
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-sm text-gray-900">
                        x {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-sm text-gray-900">
                        {item.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-sm text-gray-900">
                        {!isOrderConfirmed ? (
                          <button
                            className="p-2 bg-blue-600 text-yellow-500 rounded-md hover:text-white"
                            onClick={() => handleRemoveCart(item.id)}
                          >
                            Remove
                          </button>
                        ) : (
                          <span className="text-red-500">Removed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between mt-4 font-bold bg-yellow-300 p-2">
              <span>Subtotal</span>
              <span className="">${calculateSubtotal()}</span>
            </div>
            <div className="flex justify-between mt-4">
              <button
                onClick={handleConfirmOrder}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Confirm Order
              </button>

              <NavLink to="/cart">
                <button className="bg-red-300 hover:bg-blue-600 hover:text-white px-4 py-2 rounded">
                  Back to Cart
                </button>
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CheckoutForm;
