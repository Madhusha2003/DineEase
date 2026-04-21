import { useState, useEffect } from "react";
import API_URL from "../config/api";
import { notify } from "../utils/notify";

export default function RestaurantSettings() {
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoMode, setLogoMode] = useState("url"); // "url" or "file"
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/restaurant`);
      if (response.ok) {
        const data = await response.json();
        setName(data.name || "");
        setLogoUrl(data.logoUrl || "");
        // If logoUrl starts with /uploads, it's a file
        if (data.logoUrl && data.logoUrl.startsWith('/uploads')) {
          setLogoMode("file");
        } else {
          setLogoMode("url");
        }
      }
    } catch (error) {
      console.error("Failed to fetch restaurant profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let currentLogoUrl = logoUrl;

      // 1. If in file mode and a new file was selected, upload it first
      if (logoMode === "file" && selectedFile) {
        const formData = new FormData();
        formData.append("logo", selectedFile);
        
        const uploadRes = await fetch(`${API_URL}/restaurant/logo`, {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          currentLogoUrl = uploadData.logoUrl;
          setLogoUrl(currentLogoUrl);
          setSelectedFile(null); // Clear selection after success
        } else {
          notify.error("Failed to upload logo file.");
          setSaving(false);
          return;
        }
      }

      // 2. Update the profile (Name and final Logo URL)
      const response = await fetch(`${API_URL}/restaurant`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          logoUrl: logoMode === "url" ? logoUrl : currentLogoUrl, 
          theme: "light" 
        }),
      });

      if (response.ok) {
        notify.success("Restaurant profile updated!");
      } else {
        notify.error("Failed to update profile.");
      }
    } catch (error) {
      console.error(error);
      notify.error("Error updating profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10">Loading settings...</div>;

  const displayLogo = logoUrl && (logoUrl.startsWith('http') || logoUrl.startsWith('/uploads')) 
    ? (logoUrl.startsWith('http') ? logoUrl : `${API_URL.replace('/api', '')}${logoUrl}`)
    : null;

  return (
    <div className="p-4 md:p-8 lg:p-12 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-8 tracking-tight">Restaurant Configuration</h1>
        
        <div className="bg-white rounded-3xl shadow-xl shadow-orange-900/5 border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 p-8 text-white">
            <h2 className="text-2xl font-bold">General Branding</h2>
            <p className="text-orange-100">Update your public identity across the system</p>
          </div>

          <form onSubmit={handleSave} className="p-6 md:p-12 space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Column - General Info */}
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Restaurant Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-5 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-lg font-medium"
                    placeholder="e.g. Moonlight Diner"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Restaurant Logo Source</label>
                  
                  <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl mb-6 w-full sm:w-fit">
                    <button 
                      type="button"
                      onClick={() => setLogoMode("url")}
                      className={`flex-1 sm:flex-none px-8 py-3 rounded-xl text-sm font-bold transition-all ${logoMode === "url" ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      External URL
                    </button>
                    <button 
                      type="button"
                      onClick={() => setLogoMode("file")}
                      className={`flex-1 sm:flex-none px-8 py-3 rounded-xl text-sm font-bold transition-all ${logoMode === "file" ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      Upload File
                    </button>
                  </div>

                  <div className="space-y-4">
                    {logoMode === "url" ? (
                      <input 
                        type="text" 
                        value={logoUrl.startsWith('/uploads') ? "" : logoUrl} 
                        onChange={(e) => setLogoUrl(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-5 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                        placeholder="https://example.com/logo.png"
                      />
                    ) : (
                      <div className="p-10 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50 flex flex-col items-center justify-center gap-4 hover:border-orange-300 transition-colors cursor-pointer relative min-h-[150px]">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-orange-600">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        </div>
                        <p className="text-sm font-bold text-gray-600 text-center px-4">
                          {selectedFile ? selectedFile.name : (logoUrl.startsWith('/uploads') ? "Existing logo uploaded. Click to replace." : "Drop your logo here or click to browse")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Preview & Status */}
              <div className="flex flex-col h-full">
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Visual Preview</label>
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-orange-50 rounded-3xl border border-orange-100 border-dashed relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/20 rounded-full blur-3xl"></div>
                   <div className="w-48 h-48 bg-white rounded-3xl shadow-xl border border-orange-100 flex items-center justify-center p-6 overflow-hidden z-10">
                     {displayLogo ? (
                       <img src={displayLogo} alt="Preview" className="max-w-full max-h-full object-contain" />
                     ) : (
                       <div className="text-center">
                         <div className="text-4xl mb-2 opacity-20">🖼️</div>
                         <span className="text-orange-200 text-xs font-bold uppercase">No Logo</span>
                       </div>
                     )}
                   </div>
                   <div className="mt-8 text-center z-10">
                     <p className="text-sm font-bold text-orange-800 mb-1">Live Branding Display</p>
                     <p className="text-xs text-orange-600 max-w-[250px]">Check if your logo looks perfect before saving. This will be visible to all customers.</p>
                   </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <button 
                type="submit" 
                disabled={saving}
                className="w-full lg:w-fit lg:px-12 bg-gradient-to-r from-orange-600 to-red-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-orange-600/30 hover:shadow-orange-600/40 transform hover:-translate-y-1 transition-all disabled:opacity-50 active:scale-95 uppercase tracking-widest"
              >
                {saving ? "Processing Changes..." : "Save Configuration"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
