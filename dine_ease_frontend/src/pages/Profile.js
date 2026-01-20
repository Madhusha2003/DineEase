import React, { useState, useEffect, useCallback } from "react";
import { notify } from '../utils/notify';
import { useNavigate } from "react-router-dom";
import { getUserRole } from '../utils/tokenUtils';
import API_URL from "../config/api";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // helper function to handle role-based navigation logic
  const navigateByRole = useCallback((role) => {
    if (role === 'ADMIN') {
      navigate("/reports", { replace: true });
    } else if (role === 'WAITER') {
      navigate("/menu", { replace: true });
    } else if (role === 'KITCHENSTAFF') {
      navigate("/kitchen", { replace: true });
    } else {
      navigate("/profile", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const role = getUserRole();
      navigateByRole(role); // Use the helper to redirect existing users
    }
  },[navigateByRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed.");
      }
      // Save the key and move them to localstorage
      localStorage.setItem("token", data.token);
      
      // Get role AFTER storing the token
      const role = getUserRole();
      
      notify.success("Login successful!");
      navigateByRole(role); // Use the helper to redirect after login

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-80">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Login
        </h2>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm text-center">
              {error}
            </div>
          )}
          <input
            type="text"
            name="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition duration-200 disabled:bg-orange-400 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="text-right mt-3 text-sm">
          <a href="#" className="text-blue-600 hover:underline">
            Forgot password?
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
