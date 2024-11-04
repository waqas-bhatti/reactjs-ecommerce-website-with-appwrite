import React, { useState } from "react";
import storageService from "../appwrite/conf";
import { useNavigate, useParams } from "react-router-dom";

function RecoverEmail() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { userId, secret } = useParams();

  const handleRecovery = async (e) => {
    e.preventDefault();
    setError(""); // Reset any existing error messages

    try {
      const emailExists = await storageService.isEmailRegistered(email);
      console.log(emailExists);

      if (emailExists) {
        // You may need to replace `userId` and `secret` with dynamic values if they aren't coming from useParams
        navigate(
          `/reset-password/${userId || "placeholderUserId"}/${
            secret || "placeholderSecret"
          }`
        );
      } else {
        setError("Email does not exist in our records.");
      }

      console.log("Reset the password,", { userId, secret });
      // Navigate to reset password page if the email exists
      navigate(`/reset-password/${userId}/${secret}`);
    } catch (error) {
      // Display the caught error message
      setError(error.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleRecovery}
        className="bg-white p-6 rounded shadow-md w-96"
      >
        <h2 className="text-xl font-bold mb-4 text-center">Recover Password</h2>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border border-gray-300 p-2 w-full rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 w-full rounded hover:bg-blue-600 transition"
        >
          Check Email
        </button>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </form>
    </div>
  );
}

export default RecoverEmail;
