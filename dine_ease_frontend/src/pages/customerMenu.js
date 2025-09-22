import { useState } from "react";
import MenuCard from "../components/menuCard";

export default function CustomerMenu() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState([]);

  const menuItems = [
    { id: 1, image: "https://p7.hiclipart.com/preview/309/54/466/menu-food-computer-icons-lunch-dish-vector.jpg", title: "Whole Bread", price: 40, category: "food" },
    { id: 2, image: "https://p7.hiclipart.com/preview/309/54/466/menu-food-computer-icons-lunch-dish-vector.jpg", title: "Pastry Delight", price: 40, category: "food" },
    { id: 3, image: "https://p7.hiclipart.com/preview/309/54/466/menu-food-computer-icons-lunch-dish-vector.jpg", title: "French Baguette", price: 40, category: "food" },
    { id: 4, image: "https://p7.hiclipart.com/preview/309/54/466/menu-food-computer-icons-lunch-dish-vector.jpg", title: "Cake Slice", price: 40, category: "food" },
    { id: 5, image: "https://p7.hiclipart.com/preview/309/54/466/menu-food-computer-icons-lunch-dish-vector.jpg", title: "Mini Pizza", price: 40, category: "food" },
    { id: 6, image: "https://p7.hiclipart.com/preview/309/54/466/menu-food-computer-icons-lunch-dish-vector.jpg", title: "Sesame Bun", price: 40, category: "food" },
  ];

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
      if (newCart[i].id == item.id) {
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
      item.id == id ? { ...item, quantity: item.quantity + 1 } : item
    ));
  }
  function decreaseQty(id) {
    setCart(cart.map(item =>
      item.id == id ? { ...item, quantity: Math.max(item.quantity - 1, 1) } : item
    ));
  }
  return (
    <div className="flex">
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold underline">Our Menu</h1>
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
          <div className="flex-1 grid md:grid-cols-3 lg:grid-cols-5 gap-5">
            {filteredItems.map((item, index) => (
              <MenuCard className="lg:w-100 h-100 md:w-10 shadow-md"
                key={item.id}
                id={item.id}
                image={item.image}
                title={item.title}
                price={item.price}
                addToCart={addToCart}
              />
            ))}
          </div>


          {/* Checkout Section */}
          <div className="lg:w-100 md:w-90 min-w-[350px] bg-gray-100 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Checkout</h2>

            {cart.length === 0 ? (
              <p className="text-gray-500 ">Cart is empty</p>
            ) : (
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between border-b py-2">
                    <div className="flex justify-start mr-4 text-wrap">
                      <span >{item.title}</span>
                    </div>
                    <div className="flex justify-center gap-2">
                      <button className="px-2 bg-gray-300 rounded" onClick={() => decreaseQty(item.id)}>-</button>
                      <span>{item.quantity}</span>
                      <button className="px-2 bg-gray-300 rounded" onClick={() => increaseQty(item.id)}>+</button>
                    </div>
                    <div className="flex items-center gap-2 w-28 justify-end">
                      <span className="w-20 text-right font-semibold">Rs. {item.price * item.quantity}</span>
                      <button className="px-2 px-2 bg-red-500 rounded ml-2">X</button>
                    </div>
                  </div>
                ))}

                <hr />
                <div className="flex justify-end font-bold">
                  <span>Total</span>
                  <span>Rs. {cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
