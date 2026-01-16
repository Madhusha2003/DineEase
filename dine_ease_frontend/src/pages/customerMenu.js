import { useState, useEffect } from "react";
import MenuCard from "../components/menuCard";
import TableSelector from "../components/TableSelector";

const API_URL = "http://localhost:3001/api";
export default function CustomerMenu() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState([]);

  // --- NEW: API State ---
  const [menuItems, setMenuItems] = useState([]); // Start with empty list
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [loading, setLoading] = useState(true);   // Track loading status
  const [error, setError] = useState(null);       // Track errors

  // --- NEW: Fetch logic ---
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/menu-items`);
        if (!response.ok) throw new Error("Failed to load menu");
        const data = await response.json();
        setMenuItems(data); // Put the API data into our state
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []); // Run only once when the page loads

  // Fetch tables
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

  /*
  const menuItems = [
    { id: 1, image: "https://p7.hiclipart.com/preview/309/54/466/menu-food-computer-icons-lunch-dish-vector.jpg", title: "Whole Bread", price: 40, category: "food" },
    { id: 2, image: "https://p7.hiclipart.com/preview/309/54/466/menu-food-computer-icons-lunch-dish-vector.jpg", title: "Pastry Delight", price: 40, category: "food" },
    { id: 3, image: "https://p7.hiclipart.com/preview/309/54/466/menu-food-computer-icons-lunch-dish-vector.jpg", title: "French Baguette", price: 40, category: "food" },
    { id: 4, image: "https://p7.hiclipart.com/preview/309/54/466/menu-food-computer-icons-lunch-dish-vector.jpg", title: "Cake Slice", price: 40, category: "food" },
    { id: 5, image: "https://p7.hiclipart.com/preview/309/54/466/menu-food-computer-icons-lunch-dish-vector.jpg", title: "Mini Pizza", price: 40, category: "food" },
    { id: 6, image: "https://p7.hiclipart.com/preview/309/54/466/menu-food-computer-icons-lunch-dish-vector.jpg", title: "Sesame Bun", price: 40, category: "food" },
  ];
  */


  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  // cart function
  function addToCart(item) {
    // copy of current cart
    let newCart = [...cart];

    let found = false;
    // check item is already in the cart
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

    // update cart
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
    // Ensure a table is selected 
    if (!selectedTable) {
      alert("Please select a table before placing an order.");
      return;
    }
    if (!customerName.trim()) {
      alert("Please enter your name before placing an order.");
      return;
    }

    // Final capacity check before sending to backend
    const table = tables.find(t => t.id === parseInt(selectedTable));
    if (table && (table.occupiedSeats + numberOfGuests) > table.capacity) {
      alert(
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
        alert(`Order #${newOrder.id} placed successfully!`);
        setCart([]); // Clear the cart 
        setCustomerName(""); // clear the name
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to place order");
      }
    } catch (err) {
      alert("Order failed: " + err.message);
    }
  };

  // --- UI Update: Handling the loading state ---
  if (loading) return <div className="p-10 text-center text-2xl">Loading Menu...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="flex">
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-start gap-3">OUR MENU</h1>
          <h2 className="text-4xl font-bold text-red-600">
            Elees <span className="text-2xl text-black">FOOD COURT</span>
          </h2>
        </div>

        {/* Category Selector + Search */}
        <div className="flex items-center gap-4 mb-6">
          {/* Category Selector (pill buttons) */}
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

          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search menu..."
            className="flex-1 border border-gray-300 rounded-lg p-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Menu  */}
        <div className="flex gap-6">
          {/* Menu Grid */}
          <div className="flex-1 grid md:grid-cols-1 lg:grid-cols-5 gap-5">
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


          {/* Checkout Section */}
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-orange-600 flex flex-col p-5 overflow-hidden h-fit sticky top-6">
            {/* Header with Color Accent */}
            <div className="bg-orange-600 p-6 rounded-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Your Order</h2>
                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 ">
              <TableSelector
                tables={tables}
                selectedTable={selectedTable}
                onTableChange={setSelectedTable}
                numberOfGuests={numberOfGuests}
              />
              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                maxLength={10}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-20 flex-1 p-2 border border-gray-300 rounded-xl shadow-sm focus:ring-orange-500 focus:border-orange-500"
                required
              />
              <input
                type="number"
                placeholder="Guests"
                min="1"
                value={numberOfGuests}
                onChange={(e) => setNumberOfGuests(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 p-2 border border-gray-300 rounded-xl shadow-sm focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>
            {cart.length === 0 ? (
              <div className="flex-grow flex items-center justify-center">
                <p className="text-gray-500">Your cart is empty.</p>
              </div>
            ) : (
              <>
                {/* Item List */}
                <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="flex-grow">
                          <p className="font-semibold text-gray-800">{item.title}</p>
                          <p className="text-sm text-gray-500">Rs. {item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-100 rounded-full">
                          <button onClick={() => decreaseQty(item.id)} className="w-7 h-7 text-lg font-bold text-gray-600 hover:bg-gray-200 rounded-full transition-colors">-</button>
                          <span className="w-8 text-center font-medium text-gray-800">{item.quantity}</span>
                          <button onClick={() => increaseQty(item.id)} className="w-7 h-7 text-lg font-bold text-gray-600 hover:bg-gray-200 rounded-full transition-colors">+</button>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                          <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-500 hover:text-red-700 hover:underline transition-colors">Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary and Checkout Button */}
                <div className="mt-2 pt-2 border-t">
                  <div className="flex justify-between font-bold text-xl text-gray-900 mt-4">
                    <span>Total</span>
                    <span>Rs. {cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
                  </div>
                  <button className="w-full mt-6 bg-orange-600 text-white font-bold py-3 rounded-lg hover:bg-orange-700 transition-all duration-300 shadow-md hover:shadow-lg" onClick={PlaceOrder}>
                    Place Order
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
