import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { removeCart } from "../reduxStore/CartSlice";
import { useDispatch, useSelector } from "react-redux";

function CheckoutForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const dispatch = useDispatch();

  const cartItems = useSelector((state) => state.cart.cartItems || []);
  const [editableAddress, setEditableAddress] = useState(() => {
    const savedAddress = JSON.parse(localStorage.getItem("address"));
    return savedAddress || (state && state.address) || {};
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);

  useEffect(() => {
    const orderConfirmed = JSON.parse(localStorage.getItem("orderConfirmed"));
    if (orderConfirmed) {
      setIsOrderConfirmed(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditClick = () => {
    if (!isOrderConfirmed) {
      setIsEditing(true);
    }
  };

  const handleSaveChanges = () => {
    if (
      !editableAddress.fullname ||
      !editableAddress.email ||
      !editableAddress.address ||
      !editableAddress.cardnumber ||
      !editableAddress.expDate ||
      !editableAddress.cvv ||
      !editableAddress.city ||
      !editableAddress.province ||
      !editableAddress.postalcode
    ) {
      alert("Please fill out all fields");
      return;
    }

    localStorage.setItem("address", JSON.stringify(editableAddress));
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleRemoveCart = (id) => {
    if (!isOrderConfirmed) {
      dispatch(removeCart(id));
      const updatedCartItems = cartItems.filter((item) => item.id !== id);
      console.log("Cart items after removal:", updatedCartItems);

      if (updatedCartItems.length === 0) {
        navigate("/");
      }
    }
  };

  const handleConfirmOrder = () => {
    setIsOrderConfirmed(true);
    localStorage.setItem("orderConfirmed", JSON.stringify(true));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  return (
    <>
      <div className="bg-gray-100 px-5 py-6 md:px-8">
        <h4 className="text-md font-semibold text-gray-900">Products</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full max-w-md divide-y divide-gray-200 mx-auto">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                  Item ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                  Title
                </th>
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
            <tbody className="bg-white divide-y divide-gray-200">
              {cartItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img className="w-16" src={item.image} alt={item.title} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-sm text-gray-900">
                    {item.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-sm text-gray-900">
                    <NavLink
                      to={`/products/${item.id}`}
                      className="shrink-0 md:order-1"
                    >
                      <div className="hover:text-red-600">{item.title}</div>
                    </NavLink>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-sm text-gray-900">
                    x {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-sm text-gray-900">
                    {item.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-sm text-gray-900">
                    {!isOrderConfirmed ? (
                      <button
                        className="p-2 bg-blue-600 rounded-md"
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
      </div>

      <div className="mx-auto my-4 max-w-4xl md:my-6 border border-blue-600 rounded-xl ">
        <div className="overflow-hidden rounded-xl shadow">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="bg-slate-300 px-5 py-6 text-gray-900 md:px-8">
              <h3 className="text-lg font-semibold text-gray-900">
                Order Summary
              </h3>
              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-900">
                  Add Information
                </h4>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      name="fullname"
                      value={editableAddress.fullname || ""}
                      onChange={handleChange}
                      className="border p-1 rounded w-full"
                      placeholder="Full Name"
                      disabled={isOrderConfirmed}
                    />
                    <input
                      type="text"
                      name="email"
                      value={editableAddress.email || ""}
                      onChange={handleChange}
                      className="border p-1 rounded w-full"
                      placeholder="email"
                      disabled={isOrderConfirmed}
                    />
                    <input
                      type="text"
                      name="address"
                      value={editableAddress.address || ""}
                      onChange={handleChange}
                      className="border p-1 rounded w-full mt-2"
                      placeholder="Address"
                      disabled={isOrderConfirmed}
                    />
                    <input
                      type="text"
                      name="city"
                      value={editableAddress.city || ""}
                      onChange={handleChange}
                      className="border p-1 rounded w-full mt-2"
                      placeholder="City"
                      disabled={isOrderConfirmed}
                    />
                    <input
                      type="text"
                      name="province"
                      value={editableAddress.province || ""}
                      onChange={handleChange}
                      className="border p-1 rounded w-full mt-2"
                      placeholder="Province"
                      disabled={isOrderConfirmed}
                    />
                    <input
                      type="text"
                      name="postalcode"
                      value={editableAddress.postalcode || ""}
                      onChange={handleChange}
                      className="border p-1 rounded w-full mt-2"
                      placeholder="Postal Code"
                      disabled={isOrderConfirmed}
                    />
                    <button
                      onClick={handleSaveChanges}
                      className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                      disabled={isOrderConfirmed}
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="mt-4 bg-red-500 text-white px-4 py-2 rounded ml-2"
                      disabled={isOrderConfirmed}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div>
                    <p>{editableAddress.fullname || "N/A"}</p>
                    <p>{editableAddress.email || "N/A"}</p>
                    <p>{editableAddress.address || "N/A"}</p>
                    <p>
                      {editableAddress.city || "N/A"},{" "}
                      {editableAddress.province || "N/A"}
                    </p>
                    <p>{editableAddress.postalcode || "N/A"}</p>
                    {!isOrderConfirmed && (
                      <button
                        onClick={handleEditClick}
                        className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
                      >
                        Edit Address
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-200 px-5 py-6 md:px-8 border-l-2 border-blue-600 ">
              <h4 className="text-md font-semibold text-gray-900">
                Order Details
              </h4>
              <ul>
                <li className="flex justify-between py-2">
                  <span>Subtotal</span>
                  <span className="border-b border-red-400 font-semibold">
                    ${calculateSubtotal()}
                  </span>
                </li>
                {/* Include any additional details such as shipping or taxes if applicable */}
              </ul>
              {!isOrderConfirmed ? (
                <button
                  onClick={handleConfirmOrder}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Confirm Order
                </button>
              ) : (
                <p className="mt-4 text-lg font-semibold text-green-600">
                  Your order has been confirmed!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CheckoutForm;

// ----------------appwrite in save data with localStorage---------------
// import React, { useState, useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { NavLink } from "react-router-dom";
// import { removeCart, storedAlldata } from "../reduxStore/CartSlice";
// import { useDispatch, useSelector } from "react-redux";
// import config from "../config/config";
// import storageService from "../appwrite/conf";
// import authService from "../appwrite/auth";

// function CheckoutForm() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { state } = location;
//   const dispatch = useDispatch();
//   const cartItems = useSelector((state) => state.cart.cartItems || []);
//   const [editableAddress, setEditableAddress] = useState(state?.address || {});
//   const [isEditing, setIsEditing] = useState(false);
//   const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [selectedItems, setSelectedItems] = useState([]);
//   const isAuthenticated = useSelector((state) => state.cart.cartItems);
//   const confirmedProducts = useSelector(
//     (state) => state.cart.confirmedProducts
//   );

//   useEffect(() => {
//     if (isOrderConfirmed) {
//       // Set selected items to only those from the cart
//       setSelectedItems(cartItems);
//       // Clear the cart in the Redux store
//       // dispatch(clearCart());
//     } else {
//       setSelectedItems(cartItems);
//     }
//   }, [isOrderConfirmed, cartItems, dispatch]);

//   // handleChange all input
//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     // Handle card number length restriction
//     if (name === "cardnumber") {
//       const numberOnlyValue = value
//         .replace(/\D/g, "-")
//         .replace(/(\d{4})(?=\d)/g, "$1 ");
//       setEditableAddress((prev) => ({
//         ...prev,
//         [name]: numberOnlyValue.slice(0, 16),
//       }));
//     }
//     // Handle CVV length restriction
//     else if (name === "cvv") {
//       const cvvOnlyValue = value.replace(/\D/g, "");
//       setEditableAddress((prev) => ({
//         ...prev,
//         [name]: cvvOnlyValue.slice(0, 3),
//       }));
//     }
//     // Handle expiration date format
//     else if (name === "expDate") {
//       const expDateOnlyValue = value.replace(/\D/g, "").slice(0, 4);
//       const formattedValue = expDateOnlyValue.replace(
//         /(\d{2})(\d{0,2})/,
//         "$1/$2"
//       );
//       setEditableAddress((prev) => ({
//         ...prev,
//         [name]: formattedValue,
//       }));
//     } else {
//       setEditableAddress((prev) => ({
//         ...prev,
//         [name]: value,
//       }));
//       setErrorMessage("");
//     }
//   };

//   const handleEditClick = () => {
//     if (!isOrderConfirmed) {
//       setIsEditing(true);
//     }
//   };

//   const handleSaveChanges = () => {
//     if (
//       !editableAddress.fullname ||
//       !editableAddress.email ||
//       !editableAddress.address ||
//       !editableAddress.cardnumber ||
//       !editableAddress.expDate ||
//       !editableAddress.cvv ||
//       !editableAddress.city ||
//       !editableAddress.province ||
//       !editableAddress.postalcode
//     ) {
//       alert("Please fill out all fields");
//       return;
//     }
//     setIsEditing(false);
//   };

//   const handleCancelEdit = () => {
//     setIsEditing(false);
//   };

//   const handleRemoveCart = async (id) => {
//     const documentId = cartItems.find((item) => item.id === id)?.documentId;
//     if (!documentId || typeof documentId !== "string") {
//       console.error("Invalid documentId:", documentId);
//       return;
//     }
//     if (!isOrderConfirmed) {
//       try {
//         await storageService.removeCartItem(
//           config.appwriteCollectionId,
//           documentId
//         );

//         dispatch(removeCart(id));
//         const updatedCartItems = cartItems.filter((item) => item.id !== id);
//         console.log("Cart items after removal:", updatedCartItems);

//         if (updatedCartItems.length === 0) {
//           navigate("/");
//         }
//       } catch (error) {
//         console.log("Error Remove cart :: appwrite", error);
//       }
//     }
//   };

//   const handleConfirmOrder = async () => {
//     if (selectedItems.length === 0) {
//       alert("Please select an item before confirming the order.");
//       return; // Stop further execution if there are no items
//     }

//     if (
//       !editableAddress.fullname ||
//       !editableAddress.email ||
//       !editableAddress.address ||
//       !editableAddress.cardnumber ||
//       !editableAddress.expDate ||
//       !editableAddress.cvv ||
//       !editableAddress.city ||
//       !editableAddress.province ||
//       !editableAddress.postalcode
//     ) {
//       setErrorMessage("Please fill out all fields");
//       return;
//     }

//     try {
//       const userId = await authService.getCurrentUser();

//       if (!userId) {
//         throw new Error("User must be logged in to confirm an order");
//       }

//       const orderData = selectedItems.map((item) => ({
//         fullname: editableAddress.fullname,
//         email: editableAddress.email,
//         address: editableAddress.address,
//         city: editableAddress.city,
//         province: editableAddress.province,
//         postalcode: editableAddress.postalcode,
//         cardnumber: editableAddress.cardnumber.toString(),
//         id: item.id,
//         title: item.title,
//         price: item.price.toString(),
//         userId: userId,
//         quantity: item.quantity.toString(),
//         subtotal: calculateSubtotal().toString(),
//       }));

//       await storageService.saveAllData(
//         config.appwriteCollectionOrderId,
//         orderData
//       );

//       // Clear the cart after successful order confirmation
//       dispatch(removeCart());

//       // Mark the order as confirmed for the current user
//       setIsOrderConfirmed(true);
//       // localStorage.setItem(`isOrderConfirmed_${userId}`, "true");

//       // Save shipping address for the user
//       dispatch(storedAlldata(editableAddress));
//       localStorage.setItem("checkoutAddress", JSON.stringify(editableAddress));

//       setErrorMessage(""); // Clear previous error messages
//     } catch (error) {
//       console.error("Your order could not be confirmed with Appwrite: ", error);
//       setErrorMessage(
//         "An error occurred while confirming your order. Please try again."
//       );
//     }
//   };

//   // ---------------------fetch all data from backend --------------
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const userId = await authService.getCurrentUser();

//         // if (userId) {
//         //   // Check if this user has already confirmed an order
//         //   const localIsOrderConfirmed = localStorage.getItem(
//         //     `isOrderConfirmed_${userId}`
//         //   );

//         //   if (localIsOrderConfirmed === "true") {
//         //     setIsOrderConfirmed(true);
//         //   }

//         //   // Load the shipping address from localStorage or backend
//         //   const localAddress = JSON.parse(
//         //     localStorage.getItem("checkoutAddress")
//         //   );
//         // }

//         if (localAddress) {
//           setEditableAddress(localAddress);
//         } else {
//           const savedAddress = await storageService.fetchCartItems(
//             config.appwriteCollectionOrderId,
//             userId
//           );
//           if (savedAddress && savedAddress.length > 0) {
//             setEditableAddress(savedAddress[0]);
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching user data: ", error);
//       }
//     };

//     fetchData();
//   }, []);

//   // ------------------reset page -------------------

//   useEffect(() => {
//     const resetUserState = async () => {
//       const userId = await authService.getCurrentUser();
//       setIsOrderConfirmed(true);

//       // if (userId) {
//       //   // Check if the user has confirmed an order before
//       //   const localIsOrderConfirmed = localStorage.getItem(
//       //     `isOrderConfirmed_${userId}`
//       //   );
//       //   setIsOrderConfirmed(localIsOrderConfirmed === "true");
//       // } else {
//       //   // Clear the order state when no user is logged in
//       //   setIsOrderConfirmed(false);
//       // }
//     };

//     resetUserState();
//   }, []);

//   // -------------------- subtotal ------------------

//   const calculateSubtotal = () => {
//     return cartItems.reduce(
//       (total, item) => total + item.price * item.quantity,
//       0
//     );
//   };

//   return (
//     <>
//       <div className="bg-gray-100 px-5 py-6 md:px-8">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* Shipping Address and Payment Information */}
//           <div className="bg-slate-300 p-6 rounded-xl shadow">
//             {errorMessage && (
//               <div className="text-red-500 text-center mt-4">
//                 {errorMessage}
//               </div>
//             )}
//             <h3 className="text-lg font-semibold text-gray-900">
//               Shipping Address
//             </h3>
//             <div className="flex justify-end">
//               {!isOrderConfirmed ? (
//                 <button
//                   onClick={handleEditClick}
//                   className="bg-blue-600 text-white px-4 py-2 rounded"
//                 >
//                   Click Add Address
//                 </button>
//               ) : (
//                 <button
//                   className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
//                   disabled
//                 >
//                   Address Editing Disabled
//                 </button>
//               )}
//             </div>

//             {isEditing ? (
//               // Editable fields
//               <>
//                 <div className="mt-4">
//                   <label className="block mb-1">Full Name</label>
//                   <input
//                     type="text"
//                     name="fullname"
//                     value={editableAddress.fullname || ""}
//                     onChange={handleChange}
//                     className="w-full border rounded px-2 py-1"
//                     disabled={!isEditing}
//                   />
//                 </div>
//                 <div className="mt-4">
//                   <label className="block mb-1">Email</label>
//                   <input
//                     type="email"
//                     name="email"
//                     value={editableAddress.email || ""}
//                     onChange={handleChange}
//                     className="w-full border rounded px-2 py-1"
//                     disabled={!isEditing}
//                   />
//                 </div>
//                 <div className="mt-4">
//                   <label className="block mb-1">Address</label>
//                   <input
//                     type="text"
//                     name="address"
//                     value={editableAddress.address || ""}
//                     onChange={handleChange}
//                     className="w-full border rounded px-2 py-1"
//                     disabled={!isEditing}
//                   />
//                 </div>
//                 <div className="mt-4">
//                   <label className="block mb-1">City</label>
//                   <input
//                     type="text"
//                     name="city"
//                     value={editableAddress.city || ""}
//                     onChange={handleChange}
//                     className="w-full border rounded px-2 py-1"
//                     disabled={!isEditing}
//                   />
//                 </div>
//                 <div className="mt-4">
//                   <label className="block mb-1">Province</label>
//                   <input
//                     type="text"
//                     name="province"
//                     value={editableAddress.province || ""}
//                     onChange={handleChange}
//                     className="w-full border rounded px-2 py-1"
//                     disabled={!isEditing}
//                   />
//                 </div>
//                 <div className="mt-4">
//                   <label className="block mb-1">Postal Code</label>
//                   <input
//                     type="text"
//                     name="postalcode"
//                     value={editableAddress.postalcode || ""}
//                     onChange={handleChange}
//                     className="w-full border rounded px-2 py-1"
//                     disabled={!isEditing}
//                   />
//                 </div>

//                 <h3 className="text-lg font-semibold text-gray-900 mt-6">
//                   Payment Information
//                 </h3>
//                 <div className="mt-4">
//                   <label className="block mb-1">Card Number</label>
//                   <input
//                     type="text"
//                     name="cardnumber"
//                     value={editableAddress.cardnumber || ""}
//                     onChange={handleChange}
//                     className="w-full border rounded px-2 py-1"
//                     placeholder="1234 5678 9012 3456"
//                     disabled={!isEditing}
//                   />
//                 </div>
//                 <div className="mt-4">
//                   <label className="block mb-1">Expiration Date (MM/YY)</label>
//                   <input
//                     type="text"
//                     name="expDate"
//                     value={editableAddress.expDate || ""}
//                     onChange={handleChange}
//                     className="w-full border rounded px-2 py-1"
//                     placeholder="MM/YY"
//                     disabled={!isEditing}
//                   />
//                 </div>
//                 <div className="mt-4">
//                   <label className="block mb-1">CVV</label>
//                   <input
//                     type="text"
//                     name="cvv"
//                     value={editableAddress.cvv || ""}
//                     onChange={handleChange}
//                     className="w-full border rounded px-2 py-1"
//                     placeholder="123"
//                     disabled={!isEditing}
//                   />
//                 </div>

//                 <div className="flex justify-between mt-6">
//                   <button
//                     onClick={handleSaveChanges}
//                     className="bg-green-600 text-white px-4 py-2 rounded"
//                   >
//                     Save Changes
//                   </button>
//                   <button
//                     onClick={handleCancelEdit}
//                     className="bg-gray-400 text-white px-4 py-2 rounded"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </>
//             ) : (
//               // Display static address
//               <div className="mt-4">
//                 <p>
//                   <strong>Name:</strong> {editableAddress.fullname}
//                 </p>
//                 <p>
//                   <strong>Email:</strong> {editableAddress.email}
//                 </p>
//                 <p>
//                   <strong>Address:</strong> {editableAddress.address}
//                 </p>
//                 <p>
//                   <strong>City:</strong> {editableAddress.city}
//                 </p>
//                 <p>
//                   <strong>Province:</strong> {editableAddress.province}
//                 </p>
//                 <p>
//                   <strong>Postal Code:</strong> {editableAddress.postalcode}
//                 </p>
//                 <p>
//                   <strong>Card Number:</strong> **** **** ****{" "}
//                   {editableAddress.cardnumber?.slice(-4)}
//                 </p>
//                 <p>
//                   <strong>Expiration Date:</strong> {editableAddress.expDate}
//                 </p>
//                 <p>
//                   <strong>CVV:</strong> ***
//                 </p>
//               </div>
//             )}
//           </div>

//           {/* Order Summary */}
//           <div className="bg-slate-300 p-6 rounded-xl shadow">
//             <h3 className="text-lg font-semibold text-gray-900">
//               Order Summary
//             </h3>
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200 mx-auto">
//                 <thead>
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
//                       Name
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
//                       Item ID
//                     </th>
//                     {/* <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
//             Title
//           </th> */}
//                     <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
//                       Quantity
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
//                       Price
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {cartItems.map((item) => (
//                     <tr key={item.id}>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <NavLink
//                           to={`/products/${item.id}`}
//                           className="shrink-0 md:order-1"
//                         >
//                           <div className="hover:text-red-600 font-bold">
//                             {item.title.split(" ")[0]}
//                           </div>
//                         </NavLink>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap font-semibold text-sm text-gray-900">
//                         {item.id}
//                       </td>
//                       {/* <td className="px-6 py-4 whitespace-nowrap font-semibold text-sm text-gray-900">
//               <NavLink
//                 to={`/products/${item.id}`}
//                 className="shrink-0 md:order-1"
//               >
//                 <div className="hover:text-red-600">{item.title}</div>
//               </NavLink>
//             </td> */}
//                       <td className="px-6 py-4 whitespace-nowrap font-semibold text-sm text-gray-900">
//                         x {item.quantity}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap font-semibold text-sm text-gray-900">
//                         {item.price}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap font-semibold text-sm text-gray-900">
//                         {!isOrderConfirmed ? (
//                           <button
//                             className="p-2 bg-blue-600 text-yellow-500 rounded-md hover:text-white"
//                             onClick={() => handleRemoveCart(item.id)}
//                           >
//                             Remove
//                           </button>
//                         ) : (
//                           <span className="text-red-500">Removed</span>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             <div className="flex justify-between mt-4 font-bold bg-yellow-300 p-2">
//               <span>Subtotal</span>
//               <span className="">${calculateSubtotal()}</span>
//             </div>
//             <div className="flex justify-between mt-4">
//               {!isOrderConfirmed ? (
//                 <button
//                   onClick={handleConfirmOrder}
//                   className="bg-red-500 text-white px-4 py-2 rounded"
//                 >
//                   Confirm Order
//                 </button>
//               ) : (
//                 <p className="text-lg font-semibold text-green-600">
//                   Your order has been confirmed!
//                 </p>
//               )}
//               <NavLink to="/cart">
//                 <button className="bg-red-300 hover:bg-blue-600 hover:text-white px-4 py-2 rounded">
//                   Back to Cart
//                 </button>
//               </NavLink>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// export default CheckoutForm;
