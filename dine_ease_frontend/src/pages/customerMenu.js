import { useState, useEffect, useMemo } from "react";
import MenuCard from "../components/menuCard";
import CartCard from "../components/cartCard";
import API_URL from "../config/api";
import { notify } from "../utils/notify";

export default function CustomerMenu() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // --- NEW: API State ---
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [restaurantProfile, setRestaurantProfile] = useState({ name: "Loading...", logoUrl: "" });
  const [selectedTable, setSelectedTable] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Fetch logic ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [menuRes, tablesRes, profileRes] = await Promise.all([
          fetch(`${API_URL}/menu-items`),
          fetch(`${API_URL}/tables`),
          fetch(`${API_URL}/restaurant`)
        ]);

        if (!menuRes.ok) throw new Error("Failed to load menu");
        if (!tablesRes.ok) throw new Error("Failed to load tables");
        // We'll allow profile to fail gracefully
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setRestaurantProfile(profileData);
        } else {
          setRestaurantProfile({ name: "DineEase", logoUrl: "" });
        }

        setMenuItems(await menuRes.json());
        setTables(await tablesRes.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, search, selectedCategory]);

  // cart function
  function addToCart(item) {
    let newCart = [...cart];
    let found = false;
    for (let i = 0; i < newCart.length; i++) {
      if (newCart[i].id === item.id) {
        newCart[i].quantity += 1;
        found = true;
        break;
      }
    }
    if (!found) {
      newCart.push({ ...item, quantity: 1 });
    }
    setCart(newCart);
  };

  function increaseQty(id) {
    setCart(cart.map(item =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    ));
  }

  function decreaseQty(id) {
    setCart(cart.map(item =>
      item.id === id ? { ...item, quantity: Math.max(item.quantity - 1, 1) } : item
    ));
  }

  function removeFromCart(id) {
    setCart(cart.filter(item => item.id !== id));
  }

  const clearCart = () => {
    setCart([]);
    notify.success("Cart Cleared.")
  }

  // Place order function
  const PlaceOrder = async () => {
    if (!selectedTable) {
      notify.error("Please select a table before placing an order.");
      return;
    }
    if (!customerName.trim()) {
      notify.error("Please enter your name before placing an order.");
      return;
    }
    if (numberOfGuests < 1) {
      notify.error("Please enter the number of guests.");
      return;
    }

    const table = tables.find(t => t.id === parseInt(selectedTable));
    if (table && (table.occupiedSeats + numberOfGuests) > table.capacity) {
      notify.error(
        `Table ${table.tableNumber} does not have enough capacity for ${numberOfGuests} guests. ` +
        `It currently has ${table.capacity - table.occupiedSeats} seat(s) available.`
      );
      return;
    }

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: selectedTable,
          cart,
          customerName: customerName,
          numberOfGuests: numberOfGuests
        }),
      });

      if (response.ok) {
        const newOrder = await response.json();
        notify.success(`Order #${newOrder.id} placed successfully!`);
        setCart([]);
        setCustomerName("");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to place order");
      }
    } catch (err) {
      notify.error("Order failed: " + err.message);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-2"></div>
      <p className="text-md font-medium text-slate-600 animate-pulse">
        Summoning Menu...
      </p>
    </div>);
  if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="flex p-3 md:p-6 relative overflow-x-hidden min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      {/* Main Content */}
      <div className="flex-1 m-2">
        {/* Header - Glassmorphism style */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white/40 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex flex-col items-start gap-1 z-10">
            <span className="text-sm font-semibold tracking-wider text-orange-600 uppercase">Discover</span>
            OUR MENU
          </h1>
          <div className="flex items-center gap-4 z-10 mt-4 md:mt-0">
            {restaurantProfile.logoUrl && (
              <img
                src={restaurantProfile.logoUrl.startsWith('http') ? restaurantProfile.logoUrl : `${API_URL.replace('/api', '')}${restaurantProfile.logoUrl}`}
                alt="Logo"
                className="w-16 h-16 object-contain rounded-full shadow-md border-2 border-white bg-white"
              />
            )}
            <h2 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600 drop-shadow-sm">
              {restaurantProfile.name}
            </h2>
          </div>
        </div>

        {/* Category Selector + Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex gap-3 bg-white/10 backdrop-blur-md p-2 rounded-full shadow-lg border border-white/20 w-full md:w-auto overflow-x-auto">
            {["All", "Drinks", "Food", "Dessert"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat.toLowerCase())}
                className={`px-5 py-2.5 rounded-full font-semibold transition-all duration-300 transform active:scale-95 whitespace-nowrap
      ${selectedCategory === cat.toLowerCase()
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md scale-105"
                    : "bg-transparent text-gray-700 hover:bg-white/30 hover:text-orange-600"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-1/3">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search menu..."
              className="w-full pl-11 pr-4 py-3 bg-white/80 border-0 rounded-2xl shadow-sm backdrop-blur-sm focus:ring-2 focus:ring-orange-500 transition-all duration-300 text-gray-800 placeholder-gray-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Menu Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white/40 rounded-3xl backdrop-blur-sm border border-white/50">
            <div className="text-6xl mb-4">🍽️</div>
            <p className="text-xl text-gray-500 font-medium">No items found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8 pb-32">
            {filteredItems.map((item) => (
              <MenuCard
                key={item.id}
                id={item.id}
                image={item.image}
                title={item.title}
                price={item.price}
                category={item.category}
                description={item.description}
                addToCart={addToCart}
                className="transform hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl"
              />
            ))}
          </div>
        )}
      </div>

      {/* --- FLOATING WIDGET BUTTON --- */}
      <button
        onClick={() => setIsCartOpen(!isCartOpen)}
        className={`fixed top-1/2 right-0 z-50 transform -translate-y-1/2 bg-gradient-to-b from-orange-500 to-red-600 text-white py-10 px-3 rounded-l-3xl shadow-[-8px_0_20px_rgba(234,88,12,0.3)] hover:pr-5 transition-all duration-300 flex flex-col items-center gap-3 group ${isCartOpen ? "translate-x-full" : "translate-x-0"}`}
      >
        <span className="[writing-mode:vertical-lr] rotate-180 font-black tracking-widest uppercase text-sm">
          Checkout
        </span>
        <div className="bg-white text-orange-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-inner">
          {cart.reduce((sum, item) => sum + item.quantity, 0)}
        </div>
      </button>

      {/* --- SLIDING CHECKOUT DRAWER --- */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white z-[60] shadow-[-10px_0_30px_rgba(0,0,0,0.1)] transition-all duration-500 ease-in-out transform border-l border-gray-200 flex flex-col
        ${isCartOpen ? "translate-x-0 visible" : "translate-x-full invisible"}`}
      >
        <button
          onClick={() => setIsCartOpen(false)}
          className="absolute top-1/2 -left-10 transform -translate-y-1/2 bg-white/90 backdrop-blur-xl border-l border-y border-white/50 py-10 px-2 rounded-l-2xl text-gray-400 hover:text-orange-600 shadow-[-4px_0_15px_rgba(0,0,0,0.05)] transition-colors"
        >
          <span className="text-2xl font-black opacity-70">❯</span>
        </button>

        <CartCard
          cart={cart}
          tables={tables}
          selectedTable={selectedTable}
          onTableChange={setSelectedTable}
          customerName={customerName}
          onCustomerNameChange={setCustomerName}
          numberOfGuests={numberOfGuests}
          onNumberOfGuestsChange={setNumberOfGuests}
          onIncreaseQty={increaseQty}
          onDecreaseQty={decreaseQty}
          onRemoveFromCart={removeFromCart}
          onPlaceOrder={PlaceOrder}
          clearCart={clearCart}
        />
      </div>
    </div>
  );
}