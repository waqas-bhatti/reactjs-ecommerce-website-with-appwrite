import React, { useState, useEffect } from "react";
import storageService from "../appwrite/conf"; // Adjust as needed
import { useParams, useNavigate } from "react-router-dom";

function ResetPassword() {
  const { userId, secret } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId || !secret) {
      console.error("User ID or secret not found in URL");
    }
  }, [userId, secret]);

  const checkPasswordStrength = (password) => {
    if (password.length < 6) {
      setPasswordStrength("Weak");
    } else if (password.length < 10) {
      setPasswordStrength("Moderate");
    } else {
      setPasswordStrength("Strong");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError(null);

    if (newPassword !== confirmedPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await storageService.updatePassword(userId, secret, newPassword);
      setMessage("Password successfully updated. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1000);
    } catch (error) {
      console.error("Error updating password:", error.response || error);
      setError(
        error.response?.data?.message ||
          "Failed to update password. Please ensure the link is valid."
      );
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-96 text-center">
        <h2 className="text-xl font-bold mb-4">Reset Password</h2>

        <form onSubmit={handleChangePassword}>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              checkPasswordStrength(e.target.value);
            }}
            className="border border-gray-300 p-2 w-full rounded mb-2"
            required
          />
          {passwordStrength && (
            <p
              className={`mt-2 ${
                passwordStrength === "Strong"
                  ? "text-green-500"
                  : passwordStrength === "Moderate"
                  ? "text-yellow-500"
                  : "text-red-500"
              }`}
            >
              Password Strength: {passwordStrength}
            </p>
          )}
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmedPassword}
            onChange={(e) => setConfirmedPassword(e.target.value)}
            className="border border-gray-300 p-2 w-full rounded mb-4"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 w-full rounded hover:bg-blue-600 transition"
          >
            Reset Password
          </button>
        </form>

        {message && <p className="text-green-500 mt-4">{message}</p>}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
}

export default ResetPassword;
