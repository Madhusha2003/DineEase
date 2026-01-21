import { useState, useEffect } from "react";
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
  const [selectedTable, setSelectedTable] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Fetch logic ---
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/menu-items`);
        if (!response.ok) throw new Error("Failed to load menu");
        const data = await response.json();
        setMenuItems(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch(`${API_URL}/tables`);
        if (!response.ok) throw new Error("Failed to load tables");
        const data = await response.json();
        setTables(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchTables();
  }, []);

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  if (loading) return(
  <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-2"></div>
    <p className="text-md font-medium text-slate-600 animate-pulse">
      Loading Menu...
    </p>
  </div>);
  if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  return (
    // CHANGE 1: Added overflow-x-hidden and relative to prevent scrollbars from the hidden menu
    <div className="flex p-6 relative overflow-x-hidden min-h-screen bg-gray-100">
      {/* Main Content */}
      <div className="flex-1 m-2">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-start gap-3">OUR MENU</h1>
          <h2 className="text-4xl font-bold text-red-600">
            Elees <span className="text-2xl text-black">FOOD COURT</span>
          </h2>
        </div>

        {/* Category Selector + Search */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex gap-2">
            {["All", "Drinks", "Food", "Dessert"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat.toLowerCase())}
                className={`px-4 py-1 rounded-full border 
          ${selectedCategory === cat.toLowerCase()
                    ? "bg-orange-600 text-white"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search menu..."
            className="flex-1 border border-gray-300 rounded-lg p-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {filteredItems.map((item, index) => (
            <MenuCard className=" shadow-md"
              key={item.id}
              id={item.id}
              image={item.image}
              title={item.title}
              price={item.price}
              category={item.category}
              description={item.description}
              addToCart={addToCart}
            />
          ))}
        </div>
      </div>

      {/* --- FLOATING WIDGET BUTTON --- */}
      <button
        onClick={() => setIsCartOpen(!isCartOpen)}
        className={`fixed top-1/2 right-0 z-50 transform -translate-y-1/2 bg-orange-600 text-white py-8 px-2 rounded-l-2xl shadow-[-4px_0_15px_rgba(0,0,0,0.2)] hover:bg-orange-700 transition-all duration-300 flex flex-col items-center gap-2 group ${isCartOpen ? "translate-x-full" : "translate-x-0"}`}
      >
        <span className="[writing-mode:vertical-lr] rotate-180 font-black tracking-widest uppercase text-sm">
          Checkout
        </span>
        <div className="bg-white text-orange-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
          {cart.reduce((sum, item) => sum + item.quantity, 0)}
        </div>
      </button>

      {/* --- SLIDING CHECKOUT DRAWER --- */}
      {/* CHANGE 2: Added 'invisible' to the closed state so it can't be clicked/focused when hidden */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[60] shadow-2xl transition-all duration-500 ease-in-out transform 
        ${isCartOpen ? "translate-x-0 visible" : "translate-x-full invisible"}`}
      >
        {/* Close Handle */}
        <button
          onClick={() => setIsCartOpen(false)}
          className="absolute top-1/2 -left-8 transform -translate-y-1/2 bg-white border-l border-y border-gray-200 py-8 px-1 rounded-l-2xl text-gray-400 hover:text-orange-600 shadow-[-4px_0_10px_rgba(0,0,0,0.05)]"
        >
          <span className="text-xl font-bold">❯</span>
        </button>

        {/* Checkout Section */}
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
        />
      </div>
    </div>
  );
}