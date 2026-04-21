import React, { useState, useEffect, useCallback } from "react";
import { notify } from '../utils/notify';
import { useNavigate } from "react-router-dom";
import { getUserRole } from '../utils/tokenUtils';
import API_URL from "../config/api";
import SetupAdmin from "./SetupAdmin";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);
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
    const checkSetupStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/setup-status`);
        const data = await response.json();
        setNeedsSetup(data.needsSetup);
      } catch (err) {
        console.error("Failed to check setup status", err);
      } finally {
        setCheckingSetup(false);
      }
    };

    const token = localStorage.getItem("token");
    if (token) {
      const role = getUserRole();
      navigateByRole(role); // Use the helper to redirect existing users
    } else {
      checkSetupStatus();
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

  if (checkingSetup && !localStorage.getItem("token")) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-white relative overflow-hidden">
        {/* Background blobs for premium feel */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/2 translate-y-1/2"></div>

      {/* LEFT SIDE - FORM */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12 lg:p-20 bg-white z-10 transition-all duration-700">
        <div className="w-full max-w-md">
            
            {needsSetup ? (
              <SetupAdmin onComplete={() => navigateByRole('ADMIN')} />
            ) : (
              <div className="w-full">
                  {/* Brand Header */}
                  <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                      <div className="w-12 h-1 bg-orange-600 mb-6 rounded-full"></div>
                      <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Welcome Back</h1>
                      <p className="text-slate-500">Log in to your dashboard to manage orders.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                      {error && (
                      <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm animate-shake">
                          {error}
                      </div>
                      )}
                      
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Account Email</label>
                          <input
                              type="email"
                              name="email"
                              placeholder="admin@dineease.com"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all font-medium"
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Secret Password</label>
                          <input
                              type="password"
                              name="password"
                              placeholder="••••••••"
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all font-medium"
                          />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 px-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-black rounded-2xl shadow-lg shadow-orange-600/30 hover:shadow-orange-600/40 transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
                      >
                      {loading ? (
                          <span className="flex items-center justify-center">
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Authorizing...
                          </span>
                      ) : "Access Dashboard"}
                      </button>
                  </form>
                  
                  <p className="mt-8 text-center text-sm text-slate-400 font-medium">
                      Issues logging in? <span className="text-orange-600 hover:underline cursor-pointer">Support Center</span>
                  </p>
              </div>
            )}
        </div>
      </div>

      {/* RIGHT SIDE - IMAGE */}
      <div className="hidden md:block md:w-1/2 relative group overflow-hidden">
        <div className="absolute inset-0 bg-orange-600 opacity-0 group-hover:opacity-10 transition-opacity duration-700 z-10"></div>
        <img 
            src="https://images.unsplash.com/photo-1514361892635-6b07e31e75f9?q=80&w=2070&auto=format&fit=crop" 
            alt="Kitchen Excellence" 
            className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-[2000ms] ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent flex items-end p-16 z-20">
            <div className="max-w-md animate-in fade-in slide-in-from-left-8 duration-1000">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-orange-500/50">D</div>
                    <span className="text-white font-black tracking-tighter text-2xl">DineEase</span>
                </div>
                <h2 className="text-5xl font-black text-white mb-4 leading-tight">Empower Your <span className="text-orange-500 italic">Chef.</span></h2>
                <p className="text-slate-300 text-lg font-medium leading-relaxed">The only restaurant management system designed for pure speed and premium aesthetics.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
