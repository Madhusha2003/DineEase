import React, { useState } from "react";
import { notify } from '../utils/notify';
import API_URL from "../config/api";

const SetupAdmin = ({ onComplete }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/setup-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Setup failed.");
      }

      localStorage.setItem("token", data.token);
      notify.success("Admin account created successfully!");
      if (onComplete) onComplete();
    } catch (err) {
      notify.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-2xl border border-orange-100 transform transition-all duration-500 animate-in fade-in slide-in-from-bottom-5">
      <div className="mb-8 text-center">
        <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-600 text-xs font-bold uppercase tracking-widest rounded-full mb-4">First Time Setup</span>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Create Admin</h1>
        <p className="text-slate-500">Welcome to DineEase. Let's set up your administrator account to get started.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all font-medium text-slate-800"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@restaurant.com"
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all font-medium text-slate-800"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Secure Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all font-medium text-slate-800"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-gradient-to-r from-orange-600 to-red-600 text-white font-black rounded-2xl shadow-lg shadow-orange-600/30 hover:shadow-orange-600/40 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? "CONFIGURING SYSTEM..." : "COMPLETE SETUP & START"}
        </button>
      </form>
    </div>
  );
};

export default SetupAdmin;
