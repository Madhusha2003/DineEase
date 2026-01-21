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
    <div className="flex h-screen w-full bg-white">
      {/* LEFT SIDE - FORM */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12 lg:p-20 bg-white">
        <div className="w-full max-w-md">
            {/* Brand Header */}
            <div className="mb-10">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
                <p className="text-gray-500">Please enter your details to sign in to DineEase.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                <div className="p-4 rounded-lg bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                    {error}
                </div>
                )}
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="admin@dineease.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                </div>

              

                <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                {loading ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                    </span>
                ) : "Sign in"}
                </button>
            </form>
            
            <p className="mt-8 text-center text-sm text-gray-500">
                Don't have an account? <span className="font-semibold text-orange-600 cursor-pointer">Contact Admin</span>
            </p>
        </div>
      </div>

      {/* RIGHT SIDE - IMAGE */}
      {/* Note: I'm using a placeholder food image here. Replace the URL with one of your best food shots! */}
      <div className="hidden md:block md:w-1/2 relative">
        <img 
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop" 
            alt="Delicious Food" 
            className="w-full h-full object-cover"
        />
        {/* Overlay to make text pop if you want text over the image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-12">
            <div className="text-white">
                <h2 className="text-3xl font-bold mb-2">DineEase</h2>
                <p className="text-gray-200">Manage your restaurant with ease and style.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
