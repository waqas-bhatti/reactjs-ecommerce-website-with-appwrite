import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeCart } from "../reduxStore/CartSlice";
import { useNavigate } from "react-router-dom";

function CheckOut() {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    carnumber: "",
    expDate: "",
    cvv: "",
    address: "",
    city: "",
    province: "",
    postalcode: "",
  });

  const [errors, setErrors] = useState({});
  const [sameAsShipping, setSameAsShipping] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartItems = useSelector((state) => state.cart.cartItems) || [];

  // Calculate Total Price
  const totalPrice = cartItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  useEffect(() => {
    if (cartItems.length > 0) {
      const firstItem = cartItems[0];
      setFormData({
        fullname: firstItem.fullname || "",
        email: firstItem.email || "",
        carnumber: firstItem.carnumber || "",
        expDate: firstItem.expDate || "",
        cvv: firstItem.cvv || "",
        address: firstItem.address || "",
        city: firstItem.city || "",
        province: firstItem.province || "",
        postalcode: firstItem.postalcode || "",
      });
    }
  }, [cartItems]);

  const handleRemoveCart = useCallback(
    (id) => {
      dispatch(removeCart(id));
    },
    [dispatch]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Restrict input to numbers only
    const numberOnlyValue = value
      .replace(/\D/g, "-")
      .replace(/(\d{4})(?=\d)/g, "$1 ");

    // Handle card number length restriction
    if (name === "carnumber") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: numberOnlyValue.slice(0, 16), // Restrict to 16 digits
      }));
    } else if (name === "cvv") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: numberOnlyValue.slice(0, 3), // Restrict to 4 digits
      }));
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const formValidate = () => {
    const newErrors = {};
    if (!formData.fullname) newErrors.fullname = "Name is required";
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Valid email is required";
    if (!formData.carnumber || !/^\d{16}$/.test(formData.carnumber))
      if (
        !formData.expDate ||
        !/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expDate)
      )
        // newErrors.carnumber = "Valid card number is required";
        newErrors.expDate = "Valid expiry date is required";
    if (!formData.cvv || !/^\d{3,4}$/.test(formData.cvv))
      newErrors.cvv = "Valid CVV is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.province) newErrors.province = "Province is required";
    if (!formData.postalcode) newErrors.postalcode = "Postal code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formValidate()) {
      // Clean card number for submission
      const cleanedCardNumber = formData.carnumber.replace(/\s+/g, "");

      // Replace formData.carnumber with cleanedCardNumber for processing
      alert(
        "Payment in Processing: " +
          JSON.stringify(
            {
              ...formData,
              carnumber: cleanedCardNumber,
            },
            null,
            2
          )
      );

      navigate("/checkout-form", {
        state: {
          cartItems,
          address: {
            fullname: formData.fullname,
            address: formData.address,
            city: formData.city,
            province: formData.province,
            postalcode: formData.postalcode,
          },
        },
      });
    }
  };

  const handleCheckBox = (e) => {
    const isChecked = e.target.checked;
    setSameAsShipping(isChecked);
    if (isChecked) {
      // Copy shipping details to billing details
      setFormData((prevData) => ({
        ...prevData,
        address: prevData.address,
        city: prevData.city,
        province: prevData.province,
        postalcode: prevData.postalcode,
      }));
    } else {
      // Clear billing details if not same as shipping
      setFormData((prevData) => ({
        ...prevData,
        address: "",
        city: "",
        province: "",
        postalcode: "",
      }));
    }
  };

  return (
    <div className="mx-auto my-4 max-w-4xl md:my-6">
      <div className="overflow-hidden rounded-xl shadow">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="bg-slate-200 px-5 py-6 text-gray-900 md:px-8">
            <div className="flow-root">
              <div className="-my-6 divide-y divide-gray-200">
                <div className="py-6">
                  <form onSubmit={handleSubmit}>
                    <div className="mx-auto max-w-2xl px-4 lg:max-w-none lg:px-0">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Contact Information
                        </h3>
                        <div className="mt-4 w-full">
                          <label
                            className="text-sm font-medium leading-none"
                            htmlFor="fullname"
                          >
                            Full Name
                          </label>
                          <input
                            className="flex h-10 w-full rounded-md border border-black/30 bg-transparent px-3 py-2 text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-black/30 focus:ring-offset-1"
                            type="text"
                            name="fullname"
                            value={formData.fullname}
                            onChange={handleChange}
                            placeholder="Enter your name"
                            id="fullname"
                          />
                          {errors.fullname && (
                            <p className="text-red-600">{errors.fullname}</p>
                          )}
                        </div>
                        <div className="mt-4 w-full">
                          <label
                            className="text-sm font-medium leading-none"
                            htmlFor="email"
                          >
                            Email
                          </label>
                          <input
                            className="flex h-10 w-full rounded-md border border-black/30 bg-transparent px-3 py-2 text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-black/30 focus:ring-offset-1"
                            type="text"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            id="email"
                          />
                          {errors.email && (
                            <p className="text-red-600">{errors.email}</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-10">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Payment Details
                        </h3>
                        <div className="mt-6 grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4">
                          <div className="col-span-3 sm:col-span-4">
                            <label
                              className="block text-sm font-medium text-gray-700"
                              htmlFor="carnumber"
                            >
                              Card Number
                            </label>
                            <input
                              className="flex h-10 w-full rounded-md border border-black/30 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black/30 focus:ring-offset-1"
                              type="text"
                              name="carnumber"
                              value={formData.carnumber}
                              onChange={handleChange}
                              placeholder="4242 4242 4242 4242"
                              id="carnumber"
                            />
                            {errors.carnumber && (
                              <p className="text-red-600">{errors.carnumber}</p>
                            )}
                          </div>
                          <div className="col-span-2 sm:col-span-3">
                            <label
                              className="block text-sm font-medium text-gray-700"
                              htmlFor="expDate"
                            >
                              Expiration Date (MM/YY)
                            </label>
                            <input
                              className="block h-10 w-full rounded-md border border-black/30 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black/30 focus:ring-offset-1"
                              type="text"
                              name="expDate"
                              value={formData.expDate}
                              onChange={handleChange}
                              placeholder="MM/YY"
                              id="expDate"
                            />
                            {errors.expDate && (
                              <p className="text-red-600">{errors.expDate}</p>
                            )}
                          </div>
                          <div>
                            <label
                              className="block text-sm font-medium text-gray-700"
                              htmlFor="cvv"
                            >
                              CVC
                            </label>
                            <input
                              className="flex h-10 w-full rounded-md border border-black/30 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black/30 focus:ring-offset-1"
                              type="text"
                              name="cvv"
                              value={formData.cvv}
                              onChange={handleChange}
                              placeholder="CVV"
                              id="cvv"
                            />
                            {errors.cvv && (
                              <p className="text-red-600">{errors.cvv}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <hr className="my-8" />

                      <div className="mt-10">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Shipping Address
                        </h3>
                        <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
                          <div className="sm:col-span-3">
                            <label
                              className="block text-sm font-medium text-gray-700"
                              htmlFor="address"
                            >
                              Address
                            </label>
                            <input
                              className="flex h-10 w-full rounded-md border border-black/30 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black/30 focus:ring-offset-1"
                              type="text"
                              name="address"
                              value={formData.address}
                              onChange={handleChange}
                              placeholder="Enter your address"
                              id="address"
                            />
                            {errors.address && (
                              <p className="text-red-600">{errors.address}</p>
                            )}
                          </div>
                          <div>
                            <label
                              className="block text-sm font-medium text-gray-700"
                              htmlFor="city"
                            >
                              City
                            </label>
                            <input
                              className="flex h-10 w-full rounded-md border border-black/30 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black/30 focus:ring-offset-1"
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                              placeholder="City"
                              id="city"
                            />
                            {errors.city && (
                              <p className="text-red-600">{errors.city}</p>
                            )}
                          </div>
                          <div>
                            <label
                              className="block text-sm font-medium text-gray-700"
                              htmlFor="province"
                            >
                              State / Province
                            </label>
                            <input
                              className="flex h-10 w-full rounded-md border border-black/30 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black/30 focus:ring-offset-1"
                              type="text"
                              name="province"
                              value={formData.province}
                              onChange={handleChange}
                              placeholder="Province"
                              id="province"
                            />
                            {errors.province && (
                              <p className="text-red-600">{errors.province}</p>
                            )}
                          </div>
                          <div>
                            <label
                              className="block text-sm font-medium text-gray-700"
                              htmlFor="postalcode"
                            >
                              Postal Code
                            </label>
                            <input
                              className="flex h-10 w-full rounded-md border border-black/30 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black/30 focus:ring-offset-1"
                              type="text"
                              name="postalcode"
                              value={formData.postalcode}
                              onChange={handleChange}
                              placeholder="Postal code"
                              id="postalcode"
                            />
                            {errors.postalcode && (
                              <p className="text-red-600">
                                {errors.postalcode}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <hr className="my-8" />

                      <div className="mt-10">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Billing Information
                        </h3>
                        <div className="mt-6 flex items-center">
                          <input
                            id="same-as-shipping"
                            name="same-as-shipping"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                            checked={sameAsShipping}
                            onChange={handleCheckBox}
                          />
                          <div className="ml-2">
                            <label
                              htmlFor="same-as-shipping"
                              className="text-sm font-medium text-gray-900"
                            >
                              Same as shipping information
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="mt-10 flex justify-end border-t border-gray-200 pt-6">
                        <button
                          type="submit"
                          className="rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                        >
                          Checkout
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-100 px-5 py-6 md:px-8">
            <div className="flow-root">
              {cartItems.map((item) => (
                <ul key={item.id} className="-my-7 divide-y divide-gray-200">
                  <li className="flex items-stretch justify-between space-x-5 py-7">
                    <div className="flex flex-1 items-stretch">
                      <div className="flex-shrink-0">
                        <img
                          className="h-20 w-20 rounded-lg border border-gray-200 bg-white object-contain"
                          src={item.image}
                          alt={item.name}
                        />
                      </div>
                      <div className="ml-5 flex flex-col justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-bold">{item.name}</p>
                          <p className="mt-1.5 text-sm font-medium text-gray-500">
                            {item.color}
                          </p>
                        </div>
                        <p className="mt-4 text-xs font-medium">
                          x {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="ml-auto flex flex-col items-end justify-between">
                      <p className="text-right text-sm font-bold text-gray-900">
                        ₹{item.price}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRemoveCart(item.id)}
                        className="-m-2 inline-flex rounded p-2 text-gray-400 transition-all duration-200 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                      >
                        <span className="sr-only">Remove</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  </li>
                </ul>
              ))}
            </div>
            <hr className="mt-6 border-gray-200" />
            <form action="#" className="mt-6">
              <div className="sm:flex sm:space-x-2.5 md:flex-col md:space-x-0 lg:flex-row lg:space-x-2.5">
                <div className="flex-grow">
                  <input
                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1"
                    type="text"
                    placeholder="Enter coupon code"
                  />
                </div>
                <div className="mt-4 sm:mt-0 md:mt-4 lg:mt-0">
                  <button
                    type="button"
                    className="rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                  >
                    Apply Coupon
                  </button>
                </div>
              </div>
            </form>
            <ul className="mt-6 space-y-3">
              <li className="flex items-center justify-between text-gray-600">
                <p className="text-sm font-medium">Sub total</p>
                <p className="text-sm font-medium">${totalPrice}</p>
              </li>
              <li className="flex items-center justify-between text-gray-900">
                <p className="text-sm font-medium">Total</p>
                <p className="text-sm font-bold">${totalPrice}</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckOut;
